# Kubernetes, sekrety i flagi funkcji

Kubernetes jest platformą do uruchamiania, skalowania i zarządzania aplikacjami kontenerowymi. Full Stack Tester nie musi być administratorem klastra, ale powinien rozumieć podstawowe obiekty i komendy diagnostyczne. Wiele problemów testów E2E w środowiskach testowych wynika z rolloutów, sekretnych zmiennych, złych healthchecków, błędnej konfiguracji Ingress albo feature flag.

## 1. Podstawowe obiekty Kubernetes

Najważniejsze pojęcia:

- **Pod** — najmniejsza jednostka uruchomieniowa, zawiera jeden lub więcej kontenerów;
- **Deployment** — zarządza replikami Podów i rolloutem;
- **Service** — stabilny adres sieciowy dla Podów;
- **Ingress** — wejście HTTP/HTTPS do usług;
- **ConfigMap** — konfiguracja niesekretna;
- **Secret** — dane wrażliwe;
- **Namespace** — izolacja logiczna;
- **Job/CronJob** — zadania jednorazowe lub cykliczne.

## 2. Deployment i rollout

Deployment kontroluje wersję aplikacji:

```bash
kubectl get deployments
kubectl rollout status deployment/api
kubectl rollout history deployment/api
kubectl rollout undo deployment/api
```

Jeśli testy zaczęły padać po deployu, sprawdź rollout, obraz kontenera i eventy.

## 3. Service i Ingress

Service daje stabilną nazwę dla Podów. Ingress publikuje aplikację na zewnątrz klastra.

Diagnoza:

```bash
kubectl get svc
kubectl get ingress
kubectl describe ingress app
```

Typowe problemy:

- zła ścieżka Ingress;
- brak TLS;
- routing do złego Service;
- Service nie ma endpoints;
- readiness probe nie przepuszcza Podów.

## 4. Probes

Kubernetes używa probes:

- **startupProbe** — czy aplikacja wystartowała;
- **readinessProbe** — czy może przyjmować ruch;
- **livenessProbe** — czy trzeba ją zrestartować.

Źle ustawiona readiness może powodować losowe 503. Brak readiness może kierować ruch do aplikacji, która jeszcze migruje bazę.

## 5. ConfigMap i Secret

ConfigMap przechowuje konfigurację niesekretną:

```bash
kubectl get configmap
kubectl describe configmap app-config
```

Secret przechowuje dane wrażliwe:

```bash
kubectl get secrets
```

Nie wypisuj sekretów do logów. Pamiętaj, że Kubernetes Secret nie jest automatycznie magicznie bezpieczny — wymaga właściwego RBAC, szyfrowania i polityk dostępu.

## 6. kubectl diagnostics

Najważniejsze komendy testera:

```bash
kubectl get pods
kubectl describe pod <pod>
kubectl logs <pod>
kubectl logs <pod> --previous
kubectl exec -it <pod> -- sh
kubectl port-forward svc/api 8080:80
kubectl get events --sort-by=.lastTimestamp
```

`describe` pokazuje eventy, probes, restarty i problemy z obrazem. `logs --previous` pomaga, gdy kontener restartuje się w pętli.

## 7. Ephemeral environments

W nowoczesnych zespołach często tworzy się środowisko per Pull Request. Tester powinien wiedzieć:

- jaki jest URL środowiska;
- kiedy jest tworzone i usuwane;
- jak są seedowane dane;
- gdzie są logi;
- jak działa feature flag;
- jakie sekrety są dostępne.

## 8. Feature flags

Feature flag pozwala włączyć funkcję bez osobnego deployu. Testuj warianty:

- flaga wyłączona;
- flaga włączona;
- rollout procentowy;
- rola/tenant z dostępem;
- rollback flagi;
- niezgodność front/back przy różnym stanie flag.

Flagi powinny być częścią danych testowych i raportu. Jeśli test pada tylko z flagą `newCheckout=true`, raport musi to pokazywać.

## 9. Sekrety w CI i K8s

Nie commituj sekretów. W CI używaj secrets platformy. W Kubernetes używaj Secret lub zewnętrznego secret managera. Testy nie powinny drukować env vars do logów.

## 10. Checklista K8s dla testera

- Czy wszystkie Pody są Ready?
- Czy rollout zakończył się sukcesem?
- Czy Ingress kieruje na właściwy Service?
- Czy Service ma endpoints?
- Czy logs pokazują błąd aplikacji?
- Czy ConfigMap/Secret są właściwe dla środowiska?
- Czy feature flagi są zapisane w raporcie?
- Czy testy mają dostęp do namespace, w którym działa aplikacja?

## Linki

- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [kubectl Quick Reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- [Kubernetes Workloads](https://kubernetes.io/docs/concepts/workloads/)
- [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Kubernetes ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)

## 11. Namespace per środowisko

Środowiska testowe często działają w osobnych namespace:

```bash
kubectl get pods -n pr-123
kubectl logs deployment/api -n staging
```

Zawsze upewnij się, że diagnozujesz właściwy namespace. Pomyłka namespace prowadzi do fałszywych wniosków.

## 12. Jobs do migracji i seedów

Migracje i seedy często działają jako Kubernetes Job. Jeśli aplikacja nie startuje, sprawdź, czy job migracji zakończył się sukcesem:

```bash
kubectl get jobs
kubectl logs job/db-migrate
```

## 13. Rollback flagi vs rollback deployu

Czasem szybciej wyłączyć feature flagę niż cofać deployment. Tester powinien wiedzieć, który mechanizm kontroluje daną funkcję. Raport błędu powinien zawierać stan flagi.

## 14. Zasada końcowa

Kubernetes daje dużo automatyzacji, ale testy nadal wymagają prostych pytań: czy właściwa wersja działa, czy jest gotowa, czy ma konfigurację i czy ruch trafia tam, gdzie powinien.

## 15. Debugowanie CrashLoopBackOff

Jeśli Pod wpada w CrashLoopBackOff:

```bash
kubectl describe pod <pod>
kubectl logs <pod> --previous
```

Sprawdź zmienne środowiskowe, sekrety, migracje, połączenie z bazą i błędy startu aplikacji. Screenshot z UI nie pomoże, jeśli kontener w ogóle nie startuje.

## 16. Testy a limity zasobów

Kubernetes może zabijać Pody przez OOMKilled albo throttling CPU. Jeśli testy padają tylko pod obciążeniem, sprawdź requests/limits i metryki zasobów. To może być problem platformy, nie kodu testu.

## 17. Zasada końcowa

Tester full stack nie musi zarządzać klastrem, ale musi umieć zebrać dowody: status rollout, logi, events, konfigurację i stan flag funkcji.
