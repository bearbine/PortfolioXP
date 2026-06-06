# Poradnik uruchomienia

Ten poradnik pokazuje, jak szybko uruchomić projekt **PortfolioXP**.

Projekt można uruchomić na dwa sposoby: przez Docker albo lokalnie na własnym środowisku.

## Wymagania

Do uruchomienia projektu potrzebne są:

- Node.js;
- npm;
- Docker Desktop, jeżeli projekt ma być uruchamiany przez Docker;
- MariaDB, jeżeli projekt ma być uruchamiany lokalnie bez Dockera.

## Dwa sposoby uruchomienia

| Sposób | Dla kogo |
|---|---|
| Docker | Najprostszy wariant. Docker sam uruchamia aplikację i bazę danych. |
| Lokalnie | Wariant dla osób, które chcą samodzielnie skonfigurować środowisko. |

Więcej o samym Dockerze jest w [Poradniku Dockera](./Poradnik_dockera.md).  
Więcej o bazie danych jest w [Poradniku bazy danych](./Poradnik_bazy_danych.md).

## Wariant 1: Docker

Najprostszy sposób uruchomienia projektu:

```powershell
docker compose up --build
```

Po uruchomieniu aplikacja będzie dostępna pod adresem:

```text
http://127.0.0.1:4173
```

Aby zatrzymać projekt:

```powershell
docker compose down
```

Aby zatrzymać projekt i usunąć dane bazy:

```powershell
docker compose down -v
```

## Wariant 2: uruchomienie lokalne

Ten wariant wymaga lokalnie zainstalowanego Node.js, npm oraz MariaDB.

Najpierw zainstaluj zależności:

```powershell
npm ci
```

Utwórz plik `.env` na podstawie przykładu:

```powershell
Copy-Item .env.example .env
```

Po utworzeniu pliku `.env` trzeba zmienić wartość `JWT_SECRET`.

W pliku `.env.example` znajduje się przykładowa wartość:

```env
JWT_SECRET=change-this-to-a-long-random-secret
```

Nie należy zostawiać jej bez zmian. Backend celowo blokuje start aplikacji z takim domyślnym sekretem, ponieważ `JWT_SECRET` jest używany do podpisywania tokenów sesji.

Do lokalnego uruchomienia można wpisać dowolny dłuższy losowy tekst, na przykład:

```env
JWT_SECRET=portfolio-xp-local-dev-secret-93847592837459283745
```

Ważne jest tylko to, żeby nie używać domyślnej wartości z przykładu. W prawdziwym wdrożeniu sekret powinien być inny, długi i niepubliczny.

Przygotuj bazę danych:

```powershell
npm run init-db
```

Uruchom projekt:

```powershell
npm run dev
```

Po uruchomieniu aplikacja będzie dostępna pod adresem:

```text
http://127.0.0.1:4173
```

## Konto startowe

Po starcie projektu dostępne jest konto testowe:

```text
Profil: Roma
Hasło: admin
```

Szczegóły o tym, skąd bierze się konto startowe, są opisane w [Poradniku bazy danych](./Poradnik_bazy_danych.md).

## Podstawowe komendy

| Komenda | Opis |
|---|---|
| `npm run dev` | Uruchamia projekt lokalnie. |
| `npm run build` | Buduje wersję produkcyjną. |
| `npm run start` | Uruchamia serwer aplikacji. |
| `npm run init-db` | Przygotowuje bazę danych. |
| `docker compose up --build` | Uruchamia projekt przez Docker. |
| `docker compose down` | Zatrzymuje kontenery. |
| `docker compose down -v` | Zatrzymuje kontenery i usuwa dane bazy. |

## Uwagi

Plik `.env` służy do lokalnej konfiguracji projektu i nie powinien być dodawany do repozytorium.

Foldery `node_modules` oraz `dist` nie muszą być przechowywane w repozytorium. Można je odtworzyć przez instalację zależności i ponowne zbudowanie projektu.
