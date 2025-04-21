// Fichier : assets/js/index.js
// Doit être appelé via <script type="module" src="assets/js/index.js"></script>

import { createAuth0Client } from 'https://cdn.jsdelivr.net/npm/@auth0/auth0-spa-js@2.0.4/+esm';

try {
  const auth0 = await createAuth0Client({
    domain: "weelicity.auth0.com",
    client_id: "OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  });

  // Gestion du retour Auth0
  if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  // Authentification
  const isAuthenticated = await auth0.isAuthenticated();

  if (!isAuthenticated) {
    await auth0.loginWithRedirect({
      appState: { targetUrl: window.location.pathname }
    });
    return;
  }

  const user = await auth0.getUser();
  console.log("✅ Connecté :", user);

  // Données et contenu une fois connecté
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof getUserLocation === "function") {
      getUserLocation();
    }

    fetch("https://airtable-all-table2.samueltoledano94.workers.dev")
      .then(res => res.json())
      .then(data => {
        console.log("📦 Données Airtable chargées :", data);

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

        document.getElementById("loadingOverlay")?.remove();
        document.body.style.pointerEvents = "auto";
      })
      .catch(err => {
        console.error("❌ Erreur de chargement :", err);
      });

    const currentPath = window.location.pathname.split("/")[1] || "home";
    const buttons = document.querySelectorAll(".custom-nav-button");

    buttons.forEach(button => {
      const pages = button.getAttribute("data-page")?.split(" ");
      if (pages && pages.includes(currentPath)) {
        button.classList.add("active");
        button.blur();
      } else {
        button.classList.remove("active");
      }
    });
  });

} catch (e) {
  console.error("Erreur Auth0 :", e);
  alert("⚠️ Une erreur d'authentification est survenue.");
}
