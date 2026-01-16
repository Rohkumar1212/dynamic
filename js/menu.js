
        // --- Mobile Menu Toggle ---
        function toggleMobileMenu() {
            document.getElementById('mainMenu').classList.toggle('active');
        }

        // --- Profile Dropdown Toggle ---
        function toggleProfile() {
            document.getElementById('profile-card').classList.toggle('active');
        }

        // --- Close on Outside Click ---
        document.addEventListener('click', function (e) {
            // Close Profile
            const widget = document.getElementById('user-widget');
            if (widget && !widget.contains(e.target)) {
                document.getElementById('profile-card').classList.remove('active');
            }
            // Close Mobile Menu if clicking outside header
            const header = document.getElementById('header');
            if (!header.contains(e.target)) {
                document.getElementById('mainMenu').classList.remove('active');
            }
        });

        // --- Login Logic (Simulated for Demo) ---
        window.app = {
            login: function () {
                // Hides Login, Shows Widget
                document.getElementById('login-btn').style.display = 'none';
                document.getElementById('user-widget').style.display = 'block';

                // Set Dummy Data
                document.getElementById('user-photo-small').src = "https://via.placeholder.com/45";
                document.getElementById('profile-photo-large').src = "https://via.placeholder.com/80";
                document.getElementById('display-name').textContent = "Rohit Kumar";
                document.getElementById('user-email').textContent = "rohitkumar.cs999@gmail.com";
            },
            logout: function () {
                // Shows Login, Hides Widget
                document.getElementById('login-btn').style.display = 'block';
                document.getElementById('user-widget').style.display = 'none';
                document.getElementById('profile-card').classList.remove('active');
            },
            openDashboard: function () {
                alert("Redirecting to profile...");
            }
        };
 