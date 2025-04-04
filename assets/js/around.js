let map;
const markers = []; // Stocke les marqueurs sur la carte
let filteredPlacesWithCoords = []; 
let userMarker = null; // Marqueur pour la position de l'utilisateur
let quartierPolygons = []; // 🔴 Tableau global pour stocker les polygones des quartiers
let quartierLabels = []; // Stocke les labels des quartiers pour pouvoir les supprimer
let streetPolylines = [];
let streetLabels = [];
let simulatePosition = false; // Variable globale

document.addEventListener("DOMContentLoaded", async () => {

    waitForStorageReady(["around", "places", "gastro", "quartiers", "street", "parametre"], () => {  
        loadGoogleMaps("https://google-map-back.samueltoledano94.workers.dev/load-google-maps", "onGoogleMapsLoaded");
    });

    setupPopupCloseEvents(); // ✅ Ajoute cet appel ici pour attacher les événements !
});



/********************************************************
 * 📌 Fonction pour attacher les événements de fermeture aux popups
 ********************************************************/
function setupPopupCloseEvents() {
    document.querySelectorAll(".popup-close").forEach(button => {
        button.removeEventListener("click", closePopup); // 🔴 Évite les doublons
        button.addEventListener("click", closePopup); // ✅ Ajoute l'événement
    });
}
function closePopup(event) {
    const popup = event.target.closest("#popup, #popup-lieu-details");
    if (popup) {
        popup.style.display = "none";
        console.log("🔴 Popup fermé :", popup.id);
    }
    // Masquer l'overlay et réactiver le scroll
    document.getElementById("overlay").style.display = "none";
    document.body.classList.remove("no-scroll");
}

/********************************************************
 * Fonction pour initialiser la carte Google Maps
 ********************************************************/
function initMap(containerId, lat, lng, zoom) {
  return new google.maps.Map(document.getElementById(containerId), {
    center: { lat: lat, lng: lng },
    zoom: zoom,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: "greedy",
  });
}

/********************************************************
 * 🎯 Activer le suivi de la position de l'utilisateur en temps réel
 ********************************************************/
let firstLocationUpdate = true;  // ✅ Variable pour éviter le recentrage constant

