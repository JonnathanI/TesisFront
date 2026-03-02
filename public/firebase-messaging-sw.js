/* eslint-env serviceworker */
/* eslint-disable no-undef, no-restricted-globals */

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Init Firebase en el SW (mismo proyecto que en tu front)
firebase.initializeApp({
  apiKey: "AIzaSyBeJr6Cyz0MXgOXcLS847tmdfSbTO3z6ok",
  authDomain: "europeek-ee4ae.firebaseapp.com",
  projectId: "europeek-ee4ae",
  storageBucket: "europeek-ee4ae.firebasestorage.app",
  messagingSenderId: "296792041068",
  appId: "1:296792041068:web:62732f6dc1a592137cda49",
});

const messaging = firebase.messaging();

// 🔔 Notificaciones cuando la web está CERRADA o en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log("💬 [SW] Notificación BG recibida:", payload);

  const notif = payload.notification || {};
  const data = payload.data || {};

  // Título
  const title =
    notif.title ||
    data.title ||
    (data.type === "MESSAGE_RECEIVED"
      ? "Nuevo mensaje"
      : data.type === "TASK_ASSIGNED"
      ? "Nueva tarea asignada"
      : "Notificación");

  // Cuerpo
  const body = notif.body || data.body || data.message || "";

  const options = {
    body,
    icon: "/euro-02.png",   // mucho más seguro que /logo192.png
    badge: "/euro-02.png",
    data,                   // aquí viaja type, relatedId, etc.
  };

  self.registration.showNotification(title, options);
});

// Qué pasa al hacer click en la notificación
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const type = data.type;
  let url = "/";

  if (type === "MESSAGE_RECEIVED") {
    url = "/student/dashboard";
  } else if (type === "TASK_ASSIGNED") {
    url = "/student/dashboard?tab=groups";
  } else if (type === "EVALUATION_ASSIGNED") {
    url = "/student/dashboard?tab=evaluations";
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});