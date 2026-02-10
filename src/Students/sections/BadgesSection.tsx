// src/Students/sections/BadgesSection.tsx
import React, { useEffect, useState } from "react";
import { getUserBadges } from "../../api/auth.service";

type BadgeDTO = {
  id: string;
  code: string;
  title: string;
  description: string;
  earnedAt: number;
};

export const BadgesSection: React.FC = () => {
  const [badges, setBadges] = useState<BadgeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUserBadges();
      console.log("🎖 Datos crudos de insignias:", data);

      setBadges(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("Error al cargar insignias:", e);
      setError(e.message || "Error al cargar insignias");
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  if (loading) return <p>Cargando insignias...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (!badges.length) {
    return <p>Aún no tienes insignias… ¡Sigue practicando! 💪</p>;
  }

  return (
    <div>
      <h2>Mis insignias</h2>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {badges.map((b) => (
          <div
            key={b.id}
            style={{
              width: 180,
              padding: 12,
              borderRadius: 16,
              border: "2px solid #E5E5E5",
              background: "white",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>{b.title}</h3>
            <p style={{ margin: "4px 0", fontSize: 13, color: "#666" }}>
              {b.description}
            </p>
            <span style={{ fontSize: 12, color: "#999" }}>{b.code}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
