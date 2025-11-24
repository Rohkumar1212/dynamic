<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Define variables and sanitize inputs
    $name = htmlspecialchars(trim($_POST['fullName']));
    $email = filter_var(trim($_POST['emailAddress']), FILTER_SANITIZE_EMAIL);
    $phone = htmlspecialchars(trim($_POST['phoneNumber']));
    $subject = htmlspecialchars(trim($_POST['subject']));
    $message_content = htmlspecialchars(trim($_POST['message']));
    $contactMethod = htmlspecialchars(trim($_POST['contactMethod']));

    // Validate required fields
    if (empty($name) || empty($email) || empty($message_content)) {
        echo '<script>
                alert("Please fill in all required fields.");
                window.location.href="contact.html";
              </script>';
        exit;
    }

    // Handle file upload if provided
    $file_name = 'No file uploaded';
    $file_path = '';
    if (isset($_FILES['fileUpload']) && $_FILES['fileUpload']['error'] === UPLOAD_ERR_OK) {
        $allowed_types = ['image/jpeg', 'image/png', 'application/pdf'];
        $file_tmp = $_FILES['fileUpload']['tmp_name'];
        $file_name = basename($_FILES['fileUpload']['name']);
        $file_size = $_FILES['fileUpload']['size'];
        $file_type = mime_content_type($file_tmp);

        if (!in_array($file_type, $allowed_types)) {
            echo '<script>
                    alert("Invalid file type. Only JPEG, PNG, and PDF files are allowed.");
                    window.location.href="contact.html";
                  </script>';
            exit;
        }

        if ($file_size > 2 * 1024 * 1024) { // 2MB limit
            echo '<script>
                    alert("File size exceeds 2MB limit.");
                    window.location.href="contact.html";
                  </script>';
            exit;
        }

        $upload_dir = 'uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }

        $file_path = $upload_dir . $file_name;
        if (!move_uploaded_file($file_tmp, $file_path)) {
            echo '<script>
                    alert("Failed to upload file.");
                    window.location.href="contact.html";
                  </script>';
            exit;
        }
    }

    // Compose the email message
    $message = "<div style='font-family: Arial, sans-serif;'>
                    <h3>New Contact Form Submission</h3>
                    <p><strong>Full Name:</strong> " . nl2br($name) . "</p>
                    <p><strong>Email Address:</strong> " . nl2br($email) . "</p>
                    <p><strong>Phone Number:</strong> " . nl2br($phone) . "</p>
                    <p><strong>Subject:</strong> " . nl2br($subject) . "</p>
                    <p><strong>Message:</strong><br> " . nl2br($message_content) . "</p>
                    <p><strong>Preferred Contact Method:</strong> " . nl2br($contactMethod) . "</p>
                    <p><strong>File Uploaded:</strong> " . ($file_path ? $file_name : "None") . "</p>
                </div>";

    // Email headers
    $to = 'mail@dynamiccorrugations.com'; // Replace with your email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: " . $name . " <" . $email . ">" . "\r\n";
    $headers .= "Cc: mail@dynamiccorrugations.com" . "\r\n";

    // Send email
    if (mail($to, $subject, $message, $headers)) {
        echo '<script>
                alert("Message sent successfully!");
                window.location.href="contact.html";
              </script>';
    } else {
        echo '<script>
                alert("Failed to send the message. Please try again later.");
                window.location.href="contact.html";
              </script>';
    }
} else {
    echo '<script>
            alert("Invalid request method.");
            window.location.href="contact.html";
          </script>';
}
?>
