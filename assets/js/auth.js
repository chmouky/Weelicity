// assets/js/auth.js

const auth = firebase.auth();


// Fonction de traitement du retour après redirection Google
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
      console.log("✅ Connecté via Google :", user);

      const redirectTo = sessionStorage.getItem("postLoginRedirect") || "/pages/menu.html";
      sessionStorage.removeItem("postLoginRedirect");
      window.location.href = redirectTo;
    }
  } catch (error) {
    console.error("❌ Erreur callback Google :", error);
    document.body.innerHTML = "<p>Erreur de connexion Google. Veuillez réessayer.</p>";
  }
};

// Déconnexion
window.logoutUser = function () {
  firebase.auth().signOut().then(() => {
    sessionStorage.removeItem("user");
    location.reload(); // Recharge la page pour réinitialiser l’état
  }).catch((error) => {
    console.error("Erreur de déconnexion :", error);
    alert("Erreur pendant la déconnexion.");
  });
};

// Observer l’état de connexion pour afficher/masker les boutons
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

// Bouton Logout
document.getElementById("logoutBtn")?.addEventListener("click", window.logoutUser);

// Connexion Email/Password
document.getElementById("emailLoginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    const user = result.user;
    sessionStorage.setItem("user", JSON.stringify({
      email: user.email,
      name: user.displayName,
      picture: user.photoURL
    }));
    console.log("✅ Connecté avec email :", user.email);
    location.href = "/pages/menu.html";
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      if (confirm("Aucun compte trouvé. Voulez-vous créer un compte avec cet email ?")) {
        try {
          const newUser = await auth.createUserWithEmailAndPassword(email, password);
          sessionStorage.setItem("user", JSON.stringify({
            email: newUser.user.email,
            name: newUser.user.displayName,
            picture: newUser.user.photoURL
          }));
          console.log("✅ Compte créé :", newUser.user.email);
          location.href = "/pages/menu.html";
        } catch (signupError) {
          alert("Erreur création compte : " + signupError.message);
        }
      }
    } else {
      alert("Erreur de connexion : " + error.message);
    }
  }
});
