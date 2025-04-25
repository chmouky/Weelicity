// assets/js/auth.js

const auth = firebase.auth();

// Crée une fonction de connexion
window.loginUserWithRedirect = async function () {
  const provider = new firebase.auth.GoogleAuthProvider();
  sessionStorage.setItem("postLoginRedirect", window.location.pathname);
  try {
    await auth.signInWithRedirect(provider);
  } catch (error) {
    console.error("Erreur login redirect :", error);
    alert("Erreur de connexion : " + error.message);
  }
};

// Fonction de traitement du retour
window.handleRedirectCallback = async function () {
  try {
    const result = await auth.getRedirectResult();
    if (result.user) {
      const user = result.user;
      sessionStorage.setItem("user", JSON.stringify({
        email: user.email,
        name: user.displayName,
        picture: user.photoURL
      }));
      console.log("✅ Connecté :", user);

      const redirectTo = sessionStorage.getItem("postLoginRedirect") || "/pages/menu.html";
      sessionStorage.removeItem("postLoginRedirect");
      window.location.href = redirectTo;
    }
  } catch (error) {
    console.error("❌ Erreur callback :", error);
    document.body.innerHTML = "<p>Erreur de connexion. Veuillez réessayer.</p>";
  }
};

// Déconnexion
window.logoutUser = function () {
  firebase.auth().signOut().then(() => {
    sessionStorage.removeItem("user");
    location.reload(); // recharge la page pour réinitialiser l’état
  }).catch((error) => {
    console.error("Erreur de déconnexion :", error);
    alert("Erreur pendant la déconnexion.");
  });
};

// Gérer l’affichage après chargement de la page
firebase.auth().onAuthStateChanged((user) => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInfo = document.getElementById("userInfo");

  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
    userInfo.textContent = `Connecté en tant que : ${user.displayName || user.email}`;
  } else {
    loginBtn.style.display = "block";
    logoutBtn.style.display = "none";
    userInfo.textContent = "";
  }
});

// Bouton logout
document.getElementById("logoutBtn")?.addEventListener("click", window.logoutUser);
