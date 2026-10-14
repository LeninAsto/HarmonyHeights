<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $ok, string $message): void
{
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Este endpoint solo acepta solicitudes POST.');
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (str_contains($contentType, 'application/json')) {
    $rawBody = file_get_contents('php://input');
    $data = json_decode($rawBody ?: '', true);
    if (!is_array($data)) {
        respond(400, false, 'El contenido JSON no es válido.');
    }
} else {
    $data = $_POST;
}

// Campo trampa: los bots suelen llenarlo, una persona no lo ve.
if (!empty($data['website'])) {
    respond(200, true, 'Solicitud recibida.');
}

$nombre = trim((string) ($data['nombre'] ?? ''));
$correo = trim((string) ($data['correo'] ?? ''));
$telefono = trim((string) ($data['telefono'] ?? ''));
$edad = filter_var($data['edad'] ?? null, FILTER_VALIDATE_INT);
$programa = (string) ($data['programa'] ?? '');
$horario = (string) ($data['horario'] ?? '');
$mensaje = trim((string) ($data['mensaje'] ?? ''));
$consentimiento = (string) ($data['consentimiento'] ?? '');

$programasPermitidos = ['musica', 'danza', 'escena', 'orientacion'];
$horariosPermitidos = ['manana', 'tarde', 'sabado'];

if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 80) {
    respond(422, false, 'El nombre debe tener entre 3 y 80 caracteres.');
}
if (!filter_var($correo, FILTER_VALIDATE_EMAIL) || mb_strlen($correo) > 120) {
    respond(422, false, 'El correo electrónico no es válido.');
}
if (!preg_match('/^[0-9+() -]{7,20}$/', $telefono)) {
    respond(422, false, 'El teléfono no tiene un formato válido.');
}
if ($edad === false || $edad < 5 || $edad > 99) {
    respond(422, false, 'La edad debe estar entre 5 y 99 años.');
}
if (!in_array($programa, $programasPermitidos, true) || !in_array($horario, $horariosPermitidos, true)) {
    respond(422, false, 'El programa o el horario seleccionado no es válido.');
}
if (mb_strlen($mensaje) > 500 || $consentimiento !== 'acepto') {
    respond(422, false, 'Revisa el mensaje y acepta el uso de datos.');
}

$record = [
    'id' => bin2hex(random_bytes(8)),
    'created_at' => gmdate('c'),
    'nombre' => $nombre,
    'correo' => $correo,
    'telefono' => $telefono,
    'edad' => $edad,
    'programa' => $programa,
    'horario' => $horario,
    'mensaje' => $mensaje
];

$dataDirectory = __DIR__ . DIRECTORY_SEPARATOR . 'data';
if (!is_dir($dataDirectory) && !mkdir($dataDirectory, 0750, true) && !is_dir($dataDirectory)) {
    respond(500, false, 'No se pudo preparar el almacenamiento.');
}

$written = file_put_contents(
    $dataDirectory . DIRECTORY_SEPARATOR . 'solicitudes.jsonl',
    json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

if ($written === false) {
    respond(500, false, 'No se pudo guardar la solicitud.');
}

respond(201, true, '¡Listo! Recibimos tu solicitud de orientación.');
