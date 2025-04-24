async function main() {
    // 🔐 Initialiser Auth0
    const auth0 = await window.auth0.createAuth0Client({
      domain: 'dev-1of24kih8koq07ek.us.auth0.com',
      clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
      authorizationParams: {
        redirect_uri: window.location.origin + '/pages/menu.html'
      }
    });
  
    // 🔁 Si on revient d'une redirection Auth0
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
        const result = await auth0.handleRedirectCallback();
      
        const user = await auth0.getUser();
        console.log("🔐 Utilisateur après callback :", user);
        sessionStorage.setItem("user", JSON.stringify(user));
      
        // 🔁 Récupère l'URL de retour si elle avait été stockée
        const savedTarget = sessionStorage.getItem("redirectAfterLogin");
        const targetUrl = savedTarget || result.appState?.targetUrl || '/pages/menu.html';
      
        sessionStorage.removeItem("redirectAfterLogin"); // Nettoyage
        window.history.replaceState({}, document.title, targetUrl);
        window.location.href = targetUrl;
        return;
      }
      
  
    // 🔘 Gestion des boutons
    const loginBtn = document.getElementById("login-button");
    const logoutBtn = document.getElementById("logout-button");
  
    try {
      const isAuthenticated = await auth0.isAuthenticated();
  
      if (isAuthenticated) {
        const user = await auth0.getUser();
        console.log("👤 Utilisateur connecté :", user);
        sessionStorage.setItem("user", JSON.stringify(user)); // ✅ Important pour spots.js
  
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
      } else {
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
      }
  
      loginBtn.addEventListener("click", () => {
        auth0.loginWithRedirect({
          appState: { targetUrl: '/pages/menu.html' }
        });
      });
  
      logoutBtn.addEventListener("click", () => {
        auth0.logout({
          returnTo: window.location.origin + '/pages/menu.html'
        });
      });
  
    } catch (err) {
      console.error("❌ Erreur lors de la vérification Auth0 :", err);
    }
  
    // ✅ Charger le footer une fois tout prêt
    await loadFooter();
  }
  