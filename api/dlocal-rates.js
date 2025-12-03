export default async function handler(req, res) {
  // ⚠️ LLAVES HARDCODEADAS PARA PRUEBA DE CONEXIÓN
  // Si esto funciona, el problema era la configuración de Vercel.
  const API_KEY = "FIGiDdGPrpgcKoLKBJBkwRDSzxpOpecZ";
  const SECRET_KEY = "Cov4TVofZc0CYbShMw4QSjlR7e33HzIbCXcP5x9G";

  // URL de Producción (Live)
  const endpoint = 'https://api.dlocalgo.com/v1/currency-exchanges';

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}:${SECRET_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Si dLocal responde error, lo enviamos al frontend para verlo
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

    data.forEach(item => {
      const countryCode = currencyMap[item.target_currency];
      if (countryCode) cleanRates[countryCode] = item.value;
    });

    // ÉXITO
    res.status(200).json(cleanRates);

  } catch (error) {
    // Si falla el código en sí (ej. fetch no existe en versiones viejas de Node)
    console.error("Error Crítico:", error);
    res.status(500).json({ error: `Fallo interno del código: ${error.message}` });
  }
}