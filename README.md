# Cloud Gallery Site

Simple static gallery that displays images from Yandex Object Storage.

## Local preview

```powershell
cd C:\PAPKA\photo-cloud-site
python -m http.server 4174
```

Open:

```text
http://localhost:4174
```

## Photo list

The gallery reads `photos.json`. Each item points to:

```text
https://storage.yandexcloud.net/lol/<file-name>
```

## GitHub Pages

Push this folder to GitHub and enable Pages from the repository settings.
