# Testy Kontraktowe w CI/CD — Automatyczna Ochrona przed Breaking Changes

> **Perspektywa Full Stack Testera**
> Test kontraktowy ma wartość dopiero wtedy, gdy jest częścią procesu dostarczania oprogramowania. Lokalny kontrakt, który nie blokuje wdrożeń, to tylko dokument — i to dokument, który szybko się zdezaktualizuje, bo nikt nie widzi rezultatu jego weryfikacji. W tej lekcji zbudujesz od podstaw kompletny pipeline CI/CD dla testów kontraktowych: od publikacji kontraktów przez konsumentów, przez weryfikację dostawcy, po automatyczne can-i-deploy z blokowaniem breaking changes. Nauczysz się też raportować drift kontraktów — rozjazdy między specyfikacją, implementacją i realnym użyciem — zanim staną się problemami produkcyjnymi.

---

## Cel lekcji

Po tej lekcji będziesz potrafić:

- **Integrować** testy kontraktowe z CI/CD (GitHub Actions, GitLab CI, Jenkins)
- **Konfigurować** automatyczną publikację kontraktów po testach
- **Weryfikować** kontrakty konsumentów w pipeline dostawcy
- **Blokować** wdrożenia przy niespełnionych kontraktach (can-i-deploy)
- **Raportować** drift między specyfikacją, implementacją i dokumentacją
- **Projektować** quality gates z jasnym komunikatem dla zespołu

---

## Wprowadzenie — dlaczego CI/CD jest krytyczny

Wielu programistów pisze testy kontraktowe lokalnie i... na tym kończy. Kontrakt leży w pliku JSON, który nigdy nie jest publikowany, weryfikowany ani monitorowany. Tak napisany kontrakt nie różni się od dokumentacji tworzonej po fakcie — jest martwy.

Prawdziwa wartość testów kontraktowych powstaje dopiero wtedy, gdy:
- **Każdy commit** konsumenta publikuje swój kontrakt do Brokera
- **Każdy commit** dostawcy weryfikuje kontrakty wszystkich konsumentów
- **Każde wdrożenie** sprawdza can-i-deploy i blokuje się przy niespełnionych kontraktach
- **Każdy breaking change** generuje jasny raport wskazujący dotkniętych konsumentów

---

## Sytuacja przewodnia — pipeline kontraktowy end-to-end

Frontend checkout publikuje kontrakt do Pact Broker. Backend orders-api weryfikuje go w swoim pipeline. Przed wdrożeniem na staging sprawdzane jest can-i-deploy. Jeśli kontrakt nie jest spełniony — pipeline jest blokowany z jasnym komunikatem.

---

## 1. Architektura pipeline kontraktowego

### 1.1 Przepływ end-to-end

```
┌──────────────────────────────────────────────────────────────────┐
│                      CONSUMER PIPELINE (Frontend)                │
│                                                                   │
│  Push → Testy Consumer → Pact File → Pact Broker → Tag Version   │
│                                          │                       │
└──────────────────────────────────────────┼───────────────────────┘
                                           │ Kontrakt + wersja
                                           ▼
                              ┌────────────────────────┐
                              │     PACT BROKER        │
                              │                        │
                              │  Przechowuje:          │
                              │  - Kontrakty           │
                              │  - Weryfikacje         │
                              │  - Wersje              │
                              │  - Tagi                │
                              └───────────┬────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
    ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐
    │  PROVIDER PIPELINE   │  │  PROVIDER PIPELINE   │  │   MOBILE     │
    │  (orders-api)        │  │  (products-api)      │  │   (mobile)   │
    │                      │  │                      │  │              │
    │  1. Pobierz kontrakty│  │  1. Pobierz kontrakty│  │  ...         │
    │  2. Verify           │  │  2. Verify           │  │              │
    │  3. can-i-deploy     │  │  3. can-i-deploy     │  │              │
    │  4. Deploy/stop      │  │  4. Deploy/stop      │  │              │
    └──────────────────────┘  └──────────────────────┘  └──────────────┘
```

### 1.2 Komponenty potrzebne w CI

