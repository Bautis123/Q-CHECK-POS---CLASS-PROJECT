<?php

final class ProductController
{
    public function __construct(private ProductService $products)
    {
    }

    public function index(): void
    {
        Response::ok(['products' => $this->products->all()]);
    }

    public function create(array $input): void
    {
        Response::ok(['product' => $this->products->create($input)]);
    }

    public function receive(array $input): void
    {
        $this->products->receiveStock((int) $input['product_id'], (int) $input['quantity']);
        Response::ok();
    }

    public function toggle(array $input): void
    {
        $this->products->toggleActive((int) $input['product_id']);
        Response::ok();
    }

    public function updatePrice(array $input): void
    {
        $this->products->updatePrice((int) $input['product_id'], (float) $input['price']);
        Response::ok();
    }
}
