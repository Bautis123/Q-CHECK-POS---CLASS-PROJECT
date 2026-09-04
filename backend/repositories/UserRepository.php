<?php

final class UserRepository
{
    public function __construct(private PDO $db)
    {
    }

    public function all(): array
    {
        return $this->db->query("SELECT id, full_name, username, role, status FROM users ORDER BY id")->fetchAll();
    }

    public function findByUsername(string $username): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare(
            "INSERT INTO users (full_name, username, password_hash, role, status)
             VALUES (:full_name, :username, :password_hash, :role, 'Active')"
        );
        $stmt->execute([
            'full_name' => $data['full_name'],
            'username' => $data['username'],
            'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
            'role' => $data['role'],
        ]);

        return [
            'id' => (int) $this->db->lastInsertId(),
            'full_name' => $data['full_name'],
            'username' => $data['username'],
            'role' => $data['role'],
            'status' => 'Active',
        ];
    }
}
