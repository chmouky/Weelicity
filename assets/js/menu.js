<script>
  window.addEventListener("DOMContentLoaded", async () => {
    const auth0 = await window.auth0.createAuth0Client({
      domain: 'dev-1of24kih8koq07ek.us.auth0.com',
      clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
      authorizationParams: {
        redirect_uri: window.location.origin + '/pages/menu.html'
      }
    });

    // 🌀 Gérer la redirection après Auth0 login
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      const result = await auth0.handleRedirectCallback();
      const targetUrl = result.appState?.targetUrl || '/pages/menu.html';
      window.history.replaceState({}, document.title, targetUrl);
      window.location.href = targetUrl;
      return; // ⛔ stop ici pour éviter de continuer le reste du code inutilement
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

    // ✅ Charger le footer une fois que tout est ok
    fetch("/assets/components/footer.html")
      .then(response => response.text())
      .then(data => {
        const footer = document.getElementById("footer-placeholder");
        footer.innerHTML = data;
        footer.classList.add("loaded");
      });
  });
</script>
