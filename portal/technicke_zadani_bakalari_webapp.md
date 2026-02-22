# Technické zadání – webová aplikace „Školní rozvrh“ (Bakaláři)

**Verze dokumentu:** 1.1  
**Datum:** 2026-02-15  
**Podklad:** Datový konektor Bakaláři v2.17 (REST, Basic Auth, JSON)

---

## 1) Cíl a rozsah

### 1.1 Cíl
Vytvořit webovou aplikaci (PHP + CSS + JS), která bude:
- periodicky načítat vybraná data ze systému **Bakaláři** přes **Datový konektor**,
- ukládat je do **MySQL** databáze,
- zobrazovat je v responzivním (mobilně optimalizovaném) webovém rozhraní podle dodaných návrhů.

### 1.2 Rozsah funkcí (MVP)
**Integrovaná data / moduly:**
1. **Rozvrhy tříd** (stálý a aktuální)
2. **Veřejné akce** (kalendář akcí)
3. **Zaměstnanci** (kontakty + konzultační hodiny – část dat ručně doplňovaná)

**Mimo rozsah (zatím):**
- **Suplování**: prozatím se do aplikace neintegruje.

### 1.3 Veřejná dostupnost
Aplikace bude veřejně dostupná (bez přihlášení pro běžné návštěvníky). Import dat poběží na pozadí (CRON) nebo manuálně v administraci.

---

## 2) Technologie a architektura

### 2.1 Technologie
- **Backend:** PHP (doporučeno PHP 8.1+), MySQL 8+ / MariaDB 10.6+
- **Frontend:** HTML5, CSS3, JS (vanilla nebo lehká knihovna; bez povinnosti frameworku)
- **HTTP klient:** cURL v PHP
- **Plánování úloh:** CRON (Linux)

### 2.2 Architektura komponent
1. **Web UI (public)**
   - pouze čte data z DB
   - nezobrazuje interní stavové informace

2. **Admin část (chráněná přihlášením + whitelisted IP)**
   - ruční spuštění importů (checklist co importovat)
   - zobrazení stavu aplikace (včetně posledních řádků logu)

3. **Importní skripty (PHP CLI)**
   - periodické spouštění CRONem
   - logování pouze do souborů (.log)

---

## 3) Konfigurace aplikace

### 3.1 Konfigurační soubor
V adresáři aplikace bude umístěn **samostatný konfigurační soubor** (např. `config.php`). Soubor musí mít omezená práva a nesmí být veřejně dostupný přes HTTP.

Konfigurační soubor obsahuje:
- přístupové údaje do Bakalářů (Basic Auth)
- základní URL Bakalářů + volitelný **web-prefix** (může být prázdný řetězec)
- DB připojení
- whitelist IP pro admin a manuální import
- nastavení pro logování

**Příklad struktury konfigurace (schematicky):**

```php
return [
  'bakalari' => [
    'base_url'   => 'https://bakalari.skola.cz',
    'web_prefix' => '', // lze doplnit např. '/bakaweb'
    'interface'  => '/if/2',
    'username'   => 'SERVICE_USER',
    'password'   => 'SERVICE_PASS',
    'timeout_s'  => 20,
  ],
  'db' => [
    'host' => '127.0.0.1',
    'name' => 'dbname',
    'user' => 'dbuser',
    'pass' => 'dbpass',
  ],
  'security' => [
    'admin_ip_whitelist' => ['1.2.3.4', '5.6.7.8'],
    'session_secret' => '...random...',
  ],
  'logging' => [
    'dir' => __DIR__.'/logs',
  ],
];
```

> Pozn.: Konfigurační soubor se nesmí commitovat do repozitáře (nebo jen jako `config.example.php` bez reálných hesel).

---

## 4) Bezpečnost

### 4.1 Práce s credentials do Bakalářů
- **Nikdy** neposílat credentials do klientského JS.
- Credentials jsou pouze na serveru v `config.php` s omezenými právy.
- Do logů **nesmí** být zapisována hlavička `Authorization` ani plaintext hesla.
- Doporučeno používat **servisní účet** s minimálními oprávněními.

