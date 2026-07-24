import type { Lesson } from '../../../renderer/types';
import theory8_2 from './lesson-8.2.md?raw';

export const lesson8_2: Lesson = {
  "id": "8.2",
  "moduleId": 8,
  "title": "Testowanie GraphQL",
  "description": "Opanuj automatyzację zapytań (Queries) i mutacji (Mutations) GraphQL. Poznaj strukturę variables, obsługę jedynego punktu końcowego oraz unikanie pułapki statusu 200 OK przy błędach.",
  "order": 2,
  "difficulty": "advanced",
  "tags": ["GraphQL", "queries", "mutations", "variables", "errors-trap", "API-testing"],
  "content": {
    "objective": "Po ukończeniu tej lekcji potrafisz konstruować zapytania i mutacje GraphQL w Playwright, prawidłowo zarządzać zmiennymi, unikać fałszywych sukcesów przy błędach bazy oraz walidować strukturę błędów GraphQL.",
    "theory": theory8_2,
    "codeExamples": [
      `// Przykład mutacji GraphQL z zmiennymi (Książka 3 - Uppadhyay)
const response = await request.post('/graphql', {
  data: {
    query: \`mutation Add($name: String!) { add(name: $name) { id } }\`,
    variables: { name: 'Klawiatura' }
  }
});
const body = await response.json();
expect(body.errors).toBeUndefined();`
    ],
    "exercises": [
      {
        "id": "ex-8-2-1",
        "title": "Wdrożenie walidacji mutacji GraphQL",
        "description": "Napisz test dla mutacji aktualizującej profil użytkownika. Przekaż zmienne, wykonaj żądanie, upewnij się, że status wynosi 200 OK, tablica `errors` nie istnieje, a dane profilu zostały zaktualizowane."
      }
    ],
    "quiz": [
      {
        "id": "q8-2-1",
        "question": "Dlaczego asercja statusu HTTP toBeOK() jest niewystarczająca podczas testowania ścieżki pozytywnej w GraphQL?",
        "options": [
          "Ponieważ GraphQL zwraca status 200 OK nawet wtedy, gdy zapytanie nie powiodło się, umieszczając błędy wewnątrz tablicy 'errors' w JSON",
          "Ponieważ GraphQL nie obsługuje kodów statusu HTTP",
          "Ponieważ Playwright nie potrafi odczytać statusu zapytań POST",
          "Ponieważ asercja toBeOK() rzuca błąd przy każdym zapytaniu GraphQL"
        ],
        "correctAnswer": 0,
        "explanation": "To klasyczna pułapka (GraphQL error trap). Jeśli zapytanie dotarło do serwera, serwer zawsze zwróci status 200, a ewentualne błędy walidacji czy uprawnień umieści w polu 'errors' wewnątrz odpowiedzi JSON."
      }
    ],
    "references": [
      {
        "title": "Scalable Test Automation with Playwright (Raj Uppadhyay, 2026)",
        "url": "https://rebrand.ly/dae925",
        "description": "Chapter 2: GraphQL queries, mutations, and variables."
      }
    ],
    "tipsAndTricks": [
      "Stosuj szablony tekstu (backticks) w TypeScript do przejrzystego definiowania wielolinijkowych struktur Query i Mutation GraphQL w kodzie."
    ],
    "commonMistakes": [
      {
        "mistake": "Brak sprawdzania obecności pola 'errors' w testach ścieżki sukcesu GraphQL",
        "solution": "Zawsze dodawaj asercję expect(body.errors).toBeUndefined(), aby uniknąć fałszywie zielonych testów."
      }
    ]
  }
};