export default async function handler(req, res) {
  // --- CONFIGURACIÓN ---
  
  // 1. Entorno: false para PRODUCCIÓN (Claves reales)
  const IS_SANDBOX = false; 

  // 2. LLAVES SEGURAS (Variables de Entorno)
  // Las lee desde la configuración de Vercel. NO están visibles en el código.
  // Asegúrate de haber agregado DLOCAL_API_KEY y DLOCAL_SECRET_KEY en Vercel.
  const API_KEY = process.env.DLOCAL_API_KEY;
  const SECRET_KEY = process.env.DLOCAL_SECRET_KEY;

  // Validación de seguridad: Si Vercel no tiene las claves, avisamos al log pero no mostramos nada sensible.
  if (!API_KEY || !SECRET_KEY) {
    console.error("Error: Faltan las variables de entorno DLOCAL_API_KEY o DLOCAL_SECRET_KEY.");
    return res.status(500).json({ error: 'Error de configuración del servidor (Faltan credenciales).' });
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
      console.error("Error dLocal:", errorText); // Para ver en logs de Vercel
      return res.status(response.status).json({ 
        error: `dLocal respondió error (${response.status}): ${errorText}` 
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

    // Validamos que sea un array antes de iterar
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
    res.status(500).json({ error: `Fallo interno: ${error.message}` });
  }
}