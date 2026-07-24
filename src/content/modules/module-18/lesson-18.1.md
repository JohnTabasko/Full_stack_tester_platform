# Zaawansowane typowanie i bezpieczeństwo typów w testach (TypeScript)

Podczas pisania testów automatycznych, wielu testerów traktuje TypeScript po prostu jako „JavaScript z kilkoma adnotacjami typu string lub number”. Ślepe nadużywanie typu **`any`** (tzw. wyłączanie kompilatora) oraz brak znajomości zaawansowanych mechanizmów typowania prowadzi do powstawania długu technologicznego. Tracimy wówczas największy atut TypeScriptu: gwarancję wykrycia błędów struktur danych, zanim test zostanie fizycznie uruchomiony w przeglądarce.

Jako profesjonalny Full Stack Tester / SDET, musisz opanować **zasady Type-Safe Testing**. W tej lekcji nauczysz się projektować odporny na błędy kod przy użyciu typu `unknown`, operatora `satisfies` oraz zaawansowanych typów narzędziowych (Utility Types).

---

## 1. Walka z `any`: Wykorzystanie typu `unknown` i strażników typów (Type Guards)

Typ `any` to kapitulacja kompilatora – pozwala na przypisanie i wywołanie dowolnej właściwości bez sprawdzania spójności, co grozi błędami typu *undefined* w locie.

Rzetelną alternatywą jest typ **`unknown`**. Informuje on kompilator, że wartość może mieć dowolną strukturę, ale **zabrania jakichkolwiek operacji na niej**, dopóki nie zostanie przeprowadzona jawna weryfikacja (zawężenie typu – Type Narrowing):

```typescript
// Przykład bezpiecznej walidacji odpowiedzi z API (Książka 3 - Uppadhyay)
function processApiResponse(responsePayload: unknown) {
  // Kompilator zgłosi błąd, jeśli spróbujemy wywołać responsePayload.email!
  
  // Wdrażamy Strażnika Typu (Type Guard)
  if (responsePayload && typeof responsePayload === 'object' && 'email' in responsePayload) {
    // Teraz kompilator bezpiecznie zawęża typ responsePayload i pozwala na odczyt!
    console.log(`Pomyślnie sparsowano e-mail: ${(responsePayload as { email: string }).email}`);
  } else {
    throw new Error('Nieprawidłowa struktura odpowiedzi z API!');
  }
}
```

---

## 2. Operator `satisfies` — Dopasowanie bez utraty szczegółów typowania

Wprowadzony w nowszych wersjach TypeScript operator **`satisfies`** pozwala zweryfikować, czy dany obiekt spełnia określony interfejs, ale w odróżnieniu od klasycznej asercji typu (`const obj: Interface = ...`), **zachowuje najwęższy możliwy typ właściwości**:

```typescript
interface AppConfig {
  baseUrl: string;
  timeout: number;
}

// Wykorzystanie operatora satisfies
const stagingConfig = {
  baseUrl: 'https://staging.sklep.pl',
  timeout: 5000,
  extraLogs: true, // Własna właściwość nadprogramowa
} satisfies AppConfig;

// TypeScript wie, że extraLogs istnieje, ponieważ typ nie został zrzutowany tylko do AppConfig!
console.log(stagingConfig.extraLogs); // PRAWDA
```

---

## 3. Typy Narzędziowe (Utility Types) w danych testowych

Podczas automatyzacji, często korzystamy z modeli danych deweloperskich (np. interfejsu `Product`), ale w testach chcemy zmodyfikować tylko wybrane pola. Pomagają w tym **Utility Types**:

*   **`Partial<Type>`**: Czyni wszystkie właściwości typu opcjonalnymi (doskonałe do testów walidacji negatywnych).
*   **`Pick<Type, Keys>`**: Wybiera podzbiór właściwości z innego typu.
*   **`Omit<Type, Keys>`**: Tworzy typ, usuwając wskazane właściwości z typu bazowego.
*   **`Readonly<Type>`**: Czyni obiekt niemutowalnym, co chroni przed przypadkowym nadpisaniem danych testowych.

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

// Tworzymy typ dla danych wejściowych formularza dodawania produktu (id jest generowane przez bazę, więc go pomijamy)
type ProductFormInput = Omit<Product, 'id'>;

const newProductInput: ProductFormInput = {
  name: 'Buty',
  price: 150,
  category: 'Obuwie'
};
```

---

## 4. Checklista Bezpieczeństwa Typów w Testach
- [ ] Czy Twój plik `tsconfig.json` posiada włączoną opcję `"strict": true`?
- [ ] Czy całkowicie wyeliminowałeś typy `any` ze swojego projektu testowego?
- [ ] Czy wykorzystujesz typ `unknown` w połączeniu ze strażnikami typów do bezpiecznego odczytywania danych sieciowych?
- [ ] Czy stosujesz operator `satisfies` zamiast sztywnego rzutowania typów konfiguracji?
- [ ] Czy używasz typów narzędziowych (`Omit`, `Partial`) do elastycznego zarządzania modelami danych testowych?