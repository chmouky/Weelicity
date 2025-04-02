let currentAudio = null;
  
// --------------------------------------------------
// 1. Gestion des pop-ups et overlays
// --------------------------------------------------

// Clic sur les boutons d'ouverture des popups
document.getElementById("openPopupButton").addEventListener("click", () => openPopup("popup"));
document.getElementById("openButtonsPopup").addEventListener("click", () => openPopup("buttonsPopup"));

// Clic sur l'overlay pour fermer le popup en cliquant en dehors
document.getElementById("overlay").addEventListener("click", closePopup);

// Clic sur les boutons de fermeture (croix)
document.getElementById("closeSelectorPopupBtn").addEventListener("click", closePopup);
document.querySelector(".closeButtonsPopup").addEventListener("click", closePopup);

document.addEventListener("DOMContentLoaded", () => {
// Cacher le bouton "More" au chargement
document.getElementById("openButtonsPopup").style.display = "none";
});

// 📌 Clic sur IAWTF → Cacher les boutons
document.getElementById("iawtf-button").addEventListener("click", () => {
toggleMoreButtons(false);
});

// Fonction pour afficher le bouton "More" après avoir cliqué sur un POI
function showMoreButton() {
document.getElementById("openButtonsPopup").style.display = "block";
}

// Fonction pour cacher le bouton "More" après avoir appuyé sur IAWTF
function hideMoreButton() {
document.getElementById("openButtonsPopup").style.display = "none";
}

// Ajout de l'événement sur chaque POI cliqué
document.getElementById("poisContainer").addEventListener("click", (event) => {
if (event.target.closest(".poi")) {
    showMoreButton(); // Affiche "More" quand on clique sur un POI
}
});


let selectedPOI = ""; // Stocke le POI sélectionné

document.getElementById("poisContainer").addEventListener("click", (event) => {
const poiElement = event.target.closest(".poi");

if (poiElement) {
    selectedPOI = poiElement.querySelector("p").textContent;
    document.getElementById("popupTitle").textContent = `More questions about ${selectedPOI}`;

    document.querySelectorAll(".poi").forEach(poi => poi.classList.remove("selected"));
    poiElement.classList.add("selected");

    // 🔥 Récupérer la position du POI sélectionné
    const rect = poiElement.getBoundingClientRect();
    const scrollTop = window.scrollY; // Compense le défilement vertical

    // 🔥 Positionner les boutons séparément (MAIS NE PAS LES AFFICHER)
    const openButtonsX = rect.left + rect.width / 2 - 220; // Bouton 1 (déplacé à gauche)
    const moreButtonX = rect.left + rect.width / 2 + 120; // Bouton 2 (déplacé à droite)
    const buttonsY = rect.top + scrollTop + 5; // Hauteur des boutons

    document.getElementById("openButtonsPopup").style.left = `${openButtonsX}px`;
    document.getElementById("openButtonsPopup").style.top = `${buttonsY}px`;

    document.getElementById("moreButton").style.left = `${moreButtonX}px`;
    document.getElementById("moreButton").style.top = `${buttonsY}px`; // Même hauteur

    // ❌ NE PAS AFFICHER LES BOUTONS TOUT DE SUITE ❌
    document.getElementById("openButtonsPopup").style.display = "none";
    document.getElementById("moreButton").style.display = "none";
    document.getElementById("iawtf-button").style.visibility = "hidden";
}
});

document.addEventListener("DOMContentLoaded", () => {
const moreButton = document.getElementById("moreButton");
if (moreButton) {
moreButton.addEventListener("click", requestMoreDetails);
} else {
console.warn("⚠️ Bouton 'moreButton' introuvable !");
}
});


function showIAWTFButton() {
document.getElementById("iawtf-button").style.visibility = "visible";
}

function showButtonsAfterNarration() {
document.getElementById("openButtonsPopup").style.display = "flex";
document.getElementById("moreButton").style.display = "flex";
}


