// /assets/js/menu.js
async function main() {
    const auth0 = await window.auth0.createAuth0Client({
      domain: 'dev-1of24kih8koq07ek.us.auth0.com',
      clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
      authorizationParams: {
        redirect_uri: window.location.origin + '/pages/menu.html'
      }
    });
  
    // 🔁 Gestion du retour de Auth0
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      const result = await auth0.handleRedirectCallback();
      const targetUrl = result.appState?.targetUrl || '/pages/menu.html';
      window.history.replaceState({}, document.title, targetUrl);
      return; // ⛔ on ne continue pas pour éviter un double chargement
    }
  
    const loginBtn = document.getElementById("login-button");
    const logoutBtn = document.getElementById("logout-button");
  
    const isAuthenticated = await auth0.isAuthenticated();
  
    if (isAuthenticated) {
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
      auth0.logout({ returnTo: window.location.origin + '/pages/menu.html' });
    });
  }
  
  // ✅ Exécuter uniquement après chargement du DOM
  window.addEventListener("DOMContentLoaded", main);
  