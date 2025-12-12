export default async function handler(req, res) {
  // --- CONFIGURACIÓN A PRUEBA DE FALLOS ---

  // Lista de todas las credenciales que has compartido.
  // El código probará una por una hasta que alguna funcione.
  const CREDENTIALS_LIST = [
    {
      name: "Set Actual (hUDH...)",
      apiKey: "hUDHkiMNhnrEbisqnfdJFNxluOPZVQdV",
      secretKey: "FGibNWnBrdfVr4HR13lgkYrXEm9DMHVY8kn62zGU"
    },
    {
      name: "Set Anterior (FIGi...)", 
      apiKey: "FIGiDdGPrpgcKoLKBJBkwRDSzxpOpecZ",
      secretKey: "Cov4TVofZc0CYbShMw4QSjlR7e33HzIbCXcP5x9G"
    }
  ];

  const URL_LIVE = 'https://api.dlocalgo.com/v1/currency-exchanges';
  const URL_SBX = 'https://api-sbx.dlocalgo.com/v1/currency-exchanges';

  // Función auxiliar de conexión
  async function tryRequest(url, key, secret) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}:${secret.trim()}`
        }
      });
      return res;
    } catch (e) {
      return null; // Error de red
    }
  }

  // --- LÓGICA DE INTENTOS MÚLTIPLES ---
  
  let successResponse = null;
  let lastError = "";

  // 1. Recorremos cada par de llaves
  for (const cred of CREDENTIALS_LIST) {
    if (!cred.apiKey || !cred.secretKey) continue;

    console.log(`Probando credenciales: ${cred.name}...`);

    // 2. Intentamos Producción (Live)
    let res = await tryRequest(URL_LIVE, cred.apiKey, cred.secretKey);
    
    // Si falla por permisos (403/401), intentamos Sandbox
    if (res && (res.status === 403 || res.status === 401)) {
       console.log("  Rechazado en Live. Probando Sandbox...");
       res = await tryRequest(URL_SBX, cred.apiKey, cred.secretKey);
    }

    // 3. Si funcionó (Status 200), guardamos y salimos del bucle
    if (res && res.ok) {
      successResponse = res;
      console.log("  ¡CONEXIÓN EXITOSA!");
      break; 
    } else if (res) {
      const txt = await res.text();
      lastError = `Error ${res.status}: ${txt}`;
    }
  }

  // --- RESPUESTA FINAL ---

  if (!successResponse) {
    return res.status(500).json({ 
      error: `No se pudo conectar con ninguna llave. Último error: ${lastError}` 
    });
  }

  try {
    const data = await successResponse.json();
    
    // Mapeo de datos
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
      res.status(500).json({ error: "Formato de respuesta incorrecto de dLocal." });
    }

  } catch (error) {
    res.status(500).json({ error: `Error procesando datos: ${error.message}` });
  }
}