<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize Inputs
    $fullName = htmlspecialchars(trim($_POST['fullName']));
    $emailAddress = filter_var(trim($_POST['emailAddress']), FILTER_SANITIZE_EMAIL);
    $phoneNumber = htmlspecialchars(trim($_POST['phoneNumber']));
    $company = htmlspecialchars(trim($_POST['company']));
    $service = htmlspecialchars(trim($_POST['service']));
    $message = nl2br(htmlspecialchars(trim($_POST['message'])));

    // File Upload Handling (Optional)
    $fileAttachment = "";
    if (!empty($_FILES['fileUpload']['name'])) {
        $fileName = basename($_FILES['fileUpload']['name']);
        $fileTmpPath = $_FILES['fileUpload']['tmp_name'];
        $fileSize = $_FILES['fileUpload']['size'];
        $fileType = $_FILES['fileUpload']['type'];

        $allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (in_array($fileType, $allowedTypes) && $fileSize <= 5 * 1024 * 1024) { // Max 5MB
            $uploadDir = "uploads/";
            $fileAttachment = $uploadDir . time() . "_" . $fileName;
            move_uploaded_file($fileTmpPath, $fileAttachment);
        }
    }

    // Email Details
    $to = "mail@dynamiccorrugations.com"; // Change to your email
    $subject = "New Inquiry from $fullName";
    $emailContent = "
        <h2>New Inquiry Received</h2>
        <p><strong>Name:</strong> $fullName</p>
        <p><strong>Email:</strong> $emailAddress</p>
        <p><strong>Phone:</strong> $phoneNumber</p>
        <p><strong>Company:</strong> $company</p>
        <p><strong>Service Requested:</strong> $service</p>
        <p><strong>Message:</strong> $message</p>
    ";

    if (!empty($fileAttachment)) {
        $emailContent .= "<p><strong>Attachment:</strong> $fileAttachment</p>";
    }

    // Headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8" . "\r\n";
    $headers .= "From: $emailAddress" . "\r\n";

    // Send Email
    if (mail($to, $subject, $emailContent, $headers)) {
        echo "<script>alert('Your inquiry has been sent successfully!'); window.location.href='index.html';</script>";
    } else {
        echo "<script>alert('Something went wrong. Please try again.'); window.location.href='index.html';</script>";
    }
} else {
    header("Location: index.html");
    exit();
}
?>
