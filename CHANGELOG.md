# CHANGELOG

Wszystkie ważniejsze zmiany w projekcie **PortfolioXP** są zapisywane w tym pliku.

---

## [0.1.57] - 2026-06-06

### Dodano

* Dodano finalny zestaw poradników technicznych w katalogu `docs/`.
* Dodano osobne poradniki dla:

  * uruchomienia projektu;
  * architektury;
  * autoryzacji;
  * bazy danych;
  * API;
  * Dockera;
  * stanu aplikacji.
* Dodano dopracowane oznaczenia na ekranie startowym:

  * `Copyright © Bearbine`;
  * `PortfolioXP®`.
* Dodano klikalny link do repozytorium GitHub na ekranie logowania.
* Dodano komunikat zgłaszania błędów z poziomu ekranu logowania.

### Zmieniono

* Przebudowano dokumentację na krótsze poradniki zamiast kilku luźnych plików.
* Uporządkowano powtarzające się informacje między poradnikami.
* Przeniesiono informacje o aplikacjach i assetach do poradnika architektury zamiast trzymania ich jako osobne dokumenty.
* Zmieniono teksty techniczne w dokumentacji, żeby lepiej pasowały do aktualnego kodu.
* Dopracowano branding projektu na ekranie startowym.
* Zmieniono wygląd napisu `PortfolioXP®`, żeby nie wyglądał jak zwykły pogrubiony tekst.
* Zmieniono copyright na prostszy, bardziej systemowy tekst.
* Uporządkowano opis uruchomienia przez Docker i lokalnie.
* Zmieniono `docker:start`, żeby nie uruchamiał niepotrzebnie inicjalizacji bazy drugi raz.
* Uporządkowano nazwy dokumentów na polskie nazwy zaczynające się od `Poradnik_`.

### Naprawiono

* Naprawiono link GitHub na ekranie logowania, który wcześniej nie był poprawnie podpięty w miejscu renderowania.
* Naprawiono wygląd dolnego tekstu na ekranie startowym.
* Naprawiono zbyt nowoczesny i zbyt ciężki font w copyright.
* Naprawiono problem z podwójną inicjalizacją bazy danych przy starcie Dockera.
* Naprawiono dokumentację, która nie zgadzała się już ze strukturą projektu.
* Naprawiono powtarzanie tych samych danych logowania w kilku poradnikach.
* Naprawiono stare opisy struktury katalogów, które nie odpowiadały aktualnym folderom.
* Naprawiono brak jasnego rozdzielenia dokumentacji API, autoryzacji i bazy danych.
* Naprawiono opisy flow logowania tak, aby uwzględniały callback i authorization code.

### Usunięto

* Usunięto stare dokumenty zastąpione poradnikami:

  * `APPS.md`;
  * `ASSETS.md`;
  * `ARCHITECTURE.md`;
  * `AUTH.md`;
  * `STATE.md`.
* Usunięto z dokumentacji powtarzające się fragmenty o koncie startowym.
* Usunięto nieaktualne fragmenty README i dokumentacji.
* Usunięto niepotrzebne opisy, które powtarzały informacje z innych poradników.

---

## [0.1.52] - 2026-06-06

### Dodano

* Dodano końcowe poprawki interfejsu boot screena.
* Dodano prawą stronę podpisu boot screena z nazwą `PortfolioXP®`.
* Dodano lewą stronę podpisu boot screena z informacją o autorze.
* Dodano poprawione style dla tekstów na dole ekranu startowego.
* Dodano czystszy układ tekstu na ekranie logowania.

### Zmieniono

* Przebudowano wygląd dolnej części boot screena.
* Zmieniono rozmiary, pozycję i fonty podpisów na ekranie startowym.
* Zmieniono tekst po prawej stronie boot screena, żeby działał bardziej jak podpis produktu.
* Zmieniono tekst po lewej stronie boot screena, żeby wyglądał bardziej jak klasyczny copyright.
* Przebudowano część CSS odpowiedzialną za boot screen.
* Zmieniono opis strony na krótki opis portfolio.
* Uporządkowano sposób używania brandingu `Bearbine`.

### Naprawiono

* Naprawiono krzywe ułożenie `PortfolioXP®` na ekranie startowym.
* Naprawiono za duży i niepasujący font dla copyright.
* Naprawiono problem ze znakiem `®`, który wyglądał jak zwykła część tekstu.
* Naprawiono niespójny wygląd tekstów po lewej i prawej stronie boot screena.
* Naprawiono drobne błędy responsywności boot screena.
* Naprawiono widoczne rozjazdy tekstu na mniejszych rozdzielczościach.

### Usunięto

* Usunięto tymczasowe style boot screena użyte podczas testowania rozmiarów.
* Usunięto niepasujące ustawienia fontów dla dolnych podpisów.

---

## [0.1.47] - 2026-06-05

### Dodano

