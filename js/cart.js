
                /* -------------------------------------
                   GLOBAL CART + MOQ SYSTEM
                --------------------------------------- */
                let cart = [];
                const BOX_RATE = 320;
    /* Update MOQ + Show Inline Popup */
    function updateMOQ() {
        const city = document.getElementById("citySelect").value;
        const moqValue = document.getElementById("moqValue");

        const ncrCities = cityData.delhi.map(c => c.toLowerCase());
        let moq = ncrCities.includes(city) ? 10 : 15;

        moqValue.textContent = moq;

        // Quantity (default 1)
        let qty = 1;
        let price = moq * qty * BOX_RATE;

        // Update Popup Content
        document.getElementById("moqText").innerHTML = `MOQ Required: <b>${moq}</b> pcs`;
        document.getElementById("priceText").innerHTML = `Price (MOQ × ${qty} × ${BOX_RATE}): <b>₹${price}</b>`;

        // Show Popup
        const popup = document.getElementById("moqPopup");
        popup.style.display = "block";

        // Auto-close after 3 seconds
        setTimeout(() => popup.style.display = "none", 3000);
    }

    /* Close Popup */
    function closeMoqPopup() {
        document.getElementById("moqPopup").style.display = "none";
    }

                /* -------------------------------------
                   SET BUTTONS
                --------------------------------------- */
                function increaseSets() {
                    let qty = document.getElementById("qty");
                    qty.value = parseInt(qty.value || 1) + 1;
                }

                function decreaseSets() {
                    let qty = document.getElementById("qty");
                    const val = parseInt(qty.value || 1);
                    qty.value = val > 1 ? val - 1 : 1;
                }


                /* -------------------------------------
                   ADD TO CART (SET × MOQ × 320)
                --------------------------------------- */
                function handleAddToCart() {
                    const sets = parseInt(document.getElementById("qty").value || 1);
                    const moq = parseInt(document.getElementById("moqValue").innerText || 50);

                    const totalPcs = sets * moq;
                    const totalPrice = totalPcs * BOX_RATE;

                    const item = {
                        id: Date.now(),
                        title: document.getElementById("productTitle").innerText,
                        sets,
                        moq,
                        totalPcs,
                        price: totalPrice
                    };

                    cart.push(item);
                    updateCartUI();
                }

                /* ADD & OPEN */
                function addToCartView() {
                    handleAddToCart();
                    toggleCart();
                }


                /* -------------------------------------
                   UPDATE CART SIDEBAR
                --------------------------------------- */
                function updateCartUI() {
                    const list = document.getElementById("cartList");
                    const totalEl = document.getElementById("cartTotal");

                    list.innerHTML = "";
                    let total = 0;

                    if (!cart.length) {
                        list.innerHTML = "<p>Your cart is empty.</p>";
                        totalEl.innerText = "₹0";
                        return;
                    }

                    cart.forEach(item => {
                        total += item.price;

                        list.innerHTML += `
                                        <div class="cart-item">
                                            <strong>${item.title}</strong><br>
                                            Sets: ${item.sets}<br>
                                            MOQ: ${item.moq} pcs<br>
                                            Total Piece: ${item.totalPcs}<br>
                                            Price: ₹${item.price}<br><br>
                                            <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
                                        </div>
                                    `;
                    });

                    totalEl.innerText = "₹" + total;
                }

                function removeItem(id) {
                    cart = cart.filter(i => i.id !== id);
                    updateCartUI();
                }


                /* OPEN/CLOSE CART */
                function toggleCart() {
                    document.getElementById("cartModal").classList.toggle("open");
                }


                /* -------------------------------------
                   PAYMENT → GO TO CHECKOUT PAGE
                --------------------------------------- */
                function proceedToPayment() {
                    if (!cart.length) {
                        alert("Your cart is empty");
                        return;
                    }

                    const totalPrice = cart.reduce((sum, i) => sum + i.price, 0);

                    // Save data for checkout page
                    localStorage.setItem("checkoutCart", JSON.stringify(cart));
                    localStorage.setItem("totalAmount", totalPrice);

                    // Redirect to your live checkout page
                    window.location.href = "checkout.html";
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
                img: document.getElementById('mainImage').src
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
          <img src="${i.img}" alt="cart item" />
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

  