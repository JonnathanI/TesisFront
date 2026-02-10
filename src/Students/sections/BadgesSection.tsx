// src/Students/sections/BadgesSection.tsx
import React, { useEffect, useState } from "react";
import { getUserBadges } from "../../api/auth.service";
import { BadgeDTO as ApiBadgeDTO } from "../../api/auth.types"; // DTO que viene del backend

// 👉 Importa tus imágenes desde src/Students/sections/badges
import PrimeraLeccionImg from "./badges/PrimeraLeccion.png";
import LeccionPerfectaImg from "./badges/LeccionPerfecta.png";
import Top1Img from "./badges/top1.png";
import Top7Img from "./badges/top7.png";
import LegendImg from "./badges/legend.png";

// 🔹 Tipo para la VISTA (lo que realmente renderizamos)
type BadgeVM = {
  id: string;
  code: string;
  title: string;
  description: string;
  earnedAt?: number | null;
  unlocked: boolean;
};

// 🔹 Todas las medallas que EXISTEN en tu sistema.
//    Asegúrate de que los `code` coincidan con los del backend.
const ALL_BADGES_META: Array<{
  code: string;
  title: string;
  description: string;
}> = [
  {
    code: "FIRST_LESSON",
    title: "Primera lección",
    description: "Completa tu primera lección.",
  },
  {
    code: "PERFECT_LESSON",
    title: "Lección perfecta",
    description: "Completa una lección sin cometer errores.",
  },
  {
    code: "STREAK_3",
    title: "Racha 3 días",
    description: "Mantén una racha de 3 días seguidos practicando.",
  },
  {
    code: "STREAK_7",
    title: "Racha 7 días",
    description: "Mantén una racha de 7 días seguidos practicando.",
  },
  {
    code: "LEGEND",
    title: "Leyenda",
    description: "Alcanza la cima del ranking.",
  },
];

// Mapa: code del backend -> imagen importada
const BADGE_IMAGE_MAP: Record<string, string> = {
  FIRST_LESSON: PrimeraLeccionImg,
  PERFECT_LESSON: LeccionPerfectaImg,
  STREAK_3: Top1Img,
  STREAK_7: Top7Img,
  LEGEND: LegendImg,
};

export const BadgesSection: React.FC = () => {
  const [badges, setBadges] = useState<BadgeVM[]>([]);
  const [lastUnlocked, setLastUnlocked] = useState<BadgeVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🟢 El backend devuelve SOLO las que el usuario ya desbloqueó
      const data: ApiBadgeDTO[] = await getUserBadges();

      console.log("🎖 Insignias ganadas desde el backend:", data);

      // Mapa code -> badge ganada
      const earnedByCode = new Map<string, ApiBadgeDTO>();
      (data || []).forEach((b) => {
        earnedByCode.set(b.code, b);
      });

      // 🔄 Construimos el array final con TODAS las medallas
      const viewModels: BadgeVM[] = ALL_BADGES_META.map((meta) => {
        const earned = earnedByCode.get(meta.code);

        return {
          id: earned?.id ?? meta.code, // si no hay id, usamos el code
          code: meta.code,
          title: meta.title,
          description: meta.description,
          earnedAt: earned?.earnedAt ?? null,
          unlocked: !!earned, // true si la tiene, false si no
        };
      });

      setBadges(viewModels);

      // 🆕 Calculamos la ÚLTIMA insignia desbloqueada (por fecha)
      const newest =
        viewModels
          .filter((b) => b.unlocked && b.earnedAt)
          .sort(
            (a, b) => (b.earnedAt ?? 0) - (a.earnedAt ?? 0)
          )[0] ?? null;

      setLastUnlocked(newest || null);
    } catch (e) {
      console.error("Error al cargar insignias:", e);
      setError("Error al cargar insignias");
      setBadges([]);
      setLastUnlocked(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  if (loading) return <p>Cargando insignias...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Mis Insignias</h2>

      {/* 🔔 Aviso de la última medalla conseguida,
          pero SIN quitar el listado */}
      {lastUnlocked && (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#ECFDF5",
            border: "1px solid #6EE7B7",
            color: "#065F46",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          🎉 Nueva insignia desbloqueada:{" "}
          <span style={{ fontWeight: 800 }}>{lastUnlocked.title}</span>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {badges.map((b) => {
          const isUnlocked = b.unlocked;
          const iconSrc =
            BADGE_IMAGE_MAP[b.code] ?? PrimeraLeccionImg; // fallback por si falta algo

          return (
            <div
              key={b.code}
              style={{
                padding: 18,
                borderRadius: 16,
                border: "2px solid #E5E5E5",
                background: isUnlocked ? "#FFFFFF" : "#F3F4F6",
                opacity: isUnlocked ? 1 : 0.6,
                textAlign: "center",
              }}
            >
              {/* Imagen */}
              <div
                style={{
                  width: 90,
                  height: 90,
                  margin: "0 auto 12px",
                }}
              >
                <img
                  src={iconSrc}
                  alt={b.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: isUnlocked ? "none" : "grayscale(1)", // gris si está bloqueada
                  }}
                />
              </div>

              {/* Título */}
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                {b.title}
              </h3>

              {/* Descripción */}
              <p style={{ fontSize: 14, color: "#6B7280" }}>
                {b.description}
              </p>

              {/* Estado */}
              <p style={{ fontSize: 13 }}>
                {isUnlocked ? "✅ Desbloqueada" : "🔒 Bloqueada"}
              </p>

              {isUnlocked && b.earnedAt && (
                <small style={{ color: "#999" }}>
                  {new Date(b.earnedAt).toLocaleDateString("es-ES")}
                </small>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