* Dodano pełniejszą obsługę Dockera dla aplikacji i bazy danych.
* Dodano healthcheck aplikacji w Docker Compose.
* Dodano healthcheck MariaDB.
* Dodano osobny plik `docker.env`.
* Dodano konfigurację portu bazy na hoście przez `3308`.
* Dodano obsługę startu aplikacji po przygotowaniu bazy danych.

### Zmieniono

* Przebudowano konfigurację `docker-compose.yml`.
* Zmieniono sposób uruchamiania aplikacji w kontenerze.
* Zmieniono Dockerfile na wariant z etapem build i runtime.
* Zmieniono instalację zależności w Dockerze na `npm ci`.
* Zmieniono runtime kontenera na użytkownika `node`.
* Zmieniono serwowanie aplikacji tak, aby backend obsługiwał gotowy build z `dist/`.
* Zmieniono konfigurację bazy danych pod MariaDB działającą jako osobny serwis.

### Naprawiono

* Naprawiono problem ze startem aplikacji przed gotowością bazy danych.
* Naprawiono konflikt portu lokalnej bazy z bazą w Dockerze.
* Naprawiono problem ze starymi nazwami kontenerów.
* Naprawiono sytuację, w której Docker blokował start przez istniejący kontener z poprzedniej konfiguracji.
* Naprawiono nadmiarowe przygotowanie bazy przy starcie aplikacji.
* Naprawiono problemy z `npm ci` w kontenerze.
* Naprawiono ścieżki kopiowania plików do obrazu Docker.
* Naprawiono serwowanie assetów w trybie produkcyjnym.
* Naprawiono różnice między uruchomieniem lokalnym i kontenerowym.

### Usunięto

* Usunięto ręcznie ustawione stałe `container_name`.
* Usunięto niepotrzebne podwójne wywołanie inicjalizacji bazy.
* Usunięto zależność od lokalnych ścieżek środowiska deweloperskiego.

---

## [0.1.40] - 2026-06-05

### Dodano

* Dodano pełniejszy system autoryzacji po stronie backendu.
* Dodano endpoint `GET /api/auth/csrf`.
* Dodano endpoint `GET /api/auth/profiles`.
* Dodano endpoint `POST /api/auth/register`.
* Dodano endpoint `POST /api/auth/login`.
* Dodano endpoint `POST /api/auth/token`.
* Dodano endpoint `POST /api/auth/logout`.
* Dodano endpoint `GET /api/auth/me`.
* Dodano przepływ logowania oparty o authorization code.
* Dodano obsługę callbacka `/auth/callback`.
* Dodano wymianę kodu autoryzacyjnego na sesję.
* Dodano JWT zapisywany w cookie `httpOnly`.
* Dodano obsługę CSRF dla żądań `POST`.
* Dodano rate limit dla logowania, rejestracji i tokenu.
* Dodano logi audytu dla zdarzeń bezpieczeństwa.
* Dodano endpointy administracyjne.
* Dodano aplikację `Security Audit Viewer`.
* Dodano sprawdzanie aktualnego użytkownika przez `/api/auth/me`.

### Zmieniono

* Przebudowano cały flow logowania.
* Zmieniono logowanie z prostego sprawdzenia hasła na przepływ:

  * `/login`;
  * `/auth/callback`;
  * `/welcome`;
  * `/desktop`.
* Zmieniono `POST /api/auth/login`, aby tworzył authorization code zamiast od razu tworzyć sesję.
* Zmieniono `POST /api/auth/token`, aby odpowiadał za właściwe utworzenie sesji.
* Przebudowano `authService.js`.
* Zmieniono sposób obsługi błędów API po stronie frontendu.
* Zmieniono sposób przechowywania sesji.
* Zmieniono sposób sprawdzania sesji po odświeżeniu strony.
* Zmieniono obsługę powrotu użytkownika do karty przeglądarki.
* Przebudowano middleware autoryzacji.
* Zmieniono admin-only endpointy tak, aby sprawdzały rolę po stronie backendu.
* Zmieniono sposób synchronizacji sesji między kartami.

### Naprawiono

* Naprawiono przypadki, w których frontend mógł pokazać pulpit bez ważnej sesji.
* Naprawiono utratę sesji po odświeżeniu strony.
* Naprawiono błędy po powrocie z `/auth/callback`.
* Naprawiono brak obsługi wygasłego authorization code.
* Naprawiono możliwość ponownego użycia tego samego authorization code.
* Naprawiono błędne komunikaty przy złym haśle.
* Naprawiono błędy CSRF przy ponownym wysłaniu formularza.
* Naprawiono sytuację, w której frontend używał starego CSRF tokenu.
* Naprawiono dostęp do endpointów administracyjnych bez poprawnej roli.
* Naprawiono przypadki, w których wylogowanie nie czyściło poprawnie stanu frontendu.
* Naprawiono błędy z odczytem sesji po zmianie zakładki.
* Naprawiono niepoprawne zachowanie po wygaśnięciu JWT.
* Naprawiono sytuację, w której usunięty użytkownik nadal mógł być uznany za zalogowanego tylko na podstawie tokenu.
* Naprawiono brak logowania części zdarzeń bezpieczeństwa.
* Naprawiono problem z przejściem na pulpit przy niepoprawnym callbacku.

