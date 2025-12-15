// Script para probar manualmente los endpoints de reportes en el navegador
// Abre la consola del navegador (F12) y copia/pega esto

(async () => {
  const API_HOST = "https://harol-lovers.up.railway.app";
  const token = localStorage.getItem("authToken");

  console.log("🔍 Probando endpoints de reportes...\n");

  // Test 1: GET /reporte
  try {
    console.log("1️⃣ Probando GET /reporte");
    const response = await fetch(`${API_HOST}/reporte`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { token }),
      },
    });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`   Respuesta:`, data);
    console.log("");
  } catch (err) {
    console.error("   ❌ Error:", err.message);
    console.log("");
  }

  // Test 2: GET /admin/reports
  try {
    console.log("2️⃣ Probando GET /admin/reports");
    const response = await fetch(`${API_HOST}/admin/reports`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { token }),
      },
    });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`   Respuesta:`, data);
    console.log("");
  } catch (err) {
    console.error("   ❌ Error:", err.message);
    console.log("");
  }

  // Test 3: GET /admin/dashboard/stats
  try {
    console.log("3️⃣ Probando GET /admin/dashboard/stats");
    const response = await fetch(`${API_HOST}/admin/dashboard/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { token }),
      },
    });
    console.log(`   Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`   Respuesta:`, data);
    console.log("");
  } catch (err) {
    console.error("   ❌ Error:", err.message);
    console.log("");
  }

  console.log("✅ Prueba completada");
})();
