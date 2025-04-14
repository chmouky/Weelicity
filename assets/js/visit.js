
function addSwipeListener(element, callback) {
  let touchStartX = 0;
  let touchEndX = 0;

  element.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  element.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    if (swipeDistance > 50) {
      // vers la droite
      callback();
    }
  }
}

// Clic normal
document.getElementById("tags-btn").addEventListener("click", () => {
  window.location.href = "../pages/tags.html";
});

document.getElementById("theme-btn").addEventListener("click", () => {
  window.location.href = "../pages/themes.html";
});

// Swipe vers la droite
addSwipeListener(document.getElementById("tags-btn"), () => {
  window.location.href = "../pages/tags.html";
});

addSwipeListener(document.getElementById("theme-btn"), () => {
  window.location.href = "../pages/themes.html";
});
