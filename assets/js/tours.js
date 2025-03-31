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
  return places.filter(p => p.fields.CalcTours?.split(",").includes(calcID)).map(p => ({
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
    const marker = new google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map,
      title: place.name,
      icon: {
        url: markerStates[place.name] ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png" : "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        scaledSize: new google.maps.Size(40, 40)
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
  document.getElementById("popup-lieux-list").innerHTML = "";
  popup.style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function showLieuDetails(lieu) {
  const popup = document.getElementById("popup-lieu-details");
  document.getElementById("popup-lieu-title").textContent = lieu.name;
  document.getElementById("popup-lieu-description").textContent = lieu.description;
  document.getElementById("popup-lieu-image").src = lieu.image;
  document.getElementById("popup-lieu-details").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function onGoogleMapsLoaded() {
  map = initMap("map", 48.8200, 2.3222, 11.5);
  updateSelectorDays();
}

function updateSelectorDays() {
  const tours = JSON.parse(sessionStorage.getItem("tour")) || [];
  const themeID = getThemeIDFromURL();
  const days = [...new Set(tours.filter(t => t.fields.CalcTheme === themeID).map(t => Number(t.fields.Day)))];
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