| Komponent | Cel | Jak skonfigurować |
|-----------|-----|-------------------|
| **Pact Broker** | Centralne repozytorium kontraktów | Cloud (pact.io) lub self-hosted Docker |
| **Pact Token** | Autoryzacja w CI | Zmienna env `PACT_BROKER_TOKEN` |
| **Consumer Pipeline** | Publikacja kontraktów | Po testach, z wersją i tagami |
| **Provider Pipeline** | Weryfikacja kontraktów | can-i-deploy przed deploy |
| **Artifact Storage** | Przechowywanie wyników | S3, GitHub Artifacts, etc. |

---

## 2. Consumer Pipeline — publikacja kontraktów

### 2.1 GitHub Actions — consumer workflow

```yaml
# .github/workflows/consumer-contracts.yml
name: Consumer Contract Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  PACT_BROKER_URL: https://cloud.pact.io
  PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}

jobs:
  pact-tests:
    name: Consumer Contract Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run Pact consumer tests
        run: npx playwright test tests/pact/consumer --reporter=json
        
      - name: Publish Pact contract
        if: github.ref == 'refs/heads/main'
        run: |
          npx pact-plugin publish \
            --broker-base-url=$PACT_BROKER_URL \
            --broker-token=$PACT_BROKER_TOKEN \
            --consumer-version=${{ github.sha }} \
            --build-url=${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        continue-on-error: false
        
      - name: Tag consumer version with branch
        if: github.ref == 'refs/heads/main'
        run: |
          npx pact-broker create-version-tag \
            --broker-base-url=$PACT_BROKER_URL \
            --broker-token=$PACT_BROKER_TOKEN \
            --pacticipant=checkout-frontend \
            --version=${{ github.sha }} \
            --tag=main
            
      - name: Tag consumer version with environment
        if: github.ref == 'refs/heads/develop'
        run: |
          npx pact-broker create-version-tag \
            --broker-base-url=$PACT_BROKER_URL \
            --broker-token=$PACT_BROKER_TOKEN \
            --pacticipant=checkout-frontend \
            --version=${{ github.sha }} \
            --tag=develop

      - name: Upload Pact results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: pact-results
          path: |
            pact-results/*.json
            pact-results/*.log
          retention-days: 30
```

### 2.2 Skrypt publikacji kontraktów

```typescript
// scripts/publish-contracts.ts
import { Publisher } from '@pact-foundation/pact';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

async function publishContracts() {
  const pactFilesDir = join(process.cwd(), 'pacts');
  const pactFiles = readdirSync(pactFilesDir).filter(f => f.endsWith('.json'));
  
  if (pactFiles.length === 0) {
    console.log('⚠️  No pact files found, skipping publication');
    return;
  }
  
  const publisher = new Publisher({
    pactBroker: process.env.PACT_BROKER_URL!,
    pactBrokerToken: process.env.PACT_BROKER_TOKEN!,
    consumerVersion: process.env.GIT_SHA || process.env.npm_package_version || '1.0.0',
    buildUrl: process.env.BUILD_URL || process.env.GITHUB_SERVER_URL + '/' + process.env.GITHUB_REPOSITORY + '/actions/runs/' + process.env.GITHUB_RUN_ID,
    tagWithGitBranch: true,
    tags: [process.env.GITHUB_REF_NAME || 'main'],
  });
  
  console.log(`📤 Publishing ${pactFiles.length} contract(s)...`);
  
  try {
    await publisher.publishPacts({
      pactFiles: pactFiles.map(f => join(pactFilesDir, f)),
    });
    console.log('✅ Contracts published successfully');
    
    // Wyświetl podsumowanie
    for (const file of pactFiles) {
      console.log(`   - ${file}`);
    }
  } catch (error) {
    console.error('❌ Failed to publish contracts:', error);
    process.exit(1);
  }
}

publishContracts();
```

---

## 3. Provider Pipeline — weryfikacja i can-i-deploy

### 3.1 GitHub Actions — provider workflow

