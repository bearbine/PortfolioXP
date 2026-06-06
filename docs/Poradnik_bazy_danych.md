# Poradnik bazy danych

Ten dokument opisuje bazę danych w projekcie **PortfolioXP**.

Baza nie jest duża, ale jest ważna, bo obsługuje logowanie, kody autoryzacyjne i logi bezpieczeństwa. Flow logowania jest opisany w [Poradniku autoryzacji](./Poradnik_autoryzacji.md), a endpointy w [Poradniku API](./Poradnik_api.md).

## Technologia

Projekt używa bazy danych **MariaDB**.

Domyślna nazwa bazy:

```text
portfolio_xp
```

Połączenie z bazą jest obsługiwane przez backend Node.js przy użyciu biblioteki `mysql2/promise`.

Najważniejsze pliki związane z bazą danych:

```text
server/baza_danych/connection.js
server/baza_danych/migrate.js
server/baza_danych/schema.sql
server/baza_danych/seed.js
server/baza_danych/repositories/
```

## Konfiguracja połączenia

Dane do połączenia z bazą są pobierane z pliku `.env` albo `docker.env`.

Przykład lokalny:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=portfolio_xp
DB_USER=xp_user
DB_PASSWORD=xp_password
```

W Dockerze aplikacja łączy się z bazą po nazwie serwisu:

```env
DB_HOST=mariadb
```

Więcej o konfiguracji kontenerów jest w [Poradniku Dockera](./Poradnik_dockera.md).

## Struktura bazy

Aktualnie baza składa się z trzech głównych tabel:

```text
users
auth_codes
audit_logs
```

Każda tabela ma konkretną rolę i nie ma tutaj tabel dodanych tylko „na zapas”.

## Tabela `users`

Tabela `users` przechowuje konta użytkowników.

Najważniejsze pola:

| Pole | Opis |
|---|---|
| `id` | Techniczne ID użytkownika w bazie. |
| `username` | Nazwa wyświetlana w interfejsie. |
| `login` | Techniczny login użytkownika. Musi być unikalny. |
| `password_hash` | Zahashowane hasło. |
| `password_required` | Informacja, czy konto wymaga hasła. |
| `role` | Rola użytkownika: `admin` albo `user`. |
| `avatar` | Identyfikator avatara profilu. |
| `created_at` | Data utworzenia konta. |
| `updated_at` | Data ostatniej aktualizacji konta. |

Hasło nie jest zapisywane w bazie jako zwykły tekst. Przed zapisem jest hashowane w backendzie.

## Role użytkowników

W bazie są używane dwie role:

```text
admin
user
```

`admin` ma dostęp do rzeczy administracyjnych, na przykład logów audytu. `user` jest zwykłym kontem użytkownika.

Role są zapisane w bazie jako `ENUM`, więc przypadkowe wartości nie powinny normalnie trafić do tabeli. W migracji jest też zabezpieczenie, które poprawia stare albo błędne role na `user`.

## Tabela `auth_codes`

Tabela `auth_codes` przechowuje jednorazowe kody autoryzacyjne używane podczas logowania.

Najważniejsze pola:

| Pole | Opis |
|---|---|
| `id` | Techniczne ID kodu. |
| `code_hash` | Hash kodu autoryzacyjnego. |
| `user_id` | Użytkownik, do którego należy kod. |
| `redirect_uri` | Adres powrotu, najczęściej `/auth/callback`. |
| `expires_at` | Data wygaśnięcia kodu. |
| `used_at` | Data użycia kodu. Jeżeli `NULL`, kod nie był jeszcze użyty. |
| `created_at` | Data utworzenia kodu. |

Kod autoryzacyjny nie jest trzymany w bazie jako czysty tekst. Do bazy trafia tylko jego hash.

Kod jest jednorazowy. Po użyciu dostaje wartość w polu `used_at`.

Czas ważności kodu ustawia zmienna:

```env
AUTH_CODE_EXPIRES_SECONDS=60
```

## Tabela `audit_logs`

Tabela `audit_logs` przechowuje logi bezpieczeństwa.

Najważniejsze pola:

| Pole | Opis |
|---|---|
| `id` | Techniczne ID logu. |
| `event_type` | Typ zdarzenia, np. `LOGIN_SUCCESS`. |
| `severity` | Poziom zdarzenia: `info`, `warning`, `critical`. |
| `user_id` | Użytkownik powiązany ze zdarzeniem, jeżeli jest znany. |
| `login_attempt` | Login albo profil użyty przy próbie logowania. |
| `ip_address` | Adres IP klienta. |
| `user_agent` | Informacja o przeglądarce. |
| `details` | Dodatkowe dane w formacie JSON. |
| `created_at` | Data utworzenia logu. |

Logi można podejrzeć w aplikacji **Security Audit Viewer**. Endpointy do audytu są opisane w [Poradniku API](./Poradnik_api.md).

## Relacje między tabelami

Relacje są proste:

```text
users
  ├── auth_codes
  └── audit_logs
