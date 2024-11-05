const apiKey = "a05865f1";
let currentPage = 1;
let movieData = [];

// Fetch movies
async function fetchMovieData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}

async function searchMovies(page = 1) {
  // Show "loading..." text
  document.getElementById("loading").style.display = "block";

  // Get search term from input (use "movie" if nothing is entered)
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput.value || "movie";

  // Create the search URL
  const searchUrl = `https://www.omdbapi.com/?s=${searchTerm}&page=${page}&apikey=${apiKey}&type=movie`;

  // Get the list of movies
  const data = await fetchMovieData(searchUrl);

  // Clear the movie grid
  const grid = document.getElementById("movieGrid");
  grid.innerHTML = "";

  // If no data or no movies found, show error and stop
  if (!data || data.Response === "False") {
    document.getElementById("error").textContent = "No movies found";
    document.getElementById("error").style.display = "block";
    document.getElementById("loading").style.display = "none";

    // Disable pagination buttons when no results
    document.getElementById("prevButton").disabled = true;
    document.getElementById("nextButton").disabled = true;
    return;
  }

  // Get detailed info for first 8 movies
  movieData = [];
  for (let movie of data.Search.slice(0, 8)) {
    const detailUrl = `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`;
    const movieDetail = await fetchMovieData(detailUrl);
    if (movieDetail) {
      movieData.push(movieDetail);
    }
  }

  // Display the movies and update the page
  displayMovies();
  updatePagination(data.totalResults);

  // Hide loading and error
  document.getElementById("loading").style.display = "none";
  document.getElementById("error").style.display = "none";
}

function displayMovies() {
  const grid = document.getElementById("movieGrid");
  grid.innerHTML = "";

  movieData.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";

    // Use placeholder if no poster available
    const posterUrl =
      movie.Poster !== "N/A" ? movie.Poster : "/api/placeholder/280/400";

    card.innerHTML = `
      <img src="${posterUrl}" alt="${movie.Title}" onerror="this.src='/api/placeholder/280/400'">
      <div class="movie-info">
        <h3>${movie.Title}</h3>
        <p>Year: ${movie.Year}</p>
      </div>
    `;

    card.onclick = () => showMovieDetails(movie);
    grid.appendChild(card);
  });
}

function showMovieDetails(movie) {
  const modal = document.getElementById("movieModal");
  const detailsContainer = document.getElementById("movieDetails");

  // Use placeholder if no poster available
  const posterUrl =
    movie.Poster !== "N/A" ? movie.Poster : "/api/placeholder/300/450";

  detailsContainer.innerHTML = `
    <div class="movie-detail">
      <img src="${posterUrl}" alt="${
    movie.Title
  }" onerror="this.src='/api/placeholder/300/450'">
      <div class="movie-detail-info">
        <h2>${movie.Title} (${movie.Year})</h2>
        <p><span class="label">Rating:</span> ${movie.imdbRating}/10</p>
        <p><span class="label">Runtime:</span> ${movie.Runtime}</p>
        <p><span class="label">Genre:</span> ${movie.Genre}</p>
        <p><span class="label">Director:</span> ${movie.Director}</p>
        <p><span class="label">Cast:</span> ${movie.Actors}</p>
        <p><span class="label">Plot:</span> ${movie.Plot}</p>
        <p><span class="label">Awards:</span> ${movie.Awards}</p>
        <p><span class="label">Box Office:</span> ${
          movie.BoxOffice || "N/A"
        }</p>
        <p><span class="label">Released:</span> ${movie.Released}</p>
        <p><span class="label">Rated:</span> ${movie.Rated}</p>
      </div>
    </div>
  `;

  modal.style.display = "block";
}

function updatePagination(totalResults) {
  const totalPages = Math.ceil(totalResults / 12);
  document.getElementById("prevButton").disabled = currentPage === 1;
  document.getElementById("nextButton").disabled = currentPage === totalPages;
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    searchMovies(currentPage);
  }
}

function nextPage() {
  currentPage++;
  searchMovies(currentPage);
}

// Close modal when clicking X
document.querySelector(".close").onclick = () => {
  document.getElementById("movieModal").style.display = "none";
};

// Start the app with default search
window.onload = () => searchMovies();
