
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
        import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

        // 2. Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBfJTHAzQ6u27vGwdsC9HEEMYCdNnjYnJU",
            authDomain: "dynamiccorrugations-ac4a8.firebaseapp.com",
            projectId: "dynamiccorrugations-ac4a8",
            storageBucket: "dynamiccorrugations-ac4a8.firebasestorage.app",
            messagingSenderId: "481189371368",
            appId: "1:481189371368:web:58cf359e533d8cadcdd85d",
            measurementId: "G-6PL4T4METT"
        };

        // 3. Initialize
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        let currentUser = null; // Store user data here

        // 4. Global App Functions (Attached to window for HTML onclick events)
        window.app = {

            // --- VIEW NAVIGATION ---

            // Called when clicking dropdown items (Profile, Orders, etc.)
            openDashboard: function (tabName) {
                // Hide Home, Show Dashboard
                document.getElementById('home-view').style.display = 'none';
                document.getElementById('dashboard-view').style.display = 'flex'; // Flex to keep sidebar layout

                // Switch to the specific tab requested
                this.switchTab(tabName);
            },

            // Called when clicking "Back to Home"
            goHome: function () {
                document.getElementById('dashboard-view').style.display = 'none';
                document.getElementById('home-view').style.display = 'block';
            },

            // --- TAB SWITCHING LOGIC ---

            switchTab: function (tabName) {
                // 1. Hide all tab panes
                const panes = document.querySelectorAll('.tab-pane');
                panes.forEach(pane => pane.classList.remove('active'));

                // 2. Deactivate all sidebar buttons
                const btns = document.querySelectorAll('.sidebar-btn');
                btns.forEach(btn => btn.classList.remove('active'));

                // 3. Show the selected pane
                const targetPane = document.getElementById('tab-' + tabName);
                if (targetPane) targetPane.classList.add('active');

                // 4. Highlight the sidebar button
                const targetBtn = document.getElementById('btn-' + tabName);
                if (targetBtn) targetBtn.classList.add('active');
            },

            // --- AUTH ACTIONS ---

            logout: function () {
                signOut(auth).then(() => {
                    alert("Logged out successfully");
                    this.goHome(); // Reset view
                }).catch((error) => {
                    console.error("Logout error", error);
                });
            },

            // --- PAYMENT LOGIC ---

            payWithPayU: function () {
                if (!currentUser) {
                    alert("Please login to proceed with payment.");
                    return;
                }

                // 1. Generate Transaction ID (Unique)
                const txnid = "TXN" + new Date().getTime();

                // 2. Populate Hidden Form Fields
                document.getElementById('txnid').value = txnid;
                document.getElementById('payu-name').value = currentUser.displayName || "Guest";
                document.getElementById('payu-email').value = currentUser.email;

                // 3. Warning about Hash (Server-side requirement)
                alert("Redirecting to PayU...\n\nNOTE: Since this is a static HTML file, the 'hash' field is empty. You will see a hash error on PayU unless you generate the hash on your backend server.");

                // 4. Submit the form
                document.getElementById('payu-form').submit();
            }
        };

        // 5. Auth State Listener (Runs automatically on load/login/logout)
        const loginBtn = document.getElementById('login-btn');
        const userWidget = document.getElementById('user-widget');

        // Attach Login Click Event
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                signInWithPopup(auth, provider).catch(e => alert(e.message));
            });
        }

        onAuthStateChanged(auth, (user) => {
            currentUser = user;

            if (user) {
                // --- USER LOGGED IN ---
                console.log("User Logged In:", user.email);

                // 1. Toggle Header Elements
                if (loginBtn) loginBtn.style.display = 'none';
                if (userWidget) userWidget.style.display = 'flex';

                // 2. Fill Header Data
                const displayName = document.getElementById('display-name');
                const userPhoto = document.getElementById('user-photo');
                if (displayName) displayName.textContent = user.displayName;
                if (userPhoto) userPhoto.src = user.photoURL;

                // 3. Fill Profile Tab Data
                const pName = document.getElementById('p-name');
                const pEmail = document.getElementById('p-email');
                const pUid = document.getElementById('p-uid');
                if (pName) pName.textContent = user.displayName;
                if (pEmail) pEmail.textContent = user.email;
                if (pUid) pUid.textContent = user.uid;

                // Note: We do NOT auto-show the dashboard here. 
                // We stay on Home until the user clicks the Dropdown.

            } else {
                // --- USER LOGGED OUT ---
                console.log("User Logged Out");

                // 1. Toggle Header Elements
                if (loginBtn) loginBtn.style.display = 'block';
                if (userWidget) userWidget.style.display = 'none';

                // 2. Force View to Home
                window.app.goHome();
            }
        });

        // Global App Logic attached to window
            window.app = {
                // Redirect to the external dashboard.html file
                openDashboard: function () {
                    console.log("Redirecting to Dashboard...");
                    window.location.href = "dashboard.html";
                },

                // Handle Logout
                logout: function () {
                    // (Assuming you have auth imported as shown in previous steps)
                    import("https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js")
                        .then(({ signOut, getAuth }) => {
                            const auth = getAuth();
                            signOut(auth).then(() => {
                                window.location.reload();
                            });
                        });
                }
            };

