// assets/js/auth.js

const auth = firebase.auth();

// Fonction pour afficher un toast
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// Fonction pour faire "trembler" un élément
function shakeElement(element) {
  element.style.animation = "shake 0.3s";
  setTimeout(() => {
    element.style.animation = "";
  }, 300);
}


// Fonction pour charger dynamiquement le footer
async function loadFooterIfNeeded() {
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder && footerPlaceholder.innerHTML.trim() === "") {
    try {
      const response = await fetch("assets/components/footer.html");
      if (!response.ok) throw new Error("Erreur chargement footer");
      const data = await response.text();
      footerPlaceholder.innerHTML = data;
      footerPlaceholder.classList.add("loaded");
      console.log("✅ Footer chargé dynamiquement");
    } catch (error) {
      console.error("❌ Erreur footer :", error);
    }
  }
}

// Connexion avec email/password (bouton Se connecter)
document.getElementById("authForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  if (!email || !password) {
    alert("Merci de remplir les deux champs.");
    return;
  }

  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    const user = result.user;
    console.log("✅ Connecté :", user.email);

    sessionStorage.setItem("user", JSON.stringify({
      sub: user.uid, // <-- ici le vrai ID Firebase
      email: user.email,
      name: user.displayName,
      picture: user.photoURL
    }));
    

    await loadFooterIfNeeded(); // Charger le footer immédiatement
    console.log("Connexion réussie.");
    showToast("✅ Connexion réussie !");

  } catch (error) {
    console.error("❌ Erreur connexion :", error);
    shakeElement(document.getElementById("authContainer")); // Trembler si erreur
    alert("Erreur de connexion : " + error.message);
  }
  
});

// Création de compte (bouton Créer un compte)
document.getElementById("signupBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  if (!email || !password) {
    alert("Merci de remplir un email et un mot de passe.");
    return;
  }

  try {
    const newUser = await auth.createUserWithEmailAndPassword(email, password);
    console.log("✅ Compte créé :", newUser.user.email);

    sessionStorage.setItem("user", JSON.stringify({
      email: newUser.user.email,
      name: newUser.user.displayName,
      picture: newUser.user.photoURL
    }));

    await loadFooterIfNeeded(); // Charger aussi le footer après création
    console.log("Création de compte réussie.");
    showToast("✅ Compte créé avec succès !");
  } catch (error) {
    console.error("❌ Erreur création compte :", error);
    alert("Erreur création compte : " + error.message);
  }
});

// Lien "Mot de passe oublié"
document.getElementById("resetPasswordLink")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("emailInput").value.trim();

  if (!email) {
    alert("Merci de saisir votre adresse e-mail pour recevoir un lien de réinitialisation.");
    return;
  }

  try {
    await auth.sendPasswordResetEmail(email);
    alert("📧 Un email de réinitialisation vous a été envoyé !");
  } catch (error) {
    console.error("Erreur de réinitialisation :", error);
    alert("Erreur : " + error.message);
  }
});

// Déconnexion
window.logoutUser = function () {
  auth.signOut().then(() => {
    sessionStorage.removeItem("user");
    location.reload(); // On recharge la page pour remettre l’état initial
  }).catch((error) => {
    console.error("Erreur de déconnexion :", error);
    alert("Erreur pendant la déconnexion.");
  });
};

// Observer l’état utilisateur
auth.onAuthStateChanged(async (user) => {
  const authContainer = document.getElementById("authContainer");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInfo = document.getElementById("userInfo");

  if (user) {
    console.log("🔐 Utilisateur connecté :", user.email);
    sessionStorage.setItem("uid", user.uid);

    if (authContainer) authContainer.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block"; // 🔥 protection ajoutée
    if (userInfo) userInfo.textContent = `Connecté en tant que : ${user.displayName || user.email}`;

    await loadFooterIfNeeded();
  } else {
    console.log("🔓 Utilisateur non connecté.");

    if (authContainer) authContainer.style.display = "block"; // 🔥 protection ajoutée
    if (logoutBtn) logoutBtn.style.display = "none";
    if (userInfo) userInfo.textContent = "";
  }
});



// Bouton logout
document.getElementById("logoutBtn")?.addEventListener("click", window.logoutUser);
