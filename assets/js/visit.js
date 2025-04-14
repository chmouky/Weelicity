
function handleSwipeWithAnimation(el, targetUrl) {
  let touchStartX = 0;

  el.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
  });

  el.addEventListener("touchend", e => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;

    if (swipeDistance > 50) {
      el.classList.add("swipe-right");
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 400); // temps pour laisser l'animation se jouer
    }
  });
}

handleSwipeWithAnimation(document.getElementById("topContainer"), "../pages/tags.html");
handleSwipeWithAnimation(document.getElementById("bottomContainer"), "../pages/themes.html");




// Swipe vers la droite
addSwipeListener(document.getElementById("tags-btn"), () => {
  window.location.href = "../pages/tags.html";
});

addSwipeListener(document.getElementById("theme-btn"), () => {
  window.location.href = "../pages/themes.html";
});
