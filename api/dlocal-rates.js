export default async function handler(req, res) {
  // --- CONFIGURACIÓN ---
  
  // 1. Entorno: false para PRODUCCIÓN (Claves reales)
  const IS_SANDBOX = false; 

  // 2. LLAVES FORZADAS (Hardcoded)
  // Las hemos escrito directamente aquí para evitar errores de configuración en Vercel.
  const API_KEY = "hUDHkiMNhnrEbisqnfdJFNxluOPZVQdV";
  const SECRET_KEY = "FGibNWnBrdfVr4HR13lgkYrXEm9DMHVY8kn62zGU";

  if (!API_KEY || !SECRET_KEY) {
    return res.status(500).json({ error: 'Faltan las API Keys en el código.' });
  }

  // ---------------------

  const endpoint = IS_SANDBOX 
    ? 'https://api-sbx.dlocalgo.com/v1/currency-exchanges' // Sandbox
    : 'https://api.dlocalgo.com/v1/currency-exchanges';     // Producción (Live)

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
      console.error("Error dLocal:", errorText); 
      return res.status(response.status).json({ 
        error: `dLocal Error (${response.status}) en modo ${IS_SANDBOX ? 'SANDBOX' : 'LIVE'}: ${errorText}` 
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

    // Validación de formato
    if (Array.isArray(data)) {
      data.forEach(item => {
        const countryCode = currencyMap[item.target_currency];
        if (countryCode) cleanRates[countryCode] = item.value;
      });
    } else {
      console.error("Respuesta inesperada de dLocal:", data);
      return res.status(500).json({ error: "Formato inesperado de dLocal (no es array)" });
    }

    res.status(200).json(cleanRates);

  } catch (error) {
    console.error("Error Crítico:", error);
    res.status(500).json({ error: `Fallo interno del código: ${error.message}` });
  }
}