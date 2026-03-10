// ======================================
// AUTH TOKEN
// ======================================

function getAuthToken() {
  return localStorage.getItem("token") || localStorage.getItem("userguest");
}


// message of toast 

function showToast(msg) {
    const toast = document.getElementById("toast-notification");
    if (toast) {
        toast.innerText = msg;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }
}

// ======================================
// UPDATE HEADER CART COUNTER
// ======================================

async function updateCartCounter() {

  try {

    const token = getAuthToken();

    if (!token) return;

    const res = await fetch(
      "https://admin.dynamiccorrugations.com/api/cart",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    const items = data.data?.items || [];

    const badge = document.getElementById("headerCartCount");

    if (!badge) return;

    badge.innerText = items.length;

    badge.style.display = items.length > 0 ? "inline-block" : "none";

  }

  catch (err) {

    console.error("Cart Counter Error:", err);

  }

}


// ======================================
// OPEN CART
// ======================================

function viewCart() {

  renderCartUI();

  document.getElementById("cartModal").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");

}


// ======================================
// CLOSE CART
// ======================================

function closeCart() {

  document.getElementById("cartModal").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");

}


// ======================================
// RENDER CART SIDEBAR
// ======================================

async function renderCartUI() {

  try {

    const token = getAuthToken();

    const res = await fetch(
      "https://admin.dynamiccorrugations.com/api/cart",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    const items = data.data?.items || [];

    const container = document.getElementById("cartItemsContainer");
    const totalEl = document.getElementById("cartGrandTotal");

    if (!container) return;

    let total = 0;
    let html = "";

    if (items.length === 0) {

      html = `
      <div style="text-align:center;padding:40px;color:#888">
      Your cart is empty
      </div>
      `;

    }

    else {

      items.forEach(item => {

        const price = Number(item.pricePerPiece) || 0;
        const qty = Number(item.quantity) || 0;

        const itemTotal = price * qty;

        total += itemTotal;

        html += `

        <div class="cart-item" style="display:flex;align-items:center;margin-bottom:15px">

          <img src="https://admin.dynamiccorrugations.com${item.image}"
          style="width:60px;height:60px;object-fit:cover;border-radius:5px">

          <div style="flex:1;padding-left:10px">

            <div style="font-weight:bold;font-size:14px">
            ${item.title}
            </div>

            <div style="font-size:12px;color:#777">
            ${qty} × ₹${price}
            </div>

          </div>

          <div style="font-weight:bold;color:#27ae60">
          ₹${itemTotal}
          </div>

          <button onclick="deleteCartItem('${item.id}')"
          style="margin-left:10px;border:none;background:none;color:red;font-size:18px;cursor:pointer">
          &times;
          </button>

        </div>

        `;

      });

    }

    container.innerHTML = html;

    if (totalEl) {
      totalEl.innerText = "₹" + total;
    }

    // counter update
    updateCartCounter();

  }

  catch (err) {

    console.error("Cart Render Error:", err);

  }

}


// ======================================
// DELETE ITEM
// ======================================

async function deleteCartItem(itemId) {

  try {

    const token = getAuthToken();

    await fetch(
      `https://admin.dynamiccorrugations.com/api/cart/items/${itemId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );
    showToast("Product Deleted successfully")
    renderCartUI();

  }

  catch (err) {

    console.error("Delete Cart Error:", err);

  }

}


// ======================================
// CHECKOUT
// ======================================

function proceedToCheckout() {

  window.location.href = "/products/checkout.html";

}


// ======================================
// PAGE LOAD
// ======================================

document.addEventListener("DOMContentLoaded", () => {

  updateCartCounter();
  renderCartUI();

});  