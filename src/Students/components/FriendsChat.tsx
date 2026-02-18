// src/Students/components/FriendsChat.tsx
import React, { useEffect, useState, useRef } from "react";
import { StudentData, ChatMessage } from "../../api/auth.types";
import {
  getChatMessages,
  sendChatMessage,
  sendChatFile,
} from "../../api/auth.service";

interface FriendsChatProps {
  friend: StudentData;
  currentUserId?: string;
  onClose: () => void;
}

export const FriendsChat: React.FC<FriendsChatProps> = ({
  friend,
  currentUserId,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Cargar historial solo una vez al abrir el chat
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getChatMessages(friend.id);
        setMessages(data);
      } catch (e) {
        console.error("Error cargando historial de chat", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [friend.id]);

  // 🔄 Refrescar el chat cada 1 segundo (tú lo tenías así)
  useEffect(() => {
    let isMounted = true;

    const interval = setInterval(async () => {
      try {
        const data = await getChatMessages(friend.id);
        if (!isMounted) return;

        setMessages((prev) => {
          if (
            prev.length === data.length &&
            prev[prev.length - 1]?.id === data[data.length - 1]?.id
          ) {
            return prev;
          }
          return data;
        });
      } catch (e) {
        console.error("Error actualizando chat", e);
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [friend.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ✅ Cerrar con ESC (comodidad en desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !selectedFile) return;

    setSending(true);

    try {
      // 1) mensaje de texto normal
      if (trimmed) {
        const optimistic: ChatMessage = {
          id: Date.now(),
          senderId: currentUserId ?? "",
          receiverId: friend.id,
          content: trimmed,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimistic]);
        setText("");

        const saved = await sendChatMessage(friend.id, trimmed);

        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== optimistic.id);
          return [...withoutTemp, saved];
        });
      }

      // 2) archivo
      if (selectedFile) {
        const savedFileMessage = await sendChatFile(friend.id, selectedFile, "");
        setMessages((prev) => [...prev, savedFileMessage]);

        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (e) {
      console.error(e);
      alert("No se pudo enviar el mensaje o el archivo");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderSelectedFile = () => {
    if (!selectedFile) return null;
    return (
      <div className="fc-selected-file">
        📎 <span className="fc-file-name">{selectedFile.name}</span>
        <button
          type="button"
          onClick={() => {
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          className="fc-file-remove"
        >
          ✕
        </button>
      </div>
    );
  };

  const renderAttachment = (m: ChatMessage) => {
    if (!m.attachmentUrl) return null;
    const url = m.attachmentUrl;

    switch (m.attachmentType) {
      case "IMAGE":
        return (
          <img
            src={url}
            alt="imagen"
            className="fc-media"
            style={{ marginTop: 6 }}
          />
        );
      case "VIDEO":
        return (
          <video
            src={url}
            controls
            className="fc-media"
            style={{ marginTop: 6 }}
          />
        );
      case "AUDIO":
        return (
          <audio
            src={url}
            controls
            style={{ marginTop: 6, width: "100%" }}
          />
        );
      default:
        return (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 6,
              fontSize: 12,
              textDecoration: "underline",
              wordBreak: "break-word",
            }}
          >
            📎 Ver archivo
          </a>
        );
    }
  };

  const styles = `
    /* ====== Base ====== */
    .fc-root{
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 340px;
      max-height: 70vh;
      background: white;
      border-radius: 18px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
       height: auto;
    }

    .fc-header{
      padding: 10px 14px;
      border-bottom: 1px solid #E5E5E5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F8FAFC;
    }

    .fc-title{
      font-weight: 700;
      font-size: 14px;
    }

    .fc-subtitle{
      font-size: 11px;
      color: #94A3B8;
    }

    .fc-close{
      border: none;
      background: transparent;
      cursor: pointer;
      font-weight: 900;
      color: #94A3B8;
      font-size: 18px;
      padding: 2px 8px;
      border-radius: 10px;
    }
    .fc-close:hover{
      background: rgba(148,163,184,0.15);
    }

    .fc-messages{
      flex: 1;
      padding: 10px 12px;
      overflow-y: auto;
      background: #EFF6FF;
       min-height: 0;
    }

    .fc-bubble{
      max-width: 82%;
      padding: 8px 10px;
      border-radius: 16px;
      font-size: 12px;
      line-height: 1.35;
      box-shadow: 0 1px 3px rgba(15,23,42,0.12);
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

   .fc-input-area{
  border-top: 1px solid #E5E5E5;
  padding: 8px 10px;
  background: white;

  /* ✅ clave: que nunca desaparezca */
  position: sticky;
  bottom: 0;
  z-index: 5;

  /* ✅ safe area (iPhone) */
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

    .fc-row{
      display: flex;
      align-items: flex-end;
      gap: 6px;
    }

    .fc-attach{
      border: none;
      background: transparent;
      font-size: 18px;
      cursor: pointer;
      padding: 6px 6px;
      border-radius: 10px;
    }
    .fc-attach:hover{
      background: rgba(15,23,42,0.06);
    }

    .fc-textarea{
      flex: 1;
      resize: none;
      border-radius: 12px;
      border: 1px solid #CBD5E1;
      padding: 8px 10px;
      font-size: 13px;
      outline: none;
      font-family: inherit;
      min-height: 42px;
      max-height: 120px;
    }

    .fc-send{
      border: none;
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 700;
      color: white;
      cursor: pointer;
      flex-shrink: 0;
    }

    .fc-selected-file{
      font-size: 11px;
      color: #64748B;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border: 1px dashed #CBD5E1;
      border-radius: 12px;
      background: #F8FAFC;
    }

    .fc-file-name{
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fc-file-remove{
      border: none;
      background: transparent;
      color: #ef4444;
      cursor: pointer;
      font-size: 12px;
      font-weight: 900;
      padding: 2px 6px;
      border-radius: 8px;
    }
    .fc-file-remove:hover{
      background: rgba(239,68,68,0.10);
    }

    .fc-media{
      display: block;
      max-width: 100%;
      width: 100%;
      height: auto;
      border-radius: 10px;
    }

    /* ====== Responsive: Mobile/Tablet -> Fullscreen ====== */
    @media (max-width: 1023px){
      .fc-root{
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: auto;
        max-height: none;
        border-radius: 0;
      }
      .fc-messages{
        padding: 12px;
      }
      .fc-bubble{
        max-width: 88%;
        font-size: 13px;
      }
      .fc-textarea{
        font-size: 14px;
      }
      .fc-send{
        padding: 10px 14px;
      }
    }

    /* Extra: muy pequeño */
    @media (max-width: 420px){
      .fc-title{ font-size: 13px; }
      .fc-subtitle{ font-size: 10px; }
      .fc-send{ padding: 10px 12px; }
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <div className="fc-root">
        {/* header */}
        <div className="fc-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#1CB0F6",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {friend.fullName.charAt(0).toUpperCase()}
              </div>
              <span
                style={{
                  position: "absolute",
                  right: -1,
                  bottom: -1,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: friend.isActive ? "#22c55e" : "#94A3B8",
                  border: "2px solid white",
                }}
              />
            </div>

            <div>
              <div className="fc-title">{friend.fullName}</div>
              <div className="fc-subtitle">
                {friend.isActive ? "En línea" : "Desconectado"}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="fc-close" aria-label="Cerrar chat">
            ✕
          </button>
        </div>

        {/* mensajes */}
        <div className="fc-messages">
          {loading ? (
            <p style={{ fontSize: 12, color: "#64748B" }}>Cargando mensajes...</p>
          ) : messages.length === 0 ? (
            <p style={{ fontSize: 12, color: "#64748B" }}>
              Comienza la conversación con {friend.fullName.split(" ")[0]} 👋
            </p>
          ) : (
            messages.map((m) => {
              const isFromFriend = m.senderId === friend.id;
              const isFromMe = !isFromFriend;

              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: isFromMe ? "flex-end" : "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div
                    className="fc-bubble"
                    style={{
                      backgroundColor: isFromMe ? "#1CB0F6" : "white",
                      color: isFromMe ? "white" : "#0F172A",
                      borderTopRightRadius: isFromMe ? 6 : 16,
                      borderTopLeftRadius: isFromMe ? 16 : 6,
                    }}
                  >
                    {m.content}
                    {renderAttachment(m)}
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        {/* input */}
        <div className="fc-input-area">
          {renderSelectedFile()}

          <div className="fc-row">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="fc-attach"
              title="Adjuntar archivo"
            >
              📎
            </button>

            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="fc-textarea"
            />

            <button
              disabled={sending || (!text.trim() && !selectedFile)}
              onClick={handleSend}
              className="fc-send"
              style={{
                background:
                  sending || (!text.trim() && !selectedFile)
                    ? "#BFDBFE"
                    : "#1CB0F6",
                cursor:
                  sending || (!text.trim() && !selectedFile)
                    ? "default"
                    : "pointer",
              }}
            >
              Enviar
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </>
  );
};

export default FriendsChat;
