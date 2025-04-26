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

// Gestion du login email/password
document.getElementById("authForm")?.addEventListener("submit", async (e) => {
  e.preventDefault(); // Empêche le rechargement de la page

  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  if (!email || !password) {
    alert("Merci de remplir les deux champs.");
    return;
  }

  try {
    const result = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = result.user;
    console.log("✅ Connecté :", user.email);

    // Stockage session pour ton app
    sessionStorage.setItem("user", JSON.stringify({
      email: user.email,
      name: user.displayName,
      picture: user.photoURL
    }));

    // ✅ Rediriger ou continuer sur la page actuelle
    console.log("Redirection en cours...");
    // Si tu veux rester sur index.html :
    window.location.reload(); 
    // Si tu veux aller vers /pages/menu.html :
    // window.location.href = "/pages/menu.html";

  } catch (error) {
    console.error("❌ Erreur connexion :", error);
    alert("Erreur de connexion : " + error.message);
  }
});


// Bouton pour créer un nouvel utilisateur
document.getElementById("signupBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  if (!email || !password) {
    alert("Merci de saisir un email et un mot de passe.");
    return;
  }

  try {
    const newUser = await firebase.auth().createUserWithEmailAndPassword(email, password);
    sessionStorage.setItem("user", JSON.stringify({
      email: newUser.user.email,
      name: newUser.user.displayName,
      picture: newUser.user.photoURL
    }));
    console.log("✅ Compte créé :", newUser.user.email);
    location.href = "/pages/menu.html"; // redirige après création
  } catch (error) {
    alert("Erreur lors de la création de compte : " + error.message);
  }
});

// Lien "Mot de passe oublié"
document.getElementById("resetPasswordLink")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("emailInput").value;

  if (!email) {
    alert("Merci de saisir votre adresse e-mail pour recevoir un lien de réinitialisation.");
    return;
  }

  try {
    await firebase.auth().sendPasswordResetEmail(email);
    alert("📧 Un email de réinitialisation vous a été envoyé !");
  } catch (error) {
    console.error("Erreur de réinitialisation :", error);
    alert("Erreur : " + error.message);
  }
});
