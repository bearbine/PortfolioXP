# Poradnik API

Ten dokument opisuje API w projekcie **PortfolioXP**.

Nie jest to pełny Swagger, tylko opis tego, jakie endpointy są w projekcie, do czego służą i jak frontend z nich korzysta.

API działa po stronie backendu Express i jest dostępne pod prefiksem:

```text
/api/
```

Pełny flow logowania jest opisany w [Poradniku autoryzacji](./Poradnik_autoryzacji.md). Tutaj skupiam się głównie na samych endpointach.

## Gdzie znajduje się API

Najważniejsze pliki backendu:

```text
server/server.js
server/trasy/auth.js
server/trasy/protected.js
server/trasy/admin.js
server/authMiddleware.js
server/csrf.js
server/tokens.js
server/audyt/
server/baza_danych/
```

Po stronie frontendu komunikacja z API jest głównie w:

```text
src/rdzen/authService.js
src/klientApi/
```

Frontend nie odwołuje się do bazy bezpośrednio. Wszystko, co dotyczy logowania, sesji, ról i audytu, przechodzi przez backend.

## Ogólny podział endpointów

| Grupa | Opis |
|---|---|
| `/api/health` | Prosty endpoint do sprawdzenia, czy backend działa. |
| `/api/auth/*` | Logowanie, rejestracja, CSRF, sesja i wylogowanie. |
| `/api/protected/*` | Endpointy wymagające zalogowanego użytkownika. |
| `/api/admin/*` | Endpointy tylko dla administratora. |

Dla endpointów API ustawione jest `Cache-Control: no-store`, więc przeglądarka nie powinna zapisywać odpowiedzi z sesją albo autoryzacją w cache.

## Health check

```http
GET /api/health
```

Endpoint sprawdza, czy backend działa.

Przykładowa odpowiedź:

```json
{
  "ok": true,
  "service": "portfolio-xp",
  "database": "mariadb"
}
```

Nie wymaga logowania.

## CSRF

```http
GET /api/auth/csrf
```

Endpoint wydaje token CSRF. Backend ustawia cookie CSRF i zwraca token w odpowiedzi.

Frontend wysyła token w nagłówku:

```text
X-CSRF-Token
```

