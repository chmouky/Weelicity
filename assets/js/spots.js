let map;
let userMarker = null;

const markers = [];
let filteredPlacesWithCoords = []; // Stockage global des lieux filtrés
// Variable globale pour stocker le marqueur de prévisualisation
let previewMarker = null;
// Nous conservons également la liste des lieux affichés dans le carousel pour y accéder depuis l’observateur
window.carouselRecords = [];

  // Gestion du bouton "Retour"
  document.getElementById("back-button").addEventListener("click", () => {
      saveButtonState();  // Sauvegarde l'état des boutons activés
      window.history.back();
  });
document.getElementById("search-container").addEventListener("click", function () {
  this.classList.add("active");
  document.getElementById("search-bar").focus();
});

// Ferme la barre de recherche lorsque l'utilisateur appuie sur "Entrée"
document.getElementById("search-bar").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
      document.getElementById("search-container").classList.remove("active");
      this.blur(); // Perd le focus après validation
  }
});

// Ferme la barre si l'utilisateur clique ailleurs
document.addEventListener("click", function (event) {
  let searchContainer = document.getElementById("search-container");
  if (!searchContainer.contains(event.target) && document.getElementById("search-bar").value === "") {
      searchContainer.classList.remove("active");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  restoreButtonState(); // Restaure les boutons sélectionnés
  updateGoButtonVisibility(); // Vérifie si le bouton "Go!" doit être affiché
});




  // Sauvegarder l'état des boutons activés
  function saveButtonState() {
      const activeButtons = [];
      document.querySelectorAll(".carousel-item .toggle-btn.active").forEach((btn, index) => {
          activeButtons.push(index); // Sauvegarde les indices des boutons activés
      });
      sessionStorage.setItem("activeButtons", JSON.stringify(activeButtons));
  }

  // Restaurer l'état des boutons activés après le retour
  function restoreButtonState() {
      const savedButtons = sessionStorage.getItem("activeButtons");
      if (savedButtons) {
          const activeIndices = JSON.parse(savedButtons);
          document.querySelectorAll(".carousel-item .toggle-btn").forEach((btn, index) => {
              if (activeIndices.includes(index)) {
                  btn.classList.add("active");
              }
          });
      }
  }

  // Exécuter la restauration des boutons activés après le chargement
  document.addEventListener("DOMContentLoaded", restoreButtonState);
//// Barre recherche
document.getElementById("search-bar").addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const carouselContainer = document.getElementById("carousel-container");
      const items = document.querySelectorAll(".carousel-item");

      for (let item of items) {
          const title = item.querySelector("h3").textContent.toLowerCase();
          if (title.includes(query)) {
              // Faire défiler le carrousel pour centrer l'élément trouvé
              carouselContainer.scrollTo({
                  left: item.offsetLeft - (carouselContainer.clientWidth / 2) + (item.clientWidth / 2),
                  behavior: "smooth"
              });
              break; // Arrêter après avoir trouvé le premier match
          }
      }
  });
/********************************************************
 * Fonction pour initialiser la carte Google Maps
 ********************************************************/
function initMap(containerId, lat, lng, zoom) {
  return new google.maps.Map(document.getElementById(containerId), {
    center: { lat: lat, lng: lng },
    zoom: zoom,
    mapTypeControl: false, // Désactive le bouton "Plan / Satellite"
    streetViewControl: false, // Désactive le petit bonhomme jaune (Street View)
    fullscreenControl: false, // Désactive le bouton de plein écran
    gestureHandling: "greedy" // Permet de déplacer la carte avec un doigt       
  });
}

/********************************************************
 * Charger le script Google Maps via le Worker
 ********************************************************/
function loadGoogleMaps(url, callbackName) {
  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    if (typeof window[callbackName] === "function") {
      window[callbackName]();
    } else {
      console.error(`Erreur : La fonction de rappel "${callbackName}" n'existe pas.`);
    }
  };
  script.onerror = () => {
    console.error("Erreur : Impossible de charger le script Google Maps.");
  };
  document.head.appendChild(script);
}

/********************************************************
 * Fonction exécutée après le chargement de Google Maps
 ********************************************************/
