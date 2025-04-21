let auth0 = null;

async function initAuth0() {
  auth0 = await createAuth0Client({
    domain: "TON_DOMAINE.auth0.com",
    client_id: "TA_CLIENT_ID",
    cacheLocation: "localstorage" // pour rester connecté entre reloads
  });
  
  // Redirection après login
  if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  const isAuthenticated = await auth0.isAuthenticated();
  if (isAuthenticated) {
    const user = await auth0.getUser();
    console.log("✅ Connecté :", user);
    document.getElementById("login-button").style.display = "none";
    document.getElementById("logout-button").style.display = "inline-block";
    // Tu peux afficher user.name, user.email, etc.
  } else {
    document.getElementById("login-button").style.display = "inline-block";
    document.getElementById("logout-button").style.display = "none";
  }
}

// Boutons
document.getElementById("login-button").addEventListener("click", () => {
  auth0.loginWithRedirect({
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  });
});

document.getElementById("logout-button").addEventListener("click", () => {
  auth0.logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  });
});

// Lancement
initAuth0();
