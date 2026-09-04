<?php

final class RoleService
{
    private const ACCESS_LEVELS = ['Admin', 'Manager', 'Cashier'];

    public function __construct(private RoleRepository $roles)
    {
    }

    public function all(): array
    {
        return array_map([$this, 'mapRole'], $this->roles->all());
    }

    public function create(array $data): array
    {
        $name = trim($data['name'] ?? '');
        $accessLevel = $data['access_level'] ?? '';
        if (!preg_match('/^[A-Za-z][A-Za-z0-9 _-]{1,58}$/', $name)) {
            throw new InvalidArgumentException('Role names must be 2-59 letters, numbers, spaces, hyphens, or underscores.');
        }
        if (!in_array($accessLevel, self::ACCESS_LEVELS, true)) {
            throw new InvalidArgumentException('Choose a valid access level.');
        }
        if ($this->roles->findByName($name)) {
            throw new InvalidArgumentException('A role with that name already exists.');
        }
        return $this->mapRole($this->roles->create($name, $accessLevel));
    }

    private function mapRole(array $role): array
    {
        return [
            'name' => $role['name'],
            'accessLevel' => $role['access_level'],
        ];
    }
}