function onGoogleMapsLoaded() {
    try {
      const containerId = "map";
      const lat = 48.8200;
      const lng = 2.3222;
      const zoom = 11.5;
  
      // Initialisation de la carte centrée sur Paris
      map = initMap(containerId, lat, lng, zoom);
  
      // 📍 Ajout du marqueur de position de l'utilisateur
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
  
            userMarker = new google.maps.Marker({
              position: userPosition,
              map: map,
              title: "Your position",
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                scaledSize: new google.maps.Size(40, 40)
              }
            });
          },
          (error) => {
            console.error("Erreur de géolocalisation :", error);
          }
        );
      }
  
      // Récupération des données des lieux depuis sessionStorage
      const placesJSON = sessionStorage.getItem("places");
      if (!placesJSON) {
        alert("Erreur : Aucune donnée 'places' trouvée dans sessionStorage.");
        return;
      }
  
      let places;
      try {
        places = JSON.parse(placesJSON);
        if (!Array.isArray(places)) {
          alert("Erreur : Les données 'places' ne sont pas un tableau.");
          return;
        }
      } catch (parseError) {
        alert("Erreur lors du parsing des données 'places'.");
        return;
      }
  
      // Récupération des tags sélectionnés depuis l'URL
      const selectedTags = new URLSearchParams(window.location.search).get("filter");
      const selectedTagIDs = selectedTags ? selectedTags.split(",").map(tag => tag.trim()) : [];
  
      if (selectedTagIDs.length === 0) {
        alert("⚠️ Erreur : Aucun tag sélectionné dans l'URL.");
        return;
      }
  
      // Filtrage des lieux qui ont au moins un tag correspondant
      const filteredPlaces = places.filter(place => {
        if (!place.fields || !place.fields.CalcTags) return false;
  
        const placeTags = place.fields.CalcTags
          .split(",")
          .map(tag => tag.trim())
          .filter(tag => tag !== "");
  
        return selectedTagIDs.some(tag => placeTags.includes(tag));
      });
  
      const filteredPlacesWithCoords = filteredPlaces.filter(place => {
        const lat = parseFloat(place.fields.Latitude);
        const lng = parseFloat(place.fields.Longitude);
        return !isNaN(lat) && !isNaN(lng);
      });
  
      // Affichage des lieux dans le carrousel
      if (filteredPlacesWithCoords.length > 0) {
        const carouselData = filteredPlacesWithCoords.map(place => {
          const rawName = place.fields.URLPhoto2 || "default.jpg";
          const encodedName = encodeURIComponent(rawName.trim());
          const imageUrl = `/assets/img/photos/Lieux/${encodedName}`;
  
          return {
            name: place.fields.Nom || "Nom inconnu",
            descriptionC: place.fields.DescriptionC || "Description courte indisponible",
            description: place.fields.Description || "Description indisponible",
            image: imageUrl,
            lat: parseFloat(place.fields.Latitude),
            lng: parseFloat(place.fields.Longitude),
            inout: Array.isArray(place.fields.Inout) ? place.fields.Inout : [],
            ticket: Array.isArray(place.fields.Ticket) ? place.fields.Ticket : []
          };
        });
  
        displayCarousel(carouselData);
      } else {
        alert("❌ Aucun lieu ne correspond aux tags sélectionnés.");
      }
  
    } catch (error) {
      alert("❌ Erreur lors de l'initialisation de Google Maps : " + error);
    }
  }
  


/********************************************************
 * Charger le script Google Maps lors du chargement de la page
 ********************************************************/
document.addEventListener("DOMContentLoaded", () => {
  try {
    loadGoogleMaps(
      "https://google-map-back.samueltoledano94.workers.dev/load-google-maps",
      "onGoogleMapsLoaded"
    );
  } catch (error) {
    console.error("Erreur lors du chargement de Google Maps API :", error);
  }
});

/********************************************************
 * Fonction pour afficher le carrousel des lieux
 ********************************************************/
