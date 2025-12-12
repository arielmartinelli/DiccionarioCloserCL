export default async function handler(req, res) {
  // --- CONFIGURACIÓN ---
  
  // 1. Entorno: false para PRODUCCIÓN (Claves reales)
  const IS_SANDBOX = false; 

  // 2. OBTENCIÓN DE CLAVES
  // Opción A (Recomendada): Leer desde Vercel
  const API_KEY = process.env.DLOCAL_API_KEY;
  const SECRET_KEY = process.env.DLOCAL_SECRET_KEY;

  // Opción B (Solo para pruebas de emergencia): Descomenta estas lineas si Vercel falla
  // const API_KEY = "hUDHkiMNhnrEbisqnfdJFNxluOPZVQdV";
  // const SECRET_KEY = "FGibNWnBrdfVr4HR13lgkYrXEm9DMHVY8kn62zGU";

  if (!API_KEY || !SECRET_KEY) {
    return res.status(500).json({ error: 'Faltan las API Keys en Vercel.' });
  }

  // ---------------------

  const endpoint = IS_SANDBOX 
    ? 'https://api-sbx.dlocalgo.com/v1/currency-exchanges'
    : 'https://api.dlocalgo.com/v1/currency-exchanges';

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
    
    // Mapeo para el frontend
    const cleanRates = {};
    const currencyMap = {
      'ARS': 'AR', 'MXN': 'MX', 'COP': 'CO', 'CLP': 'CL',
      'PEN': 'PE', 'CRC': 'CR', 'UYU': 'UY', 'VES': 'VE',
      'BOB': 'BO', 'PYG': 'PY', 'USD': 'US', 'EUR': 'ES'
    };

    data.forEach(item => {
      const countryCode = currencyMap[item.target_currency];
      if (countryCode) cleanRates[countryCode] = item.value;
    });

    res.status(200).json(cleanRates);

  } catch (error) {
    console.error("Error Crítico:", error);
    res.status(500).json({ error: `Fallo interno: ${error.message}` });
  }
}