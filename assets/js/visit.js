const threshold = 100;
const swipeDuration = 300;

function resetButtons() {
  const boxes = document.querySelectorAll(".clickable-box");
  boxes.forEach(box => {
    box.style.transition = "none";
    box.style.transform = "translateX(0)";
    void box.offsetWidth; // force le reflow
    box.style.transition = `transform ${swipeDuration}ms ease-out`;
  });
} 

function addSwipeListeners() {
  const elements = [
    { id: 'tags-btn', targetPage: '../pages/tags.html' },
    { id: 'theme-btn', targetPage: '../pages/themes.html' }
  ];

  elements.forEach(({ id, targetPage }) => {
    const element = document.getElementById(id);
    if (!element) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

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

    // 💡 Clique classique (pas que swipe)
    element.addEventListener("click", () => {
      element.style.transition = `transform ${swipeDuration}ms ease-out`;
      element.style.transform = `translateX(100vw)`;
      setTimeout(() => {
        window.location.href = targetPage;
      }, swipeDuration);
    });
  });
}

// 💡 On load
document.addEventListener("DOMContentLoaded", () => {
  resetButtons();
  addSwipeListeners();
});

// ✅ Réinitialise aussi au retour arrière
window.addEventListener("pageshow", () => {
  resetButtons();
});
