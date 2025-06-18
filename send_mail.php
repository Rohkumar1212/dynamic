<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $brand = $_POST['brand'];
    $product_details = $_POST['product_details'];
    $packaging = $_POST['packaging'];
    $quantity = $_POST['quantity'];
    $deadline = $_POST['deadline'];
    $budget = $_POST['budget'];

    $custom_branding = isset($_POST['custom_branding']) ? "Yes" : "No";
    $eco_friendly = isset($_POST['eco_friendly']) ? "Yes" : "No";
    $help_choosing = isset($_POST['help_choosing']) ? "Yes" : "No";

    $to = "mail@dynamiccorrugations.com"; // Change this to your email
    $subject = "New Custom Quote Request 🚀";
    $message = "
        <h2>New Quote Request Received!</h2>
        <p><strong>Name:</strong> $name</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Phone:</strong> $phone</p>
        <p><strong>Brand:</strong> $brand</p>
        <p><strong>Product Details:</strong> $product_details</p>
        <p><strong>Packaging Style:</strong> $packaging</p>
        <p><strong>Quantity:</strong> $quantity</p>
        <p><strong>Deadline:</strong> $deadline</p>
        <p><strong>Budget:</strong> $budget</p>
        <p><strong>Custom Branding:</strong> $custom_branding</p>
        <p><strong>Eco-Friendly:</strong> $eco_friendly</p>
        <p><strong>Help Choosing:</strong> $help_choosing</p>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8" . "\r\n";
    $headers .= "From: $email" . "\r\n";

    if (mail($to, $subject, $message, $headers)) {
        echo "<script>alert('Your quote request has been sent successfully!'); window.location.href='index.html';</script>";
    } else {
        echo "<script>alert('Something went wrong. Please try again.'); window.location.href='index.html';</script>";
    }
} else {
    header("Location: index.html");
    exit();
}
?>
