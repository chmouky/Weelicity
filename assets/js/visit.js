function addSwipeListeners() {
  const threshold = 100;
  const swipeDuration = 300;

  const elements = [
    { element: document.getElementById('tags-btn'), targetPage: '../pages/tags.html' },
    { element: document.getElementById('theme-btn'), targetPage: '../pages/themes.html' }
  ];

  elements.forEach(({ element, targetPage }) => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    element.style.transform = "translateX(0)"; // 🔁 reset au cas où

    element.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      element.style.transition = "none";
    });

    element.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      if (deltaX > 0) {
        element.style.transform = `translateX(${deltaX}px)`;
      }
    });

    element.addEventListener("touchend", () => {
      isDragging = false;
      const deltaX = currentX - startX;

      if (deltaX > threshold) {
        element.style.transition = `transform ${swipeDuration}ms ease-out`;
        element.style.transform = `translateX(100vw)`;
        setTimeout(() => {
          window.location.href = targetPage;
        }, swipeDuration);
      } else {
        element.style.transition = `transform ${swipeDuration}ms ease-out`;
        element.style.transform = `translateX(0)`;
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", addSwipeListeners);


// 🔁 Réinitialiser lors d’un retour en arrière
window.addEventListener("pageshow", () => {
  document.querySelectorAll(".half-screen").forEach(el => {
    el.style.transition = "none";
    el.style.transform = "translateX(0)";
  });
});

document.addEventListener("DOMContentLoaded", addSwipeListeners);
