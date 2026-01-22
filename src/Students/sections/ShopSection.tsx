import React from "react";

interface Props {
  theme: any;
  userProfile: any;
  handlePurchase: (type: string, cost: number) => void;
}

export default function ShopSection({ theme, userProfile, handlePurchase }: Props) {
  return (
    <div>
      <h2>Tienda 💎</h2>

      <button onClick={() => handlePurchase("HEART_REFILL", 50)}>
        Rellenar Vidas (50)
      </button>

      <button onClick={() => handlePurchase("STREAK_FREEZE", 200)}>
        Protector de racha (200)
      </button>
    </div>
  );
}