function trackUserLocation() {
    if (!navigator.geolocation) {
        alert("❌ La géolocalisation n'est pas prise en charge par votre navigateur.");
        return;
    }

    navigator.geolocation.watchPosition(
        (position) => {
            const userPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            if (!userMarker) {
                userMarker = new google.maps.Marker({
                    position: userPosition,
                    map: map,
                    title: "Ma Position",
                    icon: {
                        url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                        scaledSize: new google.maps.Size(40, 40)
                    }
                });
            } else {
                userMarker.setPosition(userPosition);
            }

            // ✅ SEULEMENT au premier affichage, on recentre automatiquement
            if (firstLocationUpdate) {
                const OFFSET_LATITUDE = 0.002; // ≈ 200 mètres vers le bas

                // Récupère la position réelle de l'utilisateur
                const userPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // 🏁 Définit la nouvelle position centrée plus bas
                const adjustedCenter = {
                    lat: userPosition.lat - OFFSET_LATITUDE,
                    lng: userPosition.lng
                };

                // 🔄 Centre la carte sur la position décalée
                map.setCenter(adjustedCenter);

                // ✅ Garde le marqueur bien à la position réelle
                if (!userMarker) {
                    userMarker = new google.maps.Marker({
                        position: userPosition, // 📍 Toujours la vraie position
                        map: map,
                        title: "Ma Position",
                        icon: {
                            url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                            scaledSize: new google.maps.Size(40, 40)
                        }
                    });
                } else {
                    userMarker.setPosition(userPosition);
                }

                firstLocationUpdate = false; // Désactive le recentrage automatique
            }

        },
        (error) => {
            console.error("❌ Erreur de géolocalisation :", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
        }
    );
}

/********************************************************
 * Fonction exécutée après le chargement de Google Maps
 ********************************************************/
function onGoogleMapsLoaded() {
    try {
        const defaultLat = 48.8990;
        const defaultLng = 2.3222;
        const zoom = 15;
        
          
        map = initMap("map", defaultLat, defaultLng, zoom);

        // Vérifier le paramètre dans sessionStorage et récupérer éventuellement les coordonnées simulées
        const parametreJSON = sessionStorage.getItem("parametre");
        let simulatedLat, simulatedLng;
        if (parametreJSON) {
            try {
                const parametreData = JSON.parse(parametreJSON);
                // Rechercher l'enregistrement dont le Nom est "Test"
                const testParam = parametreData.find(record => record.fields.Nom === "Test");
                if (testParam && testParam.fields.Valeur === "O") {
                    simulatePosition = true;
                    // Récupérer les coordonnées simulées depuis les champs ValeurA et ValeurB
                    simulatedLat = parseFloat(testParam.fields.ValeurA);
                    simulatedLng = parseFloat(testParam.fields.ValeurB);
                } else {
                    simulatePosition = false;
                }
            } catch (error) {
                console.error("Erreur lors du parsing de 'parametre' :", error);
            }
        }

        // Si la position est simulée, utiliser les coordonnées récupérées
        if (simulatePosition && !isNaN(simulatedLat) && !isNaN(simulatedLng)) {
            map.setCenter(new google.maps.LatLng(simulatedLat, simulatedLng));
            if (!userMarker) {
                userMarker = new google.maps.Marker({
                    position: { lat: simulatedLat, lng: simulatedLng },
                    map: map,
                    title: "Position simulée",
                    icon: {
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        scaledSize: new google.maps.Size(40, 40)
                    }
                });
            } else {
                userMarker.setPosition(new google.maps.LatLng(simulatedLat, simulatedLng));
            }
        } else {
            // Sinon, on active la géolocalisation réelle
            trackUserLocation();
        }

        // Charger les autres données des tables (around, gastro, places)
        const aroundJSON = sessionStorage.getItem("around");
        const gastroJSON = sessionStorage.getItem("gastro");
        const placesJSON = sessionStorage.getItem("places");

        if (!aroundJSON || !gastroJSON || !placesJSON) {
            alert("Erreur : certaines données sont manquantes !");
            return;
        }

        let aroundData = JSON.parse(aroundJSON);
        let gastroData = JSON.parse(gastroJSON);
        let placesData = JSON.parse(placesJSON);

        // Construire et afficher le carrousel
        const carouselData = aroundData.map(record => ({
            name: record.fields.Nom || "Nom inconnu",
            descriptionC: record.fields.DescriptionC || "Description courte indisponible",
            description: record.fields.Description || "Description complète indisponible",
            image: record.fields.URLPhoto || "https://via.placeholder.com/300x150?text=Aucune+Image",
            lat: record.fields.Latitude ? parseFloat(record.fields.Latitude) : null,
            lng: record.fields.Longitude ? parseFloat(record.fields.Longitude) : null,
            calcID: record.fields.CalcID || record.id
        }));
        carouselData.forEach(place => {
            createCircularMarkerIcon(place.image, 50, "#FF0000").then(iconUrl => {
              window.cachedSpotIcons[place.name] = iconUrl;
            });
          });

          displayCarousel(carouselData, gastroData, placesData);
        setupCarouselObserver(gastroData, placesData);

    } catch (error) {
        alert("🚨 Une erreur est survenue !");
        console.error("Erreur dans onGoogleMapsLoaded :", error);
    }
}

/********************************************************
 * 📌 Fonction : Attendre que les clés nécessaires soient dans sessionStorage
 ********************************************************/
function waitForStorageReady(keys, callback) {
    const checkStorage = () => {
        let allKeysAvailable = true;
        let missingKeys = [];

        keys.forEach(key => {
            const data = sessionStorage.getItem(key);
            if (!data || data === "[]" || data === "{}" || data === "null") {
                missingKeys.push(key);
                allKeysAvailable = false;
            }
        });
 
        return allKeysAvailable;
    };

    if (checkStorage()) {
        callback();
        return;
    }

    const observer = new MutationObserver(() => {
        if (checkStorage()) {
            observer.disconnect();
            callback();
        }
    });

    observer.observe(document, { childList: true, subtree: true });

    const interval = setInterval(() => {
        if (checkStorage()) {
            clearInterval(interval);
            observer.disconnect();
            callback();
        }
    }, 500);
}

/********************************************************
 * Fonction pour afficher le carrousel avec les Tags filtrés
 ********************************************************/
function displayCarousel(data, gastroData, lieuData) {
    const carouselContainer = document.getElementById("carousel-container");
    if (!carouselContainer) {
      alert("Erreur : Conteneur du carrousel introuvable !");
      return;
    }
  
    carouselContainer.innerHTML = "";
  
    if (!data.length) {
      alert("Aucune donnée à afficher dans le carrousel.");
      return;
    }
  
    data.forEach((record) => {
      if (!record || !record.name) return;
  
      const item = document.createElement("div");
      item.classList.add("carousel-item");
      item.setAttribute('data-name', record.name);
      item.setAttribute('data-calcid', record.calcID);
  
      const title = document.createElement("h3");
      title.textContent = record.name || "Nom inconnu";
      title.addEventListener('click', () => {
        showPopup(record);
      });
  
      const descriptionText = document.createElement("p");
      descriptionText.classList.add("description-text");
      descriptionText.textContent = record.descriptionC || "Description courte indisponible";
  
      const image = document.createElement("img");
      image.src = record.image || "https://via.placeholder.com/300x150?text=Aucune+Image";
      image.alt = record.name || "Nom inconnu";
  
      item.appendChild(title);
      item.appendChild(descriptionText);
      item.appendChild(image);
  
      carouselContainer.appendChild(item);
    });
  
    setupCarouselObserver(gastroData, lieuData); // ✅ ICI aussi
  }
  

let lastAlertedItem = null;

/********************************************************
 * Fonction pour détecter le carrousel centré et afficher les lieux
 ********************************************************/
function setupCarouselObserver(gastroData, lieuData) {
    const carouselContainer = document.getElementById("carousel-container");
    const carouselItems = document.querySelectorAll(".carousel-item");

    if (!carouselContainer || carouselItems.length === 0) {
        alert("Erreur : Aucun élément de carrousel trouvé !");
        return;
    }

    const observerOptions = {
        root: carouselContainer,
        rootMargin: '0px',
        threshold: 0.6  // 🔴 Augmente la précision de détection du carrousel centré
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                const itemCalcID = item.getAttribute('data-calcid') || "INCONNU";
                console.log("🎠 Changement de carousel : calcID =", itemCalcID);

                // 🔴 Suppression stricte des anciennes données
                updateMapMarkers([]);
                clearQuartierPolygons();
                clearStreetPolylines();

                // 📌 Gestion du zoom en fonction du carrousel actif
                let newZoom = (itemCalcID === "3") ? 14 : (itemCalcID === "4") ? 12 : 15;

                if (map.getZoom() !== newZoom) {
                    console.log(`🔄 Mise à jour du zoom : ${newZoom}`);
                    map.setZoom(newZoom);
                    // Attendre que le zoom soit terminé (l'événement 'idle' se déclenche une fois la carte redessinée)
                    google.maps.event.addListenerOnce(map, 'idle', function() {
                        recenterMap();
                    });
                } else {
                    recenterMap();
                }

                // 📌 Affichage des lieux en fonction du carrousel
                if (itemCalcID === "1") {
                    const relatedGastroPlaces = getGastroPlaces(itemCalcID, gastroData);
                    updateMapMarkers(relatedGastroPlaces);
                } 
                else if (itemCalcID === "2") {
                    const allLieux = getAllLieux(lieuData);
                    updateMapMarkers(allLieux);
                } 
                else if (itemCalcID === "3") {
                    console.log("🛣️ Affichage des rues...");

                    const streetJSON = sessionStorage.getItem("street");
                    if (!streetJSON) {
                        console.log("⚠️ Aucune donnée de Street trouvée !");
                        return;
                    }

                    let streetData;
                    try {
                        streetData = JSON.parse(streetJSON);
                    } catch (error) {
                        console.error("🚨 Erreur de parsing JSON des streets :", error);
                        return;
                    }

                    streetData.forEach(street => {
                        let coords;
                        try {
                            coords = typeof street.fields.Coordonnees === "string"
                                ? JSON.parse(street.fields.Coordonnees)
                                : street.fields.Coordonnees;
                        } catch (err) {
                            console.error("⚠️ Erreur de parsing des coordonnées pour la rue:", street.fields.Nom, err);
                            return;
                        }

                        if (!Array.isArray(coords) || coords.length === 0) {
                            console.warn("⚠️ Coordonnées invalides pour la rue:", street.fields.Nom);
                            return;
                        }

                        // Création de la polyline représentant la rue
                        const polyline = new google.maps.Polyline({
                            path: coords,
                            geodesic: true,
                            strokeColor: street.fields.Couleur || '#FF0000',
                            strokeOpacity: 1.0,
                            strokeWeight: 8,
                            map: map
                        });

                        const midIndex = Math.floor(coords.length / 2);
                        const midPoint = coords[midIndex];

                        // Création du marqueur pour afficher le nom de la rue
                        const streetLabel = new google.maps.Marker({
                            position: midPoint,
                            map: map,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 0 // Le marker est invisible, seul le label s'affiche
                            },
                            label: {
                                text: street.fields.Nom || "Rue inconnue",
                                color: "#000000",
                                fontSize: "14px",
                                fontWeight: "bold"
                            }
                        });

                        // ✅ Gérer le clic sur la polyline → Ouvrir le même popup que pour les spots/breaks
                        polyline.addListener('click', (event) => {
                            const lieu = {
                                name: street.fields.Nom || "Rue inconnue",
                                description: street.fields.Description || "Aucune description disponible",
                                image: street.fields.URLPhoto || "https://via.placeholder.com/300x150?text=Aucune+Image",
                                lat: event.latLng.lat(),
                                lng: event.latLng.lng()
                            };
                            showLieuDetails(lieu);
                        });

                        // ✅ Gérer le clic sur le label → Déclencher l'événement sur la polyline
                        google.maps.event.addListener(streetLabel, 'click', function(event) {
                            google.maps.event.trigger(polyline, 'click', event);
                        });

                        // Stocker les objets pour une éventuelle suppression ultérieure
                        streetPolylines.push(polyline);
                        streetLabels.push(streetLabel);
                    });

                    console.log(`✅ ${streetPolylines.length} rues affichées.`);
                } 
                else if (itemCalcID === "4") {
                    showQuartierPolygons();
                } 
                else {
                    console.log("🔄 Réinitialisation complète de la carte.");
                }
            }
        });
    }, observerOptions);

    carouselItems.forEach(item => observer.observe(item));
}

