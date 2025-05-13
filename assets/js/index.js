firebase.auth().onAuthStateChanged(async (user) => {
  const authContainer = document.getElementById("authContainer");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInfo = document.getElementById("userInfo");
  const loadingOverlay = document.getElementById("loadingOverlay");

  if (user) {
    console.log("🔐 Utilisateur connecté :", user.email);

    authContainer.style.display = "none";
    logoutBtn.style.display = "block";
    userInfo.textContent = `Signed in as: ${user.displayName || user.email}`;

    await loadFooterIfNeeded();

    if (loadingOverlay) {
      loadingOverlay.style.display = "flex"; 
      document.body.style.pointerEvents = "none";
    }

    await loadAirtableDataIfNeeded();
  } else {
    console.log("🔓 Utilisateur non connecté.");

    authContainer.style.display = "block";
    logoutBtn.style.display = "none";
    userInfo.textContent = "";

    if (loadingOverlay) {
      fadeOutOverlay();
    }
    document.body.style.pointerEvents = "auto";
  }
});

// Gestion du bouton Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  logoutUser();
});

// Animation de disparition douce
function fadeOutOverlay() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.transition = "opacity 0.8s ease";
    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      loadingOverlay.style.display = "none";
    }, 800);
  }
}

async function loadAirtableDataIfNeeded() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const keys = [
    'tags', 'places', 'tour', 'themetour', 'quartiers',
    'gastro', 'brands', 'around', 'street', 'parametre', 'ToursPerso',
    'restaurant' // ✅ Ajout ici
  ];

  const isReady = keys.every(key => {
    const item = sessionStorage.getItem(key);
    return item && item !== 'null' && item !== '[]' && item !== '{}';
  });

  if (isReady) {
    console.log("✅ Données déjà présentes.");
    fadeOutOverlay();
    document.body.style.pointerEvents = "auto";
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
    sessionStorage.setItem('restaurant', JSON.stringify(data.Restaurant)); // ✅ Ajout ici

    console.log("📦 Données Airtable chargées.");
  } catch (err) {
    console.error("❌ Erreur de chargement Airtable :", err);
  }

  fadeOutOverlay();
  document.body.style.pointerEvents = "auto";
}
