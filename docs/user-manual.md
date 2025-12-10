# Benutzerhandbuch für GradeSave

## Inhaltsverzeichnis

| Abschnitt                                                                   |
|-----------------------------------------------------------------------------|
| [Initiale Anmeldung](#initiale-anmeldung)                                   |
| [Passwort ändern](#passwort-ändern)                                         |
| [Nutzerverwaltung](#nutzerverwaltung-nur-für-admins)                        |
| [Rollen im System](#rollen-im-system)                                       |
| [Lernbereiche anlegen](#lernbereiche-anlegen-nur-für-admins)                |
| [Fragen & Fragebögen](#fragen--fragebögen)                                  |
| [Klassen anlegen & verwalten](#klassen-anlegen--verwalten-nur-für-admins)   |
| [Projekte erstellen](#projekte-erstellen-nur-für-admins-oder-klassenlehrer) |
| [Gruppenbildung](#gruppenbildung)                                           |
| [Selbst- und Fremdbewertung](#selbst--und-fremdbewertung)                   |
| [Leistungen & Notenvorschlag](#leistungen--notenvorschlag)                  |
| [Notenübersicht für Schüler](#notenübersicht-für-schüler)                   |

---

## Initiale Anmeldung

Beim ersten Start der Anwendung (Docker-Setup oder lokale Entwicklung) werden automatisch Default-Nutzer angelegt:

| Rolle   | Benutzername | Passwort  |
|---------|--------------|-----------|
| Admin   | `admin`      | `admin`   |
| Lehrer  | `teacher`    | `teacher` |
| Schüler | `student`    | `student` |

Gehen Sie auf die Startseite der Anwendung:  
**http://localhost:3000** (Docker) bzw. **http://localhost:5173** (lokale Entwicklung)

Nach der ersten Anmeldung mit einem Default-Account werden Sie **sofort aufgefordert**, Ihr Passwort zu ändern.

## Passwort ändern

1. Nach dem Login -> Klick auf Ihr Profil-Symbol (oben rechts oder links in der Sitebar)
2. Altes und neues Passwort eingeben -> Speichern  
   Das neue Passwort muss mindestens 8 Zeichen lang sein

## Nutzerverwaltung (nur für Admins)

Menü -> **Benutzerverwaltung**

### 1. Einzelnen Nutzer manuell anlegen
- Klick auf **"Nutzer hinzufügen"**
- Felder ausfüllen: Vorname, Nachname, Benutzername, Rolle, Password

### 2. Massen-Import per CSV
- Klick auf **"CSV-Import"**
- Vorlage herunterladen -> [CSV-Vorlage für Nutzerimport](csv-templates/users-import.csv)
- Hochgeladene CSV wird validiert
- Nach erfolgreichem Import wird **eine Zugangsdaten-PDF** erstellt (enthält Benutzername, Start-Passwort und andere Informationen)
- PDFs können als ZIP heruntergeladen und an die jeweiligen Personen weitergeleitet werden

## Rollen im System

| Rolle                                                                                                                                                                          | Rechte                                                                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Schüler**                                                                                                                                                                    | Nur eigene Zeugnisnoten sehen<br>Kann Fragebögen (Selbstbewertung) ausfüllen                                                                             |
| **Lehrer**                                                                                                                                                                     | Noten eintragen (nur bei zugewiesenen Leistungen)<br>Fragebögen für Projekte erstellen & auswerten<br>Notenvorschläge einsehen und Zeugnisnote festlegen |
| **Admin**     Alle Rechte +<br>Nutzer, Klassen, Lernbereiche, Projekte und Leistungen anlegen<br>Kann keine Noten sehen/eingeben, wenn er nicht gleichzeitig Klassenlehrer ist |

> [!IMPORTANT]
> Zusätzliche Admins können **nur** durch einen Nutzer mit Datenbankzugriff in dieser manuell hochgestuft werden

## Lernbereiche anlegen nur für Admins

Menü -> **Lernbereiche**

- Name (z. B. "Mathematik")
- Kürzel (z. B. "M")
- Beschreibung (optional)
- Typ auswählen:
    - [ ] Lernfeld
    - [x] Schulfach

Lernbereiche sind die Grundlage für spätere Noten und Fragebögen.

## Fragen & Fragebögen

Menü -> **Fragen** oder direkt im Fragebogen

### Zwei Fragetypen
| Typ        | Antwortmöglichkeit | Auswertung                                        |
|------------|--------------------|---------------------------------------------------|
| Notenfrage | 1–6 (Note)         | Automatischer Durchschnitt Selbst-/Fremdbewertung |
| Textfrage  | Freitext           | Muss vom Lehrer manuell bewertet werden           |

Fragen, die einem Lernbereich zugeordnet sind, stehen automatisch in allen Projekten dieses Lernbereichs zur Verfügung, solange das Projekt im Bearbeitungsstatus bei der Fragenerstellung war

## Klassen anlegen & verwalten nur für Admins

Menü -> **Klassen**

- Klassenname (z. B. "10BE13")
- Optional: Klassenlehrer zuweisen
- Schüler hinzufügen (Ein Schüler kann nur in einer Klasse sein)
- Lehrer hinzufügen (können mehreren Klassen angehören)

## Projekte erstellen nur für Admins oder Klassenlehrer

Menü -> **Projekte** -> **Neues Projekt**

1. Projektname & Klasse auswählen
2. Lernbereiche hinzufügen mit der Dauer (werden später für Noten benötigt)
3. Gruppen manuell erstellen **oder** automatisch generieren lassen
4. Erstellen

## Gruppenbildung

- **Manuell**: Leere Gruppe anlegen -> Schüler hinzufügen
- **Automatisch**: Anzahl der Gruppen angeben -> "Gruppen automatisch erstellen"

## Selbst- und Fremdbewertung

Menü -> **"Fragebogen"** -> Projekt auswählen

- Alle Fragen der gewählten Lernbereiche sind bereits vorhanden
- Nicht benötigte Fragen können entfernt werden
- Neue Fragen können direkt im Fragebogen erstellt werden
- Man kann sich ein Preview als Schüler ansehen lassen
- Wenn der Fragebogen fertig ist -> Status auf **"Bereit für Schüler"** setzen

Schüler sehen den Fragebogen nun im Dashboard und können ihn ausfüllen.

Lehrer sehen anschließend:
- Durchschnitt pro Gruppe
- Einzelantworten jedes Schülers

## Leistungen & Notenvorschlag

Menü -> **"Leistungen & Noten"**

1. Neue Leistung anlegen (nur Admin oder Klassenlehrer)
    - Name (z. B. "Klassenarbeit 1")
    - Zugehöriger Lernbereich
    - Gewichtung (z. B. 30)
    - Verantwortlicher Lehrer auswählen
2. Nur der zugewiesene Lehrer kann später Noten eintragen
3. Sobald alle Leistungen eines Lernbereichs benotet sind -> erscheint ein **Notenvorschlag**  
   (berücksichtigt Lehrer-Noten + Durchschnitt aus Selbst-/Fremdbewertung)
4. Der zuständige Lehrer legt die finale **Zeugnisnote** fest

Schüler sehen **nur die finale Zeugnisnote** - einzelne Leistungsnoten bleiben verborgen

## Notenübersicht für Schüler

Menü -> **"Leistungen & Noten"**

- Zeugnisnoten der einzelnen Lernbereiche des Projektes