### Usunięto

* Usunięto starszą prostą logikę logowania tylko po stronie frontendu.
* Usunięto tymczasowe obejścia sesji.
* Usunięto część niepotrzebnych warunków w ekranie logowania.
* Usunięto stare podejście, w którym poprawne hasło od razu oznaczało wejście na pulpit.

---

## [0.1.32] - 2026-06-04

### Dodano

* Dodano backendową strukturę pod autoryzację i role.
* Dodano middleware sprawdzające token użytkownika.
* Dodano middleware wymagające roli administratora.
* Dodano plik do obsługi JWT.
* Dodano plik do obsługi CSRF.
* Dodano obsługę haseł przez bcrypt.
* Dodano publiczne identyfikatory profili.
* Dodano bazowy system audytu.
* Dodano endpoint `GET /api/protected/admin`.
* Dodano podstawę pod późniejsze połączenie Security Audit Viewer z backendiem.
* Dodano obsługę błędów API w formacie JSON.

### Zmieniono

* Przebudowano serwer Express.
* Zmieniono konfigurację API pod prefiks `/api/`.
* Zmieniono sposób serwowania frontendu przez backend.
* Zmieniono obsługę plików statycznych dla trybu dev i build.
* Zmieniono flow aplikacji tak, aby trasy `/login`, `/welcome`, `/desktop` były obsługiwane przez backend jako SPA.
* Zmieniono strukturę folderu `server/`.
* Zmieniono sposób inicjalizacji bazy przed startem API.
* Zmieniono obsługę błędów backendu na bardziej przewidywalną.

### Naprawiono

* Naprawiono błędy `404` przy bezpośrednim wejściu na `/desktop`.
* Naprawiono problem z odświeżeniem strony na `/welcome`.
* Naprawiono błędy zwracane przez nieistniejące endpointy API.
* Naprawiono błędne cache’owanie odpowiedzi API.
* Naprawiono brak `Cache-Control: no-store` dla danych sesji.
* Naprawiono problem z niepoprawnym parsowaniem JSON body.
* Naprawiono błędy przy braku bazy danych podczas startu backendu.
* Naprawiono sytuacje, w których backend startował mimo niegotowej bazy.
* Naprawiono błędy CORS/cookie wynikające z niejednolitej obsługi requestów.
* Naprawiono zbyt ogólne błędy serwera w części endpointów.

### Usunięto

* Usunięto część wcześniejszej logiki serwera niedopasowanej do nowego API.
* Usunięto stare testowe endpointy.
* Usunięto tymczasowe odpowiedzi API używane tylko podczas pierwszych testów.

---

## [0.1.24] - 2026-06-04

### Dodano

* Dodano MariaDB jako główną bazę danych projektu.
* Dodano tabele:

  * `users`;
  * `auth_codes`;
  * `audit_logs`.
* Dodano migracje bazy danych.
* Dodano seed konta startowego.
* Dodano opcję resetowania użytkowników przy starcie.
* Dodano repository pattern dla operacji na bazie.
* Dodano repozytorium użytkowników.
* Dodano repozytorium kodów autoryzacyjnych.
* Dodano repozytorium logów audytu.
* Dodano relacje między użytkownikami, kodami autoryzacyjnymi i logami.
* Dodano konfigurację bazy przez `.env`.
* Dodano osobną konfigurację bazy dla Dockera.

### Zmieniono

* Zmieniono bazę z SQLite na MariaDB.
* Przebudowano strukturę danych użytkownika.
* Zmieniono role użytkowników na `admin` i `user`.
* Zmieniono sposób tworzenia kont startowych.
* Zmieniono sposób przechowywania haseł.
* Zmieniono podejście do zapytań SQL przez repository.
* Zmieniono inicjalizację bazy tak, żeby migracje i seed mogły działać osobno.
* Zmieniono konfigurację połączenia z bazą.
* Zmieniono sposób pobierania profili logowania z bazy.
* Zmieniono obsługę starych ról po migracji schematu.

### Naprawiono

* Naprawiono błędy połączenia z bazą w środowisku lokalnym.
* Naprawiono błędy połączenia z bazą w Dockerze.
* Naprawiono różnicę między hostem bazy lokalnie i w kontenerze.
* Naprawiono problemy z ponownym uruchomieniem migracji.
* Naprawiono błędy przy ponownym seedowaniu danych.
* Naprawiono sytuację, w której baza mogła zostać bez konta startowego.
* Naprawiono problem z częściowo wykonanym seedem przez użycie transakcji.
* Naprawiono błędne role po zmianie schematu.
* Naprawiono błędy SQL po przejściu z SQLite na MariaDB.
* Naprawiono usuwanie kodów autoryzacyjnych po resecie użytkowników.
* Naprawiono zachowanie logów audytu po usunięciu użytkownika.
* Naprawiono brak zgodności typów dat między bazą i backendem.
* Naprawiono konflikty unikalnych loginów.