### 4.2 Admin přihlášení (oddělené od Bakalářů)
- Admin přihlášení je nezávislé na účtu do Bakalářů.
- Admin uživatelé se ukládají v DB v tabulce `uzivatele` s hesly hashovanými **bcrypt/Argon2**.
- Admin část i stránka „Stav aplikace“ vyžadují:
  1) přihlášení,
  2) přístup z IP adresy na whitelistu.

### 4.3 Manuální spuštění importu
- Manuální import bude dostupný pouze v admin části.
- Ochrana: **whitelist IP + přihlášení**.
- Admin si vybere (checklist), co spustit:
  - Rozvrh (stálý)
  - Rozvrh (aktuální)
  - Parametry rozvrhu
  - Veřejné akce
  - Zaměstnanci

### 4.4 Auditní záznamy (pouze log soubory)
- Každé spuštění importu (auto/manual) se zaznamená do souborového logu.
- U manuálního spuštění se do logu uloží i **IP adresa**, datum a čas.

#### Doporučená přístupová práva (config a logy)

**Cíl:** logy ani konfigurace nesmí být stáhnutelné veřejně přes web; logy mají být čitelné serverem (pro „Stav aplikace“), a volitelně čitelné přes FTP (pouze pro správce).

- **`config.php`**:
  - umístění: v kořeni aplikace, ale **mimo public webroot** (doporučeno), nebo explicitně zakázat přístup pravidly webserveru.
  - práva: `chmod 600 config.php`
  - vlastník: uživatel aplikace (např. `www-data`) nebo správce; webserver musí mít právo čtení.

- **Adresář `logs/`**:
  - umístění: ideálně **mimo public webroot**; pokud je v rámci projektu, musí být blokovaný (viz níže).
  - práva: `chmod 750 logs/`
  - soubory: `chmod 640 logs/*.log`
  - vlastník: `www-data`
  - skupina: doporučeno vytvořit skupinu např. `logreaders` (nebo použít existující), do které bude zařazen FTP účet pro čtení.

- **FTP přístup**:
  - FTP uživatel pouze pro čtení logů: člen skupiny `logreaders`, bez práva zápisu do `logs/`.
  - Pokud FTP server neumí čisté read-only per adresář, řešit provozně (např. separátní účet, restrikce chroot a práva).

- **Blokace přístupu přes HTTP (pokud `logs/` leží v servírovaném stromu):**
  - Apache: v `logs/.htaccess`:

    ```apache
    Require all denied
    ```

  - Nginx (v konfiguraci serveru):

    ```nginx
    location ^~ /logs/ { deny all; }
    ```

- **Zobrazení v aplikaci:** stavová aplikace smí zobrazit pouze posledních N řádků (např. 200) a nikdy nenabízet přímé stažení logu přes HTTP.

---

## 5) Datový konektor Bakaláři – komunikace

### 5.1 Základní URL
Základní adresa konektoru se skládá z:

```
{base_url}{web_prefix}/if/2
```

- `web_prefix` může být prázdný řetězec.
- Pokud dotazy vrací 404, doplní se `web_prefix` dle reálné instalace (např. `/bakaweb`).

### 5.2 Hlavičky HTTP
- `Authorization: Basic <base64(username:password)>`
- `Accept: application/json`
- (při POST/PUT) `Content-Type: application/json`

### 5.3 Timeouty a retry
- Timeout pro request: např. 20 s
- Retry při dočasných chybách (timeout, 5xx): 2–3 pokusy s krátkým backoff
- Při 401/403 okamžitě fail (špatné credentials / oprávnění)

### 5.4 Logování chyb
- Chyby zapisovat do souborů v `logs/*.log`.
- Ve „Stavu aplikace“ umožnit zobrazit posledních N řádků logu a indikovat, zda poslední běh skončil chybou.

---

## 6) Importní procesy (CRON + manuál)

