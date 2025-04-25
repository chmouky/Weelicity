// 📁 assets/js/auth.js

let auth0Client = null;
let auth0Ready = false;
let auth0InitPromise = null;

const auth0Config = {
  domain: 'dev-1of24kih8koq07ek.us.auth0.com',
  clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
  cacheLocation: 'localstorage'
};

export async function initAuth() {
  if (!auth0InitPromise) {
    auth0InitPromise = (async () => {
      try {
        // Wait for Auth0 script to load
        await window.loadAuth0Script();

        if (!window.createAuth0Client) {
          throw new Error("Auth0 SPA JS library not loaded");
        }
        auth0Client = await window.createAuth0Client(auth0Config);
        auth0Ready = true;
        console.log("✅ Auth0 client initialized successfully");
      } catch (err) {
        console.error("❌ Erreur init Auth0:", err);
        throw err;
      }
    })();
  }
  return auth0InitPromise;
}

export function getAuth0Client() {
  if (!auth0Ready || !auth0Client) {
    throw new Error("Auth0 client not initialized");
  }
  return auth0Client;
}

export function isUserLoggedIn() {
  return !!sessionStorage.getItem("user");
}

export async function handleRedirectCallback() {
  try {
    if (!window.createAuth0Client) {
      throw new Error("Auth0 SPA JS library not loaded");
    }
    const client = await window.createAuth0Client(auth0Config);
    await client.handleRedirectCallback();
    const user = await client.getUser();
    sessionStorage.setItem("user", JSON.stringify(user));
    console.log("✅ User authenticated:", user);

    const destination = sessionStorage.getItem("postLoginRedirect") || "/pages/menu.html";
    sessionStorage.removeItem("postLoginRedirect");
    window.location.href = destination;
  } catch (e) {
    console.error("❌ Erreur callback :", e);
    document.body.innerHTML = "<p>Erreur de connexion. Veuillez réessayer.</p>";
  }
}

export async function loginUserWithRedirect() {
  try {
    if (!window.createAuth0Client) {
      throw new Error("Auth0 SPA JS library not loaded");
    }
    const client = await window.createAuth0Client(auth0Config);
    sessionStorage.setItem("postLoginRedirect", window.location.pathname);
    await client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin + "/callback.html"
      }
    });
  } catch (err) {
    console.error("❌ Error during login redirect:", err);
    alert("Failed to redirect to login. Please try again.");
  }
}