function displayCarousel(data) {
  const carouselContainer = document.getElementById("carousel-container");
  if (!carouselContainer) return;

  // Stocker les données globalement pour le scroll
  window.carouselRecords = data;

  // Nettoyer le carrousel
  carouselContainer.innerHTML = "";

  // Ajouter un espace avant le premier élément pour le centrage
  const startSpacer = document.createElement("div");
  startSpacer.style.flex = "0 0 50px";
  carouselContainer.appendChild(startSpacer);

  // Ajout des lieux au carrousel
  data.forEach((record, index) => {
      const item = document.createElement("div");
      item.classList.add("carousel-item");
      item.setAttribute("data-index", index);
      item.style.position = "relative"; // Pour positionner correctement les infos

      // 📌 Conteneur du titre et icône d'information
      const titleContainer = document.createElement("div");
      titleContainer.style.display = "flex";
      titleContainer.style.alignItems = "center";
      titleContainer.style.cursor = "pointer";

      // 📌 Nom du lieu (cliquable)
      const title = document.createElement("h3");
      title.textContent = record.name;
      title.style.marginRight = "5px";
      title.addEventListener("click", () => showPopup(record)); // ✅ Clic sur le nom ouvre le popup

      // 📌 Icône d'information (cliquable)
      const infoIcon = document.createElement("img");
      infoIcon.src = "https://images.squarespace-cdn.com/content/67532c2bdde707065c5de483/da9bdef7-0912-4295-9536-d3667348059a/info.png?content-type=image%2Fpng";
      infoIcon.alt = "Info";
      infoIcon.style.width = "14px";
      infoIcon.style.height = "14px";
      infoIcon.style.cursor = "pointer";
      infoIcon.style.opacity = "0.7";
      infoIcon.title = "Click for more info";
      infoIcon.style.position = "relative";
      infoIcon.style.top = "-5px";
      infoIcon.style.marginLeft = "2px";
      infoIcon.addEventListener("click", (event) => {
          event.stopPropagation();
          showPopup(record);
      });

      titleContainer.appendChild(title);
      titleContainer.appendChild(infoIcon);
      item.appendChild(titleContainer);

      // 📌 Image du lieu (cliquable)
      const image = document.createElement("img");
      image.src = record.image;
      image.alt = record.name;
      image.style.cursor = "pointer"; // ✅ Rend l'image cliquable
      image.addEventListener("click", () => showPopup(record)); // ✅ Clic sur l'image ouvre le popup

      item.appendChild(image);

      // 📌 Bouton toggle (ON/OFF)
      const toggleBtn = document.createElement("div");
      toggleBtn.classList.add("toggle-btn");
      toggleBtn.addEventListener("click", () => toggleButton(toggleBtn, record));
      item.appendChild(toggleBtn);

// 🔽 Ajout du bloc Inout / Ticket
const infoDiv = document.createElement("div");
infoDiv.classList.add("carousel-info");

let inoutText = "";
if (Array.isArray(record.inout) && record.inout.length > 0) {
// Affiche directement IN ou OUT en majuscules
inoutText = record.inout[0].toUpperCase();
}

const ticketText = (Array.isArray(record.ticket) &&
                  record.ticket.length > 0 &&
                  record.ticket[0].toUpperCase() === "OUI")
                  ? "Need Ticket"
                  : "";

infoDiv.innerHTML = `${inoutText}${(inoutText && ticketText) ? "<br>" : ""}${ticketText}`;
item.appendChild(infoDiv);


      carouselContainer.appendChild(item);
  });

  // Ajouter un espace après le dernier élément pour le centrage
  const endSpacer = document.createElement("div");
  endSpacer.style.flex = "0 0 50px";
  carouselContainer.appendChild(endSpacer);

  carouselContainer.addEventListener("scroll", handleCarouselScroll);
  handleCarouselScroll();

setTimeout(updateCarouselArrows, 100); // Laisse le DOM se stabiliser

}


/********************************************************
 * Fonction pour gérer le scroll du carousel et afficher un marqueur de prévisualisation
 * Modification : le marqueur rouge est affiché même si le lieu est déjà sélectionné.
 ********************************************************/
