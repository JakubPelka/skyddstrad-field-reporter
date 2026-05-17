# XLSX sharing and GPS tracking

## Dela XLSX

`Dela XLSX` uses the browser Web Share API with file sharing when available.

On iOS/iPadOS this may allow sending the generated XLSX through Mail or another app from the system share sheet.

If the browser does not support file sharing, the app downloads the XLSX file and tells the user to attach it manually.

## GPS på

`GPS på` starts continuous GPS tracking with `navigator.geolocation.watchPosition`.

Each GPS update refreshes:

- selected map point,
- Norr/Öst,
- accuracy,
- duplicate warning,
- Lokalnamn suggestions.

Use `Stoppa GPS` to stop tracking.