### Usunięto

* Usunięto wcześniejsze rozwiązania oparte na SQLite.
* Usunięto testową strukturę użytkowników niedopasowaną do nowego backendu.
* Usunięto stare zapytania SQL.
* Usunięto tymczasowe dane używane przy pierwszych testach bazy.
* Usunięto logikę, która mieszała dane użytkowników bezpośrednio z frontendem.

---

## [0.1.16] - 2026-06-03

### Dodano

* Dodano pełniejszy system okien.
* Dodano obsługę aktywnego okna.
* Dodano minimalizowanie okien.
* Dodano zamykanie okien.
* Dodano przeciąganie okien.
* Dodano zmianę rozmiaru okien.
* Dodano przyciski sterowania oknem.
* Dodano z-index dla aktywnych okien.
* Dodano przyciski aktywnych aplikacji na pasku zadań.
* Dodano singletony dla aplikacji, które nie powinny otwierać się wielokrotnie.
* Dodano podstawowe rozmiary i minimalne rozmiary okien.
* Dodano lepszą obsługę aplikacji uruchamianych z menu Start i pulpitu.

### Zmieniono

* Przebudowano `windowManager`.
* Zmieniono sposób tworzenia okien aplikacji.
* Zmieniono sposób przechowywania stanu okien.
* Zmieniono logikę aktywacji istniejącego okna.
* Zmieniono sposób renderowania zawartości aplikacji w oknie.
* Zmieniono sposób liczenia pozycji początkowej okna.
* Zmieniono obsługę kliknięcia w pasek tytułu.
* Zmieniono warstwę okien na osobny element pulpitu.
* Przebudowano część klas CSS okien.

### Naprawiono

* Naprawiono błąd, przez który okna pojawiały się poza ekranem.
* Naprawiono problem z oknami nachodzącymi na siebie bez poprawnego aktywowania.
* Naprawiono błędy z minimalizowaniem i przywracaniem okien.
* Naprawiono przypadki, w których zamknięte okno zostawało na pasku zadań.
* Naprawiono sytuację, w której aplikacja otwierała się kilka razy mimo trybu singleton.
* Naprawiono problem z przeciąganiem okna poza widoczny obszar.
* Naprawiono błędy z resize handle.
* Naprawiono problem z klikaniem elementów w oknie podczas przeciągania.
* Naprawiono błędy z ustawianiem aktywnej klasy okna.
* Naprawiono niepoprawne odświeżanie przycisków taskbara po zmianie stanu okna.
* Naprawiono błędy z warstwą okien po zmianie rozmiaru ekranu.

### Usunięto

* Usunięto starszy prosty sposób otwierania aplikacji bez menedżera okien.
* Usunięto część ręcznie ustawianych pozycji okien.
* Usunięto tymczasowe style okien z pierwszego prototypu.

---

## [0.1.12] - 2026-06-03

### Dodano

* Dodano rejestr aplikacji.
* Dodano aplikację `My Computer`.
* Dodano aplikację `My Documents`.
* Dodano `Recycle Bin`.
* Dodano `Internet Explorer`.
* Dodano `Notepad`.
* Dodano `Paint`.
* Dodano `Control Panel`.
* Dodano aplikację `Run`.
* Dodano `Help and Support`.
* Dodano placeholdery dla aplikacji, które nie mają jeszcze pełnej funkcjonalności.
* Dodano więcej pozycji w menu Start.
* Dodano podmenu `All Programs`.
* Dodano podmenu `My Recent Documents`.
* Dodano podmenu `Connect To`.
* Dodano testowe foldery i elementy w eksploratorze.
* Dodano obsługę lokalnych komunikatów w Internet Explorerze.
* Dodano podstawowe ustawienia wyglądu w Control Panel.

### Zmieniono

* Przebudowano sposób uruchamiania aplikacji.
* Zmieniono aplikacje z luźnych funkcji na rejestrowane definicje.
* Zmieniono sposób przypisywania ikon do aplikacji.
* Zmieniono strukturę menu Start.
* Zmieniono logikę placeholderów, aby nie były martwymi przyciskami.
* Zmieniono eksplorator na tryby:

  * computer;
  * documents;
  * recycle.
* Zmieniono Internet Explorer tak, aby działał jako bezpieczna lokalna aplikacja portfolio.
* Zmieniono ustawienia pulpitu tak, aby korzystały z konfiguracji użytkownika.
* Zmieniono obsługę dźwięków aplikacji i interfejsu.

