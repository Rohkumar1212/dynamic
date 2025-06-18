<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize input data
    $name = htmlspecialchars(trim($_POST['widget-contact-form-name']));
    $email = filter_var(trim($_POST['widget-contact-form-email']), FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars(trim($_POST['widget-contact-form-message']));

    // Validate required fields
    if (empty($name) || empty($email) || empty($message)) {
        echo "<script>alert('All fields are required!'); window.history.back();</script>";
        exit();
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "<script>alert('Invalid email address!'); window.history.back();</script>";
        exit();
    }

    // Email details
    $to = "rohitkumar.cs999@gmail.com"; // Change to your email
    $subject = "New Contact Form Submission from $name";
    $email_content = "
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> $name</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Message:</strong></p>
        <p>$message</p>
    ";

    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8" . "\r\n";
    $headers .= "From: $email" . "\r\n";

    // Send email
    if (mail($to, $subject, $email_content, $headers)) {
        echo "<script>alert('Your message has been sent successfully!'); window.location.href='thank-you.html';</script>";
    } else {
        echo "<script>alert('Something went wrong. Please try again.'); window.history.back();</script>";
    }
} else {
    header("Location: index.html");
    exit();
}
?>
