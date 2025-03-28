// =====================================================
// Fichier : index.js
// Objectif : Regrouper l'ensemble du JavaScript présent
// dans la version originale de ton index.html.
// =====================================================

// ---------------------------
// IIFE pour la géolocalisation, Google Maps, et résolution du TSP
// ---------------------------
(function() {
  /********************************************************
   * Fonction pour obtenir la position de l'utilisateur
   ********************************************************/
  function getUserLocation() {
    if (!navigator.geolocation) {
      console.error("❌ La géolocalisation n'est pas prise en charge par ce navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        console.log("📍 Position obtenue :", position.coords.latitude, position.coords.longitude);

        // Met à jour la carte si elle est déjà initialisée
        if (window.map) {
          const userPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
          window.map.setCenter(userPosition);

          // Ajouter un marqueur pour l'utilisateur
          if (!window.userMarker) {
            window.userMarker = new google.maps.Marker({
              position: userPosition,
              map: window.map,
              title: "Ma Position",
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                scaledSize: new google.maps.Size(40, 40)
              }
            });
          } else {
            window.userMarker.setPosition(userPosition);
          }
        }
      },
      error => {
        console.error("🚨 Erreur de géolocalisation :", error);
        alert("Impossible d’accéder à votre position. Vérifiez que la géolocalisation est activée !");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Appeler la fonction au démarrage pour vérifier la permission
  document.addEventListener("DOMContentLoaded", () => {
    // Note : La fonction checkGeolocationPermission() doit être définie ailleurs ou remplacée par getUserLocation()
    checkGeolocationPermission();
  });

  /********************************************************
   * Fonction pour initialiser la carte Google Maps
   ********************************************************/
  function initMap(containerId, lat = 48.9990, lng = 2.3022, zoom = 11.5) {
    let map;
    try {
      const mapElement = document.getElementById(containerId);
      if (!mapElement) {
        console.error(`Element avec l'ID '${containerId}' introuvable.`);
        return;
      }

      const location = { lat: parseFloat(lat), lng: parseFloat(lng) };

      map = new google.maps.Map(mapElement, {
        center: location,
        zoom: zoom,
        gestureHandling: 'greedy',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
      });

      console.log("Carte Google Maps initialisée avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la carte:", error);
    }

    return map;
  }

  /********************************************************
   * Fonction pour charger dynamiquement le script Google Maps
   ********************************************************/
  function loadGoogleMaps(apiUrl, callbackName = "onGoogleMapsLoaded") {
    const script = document.createElement("script");
    script.src = `${apiUrl}?callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Google Maps API chargé avec succès.");
    };

    script.onerror = () => {
      console.error("Erreur lors du chargement de Google Maps API.");
    };

    document.body.appendChild(script);
  }

  /********************************************************
   * Fonction pour résoudre le TSP (algorithme du plus proche voisin)
   ********************************************************/
  function solveTSPNearestNeighbor(distMatrix, selectedPlaces) {
    const n = distMatrix.rows.length;
    const visited = new Array(n).fill(false);
    const path = [0]; // Commence par "My location"
    visited[0] = true;

    for (let step = 1; step < n; step++) {
      const last = path[path.length - 1];
      let nearest = null;
      let minDist = Infinity;

      for (let j = 0; j < n; j++) {
        if (!visited[j] && distMatrix.rows[last].elements[j].distance.value < minDist) {
          minDist = distMatrix.rows[last].elements[j].distance.value;
          nearest = j;
        }
      }

      if (nearest !== null) {
        path.push(nearest);
        visited[nearest] = true;
      } else {
        break;
      }
    }

    return path;
  }

  /********************************************************
   * Fonction pour construire un lien Google Maps optimisé
   ********************************************************/
  function buildOptimizedGoogleMapsUrl(orderedLocations) {
    if (orderedLocations.length < 2) {
      return "#";
    }

    const origin = `${orderedLocations[0].lat},${orderedLocations[0].lng}`;
    const destination = `${orderedLocations[orderedLocations.length - 1].lat},${orderedLocations[orderedLocations.length - 1].lng}`;
    const waypoints = orderedLocations.slice(1, -1)
      .map(loc => `${loc.lat},${loc.lng}`)
      .join("|");

    let url = `https://www.google.com/maps/dir/?api=1`;
    url += `&origin=${encodeURIComponent(origin)}`;
    url += `&destination=${encodeURIComponent(destination)}`;
    url += `&travelmode=walking`;
    if (waypoints) {
      url += `&waypoints=${encodeURIComponent(waypoints)}`;
    }

    return url;
  }

  // Attacher les fonctions à l'objet global pour qu'elles soient accessibles ailleurs
  window.initMap = initMap;
  window.loadGoogleMaps = loadGoogleMaps;
  window.solveTSPNearestNeighbor = solveTSPNearestNeighbor;
  window.buildOptimizedGoogleMapsUrl = buildOptimizedGoogleMapsUrl;
})();

// ---------------------------
// Fonctions utilitaires hors IIFE
// ---------------------------

// Fonction de calcul de la distance Haversine (en mètres)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distance en mètres
}

// Fonction pour générer une matrice des distances formatée comme la Google Distance Matrix API
function getDistanceMatrix(locations) {
  if (!Array.isArray(locations) || locations.length === 0) {
    throw new Error("Liste de positions invalide.");
  }

  const numPoints = locations.length;
  const matrix = {
    destination_addresses: locations.map(loc => `(${loc.lat}, ${loc.lng})`),
    origin_addresses: locations.map(loc => `(${loc.lat}, ${loc.lng})`),
    rows: []
  };

  for (let i = 0; i < numPoints; i++) {
    const elements = [];
    for (let j = 0; j < numPoints; j++) {
      if (i === j) {
        elements.push({ distance: { text: "0 m", value: 0 } });
      } else {
        const distanceMeters = haversineDistance(
          locations[i].lat, locations[i].lng,
          locations[j].lat, locations[j].lng
        );

        elements.push({ distance: { text: `${distanceMeters} m`, value: distanceMeters } });
      }
    }
    matrix.rows.push({ elements });
  }

  return matrix;
}


const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
const manifestURL = URL.createObjectURL(blob);
const manifestLink = document.createElement("link");
manifestLink.rel = "manifest";
manifestLink.href = manifestURL;
document.head.appendChild(manifestLink);

// ---------------------------
// Preload et Overlay pour récupérer les données via le Worker
// ---------------------------
const ALL_TABLES_WORKER_URL = 'https://airtable-all-table.samueltoledano94.workers.dev/';

// Création de l'overlay de chargement et du GIF dès le chargement du DOM
document.addEventListener("DOMContentLoaded", function () {
  let loadingOverlay = document.createElement("div");
  loadingOverlay.id = "loadingOverlay";
  loadingOverlay.style.position = "fixed";
  loadingOverlay.style.top = "0";
  loadingOverlay.style.left = "0";
  loadingOverlay.style.width = "100vw";
  loadingOverlay.style.height = "100vh";
  loadingOverlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
  loadingOverlay.style.display = "flex";
  loadingOverlay.style.justifyContent = "center";
  loadingOverlay.style.alignItems = "center";
  loadingOverlay.style.zIndex = "9999";

  let loadingGif = document.createElement("img");
  loadingGif.id = "loadingGif";
  loadingGif.src = "assets/img/index/pin_wait.gif";
  loadingGif.alt = "Loading...";
  loadingGif.style.width = "120px";
  loadingGif.style.height = "auto";


  document.body.style.pointerEvents = "none";
  loadingOverlay.appendChild(loadingGif);
  document.body.appendChild(loadingOverlay);
});

// Fonction pour précharger toutes les données depuis le Worker
async function preloadAllTables() {
  try {
    const urlTag = `${ALL_TABLES_WORKER_URL}?table=Tag`;
    const urlLieu = `${ALL_TABLES_WORKER_URL}?table=Lieu`;
    const urlQuartier = `${ALL_TABLES_WORKER_URL}?table=Quartier`;
    const urlTour = `${ALL_TABLES_WORKER_URL}?table=Tour`;
    const urlThemeTour = `${ALL_TABLES_WORKER_URL}?table=ThemeTour`;
    const urlGastro = `${ALL_TABLES_WORKER_URL}?table=Gastro`;
    const urlBrands = `${ALL_TABLES_WORKER_URL}?table=Brands`;
    const urlAround = `${ALL_TABLES_WORKER_URL}?table=Around`;
    const urlStreet = `${ALL_TABLES_WORKER_URL}?table=Street`;
    const urlParametre = `${ALL_TABLES_WORKER_URL}?table=Parametre`;

    const [resTag, resLieu, resQuartier, resTour, resThemeTour, resGastro, resBrands, resAround, resStreet, resParametre] = await Promise.all([
      fetch(urlTag, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      fetch(urlLieu, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      fetch(urlQuartier, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      fetch(urlTour, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      fetch(urlThemeTour, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      fetch(urlGastro, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      fetch(urlBrands, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      fetch(urlAround, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      fetch(urlStreet, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      fetch(urlParametre, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    ]);
    
    if (!resTag.ok || !resLieu.ok || !resQuartier.ok || !resTour.ok || !resThemeTour.ok || !resGastro.ok || !resBrands.ok || !resAround.ok || !resStreet.ok || !resParametre.ok) {
      throw new Error("Erreur lors de la récupération des données.");
    }

    const [dataTag, dataLieu, dataQuartier, dataTour, dataThemeTour, dataGastro, dataBrands, dataAround, dataStreet, dataParametre] = await Promise.all([
      resTag.json(),
      resLieu.json(),
      resQuartier.json(),
      resTour.json(),
      resThemeTour.json(),
      resGastro.json(),
      resBrands.json(),
      resAround.json(),
      resStreet.json(),
      resParametre.json()
    ]);

    // Stocker les données dans sessionStorage
    sessionStorage.setItem('tags', JSON.stringify(dataTag.records));
    sessionStorage.setItem('places', JSON.stringify(dataLieu.records));
    sessionStorage.setItem('quartiers', JSON.stringify(dataQuartier.records));
    sessionStorage.setItem('tour', JSON.stringify(dataTour.records));
    sessionStorage.setItem('themetour', JSON.stringify(dataThemeTour.records));
    sessionStorage.setItem('gastro', JSON.stringify(dataGastro.records));
    sessionStorage.setItem('brands', JSON.stringify(dataBrands.records));
    sessionStorage.setItem('around', JSON.stringify(dataAround.records));
    sessionStorage.setItem('street', JSON.stringify(dataStreet.records));
    sessionStorage.setItem('parametre', JSON.stringify(dataParametre.records));
  } catch (error) {
    console.error('🚨 Erreur lors de la précharge des données :', error);
  }
}

// Fonction principale pour charger les données et masquer l'overlay
async function preloadData() {
  await preloadAllTables();

  let loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = "none";
    loadingOverlay.remove();
  }
  document.body.style.pointerEvents = "auto";
}

// Lancer le préchargement au chargement du DOM
document.addEventListener("DOMContentLoaded", async () => {
  await preloadData();
});

// ---------------------------
// Déclaration finale pour le Cookie Banner
// ---------------------------
Static.COOKIE_BANNER_CAPABLE = true;

// Script pour détecter la page active dans la navigation
document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname.split("/")[1] || "home"; 
  const buttons = document.querySelectorAll(".custom-nav-button");

  buttons.forEach(button => {
    const pages = button.getAttribute("data-page").split(" ");
    if (pages.includes(currentPath)) {
      button.classList.add("active");
      button.blur(); // Supprime le focus après activation
    } else {
      button.classList.remove("active");
    }
  });
});

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ Service Worker enregistré:', reg.scope))
      .catch(err => console.error('❌ Erreur Service Worker:', err));
  });
}