```yaml
# .github/workflows/provider-contracts.yml
name: Provider Contract Verification

on:
  push:
    branches: [main, develop, 'release/**']
  pull_request:
    branches: [main]

env:
  PACT_BROKER_URL: https://cloud.pact.io
  PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
  PROVIDER_BASE_URL: ${{ secrets.PROVIDER_STAGING_URL }}

jobs:
  contract-verification:
    name: Contract Verification
    runs-on: ubuntu-latest
    
    services:
      api:
        image: ${{ env.IMAGE_NAME }}:${{ env.IMAGE_TAG }}
        ports:
          - 3000:3000
        env:
          DATABASE_URL: postgresql://test:test@postgres:5432/test_db
          NODE_ENV: test
        options: >-
          --health-cmd "curl -f http://localhost:3000/health || exit 1"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
          
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U test"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Wait for API to be ready
        run: |
          echo "Waiting for API to be ready..."
          for i in {1..60}; do
            if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
              echo "API is ready!"
              break
            fi
            echo "Attempt $i/60..."
            sleep 2
          done
          
      - name: Run provider verification
        env:
          PROVIDER_BASE_URL: http://localhost:3000
          PACT_BROKER_URL: https://cloud.pact.io
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
          GIT_SHA: ${{ github.sha }}
          CI: true
        run: |
          npx playwright test tests/pact/provider \
            --reporter=json \
            --workers=2
            
      - name: Publish verification results
        if: always()
        env:
          PROVIDER_VERSION: ${{ github.sha }}
        run: |
          echo "Publishing verification results..."
          # Playwright + Pact publikuje automatycznie jeśli skonfigurowane
          
      - name: Check can-i-deploy
        if: github.ref == 'refs/heads/main'
        env:
          PACT_BROKER_URL: https://cloud.pact.io
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
        run: |
          echo "Checking if provider can be deployed..."
          npx pact-broker can-i-deploy \
            --broker-base-url=$PACT_BROKER_URL \
            --broker-token=$PACT_BROKER_TOKEN \
            --pacticipant=orders-api \
            --version=${{ github.sha }} \
            --to-environment=staging \
            --output=json | tee can-i-deploy-result.json
          
      - name: Report can-i-deploy result
        if: github.ref == 'refs/heads/main'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const result = JSON.parse(fs.readFileSync('can-i-deploy-result.json', 'utf-8'));
            
            if (!result.deployable) {
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: [
                  '## ❌ Cannot Deploy — Contract Verification Failed',
                  '',
                  `**Reason:** ${result.reason}`,
                  '',
                  '**Affected consumers:**',
                  ...(result.consumerContracts || []).map(c => 
                    `- ${c.consumer} (${c.consumerVersion}) — ${c.status}`
                  ),
                  '',
                  '**Solution:**',
                  '- Fix the breaking change in this PR, OR',
                  '- Contact affected teams to update their contracts, OR',
                  '- Use can-i-deploy --force if breaking change is intentional',
                ].join('\n'),
              });
              
              process.exit(1);
            } else {
              console.log('✅ All contract checks passed — deployment allowed');
            }
            
      - name: Upload verification artifacts
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: contract-verification-results
          path: |
            pact-verification-results/**/*-results.json
            can-i-deploy-result.json
          retention-days: 30
```

### 3.2 Playwright provider test z Pact