function handleCarouselScroll() {
  const carouselContainer = document.getElementById("carousel-container");
  if (!carouselContainer) return;

  const containerRect = carouselContainer.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;
  let closestItem = null;
  let minDistance = Infinity;

  const items = carouselContainer.querySelectorAll('.carousel-item');
  items.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.left + itemRect.width / 2;
    const distance = Math.abs(containerCenter - itemCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestItem = item;
    }
  });

  // 🔸 Supprime le marqueur précédent s’il existe
  if (previewMarker) {
    previewMarker.setMap(null);
    previewMarker = null;
  }

  if (closestItem) {
    const index = closestItem.getAttribute("data-index");
    const record = window.carouselRecords[index];
    if (!record) return;

    // 🔸 Ne pas ajouter de preview si le lieu est déjà sélectionné (bouton vert actif)
    const toggleButton = closestItem.querySelector(".toggle-btn");
    const isActive = toggleButton && toggleButton.classList.contains("active");

    if (!isActive) {
      // Crée un marqueur circulaire temporaire pour prévisualisation
      createCircularImageMarker(record.image, (dataUrl) => {
        previewMarker = new google.maps.Marker({
          position: { lat: record.lat, lng: record.lng },
          map: map,
          title: record.name,
          icon: {
            url: dataUrl,
            scaledSize: new google.maps.Size(50, 50)
          }
        });
      });
    }
  }
}


/********************************************************
 * Gestion du bouton bascule pour activer/désactiver un lieu
 ********************************************************/
function toggleButton(button, record) {
  let selectedMarkersCount = markers.length;
  if (!button.classList.contains("active") && selectedMarkersCount >= 8) {
      alert("Maximum number of visitation points reached for an itinerary. Deselect other points or create a new itinerary.");
      return;
  }

  // Bascule l'état actif du bouton
  button.classList.toggle("active");

  if (button.classList.contains("active")) {
      if (previewMarker && previewMarker.title === record.name) {
          previewMarker.setMap(null);
          previewMarker = null;
      }
      addSelectedMarker(record);
  } else {
      removeMarker(record);
      handleCarouselScroll();
  }

  // ✅ Met à jour la visibilité du bouton Go
  updateGoButtonVisibility();
}

/********************************************************
 * Ajouter un marqueur sur la carte
 ********************************************************/
function addMarker(record) {
  const marker = new google.maps.Marker({
    position: { lat: record.lat, lng: record.lng },
    map: map,
    title: record.name
  });
  markers.push(marker);
}

/********************************************************
 * Ajouter un marqueur de lieu sélectionné (en bleu)
 ********************************************************/
function addSelectedMarker(record) {
  createCircularImageMarker(record.image, (dataUrl) => {
    const marker = new google.maps.Marker({
      position: { lat: record.lat, lng: record.lng },
      map: map,
      title: record.name,
      icon: {
        url: dataUrl,
        scaledSize: new google.maps.Size(50, 50)
      }
    });
  
    marker.fullRecord = record;
    marker.addListener("click", () => showPopup(record));
    markers.push(marker);
  });
  
  
    marker.fullRecord = record; // 🔥 Ajoute les données complètes
    marker.addListener("click", () => {
      showPopup(record);
    });
  
    markers.push(marker);
  }
  
  

/********************************************************
 * Supprimer un marqueur de la carte (pour un lieu donné)
 ********************************************************/
function removeMarker(record) {
  const markerIndex = markers.findIndex(m => m.title === record.name);
  if (markerIndex !== -1) {
    markers[markerIndex].setMap(null);
    markers.splice(markerIndex, 1);
  }
}

/********************************************************
 * Afficher le popup avec les informations du lieu
 ********************************************************/
function showPopup(record) {
  if (!record) {
      return;
  }

  const popup = document.getElementById("popup");
  if (!popup) {
      return;
  }
  document.getElementById("overlay").style.display = "block";

  const titleElement = document.getElementById("popup-title");
  const descriptionCElement = document.getElementById("popup-descriptionC");
  const descriptionElement = document.getElementById("popup-description");
  const popupImageElement = document.getElementById("popup-image"); // ✅ Image ajoutée

  if (!titleElement || !descriptionCElement || !descriptionElement || !popupImageElement) {
      return;
  }

  const longDescription = record.description && record.description.trim() !== "" ? record.description : "Description indisponible";

  // 📌 Mise à jour du contenu du popup
  titleElement.textContent = record.name || "Nom inconnu";
  descriptionCElement.textContent = record.descriptionC || "Description courte indisponible";
  descriptionElement.textContent = longDescription;
  popupImageElement.src = record.image;

    popupImageElement.onerror = function () {
    this.src = "https://via.placeholder.com/300x150?text=Aucune+Image";
    };
  // 📌 Mise à jour du lien Google
  const popupLinkContainer = document.getElementById("popup-link");
  popupLinkContainer.innerHTML = "";

  const googleLink = document.createElement("a");
  googleLink.href = `https://www.google.com/search?q=Visit+${encodeURIComponent(record.name)}+Paris`;
  googleLink.target = "_blank";
  googleLink.textContent = ` ${record.name} on Google`;
  googleLink.style.color = "#007bff";
  googleLink.style.textDecoration = "underline";
  googleLink.style.display = "block";
  googleLink.style.marginTop = "10px";

  popupLinkContainer.appendChild(googleLink);

  popup.style.display = "block";
}


