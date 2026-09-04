<?php

final class RoleRepository
{
    public function __construct(private PDO $db)
    {
    }

    public function all(): array
    {
        return $this->db->query("SELECT name, access_level FROM roles ORDER BY name")->fetchAll();
    }

    public function findByName(string $name): ?array
    {
        $stmt = $this->db->prepare("SELECT name, access_level FROM roles WHERE name = :name LIMIT 1");
        $stmt->execute(['name' => $name]);
        $role = $stmt->fetch();
        return $role ?: null;
    }

    public function create(string $name, string $accessLevel): array
    {
        $stmt = $this->db->prepare(
            "INSERT INTO roles (name, access_level) VALUES (:name, :access_level)"
        );
        $stmt->execute(['name' => $name, 'access_level' => $accessLevel]);
        return $this->findByName($name);
    }
}
