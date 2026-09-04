<?php

final class UserController
{
    public function __construct(private UserService $users)
    {
    }

    public function index(): void
    {
        Response::ok(['users' => $this->users->all()]);
    }

    public function create(array $input): void
    {
        Response::ok(['user' => $this->users->create($input)]);
    }
}
