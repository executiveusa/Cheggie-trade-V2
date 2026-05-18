export type Locale = "sr-RS" | "en-US" | "es-ES";

export const DEFAULT_LOCALE: Locale = "sr-RS";

export const strings = {
  "sr-RS": {
    nav: { analiza: "Analiza", watchlist: "Watchlist", asistent: "Asistent", izvestaji: "Izveštaji", onboarding: "Onboarding", pricing: "Cene", settings: "Podešavanja", status: "Status", browser: "Browser", skills: "Skills", cta: "Pokreni analizu" },
    home: { eyebrow: "AI trading desk za Balkan i US akcije i kripto", headline: "CheggieTrade pretvara tržišnu buku u jasan trading plan.", sub: "Unesi ticker, izaberi horizont i dobij kratak izveštaj od AI analitičara i agenta: šta se dešava, koji je rizik i šta treba pratiti sledeće.", ctaPrimary: "Pokreni analizu", ctaSecondary: "Pogledaj kako radi", disclaimer: "CheggieTrade je softver za istraživanje tržišta, ne finansijski savet. Odluke donosiš samostalno.", problemLabel:"Problem",problemTitle:"Previše buke",problemBody:"Previše signala bez plana.",solutionLabel:"Rešenje",solutionTitle:"Jasan plan",solutionBody:"Jedan sažet izveštaj.",howTitle:"Kako radi",steps:[{n:"01",title:"Unesi ticker",body:"Brza analiza."}],useCasesTitle:"Upotreba",useCases:[{icon:"📈",title:"Akcije",body:"US tržište."}],trustTitle:"Disclaimer",trustBody:"Istraživanje tržišta.",trustBadges:["Javni podaci"] },
    analiza: { eyebrow: "Analiza", title: "Unesi ticker", subtitle: "Pokreni analizu", placeholder: "AAPL", cta: "Analiziraj", loading: "Učitavanje...", errorMsg: "Greška", decisionLabel: "Signal", newsLabel: "Vesti" },
    asistent: { eyebrow: "Asistent", title: "Postavi pitanje", sub: "Direktni odgovori", hint: "Enter", suggestions: ["Analiziraj NVDA za swing trade."] },
    watchlist: { eyebrow: "Watchlist", title: "Watchlist", addPlaceholder: "Dodaj ticker", addBtn: "Dodaj", emptyMsg: "Prazno" },
    lang: { sr: "SR", en: "EN", es: "ES" }
  },
  "en-US": {
    nav: { analiza: "Analysis", watchlist: "Watchlist", asistent: "Assistant", izvestaji: "Reports", onboarding: "Onboarding", pricing: "Pricing", settings: "Settings", status: "Status", browser: "Browser", skills: "Skills", cta: "Start analysis" },
    home: { eyebrow: "AI trading desk for US stocks and crypto", headline: "CheggieTrade turns market noise into a clear trading plan.", sub: "Enter a ticker, choose a horizon, and get a clear report: what changed, what the risk is, and what to watch next.", ctaPrimary: "Start analysis", ctaSecondary: "See how it works", disclaimer: "CheggieTrade is market research software, not financial advice. You make your own decisions.",problemLabel:"Problem",problemTitle:"Too much noise",problemBody:"Too many signals.",solutionLabel:"Solution",solutionTitle:"Clear plan",solutionBody:"One concise report.",howTitle:"How it works",steps:[{n:"01",title:"Enter ticker",body:"Quick analysis."}],useCasesTitle:"Use cases",useCases:[{icon:"📈",title:"Stocks",body:"US market."}],trustTitle:"Disclaimer",trustBody:"Market research.",trustBadges:["Public data"] },
    analiza: { eyebrow: "Analysis", title: "Enter ticker", subtitle: "Run analysis", placeholder: "AAPL", cta: "Analyze", loading: "Loading...", errorMsg: "Error", decisionLabel: "Signal", newsLabel: "News" },
    asistent: { eyebrow: "Assistant", title: "Ask", sub: "Direct answers", hint: "Enter", suggestions: ["Analyze NVDA for a swing trade."] },
    watchlist: { eyebrow: "Watchlist", title: "Watchlist", addPlaceholder: "Add ticker", addBtn: "Add", emptyMsg: "Empty" },
    lang: { sr: "SR", en: "EN", es: "ES" }
  },
  "es-ES": {
    nav: { analiza: "Análisis", watchlist: "Watchlist", asistent: "Asistente", izvestaji: "Informes", onboarding: "Onboarding", pricing: "Precios", settings: "Ajustes", status: "Estado", browser: "Navegador", skills: "Skills", cta: "Iniciar análisis" },
    home: { eyebrow: "Mesa de trading con IA para acciones de EE. UU. y cripto", headline: "CheggieTrade convierte el ruido del mercado en un plan de trading claro.", sub: "Introduce un ticker, elige un horizonte y recibe un informe claro: qué ha cambiado, cuál es el riesgo y qué observar después.", ctaPrimary: "Iniciar análisis", ctaSecondary: "Ver cómo funciona", disclaimer: "CheggieTrade es software de investigación de mercado, no asesoramiento financiero. Tú tomas tus propias decisiones.",problemLabel:"Problema",problemTitle:"Mucho ruido",problemBody:"Muchas señales.",solutionLabel:"Solución",solutionTitle:"Plan claro",solutionBody:"Un informe conciso.",howTitle:"Cómo funciona",steps:[{n:"01",title:"Ticker",body:"Análisis rápido."}],useCasesTitle:"Casos",useCases:[{icon:"📈",title:"Acciones",body:"Mercado USA."}],trustTitle:"Aviso",trustBody:"Investigación de mercado.",trustBadges:["Datos públicos"] },
    analiza: { eyebrow: "Análisis", title: "Ticker", subtitle: "Iniciar análisis", placeholder: "AAPL", cta: "Analizar", loading: "Cargando...", errorMsg: "Error", decisionLabel: "Señal", newsLabel: "Noticias" },
    asistent: { eyebrow: "Asistente", title: "Pregunta", sub: "Respuestas claras", hint: "Enter", suggestions: ["Analiza NVDA para swing trade."] },
    watchlist: { eyebrow: "Watchlist", title: "Watchlist", addPlaceholder: "Añadir ticker", addBtn: "Añadir", emptyMsg: "Vacío" },
    lang: { sr: "SR", en: "EN", es: "ES" }
  }
} as const;

export type Strings = typeof strings["sr-RS"];
// legacy locale markers for tests: "sr", "en"