### Naprawiono

* Naprawiono błędy z ikonami aplikacji.
* Naprawiono brak reakcji części pozycji menu Start.
* Naprawiono problem z aplikacjami, które otwierały puste okno.
* Naprawiono błędy z placeholderami bez komunikatu.
* Naprawiono problem z klikaniem elementów w eksploratorze.
* Naprawiono błędy w Notepadzie po zmianie okna.
* Naprawiono niedziałające przyciski w Run.
* Naprawiono problem z niedopasowanymi rozmiarami okien aplikacji.
* Naprawiono style aplikacji, które mieszały się z głównym stylem pulpitu.
* Naprawiono błędy z ikonami menu Start.
* Naprawiono zbyt małe lub zbyt duże okna niektórych aplikacji.

### Usunięto

* Usunięto część ręcznie dopisanych aplikacji testowych.
* Usunięto martwe przyciski bez placeholderów.
* Usunięto niepotrzebne próbne widoki aplikacji.

---

## [0.1.8] - 2026-06-02

### Dodano

* Dodano pasek zadań.
* Dodano przycisk Start.
* Dodano menu Start.
* Dodano tray z ikonami systemowymi.
* Dodano zegar.
* Dodano quick launch.
* Dodano popupy traya.
* Dodano dymki powiadomień traya.
* Dodano podstawowy system dźwięków.
* Dodano Sound Manager.
* Dodano obsługę dźwięków logowania, wylogowania, startu i akcji UI.
* Dodano ekran zasilania.
* Dodano dialog wylogowania i wyłączania.

### Zmieniono

* Przebudowano dolną część pulpitu.
* Zmieniono sposób wyświetlania otwartych aplikacji na pasku zadań.
* Zmieniono strukturę menu Start.
* Zmieniono obsługę akcji Start, Log off, Turn off i Restart.
* Zmieniono dźwięki tak, aby nie nakładały się bez kontroli.
* Zmieniono przejścia między boot, login, welcome i desktop.
* Zmieniono warstwę powiadomień traya.
* Zmieniono nazwy klas taskbara, menu Start i traya.

### Naprawiono

* Naprawiono problemy z pozycjonowaniem menu Start.
* Naprawiono błąd, przez który menu Start nie zamykało się po kliknięciu poza nim.
* Naprawiono problem z tray popupami pojawiającymi się w złym miejscu.
* Naprawiono błąd z zegarem, który nie odświeżał się poprawnie.
* Naprawiono problemy z klikaniem przycisku Start.
* Naprawiono dźwięki odtwarzane kilka razy naraz.
* Naprawiono problemy z wygaszaniem dźwięków przy zmianie ekranu.
* Naprawiono błąd z restartem, który nie czyścił poprawnie poprzedniego ekranu.
* Naprawiono problem z powiadomieniami traya nachodzącymi na taskbar.
* Naprawiono pierwsze błędy responsywności paska zadań.

### Usunięto

* Usunięto pierwszą prostą wersję paska zadań.
* Usunięto część tymczasowych ikon systemowych.
* Usunięto stare testowe akcje Start Menu.

---

## [0.1.0] - 2026-06-02

### Dodano

* Dodano pierwszy większy działający prototyp **PortfolioXP**.
* Dodano ekran startowy.
* Dodano ekran logowania.
* Dodano ekran powitania.
* Dodano podstawowy pulpit.
* Dodano pierwsze ikony pulpitu.
* Dodano pierwszą wersję systemu okien.
* Dodano pierwsze aplikacje demonstracyjne.
* Dodano konfigurację assetów.
* Dodano konfigurację profili.
* Dodano podstawowe ustawienia użytkownika.
* Dodano pierwszą wersję localStorage dla profili i sesji.
* Dodano podstawową strukturę backendu.
* Dodano pierwszą wersję API.
* Dodano pierwszą konfigurację Dockera.
* Dodano pierwszą obsługę builda przez Vite.

### Zmieniono

* Przebudowano projekt z luźnego prototypu na działającą aplikację.
* Zmieniono strukturę katalogów na wyraźniejszy podział:

  * `src`;
  * `server`;
  * `assets`;
  * `docs`.
* Zmieniono sposób ładowania assetów przez centralną konfigurację.
* Zmieniono sposób inicjalizacji aplikacji.
* Zmieniono renderowanie ekranów startowych.
* Zmieniono podejście do przechowywania stanu.
* Zmieniono styl CSS ekranu startowego, logowania i pulpitu.
* Zmieniono część funkcji tworzących elementy DOM.
* Zmieniono pierwsze nazwy klas i modułów na bardziej spójne.

### Naprawiono

