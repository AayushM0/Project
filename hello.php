<?php
session_start();
require 'data.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    $foundUser = null;

    foreach ($_SESSION['users'] as $index => $user) {
        if ($user['username'] === $username && $user['password'] === $password) {
            $foundUser = $user;
            $userIndex = $index;
            break;
        }
    }

    if ($foundUser === null) {
        $error = 'Invalid username or password.';
    } else {

        $_SESSION['users'][$userIndex]['lastLogin'] = date('Y-m-d H:i:s');


        $_SESSION['currentUserIndex'] = $userIndex;
        $_SESSION['currentUser'] = $_SESSION['users'][$userIndex];

        header('Location: dashboard.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Library Login</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="main-container">
    <div class="card">
      <h1>Student Library Login</h1>
      <p class="subtitle">Use the demo credentials to enter</p>

      <?php if ($error): ?>
        <div class="error" style="display:block;"><?= htmlspecialchars($error) ?></div>
      <?php endif; ?>

      <form method="POST">
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" name="username" type="text" placeholder="e.g. student01" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" placeholder="e.g. pass123" required />
        </div>
        <button class="btn-primary" type="submit">Login</button>
      </form>

      <p style="margin-top:1.25rem; font-size:0.85rem; color:#555;">
        <strong>Demo Accounts:</strong><br />
        student01 / pass123<br />
        student02 / hello456
      </p>
    </div>
  </div>
</body>
</html>
