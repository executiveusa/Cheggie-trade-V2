export const homepageCopy = {
  headline: "CheggieTrade pretvara tržišnu buku u jasan trading plan.",
  cta: "Pokreni analizu",
  nav: ["Analiza", "Izveštaji", "Watchlist", "Asistent", "Onboarding"],
};

export function Homepage() {
  return `
  <main class="editorial-shell typography whitespace asymmetric">
    <header class="nav-asymmetric">${homepageCopy.nav.join(" | ")}</header>
    <h1 class="display-strong">${homepageCopy.headline}</h1>
    <button class="cta-primary">${homepageCopy.cta}</button>
  </main>
  `;
}
