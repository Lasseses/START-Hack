export async function POST(request) {
    try {
      const { query } = await request.json();
      
      // Mock response based on query
      // In a real implementation, you would connect to your backend here
      const mockResponse = getMockTiles(query);
      
      // Simulate network delay for testing loading states
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return Response.json({ tiles: mockResponse });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  
  function getMockTiles(query) {
    // Simple query matching to return different mock data sets
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("aktienkurs") || lowerQuery.includes("stock")) {
      return getStockDashboard();
    } else if (lowerQuery.includes("vertrieb") || lowerQuery.includes("sales")) {
      return getSalesDashboard();
    } else if (lowerQuery.includes("finanzen") || lowerQuery.includes("finance")) {
      return getFinanceDashboard();
    } else if (lowerQuery.includes("leistung") || lowerQuery.includes("performance")) {
      return getPerformanceDashboard();
    } else {
      // Default dashboard
      return getDefaultDashboard();
    }
  }
  
  function getStockDashboard() {
    return [
      {
        type: "table",
        title: "Aktienkursverlauf",
        data: generateCandlestickData(30), // liefert Objekte im Format { date, open, high, low, close, volume }
        metadata: {
          fullWidth: true,
          description: "Täglicher Kursverlauf der letzten 30 Tage"
        }
      },
      {
        type: "area",
        title: "Handelsvolumen",
        data: generateAreaData(30),
        metadata: {
          description: "Handelsvolumen im Zeitverlauf"
        }
      },
      {
        type: "bar",
        title: "Performance nach Sektor",
        data: generateBarData(8),
        metadata: {
          description: "Vergleich der Performance nach Wirtschaftssektor"
        }
      }
    ];
  }
  
  
  function getSalesDashboard() {
    return [
      {
        type: "area",
        title: "Umsatzentwicklung",
        data: generateAreaData(12),
        metadata: {
          description: "Monatliche Umsatzentwicklung im Jahresverlauf"
        }
      },
      {
        type: "pie",
        title: "Vertriebskanäle",
        data: generatePieData(5),
        metadata: {
          description: "Umsatzverteilung nach Vertriebskanal"
        }
      },
      {
        type: "bar",
        title: "Top 5 Produkte",
        data: generateBarData(5),
        metadata: {
          description: "Die fünf umsatzstärksten Produkte"
        }
      },
      {
        type: "table",
        title: "Verkaufsübersicht",
        data: generateTableData(10),
        metadata: {
          description: "Detaillierte Ansicht der letzten Verkäufe"
        }
      }
    ];
  }
  
  function getFinanceDashboard() {
    return [
      {
        type: "area",
        title: "Cashflow",
        data: generateAreaData(24),
        metadata: {
          fullWidth: true,
          description: "Cashflow-Entwicklung der letzten 2 Jahre"
        }
      },
      {
        type: "pie",
        title: "Kostenverteilung",
        data: generatePieData(6),
        metadata: {
          description: "Aufteilung der Betriebskosten"
        }
      },
      {
        type: "bar",
        title: "Gewinn und Verlust",
        data: generateBarData(4, true),
        metadata: {
          description: "Quartalsweise Gewinn- und Verlustrechnung"
        }
      },
      {
        type: "table",
        title: "Finanzübersicht",
        data: generateTableData(8, true),
        metadata: {
          description: "Wichtige Finanzkennzahlen im Überblick"
        }
      }
    ];
  }
  
  function getPerformanceDashboard() {
    return [
      {
        type: "bar",
        title: "KPI-Übersicht",
        data: generateBarData(6),
        metadata: {
          fullWidth: true,
          description: "Übersicht der wichtigsten Leistungsindikatoren"
        }
      },
      {
        type: "area",
        title: "Trendverlauf",
        data: generateAreaData(20, 3),
        metadata: {
          description: "Trendverlauf wichtiger Metriken"
        }
      },
      {
        type: "pie",
        title: "Erfolgsverteilung",
        data: generatePieData(4),
        metadata: {
          description: "Verteilung des Erfolgs nach Kategorie"
        }
      }
    ];
  }
  
  function getDefaultDashboard() {
    return [
      {
        type: "area",
        title: "Übersicht",
        data: generateAreaData(12, 2),
        metadata: {
          fullWidth: true,
          description: "Allgemeine Übersicht der wichtigsten Metriken"
        }
      },
      {
        type: "bar",
        title: "Vergleich",
        data: generateBarData(6),
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
  
  // Helper functions to generate mock data
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
        date: date.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
        volume
      });
    }
    
    return data;
  }
  
  function generateAreaData(count, seriesCount = 1) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - count);
    
    const series = [];
    
    for (let s = 0; s < seriesCount; s++) {
      const baseValue = 100 + (s * 50);
      const seriesData = [];
      
      for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        seriesData.push({
          date: date.toISOString().split('T')[0],
          value: baseValue + Math.random() * 30 - 15 + (i * 2)
        });
      }
      
      series.push({
        name: `Serie ${s + 1}`,
        data: seriesData
      });
    }
    
    return series;
  }
  
  function generatePieData(count) {
    const labels = ["Kategorie A", "Kategorie B", "Kategorie C", "Kategorie D", "Kategorie E", "Kategorie F", "Kategorie G", "Kategorie H"];
    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#8CD867", "#EA526F"];
    
    // Creating an array of values directly (instead of the complex object structure from before)
    const values = [];
    let remainingTotal = 100;
    
    for (let i = 0; i < count - 1; i++) {
      const value = Math.floor(Math.random() * (remainingTotal - (count - i - 1))) + 1;
      remainingTotal -= value;
      values.push(value * 100); // Multiply by 100 to get actual values instead of percentages
    }
    
    // Add the last item with remaining percentage
    values.push(remainingTotal * 100);
    
    return {
      series: values,
      labels: labels.slice(0, count),
      colors: colors.slice(0, count)
    };
  }
  
  function generateBarData(count, includeNegative = false) {
    const labels = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    const sectors = ["Technologie", "Finanzen", "Gesundheit", "Konsum", "Industrie", "Energie", "Rohstoffe", "Kommunikation"];
    
    const selectedLabels = count > 12 ? labels.concat(labels).slice(0, count) : 
                          (count <= 8 && sectors.length >= count) ? sectors.slice(0, count) : labels.slice(0, count);
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
      let value = Math.random() * 100 + 20;
      
      if (includeNegative && Math.random() > 0.7) {
        value = -value * 0.5;
      }
      
      data.push({
        label: selectedLabels[i],
        value: parseFloat(value.toFixed(2)) 
      });
    }
    
    return data;
  }
  
  function generateTableData(count, isFinance = false) {
    const data = [];
    const now = new Date();
    
    if (isFinance) {
      // Finanzielle Tabellendaten
      const metrics = ["Umsatz", "Betriebskosten", "Gewinn", "Eigenkapital", "Verbindlichkeiten", "Cashflow", "ROI", "EBITDA"];
      
      for (let i = 0; i < Math.min(count, metrics.length); i++) {
        data.push({
          metrik: metrics[i],
          aktuell: formatCurrency(Math.random() * 1000000 + 100000),
          vorjahr: formatCurrency(Math.random() * 900000 + 100000),
          veraenderung: `${(Math.random() * 20 - 5).toFixed(2)}%`
        });
      }
    } else {
      // Allgemeine Tabellendaten
      for (let i = 0; i < count; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        data.push({
          id: `A${1000 + i}`,
          datum: date.toISOString().split('T')[0],
          name: `Eintrag ${i + 1}`,
          wert: formatCurrency(Math.random() * 10000 + 1000),
          status: ["Aktiv", "Inaktiv", "Ausstehend"][Math.floor(Math.random() * 3)]
        });
      }
    }
    
    return data;
  }
  
  function formatCurrency(value) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  }