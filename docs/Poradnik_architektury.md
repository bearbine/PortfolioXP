# Poradnik architektury

Dokument opisuje strukturę projektu **PortfolioXP** oraz podział odpowiedzialności między frontend, backend, bazę danych i zasoby statyczne.

## Założenie projektu

**PortfolioXP** jest aplikacją webową stylizowaną na klasyczne środowisko desktopowe. Projekt nie działa jak zwykła strona portfolio z przewijanymi sekcjami, tylko jako interaktywny pulpit z ekranem startowym, logowaniem, oknami, paskiem zadań, menu Start i aplikacjami.

Architektura projektu jest podzielona na kilka głównych części:

| Warstwa | Rola |
|---|---|
| Frontend | Interfejs użytkownika, pulpit, okna, aplikacje i obsługa stanu po stronie przeglądarki. |
| Backend | API, autoryzacja, sesja, role użytkowników i komunikacja z bazą danych. |
| Baza danych | Użytkownicy, kody autoryzacyjne i logi audytu. |
| Assets | Ikony, tapety, dźwięki, kursory i elementy graficzne interfejsu. |

Szczegóły poszczególnych części są opisane w osobnych poradnikach:

- [Poradnik autoryzacji](./Poradnik_autoryzacji.md);
- [Poradnik bazy danych](./Poradnik_bazy_danych.md);
- [Poradnik API](./Poradnik_api.md);
- [Poradnik stanu aplikacji](./Poradnik_stanu_aplikacji.md);
- [Poradnik Dockera](./Poradnik_dockera.md).

## Struktura katalogów

```text
portfolio-xp/
├── assets/
│   ├── dzwieki/
│   ├── ekran_startowy/
│   ├── ikony/
│   ├── interfejs/
│   │   ├── menu_start/
│   │   ├── pasek_zadan/
│   │   └── zasilanie/
│   ├── kursory/
│   ├── logowanie/
│   └── tapety/
│
├── docs/
│   ├── Poradnik_uruchomienia.md
│   ├── Poradnik_architektury.md
│   ├── Poradnik_autoryzacji.md
│   ├── Poradnik_bazy_danych.md
│   ├── Poradnik_api.md
│   ├── Poradnik_dockera.md
│   └── Poradnik_stanu_aplikacji.md
│
├── server/
│   ├── audyt/
│   ├── baza_danych/
│   └── trasy/
│
├── src/
│   ├── aplikacje/
│   ├── interfejs/
│   ├── konfiguracja/
│   ├── rdzen/
│   ├── stan/
│   └── style/
│
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
├── README.md
└── CHANGELOG.md
```

## Frontend

Frontend znajduje się w katalogu `src/`. Odpowiada za warstwę wizualną projektu oraz zachowanie pulpitu w przeglądarce.

| Katalog | Zawartość |
|---|---|
| `src/aplikacje/` | Aplikacje uruchamiane z pulpitu i menu Start. |
| `src/interfejs/` | Boot screen, ekran logowania, pasek zadań, tray, menu Start i okna. |
| `src/konfiguracja/` | Konfiguracja systemu, aplikacji, profili, tekstów i assetów. |
| `src/rdzen/` | Główna logika uruchamiania środowiska desktopowego. |
| `src/stan/` | Stan aplikacji po stronie frontendu. |
| `src/style/` | Style CSS dla całego interfejsu. |

Frontend buduje środowisko pulpitu dynamicznie. Okna, aplikacje i elementy interfejsu są zarządzane przez JavaScript, a nie przez klasyczne przechodzenie między podstronami.

## Backend

Backend znajduje się w katalogu `server/` i działa na Node.js oraz Express.

| Katalog | Zawartość |
|---|---|
| `server/trasy/` | Endpointy API. |
| `server/baza_danych/` | Połączenie z MariaDB, migracje i seed danych. |
| `server/audyt/` | Obsługa logów bezpieczeństwa. |

Backend obsługuje logowanie, sesję, role, chronione endpointy i komunikację z bazą. Szczegóły endpointów są w [Poradniku API](./Poradnik_api.md).

## Baza danych

Projekt używa MariaDB. W architekturze baza jest odpowiedzialna za dane potrzebne do autoryzacji i audytu.

Tutaj nie rozpisuję tabel, migracji i seedów, bo to jest już opisane w [Poradniku bazy danych](./Poradnik_bazy_danych.md).

## Aplikacje pulpitu

Aplikacje są rejestrowane w konfiguracji i uruchamiane przez system okien.

Aktualnie projekt zawiera między innymi:

