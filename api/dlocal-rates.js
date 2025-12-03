export default async function handler(req, res) {
  const API_KEY = process.env.DLOCAL_API_KEY;
  const SECRET_KEY = process.env.DLOCAL_SECRET_KEY;
  
  // VARIABLE NUEVA: Cambia a 'true' si tus llaves son de Sandbox
  const IS_SANDBOX = false; 

  if (!API_KEY || !SECRET_KEY) {
    return res.status(500).json({ error: 'Faltan las API Keys en Vercel' });
  }

  // Selección automática de URL según el modo
  const baseUrl = IS_SANDBOX 
    ? 'https://api-sbx.dlocalgo.com' 
    : 'https://api.dlocalgo.com';
    
  const endpoint = `${baseUrl}/v1/currency-exchanges`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}:${SECRET_KEY}`
      }
    });

    if (!response.ok) {
      // Capturamos el mensaje exacto de dLocal para depurar
      const errorText = await response.text(); 
      console.error("Error dLocal:", errorText);
      return res.status(response.status).json({ error: `dLocal respondió: ${response.status} - ${errorText}` });
    }

    const data = await response.json();
    
    // Mapeo de datos
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
    res.status(500).json({ error: error.message });
  }
}