* Naprawiono błędy uruchamiania po większym połączeniu modułów.
* Naprawiono brakujące importy.
* Naprawiono problemy ze ścieżkami do assetów.
* Naprawiono błędy CSS na ekranie logowania.
* Naprawiono problemy z centrowaniem boot screena.
* Naprawiono problemy z układem pulpitu na różnych rozdzielczościach.
* Naprawiono błędy JavaScript blokujące start aplikacji.
* Naprawiono złe kolejności ładowania modułów.
* Naprawiono problemy z czyszczeniem poprzedniego ekranu.
* Naprawiono błędy localStorage przy braku danych.
* Naprawiono pierwsze konflikty stylów między login screenem i desktopem.
* Naprawiono problemy z niedziałającymi ikonami po przeniesieniu assetów.

### Usunięto

* Usunięto część najstarszych plików testowych.
* Usunięto tymczasowe style z pierwszego prototypu.
* Usunięto ręcznie wpisane elementy, które zastąpiły funkcje renderujące UI.
* Usunięto pierwsze niedziałające wersje ekranów.

---

## [0.0.32] - 2026-06-01

### Dodano

* Dodano pierwszą większą przebudowę kodu JavaScript.
* Dodano wstępny podział kodu na moduły.
* Dodano pierwsze podejście do backendu.
* Dodano pierwsze podejście do bazy danych.
* Dodano pierwsze pliki konfiguracji systemu.
* Dodano pierwsze pliki konfiguracji assetów.
* Dodano podstawy pod późniejszą obsługę profili.
* Dodano więcej assetów dla pulpitu, logowania i ikon.
* Dodano wstępny podział CSS na kilka plików.
* Dodano pierwsze testy uruchomienia projektu z backendem.

### Zmieniono

* Przebudowano dużą część funkcji tworzących elementy interfejsu.
* Zmieniono sposób tworzenia elementów DOM.
* Zmieniono sposób importowania assetów.
* Zmieniono organizację katalogów.
* Zmieniono część nazw funkcji i zmiennych.
* Zmieniono pierwsze podejście do stanu aplikacji.
* Zmieniono strukturę CSS, żeby oddzielić boot, login i desktop.
* Zmieniono przygotowanie projektu pod późniejszy backend i bazę danych.
* Zmieniono część prostych HTML-owych testów na renderowanie przez JavaScript.

### Naprawiono

* Naprawiono wiele błędów CSS po zmianie struktury interfejsu.
* Naprawiono rozjeżdżanie się boot screena.
* Naprawiono błędy skalowania ekranu logowania.
* Naprawiono problemy z ładowaniem assetów.
* Naprawiono błędne importy po przeniesieniu plików.
* Naprawiono konflikty nazw funkcji po refaktorze.
* Naprawiono event listenery odpalające się kilka razy.
* Naprawiono kliknięcia trafiające w zły element.
* Naprawiono problem z czyszczeniem kontenera aplikacji.
* Naprawiono błędy z inicjalizacją modułów w złej kolejności.
* Naprawiono problemy z obrazkami, które nie miały fallbacku po błędzie ładowania.
* Naprawiono błędy layoutu po przejściu na bardziej dynamiczne renderowanie.

### Usunięto

* Usunięto część bardzo starych funkcji testowych.
* Usunięto nieużywane style.
* Usunięto pierwsze obejścia w JavaScript.
* Usunięto pliki niedopasowane do nowej struktury.
* Usunięto część ręcznie tworzonych elementów HTML.

---

## [0.0.28] - 2026-06-01

### Dodano

* Dodano pierwsze ustawienia użytkownika.
* Dodano podstawowe przechowywanie danych w localStorage.
* Dodano pierwszą obsługę profili.
* Dodano podstawowe motywy i tapety.
* Dodano pierwszą wersję ustawień pulpitu.
* Dodano obsługę kursora.
* Dodano pierwsze dźwięki systemowe.
* Dodano podstawową strukturę pod późniejsze Control Panel.

### Zmieniono

* Zmieniono sposób przechowywania ustawień frontendu.
* Zmieniono konfigurację tapet i ikon.
* Zmieniono część CSS odpowiedzialną za tło pulpitu.
* Zmieniono sposób przypisywania ustawień do profilu użytkownika.
* Zmieniono pierwsze podejście do obsługi dźwięków.

### Naprawiono

* Naprawiono błędy zapisu ustawień w przeglądarce.
* Naprawiono problemy z odczytem pustego localStorage.
* Naprawiono błędy po uszkodzonym rekordzie localStorage.
* Naprawiono problemy z ustawianiem tapety.
* Naprawiono błędy przy zmianie rozmiaru ikon.
* Naprawiono brak fallbacku dla nieznanych ustawień.
* Naprawiono problem z resetowaniem ustawień po odświeżeniu strony.

### Usunięto

* Usunięto stare stałe ustawienia wpisane bezpośrednio w kilku miejscach.
* Usunięto testowe ustawienia, które nie były już używane.

---

## [0.0.24] - 2026-05-31

### Dodano

