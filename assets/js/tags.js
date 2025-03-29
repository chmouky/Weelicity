const tagGrid = document.getElementById('tag-grid');
const selectedTags = new Set();
const continueButton = document.getElementById("continue-btn");
const backButton = document.getElementById("back-button");

backButton.addEventListener("click", () => {
  window.history.back();
});

continueButton.addEventListener("click", () => {
  const selectedCards = document.querySelectorAll('.tag-card.selected');

  if (selectedCards.length === 0) {
    alert("⚠️ Please select at least one interest to continue.");
    return;
  }

  const selectedCalcIDs = Array.from(selectedCards).map(card => card.dataset.calcid);
  const targetUrl = `spots?filter=${encodeURIComponent(selectedCalcIDs.join(","))}`;
  window.location.href = targetUrl;
});

function displayThemes(themes) {
  if (!themes || themes.length === 0) return;

  const filteredThemes = themes.filter(theme =>
    theme.fields &&
    Array.isArray(theme.fields.Domaine) &&
    theme.fields.Domaine.includes("Visite")
  );

  filteredThemes.forEach(theme => {
    const fields = theme.fields || {};
    const { Nom, DescriptionC, URLPhoto, CalcID } = fields;

    const themeCard = document.createElement('div');
    themeCard.classList.add('tag-card');
    themeCard.dataset.calcid = CalcID;

    themeCard.innerHTML = `
      <img src="${URLPhoto || 'https://via.placeholder.com/150'}" alt="${Nom}">
      <h3>${Nom}</h3>
      <p>${DescriptionC || 'Aucune description disponible.'}</p>
    `;

    themeCard.addEventListener('click', () => toggleTag(themeCard));
    tagGrid.appendChild(themeCard);
  });
}

function toggleTag(tagElement) {
  const calcID = tagElement.dataset.calcid;

  if (selectedTags.has(calcID)) {
    selectedTags.delete(calcID);
    tagElement.classList.remove('selected');
  } else {
    selectedTags.add(calcID);
    tagElement.classList.add('selected');
  }

  updateContinueButtonVisibility();
}

function updateContinueButtonVisibility() {
  continueButton.style.display = selectedTags.size > 0 ? "block" : "none";
}

function loadThemesFromStorage() {
  const storedTags = sessionStorage.getItem('tags');
  if (!storedTags) {
    alert("❌ Aucune donnée Tag trouvée dans le sessionStorage.");
    return;
  }

  const preloadedTags = JSON.parse(storedTags);
  displayThemes(preloadedTags);
}

document.addEventListener("DOMContentLoaded", () => {
  loadThemesFromStorage();
  updateContinueButtonVisibility();
});
