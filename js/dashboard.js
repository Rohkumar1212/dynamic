
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
  import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

  /* --- CONFIGURATION --- */
  const firebaseConfig = {
    apiKey: "AIzaSyBfJTHAzQ6u27vGwdsC9HEEMYCdNnjYnJU",
    authDomain: "dynamiccorrugations-ac4a8.firebaseapp.com",
    projectId: "dynamiccorrugations-ac4a8",
    storageBucket: "dynamiccorrugations-ac4a8.firebasestorage.app",
    messagingSenderId: "481189371368",
    appId: "1:481189371368:web:58cf359e533d8cadcdd85d",
  };

  const appFB = initializeApp(firebaseConfig);
  const auth = getAuth(appFB);
  const provider = new GoogleAuthProvider();


  

/* ================= GLOBAL APP OBJECT ================= */
// We attach 'app' to 'window' so inline HTML onclicks work
window.app = {
    
    // Function to switch tabs
    switchTab: function(tabName) {
        console.log("Switching to:", tabName); // Debug check

        // 1. Hide ALL View Sections
        const allSections = document.querySelectorAll('.view-section');
        allSections.forEach(section => {
            section.classList.remove('active');
        });

        // 2. Remove 'active' class from ALL Sidebar Buttons
        const allButtons = document.querySelectorAll('.nav-btn');
        allButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // 3. Show the TARGET View Section
        const targetSection = document.getElementById('view-' + tabName);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            console.error("Section not found: view-" + tabName);
        }

        // 4. Highlight the clicked Sidebar Button
        // We find the button that contains the onclick matching our tabName
        const targetBtn = document.querySelector(`button[onclick="app.switchTab('${tabName}')"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    },

    // Logout Function
    logout: function() {
        if(confirm("Are you sure you want to logout?")) {
            console.log("Logging out...");
            // Add your firebase signOut logic here
            window.location.href = "/index.html"; // Redirect to homepage after logout
        }
    }
};

/* ================= INITIALIZATION ================= */
document.addEventListener('DOMContentLoaded', () => {
    // Set the default tab (Overview) on load
    app.switchTab('overview');
});
  /* --- AUTH LISTENER --- */
  onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById("login-btn");
    const userWidget = document.getElementById("user-widget");

    if (user) {
      if(loginBtn) loginBtn.style.display = "none";
      if(userWidget) userWidget.style.display = "block";
      
      // Update Images
      const photo = user.photoURL || "https://via.placeholder.com/150";
      const userPhoto = document.getElementById("user-photo");
      const profilePhotoLarge = document.getElementById("profile-photo-large");
      
      if(userPhoto) userPhoto.src = photo;
      if(profilePhotoLarge) profilePhotoLarge.src = photo;
      
      // Update Text
      const displayName = document.getElementById("display-name");
      const userEmail = document.getElementById("user-email");
      
      if(displayName) displayName.textContent = user.displayName;
      if(userEmail) userEmail.textContent = user.email;

    } else {
      if(loginBtn) loginBtn.style.display = "block";
      if(userWidget) userWidget.style.display = "none";
    }
  });

  /* --- INITIALIZATION --- */
  document.addEventListener("DOMContentLoaded", () => {
      
      // 1. Attach Login Listener
      const loginBtn = document.getElementById("login-btn");
      if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            signInWithPopup(auth, provider).catch(err => alert(err.message));
        });
      }

      // 2. Set Default Tab (if on dashboard page)
      if (document.getElementById('view-overview')) {
          window.app.switchTab('overview');
      }
  });

/* ================= USER INFO ================= */
onAuthStateChanged(auth, (user) => {
  if (!user) return; // dashboard auth guard should handle redirect

  // PHOTO
  const photo = document.getElementById("d-photo");
  photo.src = user.photoURL || "https://i.pravatar.cc/100";
  photo.alt = user.displayName || "User";

  // NAME & EMAIL
  document.getElementById("d-name").textContent =
    user.displayName || "User";

  document.getElementById("d-email").textContent =
    user.email || "";

  // MEMBER SINCE
  const createdAt = user.metadata.creationTime;
  const date = new Date(createdAt);
  const monthYear = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  document.getElementById("d-member-since").textContent =
    `Member since ${monthYear}`;
});