# PortfolioXP

> **Ważne:** Windows XP, Microsoft oraz powiązane nazwy, znaki towarowe i elementy identyfikacji wizualnej należą do Microsoftu.
> **PortfolioXP** nie jest oficjalnym produktem Microsoftu i nie jest z nim powiązany.
> Jest to niezależny, fanowski projekt portfolio inspirowany klimatem klasycznych systemów desktopowych.

## Krótki opis

**PortfolioXP** to retro portfolio w formie interaktywnego pulpitu.

Projekt jest skierowany do osób, które lubią stare gry, klasyczne systemy, retro UI i strony, które mają trochę więcej klimatu niż zwykły template z internetu. Zamiast klasycznego układu „O mnie / Projekty / Kontakt” użytkownik dostaje ekran startowy, logowanie, pulpit, okna, pasek zadań, menu Start i aplikacje.

PortfolioXP powstało jako portfolio autora, ale projekt został udostępniony też jako baza dla innych developerów, gamerów i osób, które chcą zrobić coś podobnego bez zaczynania od zera.

## Co jest w projekcie

* retro pulpit w przeglądarce;
* ekran startowy i ekran logowania;
* system okien;
* pasek zadań, tray i menu Start;
* aplikacje desktopowe;
* backend Express;
* baza danych MariaDB;
* autoryzacja z callbackiem i sesją;
* Docker;
* dokumentacja techniczna.

## Dokumentacja

| Plik                                                         | Opis                                                              |
| ------------------------------------------------------------ | ----------------------------------------------------------------- |
| [Poradnik uruchomienia](docs/Poradnik_uruchomienia.md)       | Jak uruchomić projekt lokalnie albo przez Docker.                 |
| [Poradnik architektury](docs/Poradnik_architektury.md)       | Struktura projektu i podział na frontend, backend, bazę i assety. |
| [Poradnik autoryzacji](docs/Poradnik_autoryzacji.md)         | Jak działa logowanie, callback, sesja i role.                     |
| [Poradnik bazy danych](docs/Poradnik_bazy_danych.md)         | MariaDB, tabele, migracje, seed i reset użytkowników.             |
| [Poradnik API](docs/Poradnik_api.md)                         | Endpointy backendu i komunikacja frontendu z API.                 |
| [Poradnik Dockera](docs/Poradnik_dockera.md)                 | Konfiguracja Dockera, kontenery, porty i logi.                    |
| [Poradnik stanu aplikacji](docs/Poradnik_stanu_aplikacji.md) | Stan frontendu, sesja, cookie i localStorage.                     |
| [Licencja](LICENSE.md)                                       | Zasady użycia projektu, informacje o autorze i prawach.           |

## Historia zmian

Pełna historia rozwoju projektu, większe przebudowy, poprawki błędów i zmiany między wersjami są opisane w pliku:

[CHANGELOG.md](CHANGELOG.md)

## Technologie

Projekt korzysta z:

* JavaScript;
* Vite;
* Node.js;
* Express;
* MariaDB;
* Docker;
* HTML;
* CSS.

## FAQ

### Dla kogo jest ten projekt?

Dla osób, które lubią retro klimat, stare gry, klasyczne pulpity i strony, które nie wyglądają jak kolejny zwykły template z internetu.

Jeżeli chcesz zrobić portfolio, które od razu łapie uwagę, to PortfolioXP może być dobrą bazą. Bierzesz projekt, przerabiasz pod siebie, dodajesz swoje aplikacje, projekty, teksty i robisz z tego własną wersję.

### Czy mogę użyć PortfolioXP jako bazy pod własne portfolio?

Tak. Właśnie o to chodzi.
Projekt jest udostępniony po to, żeby ktoś, komu podoba się taki styl, nie musiał zaczynać wszystkiego od zera.

Możesz zmienić teksty, aplikacje, ikony, kolory, tapety, sekcje portfolio i całą zawartość pod siebie.

