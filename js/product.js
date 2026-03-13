async function loadProductDetails() {
    const baseURL = 'https://admin.dynamiccorrugations.com';
    const apiURL = `${baseURL}/api/products`;

    // 1. Extract the ID from the URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    console.log(apiURL);

    if (!productId) {
        console.error("No Product ID found in URL.");
        return;
    }

    try {
        const response = await fetch(apiURL);
        const result = await response.json();

        if (result.success) {
            // 2. Find the specific product in the array
            const product = result.data.find(item => item.id === productId);

            if (product) {
                // 3. Set Images
                const fullImgUrl = `${baseURL}${product.mainImage}`;
                document.getElementById('mainImage').src = fullImgUrl;
                document.getElementById('mainImage').alt = product.title;

                // Set thumbnail (Main image acts as first thumbnail)
                const thumbSlider = document.getElementById('thumbSlider');
                thumbSlider.innerHTML = `
                        <img class="thumb active" src="${fullImgUrl}"
                             onclick="document.getElementById('mainImage').src='${fullImgUrl}'"
                             style="width:80px; height:80px; object-fit:cover; cursor:pointer; border:1px solid #ddd; margin-right:5px;">
                    `;

                // 4. Set Header Details (Category, Price, Title)
                document.getElementById('prodCategory').innerText = product.category.title;

                // Format price with currency symbol
                const currencySymbol = product.currency === 'INR' ? '₹' : product.currency;
                document.getElementById("prodPrice").innerText =
                  `${currencySymbol} ${product.basePricePerPiece} /Pieces`;

                document.getElementById('prodTitle').innerText = product.title;

                // 5. Set Description (Using fallback if API description is missing)
                const descriptionArea = document.getElementById('prodDesc');
                descriptionArea.innerText = product.description ||
                    `Our ${product.title} is designed for durability and strength. Ideal for e-commerce packaging, shipping, and storage needs.`;

                // 6. Set Material List (Mocking quality options)
                const materialList = document.getElementById('materialList');
                const qualities = ["Standard Kraft", "High-GSM Semi-Kraft", "Premium White"];
                materialList.innerHTML = qualities.map(q => `<div class="quality-item" style="display:inline-block; padding:5px 15px; border:1px solid #ddd; margin-right:5px; border-radius:4px; font-size:12px;">${q}</div>`).join('');

            } else {
                document.querySelector('.page-frame').innerHTML = `<h3>Product not found.</h3>`;
            }
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', loadProductDetails);

// Placeholder for your existing logic (Quantity updates, etc.)
function updateQty() {
  const qtyInput = document.getElementById("qtyInput");
  let currentVal = parseInt(qtyInput.value) || 0;

  // If it's the first click (value is 1), jump to 5.
  // Otherwise, just add 5.
  if (currentVal === 1) {
    qtyInput.value = 5;
  } else {
    qtyInput.value = currentVal + 5;
  }
}

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
// ============================================
// 4. DATA FETCHING
// ============================================
async function fetchProductData() {
    try {
        // 1. Get the ID from the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            console.error("No product ID found in URL");
            return;
        }

        // 2. Fetch all products (or a specific one if your API supports it)
        const response = await fetch(`https://admin.dynamiccorrugations.com/api/products`);
        const result = await response.json();

        // 3. Find the specific product that matches the ID from the URL
        // Your API returns products inside a 'data' array
        const allProducts = result.data || [];
        productData = allProducts.find(p => p.id === productId);

        if (productData) {
            console.log("Product Loaded:", productData);
            renderProduct();
            // alert(productData.id); // For debugging
        } else {
            console.error("Product not found in the list");
        }

    } catch (error) {
        console.error("Data Load Error:", error);
    }
}


function selectMaterial(material, element) {
    // 1. Update Global State
    currentMaterial = material;

    // 2. UI: Toggle active class on the buttons/chips
    document.querySelectorAll('.quality-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');

    // 3. Calculation: Use basePricePerPiece from API * material.multiplier
    // productData is the object fetched from https://admin.dynamiccorrugations.com/api/products
    currentPrice = Math.round(productData.prodPrice * material.multiplier);

    // 4. Update the Price Display in your <div id="prodPrice">
    const priceElement = document.getElementById('prodPrice');
    if (priceElement) {
        priceElement.innerText = `₹ ${currentPrice.toLocaleString()} / Piece`;
    }

    // 5. Image Update: Change main image if variant has a specific one
    if (material.image) {
        document.getElementById('mainImage').src = material.image;
    }

    // 6. Refresh Total: If quantity is already selected, update the total amount
    updatePriceDisplay();
}

// ============================================
// 5. CART LOGIC
// ============================================

// Unique ID for Product Variant
function getVariantKey() {
    const matId = currentMaterial ? currentMaterial.id : "default";
    return `${productData.id}-${matId}`;
}
function buyNow() { addToCart(true); }

async function removeExistingProduct(productId) {

    try {

        const userToken = getAuthToken();

        const res = await fetch(
            "https://admin.dynamiccorrugations.com/api/cart",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${userToken}`
                }
            }
        );

        const data = await res.json();

        const items = data.data?.items || [];

        for (const item of items) {

            // SAME PRODUCT
            if (item.productId === productId) {

                await fetch(
                    `https://admin.dynamiccorrugations.com/api/cart/items/${item.id}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${userToken}`
                        }
                    }
                );

            }

        }

    } catch (error) {

        console.error("Error removing existing product:", error);

    }

}
async function addToCart(openDrawer = false) {

    const userToken = getAuthToken();

    if (!userToken) {
        showToast("Please login first");
        return;
    }
    // --- LOCATION VALIDATION ---
    if (!selectedLocationName) {
        alert("⚠️ Please select your Delivery Location before adding to cart.");
        document.querySelector('.location-wrapper').style.border = "2px solid red";
        return;
    } else {
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
    function getToken() {
        return localStorage.getItem("token");
    }
    // --- IMAGE ---


    // --- 1. IMAGE SELECTION FIX ---
    // Replace the crashing line with this safe check:
    let rawImage = "";

    if (currentMaterial && currentMaterial.image) {
        rawImage = currentMaterial.image;
    } else if (productData && productData.mainImage) {
        // USE mainImage instead of images[0]
        rawImage = productData.mainImage;
    } else {
        rawImage = "/images/placeholder.png";
    }

    // Prepend domain for relative paths
    let selectedImage = rawImage.startsWith('http')
        ? rawImage
        : `https://admin.dynamiccorrugations.com${rawImage}`;

    // --- SAFE DIMENSIONS ---
    let dimensions = null;

    if (productData.length && productData.width && productData.height) {
        dimensions = {
            length: productData.length,
            width: productData.width,
            height: productData.height,
            unit: "cm"
        };
    }

    // --- API PAYLOAD ---
    const payload = {


        pricePerPiece: productData.prodPrice,
        quantity: productData.quantity, // This should be the base price, server will calculate final price based on material multiplier
        // --- API PAYLOAD ---

        title: productData.title,
        // FIX: Ensure this is a number and not 0
        pricePerPiece: Number(currentPrice) > 0 ? Number(currentPrice) : Number(productData.basePricePerPiece),
        quantity: parseInt(qty),
        productId: productData.id,
        productSlug: productData.slug || "",
        image: selectedImage, // Ensure image is passed
        variant: {
            material: currentMaterial ? currentMaterial.name : "Standard"
        },
        deliveryLocation: selectedLocationName



    };

    try {
        // DELETE OLD PRODUCT IF EXISTS
        await removeExistingProduct(productData.id);
        const response = await fetch("https://admin.dynamiccorrugations.com/api/cart/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to add item to cart");
        }

        renderCartUI()
        finalizeAction(openDrawer, "Item added to cart successfully!");

    } catch (error) {

        console.error("Cart Error:", error);
        alert("❌ Something went wrong while adding item to cart.");

    }
}