document.addEventListener("DOMContentLoaded", () => {
const openButtonsPopup = document.getElementById("openButtonsPopup");
const moreButton = document.getElementById("moreButton");

// Fonction pour afficher les boutons
function showButtons() {
openButtonsPopup.style.display = "flex";
moreButton.style.display = "flex";
}

// Fonction pour cacher les boutons
function hideButtons() {
openButtonsPopup.style.display = "none";
moreButton.style.display = "none";
}
// Afficher les boutons quand on clique sur "Stop"
stopButton.addEventListener("click", showButtons);

// Cacher les boutons quand on clique sur "iawtf"
iawtfButton.addEventListener("click", hideButtons);

// Détecter la fin du vocal et afficher les boutons
if (currentAudio) {
currentAudio.addEventListener('ended', () => {
    console.log("Audio terminé");
    setTimeout(() => {
        document.getElementById("stopButtonContainer").style.display = "none"; 
        document.getElementById("poisContainer").style.display = "block"; 
        showIAWTFButton(); // ✅ Réaffiche le bouton IA
        showButtonsAfterNarration(); // ✅ Réaffiche les boutons "More"
    }, 500);
});
}


// Quand on clique sur le bouton IA, on cache les boutons
document.getElementById("iawtf-button").addEventListener("click", hideButtons);

// Quand on clique sur un POI, on affiche les boutons
//document.getElementById("poisContainer").addEventListener("click", (event) => {
//    if (event.target.closest(".poi")) {
//        showButtons();
//    }
//});

// Quand on ferme le popup des questions, on cache aussi les boutons
document.querySelector(".closeButtonsPopup").addEventListener("click", hideButtons);
});




// Pop-up de sélection (langue / temps de réponse)
const popup = document.getElementById('popup');
const overlay = document.getElementById('overlay');
const openPopupButton = document.getElementById('openPopupButton');
// On n'utilise plus closePopupButton pour le popup sélecteur
document.getElementById("closeSelectorPopupBtn").addEventListener("click", () => {
popup.style.display = "none";
overlay.style.display = "none";
});

// Ouvrir le popup des sélecteurs
openPopupButton.addEventListener('click', () => {
popup.style.display = 'block';
overlay.style.display = 'block';
});

// Pour fermer le popup si l'overlay est cliqué (ferme tous les popups)
overlay.addEventListener('click', () => {
popup.style.display = 'none';
document.getElementById("buttonsPopup").style.display = "none";
overlay.style.display = 'none';
});

// Pour animer le bouton stop
document.getElementById("StopButton").addEventListener("click", function() {
let img = document.getElementById("stopButtonImage");

img.classList.add("animated-click");

// Retirer la classe après l'animation pour pouvoir rejouer l'effet
setTimeout(() => {
    img.classList.remove("animated-click");
}, 200);
});

function openPopup(popupId) {
document.getElementById(popupId).style.display = "block";
document.getElementById("overlay").style.display = "block";
document.body.classList.add("no-scroll"); // Désactive l'interaction arrière-plan
}

function closePopup() {
document.getElementById("popup").style.display = "none";
document.getElementById("buttonsPopup").style.display = "none";
document.getElementById("overlay").style.display = "none";
document.body.classList.remove("no-scroll"); // Réactive l'interaction arrière-plan
}

// --------------------------------------------------
// 2. Gestion des boutons et de la narration
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
const poisContainer = document.getElementById("poisContainer");
const iawtfButton = document.getElementById("iawtf-button");

function positionnerPOIs() {
    const rect = iawtfButton.getBoundingClientRect();
    poisContainer.style.top = `${rect.top + window.scrollY + 260}px`; 
    poisContainer.style.left = '50%';
    poisContainer.style.transform = 'translateX(-50%)';
    poisContainer.style.width = `${rect.width}px`;
}

positionnerPOIs();
window.addEventListener("resize", positionnerPOIs);
});


