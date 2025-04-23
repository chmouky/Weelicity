async function main() {
    // 🔐 Initialiser Auth0
    const auth0 = await window.auth0.createAuth0Client({
      domain: 'dev-1of24kih8koq07ek.us.auth0.com',
      clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
      authorizationParams: {
        redirect_uri: window.location.origin + '/pages/menu.html'
      }
    });
  
    // 🔁 Gérer le retour après redirection Auth0
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      const result = await auth0.handleRedirectCallback();
      const targetUrl = result.appState?.targetUrl || '/pages/menu.html';
      window.history.replaceState({}, document.title, targetUrl);
      window.location.href = targetUrl;
      return; // ⛔ Stop ici pour éviter de continuer
    }
  
    // 🔘 Gérer les boutons
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
      auth0.logout({
        returnTo: window.location.origin + '/pages/menu.html'
      });
    });
  
    // ✅ Charger le footer une fois tout prêt
    await loadFooter();
  }
  
  async function loadFooter() {
    try {
      const res = await fetch('/assets/components/footer.html');
      if (!res.ok) {
        throw new Error(`Erreur HTTP : ${res.status} ${res.statusText}`);
      }
      const html = await res.text();
      const placeholder = document.getElementById('footer-placeholder');
      if (placeholder) {
        placeholder.innerHTML = html;
        console.log('✅ Footer chargé !');
      } else {
        console.warn('⚠️ Élément #footer-placeholder non trouvé');
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement du footer :', err);
    }
  }
  
  main().catch(err => {
    console.error('❌ Erreur dans main() :', err);
    loadFooter(); // Charger quand même le footer en cas d'erreur
  });
  