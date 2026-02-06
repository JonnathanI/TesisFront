// src/Students/components/FriendsChat.tsx
import React, { useEffect, useState, useRef } from "react";
import { StudentData, ChatMessage } from "../../api/auth.types";
import { getChatMessages, sendChatMessage, sendChatFile } from "../../api/auth.service";

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

useEffect(() => {
  console.log("Mensajes en el chat:", messages);
}, [messages]);


  // 🔄 NUEVO: refrescar el chat cada 3 segundos para ver mensajes nuevos
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
            // No hay cambios, dejamos el estado igual para evitar re-render innecesario
            return prev;
          }
          return data;
        });
      } catch (e) {
        console.error("Error actualizando chat", e);
      }
    }, 1000); // 3 segundos

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [friend.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleSend = async () => {
    const trimmed = text.trim();

    // nada que enviar
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
      <div
        style={{
          fontSize: 11,
          color: "#64748B",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        📎 {selectedFile.name}
        <button
          type="button"
          onClick={() => {
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          style={{
            border: "none",
            background: "transparent",
            color: "#ef4444",
            cursor: "pointer",
            fontSize: 11,
          }}
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
            style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, marginTop: 4 }}
          />
        );
      case "VIDEO":
        return (
          <video
            src={url}
            controls
            style={{ maxWidth: 220, borderRadius: 8, marginTop: 4 }}
          />
        );
      case "AUDIO":
        return (
          <audio src={url} controls style={{ marginTop: 4, width: "100%" }} />
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
              marginTop: 4,
              fontSize: 12,
              textDecoration: "underline",
            }}
          >
            📎 Ver archivo
          </a>
        );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 340,
        maxHeight: "70vh",
        background: "white",
        borderRadius: 18,
        boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      {/* header con indicador (verde si friend.isActive === true) */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid #E5E5E5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#F8FAFC",
        }}
      >
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
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {friend.fullName}
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>
              {friend.isActive ? "En línea" : "Desconectado"}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontWeight: 900,
            color: "#94A3B8",
          }}
        >
          ✕
        </button>
      </div>

      {/* mensajes */}
      <div
        style={{
          flex: 1,
          padding: "10px 12px",
          overflowY: "auto",
          background: "#EFF6FF",
        }}
      >
        {loading ? (
          <p style={{ fontSize: 12, color: "#64748B" }}>Cargando mensajes...</p>
        ) : messages.length === 0 ? (
          <p style={{ fontSize: 12, color: "#64748B" }}>
            Comienza la conversación con {friend.fullName.split(" ")[0]} 👋
          </p>
        ) : (
          messages.map((m) => {
            // 🔹 usamos friend.id para decidir si el mensaje es del otro
            const isFromFriend = m.senderId === friend.id;
            const isFromMe = !isFromFriend;

            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: isFromMe ? "flex-end" : "flex-start",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "6px 10px",
                    borderRadius: 16,
                    fontSize: 12,
                    lineHeight: 1.3,
                    backgroundColor: isFromMe ? "#1CB0F6" : "white",
                    color: isFromMe ? "white" : "#0F172A",
                    boxShadow: "0 1px 3px rgba(15,23,42,0.12)",
                    whiteSpace: "pre-wrap",
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
      <div
        style={{
          borderTop: "1px solid #E5E5E5",
          padding: "8px 10px",
          background: "white",
        }}
      >
        {renderSelectedFile()}

        <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 18,
              cursor: "pointer",
            }}
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
            style={{
              flex: 1,
              resize: "none",
              borderRadius: 12,
              border: "1px solid #CBD5E1",
              padding: "6px 8px",
              fontSize: 13,
              outline: "none",
              fontFamily: "inherit",
            }}
          />

          <button
            disabled={sending || (!text.trim() && !selectedFile)}
            onClick={handleSend}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
              background:
                sending || (!text.trim() && !selectedFile)
                  ? "#BFDBFE"
                  : "#1CB0F6",
              color: "white",
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
  );
};

export default FriendsChat;
