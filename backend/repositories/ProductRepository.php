<?php

final class ProductRepository
{
    public function __construct(private PDO $db)
    {
    }

    public function all(): array
    {
        return $this->db->query("SELECT * FROM products ORDER BY id DESC")->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM products WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $product = $stmt->fetch();
        return $product ?: null;
    }

    public function create(array $data): array
    {
        $nextSku = 'P' . (1001 + (int) $this->db->query("SELECT COUNT(*) FROM products")->fetchColumn());
        $stmt = $this->db->prepare(
            "INSERT INTO products (sku, name, category, image_path, price, stock, reorder_level, active)
             VALUES (:sku, :name, :category, :image_path, :price, :stock, :reorder_level, 1)"
        );
        $stmt->execute([
            'sku' => $nextSku,
            'name' => $data['name'],
            'category' => $data['category'],
            'image_path' => $data['image_path'] ?? null,
            'price' => $data['price'],
            'stock' => $data['stock'],
            'reorder_level' => $data['reorder_level'],
        ]);
        return $this->find((int) $this->db->lastInsertId());
    }

    public function changeStock(int $id, int $quantity): void
    {
        $stmt = $this->db->prepare("UPDATE products SET stock = stock + :quantity WHERE id = :id");
        $stmt->execute(['quantity' => $quantity, 'id' => $id]);
    }

    public function updateInventory(int $id, int $quantity, int $reorderLevel): void
    {
        $stmt = $this->db->prepare(
            "UPDATE products
             SET stock = stock + :quantity, reorder_level = :reorder_level
             WHERE id = :id"
        );
        $stmt->execute([
            'quantity' => $quantity,
            'reorder_level' => $reorderLevel,
            'id' => $id,
        ]);
    }

    public function toggleActive(int $id): void
    {
        $stmt = $this->db->prepare("UPDATE products SET active = IF(active = 1, 0, 1) WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public function updatePrice(int $id, float $price): void
    {
        $stmt = $this->db->prepare("UPDATE products SET price = :price WHERE id = :id");
        $stmt->execute(['price' => $price, 'id' => $id]);
    }
}
