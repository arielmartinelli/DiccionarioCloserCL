export default async function handler(req, res) {
  // --- TUS CLAVES (Hardcoded para asegurar que las lee) ---
  const API_KEY = "hUDHkiMNhnrEbisqnfdJFNxluOPZVQdV";
  const SECRET_KEY = "FGibNWnBrdfVr4HR13lgkYrXEm9DMHVY8kn62zGU";

  // Endpoints
  const URL_LIVE = 'https://api.dlocalgo.com/v1/currency-exchanges';
  const URL_SBX = 'https://api-sbx.dlocalgo.com/v1/currency-exchanges';

  // Función auxiliar para conectar
  async function tryConnect(url) {
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY.trim()}:${SECRET_KEY.trim()}`
      }
    });
  }

  try {
    // 1. INTENTO PRINCIPAL: MODO LIVE (Producción)
    let response = await tryConnect(URL_LIVE);

    // 2. AUTO-CORRECCIÓN: Si Live nos rechaza (403), probamos Sandbox automáticamente
    if (response.status === 403 || response.status === 401) {
      console.log("Credenciales rechazadas en Live. Intentando Sandbox...");
      const responseSbx = await tryConnect(URL_SBX);
      
      // Si Sandbox funciona, usamos esa respuesta en su lugar
      if (responseSbx.ok) {
        response = responseSbx;
      }
    }

    // 3. Si sigue fallando después de probar ambos
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Las credenciales fueron rechazadas en AMBOS entornos (Live y Sandbox). dLocal dice: ${errorText}` 
      });
    }

    // 4. ÉXITO: Procesar datos
    const data = await response.json();
    
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
    } else {
      return res.status(500).json({ error: "Formato de respuesta desconocido." });
    }

    res.status(200).json(cleanRates);

  } catch (error) {
    console.error("Error Crítico:", error);
    res.status(500).json({ error: `Fallo interno del servidor: ${error.message}` });
  }
}