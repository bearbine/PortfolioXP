# Poradnik stanu aplikacji

Ten dokument opisuje, gdzie w projekcie **PortfolioXP** przechowywany jest stan aplikacji i za co odpowiada frontend, backend oraz przeglądarka.

Flow logowania jest opisany w [Poradniku autoryzacji](./Poradnik_autoryzacji.md). Ten plik skupia się bardziej na tym, co aplikacja pamięta i gdzie.

## Ogólna zasada

Stan aplikacji jest podzielony na dwie części:

| Miejsce | Rola |
|---|---|
| Frontend | Przechowuje stan interfejsu, okien, ustawień pulpitu i danych pomocniczych. |
| Backend | Potwierdza sesję użytkownika, role i dostęp do chronionych zasobów. |

Frontend może pamiętać wygląd pulpitu, ale nie powinien sam decydować, czy użytkownik jest naprawdę zalogowany. Od tego jest backend.

## Stan po stronie frontendu

Najważniejsze miejsca związane ze stanem frontendu:

```text
src/stan/
src/main.js
src/rdzen/authService.js
src/interfejs/
```

Frontend przechowuje głównie dane potrzebne do działania interfejsu:

- aktywne okna;
- otwarte aplikacje;
- aktualnie zaznaczone okno;
- ustawienia pulpitu;
- wybrany profil;
- pomocnicze dane UI;
- informacje potrzebne do przejść między ekranami.

Dzięki temu pulpit może działać jak małe środowisko desktopowe, a nie zwykła strona z podstronami.

## Sesja użytkownika

Sesja użytkownika nie jest trzymana jako zwykła flaga w JavaScripcie.

Po zalogowaniu backend ustawia cookie z sesją:

```text
xp_auth
```

Cookie jest ustawiane jako `httpOnly`, więc frontend nie czyta tokenu bezpośrednio. Przy kolejnych żądaniach przeglądarka sama dołącza cookie do requestów.

Aktualny użytkownik jest sprawdzany przez:

```text
GET /api/auth/me
```

Jeżeli backend potwierdzi sesję, frontend może pokazać pulpit. Jeżeli backend zwróci błąd, aplikacja wraca do ekranu logowania.

## LocalStorage

Część ustawień interfejsu może być zapisywana w `localStorage`.

Dotyczy to rzeczy, które nie są krytyczne dla bezpieczeństwa, na przykład:

- ustawienia wyglądu;
- preferencje pulpitu;
- dane pomocnicze profilu;
- stan niektórych elementów UI.

`localStorage` nie powinien być traktowany jako źródło prawdy dla autoryzacji. Użytkownik może go łatwo zmienić w przeglądarce, więc nie nadaje się do pilnowania dostępu.

## Cookie

W projekcie ważne są głównie dwa typy cookie:

| Cookie | Rola |
|---|---|
| `xp_auth` | Sesja użytkownika po zalogowaniu. |
| `xp_csrf` | Token używany do ochrony żądań `POST`. |

Szczegóły CSRF i JWT są opisane w [Poradniku autoryzacji](./Poradnik_autoryzacji.md).

## Przejścia między ekranami

Frontend obsługuje kilka głównych widoków:

```text
/login
/auth/callback
/welcome
/desktop
```

Dokładny opis przejścia przez callback jest w [Poradniku autoryzacji](./Poradnik_autoryzacji.md). Tutaj ważne jest tylko to, że `/desktop` nie powinien być pokazywany bez potwierdzenia sesji przez backend.

## Stan okien

Okna są częścią stanu frontendu.

System musi wiedzieć:

- które okna są otwarte;
- które okno jest aktywne;
- które okno jest zminimalizowane;
- jaka aplikacja jest przypisana do danego okna;
- jakie przyciski mają być widoczne na pasku zadań.

Ten stan jest potrzebny, żeby pasek zadań, menu Start i system okien działały spójnie.

## Stan aplikacji pulpitu

Aplikacje uruchamiane na pulpicie mogą mieć własny stan lokalny.

Przykładowo:

- Notepad może mieć tekst;
- Paint może mieć zawartość obszaru roboczego;
- Security Audit Viewer może mieć pobrane logi;
- Internet Explorer może mieć aktualnie wyświetlany widok.

Nie każdy taki stan musi być zapisywany na stałe. Część danych wystarczy trzymać tylko podczas aktualnej sesji w przeglądarce.

## Synchronizacja sesji

Aplikacja powinna reagować na zmianę sesji.

Przykładowe sytuacje:

- użytkownik odświeża stronę;
- użytkownik wraca do karty przeglądarki;
- sesja wygasła;
- użytkownik wylogował się;
- backend zwraca `401` albo `403`.

W takich przypadkach frontend powinien ponownie sprawdzić `/api/auth/me` albo wrócić do logowania.

## Reset przy starcie

Projekt może resetować użytkowników przy starcie aplikacji przez `RESET_USERS_ON_INIT=true`.

To wpływa na stan logowania, bo po restarcie stare konta i stare sesje mogą przestać istnieć. Sam mechanizm resetu jest opisany w [Poradniku bazy danych](./Poradnik_bazy_danych.md).

## Czego nie trzymać po stronie frontendu

Po stronie frontendu nie powinno się trzymać rzeczy takich jak:

- hasła;
- hash hasła;
- sekrety JWT;
- pełne dane użytkowników z bazy;
- decyzje o dostępie do panelu admina;
- dane, które powinny być sprawdzane przez backend.

Frontend może ukryć albo pokazać element UI, ale prawdziwe sprawdzenie dostępu musi być po stronie API.

## Najważniejsza zasada

Stan wizualny może być po stronie przeglądarki. Stan bezpieczeństwa musi być po stronie backendu.

Czyli pulpit, okna i ustawienia mogą działać lokalnie, ale sesja, role i dostęp do endpointów muszą być sprawdzane przez serwer.
