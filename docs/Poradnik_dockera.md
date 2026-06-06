# Poradnik Dockera

Ten dokument krótko opisuje, jak działa Docker w projekcie **PortfolioXP**.

Instrukcja szybkiego startu jest w [Poradniku uruchomienia](./Poradnik_uruchomienia.md). Tutaj jest tylko opis konfiguracji Dockera.

## Pliki Dockera

Najważniejsze pliki:

```text
Dockerfile
docker-compose.yml
docker.env
```

`Dockerfile` buduje aplikację Node.js.  
`docker-compose.yml` uruchamia aplikację oraz bazę danych.  
`docker.env` trzyma konfigurację używaną w kontenerze aplikacji.

## Serwisy

Projekt w Dockerze uruchamia dwa główne serwisy:

| Serwis | Opis |
|---|---|
| `app` | Backend Node.js oraz zbudowany frontend PortfolioXP. |
| `mariadb` | Baza danych MariaDB. |

Aplikacja łączy się z bazą przez nazwę serwisu:

```text
DB_HOST=mariadb
```

## Podstawowe komendy

Uruchomienie:

```powershell
docker compose up --build
```

Zatrzymanie:

```powershell
docker compose down
```

Zatrzymanie razem z usunięciem danych bazy:

```powershell
docker compose down -v
```

Po starcie projekt będzie dostępny pod adresem:

```text
http://127.0.0.1:4173
```

## Baza danych

W Dockerze baza używa domyślnie:

```text
DB_NAME=portfolio_xp
DB_USER=xp_user
DB_PASSWORD=xp_password
```

Dane MariaDB są trzymane w wolumenie:

```text
portfolio_xp_mariadb_data
```

Sama struktura bazy jest opisana w [Poradniku bazy danych](./Poradnik_bazy_danych.md).

## Porty

| Usługa | Port |
|---|---|
| Aplikacja | `4173` |
| MariaDB w kontenerze | `3306` |
| MariaDB na hoście | `3308` |

Port `3308` na hoście pozwala uniknąć konfliktu z lokalną MariaDB albo XAMPP działającym na `3306`.

## Logi

Podgląd wszystkich logów:

```powershell
docker compose logs -f
```

Logi aplikacji:

```powershell
docker compose logs -f app
```

Logi bazy danych:

```powershell
docker compose logs -f mariadb
```

## Ostrzeżenia MariaDB

Podczas startu MariaDB mogą pojawić się ostrzeżenia typu:

```text
io_uring_queue_init() failed with EPERM
O_TMPFILE is not supported on /tmp
```

Są one związane ze środowiskiem Docker Desktop, WSL albo systemem plików kontenera. Jeżeli MariaDB pokazuje `ready for connections`, baza działa poprawnie.

## Build aplikacji

W kontenerze aplikacja używa:

```powershell
npm ci
npm run build
npm run docker:start
```

`npm ci` instaluje zależności na podstawie `package-lock.json`.  
`npm run build` buduje frontend.  
`npm run docker:start` uruchamia serwer aplikacji.