| Aplikacja | Rola |
|---|---|
| My Computer | Widok systemowy i informacje projektowe. |
| Internet Explorer | Lokalne strony portfolio i komunikaty. |
| Notepad | Prosty edytor tekstu. |
| Paint | Prosta aplikacja wizualna. |
| Control Panel | Widok ustawień i elementów systemowych. |
| Security Audit Viewer | Podgląd logów bezpieczeństwa z backendu. |

Część aplikacji może pełnić rolę wizualną albo demonstracyjną, jeżeli nie wymaga pełnej logiki biznesowej.

## Assety

Assety znajdują się w katalogu `assets/`.

| Katalog | Zawartość |
|---|---|
| `assets/ikony/` | Ikony aplikacji i pulpitu. |
| `assets/tapety/` | Tapety pulpitu. |
| `assets/kursory/` | Kursory interfejsu. |
| `assets/dzwieki/` | Dźwięki systemowe. |
| `assets/logowanie/` | Grafiki ekranu logowania. |
| `assets/ekran_startowy/` | Elementy boot screena. |
| `assets/interfejs/` | Elementy graficzne menu Start, paska zadań i zasilania. |

Główna mapa assetów:

```text
src/konfiguracja/assets.js
```

## Konfiguracja

Główna konfiguracja frontendu znajduje się w:

```text
src/konfiguracja/
```

To dobre miejsce do zmian typu nazwa projektu, teksty boot screena, lista aplikacji, ikony, tapety, profile logowania i podstawowe dane widoczne w UI.

## System okien

Projekt posiada własny system okien działający po stronie frontendu.

System odpowiada za:

- otwieranie aplikacji;
- zamykanie okien;
- minimalizowanie;
- aktywne okno;
- pozycję okien;
- przyciski na pasku zadań.

Dzięki temu aplikacje działają wewnątrz jednego pulpitu, bez przeładowywania strony.

## Pasek zadań i menu Start

Pasek zadań zawiera przycisk Start, przyciski aktywnych okien, tray oraz zegar.

Menu Start służy jako główny punkt uruchamiania aplikacji i akcji systemowych.

Tray został zostawiony jako `tray`, ponieważ w tym kontekście jest to bardziej naturalna i czytelna nazwa niż sztuczne tłumaczenie.

## Style CSS

Style znajdują się w:

```text
src/style/
```

Projekt używa prostych klas `kebab-case`, na przykład:

```text
pasek-zadan
menu-start
ekran-logowania
xp-window
tray-popup
```

Stare nazewnictwo typu `blok__element--wariant` zostało usunięte z głównych elementów interfejsu, ponieważ utrudniało utrzymanie i powodowało łatwe pomyłki między klasami w JS i CSS.

Klasy stanu zostają po angielsku:

```text
is-active
is-visible
is-open
is-minimized
is-maximized
```

## Stan aplikacji

Stan frontendu jest opisany osobno w [Poradniku stanu aplikacji](./Poradnik_stanu_aplikacji.md). W tym miejscu wystarczy założyć prosty podział: wygląd i stan UI są po stronie frontendu, a sesja i dostęp do danych są sprawdzane przez backend.

## Docker i build

Projekt można uruchomić przez Docker Compose. W tym trybie działają serwisy `app` i `mariadb`.

Build frontendu wykonuje Vite:

```powershell
npm run build
```

Po zbudowaniu powstaje katalog:

```text
dist/
```

Szczegóły uruchamiania są w [Poradniku uruchomienia](./Poradnik_uruchomienia.md), a opis Docker Compose w [Poradniku Dockera](./Poradnik_dockera.md).

## Jak pracować z projektem

Najprostszy podział pracy:

```text
src/      -> frontend i interfejs
server/   -> backend, API i baza danych
assets/   -> grafika, dźwięki i pliki wizualne
docs/     -> dokumentacja
```

Przy zmianach wyglądu najczęściej używane będą:

```text
src/interfejs/
src/style/
src/konfiguracja/
assets/
```

Przy zmianach API, logowania lub bazy danych:

```text
server/
src/klientApi/
```

Przy zmianach aplikacji pulpitu:

```text
src/aplikacje/
src/konfiguracja/
assets/ikony/
```

## Podsumowanie

Architektura PortfolioXP jest podzielona tak, żeby oddzielić interfejs, logikę serwera, bazę danych i zasoby statyczne.

Taki podział ułatwia dalszy rozwój projektu, bo zmiany w wyglądzie pulpitu nie mieszają się bezpośrednio z logiką backendu, a konfiguracja najważniejszych elementów jest trzymana w osobnych plikach.
