# Kontrakty API i automatyczna walidacja schematów (JSON Schema Validation)

W architekturze opartej o mikroserwisy (Microservices), stabilność integracji między systemami zależy bezpośrednio od przestrzegania wspólnego formatu przesyłania danych – tzw. **kontraktu API**. Jeśli zespół backendowy wprowadzi zmianę (np. usunie pole, zmieni jego typ z liczby na string lub zmieni nazwę klucza), aplikacja frontendowa natychmiast przestanie działać, powodując krytyczną awarię.

Tradycyjne sprawdzanie pojedynczych właściwości (np. `expect(body.name).toBeDefined()`) nie wykryje wszystkich naruszeń kontraktu. Profesjonalnym standardem inżynieryjnym jest **automatyczna walidacja schematów odpowiedzi (JSON Schema Validation)** przy użyciu biblioteki **AJV** (Another JSON Schema Validator).

---

## 1. Koncepcja Kontraktu i JSON Schema

**JSON Schema** to standard opisujący strukturę dokumentu JSON: jakie pola są wymagane, jakiego muszą być typu (string, number, boolean, array), jakie wzorce muszą spełniać (np. format e-mail) oraz jakie są ich dopuszczalne wartości.

Przykładowy schemat użytkownika (`UserSchema`):

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "role": { "type": "string", "enum": ["customer", "admin"] },
    "isActive": { "type": "boolean" }
  },
  "required": ["id", "email", "role", "isActive"]
}
```

---

## 2. Integracja biblioteki AJV w Playwright

Aby zautomatyzować weryfikację struktury kontraktu, używamy biblioteki **AJV**, która w ułamku milisekundy dopasuje odpowiedź z API do zadeklarowanego schematu:

```typescript
import { test, expect } from '@playwright/test';
import Ajv from 'ajv';

// Inicjalizacja instancji AJV
const ajv = new Ajv({ allErrors: true }); // Zgłoś wszystkie błędy naraz

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: ['customer', 'admin'] },
  },
  required: ['id', 'email', 'role'],
};

test('audyt zgodności kontraktu JSON z API', async ({ request }) => {
  const response = await request.get('/api/v1/user/12');
  await expect(response).toBeOK();
  
  const body = await response.json();

  // 1. Skompiluj schemat w AJV
  const validate = ajv.compile(userSchema);
  
  // 2. Wykonaj walidację danych odpowiedzi
  const isValid = validate(body);

  // 3. Weryfikujemy rezultat. W razie błędu, wypisujemy szczegóły naruszenia kontraktu!
  if (!isValid) {
    console.error('Naruszenie kontraktu API! Szczegóły błędów:', validate.errors);
  }
  
  expect(isValid, `Błędy kontraktu: ${ajv.errorsText(validate.errors)}`).toBe(true);
});
```

---

## 3. Dlaczego to podejście jest lepsze?
*   **100% pewności**: Masz absolutną gwarancję, że struktura odpowiedzi jest zgodna ze specyfikacją OpenAPI/Swagger.
*   **Rzetelna diagnostyka**: W przypadku awarii, raport testowy precyzyjnie wskaże, które pole naruszyło kontrakt (np. `data.email should match format "email"`).
*   **Ochrona przed regresją**: Natychmiast wykrywasz nieudokumentowane zmiany wprowadzane przez programistów backendowych przed wydaniem kodu na produkcję.

---

## 4. Checklista Walidacji Kontraktów
- [ ] Czy zdefiniowałeś schematy JSON dla kluczowych odpowiedzi API w swoim projekcie?
- [ ] Czy używasz walidatora AJV z włączoną opcją `allErrors: true` w celu zebrania pełnej listy niezgodności kontraktu?
- [ ] Czy w przypadku niepowodzenia walidacji rzucasz błąd zawierający szczegółowy tekst błędów generowany przez `ajv.errorsText()`?
- [ ] Czy zweryfikowałeś obecność wszystkich wymaganych pól (`required`) w schemacie?