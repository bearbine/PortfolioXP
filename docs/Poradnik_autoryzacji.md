# Poradnik autoryzacji

Ten dokument opisuje, jak działa autoryzacja w projekcie **PortfolioXP**.

Nie jest to zwykłe logowanie typu „sprawdź hasło i od razu wpuść użytkownika”. W projekcie jest jeszcze krok pośredni z callbackiem i kodem autoryzacyjnym, więc warto opisać sam flow, a nie tylko listę endpointów.

Szczegółowa lista endpointów jest w [Poradniku API](./Poradnik_api.md), a tabele bazy danych są opisane w [Poradniku bazy danych](./Poradnik_bazy_danych.md).

## Najważniejsze pliki

Najwięcej rzeczy związanych z autoryzacją znajduje się tutaj:

```text
src/rdzen/authService.js
src/interfejs/loginScreen.js
src/interfejs/authCallbackScreen.js
src/main.js

server/trasy/auth.js
server/authMiddleware.js
server/csrf.js
server/tokens.js
server/baza_danych/
server/audyt/
```

Frontend odpowiada za ekran logowania, wysyłanie żądań do API i przechodzenie między widokami. Backend sprawdza dane użytkownika, tworzy kod autoryzacyjny, ustawia sesję i pilnuje dostępu do chronionych endpointów.

## Konto startowe i role

Konto startowe jest opisane w [Poradniku uruchomienia](./Poradnik_uruchomienia.md). Technicznie jest ono tworzone przez seed bazy danych, więc dokładniejszy opis znajduje się też w [Poradniku bazy danych](./Poradnik_bazy_danych.md).

W projekcie są dwie główne role:

```text
admin
user
```

`admin` ma dostęp do elementów administracyjnych, na przykład do logów audytu. `user` jest zwykłym użytkownikiem. Na tym etapie projektu nie ma potrzeby tworzenia większej liczby ról.

## Wejście do aplikacji

Aplikacja po stronie frontendu obsługuje kilka głównych ścieżek:

```text
/login
/auth/callback
/welcome
/desktop
```

Jeżeli użytkownik wchodzi bezpośrednio na `/desktop`, aplikacja nie zakłada od razu, że jest zalogowany. Najpierw sprawdzana jest sesja przez `/api/auth/me`. Jeżeli sesja jest poprawna, użytkownik może zostać na pulpicie. Jeżeli nie, wraca na ekran logowania.

## Profile na ekranie logowania

Profile widoczne na ekranie logowania są pobierane z backendu przez `/api/auth/profiles`.

Dzięki temu ekran logowania może pokazać aktualne profile z bazy, zamiast trzymać wszystko tylko na sztywno w kodzie interfejsu. Szczegóły odpowiedzi tego endpointu są w [Poradniku API](./Poradnik_api.md).

## CSRF

Przed ważnymi żądaniami typu `POST` frontend pobiera token CSRF przez `/api/auth/csrf`.

Token jest później wysyłany w nagłówku:

```text
X-CSRF-Token
```

CSRF jest używany między innymi przy logowaniu, rejestracji, wymianie kodu na token i wylogowaniu. Jeżeli token się nie zgadza, backend zwraca błąd `invalid_csrf`, a frontend może pobrać nowy token i ponowić żądanie.

## Logowanie krok po kroku

### 1. Wybór profilu

Użytkownik wybiera profil na ekranie logowania, wpisuje hasło i zatwierdza formularz.

Za ten ekran odpowiada:

```text
src/interfejs/loginScreen.js
```

Po kliknięciu logowania frontend wywołuje metodę z serwisu autoryzacji.

### 2. Wysłanie danych do backendu

Frontend wysyła dane do `/api/auth/login`.

Przekazywane są dane potrzebne do logowania, między innymi profil albo login, hasło i adres callbacka:

```text
redirectUri: /auth/callback
```

Jeżeli użytkownik loguje się z profilu na ekranie logowania, backend może znaleźć go po publicznym identyfikatorze profilu. Technicznie konto nadal jest zapisane w bazie jako normalny użytkownik.

### 3. Sprawdzenie danych

Backend w `/api/auth/login` sprawdza:

- CSRF;
- limit prób logowania;
- poprawność danych z requestu;
- użytkownika w bazie;
- hasło;
- rolę użytkownika.

Jeżeli hasło jest błędne, backend zwraca błąd logowania. Jeżeli dane są poprawne, backend nie wpuszcza użytkownika od razu na pulpit. Najpierw tworzy kod autoryzacyjny.

## Authorization code

Po poprawnym haśle backend generuje jednorazowy kod autoryzacyjny.

Kod nie powinien być przechowywany w bazie jako zwykły tekst. W projekcie jest zapisywany w formie hasha i ma krótki czas ważności.

Czas ważności ustawia zmienna:

```env
AUTH_CODE_EXPIRES_SECONDS=60
```

Backend zwraca frontendowi adres podobny do:

