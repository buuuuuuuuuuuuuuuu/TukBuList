# List by bu

Geteilte Einkaufsliste als PWA fuer zwei Personen (iPhone + Android).
Statisches Frontend auf GitHub Pages, Supabase als Backend (Auth, Daten, Realtime-Sync).
Kein Build-Step, kein Framework - eine einzelne index.html.

## Deployen

Alle Dateien ins Repo-Root, GitHub Pages auf `main` / `(root)`.
Der Ordner `WORKFLOWS-HIER/` gehoert NICHT ins Repo - siehe LIES-MICH.txt darin.

## Neue Version veroeffentlichen

Die Versionsnummer muss an **drei** Stellen identisch hochgezogen werden:

| Datei          | Stelle                                   |
|----------------|------------------------------------------|
| `index.html`   | `const VERSION = '...'` (oben im Script) |
| `version.json` | `"version": "..."`                       |
| `sw.js`        | `const VERSION = '...'` (Zeile 1)        |

Sonst greift der Update-Check nicht oder die Handys ziehen die alte Datei aus dem Cache.

## Bedienung (Stand v2.x)

- Name antippen: abhaken / wieder oeffnen (erledigte bleichen aus, sinken ans Ende)
- `+` / `−`: Menge (Zahl und Minus erscheinen erst ab 2)
- Nach **links** wischen -> roter Bereich -> "Loeschen" antippen bestaetigt
- Nach **rechts** wischen -> blauer Bereich -> "Verschieben" in andere Liste
  (gleichnamige Eintraege in der Zielliste werden zusammengelegt)
- Griff (≡) ziehen: Reihenfolge, nur im Sortiermodus "Eigene"
- Listen-Tabs unten: antippen wechselt, **lange druecken + ziehen** sortiert um
- Punkt neben dem Listennamen: Akzentfarbe der Liste waehlen (8 Pastelltoene)
- Autocomplete ab dem 3. Buchstaben; Badge zeigt, was ein Tap bewirkt

## Datenbank (Supabase)

- `lists`: id (uuid), name (text), pos (float8), color (text, nullable), created_at
- `items`: id (uuid), list_id (fk -> lists, cascade), name (text), done (bool),
  qty (int, default 1), pos (float8), created_at
- RLS auf `authenticated`, Self-Signup deaktiviert, zwei feste Accounts
- Realtime (postgres_changes) auf beiden Tabellen
- `pos` steuert die manuelle Reihenfolge, Schrittweite 1000
- `color` leer -> Farbe wird aus dem Namen abgeleitet (Hash)

## Workflows (GitHub Actions)

- `keepalive.yml`: pingt Supabase alle 3 Tage (Free Tier pausiert nach ~7 Tagen).
  Braucht Repository Secrets `SUPABASE_URL` und `SUPABASE_KEY`.
- `repo-alive.yml`: Auto-Commit einmal im Monat (GitHub deaktiviert Cron-Workflows
  in Repos ohne Commits nach 60 Tagen). Braucht "Read and write permissions"
  unter Settings -> Actions -> General -> Workflow permissions.

## Version-Tracker

Die App prueft `version.json` beim Start, alle 5 Minuten und beim Zurueckkehren.
`version.json` wird nie gecacht. Bei Abweichung: Banner "Neue Version verfuegbar".
"Neu laden" loescht Service-Worker und Caches, dann Reload.
Punkt unten: gruen = aktuell, orange blinkend = Update da, grau = Check nicht moeglich.

## Wenn die Datenbank schlaeft

Eigener Screen mit Link zum Supabase-Dashboard. Dort Restore/Resume klicken,
kurz warten, "Nochmal versuchen" antippen. Es gehen keine Daten verloren.