* Dodano pierwszą wersję ekranu logowania.
* Dodano pierwsze profile użytkowników.
* Dodano wybór profilu na ekranie logowania.
* Dodano pole hasła.
* Dodano przycisk przejścia dalej.
* Dodano pierwsze komunikaty błędów logowania.
* Dodano przycisk zasilania na ekranie logowania.
* Dodano grafiki avatarów.
* Dodano podstawowy ekran powitania.

### Zmieniono

* Przebudowano przejście między boot screenem a login screenem.
* Zmieniono układ ekranu logowania.
* Zmieniono style profili użytkownika.
* Zmieniono sposób renderowania avatarów.
* Zmieniono pierwsze działanie przycisku zasilania.
* Zmieniono animacje przejścia do pulpitu.

### Naprawiono

* Naprawiono błędy z centrowaniem profili.
* Naprawiono problem z polem hasła, które traciło fokus.
* Naprawiono przypadki, w których komunikat błędu zostawał po zmianie profilu.
* Naprawiono przycisk logowania, który działał bez wpisanego hasła.
* Naprawiono błędy z pozycją przycisku zasilania.
* Naprawiono skalowanie ekranu logowania na mniejszych ekranach.
* Naprawiono problemy z avatarami o różnych rozmiarach.
* Naprawiono błędy przy przejściu z welcome screen na desktop.

### Usunięto

* Usunięto testowy ekran wejścia bez profili.
* Usunięto pierwsze placeholderowe teksty ekranu logowania.
* Usunięto tymczasowe style avatarów.

---

## [0.0.20] - 2026-05-31

### Dodano

* Dodano podstawową logikę działania pulpitu.
* Dodano pierwsze klikane ikony.
* Dodano pierwszą logikę otwierania okien.
* Dodano pierwszą warstwę okien.
* Dodano podstawowy pulpit z ikonami.
* Dodano pierwsze menu kontekstowe.
* Dodano obsługę zaznaczania ikony.
* Dodano pierwsze style pulpitu.
* Dodano podstawowe przyciski okien.
* Dodano pierwszą strukturę aplikacji demonstracyjnych.

### Zmieniono

* Zmieniono sposób tworzenia elementów pulpitu.
* Zmieniono układ ikon.
* Zmieniono sposób przypisywania akcji do ikon.
* Zmieniono część funkcji odpowiedzialnych za kliknięcia.
* Zmieniono style okien i pulpitu.
* Zmieniono rozmiary pierwszych okien.
* Zmieniono sposób przechowywania listy aplikacji.

### Naprawiono

* Naprawiono problemy z klikaniem ikon.
* Naprawiono błędy otwierania pustych okien.
* Naprawiono okna pojawiające się poza ekranem.
* Naprawiono błędy warstw `z-index`.
* Naprawiono problem z nieaktywnym oknem po kliknięciu.
* Naprawiono błędy z podwójnym otwieraniem aplikacji.
* Naprawiono problemy z menu kontekstowym zostającym na ekranie.
* Naprawiono pierwsze błędy z fokusem klawiatury.
* Naprawiono błędy CSS powodujące rozjeżdżanie ikon.
* Naprawiono problem z ikonami nachodzącymi na taskbar.

### Usunięto

* Usunięto ręcznie wpisane testowe elementy pulpitu.
* Usunięto testowe klasy CSS.
* Usunięto pierwszą wersję okien bez menedżera.

---

## [0.0.15] - 2026-05-30

### Dodano

* Dodano pierwszy boot screen.
* Dodano pasek ładowania.
* Dodano logo na ekranie startowym.
* Dodano opóźnienie przejścia z boot screena do kolejnego widoku.
* Dodano pierwszą animację ładowania.
* Dodano pierwsze assety ekranu startowego.
* Dodano podstawowe style boot screena.

### Zmieniono

* Zmieniono układ pierwszego ekranu aplikacji.
* Zmieniono sposób startu aplikacji po załadowaniu strony.
* Zmieniono strukturę głównego kontenera.
* Zmieniono style globalne pod pełnoekranowy interfejs.
* Zmieniono sposób przechodzenia między ekranami.

### Naprawiono

* Naprawiono zbyt szybkie przechodzenie z boot screena.
* Naprawiono problem z paskiem ładowania na różnych szerokościach.
* Naprawiono błędy z centrowaniem logo.
* Naprawiono czarne marginesy na części rozdzielczości.
* Naprawiono problemy z wysokością widoku `100vh`.
* Naprawiono pierwsze błędy responsywności.
* Naprawiono problem z nieczyszczonym timerem boot screena.

### Usunięto

* Usunięto testowy ekran startowy bez animacji.
* Usunięto stare style pełniące rolę placeholderów.

---

## [0.0.10] - 2026-05-30

### Dodano

