document.addEventListener("DOMContentLoaded", () => {
    const tagGrid = document.getElementById('tag-grid');
    const popup = document.getElementById("popup");
    const overlay = document.getElementById("overlay");
    const popupContent = document.getElementById("popup-content");
    const popupTitle = document.getElementById("popup-title");
    const continuePopupBtn = document.getElementById("continue-popup-btn");
    const selectedTags = new Set();
  
    document.getElementById("back-button").addEventListener("click", () => {
      window.history.back();
    });
  
    function displayThemes(themes) {
      if (!themes?.length) return;
    
      themes.forEach(theme => {
        const { Nom, DescriptionC, URLPhoto, CalcID, Description } = theme.fields || {};
        
        const card = document.createElement('div');
        card.className = "tag-card";
        card.dataset.calcid = CalcID;
        card.innerHTML = `
          <img src="${URLPhoto || 'https://via.placeholder.com/150'}" alt="${Nom}">
          <h3>${Nom}</h3>
          <p>${DescriptionC || 'Pas de description'} </p>
        `;
    
        card.addEventListener('click', () => {
          document.querySelectorAll('.tag-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectedTags.clear();
          selectedTags.add(CalcID);
    
          // 🔵 Titre en couleur
          popupTitle.textContent = Nom;
          popupTitle.style.color = 'var(--theme-color)';
    
          popupContent.textContent = Description || 'No detailed description available.';
    
          const selectedTheme = themes.find(t => t.fields?.CalcID === CalcID);
          const daySelector = document.getElementById("day-selector");
          const dayContainer = document.getElementById("popup-days-container");
    
          // Affichage du texte durée
          let durationText = document.getElementById("day-count-text");
          if (!durationText) {
            durationText = document.createElement("p");
            durationText.id = "day-count-text";
            durationText.style.fontFamily = "'Shrikhand', cursive";
            durationText.style.fontSize = "0.9rem";
            durationText.style.color = "#555";
            durationText.style.marginTop = "8px";
            dayContainer.appendChild(durationText);
          }
    
          daySelector.innerHTML = "";
          continuePopupBtn.disabled = true;
          continuePopupBtn.style.opacity = 0.5;
    
          const dayCount = selectedTheme?.fields?.Days;
    
          if (dayCount && !isNaN(dayCount)) {
            const count = parseInt(dayCount);
            dayContainer.style.display = "block";
            durationText.textContent = `This tour lasts ${count} day${count > 1 ? 's' : ''}`;
    
            if (count === 1) {
              // S'il n'y a qu'un jour → bouton activé directement
              const option = document.createElement("option");
              option.value = 1;
              option.textContent = "1";
              daySelector.appendChild(option);
              daySelector.value = "1";
              continuePopupBtn.disabled = false;
              continuePopupBtn.style.opacity = 1;
            } else {
              // Plusieurs jours : ajouter placeholder
              const placeholder = document.createElement("option");
              placeholder.value = "";
              placeholder.textContent = "-- Select --";
              placeholder.disabled = true;
              placeholder.selected = true;
              daySelector.appendChild(placeholder);
    
              for (let i = 1; i <= count; i++) {
                const option = document.createElement("option");
                option.value = i;
                option.textContent = i;
                daySelector.appendChild(option);
              }
    
              daySelector.addEventListener("change", () => {
                if (daySelector.value) {
                  continuePopupBtn.disabled = false;
                  continuePopupBtn.style.opacity = 1;
                }
              }, { once: true });
            }
    
          } else {
            // Pas de valeur pour Days
            dayContainer.style.display = "none";
            durationText.textContent = "";
          }
    
          overlay.style.display = "block";
          popup.style.display = "flex";
          document.body.style.overflow = "hidden";
        });
    
        tagGrid.appendChild(card);
      });
    }
    
    
    document.querySelector("#popup .close-btn").addEventListener("click", closePopup);
    overlay.addEventListener("click", closePopup);
  
    function closePopup() {
      popup.style.display = "none";
      overlay.style.display = "none";
      document.body.style.overflow = "auto"; 
      continuePopupBtn.disabled = false; // pour réinitialiser
      continuePopupBtn.style.opacity = 1;
    }
  
    continuePopupBtn.addEventListener("click", () => {
      const selected = document.querySelector(".tag-card.selected");
      if (!selected) return alert("❌ Aucun thème sélectionné !");
      const calcId = selected.dataset.calcid;
      const selectedDays = document.getElementById("day-selector")?.value || 1;
      window.location.href = `tours?themeID=${encodeURIComponent(calcId)}&days=${selectedDays}`;
    });
    
  
    const stored = sessionStorage.getItem("themetour");
    if (stored) {
      displayThemes(JSON.parse(stored));
    } else {
      alert("Aucun thème trouvé dans le sessionStorage.");
    }
  });
  