### 6.1 Periodické importy
- **Rozvrhy + parametry rozvrhu + veřejné akce:** periodicky (doporučeno denně v noci + možnost spouštět častěji dle potřeby).

**Příklad CRON (denně 02:10):**

```cron
10 2 * * * /usr/bin/php /var/www/app/cli/import.php --timetable --events >> /var/www/app/logs/cron.log 2>&1
```

### 6.2 Manuální import (admin)
- Admin spustí import dle checklistu.
- Výsledek se zobrazí v admin UI (souhrn) a uloží do souborového logu.

### 6.3 Výpočet „aktuální týden“ a „příští týden“
- **Aktuální týden:** použít datum pondělí aktuálního týdne.
- **Příští týden:** použít datum následujícího pondělí.

> Je nutné otestovat chování API: zda odpověď obsahuje celý týden nebo pouze konkrétní den. Aplikace musí umět pracovat s oběma variantami:
> - pokud API vrátí více dní, UI vyfiltruje podle `DayIndex`.
> - pokud API vrátí pouze 1 den, import opakuje dotaz pro Po–Pá (5 dotazů).

---

## 7) Datové entity a databázové schéma (MySQL)

### 7.1 Nastavení databáze
- Kódování: `utf8mb4`
- Kolace: `utf8mb4_czech_ci`

### 7.2 Tabulka `nastaveni`
Ukládá parametry rozvrhu (hodiny) jako JSON.

```sql
CREATE TABLE nastaveni (
  zaznam_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  typ VARCHAR(64) NOT NULL UNIQUE COMMENT 'např. vyucovaci-hodiny',
  parametry JSON NOT NULL COMMENT 'Parametry rozvrhu ve formátu JSON',
  zmeneno_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_czech_ci;
```

### 7.3 Tabulka `akce`
Ukládá veřejné akce. `times_json` obsahuje celé pole `Times`. `datum_od`/`datum_do` jsou obalový rozsah: **min(From)** a **max(To)**.

```sql
CREATE TABLE akce (
  akce_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  external_id VARCHAR(32) NOT NULL COMMENT 'Event.Id z Bakalářů',
  nazev VARCHAR(255) NOT NULL COMMENT 'Event.Title',
  popis TEXT NULL COMMENT 'Event.Description',
  datum_od DATETIME NOT NULL COMMENT 'min(Times[].From)',
  datum_do DATETIME NOT NULL COMMENT 'max(Times[].To)',
  times_json JSON NOT NULL COMMENT 'Celé Times z API',
  zmeneno_at DATETIME NULL COMMENT 'Volitelně dle DateChanged, pokud bude použito',
  stazeno_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_akce_external (external_id),
  INDEX idx_akce_oddo (datum_od, datum_do)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_czech_ci;
```

### 7.4 Tabulka `rozvrhove_akce`
Ukládá rozvrhové buňky. Jedno políčko může mít více „atomů“ (dělené hodiny), proto je zde `atom_poradi`.

> Pozn.: Zatím se neukládají `Cycles` ani ID entit (ClassId/TeacherId/RoomId/SubjectId).

```sql
CREATE TABLE rozvrhove_akce (
  bunka_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,

  -- Identifikace kontextu
  typ_rozvrhu ENUM('Permanent','Actual') NOT NULL COMMENT 'Type z API',
  datum_kontextu DATE NOT NULL COMMENT 'Datum použité v parametru date=',
  den_index TINYINT UNSIGNED NOT NULL COMMENT 'DayIndex (0=Po...)',
  hodina_index TINYINT UNSIGNED NOT NULL COMMENT 'HourIndex',
  atom_poradi TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Pořadí atomu v rámci buňky',

  -- Obsah buňky (textové zkratky/názvy)
  trida VARCHAR(32) NOT NULL COMMENT 'Class.Abbrev',
  skupina VARCHAR(64) NULL COMMENT 'Group.Abbrev',
  predmet VARCHAR(32) NULL COMMENT 'Subject.Abbrev',
  predmet_cely VARCHAR(255) NULL COMMENT 'Subject.Name',
  vyucujici VARCHAR(64) NULL COMMENT 'Teacher.Abbrev',
  vyucujici_cely VARCHAR(255) NULL COMMENT 'Teacher.Name',
  mistnost VARCHAR(64) NULL COMMENT 'Room.Abbrev',

  stazeno_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Unikátní klíč pro idempotentní import bez ID entit
  UNIQUE KEY uq_bunka_atom (trida, typ_rozvrhu, datum_kontextu, den_index, hodina_index, atom_poradi),
  INDEX idx_rozvrh_vyber (trida, typ_rozvrhu, datum_kontextu),
  INDEX idx_rozvrh_den_hod (trida, typ_rozvrhu, datum_kontextu, den_index, hodina_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_czech_ci;
```

