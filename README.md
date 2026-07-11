# Liste

Einkaufsliste als PWA. Statisches Frontend (GitHub Pages) + Supabase (Auth, Daten, Realtime-Sync).

---

## !! WICHTIG BEIM ENTPACKEN !!

Das ZIP enthaelt einen Ordner `.github/`. Ordner, die mit einem Punkt beginnen,
werden von iOS, macOS und Windows standardmaessig **ausgeblendet** - du siehst sie
nach dem Entpacken also moeglicherweise gar nicht.

Deshalb liegen die beiden Workflow-Dateien zusaetzlich unversteckt im Ordner
`WORKFLOWS-HIER/`. Inhaltlich sind sie identisch.

**Im GitHub-Repo muessen sie an diesen Pfaden liegen:**

```
.github/workflows/keepalive.yml
.github/workflows/repo-alive.yml
```

### So legst du sie an (klappt auch am Handy)

1. Im Repo: `Add file` -> `Create new file`
2. Als Dateiname eintippen: `.github/workflows/keepalive.yml`
   (die Schraegstriche erzeugen die Ordner automatisch)
3. Inhalt aus `WORKFLOWS-HIER/keepalive.yml` reinkopieren
4. `Commit changes`
5. Das Ganze nochmal fuer `.github/workflows/repo-alive.yml`

---

## Deployen

Alle uebrigen Dateien ins Repo-Root, GitHub Pages auf `main` / `(root)`.

## Die zwei Workflows

### 1. `keepalive.yml` - Supabase wach halten

Supabase pausiert Projekte im Free-Tarif nach etwa einer Woche ohne Zugriff.
Dieser Job pingt die Datenbank alle 3 Tage an.

Er braucht zwei **Repository Secrets**:
`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

| Name            | Wert                                        |
|-----------------|---------------------------------------------|
| `SUPABASE_URL`  | `https://<projekt>.supabase.co`             |
| `SUPABASE_KEY`  | der publishable Key (`sb_publishable_...`)  |

### 2. `repo-alive.yml` - Repo aktiv halten

GitHub deaktiviert geplante Workflows in Repos ohne Commit-Aktivitaet nach 60 Tagen.
Dieser Job schreibt einmal im Monat einen Zeitstempel in die Datei `.keepalive`
und committet ihn. Damit bleibt auch der Supabase-Ping oben dauerhaft aktiv.

Braucht keine Secrets, aber die Berechtigung zum Pushen. Falls der Job mit einem
Permission-Fehler scheitert:
`Settings` -> `Actions` -> `General` -> `Workflow permissions`
-> **Read and write permissions** aktivieren.

### Testen

Tab `Actions` -> Workflow links auswaehlen -> `Run workflow`.
Beide sind manuell ausloesbar (`workflow_dispatch`).

---

## Neue Version veroeffentlichen

Die Versionsnummer muss an **drei** Stellen hochgezogen werden:

| Datei          | Stelle                                      |
|----------------|---------------------------------------------|
| `index.html`   | `const VERSION = '...'` (oben im Script)    |
| `version.json` | `"version": "..."`                          |
| `sw.js`        | `const VERSION = '...'` (Zeile 1)           |

Alle drei muessen **denselben** Wert haben.

## Der Version-Tracker

- Die App kennt ihre eigene Version, laedt `version.json` beim Start,
  alle 5 Minuten und beim Zurueckkehren in die App.
- `version.json` wird nie gecacht (Ausnahme im Service Worker + Cache-Buster).
- Bei Abweichung -> Banner "Neue Version verfuegbar".
- "Neu laden" loescht Service-Worker und Caches, dann Reload.

Punkt neben der Versionsnummer unten:

| Farbe   | Bedeutung                          |
|---------|------------------------------------|
| gruen   | aktuell                            |
| orange  | Update verfuegbar (blinkt)         |
| grau    | Check nicht moeglich (offline)     |

## Wenn die Datenbank doch mal schlaeft

Die App zeigt einen eigenen Screen mit Link zum Supabase-Dashboard.
Dort `Restore` / `Resume` klicken, kurz warten, in der App auf
"Nochmal versuchen" tippen. Es gehen **keine Daten verloren**.

## Datenbank

Tabellen `lists` und `items`, RLS auf `authenticated`.
Self-Signup ist deaktiviert, Zugang nur ueber die angelegten Accounts.

Spalten in `items`: `id`, `list_id`, `name`, `done`, `qty`, `pos`, `created_at`.
`pos` steuert die manuelle Reihenfolge (Modus "Eigene"), Schrittweite 1000.
