import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
const firebaseConfig = {
  apiKey: "AIzaSyBeJr6Cyz0MXgOXcLS847tmdfSbTO3z6ok",
  authDomain: "europeek-ee4ae.firebaseapp.com",
  projectId: "europeek-ee4ae",
  messagingSenderId: "296792041068",
  appId: "1:296792041068:web:62732f6dc1a592137cda49",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Mensajería
const messaging = getMessaging(app);

// ⬇️⬇️ ESTA ES LA FUNCIÓN QUE TE FALTABA ⬇️⬇️
export async function requestNotificationPermissionAndToken() {
  console.log("🔔 Solicitando permiso de notificaciones...");

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.warn("⚠️ Permiso de notificaciones DENEGADO");
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: "BNmqh0aDqoEExCPZHSc8zDnyJzGH4Du7UEB1FrGEWnr1f63RrzLiToi1U_hwcdJlw4OihZxUVNPi6tXYCE3Dvyc",
    });

    if (!token) {
      console.warn("⚠️ No se pudo generar token FCM");
      return null;
    }

    console.log("🔥 TOKEN FCM OBTENIDO:", token);
    return token;
  } catch (err) {
    console.error("❌ Error obteniendo token:", err);
    return null;
  }
}

// 🔥 Listener de mensajes en primer plano
export function onForegroundMessage(callback: (payload: any) => void) {
  onMessage(messaging, callback);
}