/********************************************************
 * Fonction pour récupérer les lieux correspondants avec coordonnées GPS
 ********************************************************/
function getRelatedPlaces(calcID) {
    const placesJSON = sessionStorage.getItem("places");
    if (!placesJSON) {
        alert("Aucun lieu trouvé dans `sessionStorage` !");
        return [];
    }

    let places;
    try {
        places = JSON.parse(placesJSON);
        if (!Array.isArray(places)) {
            alert("Erreur : `places` n'est pas un tableau !");
            return [];
        }
    } catch (parseError) {
        alert("Erreur de parsing JSON des lieux !");
        return [];
    }

    // 🔥 Vérifier si la table Parametre doit influencer l'affichage
    const parametreJSON = sessionStorage.getItem("parametre");
    let hideCertainLieux = false;

    if (parametreJSON) {
        try {
            const parametreData = JSON.parse(parametreJSON);
            const paramRecord = parametreData.find(record => record.fields.Nom === "MasquerLieux");
            if (paramRecord && paramRecord.fields.Valeur === "O") {
                hideCertainLieux = true;
            }
        } catch (error) {
            console.error("❌ Erreur de parsing des paramètres :", error);
        }
    }

    // 🔎 Filtrer les lieux selon `Parametre`
    return places
        .filter(place => place.fields.CalcTags && place.fields.CalcTags.includes(calcID))
        .filter(place => !hideCertainLieux || (place.fields.Type !== "Secret"))  // Si `MasquerLieux = O`, cacher les lieux de type "Secret"
        .map(place => ({
            name: place.fields.Nom || "Nom inconnu",
            description: place.fields.Description || "Description indisponible",
            image: place.fields.URLPhoto || "https://via.placeholder.com/300x150?text=Aucune+Image",
            lat: place.fields.Latitude ? parseFloat(place.fields.Latitude) : null,
            lng: place.fields.Longitude ? parseFloat(place.fields.Longitude) : null
        }));
}