### 7.5 Tabulka `zamestnanci`
Část polí se doplňuje ručně.

```sql
CREATE TABLE zamestnanci (
  zamestnanec_id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT 'Staff.ID z Bakalářů',
  jmeno VARCHAR(128) NOT NULL COMMENT 'Staff.FirstName',
  prijmeni VARCHAR(128) NOT NULL COMMENT 'Staff.LastName',
  titul VARCHAR(64) NULL COMMENT 'Staff.Title',
  email VARCHAR(255) NULL COMMENT 'Staff.Email',

  telefon VARCHAR(64) NULL COMMENT 'ručně',
  role VARCHAR(128) NULL COMMENT 'ručně',
  konzultace TEXT NULL COMMENT 'ručně',

  deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Staff.Deleted',
  zmena DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'časové razítko'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_czech_ci;
```

### 7.6 Tabulka `uzivatele`
Uživatelské účty pro přihlášení do administrace.

```sql
CREATE TABLE uzivatele (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  uzivatel VARCHAR(64) NOT NULL UNIQUE,
  heslo_hash VARCHAR(255) NOT NULL,
  aktivni TINYINT(1) NOT NULL DEFAULT 1,
  vytvoreno_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  posledni_prihlaseni DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_czech_ci;
```

---

## 8) End-pointy a příklady komunikace (JSON)

> Následující příklady jsou **vzorové** (ilustrativní) a odpovídají struktuře dat dle dokumentace konektoru.

### 8.1 Parametry rozvrhu
**Request**

```http
GET {base_url}{web_prefix}/if/2/timetable/parameters
Accept: application/json
Authorization: Basic ...
```

**Vzorová odpověď (zkráceně)**

```json
{
  "MessageType": "TimeTable.Parameters",
  "HourDefinitions": [
    {"Caption": "1", "BeginTime": "8:00", "EndTime": "8:45"},
    {"Caption": "2", "BeginTime": "9:00", "EndTime": "9:45"}
  ]
}
```

Uložení:
- `nastaveni.typ = 'vyucovaci-hodiny'`
- `nastaveni.parametry = celé HourDefinitions jako JSON`

### 8.2 Stálý rozvrh všech tříd
**Request**

```http
GET {base_url}{web_prefix}/if/2/timetable/permanent/classes?date=YYYYMMDD
Accept: application/json
Authorization: Basic ...
```

**Vzorová odpověď (zkráceně)**

```json
{
  "MessageType": "TimeTables.Data",
  "Type": "Permanent",
  "TargetType": "Classes",
  "Timetables": [
    {
      "Entity": {"Id": "00", "Abbrev": "4.A", "Name": "Čtvrtá A"},
      "Cells": [
        {
          "DayIndex": 0,
          "HourIndex": 1,
          "Atoms": [
            {
              "Class": {"Abbrev": "4.A"},
              "Group": {"Abbrev": "celá"},
              "Subject": {"Abbrev": "MAT", "Name": "Matematika"},
              "Teacher": {"Abbrev": "Nov", "Name": "Novák Jan"},
              "Room": {"Abbrev": "U1"}
            }
          ]
        }
      ]
    }
  ]
}
```

