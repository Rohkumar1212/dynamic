function handleCredentialResponse(response) {
    const responsePayload = decodeJwt(response.credential);
    console.log("Decoded JWT:", responsePayload);

    const user = {
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture
    };

    // Generate session token (simulate backend authentication)
    const sessionToken = generateSessionToken();

    // Store user data and session token
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('sessionToken', sessionToken);
    
    console.log("User logged in:", user);

    // Redirect to products page after successful login
    window.location.href = "products.html";
}

function decodeJwt(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

function generateSessionToken() {
    return 'token-' + Math.random().toString(36).substring(2);
}

function updateUserUI() {
    let user = JSON.parse(sessionStorage.getItem('user'));
    let sessionToken = sessionStorage.getItem('sessionToken');

    if (user && sessionToken) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('user-profile').classList.remove('hidden');
        document.getElementById('user-pic').src = user.picture;
        document.getElementById('user-name').textContent = user.name;
    } else {
        document.getElementById('user-profile').classList.add('hidden');
        document.getElementById('loginBtn').style.display = 'block';
    }
}

function logout() {
    console.log("Logging out...");
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('sessionToken');

    // Reset UI
    updateUserUI();

    // Redirect to homepage
    window.location.href = "index.html";
}

// Auto-update user profile if logged in
document.addEventListener("DOMContentLoaded", () => {
    updateUserUI();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});
document.addEventListener("DOMContentLoaded", () => {
    updateUserUI();
    document.getElementById('logoutBtn')?.addEventListener("click", logout);
});

function handleCredentialResponse(response) {
    const user = decodeJwt(response.credential);
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('sessionToken', generateSessionToken());
    console.log("User logged in:", user);
    window.location.href = "products.html";
}

function decodeJwt(token) {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
}

function generateSessionToken() {
    return `token-${Math.random().toString(36).substring(2)}`;
}

function updateUserUI() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const isLoggedIn = !!sessionStorage.getItem('sessionToken');
    
    document.getElementById('loginBtn').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('user-profile').classList.toggle('hidden', !isLoggedIn);
    
    if (isLoggedIn) {
        document.getElementById('user-pic').src = user.picture;
        document.getElementById('user-name').textContent = user.name;
    }
}

function logout() {
    sessionStorage.clear();
    updateUserUI();
    window.location.href = "index.html";
}