```typescript
// tests/pact/provider/orders-api.provider.spec.ts
import { test, expect, request as apiRequest } from '@playwright/test';
import { Verifier } from '@pact-foundation/pact';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Orders API — Provider Contract Verification', () => {
  
  let verifier: Verifier;
  
  test.beforeAll(async () => {
    verifier = new Verifier({
      provider: 'orders-api',
      providerBaseUrl: process.env.PROVIDER_BASE_URL || 'http://localhost:3000',
      pactBrokerUrl: process.env.PACT_BROKER_URL,
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,
      consumerVersionSelectors: [
        { mainBranch: true },
        { latest: true, fallbackTag: 'prod' },
      ],
      publishVerificationResult: process.env.CI === 'true',
      providerVersion: process.env.GIT_SHA || '1.0.0',
      format: ['console', 'json'],
      outDir: './pact-verification-results',
    });
  });
  
  test.afterAll(async () => {
    await verifier.removeServer();
  });
  
  test('weryfikuje kontrakt checkout-frontend dla GET /orders/{orderId}', async ({}) => {
    const result = await verifier.verifyPactsForProvider();
    
    // Sprawdź czy są jakiekolwiek kontrakty do weryfikacji
    if (result.length === 0) {
      console.log('⚠️  No contracts to verify — checking with published pacts');
    }
    
    // Analizuj wyniki weryfikacji
    for (const verification of result) {
      if (verification.success) {
        console.log(`✅ ${verification.consumer}:${verification.consumerVersion} — verified`);
      } else {
        console.error(`❌ ${verification.consumer}:${verification.consumerVersion} — FAILED`);
        for (const failure of verification.failures || []) {
          console.error(`   - ${failure.interaction}: ${failure.message}`);
        }
      }
    }
  });
  
  // Dodatkowe testy weryfikujące konkretne interakcje
  test('implementation matches contract for successful order retrieval', async ({ request }) => {
    const response = await request.get(`${process.env.PROVIDER_BASE_URL}/api/orders/1001`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Accept': 'application/json',
      },
    });
    
    expect(response.status()).toBe(200);
    
    const order = await response.json();
    
    // Sprawdź wszystkie wymagane przez kontrakt pola
    expect(order).toHaveProperty('id');
    expect(order).toHaveProperty('orderNumber');
    expect(order).toHaveProperty('status');
    expect(order).toHaveProperty('total');
    expect(order).toHaveProperty('customer');
    expect(order.customer).toHaveProperty('email');
    
    // Weryfikuj typy
    expect(typeof order.id).toBe('string');
    expect(typeof order.total).toBe('number');
    expect(['NEW', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'])
      .toContain(order.status);
  });
  
  test('implementation matches contract for 404 error', async ({ request }) => {
    const response = await request.get(`${process.env.PROVIDER_BASE_URL}/api/orders/9999`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Accept': 'application/json',
      },
    });
    
    expect(response.status()).toBe(404);
    
    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('code');
  });
});
```

---

## 4. GitLab CI — kompletny pipeline

```yaml
# .gitlab-ci.yml
stages:
  - test
  - verify-contracts
  - deploy-staging
  - deploy-production

# Consumer: publikacja kontraktów
publish-contracts:
  stage: test
  image: node:20-alpine
  services:
    - postgres:16-alpine
  variables:
    PACT_BROKER_URL: ${PACT_BROKER_URL}
    PACT_BROKER_TOKEN: ${PACT_BROKER_TOKEN}
  script:
    - npm ci
    - npx playwright install --with-deps chromium
    - npx playwright test tests/pact/consumer --reporter=json
    - node scripts/publish-contracts.js
  artifacts:
    when: always
    paths:
      - pacts/*.json
      - playwright-report/
    expire_in: 7 days
  only:
    - main
    - develop
    - merge_requests

# Provider: weryfikacja kontraktów
verify-contracts:
  stage: verify-contracts
  image: node:20-alpine
  services:
    - name: ${API_IMAGE}
      alias: api
    - postgres:16-alpine
  variables:
    PROVIDER_BASE_URL: http://api:3000
    PACT_BROKER_URL: ${PACT_BROKER_URL}
    PACT_BROKER_TOKEN: ${PACT_BROKER_TOKEN}
  script:
    - npm ci
    - npx playwright install --with-deps chromium
    - wait-for-it.sh http://api:3000/health --timeout=120
    - npx playwright test tests/pact/provider --reporter=json
    - npx pact-broker can-i-deploy \
        --broker-base-url=$PACT_BROKER_URL \
        --broker-token=$PACT_BROKER_TOKEN \
        --pacticipant=orders-api \
        --version=${CI_COMMIT_SHA} \
        --to-environment=staging
  artifacts:
    when: always
    paths:
      - pact-verification-results/
      - playwright-report/
    expire_in: 7 days
  only:
    - main
    - develop
    - merge_requests

# Deploy staging (tylko jeśli kontrakty OK)
deploy-staging:
  stage: deploy-staging
  script:
    - kubectl set image deployment/orders-api api=${API_IMAGE}:${CI_COMMIT_SHA}
    - kubectl rollout status deployment/orders-api
  environment:
    name: staging
    url: https://staging.orders.example.com
  needs:
    - verify-contracts
  only:
    - main

# Deploy production (z approval)
deploy-production:
  stage: deploy-production
  script:
    - kubectl set image deployment/orders-api api=${API_IMAGE}:${CI_COMMIT_SHA}
    - kubectl rollout status deployment/orders-api
  environment:
    name: production
    url: https://orders.example.com
    action: prepare
  needs:
    - deploy-staging
  when: manual
  only:
    - main
```

