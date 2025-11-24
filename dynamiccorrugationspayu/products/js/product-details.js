

                    // ---------- Global Cart ----------
                    let cart = JSON.parse(localStorage.getItem("cart")) || [];

                    // ---------- Elements ----------
                    const pricePerPc = 320;
                    const sizeSelect = document.getElementById('sizeSelect');
                    const customSizeInput = document.getElementById('customSize');
                    const qtyInput = document.getElementById('qty');
                    const cartModal = document.getElementById('cartModal');
                    const cartList = document.getElementById('cartList');
                    const cartTotalEl = document.getElementById('cartTotal');


                    // ---------- IMAGE SWITCH ----------
                    function changeImage(el) {
                        document.getElementById("mainImage").src = el.src;
                    }


                    // ---------- SIZE SELECT ----------
                    sizeSelect.addEventListener('change', updateSizePreview);

                    function updateSizePreview() {
                        const opt = sizeSelect.options[sizeSelect.selectedIndex];
                        if (opt.value === "custom") {
                            customSizeInput.style.display = "block";
                        } else {
                            customSizeInput.style.display = "none";
                            customSizeInput.value = "";
                        }
                    }


                    // ---------- QUALITY ----------
                    function selectQuality(el) {
                        document.querySelectorAll('.quality-item')
                            .forEach(i => i.classList.remove('active'));
                        el.classList.add('active');
                    }

                    function getSelectedQuality() {
                        return document.querySelector(".quality-item.active")?.innerText || "Standard";
                    }


                    // ---------- SIZE ----------
                    function getSelectedSize() {
                        const opt = sizeSelect.options[sizeSelect.selectedIndex];

                        if (opt.value === "custom" && customSizeInput.value.trim()) {
                            return customSizeInput.value.trim();
                        }
                        return opt.getAttribute("data-inches") || opt.text;
                    }


                    // ---------- PRICE ----------
                    function computePrice(sizeText, qualityText, qty) {
                        let mult = 1;
                        if (qualityText.includes("Double")) mult = 1.6;
                        if (qualityText.includes("Corrugated")) mult = 1.4;
                        if (qualityText.includes("Kraft")) mult = 1.25;

                        return Math.round(pricePerPc * mult * qty);
                    }


                    // ====================================================================
                    // ✅ ADD TO CART — FIXED IMAGE HANDLING
                    // ====================================================================
                    function handleAddToCart() {
                        const qty = parseInt(qtyInput.value || 1);
                        const size = getSelectedSize();
                        const quality = getSelectedQuality();

                        // ---- FIX: GET IMAGE FROM MAIN OR FALLBACK ----
                        let imgSrc = "";
                        const mainImg = document.getElementById("mainImage");
                        const firstImg = document.querySelector(".product-img img");

                        if (mainImg?.src) imgSrc = mainImg.src;
                        else if (firstImg?.src) imgSrc = firstImg.src;
                        else imgSrc = "fallback.png";

                        // ---- CREATE CART ITEM ----
                        const item = {
                            id: Date.now(),
                            title: `${size} • ${quality}`,
                            qty,
                            price: computePrice(size, quality, qty),
                            img: imgSrc      // ★ PROPER PRODUCT IMAGE
                        };

                        // ---- SAVE TO CART ----
                        cart.push(item);
                        localStorage.setItem("cart", JSON.stringify(cart));

                        updateCartUI();
                        showToast(`${qty} × ${size} (${quality}) added to cart`);
                    }


                    // ---------- Add to Cart + Open Cart ----------
                    function addToCartView() {
                        handleAddToCart();
                        openCart();
                    }


                    // ====================================================================
                    //  CART UI — SHOW IMAGES PROPERLY
                    // ====================================================================
                    function updateCartUI() {

                        cart = JSON.parse(localStorage.getItem("cart")) || [];

                        cartList.innerHTML = "";
                        let total = 0;

                        if (cart.length === 0) {
                            cartList.innerHTML = `<div style="color:#777">Your cart is empty</div>`;
                            cartTotalEl.innerText = "₹0";
                            return;
                        }

                        cart.forEach(i => {
                            total += i.price;

                            const div = document.createElement("div");
                            div.className = "cart-row";

                            div.innerHTML = `
            <img src="${i.img}" class="cart-thumb" />
            <div class="cart-info">
                <div class="cart-title">${i.title}</div>
                <div class="cart-qty">Qty: ${i.qty}</div>
            </div>
            <div class="cart-price">₹${i.price}</div>
        `;

                            // REMOVE BUTTON
                            const btn = document.createElement("button");
                            btn.className = "remove-btn";
                            btn.innerText = "Remove";
                            btn.onclick = () => { removeCartItem(i.id); };

                            div.appendChild(btn);
                            cartList.appendChild(div);
                        });

                        cartTotalEl.innerText = `₹${total}`;
                    }

                    function removeCartItem(id) {
                        cart = cart.filter(i => i.id !== id);
                        localStorage.setItem("cart", JSON.stringify(cart));
                        updateCartUI();
                    }

                    function openCart() {
                        cartModal.classList.add("open");
                        updateCartUI();
                    }


                    // Proceed to Payment (go to checkout page)
                    function proceedToPayment() {
                        if (cart.length === 0) {
                            showToast("Cart is empty");
                            return;
                        }

                        localStorage.setItem("checkoutCart", JSON.stringify(cart));
                        window.location.href = "checkout.html";
                    }


                    // ---------- Toast ----------
                    function showToast(msg) {
                        const t = document.createElement("div");
                        t.className = "toast";
                        t.innerText = msg;
                        document.body.appendChild(t);
                        setTimeout(() => { t.remove(); }, 1800);
                    }
