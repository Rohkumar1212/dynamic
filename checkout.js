const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
const checkoutContainer = document.getElementById("checkout-products");

if (cartItems.length === 0) {
    checkoutContainer.innerHTML = "<p>Your cart is empty. <a href='products.html'>Go back to shopping</a></p>";
} else {
    checkoutContainer.innerHTML = cartItems.map(item => `
        <div class="product-card">
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title}</h3>
            <p>Price: ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}</p>
        </div>
    `).join("");
}

document.getElementById("pay-now").addEventListener("click", () => {
    window.location.href = "products.html";
});
