<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://moleai.io');

$url      = $_GET['url']      ?? '';
$strategy = $_GET['strategy'] ?? 'mobile';

if (!$url) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing url parameter']);
    exit;
}

if (!in_array($strategy, ['mobile', 'desktop'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'strategy must be mobile or desktop']);
    exit;
}

$keyParam = PAGESPEED_API_KEY ? ('&key=' . urlencode(PAGESPEED_API_KEY)) : '';
$apiUrl   = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
    . '?url='      . urlencode($url)
    . '&strategy=' . urlencode($strategy)
    . '&category=performance'
    . $keyParam;

$ch = curl_init($apiUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 60,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => $curlError]);
    exit;
}

http_response_code($httpCode);
echo $response;