Uložení do `rozvrhove_akce`:
- `typ_rozvrhu = 'Permanent'`
- `datum_kontextu = date` (pondělí týdne)
- pro každou `Cell`:
  - `den_index = DayIndex`, `hodina_index = HourIndex`
  - pro každý `Atom` vytvořit záznam s `atom_poradi = 1..N`
  - mapovat textová pole: `trida/skupina/predmet/predmet_cely/vyucujici/vyucujici_cely/mistnost`

### 8.3 Aktuální rozvrh všech tříd
Stejná struktura jako stálý rozvrh, pouze endpoint a `Type=Actual`.

**Request**

```http
GET {base_url}{web_prefix}/if/2/timetable/actual/classes?date=YYYYMMDD
Accept: application/json
Authorization: Basic ...
```

### 8.4 Veřejné akce
**Request**

```http
GET {base_url}{web_prefix}/if/2/events/public?From=YYYYMMDD&To=YYYYMMDD
Accept: application/json
Authorization: Basic ...
```

**Vzorová odpověď (zkráceně)**

```json
{
  "MessageType": "Events.Public",
  "Events": [
    {
      "Id": "PEUGP",
      "Title": "Třídní schůzky",
      "Description": "Informace o prospěchu a chování",
      "Times": {
        "DateTimeInterval": [
          {"From": "20170518 000000", "To": "20170518 235900"},
          {"From": "20170519 000000", "To": "20170519 120000"}
        ]
      }
    }
  ]
}
```

Uložení do `akce`:
- `external_id = Id`
- `nazev = Title`
- `popis = Description`
- `times_json = celé Times`
- `datum_od = minimum všech Times.DateTimeInterval[].From`
- `datum_do = maximum všech Times.DateTimeInterval[].To`

### 8.5 Zaměstnanci
**Request**

```http
GET {base_url}{web_prefix}/if/2/common/staff
Accept: application/json
Authorization: Basic ...
```

**Vzorová odpověď (zkráceně)**

```json
{
  "MessageType": "Common.Staff",
  "Staff": [
    {
      "ID": "U11XT",
      "FirstName": "Jindra",
      "LastName": "Kučabová",
      "Title": "Mgr.",
      "Email": "kuc.jin@zskrpalkov.cz",
      "Deleted": false
    }
  ]
}
```

Import pravidla:
- zpracovat pouze `Deleted=false`
- ukládat pouze: ID, FirstName, LastName, Title, Email
- ruční pole (telefon, role, konzultace) **nesmí** být přepsána importem

---

## 9) UI požadavky (dle screenshotů)

### 9.1 Navigace
- Záložky: **Rozvrh hodin**, **Kalendář akcí**, **Konzultační hodiny**, **Kontakty**

### 9.2 Rozvrh hodin
- výběr třídy (dropdown)
- přepínač: **Stálý / Aktuální týden / Příští týden**
- zobrazení mřížky Po–Pá vs hodiny
- klik na buňku → detail (modal)

**Pozn.:** Zobrazení „Změna v rozvrhu / Odpadá“ se v této fázi **skrývá**.

### 9.3 Kalendář akcí
- měsíční přehled (případně týdenní/denní)
- klik na položku → detail akce (název, popis, termíny)

### 9.4 Konzultační hodiny / Kontakty
- čtení z tabulky `zamestnanci`
- zobrazení: titul, jméno, příjmení, email, telefon, role, konzultace

---

## 10) Admin část

### 10.1 Přihlášení
- formulář login
- session cookies
- kontrola IP whitelistu

### 10.2 Manuální import
- checklist: co spustit
- tlačítko „Spustit import“
- výpis výsledků (počty záznamů, doba běhu)
- zápis do souborového logu (včetně typu spuštění a IP adresy)

### 10.3 Stav aplikace
Stránka dostupná v admin části, zobrazuje minimálně:
- stav DB připojení
- informace o posledním importu (dle logu):
  - datum a čas
  - typ běhu (auto/manual)
  - u manual IP adresa
  - výsledek (OK/ERROR) + HTTP kód, pokud relevantní
