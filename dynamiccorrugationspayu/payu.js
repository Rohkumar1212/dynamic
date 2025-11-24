async function generatePayUHash(key, txnid, amount, productinfo, firstname, email, salt) {
    const udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "";

    // ✅ Construct Hash String
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    console.log("Hash String:", hashString);  // Debugging log

    // ✅ Generate SHA-512 Hash
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("paymentForm").addEventListener("submit", async function(event) {
        event.preventDefault(); // Prevent form submission
        
        // ✅ Fetch User Input
        const key = "EjKBQq";  // PayU Merchant Key
        const salt = "8n1jKSQBsYKsLo5gV4KqMlEO9xwzndae";  // PayU Salt
        const txnid = "TXN" + Date.now();
        const amount = document.getElementById("userAmount").value.trim();
        const productinfo = "Test Product";
        const firstname = document.getElementById("userName").value;
        const email = document.getElementById("userEmail").value;
        const phone = document.getElementById("userPhone").value;

        if (!amount || !firstname || !email || !phone) {
            alert("Please enter all required fields.");
            return;
        }

        // ✅ Generate Correct Hash
        const hash = await generatePayUHash(key, txnid, amount, productinfo, firstname, email, salt);
        console.log("Generated Hash:", hash);

        // ✅ Set Form Values
        document.getElementById("key").value = key;
        document.getElementById("txnid").value = txnid;
        document.getElementById("amount").value = amount;
        document.getElementById("hash").value = hash;
        document.getElementById("firstname").value = firstname;
        document.getElementById("email").value = email;
        document.getElementById("phone").value = phone;

        // ✅ Submit Form
        this.submit();
    });
});


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