import { createAuth0Client } from '@auth0/auth0-spa-js';

async function main() {
  // Initialiser Auth0
  let auth0;
  try {
    auth0 = await createAuth0Client({
      domain: 'dev-1of24kih8koq07ek.us.auth0.com',
      clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
      authorizationParams: {
        redirect_uri: window.location.origin + '/callback', // Ajoutez une page callback si nécessaire
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors de l’initialisation d’Auth0 :', error);
    return;
  }

  // Gérer le callback après redirection
  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    try {
      await auth0.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('❌ Erreur lors du callback Auth0 :', error);
    }
  }

  // Vérifier l’état de l’authentification
  const isAuthenticated = await auth0.isAuthenticated();
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');

  if (isAuthenticated) {
    const user = await auth0.getUser();
    console.log('✅ Connecté :', user);
    loginButton.style.display = 'none';
    logoutButton.style.display = 'block';
  } else {
    console.log('🔓 Non connecté');
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
  }

  // Associer les actions aux boutons
  loginButton.addEventListener('click', async () => {
    try {
      await auth0.loginWithRedirect({
        appState: { targetUrl: window.location.pathname },
      });
    } catch (error) {
      console.error('❌ Erreur lors de la connexion :', error);
    }
  });

  logoutButton.addEventListener('click', async () => {
    try {
      await auth0.logout({
        returnTo: window.location.origin,
      });
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion :', error);
    }
  });

  // Chargement des données Airtable (indépendant de l’authentification, si souhaité)
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('https://airtable-all-table2.samueltoledano94.workers.dev');
      const data = await res.json();

      // Stocker les données dans sessionStorage
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

      // Retirer l’overlay de chargement
      document.getElementById('loadingOverlay')?.remove();
      document.body.style.pointerEvents = 'auto';
    } catch (err) {
      console.error('❌ Erreur de chargement des données :', err);
    }
  });
}

main().catch(err => console.error('❌ Erreur principale :', err));