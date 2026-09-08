<?php

final class Database
{
    private const HOST = '127.0.0.1';
    private const DB_NAME = 'gadget_pos';
    private const USER = 'root';
    private const PASSWORD = 'rootsung';

    public static function connect(): PDO
    {
        $dsn = 'mysql:host=' . self::HOST . ';dbname=' . self::DB_NAME . ';charset=utf8mb4';
        return new PDO($dsn, self::USER, self::PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
}
