<?php

final class ProductService
{
    public function __construct(private ProductRepository $products)
    {
    }

    public function all(): array
    {
        return array_map([$this, 'mapProduct'], $this->products->all());
    }

    public function create(array $data): array
    {
        $required = ['name', 'category', 'price', 'stock', 'reorder_level'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                throw new InvalidArgumentException("Missing product field: {$field}");
            }
        }

        if ((float) $data['price'] <= 0) {
            throw new InvalidArgumentException('Price must be greater than zero.');
        }
        if ((int) $data['stock'] < 0 || (int) $data['reorder_level'] < 0) {
            throw new InvalidArgumentException('Stock and reorder level cannot be negative.');
        }

        $data['image_path'] = $this->storeImage($_FILES['image'] ?? null);
        return $this->mapProduct($this->products->create($data));
    }

    public function receiveStock(int $productId, int $quantity): void
    {
        if ($quantity < 1) {
            throw new InvalidArgumentException('Quantity must be greater than zero.');
        }
        $this->requireProduct($productId);
        $this->products->changeStock($productId, $quantity);
    }

    public function updateInventory(int $productId, int $quantity, int $reorderLevel): void
    {
        if ($quantity < 1 || $reorderLevel < 0) {
            throw new InvalidArgumentException('Enter a positive quantity and a valid reorder level.');
        }
        $this->requireProduct($productId);
        $this->products->updateInventory($productId, $quantity, $reorderLevel);
    }

    public function toggleActive(int $productId): void
    {
        $this->products->toggleActive($productId);
    }

    public function updatePrice(int $productId, float $price): void
    {
        if ($price <= 0) {
            throw new InvalidArgumentException('Price must be greater than zero.');
        }
        $this->requireProduct($productId);
        $this->products->updatePrice($productId, $price);
    }

    private function mapProduct(array $product): array
    {
        return [
            'id' => (int) $product['id'],
            'sku' => $product['sku'],
            'name' => $product['name'],
            'category' => $product['category'],
            'imagePath' => $product['image_path'] ?? null,
            'price' => (float) $product['price'],
            'stock' => (int) $product['stock'],
            'reorder' => (int) $product['reorder_level'],
            'active' => (bool) $product['active'],
        ];
    }

    private function requireProduct(int $productId): void
    {
        if ($productId < 1 || !$this->products->find($productId)) {
            throw new InvalidArgumentException('Product was not found.');
        }
    }

    private function storeImage(?array $image): ?string
    {
        if (!$image || ($image['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return null;
        }
        if ($image['error'] !== UPLOAD_ERR_OK) {
            throw new InvalidArgumentException('Product image upload failed.');
        }

        $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        $mimeType = mime_content_type($image['tmp_name']);
        if (!isset($allowedTypes[$mimeType])) {
            throw new InvalidArgumentException('Product image must be JPG, PNG, or WEBP.');
        }

        $uploadDir = __DIR__ . '/../../uploads/products';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = uniqid('product_', true) . '.' . $allowedTypes[$mimeType];
        $target = $uploadDir . '/' . $fileName;
        if (!move_uploaded_file($image['tmp_name'], $target)) {
            throw new InvalidArgumentException('Could not save product image.');
        }

        return 'uploads/products/' . $fileName;
    }
}
