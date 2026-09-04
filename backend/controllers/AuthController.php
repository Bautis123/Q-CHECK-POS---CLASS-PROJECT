<?php

final class AuthController
{
    public function __construct(private AuthService $auth)
    {
    }

    public function login(array $input): void
    {
        $user = $this->auth->login($input['username'] ?? '', $input['password'] ?? '');
        if (!$user) {
            Response::error('Invalid username or password.', 401);
        }
        Response::ok(['user' => $user]);
    }
}
