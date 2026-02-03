
    // ============================================
    // 1. GLOBAL STATE
    // ============================================
    let productData = {};
    let currentMaterial = null;
    let currentPrice = 0;

    // Default State
    let currentMoq = 10;
    let selectedLocationName = null;

    // Cart Load
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    let pendingUpdate = null;

    // ============================================
    // 2. INITIALIZATION
    // ============================================
    document.addEventListener("DOMContentLoaded", async () => {
        await fetchProductData();
        updateCartUI();
    });


    // Function to Trigger the Green Toast
    function showToast(message) {
        const toast = document.getElementById("custom-toast");
        const textEl = document.getElementById("toast-text");

        // Set the text
        if (textEl) textEl.innerText = message;

        // Show it
        toast.classList.add("show");

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // UPDATE your updateQty function to use this:
    function updateQty(change) {
        if (!selectedLocationName) {
            alert("⚠️ Please select 'Delhi NCR' or 'Outside Delhi' first.");
            return;
        }

        const input = document.getElementById("qtyInput");
        let val = parseInt(input.value) + change;

        // Check if user is trying to go below limit
        if (val < currentMoq) {
            // TRIGGER THE GREEN TOAST HERE
            showToast(`Minimum order for ${selectedLocationName} is ${currentMoq} Pieces.`);
            val = currentMoq;
        }

        input.value = val;
    }
    // ============================================
    // 3. LOCATION & RADIO BUTTON LOGIC (FIXED)
    // ============================================
    function handleLocationChange(moq, locationName) {
        currentMoq = moq;
        selectedLocationName = locationName;

        // 1. Update UI Message
        const msgEl = document.getElementById("moqMessage");
        msgEl.style.display = "block";
        msgEl.innerHTML = `✅ Location: <b>${locationName}</b> selected. Minimum order is <b>${moq} Pieces</b>.`;
        msgEl.style.color = "#27ae60";

        // 2. FORCE UPDATE the input value immediately
        const qtyInput = document.getElementById("qtyInput");
        if (qtyInput) {
            // Always set it to the new MOQ immediately so the user sees the change
            qtyInput.value = currentMoq;
        }
    }

    // Helper: +/- buttons for Qty
    function updateQty(change) {
        // 1. Check if location is selected first
        if (!selectedLocationName) {
            alert("⚠️ Please select 'Delhi NCR' or 'Outside Delhi' first.");
            return;
        }

        const input = document.getElementById("qtyInput");
        let val = parseInt(input.value) + change;

        // 2. Check if user is trying to go below the Limit
        if (val < currentMoq) {
            // Show Toast Warning
            showToast(`⚠️ Minimum order for ${selectedLocationName} is ${currentMoq} Pieces.`);
            val = currentMoq; // Keep value at minimum
        }

        input.value = val;
    }
   
    async function fetchProductData() {
        try {
            const response = await fetch('/js/data.json');
            const data = await response.json();
            productData = data.product;
            renderProduct();
        } catch (error) { console.error("Error loading product:", error); }
    }

    function renderProduct() {
        if (!document.getElementById('prodTitle')) return;

        // Basic Info
        document.getElementById('prodCategory').innerText = productData.category;
        document.getElementById('prodTitle').innerText = productData.title;
        document.getElementById('prodDesc').innerText = productData.short_description;
        document.getElementById('prodRating').innerText = `⭐ ${productData.rating} (${productData.review_count} Reviews)`;

        // Images
        const mainImg = document.getElementById('mainImage');
        const slider = document.getElementById('thumbSlider');
        if (productData.images?.length > 0) {
            mainImg.src = productData.images[0];
            slider.innerHTML = '';
            productData.images.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.onclick = () => mainImg.src = imgSrc;
                slider.appendChild(img);
            });
        }

        // Materials
        const matList = document.getElementById('materialList');
        matList.innerHTML = '';
        productData.materials.forEach((mat, index) => {
            const div = document.createElement('div');
            div.className = `quality-item ${index === 0 ? 'active' : ''}`;
            div.innerText = mat.name;
            div.onclick = () => selectMaterial(mat, div);
            matList.appendChild(div);
            if (index === 0) selectMaterial(mat, div);
        });
    }

    function selectMaterial(material, element) {
        currentMaterial = material;
        document.querySelectorAll('.quality-item').forEach(el => el.classList.remove('active'));
        if (element) element.classList.add('active');

        currentPrice = Math.round(productData.base_price * material.multiplier);
        document.getElementById('prodPrice').innerText = `₹ ${currentPrice} /  Pieces`;
        if (material.image) document.getElementById('mainImage').src = material.image;
    }

    
    function getVariantKey() {
        const matId = currentMaterial ? currentMaterial.id : "default";
        return `${productData.id}-${matId}`;
    }

    function buyNow() { addToCart(true); }

    function addToCart(openDrawer = false) {
        // --- VALIDATION STEP ---
        if (!selectedLocationName) {
            alert("⚠️ Please select your Delivery Location (Delhi NCR or Outside) before adding to cart.");

            // Highlight the error visually
            document.querySelector('.location-wrapper').style.border = "2px solid red";
            return;
        } else {
            // Remove error highlight if valid
            document.querySelector('.location-wrapper').style.border = "1px solid #ddd";
        }

        const qtyInput = document.getElementById("qtyInput");
        const qty = parseInt(qtyInput.value);

        // --- MOQ CHECK ---
        if (qty < currentMoq) {
            alert(`Minimum order quantity for ${selectedLocationName} is ${currentMoq} pieces.`);
            qtyInput.value = currentMoq;
            return;
        }

        const key = getVariantKey();
        const existingIndex = cart.findIndex(item => item.variantKey === key);
        let selectedImage = currentMaterial && currentMaterial.image ? currentMaterial.image : productData.images[0];

        if (existingIndex > -1) {
            // Update Existing
            updateCartItem(existingIndex, qty, selectedLocationName, selectedImage);
            finalizeAction(openDrawer, "Cart updated successfully!");
        } else {
            // Add New
            cart.push({
                variantKey: key,
                productId: productData.id,
                name: productData.title,
                material: currentMaterial.name,
                image: selectedImage,
                unitPrice: currentPrice,
                qty: qty,
                totalPrice: qty * currentPrice,
                location: selectedLocationName
            });
            saveAndRenderCart();
            finalizeAction(openDrawer, "Item added to cart!");
        }
    }

    function updateCartItem(index, qty, location, image) {
        cart[index].qty = qty;
        cart[index].location = location;
        cart[index].image = image;
        cart[index].totalPrice = qty * cart[index].unitPrice;
        saveAndRenderCart();
    }

    function removeItem(i) {
        if (confirm("Remove this item?")) {
            cart.splice(i, 1);
            saveAndRenderCart();
        }
    }

    // ============================================
    // 6. UI HELPERS & STORAGE
    // ============================================
    function finalizeAction(shouldOpenDrawer, msg) {
        if (shouldOpenDrawer) viewCart();
        else showToast(msg);
    }

    function saveAndRenderCart() {
        localStorage.setItem('myCart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        const badge = document.getElementById("headerCartCount");
        if (badge) {
            badge.innerText = cart.length;
            badge.style.display = cart.length > 0 ? "inline-block" : "none";
        }

        const container = document.getElementById("cartItemsContainer");
        const totalEl = document.getElementById("cartGrandTotal");
        if (!container) return;

        container.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            total += item.totalPrice;
            container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                <div style="flex:1; padding-left:10px;">
                    <div style="font-weight:bold; font-size:14px">${item.name}</div>                    
                    <div style="font-size:12px; margin-top:4px;">
                        Qty: <b>${item.qty}</b> 
                        <span style="color:#d35400; font-weight:bold; margin-left:5px;">₹${item.totalPrice.toLocaleString()}</span>
                    </div>
                </div>
                <button onclick="removeItem(${index})" style="color:#e74c3c; background:none; border:none; cursor:pointer; font-size:18px;">
                    &times;
                </button>
            </div>`;
        });

        if (totalEl) totalEl.innerText = "₹" + total.toLocaleString();
    }

    // Sidebar & Toast Logic
    function viewCart() {
        document.getElementById("cartModal").classList.add("open");
        document.getElementById("cartOverlay").classList.add("open");
    }
    function closeCart() {
        document.getElementById("cartModal").classList.remove("open");
        document.getElementById("cartOverlay").classList.remove("open");
    }
    function showToast(msg) {
        const toast = document.getElementById("toast-notification");
        if (toast) {
            toast.innerText = msg;
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 3000);
        }
    }

    function checkout() {
        if (cart.length === 0) { alert("Cart is empty"); return; }
        window.location.href = "checkout.html";
    }

    // --- 1. MODAL VISIBILITY ---
    function openShareModal() {
        const overlay = document.getElementById('shareOverlay');
        overlay.classList.add('open');

        // Check if "Native Share" (Mobile) is supported. If not, hide that button.
        if (!navigator.share) {
            const nativeBtn = document.getElementById('nativeShareBtn');
            if (nativeBtn) nativeBtn.style.display = 'none';
        }
    }

    function closeShareModal() {
        document.getElementById('shareOverlay').classList.remove('open');
    }

    // Close modal if clicking outside the white box
    document.getElementById('shareOverlay').addEventListener('click', function (e) {
        if (e.target === this) {
            closeShareModal();
        }
    });

    // --- 2. SHARING LOGIC ---
    function shareTo(platform) {
        // Get dynamic data from current page
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(document.title); // Or use product name

        let shareUrl = '';

        switch (platform) {
            case 'whatsapp':
                // Opens WhatsApp with: "Product Name https://yoursite.com..."
                shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
                window.open(shareUrl, '_blank');
                break;

            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                window.open(shareUrl, '_blank');
                break;

            case 'native':
                // Uses the phone's built-in share menu (Android/iOS)
                if (navigator.share) {
                    navigator.share({
                        title: document.title,
                        text: 'Check out this product!',
                        url: window.location.href
                    })
                        .then(() => console.log('Shared successfully'))
                        .catch((error) => console.log('Error sharing:', error));
                } else {
                    alert("Sharing not supported on this browser.");
                }
                break;
        }
    }

    // --- 3. COPY LINK FUNCTION ---
    function copyLink() {
        const url = window.location.href;

        // Modern Clipboard API
        navigator.clipboard.writeText(url).then(() => {
            // Close modal
            closeShareModal();

            // Show the Toast notification (using the toast we made earlier)
            // If you don't have the toast function, use alert("Link Copied!");
            if (typeof showToast === "function") {
                showToast("Link copied to clipboard!");
            } else {
                alert("Link copied to clipboard!");
            }
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

  
        document.addEventListener("DOMContentLoaded", function () {
            const productImage = document.getElementById("productImage");
            const productName = document.getElementById("productName");
            const productDescription = document.getElementById("productDescription");
            const productDimensions = document.getElementById("productDimensions");
            const productMaterial = document.getElementById("productMaterial");
            const productApplication = document.getElementById("productApplication");
            const productEcoFriendly = document.getElementById("productEcoFriendly");
            const productType = document.getElementById("productType");
            const productPrice = document.getElementById("productPrice");
            const addToCartBtn = document.getElementById("addToCartBtn");

            const selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));

            if (selectedProduct) {
                // Fetch additional product data from the API
                fetch(`https://api.dynamiccorrugations.com/item?id=${selectedProduct.id}`)
                    .then((response) => response.json())
                    .then((data) => {
                        if (data && data.data) {
                            const product = data.data;
                            productImage.src = `https://api.dynamiccorrugations.com/${product.images}`;
                            productName.innerText = product.name;
                            productDescription.innerText = product.description;
                            productDimensions.innerText = product.dimensions;
                            productMaterial.innerText = product.material;
                            productApplication.innerText = product.application;
                            productEcoFriendly.innerText = product.ecoFriendly;
                            productType.innerText = product.type;
                            productPrice.innerText = `₹${product.price}`;

                            // Add to Cart Functionality
                            addToCartBtn.addEventListener("click", function () {
                                addToCart(product.id, product.name, product.price, product.images);
                            });
                        } else {
                            productDetailContainer.innerHTML = "<p>Product details not found.</p>";
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching product details:", error);
                        productDetailContainer.innerHTML = "<p>Failed to load product details.</p>";
                    });
            } else {
                productDetailContainer.innerHTML = "<p>No product selected.</p>";
            }

            function addToCart(id, name, price, image) {
                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                const existingProduct = cart.find((item) => item.id === id);
                if (existingProduct) {
                    existingProduct.quantity += 1;
                } else {
                    cart.push({ id, name, price, quantity: 1, image });
                }
                localStorage.setItem("cart", JSON.stringify(cart));
                alert('Added to cart!');
            }
        });
  
  
        // ---------- Helpers & State ----------
        const cart = [];
        const pricePerPc = 320; // example base price; in real app, price depends on size/quality
        const sizeSelect = document.getElementById('sizeSelect');
        const selectedSizeEl = document.getElementById('selectedSize');
        const selectedPxEl = document.getElementById('selectedPx');
        const customSizeInput = document.getElementById('customSize');
        const qtyInput = document.getElementById('qty');
        const cartModal = document.getElementById('cartModal');
        const cartList = document.getElementById('cartList');
        const cartTotalEl = document.getElementById('cartTotal');

        // initialize
        updateSizePreview();

        // Image gallery change
        function changeImage(el) {
            const main = document.getElementById('mainImage');
            main.src = el.src;
        }

        // Size select logic (shows custom input if user picks custom)
        sizeSelect.addEventListener('change', updateSizePreview);
        function updateSizePreview() {
            const opt = sizeSelect.options[sizeSelect.selectedIndex];
            const inches = opt.getAttribute('data-inches') || opt.text;
            const px = opt.getAttribute('data-px') || '';
            selectedSizeEl.innerText = inches;
            selectedPxEl.innerText = px || '—';
            if (opt.value === 'custom') {
                customSizeInput.style.display = 'block';
                customSizeInput.focus();
            } else {
                customSizeInput.style.display = 'none';
                customSizeInput.value = '';
            }
        }

        // Quality select handling
        function selectQuality(el) {
            document.querySelectorAll('.quality-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
        }

        // qty
        function increaseQty() { qtyInput.value = Math.max(1, parseInt(qtyInput.value || 1)) + 1 }
        function decreaseQty() { qtyInput.value = Math.max(1, parseInt(qtyInput.value || 1) - 1) }

        // Add to cart logic
        function getSelectedQuality() { return document.querySelector('.quality-item.active')?.innerText || 'Standard' }
        function getSelectedSize() {
            const opt = sizeSelect.options[sizeSelect.selectedIndex];
            if (opt.value === 'custom' && customSizeInput.value.trim()) return customSizeInput.value.trim();
            return opt.getAttribute('data-inches') || opt.text;
        }
        function computePrice(sizeText, qualityText, qty) {
            // simple pricing logic for demo: base price * qty * quality multiplier
            let mult = 1;
            if (qualityText.toLowerCase().includes('double')) mult = 1.6;
            if (qualityText.toLowerCase().includes('corrugated')) mult = 1.4;
            if (qualityText.toLowerCase().includes('kraft')) mult = 1.25;
            return Math.round(pricePerPc * mult * qty);
        }

        function handleAddToCart() {
            const qty = parseInt(qtyInput.value || 1);
            const size = getSelectedSize();
            const quality = getSelectedQuality();
            const item = {
                id: Date.now(),
                title: size + ' • ' + quality,
                qty, price: computePrice(size, quality, qty),
                img: document.getElementById('mainImage')
            };
            cart.push(item);
            animateAddToCart();
            updateCartUI();
            // brief toast
            showToast(`${qty} x ${size} (${quality}) added to cart`);
        }

        function addToCartView() {
            handleAddToCart();
            openCart();
        }

        // Cart UI
        function updateCartUI() {
            cartList.innerHTML = '';
            let total = 0;
            if (cart.length === 0) { cartList.innerHTML = '<div style="color:#667">Your cart is empty</div>'; cartTotalEl.innerText = '₹0'; return }
            cart.forEach(i => {
                total += i.price;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
          <img src="/images/products/Corrugated Box/Corrugated Box-23.jpeg" alt="cart item" />
          <div style="flex:1">
            <div style="font-weight:800">${i.title}</div>
            <div style="font-size:13px;color:#556">Qty: ${i.qty} • ₹${i.price}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <button onclick="removeCartItem(${i.id})" style="background:transparent;border:none;color:#d33;cursor:pointer">Remove</button>
          </div>
        `;
                cartList.appendChild(div);
            });
            cartTotalEl.innerText = `₹${total}`;
        }
        function removeCartItem(id) {
            const idx = cart.findIndex(i => i.id === id);
            if (idx > -1) cart.splice(idx, 1);
            updateCartUI();
        }
        function clearCart() { cart.length = 0; updateCartUI(); showToast('Cart cleared') }

        function openCart() { cartModal.classList.add('open'); updateCartUI(); window.scrollTo({ top: 0, behavior: 'smooth' }) }
        function toggleCart() { cartModal.classList.toggle('open'); updateCartUI() }

        function checkout() {
            if (cart.length === 0) { showToast('Cart is empty'); return }
            // in production, route to checkout flow; here just show an alert
            alert('Proceeding to checkout. Total: ' + cartTotalEl.innerText);
        }

        function removeCartItem(id) {
            const pos = cart.findIndex(x => x.id === id);
            if (pos > -1) cart.splice(pos, 1);
            updateCartUI();
        }

        // WhatsApp share
        function shareWhatsApp() {
            const size = getSelectedSize();
            const quality = getSelectedQuality();
            const qty = parseInt(qtyInput.value || 1);
            const url = location.href;
            const text = encodeURIComponent(`Hi — I'm interested in this box:\nProduct: ${size} • ${quality}\nQuantity: ${qty}\nApprox Price (est): ₹${computePrice(size, quality, qty)}\nLink: ${url}\nPlease contact me for order details.`);
            // use wa.me for mobile and web.whatsapp for web fallback
            const wa = `https://wa.me/?text=${text}`;
            window.open(wa, '_blank');
        }

        // Tabs
        function openTab(evt, id) {
            document.querySelectorAll('.tab-buttons button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            evt.currentTarget.classList.add('active');
            document.getElementById(id).classList.add('active');
        }

        // small toast
        function showToast(msg = 'Saved') {
            const t = document.createElement('div');
            t.style.position = 'fixed'; t.style.bottom = '22px'; t.style.left = '50%'; t.style.transform = 'translateX(-50%)';
            t.style.background = 'rgba(20,30,60,0.94)'; t.style.color = '#fff'; t.style.padding = '10px 16px'; t.style.borderRadius = '10px';
            t.style.fontWeight = 700; t.style.zIndex = 9999; t.style.boxShadow = '0 10px 30px rgba(0,0,0,0.18)';
            t.innerText = msg;
            document.body.appendChild(t);
            setTimeout(() => { t.style.transition = 'opacity .2s'; t.style.opacity = 0; setTimeout(() => t.remove(), 250) }, 1600);
        }

        // small animation for add to cart
        function animateAddToCart() {
            const btn = document.getElementById('addToCartBtn');
            btn.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], { duration: 260, easing: 'ease' });
            btn.style.boxShadow = '0 12px 40px rgba(0,123,255,0.12)';
            setTimeout(() => btn.style.boxShadow = '', 300);
        }

        // click outside cart to close
        document.addEventListener('click', (e) => {
            if (!cartModal.contains(e.target) && !e.target.closest('.view-cart') && cartModal.classList.contains('open')) {
                cartModal.classList.remove('open');
            }
        });

        // accessibility: allow quality items keyboard select
        document.querySelectorAll('.quality-item').forEach(el => {
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectQuality(el) }
            });
        });

  
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
        import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

        // 1. Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBfJTHAzQ6u27vGwdsC9HEEMYCdNnjYnJU",
            authDomain: "dynamiccorrugations-ac4a8.firebaseapp.com",
            projectId: "dynamiccorrugations-ac4a8",
            storageBucket: "dynamiccorrugations-ac4a8.firebasestorage.app",
            messagingSenderId: "481189371368",
            appId: "1:481189371368:web:58cf359e533d8cadcdd85d",
            measurementId: "G-6PL4T4METT"
        };

        // 2. Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();

        // 3. Define Global App Actions (Login, Logout, Navigation)
        window.app = {
            // Redirect to Dashboard
            openDashboard: function () {
                console.log("Navigating to Dashboard...");
                window.location.href = "dashboard.html"; // Change this if you use tab switching instead
            },

            // Trigger Google Login
            login: function () {
                signInWithPopup(auth, provider).catch((error) => {
                    console.error("Login Failed:", error);
                    alert("Login failed: " + error.message);
                });
            },

            // Trigger Logout
            logout: function () {
                signOut(auth).then(() => {
                    console.log("Logged out successfully");
                    // Optional: Redirect to home or reload
                    window.location.reload();
                }).catch((error) => {
                    console.error("Logout error", error);
                });
            }
        };

        // 4. Attach Login Button Event Listener
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', window.app.login);
        }

        // 5. Auth State Listener (Populates the HTML Data)
        onAuthStateChanged(auth, (user) => {
            const userWidget = document.getElementById('user-widget');

            // HTML Elements to populate
            const displayNameEl = document.getElementById('display-name');
            const emailEl = document.getElementById('user-email');
            const smallPhotoEl = document.getElementById('user-photo-small');
            const largePhotoEl = document.getElementById('profile-photo-large');

            if (user) {
                // --- USER IS LOGGED IN ---
                console.log("User detected:", user.email);

                // 1. Swap Buttons (Hide Login, Show Widget)
                if (loginBtn) loginBtn.style.display = 'none';
                if (userWidget) userWidget.style.display = 'block'; // Or 'flex' depending on CSS

                // 2. Inject Data
                if (displayNameEl) displayNameEl.textContent = user.displayName;
                if (emailEl) emailEl.textContent = user.email;

                // 3. Update Images (Handle missing photos with a fallback)
                const photoUrl = user.photoURL || "https://via.placeholder.com/80";
                if (smallPhotoEl) smallPhotoEl.src = photoUrl;
                if (largePhotoEl) largePhotoEl.src = photoUrl;

            } else {
                // --- USER IS LOGGED OUT ---
                console.log("No user signed in.");

                // 1. Swap Buttons (Show Login, Hide Widget)
                if (loginBtn) loginBtn.style.display = 'block';
                if (userWidget) userWidget.style.display = 'none';
            }
        });
  

  
        // --- VARIABLES ---
        let pendingUpdate = null; // Stores data temporarily while popup is open

        // --- 1. CONFLICT CHECK LOGIC ---
        function addToCart() {
            const selectedCity = document.getElementById("citySelect").value;
            const qty = parseInt(document.getElementById("qtyInput").value);

            // 1. Validation
            if (!selectedCity) {
                alert("Please select a Delivery Location.");
                return;
            }

            // 2. Identify Item (Key = ProductID + MaterialID) *Ignore City in Key*
            const key = `${productData.id}-${currentMaterial ? currentMaterial.id : 'default'}`;

            // 3. Check if Item exists
            const existingIndex = cart.findIndex(item => item.variantKey === key);

            if (existingIndex > -1) {
                // Item is in cart. Check if LOCATION matches.
                const currentItem = cart[existingIndex];

                if (currentItem.location !== selectedCity) {
                    // ★ CONFLICT FOUND: Trigger the specific Popup ★

                    // Save details to verify later
                    pendingUpdate = {
                        index: existingIndex,
                        newCity: selectedCity,
                        newQty: qty,
                        newImage: (currentMaterial && currentMaterial.image) ? currentMaterial.image : productData.images[0]
                    };

                    // Show the specific message
                    const msg = `Your cart contains this item for '<b>${currentItem.location}</b>'.<br>Do you want to change location to '<b>${selectedCity}</b>' and update the quantity?`;

                    showConflictModal(msg);
                    return; // STOP HERE. Wait for user to click "Yes" or "Cancel".
                }

                // If Location matches, just update normally (No popup needed)
                updateCartItem(existingIndex, qty, selectedCity, currentItem.image);

            } else {
                // New Item (Add normally)
                let selectedImage = (currentMaterial && currentMaterial.image) ? currentMaterial.image : productData.images[0];

                cart.push({
                    variantKey: key,
                    productId: productData.id,
                    name: productData.title,
                    material: currentMaterial.name,
                    image: selectedImage,
                    unitPrice: currentPrice,
                    qty: qty,
                    totalPrice: qty * currentPrice,
                    location: selectedCity
                });
                saveAndRenderCart();
                viewCart();
            }
        }

        // --- 2. UPDATE FUNCTION (Runs when "Yes, Update It" is clicked) ---
        function updateCartItem(index, qty, location, image) {
            cart[index].qty = qty;
            cart[index].location = location; // Replace old city with new city
            cart[index].image = image;
            cart[index].totalPrice = qty * cart[index].unitPrice;

            saveAndRenderCart();
        }

        // Listener for the "Yes" button
        document.getElementById("confirmUpdateBtn").onclick = function () {
            if (pendingUpdate) {
                updateCartItem(
                    pendingUpdate.index,
                    pendingUpdate.newQty,
                    pendingUpdate.newCity,
                    pendingUpdate.newImage
                );
                closeConflictModal();
                viewCart(); // Open sidebar to show the updated city
            }
        };

        // --- 3. MODAL UTILS ---
        function showConflictModal(msg) {
            document.getElementById("conflictMessage").innerHTML = msg;
            document.getElementById("conflictOverlay").classList.add("open");
        }

        function closeConflictModal() {
            document.getElementById("conflictOverlay").classList.remove("open");
            pendingUpdate = null; // Clear temp data
        }
  
  
        // Function to Open the Overlay
        function openShareModal() {
            document.getElementById("shareOverlay").classList.add("open");
        }

        // Function to Close the Overlay
        function closeShareModal() {
            document.getElementById("shareOverlay").classList.remove("open");
        }

        // Optional: Close if user clicks outside the modal (on the dark background)
        document.getElementById("shareOverlay").addEventListener("click", function (e) {
            if (e.target === this) {
                closeShareModal();
            }
        });
  