// Fonction pour récupérer les POI depuis votre worker
async function fetchPOIs() {
    try {
        // Récupérer les coordonnées de l'utilisateur
        const { latitude, longitude } = await getCoordinates();
        
        // Construire l'URL vers votre worker
        const url = `https://google-poi.samueltoledano94.workers.dev/?lat=${latitude}&lng=${longitude}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error("Aucun POI trouvé.");
        }
        return data.results;
    } catch (error) {
        throw new Error("Erreur lors de la récupération des POI : " + error.message);
    }
}


// Fonction pour afficher les POI sur la page
async function displayPOIs() {
    const poisContainer = document.getElementById("poisContainer");
    poisContainer.innerHTML = "";
    poisContainer.style.display = "block";

    try {
        document.getElementById("loadingGif").style.display = "block";
        const pois = await fetchPOIs();

        if (!pois || pois.length === 0) {
            throw new Error("Aucun POI retourné par fetchPOIs.");
        }

        document.getElementById("loadingGif").style.display = "none";
        document.getElementById("iawtf-button").style.visibility = "visible";

        pois.slice(0, 2).forEach((poi) => {
            const poiElement = document.createElement("div");
            poiElement.className = "poi";

            if (poi.photoUrl) {
                const img = document.createElement("img");
                img.src = poi.photoUrl;
                img.alt = poi.name;
                poiElement.appendChild(img);
            }

            const name = document.createElement("p");
            name.textContent = poi.name;
            poiElement.appendChild(name);

            poiElement.addEventListener("click", async () => {
                document.getElementById("loadingGif").style.display = "block";
                const question = `Donne-moi un résumé historique ou culturel de ${poi.name}.`;
                try {
                    const selectedLanguage = document.getElementById("languageSelect").value || "en-US";
                    const chatGPTResponse = await askChatGPT(question, selectedLanguage);
                    document.getElementById("response").textContent = `Résumé : ${chatGPTResponse}`;
                    speakTextWithWorker(chatGPTResponse, selectedLanguage);
                } catch (error) {
                    document.getElementById("loadingGif").style.display = "none";
                }
            });

            poisContainer.appendChild(poiElement);
        });
    } catch (error) {
        document.getElementById("loadingGif").style.display = "none";
    }
}

// Quand la narration est terminée ou le bouton Stop est cliqué, réactiver les POI
function resetPOIs() {
document.querySelectorAll(".poi").forEach(poi => {
    poi.classList.remove("inactive"); // Réactiver tous les POI
});
}



// Au chargement, on s'assure que les éléments Stop et GIF sont masqués
document.addEventListener("DOMContentLoaded", () => {
const poisContainer = document.getElementById("poisContainer");
const iawtfButton = document.getElementById("iawtf-button");

function positionnerPOIs() {
const rect = iawtfButton.getBoundingClientRect();
// Placez le conteneur au niveau du haut du bouton (vous pouvez ajouter un décalage positif ou négatif)
poisContainer.style.top = `${rect.top + window.scrollY + 260}px`; // 🔼 Remonte de 50px
poisContainer.style.left = '50%';
poisContainer.style.transform = 'translateX(-50%)';
poisContainer.style.width = `${rect.width}px`;
}


// Positionner les POI au chargement
positionnerPOIs();

// Recalculer si la fenêtre est redimensionnée
window.addEventListener("resize", positionnerPOIs);
});


// Bouton IAWTF : lance la synthèse vocale avec une description historique/culturelle
document.getElementById("iawtf-button").addEventListener("click", async function() {
// Masquer immédiatement le bouton IAWTF
document.getElementById("iawtf-button").style.visibility = "hidden";

// Masquer le bouton "More"
document.getElementById("openButtonsPopup").style.display = "none";

// Afficher le GIF de chargement
document.getElementById("loadingGif").style.display = "block";

// Arrêter toute narration en cours
stopCurrentNarration();

// Lancer la recherche (les POI seront affichés ensuite)
setTimeout(() => {
displayPOIs();
}, 1000); // ⏳ Attend 500ms avant d'exécuter displayPOIs()

});




// Gestion du bouton "Stop narration"
const stopButton = document.getElementById("StopButton");
stopButton.addEventListener("click", () => {
console.log("Bouton Stop cliqué");
stopNarration();
showIAWTFButton(); // ✅ Réaffiche le bouton IA
showButtonsAfterNarration(); // ✅ Réaffiche les boutons "More"
});


// Fonction pour arrêter la narration en cours sans réafficher le bouton IAWTF
function stopCurrentNarration() {
  window.speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

// Fonction pour arrêter la narration et réafficher le bouton IAWTF
// Utilisée lorsque l'utilisateur clique sur le bouton Stop
document.addEventListener("DOMContentLoaded", () => {
const poisContainer = document.getElementById("poisContainer");
const iawtfButton = document.getElementById("iawtf-button");

function positionnerPOIs() {
    const rect = iawtfButton.getBoundingClientRect();
    poisContainer.style.top = `${rect.top + window.scrollY + 260}px`; 
    poisContainer.style.left = '50%';
    poisContainer.style.transform = 'translateX(-50%)';
    poisContainer.style.width = `${rect.width}px`;
}

positionnerPOIs();
window.addEventListener("resize", positionnerPOIs);
});


// Quand la narration est terminée ou le bouton Stop est cliqué, réactiver les POI
function resetPOIs() {
document.querySelectorAll(".poi").forEach(poi => {
    poi.classList.remove("inactive");
});
}

// Fonction qui arrête la narration et réactive les POI
function stopNarration() {
stopCurrentNarration();
document.getElementById("stopButtonContainer").style.display = "none"; 
document.getElementById("poisContainer").style.display = "block"; 
showIAWTFButton(); // ✅ Réaffiche le bouton IA
showButtonsAfterNarration(); // ✅ Réaffiche les boutons "More"
resetPOIs();
}



// Quand la narration se termine automatiquement
if (currentAudio) {
currentAudio.addEventListener('ended', () => {
    resetPOIs(); // ✅ Réactiver les POI
    document.getElementById("stopButtonContainer").style.display = "none"; 
    document.getElementById("poisContainer").style.display = "block"; 
    document.getElementById("iawtf-button").style.visibility = "visible";
});
}




// --------------------------------------------------
// 3. Gestion de l'entête lors du scroll
// --------------------------------------------------
let lastScrollPosition = 0;
const header = document.getElementById("mainHeader");

window.addEventListener("scroll", () => {
  const currentScrollPosition = window.pageYOffset;

  if (currentScrollPosition > lastScrollPosition) {
    // Scroll vers le bas, cacher l'entête
    header.classList.add("hidden");
  } else {
    // Scroll vers le haut, afficher l'entête
    header.classList.remove("hidden");
  }

  lastScrollPosition = currentScrollPosition;
});

window.addEventListener("load", () => {
  // Positionner légèrement plus bas pour cacher l'entête
//     window.scrollTo(0, 100); // 100px de défilement par exemple
  header.classList.add("hidden");
});

// --------------------------------------------------
// 4. Gestion des traductions et changement de langue
// --------------------------------------------------
const translations = {
  "fr-FR": {
    languageLabel: "Choisissez votre langue :",
    responseTimeLabel: "Temps de réponse :",
    chatButton: "Raconte-moi cet endroit",
    chatButtonnearby: "Qu'y a-t-il d'intéressant à proximité ?",
    chatButtonAnecdote: "Raconte-moi une anecdote surprenante",
    chatButtonShopping: "Faire du shopping à proximité",
    chatButtonPopularQuestion: "Question la plus populaire sur ce lieu",
    chatButtonPopularQuestion2: "Deuxième question la plus populaire sur ce lieu",
    chatButtonPopularQuestion3: "Troisième question la plus populaire sur ce lieu",
    chatButtonSmartQuestion: "Question la plus pertinente",
    chatButtonEvent: "Évènements marquants",
    chatButtonFamousPeople: "Personnages célèbres",
    chatButtonArtAndArchitecture: "L'architecture et l'art",
    chatButtonMustSee: "Les incontournables",
    chatButtonBestPhotos: "Photo spots",
    chatButtonHistoricalPerspective: "Point de vue personnage historique",
    chatButtonLocalPerspective: "Ce lieu représente pour les habitants",
    chatButtonPopCulture: "Films, livres et chansons",
    row1Title: "Exploration et attractions à proximité",
    row2Title: "Histoire et culture",
    row3Title: "Art et patrimoine",
    row4Title: "Anecdotes et curiosités",
    row5Title: "Questions fréquentes",
    row6Title: "Activités touristiques"
  },
  "en-US": {
    languageLabel: "Choose your language:",
    responseTimeLabel: "Response time:",
    chatButton: "Tell me about this place",
    chatButtonnearby: "What's interesting nearby?",
    chatButtonAnecdote: "Tell me a surprising anecdote",
    chatButtonShopping: "Shopping around",
    chatButtonPopularQuestion: "Most asked question about this place",
    chatButtonPopularQuestion2: "Second most asked question about this place",
    chatButtonPopularQuestion3: "Third most asked question about this place",
    chatButtonSmartQuestion: "Most relevant question",
    chatButtonEvent: "Significant events",
    chatButtonFamousPeople: "Famous people",
    chatButtonArtAndArchitecture: "Architecture and art",
    chatButtonMustSee: "Must-see",
    chatButtonBestPhotos: "Photo spots",
    chatButtonHistoricalPerspective: "Historical figure's perspective",
    chatButtonLocalPerspective: "What this place means to locals",
    chatButtonPopCulture: "Movies, books, and songs",
    row1Title: "Exploration and Nearby Attractions",
    row2Title: "History and Culture",
    row3Title: "Art and Heritage",
    row4Title: "Anecdotes and Curiosities",
    row5Title: "Frequently Asked Questions",
    row6Title: "Tourist Activities"
  },
  "es-ES": {
    languageLabel: "Elige tu idioma:",
    responseTimeLabel: "Tiempo de respuesta:",
    responseLabel: "réponse :",
    addressLabel: "Adresse :",
    chatButton: "Háblame de este lugar",
    chatButtonnearby: "¿Qué hay interesante cerca?",
    chatButtonAnecdote: "Cuéntame una anécdota sorprendente",
    chatButtonShopping: "Ir de compras",
    chatButtonPopularQuestion: "La pregunta más popular sobre este lugar",
    chatButtonPopularQuestion2: "La segunda pregunta más popular sobre este lugar",
    chatButtonPopularQuestion3: "La tercera pregunta más popular sobre este lugar",
    chatButtonSmartQuestion: "La pregunta más relevante",
    chatButtonEvent: "Eventos importantes",
    chatButtonFamousPeople: "Personajes famosos",
    chatButtonArtAndArchitecture: "Arquitectura y arte",
    chatButtonLegendsAndMyths: "Leyendas y mitos",
    chatButtonMustSee: "Imprescindibles",
    chatButtonBestPhotos: "Lugares para fotos",
    chatButtonHistoricalPerspective: "Perspectiva de una figura histórica",
    chatButtonLocalPerspective: "Qué significa este lugar para los locales",
    chatButtonPopCulture: "Películas, libros y canciones",
    row1Title: "Exploración y atracciones cercanas",
    row2Title: "Historia y cultura",
    row3Title: "Arte y patrimonio",
    row4Title: "Anécdotas y curiosidades",
    row5Title: "Preguntas frecuentes",
    row6Title: "Actividades turísticas"
  },
  "de-DE": {
    languageLabel: "Wählen Sie Ihre Sprache:",
    responseTimeLabel: "Antwortzeit:",
    responseLabel: "réponse :",
    addressLabel: "Adresse :",
    chatButton: "Erzählen Sie mir von diesem Ort",
    chatButtonnearby: "Was gibt es Interessantes in der Nähe?",
    chatButtonAnecdote: "Erzählen Sie mir eine überraschende Anekdote",
    chatButtonShopping: "Einkaufen in der Nähe",
    chatButtonPopularQuestion: "Die beliebteste Frage zu diesem Ort",
    chatButtonPopularQuestion2: "Die zweitbeliebteste Frage zu diesem Ort",
    chatButtonPopularQuestion3: "Die drittbeliebteste Frage zu diesem Ort",
    chatButtonSmartQuestion: "Die relevanteste Frage",
    chatButtonEvent: "Bedeutende Ereignisse",
    chatButtonFamousPeople: "Berühmte Persönlichkeiten",
    chatButtonArtAndArchitecture: "Architektur und Kunst",
    chatButtonLegendsAndMyths: "Legenden und Mythen",
    chatButtonMustSee: "Sehenswürdigkeiten",
    chatButtonBestPhotos: "Fotospots",
    chatButtonHistoricalPerspective: "Perspektive einer historischen Figur",
    chatButtonLocalPerspective: "Was dieser Ort den Einheimischen bedeutet",
    chatButtonPopCulture: "Filme, Bücher und Lieder",
    row1Title: "Erkundung und nahegelegene Attraktionen",
    row2Title: "Geschichte und Kultur",
    row3Title: "Kunst und Erbe",
    row4Title: "Anekdoten und Kuriositäten",
    row5Title: "Häufig gestellte Fragen",
    row6Title: "Touristische Aktivitäten"
  },
  "zh-CN": {
    languageLabel: "选择你的语言：",
    responseTimeLabel: "响应时间：",
    responseLabel: "réponse :",
    addressLabel: "Adresse :",
    chatButton: "告诉我这个地方的故事",
    chatButtonnearby: "附近有什么有趣的地方？",
    chatButtonAnecdote: "讲一个惊人的轶事",
    chatButtonShopping: "附近的购物地点",
    chatButtonPopularQuestion: "关于这个地方最常问的问题",
    chatButtonPopularQuestion2: "关于这个地方第二常问的问题",
    chatButtonPopularQuestion3: "关于这个地方第三常问的问题",
    chatButtonSmartQuestion: "最相关的问题",
    chatButtonEvent: "重大事件",
    chatButtonFamousPeople: "著名人物",
    chatButtonArtAndArchitecture: "建筑与艺术",
    chatButtonLegendsAndMyths: "传说与神话",
    chatButtonMustSee: "必看景点",
    chatButtonBestPhotos: "拍照地点",
    chatButtonHistoricalPerspective: "历史人物的观点",
    chatButtonLocalPerspective: "这个地方对当地人来说意味着什么",
    chatButtonPopCulture: "电影、书籍和歌曲",
    row1Title: "探索与附近景点",
    row2Title: "历史与文化",
    row3Title: "艺术与遗产",
    row4Title: "轶事与奇闻",
    row5Title: "常见问题",
    row6Title: "旅游活动"
  }
};

function updateLabels(language) {
  const translation = translations[language] || translations["en-US"];
  const idsToUpdate = {
    languageLabel: "languageLabel",
    responseTimeLabel: "responseTimeLabel",
    chatButton: "chatButton",
    chatButtonnearby: "chatButtonnearby",
    chatButtonAnecdote: "chatButtonAnecdote",
    chatButtonShopping: "chatButtonShopping",
    chatButtonPopularQuestion: "chatButtonPopularQuestion",
    chatButtonPopularQuestion2: "chatButtonPopularQuestion2",
    chatButtonPopularQuestion3: "chatButtonPopularQuestion3",
    chatButtonSmartQuestion: "chatButtonSmartQuestion",
    chatButtonEvent: "chatButtonEvent",
    chatButtonFamousPeople: "chatButtonFamousPeople",
    chatButtonArtAndArchitecture: "chatButtonArtAndArchitecture",
    chatButtonMustSee: "chatButtonMustSee",
    chatButtonBestPhotos: "chatButtonBestPhotos",
    chatButtonHistoricalPerspective: "chatButtonHistoricalPerspective",
    chatButtonLocalPerspective: "chatButtonLocalPerspective",
    chatButtonPopCulture: "chatButtonPopCulture",
    row1Title: "row1Title",
    row2Title: "row2Title",
    row3Title: "row3Title",
    row4Title: "row4Title",
    row5Title: "row5Title",
    row6Title: "row6Title"
  };

  for (const [key, id] of Object.entries(idsToUpdate)) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = translation[key];
    } else {
      console.warn(`Element with ID '${id}' not found`);
    }
  }
}

// Initialisation de la langue par défaut
updateLabels("en-US");

// Gestion du changement de langue via le sélecteur
const languageSelect = document.getElementById("languageSelect");
languageSelect.addEventListener("change", (event) => {
  const selectedLanguage = event.target.value;
  updateLabels(selectedLanguage);
});

// --------------------------------------------------
// 5. Initialisation de la synthèse vocale
// --------------------------------------------------

// Initialisation ou "déblocage" de la synthèse vocale (notamment sur iPhone)
function initializeSpeechSynthesisOnce(lang) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(" ");
  utterance.lang = lang;
  synth.speak(utterance);
}
// Débloquer la synthèse vocale sur iPhone
const unlockAudio = new SpeechSynthesisUtterance(" ");
window.speechSynthesis.speak(unlockAudio);

// --------------------------------------------------
// 6. Fonctions de géolocalisation et obtention d'adresse
// --------------------------------------------------

function getCoordinates() {
return new Promise((resolve, reject) => {
const paramDataStr = sessionStorage.getItem("parametre");
if (paramDataStr) {
  try {
    const paramData = JSON.parse(paramDataStr);
    const testRecord = paramData.find(record => record.fields.Nom === "Test");
    if (testRecord && testRecord.fields.Valeur === "O") {
      const latitude = parseFloat(testRecord.fields["ValeurA"] || testRecord.fields["Valeur A"]);
      const longitude = parseFloat(testRecord.fields["ValeurB"] || testRecord.fields["Valeur B"]);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        resolve({ latitude, longitude });
        return;
      }
    }
  } catch (e) {
    console.error("Erreur lors du parsing de 'parametre' :", e.message);
  }
}
navigator.geolocation.getCurrentPosition(
  (position) => {
    const latitude = parseFloat(position.coords.latitude.toFixed(6));
    const longitude = parseFloat(position.coords.longitude.toFixed(6));
    resolve({ latitude, longitude });
  },
  (error) => {
    reject("Erreur de géolocalisation : " + error.message);
  }
);
});
}


async function getAddressFromCoordinates(lat, lng) {
  const url = `https://google-maps-geocode.samueltoledano94.workers.dev/?lat=${lat}&lng=${lng}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.status !== "OK" || !data.results.length) {
      throw new Error("Adresse introuvable. Essayez un autre lieu.");
    }
    const formattedAddress = data.results[0].formatted_address;
    return formattedAddress;
  } catch (error) {
    return null;
  }
}

