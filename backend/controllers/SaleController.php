<?php

final class SaleController
{
    public function __construct(private SaleService $sales)
    {
    }

    public function index(): void
    {
        Response::ok(['transactions' => $this->sales->all()]);
    }

    public function checkout(array $input): void
    {
        Response::ok(['sale' => $this->sales->checkout($input['cart'] ?? [], $input['user'] ?? [])]);
    }

    public function search(array $input): void
    {
        Response::ok(['transactions' => $this->sales->searchByReceipt($input['receipt_no'] ?? '')]);
    }
}
