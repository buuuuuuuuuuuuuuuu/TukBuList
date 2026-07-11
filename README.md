# Liste

Einkaufsliste als PWA. Statisches Frontend (GitHub Pages) + Supabase (Auth, Daten, Realtime-Sync).

## Deployen

Alle Dateien ins Repo-Root, GitHub Pages auf `main` / `(root)`.

## Keep-alive einrichten (einmalig, wichtig)

Supabase pausiert Projekte im Free-Tarif nach etwa einer Woche ohne Zugriff.
Der Workflow `.github/workflows/keepalive.yml` verhindert das, indem er alle 3 Tage
eine triviale Anfrage schickt.

Damit er laeuft, braucht er zwei **Repository Secrets**:

`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

| Name            | Wert                                        |
|-----------------|---------------------------------------------|
| `SUPABASE_URL`  | `https://<projekt>.supabase.co`             |
| `SUPABASE_KEY`  | der publishable Key (`sb_publishable_...`)  |

Danach im Tab `Actions` einmal `Supabase wach halten` -> `Run workflow` ausloesen,
um zu pruefen, ob es klappt. Es muss `HTTP 200` (oder `401`) und "Projekt ist wach"
in der Ausgabe stehen.

Hinweis: GitHub deaktiviert geplante Workflows in Repos, die 60 Tage lang keinen
Commit gesehen haben. Bei laengerer Funkstille also einmal im Actions-Tab
"Enable workflow" klicken.

## Neue Version veroeffentlichen

Die Versionsnummer muss an **drei** Stellen hochgezogen werden - sonst zeigt die App
den Update-Hinweis nicht an oder liefert die alte Datei aus dem Cache:

| Datei          | Stelle                                      |
|----------------|---------------------------------------------|
| `index.html`   | `const VERSION = '...'` (oben im Script)    |
| `version.json` | `"version": "..."`                          |
| `sw.js`        | `const VERSION = '...'` (Zeile 1)           |

Alle drei muessen **denselben** Wert haben.

## Der Version-Tracker

- Die App kennt ihre eigene Version (`index.html` -> `VERSION`).
- Sie laedt `version.json` beim Start, alle 5 Minuten und beim Zurueckkehren in die App.
- `version.json` wird bewusst **nie** gecacht (Ausnahme im Service Worker + Cache-Buster im Fetch).
- Weichen die Versionen ab -> Banner "Neue Version verfuegbar" ueber dem Eingabefeld.
- "Neu laden" loescht Service-Worker-Registrierungen und alle Caches, dann Reload.

Punkt neben der Versionsnummer:

| Farbe   | Bedeutung                          |
|---------|------------------------------------|
| gruen   | aktuell                            |
| orange  | Update verfuegbar (blinkt)         |
| grau    | Check nicht moeglich (offline)     |

## Wenn die Datenbank doch mal schlaeft

Die App zeigt dann einen eigenen Screen statt einer stumm leeren Liste, mit Link
zum Supabase-Dashboard. Dort `Restore` / `Resume` klicken, ein bis zwei Minuten warten,
in der App auf "Nochmal versuchen" tippen. Es gehen dabei **keine Daten verloren**.

## Datenbank

Tabellen `lists` und `items`, RLS auf `authenticated`.
Zugang nur ueber die angelegten Accounts, Self-Signup ist deaktiviert.

Spalten in `items`: `id`, `list_id`, `name`, `done`, `qty`, `pos`, `created_at`.
`pos` steuert die manuelle Reihenfolge (Modus "Eigene"), Schrittweite 1000.
