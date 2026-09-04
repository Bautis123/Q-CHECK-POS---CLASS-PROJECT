<?php

final class ReturnRepository
{
    public function __construct(private PDO $db)
    {
    }

    public function all(): array
    {
        return $this->db->query("SELECT * FROM returns ORDER BY id DESC")->fetchAll();
    }

    public function findByReceipt(string $receiptNo): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM returns WHERE receipt_no = :receipt_no LIMIT 1");
        $stmt->execute(['receipt_no' => $receiptNo]);
        $return = $stmt->fetch();
        return $return ?: null;
    }

    public function create(array $data): array
    {
        $returnNo = 'RET-' . (2001 + (int) $this->db->query("SELECT COUNT(*) FROM returns")->fetchColumn());
        $stmt = $this->db->prepare(
            "INSERT INTO returns (return_no, receipt_no, processed_by, amount, reason)
             VALUES (:return_no, :receipt_no, :processed_by, :amount, :reason)"
        );
        $stmt->execute([
            'return_no' => $returnNo,
            'receipt_no' => $data['receipt_no'],
            'processed_by' => $data['processed_by'],
            'amount' => $data['amount'],
            'reason' => $data['reason'],
        ]);
        return [
            'id' => (int) $this->db->lastInsertId(),
            'return_no' => $returnNo,
            'receipt_no' => $data['receipt_no'],
            'processed_by' => $data['processed_by'],
            'amount' => $data['amount'],
            'reason' => $data['reason'],
            'created_at' => date('Y-m-d H:i:s'),
        ];
    }
}