// --------------------------------------------------
// 7. Interaction avec ChatGPT via l'API OpenAI
// --------------------------------------------------

async function askChatGPT(question, languageCode) {
const languageMap = {
    "fr-FR": "français",
    "en-US": "anglais",
    "es-ES": "espagnol",
    "de-DE": "allemand",
    "zh-CN": "chinois",
    "it-IT": "italien"
};
const language = languageMap[languageCode] || "anglais";
const url = `https://openai-proxy2.samueltoledano94.workers.dev`;

// ✅ Vérifier si l'élément existe avant d'accéder à sa valeur
const responseTimeSelect = document.getElementById("responseTimeSelect");
const responseTime = responseTimeSelect ? responseTimeSelect.value : "normal";

// ✅ Définition du nombre de tokens en fonction du temps de réponse sélectionné
const tokenLimits = {
    "court": 50,    // Réponse courte (~1 phrase)
    "normal": 150,  // Réponse standard (~3-5 phrases)
    "long": 300     // Réponse détaillée (~8-10 phrases)
};

const maxTokens = tokenLimits[responseTime] || 150; // Par défaut, "normal"

try {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            max_tokens: maxTokens,  // ✅ Ajuste la réponse selon la durée choisie
            messages: [
                {
                    role: 'system',
                    content: `Tu vas répondre en ${language}. Adapte la longueur de ta réponse pour un temps de réponse ${responseTime}. Ne pose pas de questions en retour.`
                },
                { role: 'user', content: question }
            ]
        })
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices.length) {
        throw new Error("Données inattendues de l'API OpenAI");
    }

    return data.choices[0].message.content;
} catch (error) {
    console.error("Erreur lors de la requête à ChatGPT :", error);
    throw error;
}
}


