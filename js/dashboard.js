
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
onAuthStateChanged(auth, async (user) => { // Added async to allow database fetching
  const loginBtn = document.getElementById("login-btn");
  const userWidget = document.getElementById("user-widget");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (userWidget) userWidget.style.display = "block";

    // 1. Set Default values from Auth
    let displayNameValue = user.displayName || "Guest";
    let emailValue = user.email || "No Email";
    let photo = user.photoURL || "../images/team/user.jfif"; // Your specified local fallback

    // 2. Fetch extra details from Firestore (important for Guest accounts)
    try {
      // Import getDoc if not already available in your scope
      const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js");
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        displayNameValue = data.displayName || displayNameValue;
        emailValue = data.email || emailValue;
        // Use database photo if it exists, otherwise stay with previous 'photo' value
        photo = data.photoURL || photo;

        // Optional: Update Noida address display if you have the element
        const addrDisplay = document.getElementById("user-address-display");
        if (addrDisplay) addrDisplay.textContent = data.address || "";
      }
    } catch (error) {
      console.error("Error fetching user data from Firestore:", error);
    }

    // 3. Update Images
    const userPhoto = document.getElementById("user-photo");
    const profilePhotoLarge = document.getElementById("profile-photo-large");
    if (userPhoto) userPhoto.src = photo;
    if (profilePhotoLarge) profilePhotoLarge.src = photo;

    // 4. Update Text
    const displayName = document.getElementById("display-name");
    const userEmail = document.getElementById("user-email");
    if (displayName) displayName.textContent = displayNameValue;
    if (userEmail) userEmail.textContent = emailValue;

  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (userWidget) userWidget.style.display = "none";
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


/* ================= USER INFO OBSERVER ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) return; 

  // Default values for standard social logins
  let finalName = user.displayName || "User";
  let finalEmail = user.email || "";
  let finalPhoto = user.photoURL || "../images/team/user.jfif";
  let joinDate = user.metadata.creationTime; 

  // CONDITION: If user is Guest (Anonymous), fetch custom data from Firestore
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      
      // Override with data from the Guest Form
      finalName = data.displayName || finalName;
      finalEmail = data.email || finalEmail;
      finalPhoto = data.photoURL || finalPhoto;
      
      // Use the Firestore timestamp for accurate "Member since"
      if (data.lastLogin) {
        joinDate = data.lastLogin.toDate();
      }

      // If you have a phone display element, you can set it here:
      const phoneEl = document.getElementById("d-phone");
      if (phoneEl) phoneEl.textContent = data.phone || "No Phone";
    }
  } catch (error) {
    console.error("Dashboard data error:", error);
  }

  // UPDATE DASHBOARD UI ELEMENTS
  const photoEl = document.getElementById("d-photo");
  const nameEl = document.getElementById("d-name");
  const emailEl = document.getElementById("d-email");
  const memberSinceEl = document.getElementById("d-member-since");

  if (photoEl) {
    photoEl.src = finalPhoto;
    photoEl.alt = finalName;
  }
  if (nameEl) nameEl.textContent = finalName;
  if (emailEl) emailEl.textContent = finalEmail;

  // FORMAT AND DISPLAY DATE
  const date = new Date(joinDate);
  const monthYear = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  if (memberSinceEl) {
    memberSinceEl.textContent = `Member since ${monthYear}`;
  }
});

/* --- GUEST SUBMISSION LOGIC --- */
window.app.submitGuestLogin = async function () {
    const name = document.getElementById('guest-name').value;
    const email = document.getElementById('guest-email').value;
    const phone = document.getElementById('phone').value; // Capturing Phone Number
    const errorEl = document.getElementById('error-message');

    if (!name || !email) {
        errorEl.textContent = "Full Name and Email are required!";
        errorEl.style.display = 'block';
        return;
    }

    try {
        // 1. Trigger Anonymous Login
        const result = await signInAnonymously(auth);

        // 2. Save Guest details to Firestore immediately
        const userData = {
            uid: result.user.uid,
            displayName: name,
            email: email,
            phone: phone, // Saving Phone from form
            provider: 'guest',
            lastLogin: serverTimestamp() // Used for "Member since"
        };

        // Reference to the 'users' collection using the new UID
        await setDoc(doc(db, "users", result.user.uid), userData, { merge: true });

        // 3. Success: Close the login modal
        this.closeLoginModal();

    } catch (err) {
        // Handle 'auth/admin-restricted-operation' if Anonymous Auth isn't enabled in Console
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
    }
};


