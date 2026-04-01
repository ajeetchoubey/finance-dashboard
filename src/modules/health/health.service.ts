export function getHealthStatus() {
  return {
    status: "ok",
    service: "finance-dashboard-backend",
    timestamp: new Date().toISOString()
  };
}