// --------------------------------------------------
// 8. Synthèse vocale via Worker (Google TTS)
// --------------------------------------------------


// Fonction pour lancer la synthèse vocale via le Worker (Google TTS)
// Fonction de synthèse vocale via Worker (Google TTS)
async function speakTextWithWorker(text, languageCode) {
const workerUrl = "https://google-speech-text.samueltoledano94.workers.dev/";
const voiceNameMap = {
    "fr-FR": "fr-FR-Wavenet-A",
    "en-US": "en-US-Wavenet-D",
    "es-ES": "es-ES-Wavenet-B", 
    "de-DE": "de-DE-Wavenet-A",
    "zh-CN": "cmn-CN-Wavenet-A"
};
const voiceName = voiceNameMap[languageCode] || "fr-FR-Wavenet-A";

const requestBody = {
    text: text,
    languageCode: languageCode,
    voiceName: voiceName
};

try {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    // Rendre inactifs les POI dès le lancement du vocal
    document.querySelectorAll(".poi").forEach(poi => {
        poi.classList.add("inactive");
    });

    let audio = new Audio();
    currentAudio = audio;
    audio.autoplay = true;
    audio.volume = 1.0;

    // Masquer le bouton IAWTF dès que le GIF s'affiche
    document.getElementById("iawtf-button").style.visibility = "hidden";

    const response = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        cache: "no-store"
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Worker: ${response.statusText} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    audio.src = audioUrl;
    toggleMoreButtons(false); // Cache les boutons dès que la lecture démarre

    // À la lecture, masquer le GIF et afficher le bouton Stop
    audio.addEventListener('play', () => {
        document.getElementById("loadingGif").style.display = "none";
        document.getElementById("stopButtonContainer").style.display = "block";
        document.getElementById("iawtf-button").style.visibility = "hidden";
    });

    // À la fin de l'audio, réactiver les POI
    audio.addEventListener('ended', () => {
        console.log("Audio terminé");
        setTimeout(() => {
            document.getElementById("stopButtonContainer").style.display = "none"; 
            document.getElementById("poisContainer").style.display = "block"; 
            showIAWTFButton(); // Réaffiche le bouton IA
            showButtonsAfterNarration(); // Réaffiche les boutons "More"
            resetPOIs(); // Réactive les POI en retirant la classe "inactive"
        }, 500);
    });

    await audio.play().catch(error => {
        console.warn("Erreur lors de la lecture de l'audio :", error);
        document.getElementById("stopButtonContainer").style.display = "none";
        document.getElementById("poisContainer").style.display = "block";
        document.getElementById("iawtf-button").style.visibility = "visible";
    });

} catch (error) {
    alert("Erreur lors de l'appel à Google TTS via Worker : " + error.message);
    document.getElementById("stopButtonContainer").style.display = "none";
    document.getElementById("poisContainer").style.display = "block";
    document.getElementById("iawtf-button").style.visibility = "visible";
}
}


