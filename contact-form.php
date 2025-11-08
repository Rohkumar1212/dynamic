<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Define recipient email
    $to = 'mail@dynamiccorrugations.com';
    $cc = 'mail@dynamiccorrugations.com';

    // Sanitize inputs
    $name = htmlspecialchars(trim($_POST['fullName'] ?? ''));
    $email = filter_var(trim($_POST['emailAddress'] ?? ''), FILTER_SANITIZE_EMAIL);
    $phone = htmlspecialchars(trim($_POST['phoneNumber'] ?? ''));
    $company = htmlspecialchars(trim($_POST['company'] ?? ''));
    $service = htmlspecialchars(trim($_POST['service'] ?? ''));
    $message_content = htmlspecialchars(trim($_POST['message'] ?? ''));

    // Validate required fields
    if (empty($name) || empty($email) || empty($message_content)) {
        echo '<script>alert("Please fill in all required fields."); window.location.href="contact.html";</script>';
        exit;
    }

    // Handle file upload
    $file_name = 'No file uploaded';
    $file_path = '';
    if (!empty($_FILES['fileUpload']['name']) && $_FILES['fileUpload']['error'] === UPLOAD_ERR_OK) {
        $allowed_types = ['image/jpeg', 'image/png', 'application/pdf'];
        $file_tmp = $_FILES['fileUpload']['tmp_name'];
        $file_name = basename($_FILES['fileUpload']['name']);
        $file_size = $_FILES['fileUpload']['size'];
        $file_type = mime_content_type($file_tmp);

        if (!in_array($file_type, $allowed_types)) {
            echo '<script>alert("Invalid file type. Only JPEG, PNG, and PDF are allowed."); window.location.href="contact.html";</script>';
            exit;
        }

        if ($file_size > 2 * 1024 * 1024) { // 2MB limit
            echo '<script>alert("File size exceeds 2MB limit."); window.location.href="contact.html";</script>';
            exit;
        }

        $upload_dir = 'uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }

        $file_path = $upload_dir . time() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $file_name);
        if (!move_uploaded_file($file_tmp, $file_path)) {
            echo '<script>alert("Failed to upload file."); window.location.href="contact.html";</script>';
            exit;
        }
    }

    // Email message
    $message = "
        <html>
        <head>
            <title>New Inquiry</title>
        </head>
        <body>
            <h3>New Contact Form Submission</h3>
            <p><strong>Full Name:</strong> {$name}</p>
            <p><strong>Email Address:</strong> {$email}</p>
            <p><strong>Phone Number:</strong> {$phone}</p>
            <p><strong>Company Name:</strong> {$company}</p>
            <p><strong>Service Needed:</strong> {$service}</p>
            <p><strong>Message:</strong><br>{$message_content}</p>
            <p><strong>File Uploaded:</strong> " . ($file_path ? basename($file_path) : "None") . "</p>
        </body>
        </html>
    ";

    // Email headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: {$name} <{$email}>\r\n";
    $headers .= "Cc: {$cc}\r\n";

    // Send email
    if (mail($to, "New Inquiry: {$subject}", $message, $headers)) {
        echo '<script>alert("Message sent successfully!"); window.location.href="contact.html";</script>';
    } else {
        echo '<script>alert("Failed to send the message. Please try again later."); window.location.href="contact.html";</script>';
    }
} else {
    echo '<script>alert("Invalid request method."); window.location.href="contact.html";</script>';
}
?>
