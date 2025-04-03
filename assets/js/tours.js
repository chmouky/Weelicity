// Fichier : tours.js

let map;
const markers = [];
let filteredPlacesWithCoords = [];
let userMarker = null;
let markerStates = {};

function getThemeIDFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("themeID");
}

function initMap(containerId, lat, lng, zoom) {
  return new google.maps.Map(document.getElementById(containerId), {
    center: { lat, lng },
    zoom,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: "greedy"
  });
}

function updateToursByDay() {
  const tourJSON = sessionStorage.getItem("tour");
  if (!tourJSON) return;

  const themeID = getThemeIDFromURL();
  let tours = JSON.parse(tourJSON);
  const dayValue = parseInt(document.getElementById("my-selector").value, 10);

  const filteredTours = tours.filter(tour =>
    Number(tour.fields.Day) === dayValue &&
    tour.fields.CalcTheme?.toString() === themeID
  ).sort((a, b) => Number(a.fields.Tri) - Number(b.fields.Tri));

  const carouselData = filteredTours.map(tour => ({
    name: tour.fields.Nom,
    descriptionC: tour.fields.DescriptionC,
    description: tour.fields.Description,
    image: tour.fields.URLPhoto,
    lat: parseFloat(tour.fields.Latitude),
    lng: parseFloat(tour.fields.Longitude),
    calcID: tour.fields.CalcID.toString()
  }));

  displayCarousel(carouselData);
}

function displayCarousel(data) {
  const container = document.getElementById("carousel-container");
  container.innerHTML = "";

  data.forEach(record => {
    const item = document.createElement("div");
    item.className = "carousel-item";
    item.dataset.name = record.name;
    item.dataset.calcid = record.calcID;

    const title = document.createElement("h3");
    title.textContent = record.name;
    title.addEventListener("click", () => showPopup(record));

    const image = document.createElement("img");
    image.src = record.image;
    image.alt = record.name;
    image.addEventListener("click", () => showPopup(record));

    const titleContainer = document.createElement("div");
    titleContainer.style.display = "flex";
    titleContainer.style.alignItems = "center";
    titleContainer.append(title);

    item.append(titleContainer);
    item.append(image);
    container.append(item);
  });

  setupCarouselObserver();
}

function setupCarouselObserver() {
  const container = document.getElementById("carousel-container");
  const items = document.querySelectorAll(".carousel-item");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const calcID = entry.target.dataset.calcid;
        const related = getRelatedPlaces(calcID);
        updateMapMarkers(related);
      }
    });
  }, { root: container, threshold: 0.5 });

  items.forEach(item => observer.observe(item));
}

function getRelatedPlaces(calcID) {
  const places = JSON.parse(sessionStorage.getItem("places")) || [];

  return places.filter(p => {
    if (!p.fields.CalcTours) return false;
    const calcToursArray = p.fields.CalcTours
      .split(',')
      .map(val => val.trim());
    return calcToursArray.includes(calcID.toString());
  }).map(p => ({
    name: p.fields.Nom,
    description: p.fields.Description,
    image: p.fields.URLPhoto,
    lat: parseFloat(p.fields.Latitude),
    lng: parseFloat(p.fields.Longitude)
  }));
}

function updateMapMarkers(places) {
  markers.forEach(m => m.setMap(null));
  markers.length = 0;

  places.forEach(place => {
    const imageUrl = place.image || "https://via.placeholder.com/80";

    const marker = new google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map,
      title: place.name,
      icon: {
        url: createCircularImage(imageUrl),
        scaledSize: new google.maps.Size(50, 50)
      }
    });

    marker.lieuName = place.name;
    marker.lieuData = place;
    marker.addListener("click", () => showLieuDetails(place));
    markers.push(marker);
  });
}


