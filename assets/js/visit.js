
function handleSwipe(el, callback) {
  let touchStartX = 0;

  el.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
  });

  el.addEventListener("touchend", e => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;

    if (swipeDistance > 50) {
      callback(); // swipe vers la droite
    }
  });
}

handleSwipe(document.getElementById("topSection"), () => {
  window.location.href = "../pages/tags.html";
});

handleSwipe(document.getElementById("bottomSection"), () => {
  window.location.href = "../pages/themes.html";
});


// Swipe vers la droite
addSwipeListener(document.getElementById("tags-btn"), () => {
  window.location.href = "../pages/tags.html";
});

addSwipeListener(document.getElementById("theme-btn"), () => {
  window.location.href = "../pages/themes.html";
});