- posledních N řádků jednotlivých logů (např. 200)

**Bezpečnost:** přístup pouze po přihlášení + z IP whitelistu.

---

## 11) Logování (pouze souborové)

### 11.1 Souborové logy

- Obsah souborů nesmí být veřejně dostupný přes HTTP (logy nejsou v public webrootu nebo jsou blokované pravidly web serveru).
- Ve „Stavu aplikace“ (admin) lze zobrazit pouze posledních N řádků jednotlivých logů (např. 200).

Doporučené soubory:
- `logs/import_timetable.log`
- `logs/import_events.log`
- `logs/import_staff.log`
- `logs/app_error.log`

### 11.2 Formát logu importu
Každý běh zapíše minimálně:
- datum a čas
- typ běhu (auto/manual)
- u manual IP adresa
- typ importu (timetable_permanent / timetable_actual / timetable_params / events / staff)
- výsledek (OK/ERROR)
- HTTP kód (pokud relevantní)
- počty záznamů (uložené/aktualizované)
- zkrácenou chybovou zprávu (pokud nastala)

**Příklad řádku:**

```text
2026-02-15 02:10:03 | auto | events | OK | http=200 | upsert=42
2026-02-15 02:10:21 | manual ip=1.2.3.4 | timetable_actual | ERROR | http=404 | msg=Not found (check web_prefix)
```

---

## 12) Akceptační kritéria

### 12.1 Funkční
- Aplikace zobrazí rozvrh pro vybranou třídu ve 3 režimech (Stálý/Aktuální/Příští) a data odpovídají uloženým záznamům.
- Aplikace zobrazí veřejné akce v kalendáři v rozsahu školního roku.
- Aplikace zobrazí zaměstnance a ruční pole zůstávají zachována po importu.
- Admin může spustit manuální import (po přihlášení a z IP whitelistu).
- Stránka „Stav aplikace“ v adminu zobrazuje stav DB a posledních N řádků logů.

### 12.2 Nefunkční
- Responzivní UI (mobilní zařízení)
- Importy jsou idempotentní (opakovaný běh nevytváří duplicity díky `uq_bunka_atom` a `uq_akce_external`).
- Credentials do Bakalářů nejsou nikdy vystaveny klientovi ani logům.

---

## 13) Testovací scénáře (základ)

1) **Rozvrh – stálý**: spustit import, ověřit počet záznamů, zobrazit v UI.
2) **Rozvrh – aktuální**: spustit import pro pondělí, zobrazit v UI.
3) **Příští týden**: ověřit chování API (1 den vs více dní). Pokud 1 den, ověřit, že import doplní Po–Pá.
4) **Akce**: import rozsahu školního roku, ověřit `datum_od/do` jako obalový rozsah.
5) **Zaměstnanci**: import, ručně doplnit telefon/konzultace, spustit import znovu a ověřit, že ruční data zůstala.
6) **Admin bezpečnost**: z ne-whitelist IP zkusit admin – musí odmítnout.
7) **Logy**: vynutit chybu (špatná URL/prefix) a ověřit zápis do logu a zobrazení posledních řádků ve „Stavu aplikace“.

---

## 14) Poznámky k implementaci importu (doporučení)

### 14.1 Idempotentní upsert – rozvrh
- Importuje se po třídách z odpovědi `Timetables[]`.
- Pro každou buňku (`Cell`) a atom (`Atoms[]`) se vytvoří klíč:
  - `(trida, typ_rozvrhu, datum_kontextu, den_index, hodina_index, atom_poradi)`
- Použít `INSERT ... ON DUPLICATE KEY UPDATE ...`.

### 14.2 Čištění starých dat
- Po úspěšném importu rozvrhu lze smazat staré záznamy pro daný `typ_rozvrhu` a `datum_kontextu` před vložením, nebo použít upsert a následně odmazat neaktuální (pokročilejší).

### 14.3 Import akcí
- Upsert podle `external_id`.
- Přepočet `datum_od/do` vždy z `Times` (obalový rozsah).

---