---

## 5. Reporting drift kontraktów

### 5.1 Drift detection script

```typescript
// scripts/report-contract-drift.ts
import { parse } from '@apidevtools/swagger-parser';
import { diff } from 'openapi-diff';
import * as fs from 'fs';

interface DriftReport {
  generatedAt: string;
  specFile: string;
  implementationUrl: string;
  breakingChanges: any[];
  nonBreakingChanges: any[];
  undocumentedEndpoints: any[];
  missingFromSpec: any[];
  score: number;  // 0-100: jakość kontraktu
}

async function checkDrift() {
  const specPath = process.env.OPENAPI_SPEC || './openapi.yaml';
  const implBaseUrl = process.env.IMPLEMENTATION_URL || 'http://localhost:3000';
  
  // 1. Wczytaj specyfikację
  const spec = await parse(specPath);
  console.log(`📄 Loaded spec: ${spec.info.title} v${spec.info.version}`);
  
  // 2. Pobierz aktualną listę endpointów z implementacji
  const response = await fetch(`${implBaseUrl}/api/docs/openapi.json`);
  const implementationSpec = await response.json();
  
  // 3. Porównaj
  const comparison = await diff(spec, implementationSpec);
  
  const report: DriftReport = {
    generatedAt: new Date().toISOString(),
    specFile: specPath,
    implementationUrl: implBaseUrl,
    breakingChanges: comparison.breakingChanges || [],
    nonBreakingChanges: comparison.additions || [],
    undocumentedEndpoints: comparison.undocumentedInSource || [],
    missingFromSpec: comparison.missingInTarget || [],
    score: calculateDriftScore(comparison),
  };
  
  // 4. Zapisz raport
  const reportPath = './contract-drift-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📊 Report saved to ${reportPath}`);
  
  // 5. Wyświetl podsumowanie
  console.log('\n📊 CONTRACT DRIFT REPORT');
  console.log('='.repeat(50));
  console.log(`Quality Score: ${report.score}/100`);
  console.log(`Breaking Changes: ${report.breakingChanges.length}`);
  console.log(`Non-breaking Changes: ${report.nonBreakingChanges.length}`);
  console.log(`Undocumented Endpoints: ${report.undocumentedEndpoints.length}`);
  
  if (report.breakingChanges.length > 0) {
    console.error('\n🔴 BREAKING CHANGES:');
    for (const change of report.breakingChanges) {
      console.error(`  - ${change.path}: ${change.description}`);
    }
  }
  
  if (report.undocumentedEndpoints.length > 0) {
    console.warn('\n🟡 UNDOCUMENTED ENDPOINTS:');
    for (const endpoint of report.undocumentedEndpoints) {
      console.warn(`  - ${endpoint.method} ${endpoint.path}`);
    }
  }
  
  if (report.score < 80) {
    console.error(`\n⚠️  Contract quality below threshold (80/100)`);
    process.exit(1);
  }
  
  console.log('\n✅ Contract drift within acceptable range');
}

function calculateDriftScore(comparison: any): number {
  const totalEndpoints = 50;  // Przykładowo
  const breakingChanges = (comparison.breakingChanges || []).length;
  const undocumented = (comparison.undocumentedInSource || []).length;
  
  const deductions = breakingChanges * 10 + undocumented * 2;
  return Math.max(0, 100 - deductions);
}
```

### 5.2 Dashboard drift w CI

```yaml
# .github/workflows/contract-drift.yml
- name: Generate contract drift report
  run: node scripts/report-contract-drift.ts
  