```text
/auth/callback?code=...
```

To jest ważny etap. Samo poprawne hasło nie tworzy jeszcze sesji. Sesja powstaje dopiero po wymianie tego kodu na token.

## Callback

Po otrzymaniu odpowiedzi z `/api/auth/login` frontend przechodzi na:

```text
/auth/callback?code=...
```

Za widok callbacka odpowiada:

```text
src/interfejs/authCallbackScreen.js
```

Ten ekran jest krótkim etapem pomiędzy logowaniem a wejściem do systemu. Użytkownik nie musi tam nic robić ręcznie. Frontend bierze kod z adresu i wysyła go do backendu.

## Wymiana kodu na sesję

Na callbacku frontend wysyła kod do `/api/auth/token`.

Backend sprawdza wtedy:

- czy CSRF jest poprawny;
- czy kod ma poprawny format;
- czy kod istnieje w bazie;
- czy nie wygasł;
- czy nie był już użyty;
- do którego użytkownika należy.

Jeżeli wszystko się zgadza, kod zostaje oznaczony jako użyty. Dzięki temu nie można normalnie wykorzystać tego samego kodu drugi raz.

## JWT i cookie

Po poprawnej wymianie kodu backend tworzy JWT i zapisuje go w cookie.

Cookie sesji jest ustawione jako:

```text
httpOnly
sameSite=lax
```

To znaczy, że token nie musi być trzymany w `localStorage`. Przeglądarka sama dołącza cookie do kolejnych żądań, a frontend przy sprawdzaniu sesji pyta backend przez `/api/auth/me`.

## Przejście na Welcome i Desktop

Po poprawnym zakończeniu callbacka frontend zapisuje podstawowe dane profilu i przenosi użytkownika dalej.

Kolejność wygląda mniej więcej tak:

```text
/login
-> /auth/callback
-> /welcome
-> /desktop
```

Ekran `welcome` jest etapem przejściowym przed pokazaniem pulpitu. Dopiero po nim użytkownik trafia na właściwy desktop.

## Sprawdzanie aktywnej sesji

Aktywna sesja jest sprawdzana przez `/api/auth/me`.

Frontend może odpytwać ten endpoint przy wejściu na pulpit, po odświeżeniu strony albo po powrocie do karty przeglądarki.

Jeżeli backend zwróci brak sesji, frontend czyści lokalny stan i wraca do logowania. Jeżeli problem wygląda na chwilowy błąd sieci, aplikacja nie musi od razu wylogowywać użytkownika.

## Middleware autoryzacji

Chronione endpointy korzystają z middleware:

```text
server/authMiddleware.js
```

Middleware sprawdza token z cookie albo z nagłówka `Authorization: Bearer ...`. Potem backend pobiera użytkownika z bazy i sprawdza, czy konto dalej istnieje oraz czy ma poprawną rolę.

To jest potrzebne, bo samo posiadanie tokenu nie powinno wystarczyć, jeżeli konto zostało usunięte albo zmieniły się jego uprawnienia.

## Endpointy administracyjne

Dostęp do endpointów administracyjnych wymaga roli `admin`.

Dotyczy to między innymi zasobów chronionych i logów audytu. Dokładna lista endpointów jest w [Poradniku API](./Poradnik_api.md).

Ukrycie przycisku we frontendzie nie jest zabezpieczeniem. Dostęp musi być sprawdzany po stronie backendu.

## Rejestracja

Rejestracja tworzy konto z rolą `user`. Backend sprawdza CSRF, waliduje dane, hashuje hasło i zapisuje użytkownika w bazie.

Trzeba pamiętać, że projekt może działać w trybie testowym. Jeżeli `RESET_USERS_ON_INIT=true`, konta utworzone podczas działania aplikacji mogą zniknąć po restarcie. Dokładniej opisuje to [Poradnik bazy danych](./Poradnik_bazy_danych.md).

## Wylogowanie

Wylogowanie czyści cookie sesji, a frontend usuwa lokalny stan użytkownika i wraca do ekranu logowania.

Wylogowanie jest też powiązane z akcjami systemowymi, takimi jak restart albo zamknięcie sesji.

## Audyt bezpieczeństwa

Projekt zapisuje zdarzenia związane z autoryzacją w logach audytu.

Do logów mogą trafiać na przykład:

- poprawne logowanie;
- błędne logowanie;
- utworzenie authorization code;
- wymiana code na token;
- użycie wygasłego kodu;
- próba ponownego użycia kodu;
- błędny CSRF;
- przekroczenie limitu prób;
- rejestracja;
- wylogowanie.

Logi można podejrzeć w aplikacji **Security Audit Viewer**, jeżeli użytkownik ma rolę `admin`.

## Testowanie

Podstawowy test autoryzacji można uruchomić komendą:

```powershell
npm run test:auth
```

Test powinien sprawdzić najważniejsze części przepływu: CSRF, logowanie, callback, token, sesję i dostęp do chronionych endpointów.
