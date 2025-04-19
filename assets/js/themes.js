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
          <p>${DescriptionC || 'Pas de description'}</p>
        `;
        card.addEventListener('click', () => {
          document.querySelectorAll('.tag-card').forEach(c => c.classList.remove('selected'));
          selectedTags.clear();
          selectedTags.add(CalcID);
          card.classList.add('selected');
        
          popupTitle.textContent = Nom;
          popupContent.textContent = Description || 'No detailed description available.';
        
          // 🔍 Trouver l'objet complet pour ce thème
          const selectedTheme = themes.find(t => t.fields?.CalcID === CalcID);
          const daySelector = document.getElementById("day-selector");
          daySelector.innerHTML = ""; // Reset
          
          if (selectedTheme?.fields?.Days && !isNaN(selectedTheme.fields.Days)) {
            const maxDays = parseInt(selectedTheme.fields.Days);
            for (let i = 1; i <= maxDays; i++) {
              const option = document.createElement("option");
              option.value = i;
              option.textContent = i;
              daySelector.appendChild(option);
            }
            document.getElementById("popup-days-container").style.display = "block";
          } else {
            document.getElementById("popup-days-container").style.display = "none";
          }
          continuePopupBtn.disabled = true;
          continuePopupBtn.style.opacity = 0.5;
          daySelector.addEventListener("change", () => {
            if (daySelector.value) {
              continuePopupBtn.disabled = false;
              continuePopupBtn.style.opacity = 1;
            }
          });
          
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
  