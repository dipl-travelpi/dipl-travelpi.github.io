# dipl-travelpi.github.io

Projekt-Website zu TravelPi – einem mobilen Sicherheits-Router für sicheres Surfen in öffentlichen WLANs
(Diplomarbeit 2026/27, TGM).

Live: https://dipl-travelpi.github.io

Reines HTML/CSS/JS ohne Build-Schritt – GitHub Pages liefert `index.html` direkt aus.

```
index.html            gesamter Inhalt (eine Seite, Abschnitte über die Navigation erreichbar)
assets/css/style.css  Design, Light/Dark Mode (Farb-Tokens ganz oben)
assets/js/main.js     Theme-Umschalter, Cursor-Raster, Explosionsdarstellung, Parallax, Meilenstein-Zähler
assets/img/           Favicon, später Teamfotos
```

## Aktualisieren (mindestens alle zwei Wochen)

- **Meilensteine:** in `index.html` bei `.milestones` das `data-status` am `<li>` auf `done`, `active`
  oder `open` setzen. Zähler, Balken und „Als Nächstes“ rechnen sich automatisch.
- **Fortschritt:** in `.log` ein `<li>` kopieren und oben einfügen (Datum, Tag, Titel, Text).
- **Stand:** Datum im Footer ändern.
- **Teamfotos:** Foto nach `assets/img/team/<name>.jpg` legen und `<span class="avatar">BG</span>` durch
  `<img class="avatar" src="assets/img/team/benjamin.jpg" alt="">` ersetzen (quadratisch, ca. 400 × 400 px).

Die Pi-Grafik stammt aus dem Plakat und ist direkt als SVG in `index.html` eingebettet.
Ihre Farben kommen über die CSS-Klassen `f0`–`f6` / `s0`–`s2` aus den `--pi-*`-Variablen in `style.css`.

Lokale Vorschau:

```bash
python3 -m http.server 8765
```

## Abgabe als eine HTML-Datei (SingleFile)

1. https://dipl-travelpi.github.io im Browser öffnen und einmal bis ganz nach unten scrollen.
2. In den SingleFile-Optionen **„Skripte entfernen“ ausschalten**, damit Theme-Umschalter,
   Explosionsdarstellung und Animationen funktionieren.
3. Seite mit SingleFile speichern und die `.html`-Datei einmal öffnen, um zu prüfen, dass alles geht.
