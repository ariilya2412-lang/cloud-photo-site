# Cloud Gallery API

This API generates temporary Yandex Object Storage signed URLs for a private bucket.

## Local setup

```powershell
cd C:\PAPKA\photo-cloud-site\api
Copy-Item .env.example .env
```

Fill `.env`:

```text
YANDEX_ACCESS_KEY_ID=...
YANDEX_SECRET_ACCESS_KEY=...
YANDEX_BUCKET=secret1231
SIGNED_URL_SECONDS=300
ALLOWED_ORIGIN=https://ariilya2412-lang.github.io
```

Start:

```powershell
node server.mjs
```

Open:

```text
http://localhost:8787/api/photos
```

If the signed URLs return `404`, the objects are not uploaded to `secret1231` yet or the file names do not match `photos.json`.

## Frontend config

After deploying this API, put its public URL into `config.js`:

```js
window.GALLERY_API_BASE_URL = "https://your-api.example.com";
```
