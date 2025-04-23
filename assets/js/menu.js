// /assets/js/menu.js
async function main() {
    let auth0;
    try {
      auth0 = await window.auth0.createAuth0Client({
        domain: 'dev-1of24kih8koq07ek.us.auth0.com',
        clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
        authorizationParams: {
          redirect_uri: window.location.origin + '/callback', // Harmonisé avec index.html
        },
      });
    } catch (err) {
      console.error('❌ Erreur lors de l’initialisation d’Auth0 :', err);
      await loadFooter(); // Charger le footer même en cas d'erreur Auth0
      return;
    }
  
    // Gérer le retour de login
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      try {
        const result = await auth0.handleRedirectCallback();
        const targetUrl = result.appState?.targetUrl || '/pages/menu.html';
        window.history.replaceState({}, document.title, targetUrl); // Nettoyer l'URL sans recharger
      } catch (err) {
        console.error('❌ Erreur lors du callback Auth0 :', err);
      }
    }
  
    // Auth UI
    const isAuthenticated = await auth0.isAuthenticated();
    const loginBtn = document.getElementById('login-button');
    const logoutBtn = document.getElementById('logout-button');
  
    if (isAuthenticated) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
    } else {
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
    }
  
    loginBtn.addEventListener('click', () => {
      auth0.loginWithRedirect({
        appState: { targetUrl: '/pages/menu.html' },
      });
    });
  
    logoutBtn.addEventListener('click', () => {
      auth0.logout({ returnTo: window.location.origin + '/pages/menu.html' });
    });
  
    // Charger le footer
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
        console.warn('⚠️ #footer-placeholder non trouvé');
      }
    } catch (err) {
      console.error('❌ Erreur chargement footer :', err);
    }
  }
  
  main().catch(err => {
    console.error('❌ Erreur principale :', err);
    loadFooter(); // Charger le footer même en cas d'erreur
  });