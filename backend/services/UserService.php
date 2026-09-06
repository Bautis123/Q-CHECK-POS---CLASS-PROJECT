<?php

final class UserService
{
    public function __construct(private UserRepository $users, private RoleRepository $roles)
    {
    }

    public function all(): array
    {
        return array_map([$this, 'mapUser'], $this->users->all());
    }

    public function create(array $data): array
    {
        $required = ['full_name', 'username', 'password', 'role'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                throw new InvalidArgumentException("Missing user field: {$field}");
            }
        }

        if ($this->users->findByUsername($data['username'])) {
            throw new InvalidArgumentException('Username already exists.');
        }
        if (!$this->roles->findByName($data['role'])) {
            throw new InvalidArgumentException('Choose an existing role.');
        }

        return $this->mapUser($this->users->create($data));
    }

    private function mapUser(array $user): array
    {
        return [
            'id' => (int) $user['id'],
            'name' => $user['full_name'],
            'username' => $user['username'],
            'role' => $user['role'],
            'status' => $user['status'],
        ];
    }
}