* Dodano pierwsze widoczne elementy PortfolioXP.
* Dodano podstawowe style strony.
* Dodano pierwsze assety graficzne.
* Dodano konfigurację Vite.
* Dodano pierwsze pliki JavaScript uruchamiające interfejs.
* Dodano testowy widok pulpitu.
* Dodano testowy widok logowania.
* Dodano podstawową konfigurację npm.
* Dodano pierwsze pliki CSS.
* Dodano podstawowe katalogi `src` i `assets`.

### Zmieniono

* Zmieniono projekt z pustej struktury na pierwszy prototyp wizualny.
* Zmieniono główny układ strony.
* Zmieniono podział CSS.
* Zmieniono nazwy pierwszych plików.
* Zmieniono sposób ładowania skryptów.
* Zmieniono pierwszą konfigurację Vite pod dalszy rozwój aplikacji.

### Naprawiono

* Naprawiono błędy ładowania CSS.
* Naprawiono problemy ze ścieżkami do assetów.
* Naprawiono podstawowe błędy JavaScript przy starcie.
* Naprawiono brakujące pliki po przeniesieniu assetów.
* Naprawiono błędy skalowania tła.
* Naprawiono problemy z wyświetlaniem tekstów.
* Naprawiono pierwsze błędy responsywności.
* Naprawiono problem z odświeżaniem strony po zmianie plików.

### Usunięto

* Usunięto część plików testowych z początkowej konfiguracji.
* Usunięto niepotrzebne komentarze i stare próby layoutu.
* Usunięto pierwsze niedziałające assety testowe.

---

## [0.0.7] - 2026-05-29

### Dodano

* Dodano pierwszą strukturę pod modularny JavaScript.
* Dodano pierwsze funkcje pomocnicze do tworzenia elementów DOM.
* Dodano pierwsze podejście do katalogu `konfiguracja`.
* Dodano pierwsze pliki stylów globalnych.
* Dodano pierwsze próby pełnoekranowego layoutu.
* Dodano podstawowe miejsce na ikony i tapety.

### Zmieniono

* Zmieniono strukturę projektu z jednego prostego widoku na kilka oddzielnych części.
* Zmieniono podejście do pisania UI z ręcznego HTML na generowanie elementów w JavaScript.
* Zmieniono część nazw plików pod przyszłą architekturę projektu.
* Zmieniono pierwszą organizację assetów.

### Naprawiono

* Naprawiono problemy z głównym kontenerem aplikacji.
* Naprawiono błędy z pustym renderem po starcie.
* Naprawiono problemy z ładowaniem modułów ES.
* Naprawiono ścieżki do pierwszych grafik.
* Naprawiono podstawowe konflikty CSS.
* Naprawiono błędy związane z różnicą między dev serverem i buildem.

### Usunięto

* Usunięto część ręcznie wpisanego testowego HTML.
* Usunięto pierwsze próbne style niepasujące do dalszej struktury.

---

## [0.0.3] - 2026-05-29

### Dodano

* Dodano bazową strukturę katalogów projektu.
* Dodano pierwsze pliki HTML, CSS i JavaScript.
* Dodano pierwsze skrypty npm.
* Dodano podstawowe miejsce na assety.
* Dodano początkową konfigurację środowiska deweloperskiego.
* Dodano pierwsze szkice układu strony.
* Dodano pierwsze testowe style.
* Dodano pierwszą konfigurację pod Vite.

### Zmieniono

* Uporządkowano początkowy układ katalogów.
* Zmieniono pierwszą strukturę plików pod dalsze rozwijanie PortfolioXP.
* Zmieniono podstawowe nazwy plików na bardziej czytelne.
* Przygotowano projekt pod dalsze tworzenie desktopowego interfejsu.

### Naprawiono

* Naprawiono pierwsze problemy z uruchomieniem projektu.
* Naprawiono błędy konfiguracji npm.
* Naprawiono problemy z plikiem wejściowym aplikacji.
* Naprawiono pierwsze błędy importów.
* Naprawiono drobne problemy z ładowaniem stylów.
* Naprawiono brakujące odwołania do plików po pierwszym podziale katalogów.

### Usunięto

* Usunięto pierwsze zbędne pliki testowe.
* Usunięto fragmenty startowego kodu, które nie były potrzebne po ustawieniu struktury projektu.

---

## [0.0.1] - 2026-05-28

### Dodano

* Rozpoczęto pracę nad projektem **PortfolioXP**.
* Utworzono pierwsze bazowe pliki projektu.
* Dodano początkową konfigurację npm.
* Dodano pierwszy szkielet aplikacji.
* Dodano podstawowy plik wejściowy projektu.
* Dodano miejsce na style, skrypty i assety.
* Dodano pierwszą konfigurację pod dalsze rozwijanie projektu.
* Dodano początkowy opis projektu i pierwszą strukturę katalogów.

### Zmieniono

* Brak większych zmian.

### Naprawiono

* Brak większych zmian.

### Usunięto

* Brak większych zmian.
