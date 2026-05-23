// Pre-computed demo result for AAPL - instant value proof without API call
export const DEMO_RESULT = {
  ticker: "AAPL",
  snapshot: {
    name: "Apple Inc.",
    price: 198.45,
    change_pct: 1.23,
    sector: "Technology",
  },
  decision: "HOLD — Apple shows strong fundamentals with $383B cash reserves and stable iPhone demand. However, current P/E of 31x suggests limited upside at these levels. Wait for pullback to $185-190 range for better entry, or hold existing positions.",
  analyst_reports: {
    market: "Price action shows consolidation between $195-$200 with RSI at 55 (neutral). Volume declining suggests accumulation phase. Key support at $190, resistance at $205.",
    news: "Mixed sentiment: positive on Vision Pro enterprise adoption, cautious on China sales decline (-8% YoY). EU DMA compliance costs estimated at $500M/year.",
    fundamentals: "TTM revenue $385B (+2% YoY), net margin 25.3%. Services segment growing 14% YoY now represents 22% of revenue. Strong FCF of $99B supports continued buybacks.",
    risk: "Concentration risk: iPhone still 52% of revenue. China exposure (~18% of sales) creates geopolitical risk. Valuation premium vs peers (MSFT 34x, GOOGL 25x) limits margin of safety.",
  },
  news: [
    {
      title: "Apple Vision Pro sees strong enterprise adoption in healthcare, manufacturing",
      source: "Bloomberg",
      published_at: "2 hours ago",
      url: "#",
    },
    {
      title: "iPhone 16 production ramping up ahead of September launch",
      source: "Reuters",
      published_at: "5 hours ago",
      url: "#",
    },
    {
      title: "Apple Services revenue hits record $24B in Q2",
      source: "CNBC",
      published_at: "1 day ago",
      url: "#",
    },
    {
      title: "EU fines Apple €1.8B over App Store policies",
      source: "Financial Times",
      published_at: "2 days ago",
      url: "#",
    },
  ],
};

export const DEMO_LABELS = {
  sr: {
    eyebrow: "Uživo demo",
    title: "Pogledajte kako izgleda analiza",
    subtitle: "Ovo je primer stvarne analize — bez API poziva, instant rezultat.",
    decisionLabel: "Signal",
    newsLabel: "Relevantne vesti",
    analystsLabel: "Analiza po agentima",
    cta: "Pokrenite sopstvenu analizu",
    agents: {
      market: "Tržište",
      news: "Vesti",
      fundamentals: "Fundamentali",
      risk: "Rizik",
    },
  },
  es: {
    eyebrow: "Demo en vivo",
    title: "Vea cómo se ve un análisis",
    subtitle: "Este es un ejemplo de análisis real — sin llamada API, resultado instantáneo.",
    decisionLabel: "Señal",
    newsLabel: "Noticias relevantes",
    analystsLabel: "Análisis por agentes",
    cta: "Ejecuta tu propio análisis",
    agents: {
      market: "Mercado",
      news: "Noticias",
      fundamentals: "Fundamentos",
      risk: "Riesgo",
    },
  },
  en: {
    eyebrow: "Live demo",
    title: "See what an analysis looks like",
    subtitle: "This is a real analysis example — no API call, instant result.",
    decisionLabel: "Signal",
    newsLabel: "Relevant news",
    analystsLabel: "Analysis by agents",
    cta: "Run your own analysis",
    agents: {
      market: "Market",
      news: "News",
      fundamentals: "Fundamentals",
      risk: "Risk",
    },
  },
};
