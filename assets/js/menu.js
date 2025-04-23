// /assets/js/menu.js
async function main() {
    const auth0 = await window.auth0.createAuth0Client({
      domain: 'dev-1of24kih8koq07ek.us.auth0.com',
      clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
      authorizationParams: {
        redirect_uri: window.location.origin + '/pages/menu.html'
      }
    });
  
    // Gérer le retour de login
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      const result = await auth0.handleRedirectCallback();
      const targetUrl = result.appState?.targetUrl || '/pages/menu.html';
      window.history.replaceState({}, document.title, targetUrl);
      window.location.href = targetUrl;
      return;
    }
  
    // Auth UI
    const isAuthenticated = await auth0.isAuthenticated();
    const loginBtn = document.getElementById("login-button");
    const logoutBtn = document.getElementById("logout-button");
  
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
  
    // Charger le footer seulement si on ne redirige pas
    await loadFooter();
  }
  
  async function loadFooter() {
    try {
      const res = await fetch("/assets/components/footer.html");
      const html = await res.text();
      document.getElementById("footer-placeholder").innerHTML = html;
      console.log("✅ Footer chargé !");
    } catch (err) {
      console.error("❌ Erreur chargement footer :", err);
    }
  }
  
  main().catch(err => console.error("❌ Erreur Auth0/Menu.js :", err));
  