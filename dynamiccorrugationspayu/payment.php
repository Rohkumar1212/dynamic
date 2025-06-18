<?php
function generateHash($key, $txnid, $amount, $productinfo, $firstname, $email, $salt) {
    $input = $key . '|' . $txnid . '|' . $amount . '|' . $productinfo . '|' . $firstname . '|' . $email . '|||||||||||' . $salt;
    return hash('sha512', $input);
}

// Example usage
$key = 'Gx4UKv';
$txnid = 'TXN';
$amount = '1';
$productinfo = 'Test Product';
$firstname = 'rohit';
$email = 'test@example.com';
$salt = 'W8L6tzmg69t6xt9rH9SeBbAUXBXOzC4Q';

$hash = generateHash($key, $txnid, $amount, $productinfo, $firstname, $email, $salt);
echo 'Generated Hash: ' . $hash;
?>
