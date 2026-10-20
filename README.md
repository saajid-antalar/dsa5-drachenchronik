# DSA5 – Drachenchronik

Foundry-VTT-Modul für Foundry VTT 14 und DSA5 8.1.11.

## Tagesereignis der Khôm

Die Spielleitung öffnet **Einstellungen → Modul-Einstellungen → Drachenchronik → Tagesereignis auslösen**. Sie gibt den aventurischen Kalendertag ein. Pro identischem Kalendertag lässt das Modul global in der Welt nur einen Auswurf zu – unabhängig von Sitzungen oder verstrichenen Echtzeitstunden. Ein anderes Datum erlaubt den nächsten Auswurf.

Das Ergebnis wird als Dialog angezeigt und ausschließlich an Spielleitungen geflüstert. Das Modul bestimmt zufällig, ob das Ereignis die Gruppe oder einen einzelnen Helden betrifft. Sind keine spielergeführten Helden vorhanden, betrifft es die Gruppe.

## Aktueller Stand

Der Ereigniskatalog in `scripts/daily-events.mjs` ist ein vorläufiger, eigens formulierter Khôm-Katalog. Die konkreten Tabelleninhalte aus der vorherigen Unterhaltung waren im verfügbaren Gesprächsverlauf nicht enthalten. Vorhandene Akteur-Packs wurden nicht angelegt oder verändert; für deren Integration werden die bestehenden Dateien des lokalen Moduls benötigt.
