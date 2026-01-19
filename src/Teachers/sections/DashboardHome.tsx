export const DashboardHome = ({
  handleGenerateCode,
  loadingCode,
  registrationCode,
  error,
  currentTheme,
}: any) => (
  <div>
    <h2>👋 Bienvenido</h2>
    <p>Selecciona una opción del menú para comenzar.</p>

    <button onClick={handleGenerateCode} disabled={loadingCode}>
      Generar código
    </button>

    {registrationCode && <div>{registrationCode}</div>}
    {error && <p style={{ color: "red" }}>{error}</p>}
  </div>
);