- name: Upload drift report
  uses: actions/upload-artifact@v4
  with:
    name: contract-drift-report
    path: contract-drift-report.json
    
- name: Comment on PR with drift summary
  if: always()
  uses: actions/github-script@v7
  with:
    script: |
      const report = JSON.parse(fs.readFileSync('contract-drift-report.json', 'utf-8'));
      
      const body = [
        '## 📊 Contract Drift Report',
        '',
        `**Quality Score:** ${report.score}/100`,
        '',
        `| Metric | Value |`,
        `|--------|-------|`,
        `| Breaking Changes | ${report.breakingChanges.length} |`,
        `| Non-breaking Changes | ${report.nonBreakingChanges.length} |`,
        `| Undocumented Endpoints | ${report.undocumentedEndpoints.length} |`,
        '',
        report.score < 80 ? '⚠️ **Contract quality below threshold**' : '✅ Contract quality OK',
      ].join('\n');
      
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body,
      });
```

---

## 6. Quality gate — konfiguracja i best practices

### 6.1 Zasady quality gate

| Zasada | Opis |
|--------|------|
| **Blokuj breaking changes** | can-i-deploy fail = deployment blocked |
| **Jasny komunikat** | Kto, co, kiedy, jak naprawić |
| **Nie blokuj bez powodu** | Non-breaking changes przechodzą swobodnie |
| **Ignoruj kontrolowane zmiany** | Możliwość wyłączenia sprawdzenia dla danej zmiany |
| **Monitoring** | Raportuj metryki pass/fail rate |

### 6.2 Konfiguracja gate w pipeline

```yaml
# Quality gate: blokuj tylko przy breaking changes
contract-gate:
  stage: contract-check
  script: |
    echo "Running contract quality gate..."
    
    RESULT=$(npx pact-broker can-i-deploy \
      --broker-base-url=$PACT_BROKER_URL \
      --broker-token=$PACT_BROKER_TOKEN \
      --pacticipant=orders-api \
      --version=$CI_COMMIT_SHA \
      --to-environment=staging \
      --output=json 2>&1)
    
    echo "$RESULT" | jq .
    
    if echo "$RESULT" | jq -e '.deployable == false' > /dev/null; then
      REASON=$(echo "$RESULT" | jq -r '.reason')
      echo "❌ Deployment blocked: $REASON"
      echo ""
      echo "Affected consumers:"
      echo "$RESULT" | jq -r '.consumerContracts[] | "- \(.consumer) (\(.consumerVersion)): \(.status)"'
      exit 1
    fi
    
    echo "✅ All contract checks passed"
  allow_failure: false  # Ten gate jest obowiązkowy!
```

### 6.3 Override dla kontrolowanych breaking changes

```bash
# Jeśli zmiana jest świadoma i zaakceptowana:
npx pact-broker can-i-deploy \
  --broker-base-url=$PACT_BROKER_URL \
  --broker-token=$PACT_BROKER_TOKEN \
  --pacticipant=orders-api \
  --version=$CI_COMMIT_SHA \
  --to-environment=staging \
  --override-rule=changed \
  --reason="Breaking change in v3 API — consumers notified, 90-day deprecation period"
