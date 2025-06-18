document.addEventListener("DOMContentLoaded", function () {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productContainer = document.getElementById("productContainer");
    const viewCartBtn = document.getElementById("viewCartBtn");

    fetch("https://api.dynamiccorrugations.com/item?id=cm71xrd7z0000jf404ptkahds")
        .then(response => response.json())
        .then(data => {
            if (data && data.data) {
                data.data.forEach(product => {
                    const productDiv = document.createElement("div");
                    productDiv.classList.add("product");

                    productDiv.innerHTML = `
                        <img src="${product.images?.[0] || 'placeholder.jpg'}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p class="price">₹${product.price}</p>
                        <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
                    `;

                    productContainer.appendChild(productDiv);
                });

                attachCartEvents();
            } else {
                productContainer.innerHTML = "<p>No products found.</p>";
            }
        });

    function attachCartEvents() {
        document.querySelectorAll(".add-to-cart").forEach(button => {
            button.addEventListener("click", function () {
                const id = this.getAttribute("data-id");
                const name = this.getAttribute("data-name");
                const price = parseFloat(this.getAttribute("data-price"));

                addToCart(id, name, price);
            });
        });
    }

    function addToCart(id, name, price) {
        const existingProduct = cart.find(item => item.id === id);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        viewCartBtn.classList.remove("hidden");
    }

    viewCartBtn.addEventListener("click", function () {
        window.location.href = "cart.html"; // Redirect to cart page
    });

    if (cart.length > 0) {
        viewCartBtn.classList.remove("hidden");
    }
});
