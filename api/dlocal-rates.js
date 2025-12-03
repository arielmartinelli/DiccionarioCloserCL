export default async function handler(req, res) {
  // 1. Obtener claves de variables de entorno (Configuradas en Vercel)
  const API_KEY = process.env.DLOCAL_API_KEY;
  const SECRET_KEY = process.env.DLOCAL_SECRET_KEY;

  // Validación de seguridad
  if (!API_KEY || !SECRET_KEY) {
    return res.status(500).json({ error: 'Error de configuración: Faltan las API Keys en Vercel' });
  }

  // 2. Construir la autenticación Bearer
  // Formato dLocal Go: Bearer API_KEY:SECRET_KEY
  const authToken = `Bearer ${API_KEY}:${SECRET_KEY}`;
  const endpoint = 'https://api.dlocalgo.com/v1/currency-exchanges';

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      }
    });

    if (!response.ok) {
      throw new Error(`Error dLocal Go: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 3. Limpiar y organizar los datos para el Frontend
    const cleanRates = {};
    
    // Mapa para traducir códigos de moneda (MXN) a códigos de país (MX)
    const currencyMap = {
      'ARS': 'AR', 'MXN': 'MX', 'COP': 'CO', 'CLP': 'CL',
      'PEN': 'PE', 'CRC': 'CR', 'UYU': 'UY', 'VES': 'VE',
      'BOB': 'BO', 'PYG': 'PY', 'USD': 'US', 'EUR': 'ES'
    };

    // dLocal devuelve un array, lo convertimos a objeto fácil de usar
    data.forEach(item => {
      // item.target_currency es la moneda local
      const countryCode = currencyMap[item.target_currency];
      if (countryCode) {
        cleanRates[countryCode] = item.value;
      }
    });

    // Responder con JSON limpio
    res.status(200).json(cleanRates);

  } catch (error) {
    console.error("Fallo en backend:", error);
    res.status(500).json({ error: error.message });
  }
}