function showPopup(data) {
  const popup = document.getElementById("popup");
  document.getElementById("popup-title").textContent = data.name;
  document.getElementById("popup-description").textContent = data.description;
  const lieuxList = document.getElementById("popup-lieux-list");
  lieuxList.innerHTML = "";

  const lieuxAssocies = getRelatedPlaces(data.calcID);

  lieuxAssocies.forEach((lieu) => {
    const listItem = document.createElement("li");

    const link = document.createElement("a");
    link.href = "#";
    link.textContent = lieu.name;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showLieuDetails(lieu);
    });

    const toggleBtn = document.createElement("div");
    toggleBtn.classList.add("toggle-btn");
    toggleBtn.dataset.lieuName = lieu.name;

    if (markerStates[lieu.name]) {
      toggleBtn.classList.add("inactive");
    }

    toggleBtn.addEventListener("click", function () {
      this.classList.toggle("inactive");
      const isRed = this.classList.contains("inactive");
      markerStates[lieu.name] = isRed;
      updateMapMarkers(getRelatedPlaces(data.calcID));
    });

    listItem.appendChild(link);
    listItem.appendChild(toggleBtn);
    lieuxList.appendChild(listItem);
  });

  popup.style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function showLieuDetails(lieu) {
    if (!lieu) {
      alert("Erreur : Lieu non trouvé !");
      return;
    }
  
    const popup = document.getElementById("popup-lieu-details");
    if (!popup) return;
  
    document.getElementById("popup-lieu-title").textContent = lieu.name || "Nom inconnu";
    document.getElementById("popup-lieu-description").textContent = lieu.description || "Description indisponible";
    document.getElementById("popup-lieu-image").src = lieu.image || "https://via.placeholder.com/300x150?text=No+Image";
  
    const linkContainer = document.getElementById("popup-lieu-link");
    linkContainer.innerHTML = "";
    const googleLink = document.createElement("a");
    googleLink.href = `https://www.google.com/search?q=Visit+${encodeURIComponent(lieu.name)}+Paris`;
    googleLink.target = "_blank";
    googleLink.textContent = `${lieu.name} on Google`;
    googleLink.style.color = "var(--theme-color)";
    googleLink.style.textDecoration = "underline";
    linkContainer.appendChild(googleLink);
  
    // Gérer le bouton toggle
    const toggleBtn = document.getElementById("popup-lieu-toggle-btn");
    toggleBtn.dataset.lieuName = lieu.name;
    if (markerStates[lieu.name]) {
      toggleBtn.classList.add("inactive");
    } else {
      toggleBtn.classList.remove("inactive");
    }
  
    toggleBtn.onclick = function () {
      toggleBtn.classList.toggle("inactive");
      const isRed = toggleBtn.classList.contains("inactive");
      updateMarkerColor(lieu.name, isRed);
    };
  
    document.getElementById("overlay").style.display = "block";
    document.body.classList.add("no-scroll");
    popup.style.display = "block";
  }
  
  function onGoogleMapsLoaded() {
    map = window.initMap("map", 48.8200, 2.3222, 11.5);
    updateSelectorDays();
  
    // 📍 Affiche la position de l'utilisateur avec un marqueur jaune
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
  
          userMarker = new google.maps.Marker({
            position: userPos,
            map: map,
            title: "Your location",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
              scaledSize: new google.maps.Size(40, 40)
            }
          });
        },
        (error) => {
          console.warn("Erreur lors de la géolocalisation :", error);
        }
      );
    } else {
      console.warn("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  }
  

function updateSelectorDays() {
  const tours = JSON.parse(sessionStorage.getItem("tour")) || [];
  const themeID = getThemeIDFromURL();
  const days = [...new Set(tours.filter(t => t.fields.CalcTheme?.toString() === themeID).map(t => Number(t.fields.Day)))];
  const selector = document.getElementById("my-selector");
  selector.innerHTML = '<option value="" selected disabled>Select a duration</option>';
  days.sort((a, b) => a - b).forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = `${day} day${day > 1 ? 's' : ''}`;
    selector.appendChild(opt);
  });
}

document.getElementById("back-button").addEventListener("click", () => window.history.back());

document.getElementById("my-selector").addEventListener("change", function () {
  const goBtn = document.getElementById("go-button");
  const message = document.getElementById("duration-message");
  if (this.value) {
    goBtn.style.display = "block";
    message.classList.add("hidden");
    this.classList.add("selected");
    updateToursByDay();
  } else {
    goBtn.style.display = "none";
    message.classList.remove("hidden");
    this.classList.remove("selected");
  }
});

document.querySelectorAll(".popup-close").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#popup, #popup-lieu-details, #popup-itinerary").forEach(p => p.style.display = "none");
    document.getElementById("overlay").style.display = "none";
  });
});

document.getElementById("go-button").addEventListener("click", async () => {
  try {
    const userPos = await getCurrentPosition();
    const greenPlaces = markers.filter(m => !markerStates[m.lieuName]).map(m => m.lieuData);
    if (greenPlaces.length < 1) {
      alert("❌ Aucun lieu sélectionné en vert !");
      return;
    }
    greenPlaces.unshift({ name: "My location", lat: userPos.lat, lng: userPos.lng });
    const distanceMatrix = getDistanceMatrix(greenPlaces);
    const tspPath = solveTSPNearestNeighbor(distanceMatrix, greenPlaces);
    const ordered = tspPath.map(i => greenPlaces[i]);
    filteredPlacesWithCoords = ordered;

    let tspResult = "<ul>";
    ordered.forEach((place, index) => {
      tspResult += `<li><a href="#" class="popup-link" data-index="${index}">${index + 1}. ${place.name}</a></li>`;
    });
    tspResult += "</ul>";
    document.getElementById("popup-itinerary-description").innerHTML = tspResult;

    const popupLinkContainer = document.getElementById("popup-itinerary-link");
    popupLinkContainer.innerHTML = "";
    const googleBtn = document.createElement("button");
    googleBtn.textContent = "Get the itinerary on Google Maps";
    googleBtn.id = "google-maps-button";
    googleBtn.onclick = () => {
      const url = buildOptimizedGoogleMapsUrl(ordered);
      window.open(url, "_blank");
    };
    popupLinkContainer.appendChild(googleBtn);

    document.getElementById("popup-itinerary").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  } catch (error) {
    alert("Erreur : " + error);
  }
});

document.getElementById("popup-itinerary-description").addEventListener("click", function (e) {
  if (e.target.classList.contains("popup-link")) {
    e.preventDefault();
    const index = parseInt(e.target.dataset.index);
    showLieuDetails(filteredPlacesWithCoords[index]);
  }
});

function updateMarkerColor(nomLieu, isRed) {
    markerStates[nomLieu] = isRed;
  
    markers.forEach(marker => {
      if (marker.lieuName === nomLieu) {
        marker.setIcon({
          url: isRed
            ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            : "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new google.maps.Size(40, 40)
        });
      }
    });
  }
  
  function createCircularImage(imageUrl) {
    const canvas = document.createElement("canvas");
    const size = 100;
    canvas.width = size;
    canvas.height = size;
  
    const ctx = canvas.getContext("2d");
  
    const img = new Image();
    img.crossOrigin = "Anonymous"; // pour éviter les soucis CORS
    img.src = imageUrl;
  
    // Return a placeholder image for now (sera mis à jour async)
    const placeholder = "https://via.placeholder.com/100/cccccc/ffffff?text=.";
  
    img.onload = () => {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.stroke();
      
      ctx.drawImage(img, 0, 0, size, size);
    };
  
    return canvas.toDataURL("image/png") || placeholder;
  }
  