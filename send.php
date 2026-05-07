<?php
/**
 * KingTos dev — Contact Form Handler v2
 * ─────────────────────────────────────
 * • Dark-themed branded HTML email
 * • Sequential numbering from #0000
 * • Anti-threading: unique subject + Message-ID + X-Entity-Ref-ID
 */

// ─── Konfiguracja ───
$recipient   = 'kontakt@kingtos.pl';
$fromEmail   = 'noreply@kingtos.pl';
$fromName    = 'KingTos dev';
$counterFile = __DIR__ . '/form_counter.dat';

// ─── Nagłówki CORS & JSON ───
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://kingtos.pl');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Metoda niedozwolona.']);
    exit;
}

// ─── Odbiór danych ───
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Nieprawidłowe dane.']);
    exit;
}

// ─── Walidacja & sanityzacja ───
$name         = isset($data['name'])         ? trim(strip_tags($data['name']))         : '';
$email        = isset($data['email'])        ? trim(strip_tags($data['email']))        : '';
$projectType  = isset($data['project_type']) ? trim(strip_tags($data['project_type'])) : '';
$features     = isset($data['features'])     ? $data['features']                       : [];
$message      = isset($data['message'])      ? trim(strip_tags($data['message']))      : '';
$websiteUrl   = isset($data['website_url'])  ? trim(strip_tags($data['website_url']))  : '';

if (is_array($features)) {
    $features = array_map(function($f) { return trim(strip_tags($f)); }, $features);
} else {
    $features = [];
}

if (empty($name) || empty($email)) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Imię i e-mail są wymagane.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Nieprawidłowy adres e-mail.']);
    exit;
}

// ─── Counter (numeracja od #0000) ───
$counter = 0;
if (file_exists($counterFile)) {
    $counter = (int) file_get_contents($counterFile);
}
$ticketNumber = str_pad($counter, 4, '0', STR_PAD_LEFT);
file_put_contents($counterFile, $counter + 1);

// ─── Mapowanie typów projektu ───
$projectLabels = [
    'nowa_strona'   => 'Nowa strona',
    'renowacja'     => 'Renowacja WWW',
    'automatyzacja' => 'Automatyzacja',
];
$projectLabel = isset($projectLabels[$projectType]) ? $projectLabels[$projectType] : $projectType;

$projectIcons = [
    'nowa_strona'   => '🚀',
    'renowacja'     => '🔄',
    'automatyzacja' => '⚡',
];
$projectIcon = isset($projectIcons[$projectType]) ? $projectIcons[$projectType] : '📋';

// ─── Feature badges HTML ───
$featureBadgesHTML = '';
if (!empty($features)) {
    foreach ($features as $f) {
        $featureBadgesHTML .= "<span style='display:inline-block; padding:6px 14px; margin:3px 4px; background-color:rgba(26,26,51,0.99); border:1px solid rgba(108,99,255,0.99); border-radius:20px; font-size:13px; color:rgba(192,132,252,0.99); font-weight:500;'>{$f}</span>";
    }
} else {
    $featureBadgesHTML = "<span style='color:rgba(148,163,184,0.99); font-style:italic;'>Nie wybrano opcji</span>";
}

// ─── Wiadomość ───
$messageHTML = !empty($message)
    ? nl2br(htmlspecialchars($message))
    : "<span style='color:rgba(148,163,184,0.99); font-style:italic;'>— brak dodatkowej wiadomości —</span>";

// ─── Website URL ───
$websiteHTML = !empty($websiteUrl)
    ? "<a href='{$websiteUrl}' style='color:rgba(0,212,255,0.99); text-decoration:none; font-weight:600; font-size:16px;'>{$websiteUrl}</a>"
    : "<span style='color:rgba(148,163,184,0.99); font-style:italic;'>Nie podano</span>";

$date = date('d.m.Y, H:i');
$uniqueId = uniqid('kt-', true);

// ─── Subject (unikalny — zapobiega stackowaniu) ───
$subject = "=?UTF-8?B?" . base64_encode("Zapytanie #{$ticketNumber} · {$projectLabel} · {$name}") . "?=";

// ─── Branded dark-theme HTML email ───
$htmlBody = <<<HTML
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zapytanie #{$ticketNumber}</title>
</head>
<body style="margin:0; padding:0; background-color:rgba(6,6,14,0.99); color:rgba(255,255,255,0.99);">

<!-- Wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:rgba(6,6,14,0.99); min-height:100%;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px; width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:0 0 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="left">
                  <span style="font-size:24px; font-weight:700; color:rgba(255,255,255,0.99); letter-spacing:-0.5px;">
                    <span style="color:rgba(108,99,255,0.99);">King</span>Tos<span style="color:rgba(108,99,255,0.99);">.</span>
                  </span>
                </td>
                <td align="right">
                  <span style="display:inline-block; padding:6px 14px; background-color:rgba(17,17,34,0.99); border:1px solid rgba(108,99,255,0.99); border-radius:30px; font-size:12px; color:rgba(255,255,255,0.99); font-weight:600;">
                    ZAPYTANIE #{$ticketNumber}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:rgba(11,11,20,0.99); border:1px solid rgba(26,26,46,0.99); border-radius:24px; overflow:hidden;">
              
              <!-- Gradient Bar -->
              <tr>
                <td style="height:6px; background:linear-gradient(90deg, rgba(108,99,255,0.99) 0%, rgba(0,212,255,0.99) 100%);"></td>
              </tr>

              <tr>
                <td style="padding:40px;">
                  
                  <h1 style="margin:0 0 10px; font-size:28px; font-weight:700; color:rgba(255,255,255,0.99); letter-spacing:-0.5px;">{$projectIcon} Nowe zlecenie</h1>
                  <p style="margin:0 0 30px; font-size:14px; color:rgba(148,163,184,0.99);">Data wysłania: <span style="color:rgba(255,255,255,0.99);">{$date}</span></p>

                  <!-- Info Grid -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding-bottom:24px;">
                        <p style="margin:0 0 6px; font-size:12px; font-weight:700; color:rgba(108,99,255,0.99); text-transform:uppercase; letter-spacing:1px;">Klient</p>
                        <p style="margin:0; font-size:18px; font-weight:600; color:rgba(255,255,255,0.99);">{$name}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:24px;">
                        <p style="margin:0 0 6px; font-size:12px; font-weight:700; color:rgba(108,99,255,0.99); text-transform:uppercase; letter-spacing:1px;">E-mail do kontaktu</p>
                        <p style="margin:0; font-size:18px; font-weight:600;"><a href="mailto:{$email}" style="color:rgba(0,212,255,0.99); text-decoration:none;">{$email}</a></p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:24px;">
                        <p style="margin:0 0 6px; font-size:12px; font-weight:700; color:rgba(108,99,255,0.99); text-transform:uppercase; letter-spacing:1px;">Typ projektu</p>
                        <p style="margin:0; font-size:18px; font-weight:600; color:rgba(255,255,255,0.99);">{$projectIcon} {$projectLabel}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:24px;">
                        <p style="margin:0 0 6px; font-size:12px; font-weight:700; color:rgba(108,99,255,0.99); text-transform:uppercase; letter-spacing:1px;">Link do obecnej strony</p>
                        <p style="margin:0; font-size:16px;">{$websiteHTML}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:24px;">
                        <p style="margin:0 0 10px; font-size:12px; font-weight:700; color:rgba(108,99,255,0.99); text-transform:uppercase; letter-spacing:1px;">Wybrane opcje</p>
                        <div style="line-height:2.4;">
                          {$featureBadgesHTML}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:32px;">
                        <p style="margin:0 0 10px; font-size:12px; font-weight:700; color:rgba(108,99,255,0.99); text-transform:uppercase; letter-spacing:1px;">Wiadomość</p>
                        <div style="padding:24px; background-color:rgba(17,17,34,0.99); border-radius:16px; border-left:4px solid rgba(108,99,255,0.99);">
                          <p style="margin:0; font-size:16px; color:rgba(203,213,225,0.99); line-height:1.7;">{$messageHTML}</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <a href="mailto:{$email}?subject=Re: Zapytanie %23{$ticketNumber} — KingTos dev"
                           style="display:inline-block; padding:18px 44px; background:linear-gradient(135deg, rgba(108,99,255,0.99) 0%, rgba(0,212,255,0.99) 100%); border-radius:16px; font-size:16px; font-weight:700; color:rgba(255,255,255,0.99); text-decoration:none; letter-spacing:1px;">
                           ↩ ODPOWIEDZ KLIENTOWI
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer inside card -->
              <tr>
                <td style="padding:30px 40px; background-color:rgba(8,8,15,0.99); border-top:1px solid rgba(26,26,46,0.99); text-align:center;">
                  <p style="margin:0; font-size:13px; color:rgba(100,116,139,0.99);">
                    ID Systemowe: <span style="color:rgba(148,163,184,0.99);">{$uniqueId}</span> &nbsp;·&nbsp; kingtos.pl
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Bottom spacer -->
        <tr>
          <td style="padding:32px 0 0; text-align:center;">
            <p style="margin:0; font-size:12px; color:rgba(71,85,105,0.99); font-weight:500;">
              © 2026 KingTos dev &nbsp;·&nbsp; Maciej Toś &amp; Krzysztof Król
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>
HTML;

// ─── Nagłówki e-mail (anti-threading) ───
$messageId = "<{$uniqueId}@kingtos.pl>";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: {$fromName} <{$fromEmail}>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "Message-ID: {$messageId}\r\n";
$headers .= "X-Entity-Ref-ID: {$uniqueId}\r\n";
$headers .= "X-Mailer: KingTos-Contact/2.0\r\n";

// ─── Wysyłka ───
$sent = @mail($recipient, $subject, $htmlBody, $headers);

if ($sent) {
    echo json_encode([
        'status'  => 'success',
        'message' => 'Wiadomość wysłana pomyślnie!',
        'ticket'  => $ticketNumber
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz bezpośrednio na kontakt@kingtos.pl.'
    ]);
}
