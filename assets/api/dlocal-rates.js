export default async function handler(req, res) {
  // 1. Configuración (Estos valores vendrán de las variables de entorno de Vercel)
  // IMPORTANTE: No escribas las claves reales aquí, usa process.env
  const DLOCAL_ENDPOINT = 'https://api.dlocalgo.com/v1/exchange-rates'; // ⚠️ Chequear URL exacta en doc de dLocal
  const API_LOGIN = process.env.DLOCAL_LOGIN;
  const API_KEY = process.env.DLOCAL_KEY;

  try {
    // 2. Llamada a dLocal
    const response = await fetch(DLOCAL_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Login': FIGiDdGPrpgcKoLKBJBkwRDSzxpOpecZ,
        'X-Trans-Key': Cov4TVofZc0CYbShMw4QSjlR7e33HzIbCXcP5x9G
        // Chequea si dLocal pide 'Authorization: Bearer' o headers X-Login
      }
    });

    if (!response.ok) {
      throw new Error(`Error dLocal: ${response.statusText}`);
    }

    const data = await response.json();

    // 3. Limpieza de Datos (Adapter)
    // dLocal te devolverá un JSON complejo. Aquí lo simplificamos para tu web.
    // Supongamos que dLocal devuelve: { rates: [ { currency: 'MXN', rate: 20.5 }, ... ] }
    // Nosotros queremos devolver: { "MX": 20.5, "AR": 1200 }
    
    // ⚠️ ESTA PARTE DEPENDE DE CÓMO SE VEA EL JSON DE DLOCAL:
    const rates = {};
    
    // Ejemplo de mapeo (ajustar según respuesta real):
    // data.rates.forEach(item => {
    //   if(item.currency === 'MXN') rates.MX = item.ask; // o item.mid
    //   if(item.currency === 'ARS') rates.AR = item.ask;
    // });

    // Por ahora, devolvemos un mock si no hay conexión real para que no rompa
    const cleanRates = {
        "MX": 20.50, // Reemplazar con datos reales
        "AR": 1210,
        // ...
    };

    // 4. Respuesta a tu web
    res.status(200).json(cleanRates);

  } catch (error) {
    console.error(error);
    // En caso de error, devolvemos un status 500
    res.status(500).json({ error: 'Error obteniendo tasas' });
  }
}