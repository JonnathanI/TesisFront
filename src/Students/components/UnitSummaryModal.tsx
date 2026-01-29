interface UnitSummaryProps {
  unitTitle: string;
  lessons: {
    title: string;
    xp: number;
    lingots: number;
    correct: number;
    mistakes: number;
  }[];
  onClose: () => void;
}

const UnitSummaryModal: React.FC<UnitSummaryProps> = ({
  unitTitle,
  lessons,
  onClose
}) => {
  const totalXp = lessons.reduce((a, l) => a + l.xp, 0);
  const totalLingots = lessons.reduce((a, l) => a + l.lingots, 0);

  return (
    <div className="overlay">
      <div className="modal">
        <h2>🎉 Unidad completada</h2>
        <h3>{unitTitle}</h3>

        {lessons.map((l, i) => (
          <div key={i} className="lesson-row">
            <strong>{l.title}</strong>
            <span>⭐ {l.xp}</span>
            <span>💎 {l.lingots}</span>
            <span>✅ {l.correct}</span>
            <span>❌ {l.mistakes}</span>
          </div>
        ))}

        <hr />

        <h4>Total</h4>
        <p>⭐ {totalXp} XP</p>
        <p>💎 {totalLingots} Diamantes</p>

        <button onClick={onClose}>Continuar</button>
      </div>
    </div>
  );
};

export default UnitSummaryModal;
