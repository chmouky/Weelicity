import { createAuth0Client } from 'https://cdn.jsdelivr.net/npm/@auth0/auth0-spa-js@2.0.4/+esm';

const auth0 = await createAuth0Client({
  domain: "weelicity.auth0.com", // ← remplace par ton vrai domaine Auth0
  client_id: "OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL",        // ← remplace par ton vrai client ID
  authorizationParams: {
    redirect_uri: window.location.origin
  }
});

// 🔁 Gère le retour de Auth0 après login
if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
  await auth0.handleRedirectCallback();
  window.history.replaceState({}, document.title, "/");
}

// 🔐 Vérifie l'authentification
const isAuthenticated = await auth0.isAuthenticated();

if (!isAuthenticated) {
  await auth0.loginWithRedirect({
    appState: { targetUrl: window.location.pathname }
  });
  return; // ⛔ stop ici, sinon ça continue le chargement
}

// ✅ Si on est connecté, on peut récupérer l’utilisateur et continuer
const user = await auth0.getUser();
console.log("✅ Connecté :", user);

// 🟢 À partir d’ici : tu peux charger tes données, retirer le GIF, etc.



document.addEventListener("DOMContentLoaded", () => {
  // Récupérer la position de l'utilisateur
  if (typeof getUserLocation === "function") {
    getUserLocation();
  }

  // Charger toutes les données depuis le worker
  fetch("https://airtable-all-table2.samueltoledano94.workers.dev")
    .then(res => res.json())
    .then(data => {
      console.log("📦 Données Airtable chargées :", data);

      // Stockage dans sessionStorage
      sessionStorage.setItem('tags', JSON.stringify(data.Tag));
      sessionStorage.setItem('places', JSON.stringify(data.Lieu));
      sessionStorage.setItem('tour', JSON.stringify(data.Tour));
      sessionStorage.setItem('themetour', JSON.stringify(data.ThemeTour)); // ✅ Ajout essentiel
      sessionStorage.setItem('quartiers', JSON.stringify(data.Quartier));
      sessionStorage.setItem('gastro', JSON.stringify(data.Gastro));
      sessionStorage.setItem('brands', JSON.stringify(data.Brands));
      sessionStorage.setItem('around', JSON.stringify(data.Around));
      sessionStorage.setItem('street', JSON.stringify(data.Street));
      sessionStorage.setItem('parametre', JSON.stringify(data.Parametre));

      // Supprimer l'overlay de chargement s'il existe
      document.getElementById("loadingOverlay")?.remove();
      document.body.style.pointerEvents = "auto";
    })
    .catch(err => {
      console.error("❌ Erreur de chargement :", err);
    });

  // Gestion de la navigation active
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

