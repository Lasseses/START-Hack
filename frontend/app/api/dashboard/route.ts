export async function POST(request) {
    try {
      const { query } = await request.json();
      
      // Hier die Verbindung zu deinem tatsächlichen Backend herstellen
      // Dies ist nur ein Beispiel, wie die Struktur aussehen könnte
      const response = await fetch('https://dein-backend.de/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Backend-Fehler');
      }
      
      const data = await response.json();
      
      return Response.json({ tiles: data.tiles });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }