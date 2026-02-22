# Doplňky k technickému návrhu: admin URL + bezpečný „tail“ logu

> Tento dokument doplňuje zadání o konkrétní URL strukturu (zejména pro admin) a návrh bezpečné implementace „tail“ logu (poslední řádky log souboru).

---

## 1) Návrh URL/endpointů aplikace

### 1.1 Veřejná část (UI)

- `/` – rozcestník / výchozí stránka
- `/rozvrhy` – Rozvrhy tříd
- `/akce` – Veřejné akce
- `/suplovani` – Suplování
- `/zamestnanci` – Zaměstnanci (veřejný seznam / interní dle rozhodnutí)

> Veřejná část vždy čte pouze z DB (nikdy přímo z Bakalářů).

### 1.2 Veřejná část (read-only API pro JS)

Pokud budete mít dynamické načítání přes JS, doporučuji oddělit read-only JSON API:

- `GET /api/v1/events?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/v1/timetable?mode=permanent|actual&week=this|next&class=4.A`
- `GET /api/v1/substitutions?date=YYYY-MM-DD`
- `GET /api/v1/staff?query=...`

> Výhoda: UI (JS) je jednodušší, a API se dá případně použít i pro další klienty (info panel, mobilní obal).

### 1.3 Admin část (autentizace + správa synchronizace)

**Login a sezení**
- `GET  /admin/login` – formulář
- `POST /admin/login` – přihlášení
- `POST /admin/logout` – odhlášení

**Dashboard / stav**
- `GET /admin` – přehled (karty: poslední běhy, chyby, počty záznamů)
- `GET /admin/stav` – detailní stav synchronizací (tabulka posledních běhů + agregace)

**Importy (manuální spouštění / „one-shot“)**
- `GET  /admin/import` – stránka s tlačítky a vysvětlením
- `POST /admin/import/events` – ruční synchronizace veřejných akcí
- `POST /admin/import/timetable` – ruční synchronizace rozvrhů (permanent/actual)
- `POST /admin/import/substitutions` – ruční synchronizace suplování (např. dnes + zítra)
- `POST /admin/import/staff` – ruční synchronizace zaměstnanců (podle zadání jen manuálně)

> Doporučení: Každý import endpoint může přijmout volitelné parametry v POST (např. rozsah dat), ale bezpečně validované a s rozumnými limity.

**Logy (bezpečný náhled)**
- `GET /admin/logs` – seznam dostupných logů (jen z whitelistu)
- `GET /admin/logs/tail?file=<id>&lines=200` – posledních N řádků z logu (tail)

Volitelně:
- `GET /admin/logs/download?file=<id>` – stažení (jen pokud to opravdu potřebujete; často stačí tail)

---

## 2) Bezpečný „tail“ logu: návrh implementace

### 2.1 Hrozby, které je nutné pokrýt

1. **Path traversal** (např. `../../etc/passwd`) – útočník se snaží otevřít libovolný soubor. 
2. **Čtení citlivých souborů** (env, config, klíče) – i bez traversal, pokud umožníte zadat cestu.
3. **DoS** (velký soubor / moc řádků / mnoho requestů) – přetížení serveru.
4. **XSS přes logy** – log může obsahovat uživatelský input, který by se mohl vykreslit jako HTML.

### 2.2 Základní princip: nikdy nepřijímat cestu k souboru

✅ Endpoint `/admin/logs/tail` by neměl akceptovat cestu.

Místo toho:
- Parametr `file` je **ID** (např. `sync`, `php`, `nginx_error`).
- Aplikace má server-side mapu `ID → absolutní cesta`.

**Příklad whitelist konfigurace (PHP):**

```php
// config/logs.php
return [
  'sync'        => '/var/www/app/storage/logs/sync.log',
  'app'         => '/var/www/app/storage/logs/app.log',
  'cron'        => '/var/www/app/storage/logs/cron.log',
  // volitelně webserver logy jen pokud je to povolené:
  // 'nginx_err' => '/var/log/nginx/error.log',
];
```

### 2.3 Ochrana proti path traversal (defense-in-depth)

I když přijímáte jen ID, doporučuji přidat vrstvy:

1) **Validace `file`**
- povolit pouze `[a-z0-9_\-]` a rozumnou délku (např. max 32)

2) **Resolve a kontrola reálné cesty**
- `realpath()` na cílový soubor
- ověřit, že soubor leží v povoleném adresáři (např. `storage/logs`) *nebo* je explicitně v whitelistu

3) **Kontrola typu souboru**
- musí to být regular file (ne symlink, ne device)

4) **Limity**
- `lines` omezit (např. 20–500)
- vracet max bajtů (např. 256 KB)

5) **Escapování výstupu**
- v HTML vždy `htmlspecialchars()`
- v JSON vracet plain text a na frontendu renderovat jako text (ne `innerHTML`)

### 2.4 Návrh endpointu `/admin/logs/tail`

**Request**
- `GET /admin/logs/tail?file=sync&lines=200`

**Response (doporučeno JSON)**

```json
{
  "file": "sync",
  "lines": 200,
  "truncated": false,
  "content": "...posledni radky..."
}
```

> `truncated=true`, pokud jste museli uříznout výstup kvůli limitu (bajty/řádky).

### 2.5 Ukázková server-side logika (PHP, pseudokód)

```php
// AdminLogsController::tail()

// 1) AUTHZ: pouze admin role
requireAdmin();

// 2) CSRF není potřeba u GET, ale doporučuje se rate limit
rateLimit('admin_logs_tail', 30 /*req/min*/);

$fileId = $_GET['file'] ?? '';
$lines  = (int)($_GET['lines'] ?? 200);

if (!preg_match('/^[a-z0-9_-]{1,32}$/', $fileId)) {
  return jsonError(400, 'Neplatný identifikátor logu.');
}

$lines = max(20, min($lines, 500));

$whitelist = require __DIR__ . '/../config/logs.php';
if (!array_key_exists($fileId, $whitelist)) {
  return jsonError(404, 'Log není dostupný.');
}

$path = $whitelist[$fileId];
$real = realpath($path);
if ($real === false) {
  return jsonError(404, 'Soubor logu neexistuje.');
}

// 3) Ověření regular file + čitelnost
if (!is_file($real) || !is_readable($real)) {
  return jsonError(403, 'Soubor nelze číst.');
}

// 4) Volitelně: zákaz symlinků
if (is_link($path)) {
  return jsonError(403, 'Symlinky nejsou povoleny.');
}

// 5) Načíst posledních N řádků efektivně (nečíst celý soubor)
$result = tailFile($real, $lines, 256*1024 /*maxBytes*/);

return jsonOk([
  'file'      => $fileId,
  'lines'     => $lines,
  'truncated' => $result['truncated'],
  'content'   => $result['content'],
]);
```

### 2.6 Efektivní funkce `tailFile()` (koncept)

Princip:
- otevřít soubor
- skákat od konce po blocích (např. 8–64 KB)
- sbírat `\n` dokud nemáte N řádků nebo dokud nedosáhnete limitu bajtů

Doporučené parametry:
- `maxBytes`: hard limit na velikost načteného bufferu
- `blockSize`: 8192–65536

> Pokud máte velmi „ukecané“ logy, je to zásadní kvůli výkonu.

### 2.7 UI pro tail logu

- Stránka `/admin/logs`:
  - dropdown / seznam logů z whitelistu
  - volba počtu řádků (20/50/100/200/500)
  - auto-refresh volitelně (např. každých 10 s)

**Bezpečné vykreslení**
- obsah logu renderovat jako text v `<pre>`
- v JS nepoužívat `innerHTML`, ale `textContent`

---

## 3) Doporučené doplňky k zabezpečení admin části

1. **RBAC**: role `admin` (případně `operator`) – pouze admin vidí logy a může spouštět importy.
2. **2FA/SSO** (pokud škola má): ideální, ale minimálně silné heslo + omezení pokusů.
3. **CSRF** pro všechny POST endpointy v adminu (`/admin/import/*`, `/admin/logout`).
4. **Rate limit** pro:
   - login (např. 5 pokusů / 10 min)
   - tail (např. 30 req/min)
5. **Audit log**: kdo spustil import a kdy.

---

## 4) Drobné úpravy zadání – doporučená textace (k vložení)

Doplnit do zadání sekci „Admin“:

- Aplikace obsahuje admin část dostupnou na `/admin/*`.
- Admin část umožní:
  - přihlášení `/admin/login`
  - manuální synchronizace dat `/admin/import/*`
  - zobrazení stavu synchronizace `/admin/stav`
  - bezpečný náhled logů `/admin/logs` a `/admin/logs/tail`
- „Tail“ logu je implementován bezpečně:
  - pouze pro přihlášeného admina
  - umožňuje vybírat jen z whitelistu logů
  - neumožňuje zadat cestu k souboru
  - chrání proti path traversal a má limity na velikost a počet řádků

---

## 5) Bezpečnostní detaily pro admin (session flags, CSP, audit trail)

Tato sekce doplňuje konkrétní technická opatření pro `/admin/*` nad rámec základních bodů (RBAC, CSRF, rate limit). Cílem je ztížit kompromitaci účtu, zamezit útokům přes prohlížeč (XSS/Clickjacking), a zajistit dohledatelnost operací.

### 5.1 Session management (cookies, timeouts, fixation)

**Cookie flags (povinné):**
- `Secure` – cookie se posílá pouze přes HTTPS.
- `HttpOnly` – zabrání čtení cookie z JavaScriptu (mitigace XSS).
- `SameSite=Lax` (nebo `Strict` pokud to nekomplikuje login/redirecty) – omezení CSRF na úrovni prohlížeče.
- Nastavit `Path=/admin` pro admin-session cookie (oddělení od veřejné části).

**Doporučené nastavení session:**
- Regenerace session ID po přihlášení a po změně oprávnění (ochrana proti session fixation).
- Idle timeout (např. 15–30 min nečinnosti) + absolute timeout (např. 8–12 hodin).
- Invalidate session po odhlášení.
- Volitelně „soft binding“ na User-Agent (detekce změny UA) – pozor na falešné poplachy.

**PHP příklad (koncept):**

```php
// bootstrap.php (před session_start)
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_path', '/admin');

session_name('ADMINSESSID');
session_start();

// po úspěšném loginu
session_regenerate_id(true);
$_SESSION['admin_id'] = $userId;
$_SESSION['last_activity'] = time();
$_SESSION['login_time'] = time();
```

**Kontrola timeoutů (koncept):**

```php
$now = time();
$idleLimit = 30*60;       // 30 min
$absoluteLimit = 10*60*60; // 10 h

if (!isset($_SESSION['admin_id'])) {
  deny();
}

if (($now - ($_SESSION['last_activity'] ?? 0)) > $idleLimit) {
  logoutAndRedirect('Session expirovala (nečinnost).');
}
if (($now - ($_SESSION['login_time'] ?? 0)) > $absoluteLimit) {
  logoutAndRedirect('Session expirovala (max. doba).');
}
$_SESSION['last_activity'] = $now;
```

### 5.2 CSRF ochrana pro admin POST akce

- Povinně pro všechny POST: `/admin/logout`, `/admin/import/*`.
- Token generovat per-session a validovat per-request.
- Použít i `SameSite` cookie, ale nespoléhat na něj jako jedinou obranu.

**Koncept:**

```php
// generace
if (empty($_SESSION['csrf'])) {
  $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

// validace
$token = $_POST['csrf'] ?? '';
if (!hash_equals($_SESSION['csrf'] ?? '', $token)) {
  return error(403, 'CSRF token invalidní.');
}
```

### 5.3 Content Security Policy (CSP) + bezpečnostní hlavičky

**CSP doporučení:**
- Preferovat „nonce-based“ přístup: žádné inline skripty bez nonce.
- Zakázat/nepovolit `object-src` a omezit `frame-ancestors`.
- Pokud nepoužíváte externí CDN, držet `script-src 'self'`.

**Příklad CSP pro admin (výchozí, bez CDN):**

```http
Content-Security-Policy: default-src 'self'; \
  script-src 'self' 'nonce-{RANDOM_NONCE}'; \
  style-src 'self'; \
  img-src 'self' data:; \
  font-src 'self'; \
  connect-src 'self'; \
  object-src 'none'; \
  base-uri 'self'; \
  frame-ancestors 'none'; \
  form-action 'self'; \
  upgrade-insecure-requests
```

**Další doporučené hlavičky (admin i veřejná část):**

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
X-Frame-Options: DENY
```

Poznámky:
- `HSTS` zapínejte až když jste si jistí, že HTTPS je vždy k dispozici.
- `X-Frame-Options` a `frame-ancestors` v CSP řeší clickjacking (ideálně mít obojí).

### 5.4 Ochrana proti XSS v adminu

- Všechny proměnné do HTML escapovat (`htmlspecialchars`).
- Logy zobrazovat pouze jako text (`<pre>`, `textContent` v JS), nikdy ne jako HTML.
- Zakázat inline event handlery (součást CSP).

### 5.5 Přihlašování, hesla a rate limit

- Ukládat pouze hash hesla (např. `password_hash()` s `PASSWORD_DEFAULT`).
- Rate limit loginu (např. 5 pokusů / 10 min na IP + uživatelské jméno).
- Po N neúspěších krátký „cooldown“ (např. 60–300 s).
- Logovat neúspěšné pokusy do audit trail (viz níže), ale bez citlivých údajů.

### 5.6 Audit trail (kdo udělal co, kdy, s jakým výsledkem)

**Co logovat (minimální sada):**
- login success/fail, logout
- spuštění importů (`events`, `timetable`, `substitutions`, `staff`) včetně parametrů (safe subset)
- změny ručně udržovaných údajů (telefon/role/konzultace u zaměstnanců)
- přístup k logům (který log + počet řádků), zejména pokud dovolíte download

**Doporučená DB tabulka `admin_audit_log`:**

```sql
CREATE TABLE admin_audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at DATETIME NOT NULL,
  admin_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64) NULL,
  entity_id VARCHAR(64) NULL,
  status VARCHAR(16) NOT NULL, -- success|fail
  ip VARBINARY(16) NULL,       -- IPv4/IPv6 (packed)
  user_agent VARCHAR(255) NULL,
  details JSON NULL,
  PRIMARY KEY (id),
  INDEX idx_created_at (created_at),
  INDEX idx_admin_user (admin_user_id, created_at),
  INDEX idx_action (action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_czech_ci;
```

**Doporučení k ukládání `details`:**
- ukládat pouze „safe“ parametry (např. `from`, `to`, `mode`), nikdy ne hesla, tokeny ani Authorization hlavičky.
- pokud ukládáte chyby, tak zkrátit délku a odstranit citlivé údaje.

**Retence / archivace:**
- audit držet např. 6–24 měsíců (dle interních pravidel školy).
- staré záznamy archivovat nebo mazat CRONem (s přiměřeným zdůvodněním).

### 5.7 Oddělení oprávnění (RBAC) a obrana „nejmenších práv“

- Role:
  - `admin` – vše
  - `operator` – spouštění importů + stav, bez log download
  - `viewer` – jen `/admin/stav` (volitelné)
- Endpointy `/admin/logs/*` jen pro `admin`.
- Importy umožnit pouze `admin` nebo `operator`.

### 5.8 Ochrana import endpointů před zneužitím

- Importy jsou POST + CSRF.
- Rate limit importů (např. max 1 běh daného importu za 1–5 minut).
- „Lock“ na úrovni DB / souboru, aby se importy nepřekrývaly (např. `GET_LOCK()` v MySQL).
- Vynutit maximální rozsahy (např. suplování max 14 dní dopředu).

### 5.9 Bezpečné logování (hygiena)

- Nikdy nelogovat:
  - `Authorization` header (Basic auth)
  - hesla
  - celé request/response payloady, pokud mohou obsahovat osobní údaje (zvažte anonymizaci nebo „raw_json“ jen s omezeným přístupem)
- Logy rotovat (logrotate) a chránit právy souborů.

---

### 5.10 Doporučené doplnění do zadání (stručný text)

Do zadání doplnit:

- Admin část `/admin/*` používá bezpečné session cookies (`Secure`, `HttpOnly`, `SameSite`) a regeneraci session ID po loginu.
- Admin POST akce jsou chráněné CSRF tokenem.
- Je nastavena CSP (min. `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`) a bezpečnostní hlavičky (HSTS, nosniff, referrer-policy).
- Aplikace vede auditní stopu (login, importy, editace zaměstnanců, přístup k logům) do DB tabulky `admin_audit_log` s definovanou retenční dobou.

---

## 6) Přístup k databázi: interní CRUD wrapper nad PDO

Pro komunikaci s MySQL databází bude použit **jednoduchý interní CRUD wrapper nad PDO** (abstrakční vrstva nad DB přístupem). Wrapper sjednotí práci s DB napříč aplikací (web UI, admin i importní skripty), omezí duplicitní SQL, zlepší čitelnost kódu a sníží riziko chyb v dotazech.

### 6.1 Cíle wrapperu

- **Bezpečnost**: výhradně prepared statements (žádné lepení parametrů do SQL). 
- **Jednotné API**: `fetchOne`, `fetchAll`, `execute`, `insert`, `update`, `delete`, volitelně `upsert`.
- **Transakce**: `begin() / commit() / rollback()` – hlavně pro importy (rozvrhy/suplování).
- **Konzistentní chyby**: PDO v režimu výjimek + centralizované zachytávání a logování.
- **Konfigurace**: DSN, user, password z ENV/secrets (nikoli natvrdo v kódu).

### 6.2 Doporučené PDO nastavení (must-have)

Při vytváření PDO připojení nastavit:

- `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION` (chceme výjimky, ne tiché chyby)
- `PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC` (konsistentní návratová struktura)
- `PDO::ATTR_EMULATE_PREPARES => false` (skutečné prepared statements, pokud to driver umožní)
- `PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"` (kompatibilní s `utf8mb4_czech_ci`)

### 6.3 Návrh rozhraní třídy `Db`

Níže je návrh „minimální, ale použitelný“ wrapper třídy. Je to záměrně jednoduché – není to ORM.

#### 6.3.1 Skeleton (PHP 8+)

```php
<?php
declare(strict_types=1);

final class Db
{
    private \PDO $pdo;

    /** @var callable|null */
    private $logger; // fn(string $level, string $message, array $context): void

    public function __construct(\PDO $pdo, ?callable $logger = null)
    {
        $this->pdo = $pdo;
        $this->logger = $logger;
    }

    public function pdo(): \PDO
    {
        return $this->pdo;
    }

    // --- Transakce ---
    public function begin(): void { $this->pdo->beginTransaction(); }
    public function commit(): void { $this->pdo->commit(); }
    public function rollback(): void { if ($this->pdo->inTransaction()) $this->pdo->rollBack(); }

    // --- Read ---
    public function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->prepareExecute($sql, $params);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public function fetchAll(string $sql, array $params = []): array
    {
        $stmt = $this->prepareExecute($sql, $params);
        return $stmt->fetchAll();
    }

    // --- Write ---
    public function execute(string $sql, array $params = []): int
    {
        $stmt = $this->prepareExecute($sql, $params);
        return $stmt->rowCount();
    }

    public function insert(string $table, array $data): string
    {
        $cols = array_keys($data);
        $placeholders = array_map(fn($c) => ':' . $c, $cols);

        $sql = sprintf(
            'INSERT INTO `%s` (%s) VALUES (%s)',
            $table,
            implode(', ', array_map(fn($c) => "`$c`", $cols)),
            implode(', ', $placeholders)
        );

        $this->execute($sql, $data);
        return $this->pdo->lastInsertId();
    }

    public function update(string $table, array $data, string $where, array $whereParams = []): int
    {
        $set = [];
        foreach ($data as $col => $_) {
            $set[] = sprintf('`%s` = :set_%s', $col, $col);
        }

        $params = [];
        foreach ($data as $col => $val) {
            $params['set_' . $col] = $val;
        }
        $params += $whereParams;

        $sql = sprintf('UPDATE `%s` SET %s WHERE %s', $table, implode(', ', $set), $where);
        return $this->execute($sql, $params);
    }

    public function delete(string $table, string $where, array $whereParams = []): int
    {
        $sql = sprintf('DELETE FROM `%s` WHERE %s', $table, $where);
        return $this->execute($sql, $whereParams);
    }

    /**
     * Upsert pomocí MySQL ON DUPLICATE KEY UPDATE.
     * Vyžaduje unikátní index/PK na konfliktních sloupcích.
     */
    public function upsert(string $table, array $data, array $updateCols): int
    {
        $cols = array_keys($data);
        $placeholders = array_map(fn($c) => ':' . $c, $cols);

        $updates = [];
        foreach ($updateCols as $col) {
            $updates[] = sprintf('`%s` = VALUES(`%s`)', $col, $col);
        }

        $sql = sprintf(
            'INSERT INTO `%s` (%s) VALUES (%s) ON DUPLICATE KEY UPDATE %s',
            $table,
            implode(', ', array_map(fn($c) => "`$c`", $cols)),
            implode(', ', $placeholders),
            implode(', ', $updates)
        );

        return $this->execute($sql, $data);
    }

    // --- Interní helper ---
    private function prepareExecute(string $sql, array $params): \PDOStatement
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (\PDOException $e) {
            $this->log('error', 'DB error', [
                'sql' => $this->redactSql($sql),
                'code' => $e->getCode(),
            ]);
            throw $e;
        }
    }

    private function log(string $level, string $message, array $context = []): void
    {
        if ($this->logger) {
            ($this->logger)($level, $message, $context);
        }
    }

    private function redactSql(string $sql): string
    {
        // SQL logujeme jen pro diagnostiku – bez parametrů.
        // Případně můžete odstraňovat i citlivé části (např. u loginu).
        return $sql;
    }
}
```

> Pozn.: Wrapper záměrně neloguje parametry dotazů (mohou obsahovat osobní údaje nebo credentialy).

#### 6.3.2 Pomocná funkce pro IN (...) bezpečně

Často budete filtrovat např. více tříd. Bezpečně to udělejte generováním placeholderů:

```php
public static function inPlaceholders(string $prefix, array $values): array
{
    // vrátí [ 'sql' => ':p0,:p1,...', 'params' => ['p0' => v0, ...] ]
    $params = [];
    $ph = [];
    foreach (array_values($values) as $i => $v) {
        $key = $prefix . $i;
        $ph[] = ':' . $key;
        $params[$key] = $v;
    }
    return ['sql' => implode(',', $ph), 'params' => $params];
}
```

Použití:

```php
$in = Db::inPlaceholders('c', ['1.A','2.B']);
$sql = "SELECT * FROM rozvrh WHERE trida IN ({$in['sql']})";
$rows = $db->fetchAll($sql, $in['params']);
```

### 6.4 Doporučené použití v importech (transakce + upsert)

- Importy (CRON) typicky:
  1) `begin()`
  2) uložit „snapshot“
  3) provést bulk delete pro daný snapshot / nebo upsert po dávkách
  4) `commit()`
  5) při chybě `rollback()` + log + zapsat do `sync_log`

### 6.5 Doporučené doplnění do zadání (stručný text)

Do zadání doplnit:

- „Pro komunikaci s MySQL DB bude použit jednoduchý interní CRUD wrapper nad PDO. Všechny DB operace budou realizovány přes prepared statements, importní operace budou využívat transakce a pro synchronizace bude používán upsert podle unikátních klíčů.“

