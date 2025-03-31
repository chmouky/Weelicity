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
