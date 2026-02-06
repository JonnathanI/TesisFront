// src/Students/components/FriendsChat.tsx
import React, { useEffect, useState, useRef } from "react";
import { StudentData, ChatMessage } from "../../api/auth.types";
import { getChatMessages, sendChatMessage } from "../../api/auth.service";

interface FriendsChatProps {
  friend: StudentData;
  currentUserId?: string; // puede venir o no desde el dashboard
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
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Cargar historial al abrir
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

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      // Mensaje optimista solo para el front
      const optimistic: ChatMessage = {
        id: Date.now(), // temporal
        senderId: currentUserId ?? "", // el back usa el JWT, esto es solo visual
        receiverId: friend.id,
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimistic]);
      setText("");

      // El backend usa el JWT para saber quién soy
      const saved = await sendChatMessage(friend.id, trimmed);

      // Reemplazar el optimista por el real
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== optimistic.id);
        return [...withoutTemp, saved];
      });
    } catch (e) {
      alert("No se pudo enviar el mensaje");
      console.error("Error al enviar mensaje", e);
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
      {/* header */}
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
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {friend.fullName}
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Amigo</div>
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
            // 🔥 Lógica robusta: siempre hay solo 2 personas.
            // Si el sender ES el amigo → mensaje del amigo (izquierda)
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
                <span
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
                </span>
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
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          style={{
            width: "100%",
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
          disabled={sending || !text.trim()}
          onClick={handleSend}
          style={{
            marginTop: 6,
            border: "none",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 700,
            background: sending || !text.trim() ? "#BFDBFE" : "#1CB0F6",
            color: "white",
            cursor: sending || !text.trim() ? "default" : "pointer",
            float: "right",
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default FriendsChat;