CSRF jest używany głównie przy:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/token
POST /api/auth/logout
```

Jeżeli token jest błędny albo go brakuje, backend może zwrócić `invalid_csrf`.

## Profile logowania

```http
GET /api/auth/profiles
```

Endpoint zwraca profile widoczne na ekranie logowania.

To nie jest pełna lista danych z tabeli `users`. Backend nie zwraca hasha hasła ani technicznych pól, które nie są potrzebne w UI.

Przykładowa odpowiedź ma postać:

```json
{
  "users": [
    {
      "id": "profile-...",
      "displayName": "...",
      "roleLabel": "...",
      "avatarId": "...",
      "passwordRequired": true
    }
  ]
}
```

## Rejestracja

```http
POST /api/auth/register
```

Endpoint tworzy nowe konto użytkownika.

Wymaga:

```text
CSRF
rate limit
```

Przykładowe body:

```json
{
  "username": "User",
  "login": "user",
  "password": "pass1234",
  "passwordRequired": true,
  "avatarId": "guest"
}
```

Backend sprawdza dane, normalizuje login, hashuje hasło i tworzy konto z rolą `user`.

Możliwe odpowiedzi:

| Status | Znaczenie |
|---|---|
| `201` | Konto utworzone. |
| `400` | Błędne dane wejściowe. |
| `409` | Login jest już zajęty. |
| `429` | Za dużo prób. |

Jeżeli w projekcie jest ustawione `RESET_USERS_ON_INIT=true`, konta utworzone w trakcie działania aplikacji mogą zniknąć po restarcie serwera. Szczegóły są w [Poradniku bazy danych](./Poradnik_bazy_danych.md).

## Logowanie

```http
POST /api/auth/login
```

Ten endpoint nie tworzy jeszcze końcowej sesji. On tylko sprawdza dane logowania i tworzy jednorazowy authorization code.

Wymaga:

```text
CSRF
rate limit
```

Logowanie może iść po profilu z ekranu logowania albo po loginie technicznym.

Backend sprawdza:

- CSRF;
- limit prób;
- użytkownika w bazie;
- hasło;
- rolę użytkownika.

Jeżeli dane są poprawne, backend generuje authorization code i zwraca adres callbacka:

```json
{
  "redirectTo": "/auth/callback?code=...",
  "expiresAt": "..."
}
```

Ważne: po `/api/auth/login` użytkownik nie jest jeszcze w pełni zalogowany. Sesja powstaje dopiero po wymianie kodu na token.

## Callback i token

```http
POST /api/auth/token
```

Po poprawnym `/api/auth/login` frontend przechodzi na `/auth/callback?code=...`, bierze kod z adresu i wysyła go do backendu.

Przykładowe body:

```json
{
  "code": "..."
}
```

Backend wtedy:

- sprawdza CSRF;
- sprawdza format kodu;
- szuka kodu w tabeli `auth_codes`;
- sprawdza, czy kod nie wygasł;
- sprawdza, czy kod nie był już użyty;
- oznacza kod jako użyty;
- tworzy JWT;
- ustawia cookie sesji.

Cookie sesji:

```text
xp_auth
```

Najważniejsze ustawienia cookie:

```text
httpOnly
sameSite=lax
```

Dzięki temu frontend nie musi trzymać JWT w `localStorage`. Sesja działa przez cookie, które przeglądarka dołącza do kolejnych żądań.

## Aktualny użytkownik

```http
GET /api/auth/me
```

Endpoint sprawdza aktualną sesję użytkownika.

Frontend używa go między innymi:

- po wejściu na `/desktop`;
- po odświeżeniu strony;
- po powrocie do karty przeglądarki;
- przy sprawdzaniu, czy sesja nadal jest ważna.

Jeżeli sesja jest poprawna, backend zwraca użytkownika.

Jeżeli sesji nie ma albo token jest błędny, backend zwraca błąd typu:

```text
missing_token
invalid_token
expired_token
```

## Wylogowanie

```http
POST /api/auth/logout
```

Endpoint czyści cookie sesji. Wymaga CSRF.

Po stronie frontendu wylogowanie czyści lokalny stan użytkownika i przenosi go na ekran logowania.

Przykładowa odpowiedź:

```json
{
  "ok": true
}
```

## Endpoint chroniony

```http
GET /api/protected/admin
```

To przykładowy endpoint wymagający roli `admin`.

Backend najpierw sprawdza, czy użytkownik jest zalogowany, a potem czy ma odpowiednią rolę.

Możliwe sytuacje:

| Sytuacja | Odpowiedź |
|---|---|
| Brak tokenu | `401` |
| Błędny token | `401` |
| Zwykły użytkownik | `403` |
| Administrator | Dostęp przyznany |

## Endpointy administracyjne

Endpointy `/api/admin/*` są dostępne tylko dla administratora.

Najważniejszy endpoint:

```http
GET /api/admin/audit-logs
```

Zwraca logi audytu bezpieczeństwa.

Obsługiwane parametry query:

```text
limit
offset
eventType
severity
```

Przykład:

```http
GET /api/admin/audit-logs?limit=20
```

Ten endpoint jest używany między innymi przez aplikację **Security Audit Viewer**.

## Middleware autoryzacji

Chronione endpointy korzystają z middleware z pliku:

```text
server/authMiddleware.js
```

Middleware pobiera token z cookie `xp_auth` albo z nagłówka `Authorization: Bearer ...`. Potem backend sprawdza JWT, pobiera użytkownika z bazy i dopiero wtedy dopuszcza request dalej.

To jest ważne, bo sam token nie powinien wystarczyć, jeżeli użytkownik został usunięty z bazy albo ma już inną rolę.

## Rate limit

Endpointy autoryzacji mają ograniczenie liczby prób.

W projekcie są limity między innymi dla:

```text
login
register
token
```

Rate limit jest trzymany w pamięci serwera, więc po restarcie aplikacji licznik się zeruje. Do tego projektu to wystarcza.

## Audit log

Backend zapisuje ważne zdarzenia do tabeli `audit_logs`.

Do logów mogą trafiać między innymi:

```text
LOGIN_SUCCESS
LOGIN_FAILED
REGISTER_SUCCESS
REGISTER_FAILED
AUTH_CODE_ISSUED
AUTH_CODE_EXCHANGED
AUTH_CODE_REUSED_BLOCKED
AUTH_CODE_EXPIRED
AUTH_CODE_INVALID
LOGOUT
CSRF_INVALID
RATE_LIMIT_HIT
ADMIN_ACCESS_GRANTED
ADMIN_ACCESS_DENIED
```

Logi nie powinny przechowywać haseł, tokenów ani kodów autoryzacyjnych w czystej formie. Struktura tabeli audytu jest opisana w [Poradniku bazy danych](./Poradnik_bazy_danych.md).

## Jak frontend korzysta z API

Najważniejsza część komunikacji z autoryzacją jest zebrana w:

```text
src/rdzen/authService.js
```

Ten serwis obsługuje między innymi:

- pobranie CSRF;
- pobranie profili;
- logowanie;
- callback;
- wymianę kodu na token;
- sprawdzenie aktualnego użytkownika;
- wylogowanie;
- pobranie logów audytu dla admina.

Najważniejszy flow logowania wygląda tak:

```text
GET  /api/auth/profiles
GET  /api/auth/csrf
POST /api/auth/login
/auth/callback?code=...
POST /api/auth/token
GET  /api/auth/me
```

Dopiero po `/api/auth/token` powstaje właściwa sesja użytkownika.

## Testowanie API

Podstawowy test autoryzacji można uruchomić komendą:

```powershell
npm run test:auth
```

Test powinien sprawdzić najważniejsze elementy: CSRF, logowanie, authorization code, wymianę kodu na token, sesję i dostęp do chronionych endpointów.

Przed testem backend i baza danych muszą być poprawnie uruchomione.
