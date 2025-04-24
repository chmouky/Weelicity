// 📁 assets/js/auth.js
let auth0Client = null;
let auth0Ready = false;
let auth0InitPromise = null;

export async function initAuth() {
  if (!auth0InitPromise) {
    auth0InitPromise = createAuth0Client({
      domain: 'dev-1of24kih8koq07ek.us.auth0.com',
      clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
      cacheLocation: 'localstorage' // ✅ cohérent partout
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

export function getAuth0Client() {
  return auth0Client;
}

export function isUserLoggedIn() {
  return !!sessionStorage.getItem("user");
}

export async function handleRedirectCallback() {
  const client = await createAuth0Client({
    domain: 'dev-1of24kih8koq07ek.us.auth0.com',
    clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
    cacheLocation: 'localstorage' // ✅ idem ici
  });

  try {
    await client.handleRedirectCallback();
    const user = await client.getUser();
    sessionStorage.setItem("user", JSON.stringify(user));

    const destination = sessionStorage.getItem("postLoginRedirect") || "/pages/menu.html";
    window.location.href = destination;
  } catch (e) {
    console.error("❌ Erreur callback :", e);
    document.body.innerHTML = "<p>Erreur de connexion. Veuillez réessayer.</p>";
  }
}

export async function loginUserWithRedirect() {
  const client = await createAuth0Client({
    domain: 'dev-1of24kih8koq07ek.us.auth0.com',
    clientId: 'OQ4bNWZZVJqn91glXQrYxWH6p50rB5NL',
    cacheLocation: 'localstorage'
  });

  // Sauvegarde la page actuelle pour rediriger l'utilisateur après login
  sessionStorage.setItem("postLoginRedirect", window.location.pathname);

  await client.loginWithRedirect({
    authorizationParams: {
      redirect_uri: window.location.origin + "/callback.html"
    }
  });
}
