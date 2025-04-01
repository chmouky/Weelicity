
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("overlay");
  
    document.getElementById("openPopupButton").addEventListener("click", () => openPopup("popup"));
    document.getElementById("openButtonsPopup").addEventListener("click", () => openPopup("buttonsPopup"));
    document.getElementById("closeSelectorPopupBtn").addEventListener("click", closePopup);
    document.querySelector(".closeButtonsPopup").addEventListener("click", closePopup);
    overlay.addEventListener("click", closePopup);
  
    document.getElementById("iawtf-button").addEventListener("click", () => {
      toggleMoreButtons(false);
      document.getElementById("loadingGif").style.display = "block";
      stopCurrentNarration();
      setTimeout(() => displayPOIs(), 1000);
    });
  
    document.getElementById("StopButton").addEventListener("click", () => {
      stopNarration();
      showIAWTFButton();
      showButtonsAfterNarration();
    });
  
    document.getElementById("poisContainer").addEventListener("click", (event) => {
      const poi = event.target.closest(".poi");
      if (poi) {
        document.querySelectorAll(".poi").forEach(p => p.classList.remove("selected"));
        poi.classList.add("selected");
        selectedPOI = poi.querySelector("p").textContent;
      }
    });
  });
  
  function openPopup(id) {
    document.getElementById(id).style.display = "block";
    document.getElementById("overlay").style.display = "block";
    document.body.classList.add("no-scroll");
  }
  
  function closePopup() {
    document.querySelectorAll("#popup, #buttonsPopup, #overlay").forEach(el => el.style.display = "none");
    document.body.classList.remove("no-scroll");
  }
  
  function stopNarration() {
    window.speechSynthesis.cancel();
    if (currentAudio) currentAudio.pause();
    document.getElementById("stopButtonContainer").style.display = "none";
    document.getElementById("poisContainer").style.display = "block";
  }
  
  function showIAWTFButton() {
    document.getElementById("iawtf-button").style.visibility = "visible";
  }
  
  function showButtonsAfterNarration() {
    document.getElementById("openButtonsPopup").style.display = "flex";
    document.getElementById("moreButton").style.display = "flex";
  }
  
  function toggleMoreButtons(show) {
    document.getElementById("openButtonsPopup").style.display = show ? "flex" : "none";
    document.getElementById("moreButton").style.display = show ? "flex" : "none";
  }
  
  let selectedPOI = "";
  let currentAudio = null;
  
  async function displayPOIs() {
    const container = document.getElementById("poisContainer");
    container.innerHTML = "";
    container.style.display = "block";
  
    try {
      const { latitude, longitude } = await getCoordinates();
      const url = `https://google-poi.samueltoledano94.workers.dev/?lat=${latitude}&lng=${longitude}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!data.results) throw new Error("Aucun POI trouvé");
  
      data.results.slice(0, 2).forEach(poi => {
        const div = document.createElement("div");
        div.className = "poi";
  
        if (poi.photoUrl) {
          const img = document.createElement("img");
          img.src = poi.photoUrl;
          div.appendChild(img);
        }
        const p = document.createElement("p");
        p.textContent = poi.name;
        div.appendChild(p);
        container.appendChild(div);
      });
  
      document.getElementById("loadingGif").style.display = "none";
    } catch (error) {
      console.error("Erreur POI :", error);
      document.getElementById("loadingGif").style.display = "none";
    }
  }
  
  async function getCoordinates() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        err => reject(err)
      );
    });
  }
  