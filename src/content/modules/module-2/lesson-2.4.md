# Automatyczne oczekiwanie (Actionability)

To jedna z najważniejszych przewag Playwrighta nad Selenium. W Selenium musiałeś ręcznie pisać `wait.until(...)`. Playwright robi to automatycznie. Zrozumienie mechanizmu **Actionability** pozwoli Ci pisać testy, które nigdy nie są "flaky".

## 1. Co to jest Actionability Check?

Zanim Playwright wykona akcję (np. `click()`), sprawdza szereg warunków dla elementu:
1.  **Attached**: Czy element jest w ogóle w drzewie DOM?
2.  **Visible**: Czy ma niezerowy rozmiar i nie jest ukryty przez CSS (`display: none`, `visibility: hidden`)?
3.  **Stable**: Czy element przestał się poruszać (np. zakończyła się animacja przesuwania)?
4.  **Enabled**: Czy element nie ma atrybutu `disabled`?
5.  **Receiving Events**: Czy element nie jest zasłonięty przez inny element (np. przez modal lub overlay "Ładowanie")?

Playwright będzie ponawiał te sprawdzenia przez określony czas (domyślnie 30s dla akcji), aż warunki zostaną spełnione. Jeśli nie – test rzuci błąd `TimeoutError`.

## 2. Ręczne wymuszanie (Force)

Czasem chcesz kliknąć element, który jest technicznie zasłonięty (np. niewidoczny checkbox, który jest ostylowany obrazkiem). Możesz użyć opcji `force`:
```typescript
await page.getByLabel('Zgadzam się').click({ force: true });
```
*Ostrzeżenie*: Używaj `force: true` tylko wtedy, gdy naprawdę rozumiesz, dlaczego element nie przechodzi testów actionability. Nadużywanie tej opcji prowadzi do testów, które nie odzwierciedlają zachowania prawdziwego użytkownika.

## 3. Czekanie na konkretne stany (Advanced)

Poza automatycznym oczekiwaniem, czasem musisz poczekać na coś nietypowego:
- `page.waitForResponse(url)`: Czekaj, aż serwer odpowie na konkretny request (kluczowe przy testowaniu API + UI).
- `locator.waitFor({ state: 'hidden' })`: Czekaj, aż np. loader zniknie z ekranu.

## 4. Antywzorzec: waitForTimeout

Nigdy nie używaj:
```typescript
await page.waitForTimeout(5000); // ŹLE!
```
Dlaczego?
- Jeśli aplikacja zadziała po 100ms, marnujesz 4.9 sekundy.
- Jeśli aplikacja zadziała po 5100ms, test padnie mimo Twojego "bezpiecznika".

**Złota zasada Full Stack Testera**: Zawsze czekaj na **stan**, nigdy na **czas**.

## Debugowanie w Trace Viewerze
Jeśli test padnie na timeout, otwórz Trace Viewer. Zobaczysz tam zakładkę **"Action"**, która pokaże Ci dokładnie, który warunek actionability nie został spełniony (np. element był "Visible" ale nie był "Stable").

## Źródła
- [Playwright Actionability](https://playwright.dev/docs/actionability)
