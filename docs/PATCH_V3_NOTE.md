# Patch v3 note

This package contains the same multilingual AI flow files from v2 and also includes `report.html`.

The HTML file itself does not contain the report generation logic; it loads:

- `js/report_agent_browser.js`
- `js/report_controller.js`

The actual fix for multilingual report generation is in those JavaScript files. `report.html` is included here to avoid any missing-file or incomplete-patch confusion.
