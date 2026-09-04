<?php

final class Request
{
    public static function input(): array
    {
        $raw = file_get_contents('php://input');
        if (!$raw) {
            return $_POST;
        }

        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
}
