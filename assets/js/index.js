import { createAuth0Client } from 'https://cdn.jsdelivr.net/npm/@auth0/auth0-spa-js@2.0.4/+esm';

async function main() {
  const auth0 = await createAuth0Client({
    domain: "dev-1of24kih8koq07ek.us.auth0.com",
    client_id: "OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  });

  if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  const isAuthenticated = await auth0.isAuthenticated();

  if (!isAuthenticated) {
    await auth0.loginWithRedirect({
      appState: { targetUrl: window.location.pathname }
    });
    return; // ✅ ici c’est ok car on est dans une fonction
  }

  const user = await auth0.getUser();
  console.log("✅ Connecté :", user);

  // 🟢 Chargement des données uniquement si connecté
  document.addEventListener("DOMContentLoaded", () => {
    fetch("https://airtable-all-table2.samueltoledano94.workers.dev")
      .then(res => res.json())
      .then(data => {
        sessionStorage.setItem('tags', JSON.stringify(data.Tag));
        sessionStorage.setItem('places', JSON.stringify(data.Lieu));
        sessionStorage.setItem('tour', JSON.stringify(data.Tour));
        sessionStorage.setItem('themetour', JSON.stringify(data.ThemeTour));
        sessionStorage.setItem('quartiers', JSON.stringify(data.Quartier));
        sessionStorage.setItem('gastro', JSON.stringify(data.Gastro));
        sessionStorage.setItem('brands', JSON.stringify(data.Brands));
        sessionStorage.setItem('around', JSON.stringify(data.Around));
        sessionStorage.setItem('street', JSON.stringify(data.Street));
        sessionStorage.setItem('parametre', JSON.stringify(data.Parametre));

        // Retire le GIF
        document.getElementById("loadingOverlay")?.remove();
        document.body.style.pointerEvents = "auto";
      })
      .catch(err => {
        console.error("❌ Erreur de chargement :", err);
      });
  });
}

main(); // 🟢 Lance le tout
