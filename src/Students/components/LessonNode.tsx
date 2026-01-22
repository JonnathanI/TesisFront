import { COLORS } from "../theme/color";

interface Props {
  title: string;
  status: "locked" | "active" | "completed";
  onClick?: () => void;
}

export const LessonNode = ({ title, status, onClick }: Props) => {
  const styles = {
    background:
      status === "completed"
        ? COLORS.green
        : status === "active"
        ? COLORS.green
        : COLORS.gray,
    cursor: status === "locked" ? "not-allowed" : "pointer",
    opacity: status === "locked" ? 0.5 : 1,
  };

  return (
    <div style={{ textAlign: "center", marginBottom: 30 }}>
      <div
        onClick={status !== "locked" ? onClick : undefined}
        style={{
          ...styles,
          width: 80,
          height: 80,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
          color: COLORS.white,
          fontWeight: "bold",
          fontSize: 24,
        }}
      >
        ⭐
      </div>
      <div style={{ marginTop: 8, fontWeight: 600 }}>{title}</div>
    </div>
  );
};
