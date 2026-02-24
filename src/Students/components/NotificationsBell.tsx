import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
} from "../../api/auth.service";
import { NotificationDto } from "../../api/auth.types";

// URL del WebSocket (asegúrate que coincida con tu backend)
// Si quieres, puedes usar process.env.REACT_APP_WS_URL
const WS_URL =
  (process.env.REACT_APP_WS_URL as string) || "http://localhost:8081/ws";

export const NotificationsBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const stompRef = useRef<Client | null>(null);
  const bellRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Cargar inicial (REST)
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [list, unread] = await Promise.all([
          getNotifications(),
          getUnreadNotificationsCount(),
        ]);
        setNotifications(list);
        setUnreadCount(unread);
      } catch (err) {
        console.error("Error cargando notificaciones iniciales", err);
      }
    };
    loadInitial();
  }, []);

  // 🔹 WebSocket: suscripción a /user/queue/notifications
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Notificaciones WS conectado");
        client.subscribe("/user/queue/notifications", (msg) => {
          try {
            const notif: NotificationDto = JSON.parse(msg.body);
            setNotifications((prev) => [notif, ...prev]);
            setUnreadCount((prev) => prev + 1);
          } catch (e) {
            console.error("Error parseando notificación WS", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    stompRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  // 🔹 Cerrar dropdown si clicas fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOpen = () => setOpen((prev) => !prev);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Error marcando notificación como leída", e);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <div
      ref={bellRef}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      {/* 🔔 Botón campana */}
      <button
        onClick={handleToggleOpen}
        style={{
          position: "relative",
          borderRadius: 999,
          border: "2px solid #E5E5E5",
          background: "white",
          padding: "8px 10px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ fontSize: 18 }}>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              minWidth: 18,
              height: 18,
              borderRadius: 999,
              background: "#FF4B4B",
              color: "white",
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              padding: "0 4px",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 🔽 Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            marginTop: 8,
            width: 320,
            maxHeight: 420,
            overflowY: "auto",
            background: "white",
            borderRadius: 16,
            border: "1px solid #E5E5E5",
            boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
            zIndex: 3000,
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid #E5E5E5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontWeight: 800, fontSize: 14, color: "#4b4b4b" }}
            >
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: 11,
                  color: "#1CB0F6",
                  fontWeight: 700,
                }}
              >
                {unreadCount} sin leer
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <p
              style={{
                padding: 16,
                fontSize: 13,
                color: "#999",
                textAlign: "center",
              }}
            >
              No tienes notificaciones por ahora 😊
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkAsRead(n.id)}
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid #F3F4F6",
                  background: n.read ? "white" : "#F0F9FF",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {n.title}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#4B5563",
                  }}
                >
                  {n.message}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    marginTop: 2,
                  }}
                >
                  {formatDate(n.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};