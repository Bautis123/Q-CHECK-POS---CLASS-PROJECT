<?php

require_once __DIR__ . '/../backend/config/Database.php';
require_once __DIR__ . '/../backend/core/Request.php';
require_once __DIR__ . '/../backend/core/Response.php';
require_once __DIR__ . '/../backend/repositories/UserRepository.php';
require_once __DIR__ . '/../backend/repositories/ProductRepository.php';
require_once __DIR__ . '/../backend/repositories/TransactionRepository.php';
require_once __DIR__ . '/../backend/repositories/ReturnRepository.php';
require_once __DIR__ . '/../backend/services/AuthService.php';
require_once __DIR__ . '/../backend/services/ProductService.php';
require_once __DIR__ . '/../backend/services/SaleService.php';
require_once __DIR__ . '/../backend/services/ReturnService.php';
require_once __DIR__ . '/../backend/services/UserService.php';
require_once __DIR__ . '/../backend/controllers/AuthController.php';
require_once __DIR__ . '/../backend/controllers/ProductController.php';
require_once __DIR__ . '/../backend/controllers/SaleController.php';
require_once __DIR__ . '/../backend/controllers/ReturnController.php';
require_once __DIR__ . '/../backend/controllers/UserController.php';

try {
    $db = Database::connect();
    $users = new UserRepository($db);
    $products = new ProductRepository($db);
    $transactions = new TransactionRepository($db);
    $returns = new ReturnRepository($db);

    $controllers = [
        'auth' => new AuthController(new AuthService($users)),
        'products' => new ProductController(new ProductService($products)),
        'sales' => new SaleController(new SaleService($products, $transactions)),
        'returns' => new ReturnController(new ReturnService($transactions, $returns, $products)),
        'users' => new UserController(new UserService($users)),
    ];

    $resource = $_GET['resource'] ?? '';
    $action = $_GET['action'] ?? 'index';
    $input = Request::input();

    if (!isset($controllers[$resource]) || !method_exists($controllers[$resource], $action)) {
        Response::error('API route was not found.', 404);
    }

    $controllers[$resource]->{$action}($input);
} catch (InvalidArgumentException $exception) {
    Response::error($exception->getMessage(), 422);
} catch (Throwable $exception) {
    Response::error('Server error: ' . $exception->getMessage(), 500);
}
