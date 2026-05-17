"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "Koji sektor je najjači ovog meseca?",
  "Kako da čitam earnings izveštaj?",
  "Šta je stop-loss i kada ga koristim?",
  "Da li je dobro vreme za ulaz u tehnološke akcije?",
];

export default function AsistentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
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
      setMessages([...next, {
        role: "assistant",
        content: "Asistent trenutno nije dostupan. Pokušajte ponovo za trenutak.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function startVoice() {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "sr-RS";
    rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      send(transcript);
    };
    rec.start();
  }

  const isEmpty = messages.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* ── Left: intro or chat ── */}
        <div className={styles.chatArea}>
          {isEmpty ? (
            <div className={styles.welcome}>
              <p className={styles.eyebrow}>Asistent</p>
              <h1 className={styles.welcomeTitle}>
                Postavite pitanje<br />o tržištu.
              </h1>
              <p className={styles.welcomeSub}>
                Jasni odgovori. Bez žargona. Bez nagađanja.
              </p>
              <div className={styles.suggestions}>
                {SUGGESTED.map((q) => (
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
                  <p className={styles.messageContent}>{m.content}</p>
                </div>
              ))}
              {loading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.typingIndicator}>
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div className={styles.inputBar}>
          <div className={styles.inputWrap}>
            <textarea
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Unesite pitanje…"
              rows={1}
              aria-label="Poruka asistentu"
            />
            <div className={styles.inputActions}>
              <button
                className={`${styles.voiceBtn} ${isListening ? styles.listening : ""}`}
                onClick={startVoice}
                type="button"
                aria-label="Glasovni unos"
                title="Glasovni unos"
              >
                <MicIcon />
              </button>
              <button
                className={styles.sendBtn}
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                type="button"
                aria-label="Pošalji"
              >
                <SendIcon />
              </button>
            </div>
          </div>
          <p className={styles.inputHint}>Enter za slanje · Shift+Enter za novi red</p>
        </div>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
