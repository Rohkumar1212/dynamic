<?php
// ---------------------------
// 1. RECEIVE PAYU RESPONSE
// ---------------------------
$status     = $_POST["status"] ?? "";
$txnid      = $_POST["txnid"] ?? "";
$amount     = $_POST["amount"] ?? "";
$firstname  = $_POST["firstname"] ?? "";
$email      = $_POST["email"] ?? "";
$phone      = $_POST["phone"] ?? "";
$cartData   = isset($_POST["cartData"]) ? json_decode($_POST["cartData"], true) : [];

// If payment failed → redirect
if ($status !== "success") {
    header("Location: https://dynamiccorrugations.com/dynamiccorrugationspayu/payment-failure.html");
    exit();
}

// ---------------------------
// 2. LOG ORDER (Optional)
// ---------------------------
file_put_contents(
    "orders.log",
    json_encode([
        "time"      => date("Y-m-d H:i:s"),
        "txnid"     => $txnid,
        "amount"    => $amount,
        "customer"  => $firstname,
        "email"     => $email,
        "phone"     => $phone,
        "cart"      => $cartData
    ], JSON_PRETTY_PRINT) . "\n",
    FILE_APPEND
);

// ---------------------------
// 3. SEND ORDER EMAIL
// ---------------------------
$to = "rohitkumar.cs999@gmail.com";   // CHANGE THIS TO YOUR MAIL
$subject = "New Order Received | Transaction #$txnid";

$message  = "A new order has been placed.\n\n";
$message .= "-----------------------------\n";
$message .= "TRANSACTION DETAILS\n";
$message .= "-----------------------------\n";
$message .= "Status: SUCCESS\n";
$message .= "Transaction ID: $txnid\n";
$message .= "Amount Paid: ₹$amount\n\n";

$message .= "-----------------------------\n";
$message .= "CUSTOMER DETAILS\n";
$message .= "-----------------------------\n";
$message .= "Name: $firstname\n";
message .= "Email: $email\n";
$message .= "Phone: $phone\n\n";

$message .= "-----------------------------\n";
$message .= "ORDER ITEMS\n";
$message .= "-----------------------------\n";

if (!empty($cartData)) {
    foreach ($cartData as $item) {
        $title = $item["title"] ?? "";
        $qty   = $item["qty"] ?? 1;
        $price = $item["unitPrice"] ?? 0;
        $total = $item["totalPrice"] ?? 0;

        $message .= "- $title (Qty: $qty)\n";
        $message .= "  Price: ₹$price | Total: ₹$total\n\n";
    }
} else {
    $message .= "No cart data received.\n";
}

// SEND MAIL
$headers = "From: noreply@dynamiccorrugations.com\r\n";
mail($to, $subject, $message, $headers);

// ---------------------------
// 4. REDIRECT TO THANK YOU PAGE
// ---------------------------
header("Location: https://dynamiccorrugations.com/dynamiccorrugationspayu/products/order-confirmation.html");
exit();
?>
