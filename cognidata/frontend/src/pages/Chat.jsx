import { useRef, useState, useCallback, useEffect } from "react";
import { aiApi, api } from "../api/client";
import { useStreamingChat } from "../hooks/useStreamingChat";
import useAuth from "../store/auth";
import FileUpload from "../components/FileUpload";
import ChatMessage from "../components/ChatMessage";
import ChatSidebar from "../components/ChatSidebar";
import { useChatSessions } from "../hooks/useChatSessions";
import "../lib/toast"; // Initialize toast notification system

const EXAMPLE_QUESTIONS = {
  "Data & Charts": [
    "Show top 10 rows",
    "Column statistics",
    "Correlation matrix",
    "Distribution of numeric columns",
  ],
  "SQL": [
    "Find missing values",
    "Count rows by category",
    "Show unique values per column",
  ],
  "AI": [
    "Detect anomalies",
    "Business insights",
    "Predict trends",
  ],
};

function useDebounce(fn, ms = 300) {
  const t = useRef(null);
  return useCallback((...a) => { clearTimeout(t.current); t.current = setTimeout(() => fn(...a), ms); }, [fn]);
}

export default function Chat() {
  const [msgs, setMsgs]           = useState([]);
  const [query, setQuery]         = useState("");
  const [loading, setLoad]        = useState(false);
  const [dataset, setDs]          = useState(null);
  const [streamEnabled, setStream] = useState(true);
  const [showExamples, setShowEx] = useState(false);
  const [showMemory, setShowMem]  = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [totalMs, setTotalMs]     = useState(0);
  // Voice
  const [listening, setListening] = useState(false);
  // Image upload
  const [imageFile, setImageFile] = useState(null);
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const imageRef                  = useRef();
  const bottomRef                 = useRef();
  const taRef                     = useRef();
  const isSendingRef = useRef(false); // Track if actively sending message
  const { token }                 = useAuth();
  const { connect, sendStreaming, streaming } = useStreamingChat();
  
  // Chat session management
  const {
    sessions,
    activeSessionId,
    loading: sessionsLoading,
    sessionCache,
    hasMore,
    createNewSession,
    selectSession,
    renameSession,
    archiveSession,
    addMessage,
    loadMoreSessions,
  } = useChatSessions();

  // Connect WebSocket on mount
  useEffect(() => {
    if (token) connect(token).catch(() => {});
  }, [token]);

  // Create initial session if none exists
  useEffect(() => {
    if (token && !activeSessionId && !sessionsLoading && sessions.length === 0) {
      createNewSession().catch(err => console.error('Failed to create initial session:', err));
    }
  }, [token, activeSessionId, sessionsLoading, sessions.length, createNewSession]);

  // Load session messages when activeSessionId changes (but not during active message sending)
  useEffect(() => {
    if (!activeSessionId || isSendingRef.current) return; // Don't reload during message send
    
    const loadSessionMessages = async () => {
      try {
        const messages = sessionCache.get(activeSessionId);
        if (messages && Array.isArray(messages)) {
          // Transform database message format to UI format
          const uiMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.message_metadata || msg.content
          }));
          // Always update messages from cache (even if empty array)
          setMsgs(uiMessages);
        } else {
          // Load from API if not in cache
          const loadedMessages = await selectSession(activeSessionId);
          if (loadedMessages && Array.isArray(loadedMessages)) {
            const uiMessages = loadedMessages.map(msg => ({
              role: msg.role,
              content: msg.message_metadata || msg.content
            }));
            // Always update messages from API
            setMsgs(uiMessages);
          } else {
            // Only clear if this is a session switch, not during active chat
            if (msgs.length === 0) {
              setMsgs([]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load session messages:", error);
        // setMsgs([]); // FIXED: Don't clear active chat
      }
    };

    loadSessionMessages();
  }, [activeSessionId]); // FIXED: Removed sessionCache to prevent reload during active chat

  const send = async (q) => {
    const msg = (q || query).trim(); if (!msg || loading) return;
    
    // Check message limit
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (currentSession && currentSession.message_count >= 100) {
      if (window.showToast) {
        window.showToast("warning", "Session limit reached (100 messages). Please start a new chat.");
      }
      return;
    }
    
    // Show warning when approaching limit
    if (currentSession && currentSession.message_count >= 90) {
      if (window.showToast) {
        window.showToast("info", `Approaching session limit: ${currentSession.message_count}/100 messages`);
      }
    }
    
    isSendingRef.current = true; // Mark as sending
    setQuery("");
    setMsgs(p => [...p, { role:"user", content:msg }]);
    setLoad(true);
    const t0 = Date.now();

    // Save user message to database
    try {
      if (activeSessionId) {
        await addMessage(activeSessionId, "user", msg);
      }
    } catch (error) {
      if (error.message === "MESSAGE_LIMIT_REACHED") {
        // Create new session and continue
        try {
          const newSession = await createNewSession();
          if (newSession?.id) {
            await addMessage(newSession.id, "user", msg);
          }
        } catch (err) {
          console.error("Failed to create new session:", err);
        }
      } else {
        console.error("Failed to save user message:", error);
      }
    }

    setMsgs(p => [...p, { role:"assistant", content:{ type:"text", data:"", task_type:"insight", status:"success" }, streaming: true }]);

    try {
      const taskRes = await aiApi.taskType(msg).catch(() => ({ data: { task_type: "data" } }));
      const task = taskRes.data.task_type;

      if (task === "insight" && streamEnabled && !streaming) {
        // Get API key from localStorage
        const apiKey = localStorage.getItem('aiml_key') || localStorage.getItem('groq_key') || localStorage.getItem('openai_key') || '';
        
        sendStreaming(
          msg,
          apiKey,
          (buffer) => {
            setMsgs(p => p.map((m, i) =>
              i === p.length - 1 ? { ...m, content: { ...m.content, data: buffer } } : m
            ));
          },
          (result) => {
            const elapsed = Date.now() - t0;
            setMsgs(p => p.map((m, i) =>
              i === p.length - 1 ? { role:"assistant", content: result } : m
            ));
            setTurnCount(c => c + 1);
            setTotalMs(ms => ms + elapsed);
            setLoad(false);
        isSendingRef.current = false; // Mark send complete
            
            // Save assistant response to database
            if (activeSessionId) {
              addMessage(activeSessionId, "assistant", typeof result === "string" ? result : JSON.stringify(result), result).catch(err => {
                console.error("Failed to save assistant message:", err);
              });
            }
          },
          () => {
            aiApi.chat(msg).then(({ data }) => {
              const elapsed = Date.now() - t0;
              setMsgs(p => p.map((m, i) =>
                i === p.length - 1 ? { role:"assistant", content: data } : m
              ));
              setTurnCount(c => c + 1);
              setTotalMs(ms => ms + elapsed);
              
              // Save assistant response to database
              if (activeSessionId) {
                addMessage(activeSessionId, "assistant", typeof data === "string" ? data : JSON.stringify(data), data).catch(err => {
                  console.error("Failed to save assistant message:", err);
                });
              }
            }).finally(() => { setLoad(false); isSendingRef.current = false; }); // Mark send complete
          }
        );
      } else {
        const { data } = await aiApi.chat(msg);
        const elapsed = Date.now() - t0;
        setMsgs(p => p.map((m, i) =>
          i === p.length - 1 ? { role:"assistant", content: data } : m
        ));
        setTurnCount(c => c + 1);
        setTotalMs(ms => ms + elapsed);
        setLoad(false);
        isSendingRef.current = false; // Mark send complete
        
        // Save assistant response to database
        if (activeSessionId) {
          addMessage(activeSessionId, "assistant", typeof data === "string" ? data : JSON.stringify(data), data).catch(err => {
            console.error("Failed to save assistant message:", err);
          });
        }
      }
    } catch (e) {
      setMsgs(p => p.map((m, i) =>
        i === p.length - 1
          ? { role:"assistant", content:{ type:"error", error:e.response?.data?.detail||"Request failed" } }
          : m
      ));
      setLoad(false);
    }

    setTimeout(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); taRef.current?.focus(); }, 50);
  };

  const dSend = useDebounce(send);
  const onKey = (e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); dSend(); } };

  // Voice-to-chart
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onstart = () => setListening(true);
    rec.onend   = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      setTimeout(() => send(transcript), 100);
    };
    rec.onerror = () => setListening(false);
    rec.start();
  };

  // Vision send (image + question)
  const sendVision = async () => {
    if (!imageFile && !query.trim()) return;
    const q = query.trim() || "Analyze this image";
    setQuery("");
    const userMsg = imageFile ? `[Image: ${imageFile.name}] ${q}` : q;
    setMsgs(p => [...p, { role:"user", content: userMsg }]);
    setLoad(true);
    const t0 = Date.now();
    
    // Save user message to database
    try {
      if (activeSessionId) {
        await addMessage(activeSessionId, "user", userMsg);
      }
    } catch (error) {
      console.error("Failed to save user message:", error);
    }
    
    try {
      const formData = new FormData();
      formData.append("question", q);
      if (imageFile) formData.append("image", imageFile);
      const apiKey = localStorage.getItem("openai_key") || localStorage.getItem("aiml_key") || "";
      const { data } = await api.post("/ai/vision", formData, {
        headers: { "X-Api-Key": apiKey, "Content-Type": "multipart/form-data" }
      });
      setMsgs(p => [...p, { role:"assistant", content: data }]);
      setTurnCount(c => c + 1);
      setTotalMs(ms => ms + (Date.now() - t0));
      
      // Save assistant response to database
      if (activeSessionId) {
        addMessage(activeSessionId, "assistant", typeof data === "string" ? data : JSON.stringify(data), data).catch(err => {
          console.error("Failed to save assistant message:", err);
        });
      }
    } catch(e) {
      setMsgs(p => [...p, { role:"assistant", content: { type:"error", error: e.response?.data?.detail || "Vision failed" } }]);
    } finally {
      setLoad(false);
      setImageFile(null);
    }
  };

  const handleClear = async () => {
    setMsgs([]);
    setTurnCount(0);
    setTotalMs(0);
    await aiApi.clearMemory().catch(() => {});
  };

  // Session management handlers
  const handleNewChat = async () => {
    try {
      await createNewSession();
      setMsgs([]);
      setTurnCount(0);
      setTotalMs(0);
    } catch (error) {
      console.error("Failed to create new session:", error);
    }
  };

  const handleSelectSession = async (sessionId) => {
    try {
      await selectSession(sessionId);
      // Messages will be loaded by the useEffect hook
      setTurnCount(0);
      setTotalMs(0);
    } catch (error) {
      console.error("Failed to select session:", error);
    }
  };

  const handleRenameSession = async (sessionId, newTitle) => {
    try {
      await renameSession(sessionId, newTitle);
    } catch (error) {
      console.error("Failed to rename session:", error);
    }
  };

  const handleArchiveSession = async (sessionId) => {
    try {
      await archiveSession(sessionId);
      setMsgs([]);
      setTurnCount(0);
      setTotalMs(0);
    } catch (error) {
      console.error("Failed to archive session:", error);
    }
  };

  // Build memory turns from msgs
  const memoryTurns = [];
  for (let i = 0; i < msgs.length - 1; i++) {
    if (msgs[i].role === "user" && msgs[i+1]?.role === "assistant") {
      const resp = msgs[i+1].content;
      const respText = typeof resp === "string" ? resp : String(resp?.data || resp?.error || JSON.stringify(resp) || "No response").slice(0, 80);
      memoryTurns.push({ q: msgs[i].content, a: respText });
    }
  }
  const recentMemory = memoryTurns.slice(-10);

  const avgMs = turnCount > 0 ? Math.round(totalMs / turnCount) : 0;

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100vh",background:"#09090b",position:"relative" }}>
      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onRenameSession={handleRenameSession}
        onArchiveSession={handleArchiveSession}
        onLoadMore={loadMoreSessions}
        hasMore={hasMore}
      />

      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 24px",borderBottom:"1px solid rgba(255,255,255,.06)",background:"rgba(9,9,11,.95)",backdropFilter:"blur(12px)",flexWrap:"wrap",gap:12,flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>💬</div>
          <div>
            <div style={{ fontSize:15,fontWeight:600,color:"#f4f4f5" }}>AI Data Analyst</div>
            <div style={{ fontSize:11,color:"#52525b" }}>Ask questions in plain English</div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
          {/* Stream toggle */}
          <button onClick={() => setStream(s => !s)} title={streamEnabled ? "Streaming ON" : "Streaming OFF"}
            style={{ padding:"5px 10px",borderRadius:8,fontSize:12,background:streamEnabled?"rgba(99,102,241,.15)":"rgba(255,255,255,.04)",border:`1px solid ${streamEnabled?"rgba(99,102,241,.3)":"rgba(255,255,255,.07)"}`,color:streamEnabled?"#818cf8":"#52525b",cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}>
            ⚡ {streamEnabled ? "Stream ON" : "Stream OFF"}
          </button>
          {/* Metrics */}
          {turnCount > 0 && (
            <span style={{ fontSize:11,color:"#52525b",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",padding:"4px 10px",borderRadius:20 }}>
              {turnCount} turns · {avgMs}ms avg
            </span>
          )}
          <FileUpload onUploaded={setDs} />
          {dataset && (
            <span style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#71717a",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",padding:"5px 12px",borderRadius:20 }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block" }} />
              {dataset.filename} · {dataset.rows?.toLocaleString()} rows · {dataset.columns} cols · {dataset.memory_mb || "—"} MB
            </span>
          )}
          {msgs.length > 0 && <button onClick={handleClear} style={{ padding:"6px 12px",borderRadius:8,fontSize:12,background:"transparent",border:"1px solid rgba(255,255,255,.07)",color:"#52525b",cursor:"pointer" }}>↺ Clear</button>}
        </div>
      </div>

      {/* Collapsible panels row */}
      <div style={{ display:"flex",gap:8,padding:"8px 24px",borderBottom:"1px solid rgba(255,255,255,.04)",background:"rgba(9,9,11,.8)",flexShrink:0 }}>
        {/* Chat History button */}
        <div style={{ flex:1 }}>
          <button onClick={() => setSidebarOpen(true)}
            style={{ fontSize:11,color:"#52525b",background:"transparent",border:"1px solid rgba(255,255,255,.06)",borderRadius:6,padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}>
            ☰ Chat History ▼
          </button>
        </div>

        {/* Example questions panel */}
        <div style={{ flex:1 }}>
          <button onClick={() => setShowEx(s => !s)}
            style={{ fontSize:11,color:"#52525b",background:"transparent",border:"1px solid rgba(255,255,255,.06)",borderRadius:6,padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}>
            💡 Examples {showExamples ? "▲" : "▼"}
          </button>
          {showExamples && (
            <div style={{ marginTop:8,display:"flex",gap:16,flexWrap:"wrap" }}>
              {Object.entries(EXAMPLE_QUESTIONS).map(([section, qs]) => (
                <div key={section}>
                  <div style={{ fontSize:10,fontWeight:600,color:"#3f3f46",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>{section}</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:3 }}>
                    {qs.map(q => (
                      <button key={q} onClick={() => send(q)}
                        style={{ padding:"4px 10px",borderRadius:6,fontSize:11,background:"rgba(99,102,241,.07)",border:"1px solid rgba(99,102,241,.15)",color:"#818cf8",cursor:"pointer",textAlign:"left" }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Memory panel */}
        <div style={{ flex:1 }}>
          <button onClick={() => setShowMem(s => !s)}
            style={{ fontSize:11,color:"#52525b",background:"transparent",border:"1px solid rgba(255,255,255,.06)",borderRadius:6,padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}>
            🧠 Memory ({recentMemory.length}) {showMemory ? "▲" : "▼"}
          </button>
          {showMemory && (
            <div style={{ marginTop:8,maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4 }}>
              {recentMemory.length === 0 && <span style={{ fontSize:11,color:"#3f3f46" }}>No turns yet.</span>}
              {recentMemory.map((t, i) => (
                <div key={i} style={{ padding:"6px 10px",borderRadius:6,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.05)" }}>
                  <div style={{ fontSize:11,color:"#818cf8",marginBottom:2 }}>Q: {t.q.slice(0, 60)}{t.q.length > 60 ? "…" : ""}</div>
                  <div style={{ fontSize:10,color:"#52525b" }}>A: {t.a.slice(0, 80)}{t.a.length > 80 ? "…" : ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1,overflowY:"auto",padding:"28px 24px",display:"flex",flexDirection:"column",gap:20 }}>
        {msgs.length === 0 && (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:14,paddingTop:60 }}>
            <div style={{ width:52,height:52,borderRadius:16,background:"linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.15))",border:"1px solid rgba(99,102,241,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"#6366f1" }}>✦</div>
            <h3 style={{ fontSize:18,fontWeight:600,color:"#71717a" }}>What would you like to know?</h3>
            <p style={{ fontSize:13,color:"#3f3f46" }}>{dataset ? "Dataset ready. Try the examples above." : "Upload a dataset first, then ask anything."}</p>
          </div>
        )}
        {msgs.map((m,i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
        {loading && (
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ display:"flex",gap:4,alignItems:"center",padding:"12px 16px",background:"rgba(24,24,27,.8)",border:"1px solid rgba(255,255,255,.06)",borderRadius:"4px 16px 16px 16px" }}>
              {[0,.15,.3].map((d,i) => <span key={i} style={{ width:7,height:7,borderRadius:"50%",background:"#6366f1",display:"inline-block",animation:`dotPulse 1.2s ease-in-out ${d}s infinite` }} />)}
            </div>
            <span style={{ fontSize:12,color:"#3f3f46" }}>Analysing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:"12px 24px 16px",borderBottom:"none",borderTop:"1px solid rgba(255,255,255,.06)",background:"rgba(9,9,11,.95)",backdropFilter:"blur(12px)",flexShrink:0 }}>
        {/* Message limit warning */}
        {(() => {
          const currentSession = sessions.find(s => s.id === activeSessionId);
          if (currentSession && currentSession.message_count >= 100) {
            return (
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"8px 12px",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8 }}>
                <span style={{ fontSize:12,color:"#f87171" }}>⚠️ Session limit reached (100 messages). Please start a new chat.</span>
                <button onClick={handleNewChat} style={{ padding:"4px 12px",borderRadius:6,background:"#ef4444",color:"white",border:"none",cursor:"pointer",fontSize:11,fontWeight:500 }}>
                  New Chat
                </button>
              </div>
            );
          } else if (currentSession && currentSession.message_count >= 90) {
            return (
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"6px 10px",background:"rgba(251,191,36,.1)",border:"1px solid rgba(251,191,36,.3)",borderRadius:8 }}>
                <span style={{ fontSize:11,color:"#fbbf24" }}>⚠️ Approaching limit: {currentSession.message_count}/100 messages</span>
              </div>
            );
          }
          return null;
        })()}
        
        {/* Image preview */}
        {imageFile && (
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"6px 10px",background:"rgba(99,102,241,.08)",border:"1px solid rgba(99,102,241,.2)",borderRadius:8 }}>
            <span style={{ fontSize:12,color:"#818cf8" }}>📎 {imageFile.name}</span>
            <button onClick={() => setImageFile(null)} style={{ background:"transparent",border:"none",color:"#52525b",cursor:"pointer",fontSize:12 }}>✕</button>
          </div>
        )}
        <div style={{ display:"flex",gap:10,alignItems:"flex-end",background:"rgba(24,24,27,.9)",border:"1px solid rgba(255,255,255,.09)",borderRadius:14,padding:"10px 10px 10px 16px",boxShadow:"0 0 0 1px rgba(99,102,241,.08)" }}>
          <textarea ref={taRef} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={onKey}
            placeholder="Ask about your data… (Enter to send)" rows={1}
            style={{ flex:1,background:"transparent",border:"none",color:"#f4f4f5",fontSize:14,resize:"none",outline:"none",lineHeight:1.6,maxHeight:120,overflowY:"auto",fontFamily:"inherit" }} />
          {/* Image upload button */}
          <input ref={imageRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => setImageFile(e.target.files?.[0] || null)} />
          <button onClick={() => imageRef.current.click()} title="Attach image for vision analysis"
            style={{ width:32,height:32,borderRadius:8,border:"1px solid rgba(255,255,255,.09)",background:"transparent",color:"#52525b",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>
            📎
          </button>
          {/* Voice button */}
          <button onClick={startVoice} disabled={listening} title="Voice to chart"
            style={{ width:32,height:32,borderRadius:8,border:`1px solid ${listening?"rgba(239,68,68,.4)":"rgba(255,255,255,.09)"}`,background:listening?"rgba(239,68,68,.1)":"transparent",color:listening?"#f87171":"#52525b",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>
            {listening ? "🔴" : "🎤"}
          </button>
          {/* Send button — vision if image attached, else normal */}
          <button onClick={imageFile ? sendVision : () => send()} disabled={loading||(!query.trim()&&!imageFile)||(sessions.find(s => s.id === activeSessionId)?.message_count >= 100)}
            style={{ width:36,height:36,borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,opacity:loading||(!query.trim()&&!imageFile)||(sessions.find(s => s.id === activeSessionId)?.message_count >= 100)?0.4:1,boxShadow:"0 2px 12px rgba(99,102,241,.35)" }}>
            {loading ? <span className="spinner" style={{ width:16,height:16 }} /> : imageFile ? "👁" : "↑"}
          </button>
        </div>
        <p style={{ fontSize:11,color:"#27272a",marginTop:6,textAlign:"center" }}>Enter to send · Shift+Enter for new line · 🎤 voice · 📎 image+vision</p>
      </div>

      {/* Responsive styles */}
      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

