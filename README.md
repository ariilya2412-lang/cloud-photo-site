# Cloud Gallery Site

Simple static gallery that can display images from Yandex Object Storage.

## Local preview

```powershell
cd C:\PAPKA\photo-cloud-site
python -m http.server 4174
```

Open:

```text
http://localhost:4174
```

## Public mode

The old public mode used direct links:

```text
https://storage.yandexcloud.net/lol/<file-name>
```

## Private mode

For a private bucket, the gallery reads signed URLs from the API in `api/`.
Set the deployed API URL in `config.js`.
The bucket now should be `secret1231`, and the same file names must be uploaded there.

## GitHub Pages

Push this folder to GitHub and enable Pages from the repository settings.
