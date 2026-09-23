# -*- coding: utf-8 -*-

with open("app/api/routes/ai.py", "r", encoding="utf-8") as f:
    content = f.read()

# Add new endpoint code
new_endpoint = """

class ExplainChartRequest(BaseModel):
    chart_type: str
    x_column: Optional[str] = None
    y_column: Optional[str] = None
    selected_columns: Optional[list] = None

@router.post("/explain-chart")
async def explain_chart(req: ExplainChartRequest, api_key: str = Depends(get_api_key), user: dict = Depends(get_current_user)):
    \"\"\"Generate AI explanation for a chart.\"\"\"
    from app.services.data_store import get as get_df
    import os
    
    df = get_df(user["email"])
    if df is None:
        return {"explanation": "No dataset available to analyze."}
    
    # Build context about the chart
    chart_info = f"Chart Type: {req.chart_type}\\n"
    if req.selected_columns and len(req.selected_columns) >= 2:
        chart_info += f"Columns: {', '.join(req.selected_columns)} (multi-column visualization)\\n"
        chart_info += f"Number of columns: {len(req.selected_columns)}\\n"
    else:
        if req.x_column:
            chart_info += f"X Column: {req.x_column}\\n"
        if req.y_column:
            chart_info += f"Y Column: {req.y_column}\\n"
    
    # Add dataset context
    chart_info += f"\\nDataset Info:\\n"
    chart_info += f"- Total rows: {len(df)}\\n"
    chart_info += f"- Total columns: {len(df.columns)}\\n"
    
    # Add column statistics for selected columns
    if req.selected_columns:
        cols = req.selected_columns
    else:
        cols = [c for c in [req.x_column, req.y_column] if c]
    
    for col in cols[:5]:  # Limit to 5 columns
        if col in df.columns:
            import pandas as pd
            if pd.api.types.is_numeric_dtype(df[col]):
                chart_info += f"\\n{col}: min={df[col].min():.2f}, max={df[col].max():.2f}, mean={df[col].mean():.2f}"
            else:
                chart_info += f"\\n{col}: {df[col].nunique()} unique values"
    
    # Generate explanation using OpenAI
    try:
        import openai
        openai_key = api_key or os.getenv("OPENAI_API_KEY")
        if not openai_key:
            return {"explanation": "OpenAI API key not configured. Please set OPENAI_API_KEY in your environment."}
        
        client = openai.OpenAI(api_key=openai_key)
        
        prompt = f"You are a data visualization expert. Explain this chart in 3-4 sentences:\\n\\n{chart_info}\\n\\nProvide:\\n1. What the chart shows\\n2. Key insights or patterns\\n3. What to look for in this visualization\\n\\nBe concise and actionable."
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200
        )
        
        explanation = response.choices[0].message.content.strip()
        return {"explanation": explanation}
        
    except Exception as e:
        return {"explanation": f"Unable to generate explanation: {str(e)}"}
"""

# Append to end of file
content += new_endpoint

with open("app/api/routes/ai.py", "w", encoding="utf-8") as f:
    f.write(content)

print("✓ Added explain-chart endpoint")