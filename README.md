# Liste

Einkaufsliste als PWA. Statisches Frontend (GitHub Pages) + Supabase (Auth, Daten, Realtime-Sync).

## Deployen

Alle Dateien ins Repo-Root, GitHub Pages auf `main` / `(root)`.

## Neue Version veröffentlichen

Die Versionsnummer muss an **drei** Stellen hochgezogen werden — sonst zeigt die App
den Update-Hinweis nicht an oder liefert die alte Datei aus dem Cache:

| Datei          | Stelle              |
|----------------|---------------------|
| `index.html`   | `const VERSION = '…'` (ganz oben im Script) |
| `version.json` | `"version": "…"`    |
| `sw.js`        | `const VERSION = '…'` (Zeile 1) |

Alle drei müssen **denselben** Wert haben.

## Wie der Update-Check funktioniert

- Die App kennt ihre eigene Version (`index.html` → `VERSION`).
- Sie lädt `version.json` beim Start, alle 5 Minuten und beim Zurückkehren in die App.
- `version.json` wird bewusst **nie** gecacht (Ausnahme im Service Worker + Cache-Buster im Fetch).
- Weichen die Versionen ab → Banner „Neue Version verfügbar" über dem Eingabefeld.
- „Neu laden" löscht Service-Worker-Registrierungen und alle Caches, dann Reload.

Der Punkt neben der Versionsnummer unten:

| Farbe   | Bedeutung                          |
|---------|------------------------------------|
| grün    | aktuell                            |
| orange  | Update verfügbar (blinkt)          |
| grau    | Check nicht möglich (offline o.ä.) |

## Datenbank

Tabellen `lists` und `items` in Supabase, RLS auf `authenticated`.
Zugang nur über die zwei angelegten Accounts, Self-Signup ist deaktiviert.

Spalten in `items`: `id`, `list_id`, `name`, `done`, `qty`, `pos`, `created_at`.
`pos` steuert die manuelle Reihenfolge (Modus „Eigene"), Schrittweite 1000.
