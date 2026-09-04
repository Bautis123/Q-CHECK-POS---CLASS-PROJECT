<?php

final class RoleController
{
    public function __construct(private RoleService $roles)
    {
    }

    public function index(): void
    {
        Response::ok(['roles' => $this->roles->all()]);
    }

    public function create(array $input): void
    {
        Response::ok(['role' => $this->roles->create($input)]);
    }
}