/********************************************************
 * Fonction pour mettre à jour les marqueurs Google Maps
 ********************************************************/
let previewMarkerSpots = null; // Marqueur de preview spécifique aux spots
window.cachedSpotIcons = {};   // Cache global pour les icônes images circulaires

function updateMapMarkers(places) {
    // 🔄 Supprimer les anciens marqueurs
    markers.forEach(marker => marker.setMap(null));
    markers.length = 0;
  
    // 🔴 Supprimer l'ancien preview s'il existe
    if (previewMarkerSpots) {
      previewMarkerSpots.setMap(null);
      previewMarkerSpots = null;
    }
  
    if (!places || places.length === 0) return;
  
    // 👀 On ne garde qu’un seul marqueur de preview centré
    const place = places[0];
    const iconUrl = window.cachedSpotIcons[place.name] || "https://via.placeholder.com/50";
  
    previewMarkerSpots = new google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map: map,
      title: place.name,
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(50, 50),
        anchor: new google.maps.Point(25, 25)
      }
    });
  
    previewMarkerSpots.addListener("click", () => {
      showLieuDetails(place);
    });
  }
  


function showLieuDetails(lieu) {
    if (!lieu) return;

    // Mise à jour de la description (vérification de la présence d'une "brand")
    let description = lieu.description || "Description indisponible";
    let webLink = "";
    if (lieu.brands && Array.isArray(lieu.brands) && lieu.brands.length > 0) {
        const brandKey = lieu.brands[0].trim();
        const brandsJSON = sessionStorage.getItem("brands");
        if (brandsJSON) {
            try {
                const brands = JSON.parse(brandsJSON);
                if (Array.isArray(brands)) {
                    const brandEntry = brands.find(entry => entry.id === brandKey);
                    if (brandEntry) {
                        description = brandEntry?.fields?.Description || description;
                        webLink = brandEntry?.fields?.Web || "";
                    }
                }
            } catch (e) {
                console.error("Erreur de parsing JSON des brands :", e);
            }
        }
    }

    // Mise à jour des éléments du popup
    document.getElementById("popup-lieu-title").textContent = lieu.name || "Nom inconnu";
    document.getElementById("popup-lieu-description").textContent = description;
    if (lieu.inout || lieu.ticket) {
        const extraInfo = document.createElement("p");
        extraInfo.style.marginTop = "10px";
        extraInfo.style.fontSize = "0.9em";
        extraInfo.style.color = "#333";
        extraInfo.innerHTML = `
            ${lieu.inout ? `<strong>Access:</strong> ${lieu.inout}<br>` : ""}
            ${lieu.ticket ? `<strong>Ticket:</strong> ${lieu.ticket}` : ""}
        `;
        const container = document.getElementById("popup-lieu-description");
        container.appendChild(extraInfo);
    }

    const popupLieuImage = document.getElementById("popup-lieu-image");
    popupLieuImage.src = (lieu.image && lieu.image.trim()) ? lieu.image.trim() : "https://via.placeholder.com/300x150?text=Aucune+Image";
    popupLieuImage.alt = lieu.name || "Nom inconnu";
    
    // Réinitialisation et création des liens
    const popupLinks = document.getElementById("popup-lieu-links");
    popupLinks.innerHTML = "";
    let googleMapsRouteLink = `https://www.google.com/maps/dir/?api=1&destination=${lieu.lat},${lieu.lng}`;
    const googleSearchQuery = `Visit ${encodeURIComponent(lieu.name)} Paris`;
    const googleSearchLink = `https://www.google.com/search?q=${googleSearchQuery}`;
    
    popupLinks.innerHTML = `
        ${webLink.trim() ? `<a href="${webLink}" target="_blank" style="display: block; margin-top: 10px; text-decoration: underline; color: var(--theme-color); font-weight: bold;">🌐 Site Web</a>` : ""}
        <a href="${googleMapsRouteLink}" target="_blank" style="display: block; margin-top: 10px; text-decoration: underline; color: var(--theme-color); font-weight: bold;">🚶‍♂️ Go !</a>
        <a href="${googleSearchLink}" target="_blank" style="display: block; margin-top: 5px; text-decoration: underline; color: var(--theme-color); font-weight: bold;">🔍 More details</a>
    `;
    
    // Mise à jour du lien "Go !" si la géolocalisation est disponible
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            googleMapsRouteLink = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lieu.lat},${lieu.lng}`;
            const googleLink = popupLinks.querySelector("a[href^='https://www.google.com/maps/dir/']");
            if (googleLink) {
                googleLink.href = googleMapsRouteLink;
            }
        }, error => {
            console.error("Erreur de géolocalisation :", error);
        });
    }
    
    // IMPORTANT : Positionner l'overlay et le popup au-dessus des autres éléments
    var overlay = document.getElementById("overlay");
    overlay.style.zIndex = "9999";      // Place l'overlay au-dessus de la plupart des éléments
    overlay.style.display = "block";
    
    var popupDetails = document.getElementById("popup-lieu-details");
    popupDetails.style.zIndex = "10000"; // Le popup doit être au-dessus de l'overlay
    popupDetails.style.display = "block";
    
    // Désactiver le scroll
    document.body.classList.add("no-scroll");
}

/********************************************************
 * Fonction pour récupérer les lieux associés dans Gastro
 ********************************************************/
function getGastroPlaces(calcID, gastroData) {
  return gastroData
    .filter(gastro => gastro.fields.CalcTags && gastro.fields.CalcTags.includes(calcID))
    .map(gastro => ({
      name: gastro.fields.Nom || "Nom inconnu",
      description: gastro.fields.Description || "Description indisponible",
      image: gastro.fields.URLPhoto || "https://via.placeholder.com/300x150?text=Aucune+Image",
      lat: gastro.fields.Latitude ? parseFloat(gastro.fields.Latitude) : null,
      lng: gastro.fields.Longitude ? parseFloat(gastro.fields.Longitude) : null,
      brands: gastro.fields.Brands || null // Ajout du lien vers la table Brands
    }));
}

function getAllLieux(lieuData) {
  return lieuData.map(lieu => ({
    name: lieu.fields.Nom || "Nom inconnu",
    descriptionC: lieu.fields.DescriptionC || "Description courte indisponible",
    description: lieu.fields.Description || "Description complète indisponible",
    image: lieu.fields.URLPhoto || "https://via.placeholder.com/300x150?text=Aucune+Image",
    lat: lieu.fields.Latitude ? parseFloat(lieu.fields.Latitude) : null,
    lng: lieu.fields.Longitude ? parseFloat(lieu.fields.Longitude) : null,
    inout: lieu.fields.Inout || "",
    ticket: lieu.fields.Ticket || ""
  }));
}

function clearQuartierPolygons() {
    quartierPolygons.forEach(polygon => polygon.setMap(null)); // 🔴 Supprime les polygones
    quartierPolygons = []; // 🔄 Réinitialise le tableau

    quartierLabels.forEach(label => label.setMap(null)); // 🔴 Supprime les labels des quartiers
    quartierLabels = []; // 🔄 Réinitialise la liste des labels
}

function showQuartierPolygons() {
    clearQuartierPolygons(); // 🧹 Supprime les anciens polygones avant d'ajouter les nouveaux

    const quartierJSON = sessionStorage.getItem("quartiers");

    if (!quartierJSON || quartierJSON === "null" || quartierJSON === "[]") {
        alert("❌ Aucune donnée de quartiers trouvée !");
        return;
    }

    let quartiers;
    try {
        quartiers = JSON.parse(quartierJSON);
        if (!Array.isArray(quartiers) || quartiers.length === 0) {
            alert("🚨 Erreur : `quartiers` n'est pas un tableau valide !");
            return;
        }
    } catch (error) {
        alert("🚨 Erreur de parsing JSON des quartiers !");
        console.error("Erreur de parsing JSON des quartiers :", error);
        return;
    }

    quartiers.forEach(quartier => {
        let coords;
        try {
            coords = typeof quartier.fields.Coordonnees === "string" 
                ? JSON.parse(quartier.fields.Coordonnees) 
                : quartier.fields.Coordonnees;
        } catch (e) {
            alert("❌ Erreur de parsing des coordonnées pour le quartier : " + quartier.fields.Nom);
            console.error("Erreur :", e);
            return;
        }

        if (!Array.isArray(coords) || coords.length === 0) {
            alert("❌ Les coordonnées pour le quartier " + quartier.fields.Nom + " ne sont pas valides.");
            return;
        }

        const couleur = quartier.fields.Couleur || "#FF0000";

        const polygon = new google.maps.Polygon({
            paths: coords,
            strokeColor: couleur,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: couleur,
            fillOpacity: 0.35,
            map: map
        });

        // ✅ Calcul du centre du polygone
        const center = getPolygonCenter(coords);

        // ✅ Ajout d'un label avec le nom du quartier
        const labelMarker = new google.maps.Marker({
            position: center,
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 0, // Le rendre invisible
                fillOpacity: 0
            },
            label: {
                text: quartier.fields.Nom || "Quartier inconnu",
                color: "#000000",
                fontSize: "15px",
                fontWeight: "bold"
            }
        });

        // ✅ Gérer le clic sur le polygone
        google.maps.event.addListener(polygon, 'click', function(event) {
            const lieu = {
                name: quartier.fields.Nom || "Quartier inconnu",
                description: quartier.fields.Description || "Aucune description disponible",
                image: quartier.fields.URLPhoto || "https://via.placeholder.com/300x150?text=Aucune+Image",
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            };
            showLieuDetails(lieu);
        });

        // ✅ Gérer le clic sur le label du quartier
        google.maps.event.addListener(labelMarker, 'click', function(event) {
            google.maps.event.trigger(polygon, 'click', event);
        });

        // ✅ Stocker le polygone et le label pour les supprimer plus tard
        quartierPolygons.push(polygon);
        quartierLabels.push(labelMarker);
    });
}

/********************************************************
 * Fonction pour calculer le centre d'un polygone
 ********************************************************/
function getPolygonCenter(coords) {
    let latSum = 0;
    let lngSum = 0;
    let count = coords.length;

    coords.forEach(coord => {
        latSum += coord.lat;
        lngSum += coord.lng;
    });

    return { lat: latSum / count, lng: lngSum / count };
}

function enlargeImage(url) {
    const imagePopup = document.createElement("div");
    imagePopup.innerHTML = `
        <div id="image-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
        ">
            <img src="${url}" style="max-width: 90%; max-height: 90%; border-radius: 10px;">
            <span id="close-overlay" style="
                position: absolute;
                top: 15px;
                right: 20px;
                font-size: 30px;
                color: white;
                font-weight: bold;
                cursor: pointer;
            ">&times;</span>
        </div>
    `;

    document.body.appendChild(imagePopup);

    // Fermer l'image en plein écran au clic sur la croix ou en dehors
    document.getElementById("close-overlay").addEventListener("click", () => {
        imagePopup.remove();
    });

    document.getElementById("image-overlay").addEventListener("click", (event) => {
        if (event.target.id === "image-overlay") {
            imagePopup.remove();
        }
    });
}

function clearStreetPolylines() {
    console.log("🧹 Suppression des polylines et des labels des rues...");

    // 🔴 Supprimer toutes les polylines des rues
    streetPolylines.forEach(polyline => polyline.setMap(null));
    streetPolylines = []; // 🔄 Réinitialise le tableau

    // 🔴 Supprimer tous les labels des rues (marqueurs invisibles)
    streetLabels.forEach(label => label.setMap(null));
    streetLabels = []; // 🔄 Réinitialise le tableau des labels
}

// Fonction pour recentrer la carte sur la position actuelle (réelle ou simulée)
function recenterMap() {
    if (userMarker) {
        // Centre la carte sur la position exacte du marqueur
        map.setCenter(userMarker.getPosition());
        // Décale la vue de la carte de 100 pixels vers le bas
        // (ce qui fait apparaître le marqueur un peu plus haut)
        map.panBy(0, 100);
    }
}

function createCircularMarkerIcon(imageUrl, size, borderColor = "#FF0000") {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
  
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function () {
        // Dessine un cercle de fond (bordure)
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
        ctx.fillStyle = borderColor;
        ctx.fill();
  
        // Découpe circulaire
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 3, 0, 2 * Math.PI);
        ctx.clip();
  
        // Dessine l’image à l’intérieur du cercle
        ctx.drawImage(img, 0, 0, size, size);
  
        ctx.restore();
  
        // Résout la promesse avec l’URL
        resolve(canvas.toDataURL());
      };
  
      img.onerror = function () {
        console.warn("⚠️ Impossible de charger l’image : " + imageUrl);
        resolve("https://via.placeholder.com/" + size); // Fallback
      };
  
      img.src = imageUrl;
    });
  }
  