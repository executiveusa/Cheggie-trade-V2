export type Locale = "sr" | "en";

export const strings = {
  sr: {
    // Nav
    nav: {
      analiza:    "Analiza",
      watchlist:  "Watchlist",
      asistent:   "Asistent",
      izvestaji:  "Izveštaji",
      onboarding: "Onboarding",
      cta:        "Pokreni analizu",
    },
    // Homepage
    home: {
      eyebrow:   "AI trading desk za Balkan tržište",
      headline:  "CheggieTrade pretvara tržišnu buku u jasan trading plan.",
      sub:       "Više AI analitičara zajedno donosi odluke — vi dobijate signal, ne buku.",
      ctaPrimary: "Pokreni analizu",
      ctaSecondary: "Kako radi",
      // Problem → Solution
      problemLabel: "Problem",
      problemTitle: "Previše informacija, nema jasnog pravca.",
      problemBody:  "Tržišta su puna kontradiktornih signala. Analitičari se svađaju. Vest s Twittera poništava fundamentale. Vi stojite sa otvorenim brokerom i ne znate šta da radite.",
      solutionLabel: "Rešenje",
      solutionTitle: "Jedan jasan signal iz svih izvora.",
      solutionBody:  "CheggieTrade pokreće više AI analitičara simultano — svaki gleda drugu dimenziju tržišta. Zatim ih Risk Layer filtrira. Vi dobijate jednu rečenicu: kupuj, drži, ili prodaj.",
      // How it works
      howTitle: "Kako radi",
      steps: [
        { n: "01", title: "Unesi ticker",          body: "Ukucaj simbol dionice ili kripta." },
        { n: "02", title: "Izaberi strategiju",     body: "Konzervativna, umjerena ili agresivna." },
        { n: "03", title: "AI agenti analiziraju",  body: "Fundamentali, vesti, sentimentt — simultano." },
        { n: "04", title: "Risk layer proverava",   body: "Nezavisni sloj filtrira odluke." },
        { n: "05", title: "Dobijaš jasan signal",   body: "Kupuj, drži, ili prodaj — sa razlogom." },
      ],
      // Use cases
      useCasesTitle: "Za šta ga koristiti",
      useCases: [
        { icon: "📈", title: "US dionice",       body: "Analiza NYSE i NASDAQ kompanija." },
        { icon: "₿",  title: "Kripto",           body: "BTC, ETH i altcoins." },
        { icon: "👁",  title: "Watchlist",        body: "Praćenje pozicija u realnom vremenu." },
        { icon: "📋", title: "Automatski izveštaji", body: "Nedeljni i mesečni sažetci." },
      ],
      // Trust
      trustTitle: "Metodologija",
      trustBody:  "CheggieTrade nije finansijski savetnik. Analize se temelje na javno dostupnim podacima i statističkim modelima. Svaka odluka je vaša — koristite ovo kao alat za istraživanje, ne kao preporuku.",
      trustBadges: ["Javni podaci", "Nema ličnih preporuka", "Vaša odgovornost"],
    },
    // Analiza
    analiza: {
      eyebrow:  "Pokrenite analizu",
      title:    "Unesite ticker",
      subtitle: "Dionice, ETF-ovi, kripto — jedna analiza, jasan signal.",
      placeholder: "AAPL, NVDA, BTC-USD…",
      cta: "Analiziraj",
      loading: "Analiza u toku…",
      errorMsg: "Analiza trenutno nije dostupna.",
      decisionLabel: "Signal",
      newsLabel: "Relevantne vesti",
    },
    // Asistent
    asistent: {
      eyebrow: "Vaš trading asistent",
      title:   "Postavite pitanje.",
      sub:     "Direktni odgovori. Bez žargona.",
      hint:    "Enter za slanje",
      suggestions: [
        "Koji sektor je najjači ovog meseca?",
        "Kako da čitam earnings izveštaj?",
        "Šta je stop-loss i kada ga koristim?",
        "Koja je razlika između P/E i P/S?",
      ],
    },
    // Watchlist
    watchlist: {
      eyebrow: "Vaše pozicije",
      title:   "Watchlist",
      addPlaceholder: "Dodaj ticker…",
      addBtn: "Dodaj",
      emptyMsg: "Watchlist je prazan.",
    },
    // Onboarding
    onboarding: {
      eyebrow: "Kako funkcioniše",
      title:   "Od buke do jasnog plana.",
      sub:     "CheggieTrade analizira tržište umesto vas.",
      cta:     "Pokreni prvu analizu",
      ctaSec:  "Razgovarajte s asistentom",
    },
    theme: { dark: "Tamna", light: "Svetla" },
    lang:  { sr: "SR", en: "EN" },
  },

  en: {
    nav: {
      analiza:    "Analysis",
      watchlist:  "Watchlist",
      asistent:   "Assistant",
      izvestaji:  "Reports",
      onboarding: "Get started",
      cta:        "Run analysis",
    },
    home: {
      eyebrow:    "AI trading desk for the Balkans market",
      headline:   "CheggieTrade turns market noise into a clear trading plan.",
      sub:        "Multiple AI analysts work together — you get signal, not noise.",
      ctaPrimary: "Run analysis",
      ctaSecondary: "How it works",
      problemLabel: "Problem",
      problemTitle: "Too much information, no clear direction.",
      problemBody:  "Markets are full of contradictory signals. Analysts disagree. A tweet cancels out fundamentals. You're staring at an open broker and don't know what to do.",
      solutionLabel: "Solution",
      solutionTitle: "One clear signal from all sources.",
      solutionBody:  "CheggieTrade runs multiple AI analysts simultaneously — each examining a different market dimension. Then a Risk Layer filters them. You get one sentence: buy, hold, or sell.",
      howTitle: "How it works",
      steps: [
        { n: "01", title: "Enter ticker",        body: "Type a stock or crypto symbol." },
        { n: "02", title: "Choose strategy",     body: "Conservative, moderate, or aggressive." },
        { n: "03", title: "AI agents analyse",   body: "Fundamentals, news, sentiment — simultaneously." },
        { n: "04", title: "Risk layer checks",   body: "An independent layer filters decisions." },
        { n: "05", title: "You get a clear signal", body: "Buy, hold, or sell — with reasoning." },
      ],
      useCasesTitle: "Use cases",
      useCases: [
        { icon: "📈", title: "US stocks",       body: "NYSE and NASDAQ company analysis." },
        { icon: "₿",  title: "Crypto",          body: "BTC, ETH and altcoins." },
        { icon: "👁",  title: "Watchlist",       body: "Monitor positions in real time." },
        { icon: "📋", title: "Auto reports",    body: "Weekly and monthly summaries." },
      ],
      trustTitle: "Methodology",
      trustBody:  "CheggieTrade is not a financial advisor. Analyses are based on publicly available data and statistical models. Every decision is yours — use this as a research tool, not a recommendation.",
      trustBadges: ["Public data", "No personal recommendations", "Your responsibility"],
    },
    analiza: {
      eyebrow: "Run analysis",
      title:   "Enter ticker",
      subtitle: "Stocks, ETFs, crypto — one analysis, one clear signal.",
      placeholder: "AAPL, NVDA, BTC-USD…",
      cta: "Analyse",
      loading: "Analysis in progress…",
      errorMsg: "Analysis temporarily unavailable.",
      decisionLabel: "Signal",
      newsLabel: "Relevant news",
    },
    asistent: {
      eyebrow: "Your trading assistant",
      title:   "Ask a question.",
      sub:     "Direct answers. No jargon.",
      hint:    "Enter to send",
      suggestions: [
        "Which sector is strongest this month?",
        "How do I read an earnings report?",
        "What is a stop-loss and when do I use it?",
        "What's the difference between P/E and P/S?",
      ],
    },
    watchlist: {
      eyebrow: "Your positions",
      title:   "Watchlist",
      addPlaceholder: "Add ticker…",
      addBtn: "Add",
      emptyMsg: "Watchlist is empty.",
    },
    onboarding: {
      eyebrow: "How it works",
      title:   "From noise to a clear plan.",
      sub:     "CheggieTrade analyses the market for you.",
      cta:     "Run your first analysis",
      ctaSec:  "Talk to the assistant",
    },
    theme: { dark: "Dark", light: "Light" },
    lang:  { sr: "SR", en: "EN" },
  },
} as const;

export type Strings = typeof strings["sr"];
