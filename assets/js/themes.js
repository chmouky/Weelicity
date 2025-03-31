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
    }
  
    continuePopupBtn.addEventListener("click", () => {
      const selected = document.querySelector(".tag-card.selected");
      if (!selected) return alert("❌ Aucun thème sélectionné !");
      const calcId = selected.dataset.calcid;
      window.location.href = `tags1?themeID=${encodeURIComponent(calcId)}`;
    });
  
    const stored = sessionStorage.getItem("themetour");
    if (stored) {
      displayThemes(JSON.parse(stored));
    } else {
      alert("Aucun thème trouvé dans le sessionStorage.");
    }
  });
  