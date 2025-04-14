function initNavigationBoxes() {
  const boxes = [
    {
      element: document.getElementById("box-tags"),
      targetPage: "../pages/tags.html"
    },
    {
      element: document.getElementById("box-themes"),
      targetPage: "../pages/themes.html"
    }
  ];

  boxes.forEach(({ element, targetPage }) => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const threshold = 100;
    const swipeDuration = 300;

    // 👉 CLICK : même effet que swipe
    element.addEventListener("click", () => {
      element.style.transition = `transform ${swipeDuration}ms ease-out`;
      element.style.transform = `translateX(100vw)`;
      setTimeout(() => {
        window.location.href = targetPage;
      }, swipeDuration);
    });

    // 👉 SWIPE vers la droite
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

      element.style.transition = `transform ${swipeDuration}ms ease-out`;

      if (deltaX > threshold) {
        element.style.transform = `translateX(100vw)`;
        setTimeout(() => {
          window.location.href = targetPage;
        }, swipeDuration);
      } else {
        element.style.transform = `translateX(0)`;
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initNavigationBoxes);
