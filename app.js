const gallery = document.getElementById("gallery");
const photoCount = document.getElementById("photo-count");
const template = document.getElementById("photo-template");

loadPhotos();

async function loadPhotos() {
  try {
    const response = await fetch("./photos.json");
    if (!response.ok) throw new Error("Cannot load photos.json");

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

    card.href = photo.url;
    image.src = photo.url;
    image.alt = photo.title;
    label.textContent = `${photo.index}. ${photo.title}`;
    fragment.append(card);
  }

  gallery.replaceChildren(fragment);
}
