document.addEventListener("DOMContentLoaded", async () => {
    await new Promise(resolve => setTimeout(resolve, 200)); // attendre 200ms
    const toursList = document.getElementById('tours-list');

    const userRaw = sessionStorage.getItem("user");
    if (!userRaw) {
        toursList.innerHTML = "<p>You must be logged in.</p>";
        return;
    }
    const toursList = document.getElementById('tours-list');
  
    const userRaw = sessionStorage.getItem("user");
    if (!userRaw) {
      toursList.innerHTML = "<p>You must be logged in.</p>";
      return;
    }
  
    const user = JSON.parse(userRaw);
    const userId = user.sub;
  
    try {
      const response = await fetch('https://airtable-toursperso.samueltoledano94.workers.dev/?userId=' + encodeURIComponent(userId));
      const tours = await response.json();
  
      if (!Array.isArray(tours) || tours.length === 0) {
        toursList.innerHTML = "<p>No tours found.</p>";
        return;
      }
  
      tours.forEach(tour => {
        const tourItem = document.createElement('div');
        tourItem.className = "tour-item";
  
        const tourName = document.createElement('span');
        tourName.textContent = tour.fields.Nom || "Unnamed tour";
  
        const menuButton = document.createElement('button');
        menuButton.className = "menu-button";
        menuButton.textContent = "⋮";
  
        const menu = document.createElement('div');
        menu.className = "menu";
        menu.innerHTML = `
          <div class="menu-item">Go</div>
          <div class="menu-item">Update</div>
          <div class="menu-item">Delete</div>
        `;
        menu.style.display = "none";
  
        menuButton.addEventListener('click', (e) => {
          e.stopPropagation();
          closeAllMenus();
          menu.style.display = "block";
        });
  
        document.addEventListener('click', () => {
          menu.style.display = "none";
        });
  
        tourItem.appendChild(tourName);
        tourItem.appendChild(menuButton);
        tourItem.appendChild(menu);
        toursList.appendChild(tourItem);
      });
  
    } catch (error) {
      console.error("Erreur chargement tours :", error);
      toursList.innerHTML = "<p>Error loading tours.</p>";
    }
  });
  
  function closeAllMenus() {
    document.querySelectorAll('.menu').forEach(menu => {
      menu.style.display = "none";
    });
  }
  