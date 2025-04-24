// 📁 assets/js/auth.js

let auth0Client = null;
let auth0Ready = false;
let auth0InitPromise = null;

// Initialise Auth0 et stocke l'état de readiness
export async function initAuth() {
  if (!auth0InitPromise) {
    auth0InitPromise = createAuth0Client({
      domain: 'dev-1of24kih8koq07ek.us.auth0.com',
      clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
      cacheLocation: 'sessionStorage'
    })
    .then(client => {
      auth0Client = client;
      auth0Ready = true;
    })
    .catch(err => {
      console.error("❌ Erreur init Auth0:", err);
    });
  }
  return auth0InitPromise;
}

// Vérifie si l'utilisateur est connecté via sessionStorage
export function isUserLoggedIn() {
  return !!sessionStorage.getItem("user");
}

// Lance le login avec popup et stocke l'utilisateur
export async function loginUserWithPopup() {
  if (!auth0Ready || !auth0Client) {
    throw new Error("Auth0 non prêt");
  }
  await auth0Client.loginWithPopup();
  const user = await auth0Client.getUser();
  sessionStorage.setItem("user", JSON.stringify(user));
  return user;
}

// Expose auth0Client si besoin direct
export function getAuth0Client() {
  return auth0Client;
}
