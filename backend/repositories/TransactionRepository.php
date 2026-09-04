<?php

final class TransactionRepository
{
    public function __construct(private PDO $db)
    {
    }

    public function all(): array
    {
        return $this->db->query(
            "SELECT transactions.*,
                    COALESCE(SUM(transaction_items.quantity), 0) AS items
             FROM transactions
             LEFT JOIN transaction_items ON transaction_items.transaction_id = transactions.id
             GROUP BY transactions.id
             ORDER BY transactions.id DESC"
        )->fetchAll();
    }

    public function findByReceipt(string $receiptNo): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM transactions WHERE receipt_no = :receipt_no LIMIT 1");
        $stmt->execute(['receipt_no' => $receiptNo]);
        $sale = $stmt->fetch();
        return $sale ?: null;
    }

    public function itemsForReceipt(string $receiptNo): array
    {
        $stmt = $this->db->prepare(
            "SELECT transaction_items.*
             FROM transaction_items
             INNER JOIN transactions ON transactions.id = transaction_items.transaction_id
             WHERE transactions.receipt_no = :receipt_no"
        );
        $stmt->execute(['receipt_no' => $receiptNo]);
        return $stmt->fetchAll();
    }

    public function searchByReceipt(string $term): array
    {
        $stmt = $this->db->prepare("SELECT * FROM transactions WHERE receipt_no LIKE :term ORDER BY id DESC");
        $stmt->execute(['term' => '%' . $term . '%']);
        return $stmt->fetchAll();
    }

    public function createSale(array $sale, array $items): array
    {
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                "INSERT INTO transactions (receipt_no, cashier_name, subtotal, vat, total, status)
                 VALUES (:receipt_no, :cashier_name, :subtotal, :vat, :total, 'Paid')"
            );
            $stmt->execute($sale);
            $transactionId = (int) $this->db->lastInsertId();

            $itemStmt = $this->db->prepare(
                "INSERT INTO transaction_items
                 (transaction_id, product_id, product_name, quantity, unit_price, line_total)
                 VALUES (:transaction_id, :product_id, :product_name, :quantity, :unit_price, :line_total)"
            );
            $stockStmt = $this->db->prepare("UPDATE products SET stock = stock - :quantity WHERE id = :product_id");

            foreach ($items as $item) {
                $itemStmt->execute([
                    'transaction_id' => $transactionId,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'line_total' => $item['line_total'],
                ]);
                $stockStmt->execute([
                    'quantity' => $item['quantity'],
                    'product_id' => $item['product_id'],
                ]);
            }

            $this->db->commit();
            return $this->findByReceipt($sale['receipt_no']);
        } catch (Throwable $exception) {
            $this->db->rollBack();
            throw $exception;
        }
    }

    public function nextReceiptNumber(): string
    {
        $sequence = 1001 + (int) $this->db->query("SELECT COUNT(*) FROM transactions")->fetchColumn();
        return 'RCP-' . date('Ymd') . '-' . $sequence;
    }

    public function markReturned(string $receiptNo): void
    {
        $stmt = $this->db->prepare("UPDATE transactions SET status = 'Returned' WHERE receipt_no = :receipt_no");
        $stmt->execute(['receipt_no' => $receiptNo]);
    }
}