// ============================================
// 6. UI HELPERS & STORAGE
// ============================================
function finalizeAction(shouldOpenDrawer, msg) {
    if (shouldOpenDrawer) viewCart();
    else showToast(msg);
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
        <div class="cart-item" style="display:flex; align-items:center; border-bottom:1px solid #eee; padding:10px 0;">
            <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
            <div style="flex:1; padding-left:10px;">
                <div style="font-weight:bold; font-size:14px">${item.name}</div>                    
                
                <div style="display:flex; align-items:center; margin-top:5px; gap:10px;">
                    <div class="qty-box" style="display:flex; align-items:center; border:1px solid #ddd; border-radius:4px;">
                        <button onclick="updateCartQty(${index}, -5)" style="background:#f9f9f9; border:none; padding:2px 8px; cursor:pointer;">-</button>
                        <input type="text" value="${item.qty}" readonly style="width:30px; text-align:center; border:none; font-size:12px; font-weight:bold;">
                        <button onclick="updateCartQty(${index}, 5)" style="background:#f9f9f9; border:none; padding:2px 8px; cursor:pointer;">+</button>
                    </div>
                    
                    <span style="color:#d35400; font-weight:bold; font-size:13px;">
                        ₹${item.totalPrice.toLocaleString()}
                    </span>
                </div>
            </div>
            <button onclick="removeItem(${index})" style="color:#e74c3c; background:none; border:none; cursor:pointer; font-size:18px; padding-left:10px;">
                &times;
            </button>
        </div>`;
  });

  if (totalEl) totalEl.innerText = "₹" + total.toLocaleString();
}

function proceedToCheckout() {
    // Optional: Check if cart is empty before redirecting
    const totalText = document.getElementById("cartGrandTotal").innerText;
    if (totalText === "₹0" || totalText === "₹0.00") {
        alert("Your cart is empty!");
        return;
    }

    // Redirect to the checkout page
    window.location.href = "checkout.html";
}
// Initial Call
renderCartUI();


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
