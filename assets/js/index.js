// =====================================================
// Fichier : index.js (page d’accueil uniquement)
// Objectif : gérer la carte principale et charger les données depuis Airtable
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  // Démarre en récupérant la géolocalisation de l'utilisateur
  if (typeof getUserLocation === "function") {
    getUserLocation();
  }

  // Charger les données depuis le worker Airtable
  fetch("https://airtable-all-table2.samueltoledano94.workers.dev")
    .then(res => res.json())
    .then(data => {
      console.log("📦 Données Airtable chargées :", data);

      // Stocker dans sessionStorage
      sessionStorage.setItem('tags', JSON.stringify(data.Tag));
      sessionStorage.setItem('places', JSON.stringify(data.Lieu));
      sessionStorage.setItem('tour', JSON.stringify(data.Tour));

      // Supprimer l’overlay de chargement
      document.getElementById("loadingOverlay")?.remove();
      document.body.style.pointerEvents = "auto";

      // Initialiser la carte ici si tu veux déjà afficher quelque chose
      // map = initMap("map", 48.8566, 2.3522, 12); // ← exemple
    })
    .catch(err => {
      console.error("❌ Erreur de chargement :", err);
    });

  // Activer la détection de la page active pour la nav
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

// ✅ Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ Service Worker enregistré :', reg.scope))
      .catch(err => console.error('❌ Erreur Service Worker :', err));
  });
}
