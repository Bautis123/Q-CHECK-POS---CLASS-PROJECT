<?php

final class Request
{
    public static function input(): array
    {
        // PHP parses multipart form submissions into $_POST before this method runs.
        if ($_POST !== []) {
            return $_POST;
        }

        $raw = file_get_contents('php://input');
        if (!$raw) {
            return $_POST;
        }

        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
}
