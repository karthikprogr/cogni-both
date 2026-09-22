import asyncio, sys, pathlib
from fastapi import APIRouter, Depends
from app.core.deps import get_current_user, get_api_key
from app.schemas.ai import QueryRequest, ChatRequest, AIResponse
from app.services import ai_service
from app.workers.executor import executor

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/query", response_model=AIResponse)
async def query(req: QueryRequest, api_key: str = Depends(get_api_key),
                user: dict = Depends(get_current_user)):
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(executor, lambda: ai_service.run_query(
        req.question, api_key, user["email"], req.data))
    return AIResponse(**result)

@router.post("/chat", response_model=AIResponse)
async def chat(req: ChatRequest, api_key: str = Depends(get_api_key),
               user: dict = Depends(get_current_user)):
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(executor, lambda: ai_service.run_query(
        req.query, api_key, user["email"]))
    return AIResponse(**result)

@router.delete("/memory")
def clear_memory(user: dict = Depends(get_current_user)):
    ai_service.clear_memory(user["email"])
    return {"message": "Memory cleared"}

@router.get("/task-type")
def task_type(question: str, user: dict = Depends(get_current_user)):
    p = str(pathlib.Path(__file__).resolve().parents[3] / "services")
    if p not in sys.path: sys.path.insert(0, p)
    from agents.controller import decide
    return {"task_type": decide(question)}


from pydantic import BaseModel
from typing import Optional

class TestKeyRequest(BaseModel):
    provider: str = "openai"
    key: str = ""
    model: Optional[str] = None

@router.post("/test-connection")
@router.post("/test-key")
async def test_connection(req: TestKeyRequest, _: dict = Depends(get_current_user)):
    """Test OpenAI or AIML API key connectivity."""
    if not req.key:
        return {"success": False, "message": "No API key provided"}
    try:
        if req.provider == "openai":
            from openai import OpenAI
            client = OpenAI(api_key=req.key)
            models = [m.id for m in client.models.list().data]
            best = next((m for m in ["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-4","gpt-3.5-turbo"] if m in models), models[0] if models else "unknown")
            return {"success": True, "message": f"Connected - best model: {best}", "models": models[:10]}
        elif req.provider == "aiml":
            from openai import OpenAI
            client = OpenAI(api_key=req.key, base_url="https://api.aimlapi.com/v1")
            model = req.model or "gpt-3.5-turbo"
            resp = client.chat.completions.create(
                model=model,
                messages=[{"role":"user","content":"ping"}],
                max_tokens=5
            )
            return {"success": True, "message": f"AIML connected - model: {model}"}
        else:
            return {"success": False, "message": f"Unknown provider: {req.provider}"}
    except Exception as e:
        return {"success": False, "message": str(e)}


# -- Multimodal Vision endpoint ------------------------------------------------

from fastapi import UploadFile, File
import base64

@router.post("/vision")
async def vision_query(
    question: str = "",
    api_key: str = Depends(get_api_key),
    user: dict = Depends(get_current_user),
    image: UploadFile = File(None),
):
    """Multimodal AI - analyze image + dataset together with GPT-4o vision."""
    import os
    os.environ["OPENAI_API_KEY"] = api_key
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        content = []

        # Dataset context
        from app.services.data_store import get as get_df
        import numpy as np
        df = get_df(user["email"])
        if df is not None:
            nums = df.select_dtypes(include=np.number)
            summary = f"Dataset: {df.shape[0]} rows - {df.shape[1]} cols\nColumns: {list(df.columns)}\n"
            if not nums.empty:
                summary += f"Stats:\n{nums.describe().loc[['mean','std','min','max']].round(2).to_string()}"
            content.append({"type": "text", "text": f"Dataset:\n{summary}\n\nQuestion: {question or 'Analyze this image in context of the dataset.'}"})
        else:
            content.append({"type": "text", "text": question or "Analyze this image and provide insights."})

        # Image
        if image and image.filename:
            img_bytes = await image.read()
            img_b64 = base64.b64encode(img_bytes).decode()
            ext = (image.filename or "").rsplit(".", 1)[-1].lower()
            mime = {"jpg":"image/jpeg","jpeg":"image/jpeg","png":"image/png","gif":"image/gif","webp":"image/webp"}.get(ext, "image/jpeg")
            content.append({"type": "image_url", "image_url": {"url": f"data:{mime};base64,{img_b64}", "detail": "high"}})

        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a senior data analyst with vision capabilities."},
                {"role": "user", "content": content},
            ],
            max_tokens=1000, temperature=0.2,
        )
        return {"answer": resp.choices[0].message.content, "task_type": "vision", "type": "text", "status": "success"}
    except Exception as e:
        return {"answer": f"Vision analysis failed: {e}", "task_type": "vision", "type": "error", "status": "error"}

class ExplainChartRequest(BaseModel):
    chart_type: str
    x_column: Optional[str] = None
    y_column: Optional[str] = None
    selected_columns: Optional[list] = None

@router.post('/explain-chart')
async def explain_chart(req: ExplainChartRequest, api_key: str = Depends(get_api_key), user: dict = Depends(get_current_user)):
    from app.services.data_store import get as get_df
    import os, pandas as pd, openai
    
    df = get_df(user['email'])
    if df is None:
        return {'explanation': 'No dataset available to analyze.'}
    
    chart_info = f'Chart: {req.chart_type}\n'
    if req.selected_columns:
        chart_info += f'Columns: {", ".join(req.selected_columns)}\n'
    else:
        if req.x_column: chart_info += f'X: {req.x_column}\n'
        if req.y_column: chart_info += f'Y: {req.y_column}\n'
    chart_info += f'Rows: {len(df)}\n'
    
    try:
        openai_key = api_key or os.getenv('OPENAI_API_KEY')
        if not openai_key:
            return {'explanation': 'OpenAI API key not configured.'}
        client = openai.OpenAI(api_key=openai_key)
        prompt = f'Explain this chart in 3 sentences: {chart_info}'
        response = client.chat.completions.create(model='gpt-3.5-turbo', messages=[{'role': 'user', 'content': prompt}], max_tokens=150)
        return {'explanation': response.choices[0].message.content.strip()}
    except Exception as e:
        return {'explanation': f'Error: {str(e)}'}
