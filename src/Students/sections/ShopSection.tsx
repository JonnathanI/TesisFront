import React from "react";
import { Heart, Snowflake, Zap } from "lucide-react";

interface Props {
  userProfile: any;
  handlePurchase: (type: string, cost: number) => void;
}

export default function ShopSection({ userProfile, handlePurchase }: Props) {
  const shopItems = [
    {
      id: "HEART_REFILL",
      name: "Rellenar Vidas",
      description: "Recupera todos tus corazones para seguir aprendiendo.",
      cost: 50,
      icon: <Heart size={40} color="#FF4B4B" fill="#FF4B4B" />,
      color: "#FF4B4B",
    },
    {
      id: "STREAK_FREEZE",
      name: "Protector de Racha",
      description: "Mantiene tu racha activa aunque no practiques un día.",
      cost: 200,
      icon: <Snowflake size={40} color="#3CCCFB" />,
      color: "#3CCCFB",
    },
    {
      id: "DOUBLE_OR_NOTHING",
      name: "Doble o Nada",
      description: "Apuesta 50 gemas y gana 100 si mantienes tu racha 7 días.",
      cost: 50,
      icon: <Zap size={40} color="#FFC800" fill="#FFC800" />,
      color: "#FFC800",
    },
  ];

  const styles = `
    .shop-container { max-width: 600px; margin: 0 auto; padding-bottom: 50px; }
    .shop-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .shop-card { 
      display: flex; 
      align-items: center; 
      gap: 20px; 
      padding: 20px; 
      background: white; 
      border: 2px solid #E5E5E5; 
      border-radius: 18px; 
      margin-bottom: 15px; 
    }
    .purchase-button { 
      padding: 10px 20px; 
      border: none; 
      border-radius: 12px; 
      background: #1CB0F6; 
      color: white; 
      font-weight: 800; 
      border-bottom: 4px solid #1899D6; 
      cursor: pointer; 
    }
    .purchase-button:disabled { background: #E5E5E5; border-bottom-color: #AFAFAF; color: #AFAFAF; cursor: not-allowed; }
    .gem-count { 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      color: #1CB0F6; 
      font-weight: 900; 
      font-size: 20px; 
    }
  `;

  return (
    <div className="shop-container">
      <style>{styles}</style>
      
      <div className="shop-header">
        <h2 style={{ fontWeight: 900, fontSize: "28px", color: "#3C3C3C" }}>Tienda</h2>
        <div className="gem-count">
          {/* UNIFICADO: Usamos el diamante azul para que coincida con la derecha */}
          <span style={{ fontSize: "24px" }}>💎</span> 
          <span>{userProfile.lingots} Gemas</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {shopItems.map((item) => {
          // Importante: comparar contra userProfile.lingots
          const canAfford = userProfile.lingots >= item.cost;

          return (
            <div key={item.id} className="shop-card">
              <div style={{ padding: "15px", borderRadius: "15px", backgroundColor: `${item.color}15` }}>
                {item.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "18px", fontWeight: 800, color: "#4B4B4B" }}>{item.name}</h3>
                <p style={{ margin: 0, color: "#777", fontSize: "14px", fontWeight: 600 }}>{item.description}</p>
              </div>

              <button 
                className="purchase-button"
                disabled={!canAfford}
                onClick={() => handlePurchase(item.id, item.cost)}
              >
                {canAfford ? `COMPRAR: ${item.cost}` : "INSUFICIENTE"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}