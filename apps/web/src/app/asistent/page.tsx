"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/context";
import styles from "./page.module.css";

interface Message { role: "user" | "assistant"; content: string; }

export default function AsistentPage() {
  const { t, locale } = useApp();
  const s = t.asistent;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const msg: Message = { role: "user", content: text.trim() };
    const next = [...messages, msg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.response }]);
    } catch {
      setMessages([...next, { role: "assistant", content: s.errorFallback }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  function startVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = locale === "es" ? "es-ES" : locale === "en" ? "en-US" : "sr-RS";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend   = () => setListening(false);
    rec.onresult = (e: any) => send(e.results[0][0].transcript);
    rec.start();
  }

  const isEmpty = messages.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.chatArea}>
          {isEmpty ? (
            <div className={`${styles.welcome} fade-up`}>
              <span className="eyebrow">{s.eyebrow}</span>
              <h1 className={styles.welcomeTitle}>{s.title}</h1>
              <p className={styles.welcomeSub}>{s.sub}</p>
              <div className={styles.suggestions}>
                {s.suggestions.map((q: string) => (
                  <button key={q} className={styles.suggestion} onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.messages}>
              {messages.map((m, i) => (
                <div key={i} className={`${styles.message} ${styles[m.role]}`}>
                  <p className={styles.msgContent}>{m.content}</p>
                </div>
              ))}
              {loading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.typing}><span/><span/><span/></div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <div className={styles.inputBar}>
          <div className={styles.inputWrap}>
            <textarea
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={s.inputPlaceholder}
              rows={1}
              aria-label={s.ariaMessage}
            />
            <div className={styles.inputActions}>
              <button
                className={`${styles.iconBtn} ${listening ? styles.active : ""}`}
                onClick={startVoice}
                aria-label={s.ariaVoiceInput}
                type="button"
              >
                <MicIcon />
              </button>
              <button
                className={styles.sendBtn}
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                type="button"
                aria-label={s.ariaSend}
              >
                <SendIcon />
              </button>
            </div>
          </div>
          <p className={styles.hint}>{s.hint}</p>
        </div>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
