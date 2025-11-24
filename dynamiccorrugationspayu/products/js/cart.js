
                    let cart = [];

                    // UPDATE SIZE
                    function updateSizePreview() {
                        const sizeSelect = document.getElementById("sizeSelect");
                        const customField = document.getElementById("customSize");

                        const selected = sizeSelect.options[sizeSelect.selectedIndex];
                        const inches = selected.dataset.inches;
                        const px = selected.dataset.px;

                        if (sizeSelect.value === "custom") {
                            customField.style.display = "block";
                            document.getElementById("selectedSize").innerText = "Custom";
                            document.getElementById("selectedPx").innerText = "--";
                        } else {
                            customField.style.display = "none";
                            document.getElementById("selectedSize").innerText = inches;
                            document.getElementById("selectedPx").innerText = px;
                        }
                    }

                    // QUALITY SELECT
                    function selectQuality(el) {
                        document.querySelectorAll(".quality-item").forEach(q => q.classList.remove("active"));
                        el.classList.add("active");
                    }

                    // QTY
                    function increaseQty() {
                        let qty = document.getElementById("qty");
                        qty.value = parseInt(qty.value) + 1;
                    }
                    function decreaseQty() {
                        let qty = document.getElementById("qty");
                        if (qty.value > 1) qty.value = parseInt(qty.value) - 1;
                    }

                    // ADD TO CART
                    function handleAddToCart() {
                        const title = document.getElementById("productTitle").innerText;
                        const price = parseInt(document.getElementById("productPrice").innerText.replace(/[^0-9]/g, ""));
                        const qty = parseInt(document.getElementById("qty").value);

                        const sizeSelect = document.getElementById("sizeSelect");
                        const size = sizeSelect.value === "custom"
                            ? document.getElementById("customSize").value.trim()
                            : sizeSelect.options[sizeSelect.selectedIndex].dataset.inches;

                        const quality = document.querySelector(".quality-item.active").innerText;

                        const item = {
                            id: Date.now(),
                            title,
                            qty,
                            image: document.getElementById("mainImage").src,
                            size,
                            quality,
                            unitPrice: price,
                            totalPrice: price * qty
                        };

                        cart.push(item);
                        updateCartUI();
                        alert("Added to cart!");
                    }

                    // ADD & VIEW CART
                    function addToCartView() {
                        handleAddToCart();
                        toggleCart();
                    }

                    // OPEN/CLOSE CART
                    function toggleCart() {
                        document.getElementById("cartModal").classList.toggle("open");
                        updateCartUI();
                    }

                    // REMOVE ITEM
                    function removeCartItem(id) {
                        cart = cart.filter(item => item.id !== id);
                        updateCartUI();
                    }

                    // UPDATE CART UI
                    function updateCartUI() {
                        const list = document.getElementById("cartList");
                        const totalEl = document.getElementById("cartTotal");

                        list.innerHTML = "";
                        let total = 0;

                        if (cart.length === 0) {
                            list.innerHTML = "<p>Your cart is empty.</p>";
                            totalEl.innerText = "₹0";
                            return;
                        }

                        cart.forEach(item => {
                            total += item.totalPrice;

                            list.innerHTML += `
                                    <div class="cart-item">
                                        <strong>${item.title}</strong><br>
                                        Size: ${item.size}<br>
                                        Quality: ${item.quality}<br>
                                        Qty: ${item.qty}<br>
                                        Price: ₹${item.totalPrice}
                                        <br>
                                        <button class="remove-btn" onclick="removeCartItem(${item.id})">Remove</button>
                                    </div>
                                `;
                        });

                        totalEl.innerText = "₹" + total;
                    }

                    // PROCEED TO PAYMENT
                    function proceedToPayment() {
                        if (cart.length === 0) {
                            alert("Your cart is empty!");
                            return;
                        }

                        const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);

                        // Save to next page (checkout)
                        localStorage.setItem("checkoutCart", JSON.stringify(cart));
                        localStorage.setItem("totalAmount", totalPrice);

                        window.location.href = "checkout.html";
                    }
          

                      // DOM references
                const sizeSelect = document.getElementById('sizeSelect');
                const selectedSizeEl = document.getElementById('selectedSize');
                const selectedPxEl = document.getElementById('selectedPx');
                const customSizeInput = document.getElementById('customSize');
                const qtyInput = document.getElementById('qty');
                const cartModal = document.getElementById('cartModal');
                const cartList = document.getElementById('cartList');
                const cartTotalEl = document.getElementById('cartTotal');
                const proceedBtn = document.getElementById('proceedBtn');
                const addToCartBtn = document.getElementById('addToCartBtn');

                const BASE_PRICE = 320;

                // initialize preview
                updateSizePreview();

                // helpers
                function changeImage(el) { document.getElementById('mainImage').src = el.src; }
                sizeSelect.addEventListener('change', updateSizePreview);

                function updateSizePreview() {
                    const opt = sizeSelect.options[sizeSelect.selectedIndex];
                    const inches = opt.getAttribute('data-inches') || opt.text;
                    const px = opt.getAttribute('data-px') || '—';
                    selectedSizeEl.innerText = inches;
                    selectedPxEl.innerText = px;
                    if (opt.value === 'custom') {
                        customSizeInput.style.display = 'block';
                        customSizeInput.focus();
                    } else {
                        customSizeInput.style.display = 'none';
                        customSizeInput.value = '';
                    }
                }

                function getSelectedSize() {
                    const opt = sizeSelect.options[sizeSelect.selectedIndex];
                    if (opt.value === 'custom' && customSizeInput.value.trim()) return customSizeInput.value.trim();
                    return opt.getAttribute('data-inches') || opt.text;
                }

                function selectQuality(el) {
                    document.querySelectorAll('.quality-item').forEach(i => i.classList.remove('active'));
                    el.classList.add('active');
                }
                function getSelectedQuality() {
                    return document.querySelector('.quality-item.active')?.innerText || 'Standard';
                }

                function increaseQty() { qtyInput.value = Math.max(1, parseInt(qtyInput.value || 1)) + 1 }
                function decreaseQty() { qtyInput.value = Math.max(1, parseInt(qtyInput.value || 1) - 1) }

                function computePrice(sizeText, qualityText, qty) {
                    let mult = 1;
                    if (qualityText.toLowerCase().includes('double')) mult = 1.6;
                    if (qualityText.toLowerCase().includes('corrugated')) mult = 1.4;
                    if (qualityText.toLowerCase().includes('kraft')) mult = 1.25;
                    return Math.round(BASE_PRICE * mult * qty);
                }

                // load cart from localStorage on start
                function loadCart() {
                    try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
                    catch (e) { return []; }
                }
                function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }

                function handleAddToCart() {
                    const qty = parseInt(qtyInput.value || 1);
                    const size = getSelectedSize();
                    const quality = getSelectedQuality();

                    // FIX: Correct image selection
                    let img = selectedProductImage;
                    if (!img) img = document.getElementById("mainImage").src;

                    const price = computePrice(size, quality, qty);

                    const id = btoa(size + '|' + quality);
                    const cart = loadCart();
                    const existing = cart.find(i => i.id === id);

                    if (existing) {
                        existing.qty += qty;
                        existing.price = computePrice(size, quality, existing.qty);
                    } else {
                        cart.push({
                            id,
                            title: `${size} • ${quality}`,
                            qty,
                            price,
                            img,   // ★ FIXED IMAGE ALWAYS CORRECT
                            meta: { size, quality }
                        });
                    }

                    saveCart(cart);
                    openCart();
                    animateAddToCart();
                    showToast(`${qty} × ${size} (${quality}) added to cart`);
                    updateCartUI();
                }
                function addToCartView() {
                    handleAddToCart();
                    openCart();
                }
                function updateCartUI() {
                    const cart = loadCart();
                    cartList.innerHTML = '';

                    if (!cart.length) {
                        cartList.innerHTML = '<div style="color:#667;padding:8px">Your cart is empty</div>';
                        cartTotalEl.innerText = '₹0';
                        return;
                    }

                    let total = 0;

                    cart.forEach(item => {

                        total += item.price;

                        const div = document.createElement('div');
                        div.className = 'cart-row';

                        div.innerHTML = `
                        <img src="${item.image}" alt="cart item" 
                            style="width:60px;height:60px;object-fit:cover;border-radius:6px">
            
                        <div class="cart-info">
                            <div style="font-weight:800">${escapeHtml(item.title)}</div>
                            <div style="font-size:13px;color:#556">Qty: ${item.qty}</div>
                        </div>
            
                        <div style="font-weight:800">₹${item.price}</div>
                    `;

                        const removeBtn = document.createElement('button');
                        removeBtn.innerText = 'Remove';
                        removeBtn.style.marginLeft = '8px';
                        removeBtn.style.background = 'transparent';
                        removeBtn.style.border = 'none';
                        removeBtn.style.color = '#d33';
                        removeBtn.style.cursor = 'pointer';
                        removeBtn.onclick = () => { removeCartItem(item.id); };

                        div.appendChild(removeBtn);
                        cartList.appendChild(div);
                    });

                    cartTotalEl.innerText = `₹${total}`;
                }
                function removeCartItem(id) {
                    const cart = loadCart();
                    const idx = cart.findIndex(i => i.id === id);
                    if (idx > -1) cart.splice(idx, 1);
                    saveCart(cart);
                    updateCartUI();
                    showToast('Item removed');
                }

                function clearCart() { localStorage.removeItem('cart'); updateCartUI(); showToast('Cart cleared') }

                function openCart() {
                    updateCartUI();
                    cartModal.classList.add('open');
                    // focus proceed
                    proceedBtn.focus();
                }
                function toggleCart() {
                    if (cartModal.classList.contains('open')) cartModal.classList.remove('open');
                    else openCart();
                }

                // proceed: store checkoutCart and go to checkout.html
                proceedBtn.addEventListener('click', function () {
                    const cart = loadCart();
                    if (!cart.length) { showToast('Cart is empty'); return; }
                    localStorage.setItem('checkoutCart', JSON.stringify(cart));
                    // Optionally you could send to server here to create an order ID
                    window.location.href = 'checkout.html';
                });

                // small visual toast
                function showToast(msg = 'Saved') {
                    const t = document.createElement('div');
                    t.className = 'toast';
                    t.innerText = msg;
                    document.body.appendChild(t);
                    setTimeout(() => { t.style.transition = 'opacity .25s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 250); }, 1500);
                }

                function animateAddToCart() {
                    addToCartBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 240 });
                }

                // close cart when clicking outside
                document.addEventListener('click', (e) => {
                    if (!cartModal.contains(e.target) && !e.target.closest('.view-cart') && cartModal.classList.contains('open')) {
                        cartModal.classList.remove('open');
                    }
                });

                // helper to escape html
                function escapeHtml(text) {
                    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
                    return String(text).replace(/[&<>"']/g, m => map[m]);
                }

                // allow keyboard to select qualities
                document.querySelectorAll('.quality-item').forEach(el => {
                    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectQuality(el); } });
                });

                // initialize cart UI on load
                document.addEventListener('DOMContentLoaded', updateCartUI);