// --------------------------------------------------
// 9. Gestion des clics sur les boutons de chat
// --------------------------------------------------

// Sélecteur du temps de réponse (non utilisé directement ici, mais déclaré)
const responseTimeSelect = document.getElementById("responseTimeSelect");

// Fonction générique pour gérer les clics des boutons et lancer le TTS
async function handleChatButtonClick(buttonId, messageTemplate) {
const selectedLanguage = document.getElementById("languageSelect").value || "en-US";
const responseDiv = document.getElementById("response");

responseDiv.textContent = "Chargement...";

try {
    if (!selectedPOI) {
        alert("⚠️ Aucun POI sélectionné !");
        return;
    }

    // Remplace "{place}" par le POI sélectionné
    const question = messageTemplate.replace("{place}", selectedPOI);

    // Envoi la question à ChatGPT
    const chatGPTResponse = await askChatGPT(question, selectedLanguage);

    responseDiv.textContent = `Résumé : ${chatGPTResponse}`;
    speakTextWithWorker(chatGPTResponse, selectedLanguage);
} catch (error) {
    alert(`🚨 Erreur : ${error.message}`);
    responseDiv.textContent = "Erreur : " + error.message;
}
}

document.querySelectorAll('.button-container button').forEach(button => {
button.addEventListener('click', async (event) => {
    stopNarration();
    document.getElementById("buttonsPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("iawtf-button").style.visibility = "hidden";
    document.getElementById("loadingGif").style.display = "block";

    if (!selectedPOI) {
        alert("⚠️ Sélectionnez d'abord un POI avant de poser une question !");
        return;
    }

    const buttonId = event.target.id;
    let messageTemplate;

    switch (buttonId) {
        case 'chatButton':
            messageTemplate = "Donne-moi une description historique et culturelle de {place}.";
            break;
        case 'chatButtonnearby':
            messageTemplate = "Qu'y a-t-il d'intéressant à proximité de {place} ?";
            break;
        case 'chatButtonAnecdote':
            messageTemplate = "Raconte-moi une anecdote surprenante sur {place}.";
            break;
        case 'chatButtonEvent':
            messageTemplate = "Quels sont les événements historiques majeurs ayant eu lieu à {place} ?";
            break;
        case 'chatButtonFamousPeople':
            messageTemplate = "Quelles personnalités célèbres sont liées à {place} ?";
            break;
        case 'chatButtonArtAndArchitecture':
            messageTemplate = "Décris l'architecture et le style artistique du lieu suivant : {place}.";
            break;
        case 'chatButtonMustSee':
            messageTemplate = "Quels sont les incontournables à voir à {place} ?";
            break;
        case 'chatButtonBestPhotos':
            messageTemplate = "Quels sont les meilleurs endroits pour prendre des photos à {place} ?";
            break;
        default:
            console.error("🚨 Bouton non reconnu !");
            return;
    }

    await handleChatButtonClick(buttonId, messageTemplate);
});
});

function toggleMoreButtons(show) {
const openButtonsPopup = document.getElementById("openButtonsPopup");
const moreButton = document.getElementById("moreButton");

if (show) {
    openButtonsPopup.style.display = "flex";
    moreButton.style.display = "flex";
} else {
    openButtonsPopup.style.display = "none";
    moreButton.style.display = "none";
}
}

async function requestMoreDetails() {
const selectedLanguage = document.getElementById("languageSelect").value || "en-US";
const responseDiv = document.getElementById("response");

// Récupère la réponse précédente (en retirant le préfixe "Résumé :")
const previousResponse = responseDiv.textContent.replace("Résumé : ", "").trim();

if (!selectedPOI) {
alert("⚠️ Aucun POI sélectionné !");
return;
}

if (!previousResponse || previousResponse === "Chargement...") {
alert("⚠️ Aucune réponse précédente trouvée !");
return;
}

// Mise à jour de l'interface pour simuler un appel "initial"
// Masquer le popup et l'overlay, masquer le bouton IAWTF et afficher le GIF de chargement
document.getElementById("buttonsPopup").style.display = "none";
document.getElementById("overlay").style.display = "none";
document.getElementById("iawtf-button").style.visibility = "hidden";
document.getElementById("loadingGif").style.display = "block";

// Indiquer à l'utilisateur que le nouveau détail est en cours de chargement
responseDiv.textContent = "Chargement...";

try {
// Prépare la nouvelle question en incluant la réponse précédente
const question = `Voici la réponse que tu viens de me donner sur ${selectedPOI} : "${previousResponse}". Donne-moi plus de détails.`;

// Appel à ChatGPT pour obtenir plus de détails
const detailedResponse = await askChatGPT(question, selectedLanguage);

// Affiche la nouvelle réponse dans la zone de réponse
responseDiv.textContent = `Résumé : ${detailedResponse}`;

// Lance la synthèse vocale qui gère l'affichage du GIF, du bouton Stop, puis la réapparition du bouton IAWTF
speakTextWithWorker(detailedResponse, selectedLanguage);
} catch (error) {
alert(`🚨 Erreur lors de la requête : ${error.message}`);
responseDiv.textContent = "Erreur lors de la récupération des détails.";
}
}

