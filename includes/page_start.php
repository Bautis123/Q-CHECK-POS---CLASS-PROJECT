<?php
$pageTitle = $pageTitle ?? 'Dashboard';
$pageView = $pageView ?? 'dashboard';
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo htmlspecialchars($pageTitle); ?> - Gadget POS</title>
    <link rel="stylesheet" href="../styles.css">
    <script>
      window.APP_API_BASE = "../api/index.php";
    </script>
  </head>
  <body data-view="<?php echo htmlspecialchars($pageView); ?>">
    <div id="app-shell" class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">GP</span>
          <div>
            <strong>Gadget POS</strong>
            <span>Retail console</span>
          </div>
        </div>
        <nav id="main-nav" class="nav-list" aria-label="Main navigation"></nav>
        <button id="logout-btn" class="btn ghost full-width" type="button">Logout</button>
      </aside>

      <section class="workspace">
        <header class="topbar">
          <div>
            <p id="section-kicker" class="eyebrow"><?php echo htmlspecialchars($pageTitle); ?></p>
            <h2 id="section-title"><?php echo htmlspecialchars($pageTitle); ?></h2>
          </div>
          <div class="topbar-actions">
            <span id="date-label" class="date-label"></span>
            <span class="user-pill">User</span>
          </div>
        </header>

        <div id="view-root" class="view-root"></div>
