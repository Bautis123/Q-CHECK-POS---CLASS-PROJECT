<?php

final class SaleService
{
    public function __construct(
        private ProductRepository $products,
        private TransactionRepository $transactions
    ) {
    }

    public function all(): array
    {
        return array_map([$this, 'mapSale'], $this->transactions->all());
    }

    public function checkout(array $cart, array $user): array
    {
        if (count($cart) === 0) {
            throw new InvalidArgumentException('Cart is empty.');
        }

        $requestedQuantities = [];
        foreach ($cart as $line) {
            $productId = (int) ($line['product_id'] ?? 0);
            $quantity = (int) ($line['quantity'] ?? 0);
            if ($productId < 1 || $quantity < 1) {
                throw new InvalidArgumentException('Each cart item needs a valid product and quantity.');
            }
            $requestedQuantities[$productId] = ($requestedQuantities[$productId] ?? 0) + $quantity;
        }

        $subtotal = 0;
        $items = [];
        foreach ($requestedQuantities as $productId => $quantity) {
            $product = $this->products->find($productId);
            if (!$product || !(bool) $product['active']) {
                throw new InvalidArgumentException('Product is unavailable.');
            }
            if ($quantity < 1 || $quantity > (int) $product['stock']) {
                throw new InvalidArgumentException('Invalid quantity for ' . $product['name'] . '.');
            }

            $lineTotal = (float) $product['price'] * $quantity;
            $subtotal += $lineTotal;
            $items[] = [
                'product_id' => (int) $product['id'],
                'product_name' => $product['name'],
                'quantity' => $quantity,
                'unit_price' => (float) $product['price'],
                'line_total' => $lineTotal,
            ];
        }

        $vat = $subtotal * 0.16;
        $sale = $this->transactions->createSale([
            'receipt_no' => $this->transactions->nextReceiptNumber(),
            'cashier_name' => $user['name'] ?? 'Cashier',
            'subtotal' => $subtotal,
            'vat' => $vat,
            'total' => $subtotal + $vat,
        ], $items);

        return $this->mapSale($sale);
    }

    public function searchByReceipt(string $receiptNo): array
    {
        return array_map([$this, 'mapSale'], $this->transactions->searchByReceipt($receiptNo));
    }

    private function mapSale(array $sale): array
    {
        return [
            'id' => (int) $sale['id'],
            'receiptNo' => $sale['receipt_no'],
            'date' => substr($sale['created_at'], 0, 10),
            'cashier' => $sale['cashier_name'],
            'items' => isset($sale['items']) ? (int) $sale['items'] : 0,
            'subtotal' => (float) $sale['subtotal'],
            'vat' => (float) $sale['vat'],
            'total' => (float) $sale['total'],
            'status' => $sale['status'],
        ];
    }
}
