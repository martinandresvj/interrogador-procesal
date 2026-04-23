import { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";

export default function Home() {
  const [phase, setPhase] = useState("intro");
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("idle");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [inputText, setInputText] = useState("");
  const [useTextInput, setUseTextInput] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isSpeechSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const speak = useCallback((text, onEnd) => {
    if (!voiceEnabled || typeof window === "undefined") { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-ES"; utter.rate = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith("es") && v.localService) || voices.find(v => v.lang.startsWith("es"));
    if (esVoice) utter.voice = esVoice;
    utter.onend = () => { setStatus("idle"); onEnd?.(); };
    utter.onerror = () => { setStatus("idle"); onEnd?.(); };
    setStatus("speaking");
    window.speechSynthesis.speak(utter);
  }, [voiceEnabled]);

  const callClaude = useCallback(async (userText, history) => {
    setStatus("thinking"); setTranscript(""); setError("");
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, userText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      const newMessages = [...history, { role: "user", content: userText }, { role: "assistant", content: data.text }];
      setMessages(newMessages);
      speak(data.text);
      return newMessages;
    } catch {
      setError("Hubo un error. Verifica tu conexión e inténtalo de nuevo.");
      setStatus("idle");
    }
  }, [speak]);

  const startListening = useCallback(() => {
    if (!isSpeechSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "es-ES"; recognition.continuous = true; recognition.interimResults = true;
    let finalText = "";
    recognition.onstart = () => setStatus("listening");
    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interim = e.results[i][0].transcript;
      }
      setTranscript(finalText + interim);
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => recognition.stop(), 2000);
    };
    recognition.onend = () => {
      clearTimeout(silenceTimerRef.current);
      const text = finalText.trim();
      if (text) callClaude(text, messages);
      else { setStatus("idle"); setTranscript(""); }
    };
    recognition.onerror = () => setStatus("idle");
    recognitionRef.current = recognition;
    recognition.start();
  }, [isSpeechSupported, messages, callClaude]);

  const stopListening = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
  }, []);

  const startChat = async () => { setPhase("chat"); await callClaude("Estoy listo. Empieza a interrogarme.", []); };
  const handleTextSend = () => {
    if (!inputText.trim() || status === "thinking") return;
    const text = inputText.trim(); setInputText("");
    callClaude(text, messages);
  };
  const reset = () => {
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    setPhase("intro"); setMessages([]); setTranscript(""); setStatus("idle"); setError("");
  };

  const statusColor = { idle: "#4a4035", listening: "#c4623a", thinking: "#8b7355", speaking: "#5a7a8a" };
  const statusLabel = { idle: phase === "chat" ? (useTextInput ? "Escribe tu respuesta" : "Mantén presionado para hablar") : "", listening: "Escuchando...", thinking: "Pensando...", speaking: "Hablando..." };

  return (
    <>
      <Head>
        <title>Interrogatorio Procesal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ minHeight: "100vh", background: "#0d0b09", fontFamily: "Georgia, serif", color: "#e2d8c8", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.6); opacity: 0; } } @keyframes wave { 0%, 100% { height: 8px; } 50% { height: 28px; } } @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .msg-appear { animation: fade-in 0.4s ease forwards; } button { cursor: pointer; }`}</style>

        <header style={{ width: "100%", padding: "18px 28px", borderBottom: "1px solid #1e1a14", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#6b5740", textTransform: "uppercase" }}>Interrogatorio oral</div>
            <div style={{ fontSize: "20px", fontStyle: "italic", color: "#c8b898", marginTop: "2px" }}>Derecho Procesal</div>
          </div>
          {phase === "chat" && (
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setVoiceEnabled(v => !v)} style={{ background: "transparent", border: `1px solid ${voiceEnabled ? "#5a7a8a" : "#3a3028"}`, color: voiceEnabled ? "#8ab0bc" : "#6b5740", padding: "6px 14px", fontSize: "13px", fontFamily: "inherit" }}>
                {voiceEnabled ? "🔊 Voz ON" : "🔇 Voz OFF"}
              </button>
              <button onClick={reset} style={{ background: "transparent", border: "1px solid #2a2218", color: "#6b5740", padding: "6px 14px", fontSize: "13px", fontFamily: "inherit" }}>Reiniciar</button>
            </div>
          )}
        </header>

        {phase === "intro" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", maxWidth: "500px", textAlign: "center", gap: "24px" }}>
            <div style={{ fontSize: "56px" }}>⚖️</div>
            <h1 style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "30px", color: "#e2d8c8" }}>¿Listo para el interrogatorio?</h1>
            <p style={{ color: "#8b7355", fontSize: "16px", lineHeight: "1.7" }}>Conversa con voz sobre tu apunte de <strong style={{ color: "#c4a882" }}>Derecho Procesal Civil y Penal</strong>. La IA te hará preguntas una a una.</p>
            <label style={{ fontSize: "14px", color: "#8b7355", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center" }}>
              <input type="checkbox" checked={useTextInput} onChange={e => setUseTextInput(e.target.checked)} style={{ accentColor: "#8b7355" }} />
              Usar texto en lugar de voz
            </label>
            <button onClick={startChat} style={{ padding: "16px 48px", background: "#8b7355", color: "#0d0b09", border: "none", fontSize: "16px", fontFamily: "inherit" }}>Comenzar</button>
          </div>
        )}

        {phase === "chat" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", maxWidth: "680px", padding: "0 16px" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 16px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {messages.map((msg, i) => (
                <div key={i} className="msg-appear" style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "0.25em", color: "#4a3d2e", marginBottom: "5px", textTransform: "uppercase" }}>{msg.role === "user" ? "Tú" : "Interrogador"}</div>
                  <div style={{ maxWidth: "82%", padding: "14px 18px", background: msg.role === "user" ? "#181410" : "#111009", border: `1px solid ${msg.role === "user" ? "#2e2820" : "#1e1a12"}`, borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", fontSize: "16px", lineHeight: "1.7", color: msg.role === "user" ? "#b8a888" : "#e2d8c8" }}>{msg.content}</div>
                </div>
              ))}
              {status === "thinking" && (
                <div style={{ display: "flex" }}>
                  <div style={{ padding: "14px 18px", background: "#111009", border: "1px solid #1e1a12", borderRadius: "4px 14px 14px 14px", display: "flex", gap: "5px", alignItems: "center" }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6b5740", animation: "wave 1s ease-in-out infinite", animationDelay: `${i*0.15}s` }} />)}
                  </div>
                </div>
              )}
              {transcript && status === "listening" && <div style={{ alignSelf: "flex-end", maxWidth: "82%", padding: "14px 18px", background: "#181410", border: "1px dashed #3a2e20", borderRadius: "14px 4px 14px 14px", fontSize: "16px", color: "#8b7355", fontStyle: "italic" }}>{transcript}</div>}
              {error && <div style={{ padding: "12px 16px", background: "#1a0a08", border: "1px solid #5a2a18", color: "#c47355", fontSize: "14px", borderRadius: "4px" }}>{error}</div>}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: "20px 0 28px", borderTop: "1px solid #1a1610", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: statusColor[status], textTransform: "uppercase", minHeight: "16px" }}>{statusLabel[status]}</div>
              {useTextInput ? (
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleTextSend()} placeholder="Escribe tu respuesta..." disabled={status === "thinking" || status === "speaking"} style={{ flex: 1, background: "#111009", border: "1px solid #2a2218", color: "#e2d8c8", padding: "12px 16px", fontSize: "16px", fontFamily: "inherit", outline: "none" }} />
                  <button onClick={handleTextSend} disabled={!inputText.trim() || status === "thinking"} style={{ padding: "12px 20px", background: inputText.trim() ? "#8b7355" : "#1e1a14", color: inputText.trim() ? "#0d0b09" : "#4a3d2e", border: "none", fontSize: "16px", fontFamily: "inherit" }}>↑</button>
                </div>
              ) : (
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {status === "listening" && <><div style={{ position: "absolute", width: "80px", height: "80px", borderRadius: "50%", border: "2px solid #c4623a", animation: "pulse-ring 1s ease-out infinite" }} /><div style={{ position: "absolute", width: "80px", height: "80px", borderRadius: "50%", border: "2px solid #c4623a", animation: "pulse-ring 1s ease-out infinite", animationDelay: "0.4s" }} /></>}
                  <button onMouseDown={status === "idle" ? startListening : undefined} onMouseUp={status === "listening" ? stopListening : undefined} onTouchStart={status === "idle" ? startListening : undefined} onTouchEnd={status === "listening" ? stopListening : undefined} disabled={status === "thinking" || status === "speaking"} style={{ width: "76px", height: "76px", borderRadius: "50%", border: "none", background: status === "listening" ? "#c4623a" : status === "thinking" || status === "speaking" ? "#2a2218" : "#2e2618", fontSize: "28px", position: "relative", zIndex: 1, boxShadow: status === "listening" ? "0 0 24px rgba(196,98,58,0.4)" : "none" }}>
                    {status === "thinking" ? "⏳" : status === "speaking" ? "💬" : "🎙️"}
                  </button>
                </div>
              )}
              <button onClick={() => { setUseTextInput(v => !v); window.speechSynthesis?.cancel(); }} style={{ background: "transparent", border: "none", color: "#4a3d2e", fontSize: "13px", fontFamily: "inherit" }}>
                {useTextInput ? "Cambiar a voz 🎙️" : "Cambiar a texto ⌨️"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
