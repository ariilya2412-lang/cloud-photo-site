const gallery = document.getElementById("gallery");
const photoCount = document.getElementById("photo-count");
const template = document.getElementById("photo-template");
const PHOTOS_URL = window.GALLERY_PHOTOS_URL || "";

loadPhotos();

async function loadPhotos() {
  try {
    const response = await fetch(PHOTOS_URL);
    if (!response.ok) throw new Error("Cannot load signed photo list");

    const photos = await response.json();
    renderPhotos(photos);
  } catch (error) {
    console.error(error);
    photoCount.textContent = "Error";
    gallery.innerHTML = '<p class="empty">Could not load the photo list.</p>';
  }
}

function renderPhotos(photos) {
  photoCount.textContent = `${photos.length} photos`;

  if (!photos.length) {
    gallery.innerHTML = '<p class="empty">No photos yet.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const photo of photos) {
    const card = template.content.firstElementChild.cloneNode(true);
    const image = card.querySelector("img");
    const label = card.querySelector("span");
    const imageUrl = `${PHOTOS_URL}?file=${encodeURIComponent(photo.key)}`;

    card.href = imageUrl;
    image.src = imageUrl;
    image.alt = photo.title;
    label.textContent = `${photo.index}. ${photo.title}`;
    fragment.append(card);
  }

  gallery.replaceChildren(fragment);
}