/********************************************************
 * Fermer le popup au clic sur la croix
 ********************************************************/
document.addEventListener("DOMContentLoaded", () => {
  const closeButtons = document.querySelectorAll(".popup-close");
  closeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const popup = button.closest("#popup, #popup-itinerary");
      if (popup) {
        popup.style.display = "none";
        document.getElementById("overlay").style.display = "none";
      }
    });
  });
});

let userPosition = null;

/********************************************************
 * Fonction pour récupérer la position actuelle
 ********************************************************/
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("La géolocalisation n'est pas prise en charge par ce navigateur.");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lng: longitude });
        },
        (error) => {
          reject("Erreur lors de la récupération de la position.");
        }
      );
    }
  });
}

document.getElementById("go-button").addEventListener("click", async () => {
  try {
      // Étape 1 : Récupérer la position actuelle
      const userPosition = await getCurrentPosition();

      // Étape 2 : Récupérer les lieux sélectionnés
      const selectedPlaces = markers.map(marker => marker.fullRecord);


      if (selectedPlaces.length < 1) {
          alert("Select at least one spot");
          return;
      }

      // Ajouter la position actuelle comme point de départ
      selectedPlaces.unshift({
          name: "My location",
          lat: userPosition.lat,
          lng: userPosition.lng,
      });

      // Étape 3 : Calculer la matrice des distances en local (sans API Google)
      const distanceMatrix = getDistanceMatrix(selectedPlaces);

      // Étape 4 : Résoudre le TSP (optimisation du trajet)
      const tspPath = solveTSPNearestNeighbor(distanceMatrix, selectedPlaces);

      // Étape 5 : Construire la liste ordonnée des lieux
      const ordered = tspPath.map(i => selectedPlaces[i]);

      // Étape 6 : Générer le lien Google Maps avec l'itinéraire
      const googleMapsUrl = buildOptimizedGoogleMapsUrl(ordered);

      // Étape 7 : Mettre à jour le popup ITINÉRAIRE
      let tspResult = `<ul>`;
      ordered.forEach((point, index) => {
          if (index === 0) {
              tspResult += `<li><strong>${index + 1}. ${point.name}</strong></li>`;
          } else {
              tspResult += `<li><a href="#" class="popup-link" data-index="${index - 1}">${index + 1}. ${point.name}</a></li>`;
          }
      });
      tspResult += `</ul>`;

      const popupItinerary = document.getElementById("popup-itinerary");
      popupItinerary.querySelector("#popup-itinerary-title").textContent = "Optimal itinerary";
      popupItinerary.querySelector("#popup-itinerary-description").innerHTML = tspResult;

      // Ajouter les événements pour ouvrir le popup des lieux après l'insertion de la liste
     document.querySelectorAll(".popup-link").forEach(link => {
  link.addEventListener("click", (event) => {
      event.preventDefault();
      const index = parseInt(event.target.getAttribute("data-index"));
      const fullRecord = ordered[index + 1];
        showPopup(fullRecord);
    });
});


      // Ajouter le bouton Google Maps
      const popupLinkContainer = document.getElementById("popup-itinerary-link");
      popupLinkContainer.innerHTML = "";
      const googleMapsButton = document.createElement("button");
      googleMapsButton.id = "google-maps-button";
      googleMapsButton.textContent = "Get the itinerary on Google Maps";
      googleMapsButton.addEventListener("click", () => {
          window.open(googleMapsUrl, "_blank");
      });
      popupLinkContainer.appendChild(googleMapsButton);

      // Afficher le popup itinéraire
      popupItinerary.style.display = "block";
      document.getElementById("overlay").style.display = "block";
  } catch (error) {
      console.error("Erreur :", error);
  }
});

