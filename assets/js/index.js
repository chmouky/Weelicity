async function main() {
  const auth0 = await window.auth0.createAuth0Client({
    domain: 'dev-1of24kih8koq07ek.us.auth0.com',
    clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
    authorizationParams: {
      redirect_uri: window.location.origin + '/callback',
    },
  });

  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, '/');
  }

  const isAuthenticated = await auth0.isAuthenticated();
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');

  if (isAuthenticated) {
    const user = await auth0.getUser();
    console.log('✅ Connecté :', user);
    loginButton.style.display = 'none';
    logoutButton.style.display = 'block';
  } else {
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
  }

  loginButton.addEventListener('click', () => auth0.loginWithRedirect());
  logoutButton.addEventListener('click', () => auth0.logout({ returnTo: window.location.origin }));

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('https://airtable-all-table2.samueltoledano94.workers.dev');
      const data = await res.json();
      sessionStorage.setItem('tags', JSON.stringify(data.Tag));
      sessionStorage.setItem('places', JSON.stringify(data.Lieu));
      sessionStorage.setItem('tour', JSON.stringify(data.Tour));
      sessionStorage.setItem('themetour', JSON.stringify(data.ThemeTour));
      sessionStorage.setItem('quartiers', JSON.stringify(data.Quartier));
      sessionStorage.setItem('gastro', JSON.stringify(data.Gastro));
      sessionStorage.setItem('brands', JSON.stringify(data.Brands));
      sessionStorage.setItem('around', JSON.stringify(data.Around));
      sessionStorage.setItem('street', JSON.stringify(data.Street));
      sessionStorage.setItem('parametre', JSON.stringify(data.Parametre));

      document.getElementById('loadingOverlay')?.remove();
      document.body.style.pointerEvents = 'auto';
    } catch (err) {
      console.error('❌ Erreur de chargement :', err);
    }
  });
}

main().catch(err => console.error('❌ Erreur :', err));