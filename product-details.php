document.addEventListener("DOMContentLoaded", function () {
    const productContainer = document.getElementById("productContainer");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function updateCartUI() {
        cart.forEach((item) => {
            const viewCartBtn = document.querySelector(`.view-cart[data-id="${item.id}"]`);
            if (viewCartBtn) {
                viewCartBtn.style.display = "inline-block";
            }
        });
    }

    // Fetch products from API
    fetch("https://api.dynamiccorrugations.com/items")
        .then((response) => response.json())
        .then((data) => {
            if (!data || !data.data || data.data.length === 0) {
                productContainer.innerHTML = "<p>No products found.</p>";
                return;
            }

            data.data.forEach((product) => {
                let imageUrl = product.images
                    ? `https://api.dynamiccorrugations.com/${product.images}`
                    : "placeholder.jpg";

                const productItem = document.createElement("div");
                productItem.classList.add("product-item");
                productItem.innerHTML = `
                    <img src="${imageUrl}" alt="${product.name}">
                    <h4 class="heading">${product.name}</h4>
                    <p>${product.description}</p>
                    <div class="buttons">
                        <span class="price">₹${product.price}</span>
                        <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${imageUrl}">Add to Cart</button>
                        <button class="custom-button" data-id="${product.id}">Custom</button>
                    </div>
                `;
                productContainer.appendChild(productItem);
            });

            // Attach event listeners
            document.querySelectorAll(".add-to-cart").forEach((button) => {
                button.addEventListener("click", function () {
                    const id = this.dataset.id;
                    const name = this.dataset.name;
                    const price = parseFloat(this.dataset.price);
                    const image = this.dataset.image;
                    addToCart(id, name, price, image);
                    this.nextElementSibling.style.display = "inline-block";
                });
            });

            document.querySelectorAll(".custom-button").forEach((button) => {
                button.addEventListener("click", function () {
                    showPopupForm(this.dataset.id);
                });
            });

            updateCartUI();
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
            productContainer.innerHTML = "<p>Failed to load products.</p>";
        });

    function addToCart(id, name, price, image) {
        const existingProduct = cart.find((item) => item.id === id);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1, image });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    function showPopupForm(productId) {
        const popup = document.createElement("div");
        popup.classList.add("popup");
        popup.innerHTML = `
            <div class="popup-content">
                <h2>Customize Product</h2>
                <label for="customText">Enter Custom Text:</label>
                <input type="text" id="customText" placeholder="Type here...">
                <button id="submitCustom">Submit</button>
                <button id="closePopup">Close</button>
            </div>
        `;
        document.body.appendChild(popup);
        
        document.getElementById("closePopup").addEventListener("click", function () {
            document.body.removeChild(popup);
        });
    }
});
