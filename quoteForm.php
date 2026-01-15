<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Define and sanitize input fields
    $fields = [
        'fullName' => FILTER_SANITIZE_STRING,
        'emailAddress' => FILTER_SANITIZE_EMAIL,
        'phoneNumber' => FILTER_SANITIZE_STRING,
        'businessName' => FILTER_SANITIZE_STRING,
        'productDetails' => FILTER_SANITIZE_STRING,
        'packagingType' => FILTER_SANITIZE_STRING,
        'quantityNeeded' => FILTER_SANITIZE_NUMBER_INT,
        'timeline' => FILTER_SANITIZE_STRING,
        'budget' => FILTER_SANITIZE_NUMBER_INT,
        'funAddons' => FILTER_SANITIZE_STRING
    ];
    
    $input = filter_input_array(INPUT_POST, $fields);

    // Validate required fields
    $required = ['fullName', 'emailAddress', 'productDetails', 'packagingType', 'quantityNeeded', 'timeline'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            echo '<script>alert("Please fill in all required fields."); window.location.href="contact.html";</script>';
            exit;
        }
    }

    // File upload handling
    $file_name = 'No file uploaded';
    $file_path = '';
    if (!empty($_FILES['fileUpload']['name'])) {
        $allowed_types = ['image/jpeg', 'image/png', 'application/pdf'];
        $upload_dir = 'uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }

        $file_tmp = $_FILES['fileUpload']['tmp_name'];
        $file_name = basename($_FILES['fileUpload']['name']);
        $file_size = $_FILES['fileUpload']['size'];
        $file_type = mime_content_type($file_tmp);
        $file_ext = pathinfo($file_name, PATHINFO_EXTENSION);

        if (!in_array($file_type, $allowed_types)) {
            echo '<script>alert("Invalid file type. Only JPEG, PNG, and PDF files are allowed."); window.location.href="contact.html";</script>';
            exit;
        }

        if ($file_size > 2 * 1024 * 1024) { // 2MB limit
            echo '<script>alert("File size exceeds 2MB limit."); window.location.href="contact.html";</script>';
            exit;
        }

        // Generate unique filename to prevent overwriting
        $file_name = uniqid('upload_', true) . '.' . $file_ext;
        $file_path = $upload_dir . $file_name;
        if (!move_uploaded_file($file_tmp, $file_path)) {
            echo '<script>alert("Failed to upload file."); window.location.href="contact.html";</script>';
            exit;
        }
    }

    // Email content
    $message = "
        <div style='font-family: Arial, sans-serif;'>
            <h3>New Contact Form Submission</h3>
            <p><strong>Full Name:</strong> {$input['fullName']}</p>
            <p><strong>Email Address:</strong> {$input['emailAddress']}</p>
            <p><strong>Phone Number:</strong> {$input['phoneNumber']}</p>
            <p><strong>Business Name:</strong> {$input['businessName']}</p>
            <p><strong>Product Details:</strong> {$input['productDetails']}</p>
            <p><strong>Packaging Type:</strong> {$input['packagingType']}</p>
            <p><strong>Quantity Needed:</strong> {$input['quantityNeeded']}</p>
            <p><strong>Timeline:</strong> {$input['timeline']}</p>
            <p><strong>Budget:</strong> " . (!empty($input['budget']) ? $input['budget'] : 'Not specified') . "</p>
            <p><strong>Fun Add-Ons:</strong> {$input['funAddons']}</p>
            <p><strong>File Uploaded:</strong> " . ($file_path ? $file_name : "None") . "</p>
        </div>";

    // Email headers
    $to = 'dynamiccorrugations@gmail.com';
    $subject = "New Inquiry from " . $input['fullName'];
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: " . $input['fullName'] . " <" . $input['emailAddress'] . ">\r\n";
    $headers .= "Cc: dynamiccorrugations@gmail.com\r\n";

    // Send email
    if (mail($to, $subject, $message, $headers)) {
        echo '<script>alert("Message sent successfully!"); window.location.href="contact.html";</script>';
    } else {
        echo '<script>alert("Failed to send the message. Please try again later."); window.location.href="contact.html";</script>';
    }
} else {
    echo '<script>alert("Invalid request method."); window.location.href="contact.html";</script>';
}
?>
