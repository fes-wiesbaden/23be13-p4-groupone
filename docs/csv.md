# CSV importing for users

| Field Name | Required | Valid Options          |
|:-----------|:---------|:-----------------------|
| name       | true     | String                 |
| lastname   | true     | String                 |
| classname  | true     | String                 |
| role       | false    | "teacher" \| "student" |

Wenn keine Rolle existiert oder eine Falsche wird zu `STUDENT` gedefaultet

Es wird ein username auf der serverseite gebildet so wie ein einmal password \
Diese werden zurückgegeben, genauso wie alle fehler und warnungen \
Der username wird gebildet aus: `{vorname}.{nachname}`

Falls eine Person mit dem gleichen vor und nachnamen schon existiert wird an den nutzernamen eine zahl gehängt, diese zählt bis maximal 9
danach kommen fehler und es wird kein weiterer nutzer erstellt

also das wär möglich:

- max.müller
- max.müller1
- max.müller2
- max.müller3
- max.müller4
- max.müller5
- max.müller6
- max.müller7
- max.müller8
- max.müller9

Example

```test.csv
name; lastname; classname; role
herbert; günther; 10be13; teacher
marcel; davis
anivia; egg; 10be13; baguette
riven; ionia; 10be13;
```