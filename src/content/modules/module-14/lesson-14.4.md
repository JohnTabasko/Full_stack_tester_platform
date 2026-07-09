# Podstawy testów penetracyjnych

> Moduł czternasty rozszerza jakość poza pytanie „czy funkcja działa”. System może działać funkcjonalnie, a jednocześnie być niebezpieczny, niedostępny dla części użytkowników, wizualnie uszkodzony albo niezgodny z regulacjami.

## Jak czytać ten moduł

Czytaj ten moduł przez pryzmat ryzyka niefunkcjonalnego. Automatyzacja może wspierać bezpieczeństwo, dostępność, zgodność i testy wizualne, ale wymaga świadomej interpretacji. Nie każdy wynik narzędzia jest defektem i nie każdy brak wyniku oznacza bezpieczeństwo.

Trzy zasady modułu:

1. **Automatyzacja nie zastępuje eksperta.** Może wykrywać regresje i klasy problemów, ale nie zastąpi audytu bezpieczeństwa ani pełnej oceny dostępności.
2. **Dowód musi być audytowalny.** Przy bezpieczeństwie i compliance ważne jest, co sprawdzono, kiedy i z jakim wynikiem.
3. **Testuj także odmowę i fallback.** Brak zgody, brak uprawnień, błąd kontrastu, zewnętrzny dostawca i użytkownik klawiatury są częścią jakości.


## Cel lekcji

Ta lekcja koncentruje się na: **OWASP ZAP, testy SQL injection, wykrywanie XSS, nagłówki bezpieczeństwa, auth bypass, rate limiting i przechowywanie JWT**. Główne ryzyko: **automatyzacja bezpieczeństwa daje fałszywe poczucie pokrycia, mimo że sprawdza tylko powierzchowne sygnały**. Po lekturze powinieneś umieć zaprojektować testy niefunkcjonalne, które dają użyteczny dowód, ale nie obiecują więcej, niż mogą sprawdzić.

## Sytuacja przewodnia

zespół chce dodać podstawowy security smoke do CI, który wykryje brak nagłówków, publicznie dostępny panel admina i proste XSS w formularzu

## 1. Pentest a automatyzacja

Test penetracyjny wymaga myślenia ofensywnego i kontekstu. Automatyzacja może wspierać security smoke, ale nie zastępuje pentestera.

## 2. OWASP ZAP

ZAP może skanować aplikację i wykrywać część problemów. Wyniki wymagają triage, bo mogą zawierać false positives.

## 3. Injection

SQL injection i XSS warto testować na kontrolowanych payloadach. Nigdy nie wykonuj agresywnych testów na środowisku bez zgody.

## 4. Auth bypass

Próby obejścia autoryzacji powinny sprawdzać role, brak tokena, cudzy zasób i bezpośredni dostęp do URL.

## 5. Rate limiting i JWT

Rate limiting chroni przed nadużyciem, a JWT musi być przechowywany bezpiecznie. Testy mogą wykrywać regresje podstawowych ustawień.

## Przykład referencyjny

```typescript
const response = await request.get('/admin');
expect([401, 403]).toContain(response.status());

const headers = response.headers();
expect(headers['x-frame-options'] ?? headers['content-security-policy']).toBeTruthy();
```

Przykład pokazuje, że test niefunkcjonalny powinien mieć jasny zakres i interpretację. Wynik automatyczny jest sygnałem, który trzeba rozumieć w kontekście ryzyka.

## Lista kontrolna

- Czy test dotyczy konkretnego ryzyka?
- Czy wynik jest możliwy do audytu?
- Czy scenariusz obejmuje wariant negatywny lub fallback?
- Czy automatyzacja nie udaje pełnego audytu eksperckiego?
- Czy dane wrażliwe są chronione?
- Czy raport zawiera dowody potrzebne do decyzji?

## Głębsza analiza tematu: SQL

Bezpośredni dostęp do bazy danych w testach Playwright pozwala na:
1. **Weryfikację danych**: Sprawdź czy po rejestracji rekord w tabeli `users` faktycznie powstał.
2. **Setup danych**: Wstaw zamówienie bezpośrednio do bazy, aby od razu przetestować stronę jego szczegółów.
3. **Cleanup**: Usuń użytkownika po teście, aby nie zaśmiecać środowiska.
Używaj bibliotek takich jak `pg` (PostgreSQL) czy `mysql2` wewnątrz swoich testów lub fikstur.
