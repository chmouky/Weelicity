// 📁 assets/js/auth.js

let auth0Client = null;

const auth0Config = {
  domain: 'dev-1of24kih8koq07ek.us.auth0.com',
  clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
  cacheLocation: 'localstorage'
};

// Initialisation Auth0 (appelé manuellement ailleurs si besoin)
window.initAuth = async function () {
  try {
    await window.loadAuth0Script(); // assure-toi que ce script est chargé avant
    if (!window.createAuth0Client) {
      throw new Error("Auth0 SPA JS library not chargée");
    }
    auth0Client = await window.createAuth0Client(auth0Config);
    console.log("✅ Auth0 client initialisé");
  } catch (err) {
    console.error("❌ Erreur init Auth0:", err);
  }
};

window.loginUserWithRedirect = async function () {
  try {
    if (!auth0Client) {
      await window.initAuth();
    }
    sessionStorage.setItem("postLoginRedirect", window.location.pathname);
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin + "/callback.html"
      }
    });
  } catch (err) {
    console.error("❌ Erreur redirection login :", err);
    alert("Erreur de connexion. Veuillez réessayer.");
  }
};

window.handleRedirectCallback = async function () {
  try {
    if (!auth0Client) {
      await window.initAuth();
    }
    await auth0Client.handleRedirectCallback();
    const user = await auth0Client.getUser();
    sessionStorage.setItem("user", JSON.stringify(user));
    console.log("✅ Utilisateur connecté :", user);
    const destination = sessionStorage.getItem("postLoginRedirect") || "/pages/menu.html";
    sessionStorage.removeItem("postLoginRedirect");
    window.location.href = destination;
  } catch (e) {
    console.error("❌ Erreur callback :", e);
    document.body.innerHTML = "<p>Erreur de connexion. Veuillez réessayer.</p>";
  }
};