// Gestion de la fermeture du popup
document.addEventListener("DOMContentLoaded", () => {
  const closePopupItinerary = document.getElementById("popup-itinerary-close");
  if (closePopupItinerary) {
      closePopupItinerary.addEventListener("click", () => {
          document.getElementById("popup-itinerary").style.display = "none";
          document.getElementById("overlay").style.display = "none";
      });
  }
});


//////////////////
function showPopupByName(placeName) {
  const place = filteredPlacesWithCoords.find(p => p.name === placeName);
  if (!place) {
    alert("Erreur : Lieu non trouvé !");
    return;
  }
  showPopup(place);
  document.getElementById("overlay").style.display = "block";
}

// Ne PAS ajouter cet appel à initMap avec DOMContentLoaded car initMap nécessite des paramètres.
// document.addEventListener("DOMContentLoaded", initMap);

function showBubble(event, message) {
// Crée un élément div pour la bulle
const bubble = document.createElement("div");
bubble.classList.add("bubble");
bubble.innerText = message;

// Ajoute la bulle dans le body
document.body.appendChild(bubble);

// Positionne la bulle près du clic
const bubbleRect = bubble.getBoundingClientRect();
let x = event.clientX;
let y = event.clientY;
// Ajuste la position pour éviter de sortir de l'écran
if (x + bubbleRect.width > window.innerWidth) {
  x = window.innerWidth - bubbleRect.width - 10;
}
if (y - bubbleRect.height < 0) {
  y = bubbleRect.height + 10;
} else {
  y = y - bubbleRect.height - 10;
}
bubble.style.left = x + "px";
bubble.style.top = y + "px";

// Supprime la bulle après 3 secondes
setTimeout(() => {
  bubble.remove();
}, 3000);
}

// Fonction pour afficher l'image en grand dans une modal
function showLargeImage(imageUrl) {
  // Créer l'élément modal
  const modal = document.createElement("div");
  modal.id = "image-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "4000"; // S'assurer qu'il passe au-dessus de tout

  // Créer l'élément image
  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.maxWidth = "90%";
  img.style.maxHeight = "90%";
  img.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.5)";
  modal.appendChild(img);

  // Fermer la modal au clic (sur n'importe quelle zone)
  modal.addEventListener("click", () => {
      modal.remove();
  });

  document.body.appendChild(modal);
}

function updateGoButtonVisibility() {
  const goButton = document.getElementById("go-button");
  const selectedPlaces = document.querySelectorAll(".toggle-btn.active").length;
  if (selectedPlaces > 0) {
      goButton.style.display = "block"; // Affiche le bouton
  } else {
      goButton.style.display = "none"; // Cache le bouton
  }
}

function updateCarouselArrows() {
const container = document.getElementById("carousel-container");
const leftArrow = document.getElementById("carousel-left-arrow");
const rightArrow = document.getElementById("carousel-right-arrow");
const items = container.querySelectorAll('.carousel-item');

let activeIndex = -1;
if (items.length > 0) {
  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;
  let minDistance = Infinity;
  items.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.left + itemRect.width / 2;
    const distance = Math.abs(containerCenter - itemCenter);
    if (distance < minDistance) {
      minDistance = distance;
      activeIndex = parseInt(item.getAttribute("data-index"));
    }
  });
}

// Masquer la flèche gauche si le premier élément est centré
if (activeIndex <= 0) {
  leftArrow.style.display = "none";
} else {
  leftArrow.style.display = "flex";
}

// Masquer la flèche droite si le dernier élément est centré
if (activeIndex >= items.length - 1) {
  rightArrow.style.display = "none";
} else {
  rightArrow.style.display = "flex";
}
}

function createCircularImageMarker(imageUrl, callback) {
  const size = 80;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  img.onload = () => {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, size, size);

    callback(canvas.toDataURL("image/png"));
  };

  img.onerror = () => {
    callback("https://via.placeholder.com/80");
  };
}


document.getElementById("carousel-container").addEventListener("scroll", updateCarouselArrows);
window.addEventListener("resize", updateCarouselArrows);
window.addEventListener("load", updateCarouselArrows);

document.getElementById("carousel-left-arrow").addEventListener("click", () => {
document.getElementById("carousel-container").scrollBy({ left: -200, behavior: "smooth" });
});

document.getElementById("carousel-right-arrow").addEventListener("click", () => {
document.getElementById("carousel-container").scrollBy({ left: 200, behavior: "smooth" });
});