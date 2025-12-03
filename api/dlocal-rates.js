export default async function handler(req, res) {
  // Leemos las claves
  const API_KEY = process.env.DLOCAL_API_KEY;
  const SECRET_KEY = process.env.DLOCAL_SECRET_KEY;

  // DIAGNÓSTICO: Verificar qué clave falta (sin mostrarla por seguridad)
  if (!API_KEY || !SECRET_KEY) {
    const missing = [];
    if (!API_KEY) missing.push("DLOCAL_API_KEY");
    if (!SECRET_KEY) missing.push("DLOCAL_SECRET_KEY");
    
    return res.status(500).json({ 
      error: `Faltan configurar variables en Vercel: ${missing.join(', ')}. No olvides hacer REDEPLOY.` 
    });
  }

  // Si llegamos aquí, las claves existen. Intentamos conectar.
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
      // Si dLocal responde error, lo mostramos
      throw new Error(`dLocal rechazó la conexión (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // Limpieza de datos
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
    console.error("Error Backend:", error);
    res.status(500).json({ error: error.message });
  }
}