<?php
// Get PayU Return Data
$status = $_POST["status"];
$txnid = $_POST["txnid"];
$amount = $_POST["amount"];
$firstname = $_POST["firstname"];
$email = $_POST["email"];
$phone = $_POST["phone"];
$cartData = json_decode($_POST["cartData"], true);

// If payment failed
if ($status !== "success") {
    header("Location: https://dynamiccorrugations.com/payment-failed.html");
    exit();
}

// ---- SAVE ORDER IN DATABASE ----
// Example (Your real DB code goes here)
file_put_contents("orders.log", json_encode([
    "txnid" => $txnid,
    "amount" => $amount,
    "customer" => $firstname,
    "email" => $email,
    "phone" => $phone,
    "cart" => $cartData
], JSON_PRETTY_PRINT)."\n", FILE_APPEND);

// ---- SEND EMAIL ----
$to = "you@dynamiccorrugations.com";
$subject = "New Order #$txnid";
$message = "New order received\n\nTransaction: $txnid\nAmount: $amount\nCustomer: $firstname\nEmail: $email\n\nItems:\n";

foreach ($cartData as $item) {
    $message .= "- {$item['name']} x {$item['quantity']} (₹{$item['price']})\n";
}

mail($to, $subject, $message);

// ---- REDIRECT TO THANK YOU PAGE ----
header("Location: https://dynamiccorrugations.com/order-confirmation.html");
exit();
?>
