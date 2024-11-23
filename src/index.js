import Notiflix from 'notiflix';
import { fetchImages } from './api-service';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

let currentPage = 1;
let query = '';
let totalHits = 0;

form.addEventListener('submit', onSearch);
loadMoreButton.addEventListener('click', onLoadMore);

function onSearch(event) {
  event.preventDefault();
  query = event.target.elements.searchQuery.value.trim();
  currentPage = 1;
  gallery.innerHTML = '';
  loadMoreButton.classList.add('hidden');

  if (!query) {
    Notiflix.Notify.warning('Please enter a search query');
    return;
  }

  fetchAndRenderImages();
}

async function onLoadMore() {
  currentPage += 1;
  await fetchAndRenderImages();
}

async function fetchAndRenderImages() {
  try {
    const data = await fetchImages(query, currentPage);
    totalHits = data.totalHits;

    if (currentPage === 1 && totalHits > 0) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    if (data.hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    renderGallery(data.hits);

    if (currentPage * 40 >= totalHits) {
      loadMoreButton.classList.add('hidden');
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
      loadMoreButton.classList.remove('hidden');
    }
  } catch (error) {
    Notiflix.Notify.failure('Error fetching images. Please try again later.');
  }
}

function renderGallery(images) {
  const markup = images
    .map(
      ({ webformatURL, tags }) => `
        <div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </div>
      `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}
