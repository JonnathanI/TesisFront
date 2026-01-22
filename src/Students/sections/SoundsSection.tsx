import React from "react";

interface SoundItemBase {
  icon: string;
  name: string;
}

interface Props {
  soundItems: { category: string; items: SoundItemBase[] }[];
  speak: (text: string) => void;
  theme: any;
}

export default function SoundsSection({ soundItems, speak, theme }: Props) {
  return (
    <>
      {soundItems.map((c, i) => (
        <div
          key={i}
          style={{
            marginBottom: "2rem",
            background: theme.cardBg,
            padding: "1.5rem",
            borderRadius: "1rem",
            border: `1px solid ${theme.border}`,
          }}
        >
          <h3>{c.category}</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "1rem",
            }}
          >
            {c.items.map((it, j) => (
              <button
                key={j}
                onClick={() => speak(it.name)}
                style={{
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  border: `1px solid ${theme.border}`,
                  background: theme.background,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "1.5rem" }}>{it.icon}</div>
                <div>{it.name}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