```

---

## 7. Metrics i monitoring

### 7.1 Metryki do śledzenia

| Metryka | Cel | Częstotliwość |
|---------|-----|--------------|
| **Pass rate kontraktów** | Ogólna zdrowotność | Tygodniowo |
| **Czas weryfikacji** | Wydajność pipeline | Po każdym pipeline |
| **Breaking changes count** | Ryzyko regresji | Po każdym PR |
| **Consumer adoption** | Postęp migracji | Miesięcznie |
| **Drift score** | Jakość dokumentacji | Codziennie |
| **Override count** | Nadużycie override | Kwartalnie |

### 7.2 Prometheus metrics

```typescript
// metrics/contract-metrics.ts
app.get('/metrics', (req, res) => {
  const metrics = {
    // Kontrakty
    contracts_published_total: db.query('SELECT COUNT(*) FROM contracts'),
    contracts_verified_total: db.query('SELECT COUNT(*) FROM verifications'),
    contract_verification_duration_seconds: histogram.observe,
    breaking_changes_detected_total: counter.increment,
    
    // Deployment
    can_i_deploy_allowed_total: counter.increment,
    can_i_deploy_blocked_total: counter.increment,
    
    // Jakość
    contract_drift_score: gauge.set(score),
    deprecated_fields_usage_ratio: gauge.set(usageRatio),
  };
  
  res.set('Content-Type', 'text/plain');
  res.send(formatPrometheusMetrics(metrics));
});
```

---

## Perspektywa Full Stack Testera

Testy kontraktowe w CI/CD to moment, w którym teoria staje się praktyką. Jako Full Stack Tester powinieneś:

- **Pilnować pipeline** — każdy breaking change musi być wykryty w CI, nie w produkcji
- **Pisać jasne komunikaty** — wynik can-i-deploy musi być zrozumiały dla każdego w zespole
- **Monitorować drift** — rozjazd między specyfikacją a implementacją to ryzyko
- **Brać udział w gate review** — jeśli override jest potrzebny, musisz wiedzieć dlaczego

Pamiętaj: kontrakt, który nie jest w CI, jest martwym kontraktem. Dopóki nie blokuje wdrożeń — nie chroni nikogo.

---

## Podsumowanie

- **Consumer pipeline** publikuje kontrakty po testach — wersja + tag + build URL
- **Provider pipeline** weryfikuje kontrakty konsumentów przed wdrożeniem
- **can-i-deploy** blokuje deployment przy niespełnionych kontraktach
- **Quality gate** musi mieć jasny komunikat: kto, co, jak naprawić
- **Drift reporting** wykrywa rozjazdy między specyfikacją a implementacją
- **Monitoring** metryk pozwala śledzić zdrowotność kontraktów w czasie
- **Override** jest dostępne dla kontrolowanych breaking changes, ale wymaga uzasadnienia

---

## Linki i źródła

- **[Pact Broker — CI/CD Integration](https://docs.pact.io/pact_broker/continuous_integration)** — oficjalny przewodnik integracji
- **[GitHub Actions + Pact](https://github.com/pact-foundation/pact-plugins)** — integracja GitHub Actions z Pact
- **[GitLab CI + Pact](https://docs.gitlab.com/ee/ci/examples/)** — wzorce GitLab CI dla Pact
- **[Can I Deploy — API Reference](https://docs.pact.io/pact_broker/can_i_deploy/api)** — pełna dokumentacja can-i-deploy
- **[OpenAPI Diff](https://github.com/OpenAPITools/openapi-diff)** — wykrywanie breaking changes w OpenAPI
- **[Contract Testing — Martin Fowler](https://martinfowler.com/articles/consumer-driven-contracts.html)** — artykuł Martina Fowlera o CDCT
- **[Pactflow — CI/CD Best Practices](https://pactflow.io/blog/contract-testing-in-ci-cd/)** — best practices dla contract testing w CI/CD
---

## OpenAPI diff w pipeline

W CI warto porównywać specyfikację z poprzednią wersją:

```bash
openapi-diff old.yaml new.yaml
```

Celem jest wykrycie zmian łamiących przed merge. Nie każda zmiana specyfikacji jest błędem, ale każda breaking change powinna być świadoma i opisana.

## Contract tests jako quality gate

Dobry pipeline kontraktów ma kilka bramek:

- lint OpenAPI;
- walidacja przykładów;
- testy API względem schema;
- publikacja Pact przez konsumenta;
- provider verification;
- `can-i-deploy` przed deployem.

## Raportowanie kontraktów

Raport powinien mówić:

- który konsument jest zagrożony;
- który endpoint lub message się zmienił;
- czy zmiana jest breaking;
- jaka wersja providera i konsumenta brała udział;
- kto jest właścicielem kontraktu.

## Checklista CI kontraktów

- Czy kontrakty są walidowane w PR?
- Czy provider verification działa na aktualnym kodzie providera?
- Czy deployment blokuje znane breaking changes?
- Czy kontrakty eventów są sprawdzane tak jak HTTP?
- Czy raport wskazuje właściciela problemu?
