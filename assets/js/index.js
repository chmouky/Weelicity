// 📁 /assets/js/index.js

import { initAuth, getAuth0Client } from './auth.js';

(async () => {
  // 🔐 Étape 1 : Initialise Auth0
  await initAuth();
  const auth0Client = getAuth0Client();

  // 🔍 Étape 2 : Vérifie si un utilisateur est déjà connecté
  const userRaw = sessionStorage.getItem("user");

  if (!userRaw) {
    // 🚪 Non connecté → redirection vers Auth0
    sessionStorage.setItem("postLoginRedirect", window.location.pathname);
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin + "/callback.html"
      }
    });
    return; // Arrêt ici, car la redirection va interrompre le script
  }

  // 📦 Étape 3 : L'utilisateur est connecté → on charge Airtable si besoin
  await loadAirtableDataIfNeeded();
})();

async function loadAirtableDataIfNeeded() {
  const keys = ['tags', 'places', 'tour', 'themetour', 'quartiers', 'gastro', 'brands', 'around', 'street', 'parametre', 'ToursPerso'];

  const isReady = keys.every(key => {
    const item = sessionStorage.getItem(key);
    return item && item !== 'null' && item !== '[]' && item !== '{}';
  });

  if (isReady) {
    console.log("✅ Données déjà présentes.");
    document.getElementById('loadingOverlay')?.remove();
    document.body.style.pointerEvents = 'auto';
    return;
  }

  try {
    const res = await fetch('https://airtable-all-table2.samueltoledano94.workers.dev');
    const data = await res.json();

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
    sessionStorage.setItem('ToursPerso', JSON.stringify(data.ToursPerso));

    console.log("📦 Données Airtable chargées.");
  } catch (err) {
    console.error("❌ Erreur de chargement Airtable :", err);
  }

  document.getElementById('loadingOverlay')?.remove();
  document.body.style.pointerEvents = 'auto';
}
