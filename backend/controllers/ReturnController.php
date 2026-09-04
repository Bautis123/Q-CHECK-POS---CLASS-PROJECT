<?php

final class ReturnController
{
    public function __construct(private ReturnService $returns)
    {
    }

    public function index(): void
    {
        Response::ok(['returns' => $this->returns->all()]);
    }

    public function process(array $input): void
    {
        Response::ok([
            'return' => $this->returns->process(
                $input['receipt_no'] ?? '',
                $input['reason'] ?? 'Receipt return',
                $input['user'] ?? []
            )
        ]);
    }
}
