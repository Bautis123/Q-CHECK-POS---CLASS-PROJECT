<?php

final class AuthService
{
    public function __construct(private UserRepository $users)
    {
    }

    public function login(string $username, string $password): ?array
    {
        $user = $this->users->findByUsername($username);
        if (!$user || $user['status'] !== 'Active' || !password_verify($password, $user['password_hash'])) {
            return null;
        }

        return [
            'id' => (int) $user['id'],
            'name' => $user['full_name'],
            'username' => $user['username'],
            'role' => $user['role'],
            'accessLevel' => $user['access_level'],
            'status' => $user['status'],
        ];
    }
}
