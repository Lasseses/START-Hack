export async function POST(request) {
  try {
    const { query } = await request.json();

    // Sicherstellen, dass die Tiles immer existieren
    const mockResponse = getMockTiles(query) || [{ name: "Keine Daten", data: [] }];

    // Netzwerklatenz simulieren
    await new Promise(resolve => setTimeout(resolve, 1000));

    return Response.json({ tiles: mockResponse });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function getMockTiles(query) {
  const lowerQuery = query?.toLowerCase() || "";

  if (lowerQuery.includes("aktienkurs") || lowerQuery.includes("stock")) {
    return getStockDashboard();
  } else if (lowerQuery.includes("vertrieb") || lowerQuery.includes("sales")) {
    return getSalesDashboard();
  } else if (lowerQuery.includes("finanzen") || lowerQuery.includes("finance")) {
    return getFinanceDashboard();
  } else if (lowerQuery.includes("leistung") || lowerQuery.includes("performance")) {
    return getPerformanceDashboard();
  } else {
    return getDefaultDashboard();
  }
}

function getStockDashboard() {
  return [
    {
      type: "candlestick",
      title: "Aktienkurs",
      data: generateCandlestickData(12),
      metadata: {
        fullWidth: true,
        description: "Historische Aktienkurse"
      }
    }
  ];
}

function getSalesDashboard() {
  return [
    {
      type: "bar",
      title: "Vertrieb",
      data: generateBarData(12, true),
      metadata: {
        fullWidth: true,
        description: "Vertriebszahlen"
      }
    }
  ];
}

function getFinanceDashboard() {
  return [
    {
      type: "pie",
      title: "Finanzen",
      data: generatePieData(5),
      metadata: {
        description: "Finanzielle Verteilung"
      }
    }
  ];
}

function getPerformanceDashboard() {
  return [
    {
      type: "area",
      title: "Leistung",
      data: generateAreaData(12, 2),
      metadata: {
        description: "Leistungskennzahlen"
      }
    }
  ];
}

function getDefaultDashboard() {
  return [
    {
      type: "candlestick",
      title: "Übersicht",
      data: generateCandlestickData(12),
      metadata: {
        fullWidth: true,
        description: "Allgemeine Übersicht der wichtigsten Metriken"
      }
    },
    {
      type: "area",
      title: "Area",
      data: generateAreaData(6),
      metadata: {
        description: "Vergleich wichtiger Kategorien"
      }
    },
    {
      type: "pie",
      title: "Verteilung",
      data: generatePieData(5),
      metadata: {
        description: "Prozentuale Verteilung nach Kategorie"
      }
    },
    {
      type: "table",
      title: "Details",
      data: generateTableData(5),
      metadata: {
        description: "Detaillierte Informationen"
      }
    }
  ];
}

function generateCandlestickData(count) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - count);

  const basePrice = 100;
  const data = [];

  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const open = basePrice + Math.random() * 10 - 5;
    const close = open + Math.random() * 6 - 3;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = Math.floor(Math.random() * 10000) + 5000;

    data.push({
      x: date.toISOString(), // ISO-Datum für X-Achse
      y: [open, high, low, close], // Werte als Array
      volume, // Volumen
    });
  }

  return data;
}

function generateAreaData(count, seriesCount = 1) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - count);

  const series = [];

  for (let s = 0; s < seriesCount; s++) {
    const baseValue = 100 + s * 50;
    const seriesData = [];

    for (let i = 0; i < count; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      seriesData.push({
        x: date.getTime(), // Timestamp für die x-Achse (Datum)
        y: baseValue + Math.random() * 30 - 15 + i * 2, // Wert
      });
    }

    series.push({
      name: `Serie ${s + 1}`,
      data: seriesData,
    });
  }

  return series;
}

function generatePieData(count) {
  const labels = [
    "Kategorie A",
    "Kategorie B",
    "Kategorie C",
    "Kategorie D",
    "Kategorie E",
    "Kategorie F",
    "Kategorie G",
    "Kategorie H",
  ];
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#8CD867",
    "#EA526F",
  ];

  const values = [];
  let remainingTotal = 100;

  for (let i = 0; i < count - 1; i++) {
    const value = Math.floor(Math.random() * (remainingTotal - (count - i - 1))) + 1;
    remainingTotal -= value;
    values.push(value);
  }
  values.push(remainingTotal);

  return {
    series: values, // Direktes Array der Werte
    labels: labels.slice(0, count),
    colors: colors.slice(0, count),
  };
}

function generateBarData(count, includeNegative = false) {
  const labels = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const sectors = ["Technologie", "Finanzen", "Gesundheit", "Konsum", "Industrie", "Energie", "Rohstoffe", "Kommunikation"];

  const selectedLabels =
    count > 12
      ? labels.concat(labels).slice(0, count)
      : count <= 8 && sectors.length >= count
      ? sectors.slice(0, count)
      : labels.slice(0, count);

  const data = selectedLabels.map(() => {
    let value = Math.random() * 100 + 20;
    if (includeNegative && Math.random() > 0.7) {
      value = -value * 0.5;
    }
    return parseFloat(value.toFixed(2));
  });

  return [
    {
      name: "Wert",
      data,
    },
  ];
}

function generateTableData(count) {
  const data = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const open = 100 + Math.random() * 10 - 5;
    const close = open + Math.random() * 6 - 3;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = Math.floor(Math.random() * 10000) + 5000;

    data.push({
      date: date.toISOString(),
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return data;
}
