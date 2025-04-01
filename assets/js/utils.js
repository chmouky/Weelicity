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
  
  window.getCurrentPosition = getCurrentPosition; 
  