<?php

final class ReturnService
{
    public function __construct(
        private TransactionRepository $transactions,
        private ReturnRepository $returns,
        private ProductRepository $products
    ) {
    }

    public function all(): array
    {
        return array_map([$this, 'mapReturn'], $this->returns->all());
    }

    public function process(string $receiptNo, string $reason, array $user): array
    {
        $sale = $this->transactions->findByReceipt($receiptNo);
        if (!$sale) {
            throw new InvalidArgumentException('Receipt number was not found.');
        }
        if ($sale['status'] === 'Returned' || $this->returns->findByReceipt($receiptNo)) {
            throw new InvalidArgumentException('This receipt has already been returned.');
        }

        foreach ($this->transactions->itemsForReceipt($receiptNo) as $item) {
            $this->products->changeStock((int) $item['product_id'], (int) $item['quantity']);
        }

        $return = $this->returns->create([
            'receipt_no' => $receiptNo,
            'processed_by' => $user['name'] ?? 'Cashier',
            'amount' => $sale['total'],
            'reason' => $reason ?: 'Receipt return',
        ]);
        $this->transactions->markReturned($receiptNo);

        return $this->mapReturn($return);
    }

    private function mapReturn(array $return): array
    {
        return [
            'id' => (int) $return['id'],
            'returnNo' => $return['return_no'],
            'receiptNo' => $return['receipt_no'],
            'processedBy' => $return['processed_by'],
            'amount' => (float) $return['amount'],
            'reason' => $return['reason'],
            'date' => substr($return['created_at'], 0, 10),
        ];
    }
}