```

Tabela `auth_codes` ma `user_id`, które wskazuje na `users.id`.

Jeżeli użytkownik zostanie usunięty, jego kody autoryzacyjne też są usuwane:

```text
ON DELETE CASCADE
```

Dla `audit_logs` działa inaczej. Jeżeli użytkownik zostanie usunięty, logi zostają, ale `user_id` zmienia się na `NULL`:

```text
ON DELETE SET NULL
```

To ma sens, bo logi audytu są historią zdarzeń i nie powinny znikać tylko dlatego, że konto zostało usunięte.

## Migracje

Migracje uruchamia plik:

```text
server/baza_danych/migrate.js
```

Główna struktura tabel jest zapisana w:

```text
server/baza_danych/schema.sql
```

Migracja tworzy tabele, jeżeli jeszcze ich nie ma, i pilnuje zgodności ról z aktualną wersją projektu.

## Seed danych startowych

Seed znajduje się w pliku:

```text
server/baza_danych/seed.js
```

Tworzone jest konto startowe używane na ekranie logowania. Dane do zwykłego uruchomienia są podane w [Poradniku uruchomienia](./Poradnik_uruchomienia.md).

Seed używa transakcji. Jeżeli coś pójdzie źle podczas przygotowania konta startowego, zmiany są cofane i baza nie zostaje w połowie przerobiona.

## Reset użytkowników przy starcie

Projekt może resetować użytkowników przy starcie aplikacji.

Odpowiada za to zmienna:

```env
RESET_USERS_ON_INIT=true
```

Jeżeli jest ustawiona na `true`, seed czyści:

```text
auth_codes
users
```

i tworzy konto startowe od nowa.

To jest normalne dla tego projektu, bo PortfolioXP jest środowiskiem testowym. Po restarcie aplikacja może wrócić do czystego stanu bez przypadkowych kont utworzonych wcześniej.

Jeżeli kiedyś konta mają zostać między restartami, trzeba ustawić:

```env
RESET_USERS_ON_INIT=false
```

## Kiedy baza jest przygotowywana

Baza jest przygotowywana przy starcie serwera.

W `server/server.js` wykonywane są migracje i seed. Można też zrobić to ręcznie komendą:

```powershell
npm run init-db
```

Osobne komendy:

```powershell
npm run db:migrate
npm run db:seed
```

## Repository pattern

Dostęp do tabel jest podzielony na repository:

```text
server/baza_danych/repositories/usersRepository.js
server/baza_danych/repositories/authCodesRepository.js
server/baza_danych/repositories/auditLogsRepository.js
```

| Repository | Do czego służy |
|---|---|
| `usersRepository.js` | Szukanie użytkowników, tworzenie kont, lista profili logowania. |
| `authCodesRepository.js` | Tworzenie, sprawdzanie i oznaczanie kodów autoryzacyjnych. |
| `auditLogsRepository.js` | Zapisywanie i pobieranie logów audytu. |

Dzięki temu endpointy nie muszą pisać całych zapytań SQL w każdym miejscu.

## Hasła

Hasła użytkowników są hashowane przed zapisem do bazy.

Za obsługę haseł odpowiada:

```text
server/passwords.js
```

W konfiguracji można ustawić liczbę rund bcrypt:

```env
BCRYPT_ROUNDS=12
```

Jeżeli zmienna nie jest ustawiona, backend używa domyślnej wartości `12`.

## Baza w Dockerze

W Dockerze baza działa jako osobny serwis `mariadb`, a dane są trzymane w wolumenie.

Szczegóły portów, wolumenu i komend Docker Compose są w [Poradniku Dockera](./Poradnik_dockera.md).

## Na co uważać

Nie należy ręcznie zmieniać nazw tabel, pól albo ról bez aktualizacji kodu backendu.

Najbardziej wrażliwe miejsca:

```text
users.role
users.login
users.password_hash
auth_codes.code_hash
auth_codes.used_at
audit_logs.details
```

Zmiana tych pól bez aktualizacji repository i endpointów może rozwalić logowanie albo audyt.

Do sprawdzania, czy autoryzacja nadal działa, można użyć:

```powershell
npm run test:auth
```