Jedyna prośba: jeżeli używasz PortfolioXP jako bazy, zostaw informację o pierwotnym projekcie albo autorze. Nie musi to być wielki baner na pół strony. Wystarczy normalna wzmianka w README, stopce albo dokumentacji, że projekt powstał na bazie PortfolioXP od Bearbine.

Dobrze też nie zmieniać oficjalnego linku GitHub na ekranie logowania, ponieważ służy on do zgłaszania błędów i propozycji zmian do głównego repozytorium.

### Czy mogę zmienić link GitHub na ekranie logowania?

Lepiej nie zmieniać oficjalnego linku GitHub na ekranie logowania.

Ten link prowadzi do głównego repozytorium PortfolioXP, gdzie można zgłaszać błędy, problemy i propozycje zmian. Dzięki temu issue trafiają w jedno miejsce i projekt może być normalnie rozwijany dalej.

Jeżeli robisz własną wersję projektu, możesz dodać swoje linki w README, stopce, aplikacji portfolio albo w dodatkowym oknie. Sam link do oficjalnego repozytorium na ekranie logowania dobrze zostawić bez zmian, żeby użytkownicy wiedzieli, gdzie zgłaszać problemy z bazową wersją projektu.

### Czy takie portfolio ma sens dla developera?

Moim zdaniem tak, jeżeli pasuje do twojego stylu.
Normalne portfolio pokazuje projekty, ale takie portfolio pokazuje też charakter, pomysł i trochę kreatywności.

Jeżeli ktoś z HR albo rekruter otworzy stronę i zobaczy interaktywny pulpit zamiast zwykłego układu „O mnie / Projekty / Kontakt”, to jest większa szansa, że zapamięta projekt.

### Czy muszę znać cały kod, żeby coś zmienić?

Na początku może być trochę trudniej, szczególnie jeśli chcesz zmieniać bardziej zaawansowane elementy projektu. W niektórych miejscach trzeba jeszcze zajrzeć do kodu, żeby dostosować wszystko dokładnie pod siebie.

Jednak moim celem jest stopniowe upraszczanie całego procesu. W przyszłości planuję dodać więcej narzędzi, konfiguracji i rozwiązań, które pozwolą zmieniać zawartość, wygląd i ustawienia projektu bez konieczności głębokiego grzebania w kodzie.

Na ten moment warto korzystać z dokumentacji, która pomaga szybciej zrozumieć strukturę projektu i znaleźć potrzebne informacje bez szukania wszystkiego na ślepo.

### Czy to jest Windows XP?

Nie. To niezależny fanowski projekt portfolio inspirowany stylem i klimatem całej epoki klasycznych systemów desktopowych, w tym również Windows XP.
Windows XP, Microsoft i powiązane znaki należą do Microsoftu.

PortfolioXP nie jest oficjalnym produktem Microsoftu i nie jest z nim powiązany.

### Czy projekt jest tylko do portfolio?

Głównie tak, ale nie tylko.
Można go przerobić na stronę projektu, mały panel prezentacyjny, interaktywną wizytówkę albo eksperymentalny web desktop.

Najlepiej pasuje do rzeczy, które mają mieć trochę klimatu, a nie wyglądać jak kolejna nudna strona z gotowego szablonu.

### Czy projekt jest gotowy w 100%?

Nie traktowałbym go jako zamkniętego produktu.
To projekt rozwijany, z działającą bazą, frontendem, backendem, Dockerem i dokumentacją, ale nadal można go rozbudowywać.

I szczerze: właśnie dlatego jest fajny. Można wziąć bazę i zrobić z niej coś swojego.

## Autor

Projekt rozwijany przez **Bearbine**.

Oficjalne repozytorium projektu:

https://github.com/Bearbine/PortfolioXP

## Licencja

Zasady użycia projektu są opisane w pliku:

[LICENSE.md](LICENSE.md)