export default async function handler(req, res) {
  // 1. LLAVES DE PRODUCCIÓN (LIVE)
  const API_KEY = "hUDHkiMNhnrEbisqnfdJFNxluOPZVQdV";
  const SECRET_KEY = "FGibNWnBrdfVr4HR13lgkYrXEm9DMHVY8kn62zGU";

  // 2. ENDPOINT DE PRODUCCIÓN
  // Conectamos directamente al servidor real, no al de pruebas (Sandbox)
  const endpoint = 'https://api.dlocalgo.com/v1/currency-exchanges';

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY.trim()}:${SECRET_KEY.trim()}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `dLocal Error (${response.status}): ${errorText}` 
      });
    }

    const data = await response.json();
    
    // Mapeo de datos para el frontend
    const cleanRates = {};
    const currencyMap = {
      'ARS': 'AR', 'MXN': 'MX', 'COP': 'CO', 'CLP': 'CL',
      'PEN': 'PE', 'CRC': 'CR', 'UYU': 'UY', 'VES': 'VE',
      'BOB': 'BO', 'PYG': 'PY', 'USD': 'US', 'EUR': 'ES'
    };

    if (Array.isArray(data)) {
      data.forEach(item => {
        const countryCode = currencyMap[item.target_currency];
        if (countryCode) cleanRates[countryCode] = item.value;
      });
      res.status(200).json(cleanRates);
    } else {
      res.status(500).json({ error: "Formato de respuesta desconocido de dLocal." });
    }

  } catch (error) {
    console.error("Error Crítico:", error);
    res.status(500).json({ error: `Fallo interno del servidor: ${error.message}` });
  }
}