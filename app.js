/**
 * MovieManager - version simplifiée (débutant friendly)
 * ----------------------------------------------------
 * - Pas de classes / pas de private fields
 * - Des objets simples (i18n, store) + des fonctions par page
 * - DOM manipulé via addEventListener (pas de onclick dans le HTML)
 * - async/await pour l’API TMDB
 */

// =============================
// 1) Configuration + état global
// =============================
const TMDB_API_KEY = "015dfc5942d59d4dc970f1182cf1b519";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const PLACEHOLDER_POSTER = "https://via.placeholder.com/500x750?text=No+Poster";

const state = {
  lang: localStorage.getItem("language") || "fr",
  currentPage: 1,
  mode: { favorites: false, archived: false }, // movies.html uniquement
  charts: [], // dashboard.html uniquement
  lastMovies: [], // dernière liste affichée (pour details/pdf)
};

// =============================
// 2) Helpers DOM
// =============================
function $(id) {
  return document.getElementById(id);
}

function getPageName() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = String(value);
}

function toTmdbLocale(lang) {
  if (lang === "ar") return "ar-SA";
  if (lang === "en") return "en-US";
  return "fr-FR";
}

function clamp(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.min(max, Math.max(min, x));
}

// =============================
// 3) i18n (traductions)
// =============================
const i18n = {
  translations: {
    fr: {
      dashboard: "Dashboard",
      movies: "Films",
      favorites: "Favoris",
      archives: "Archives",
      logout: "Déconnexion",
      addMovie: "Ajouter un film",
      editMovie: "Modifier le film",
      searchPlaceholder: "Rechercher un film...",
      title: "Titre",
      description: "Description",
      releaseDate: "Date de sortie",
      rating: "Note",
      language: "Langue",
      poster: "URL Poster",
      cancel: "Annuler",
      save: "Enregistrer",
      close: "Fermer",
      exportPdf: "Exporter en PDF",
      totalMovies: "Total Films",
      popularMovies: "Films Populaires",
      archivedMovies: "Films Archivés",
      favoriteMovies: "Favoris",
      averageRating: "Note Moyenne",
      moviesByYear: "Films par Année",
      languages: "Langues",
      releaseEvolution: "Évolution des Sorties",
      favoritesVsArchived: "Favoris vs Archivés",
      ratingsDistribution: "Distribution des Notes",
      prev: "Précédent",
      next: "Suivant",
      page: "Page",
      noMoviesFound: "Aucun film trouvé",
      confirmDelete: "Supprimer ce film ?",
      confirmArchive: "Archiver ce film ?",
      confirmUnarchive: "Désarchiver ce film ?",
      loginError: "Nom d'utilisateur ou mot de passe incorrect",
      pdfDescription: "Description",
      pdfDate: "Date",
      pdfRating: "Note",
      pdfLanguage: "Langue",
    },
    en: {
      dashboard: "Dashboard",
      movies: "Movies",
      favorites: "Favorites",
      archives: "Archives",
      logout: "Logout",
      addMovie: "Add movie",
      editMovie: "Edit movie",
      searchPlaceholder: "Search a movie...",
      title: "Title",
      description: "Description",
      releaseDate: "Release date",
      rating: "Rating",
      language: "Language",
      poster: "Poster URL",
      cancel: "Cancel",
      save: "Save",
      close: "Close",
      exportPdf: "Export to PDF",
      totalMovies: "Total Movies",
      popularMovies: "Popular Movies",
      archivedMovies: "Archived Movies",
      favoriteMovies: "Favorites",
      averageRating: "Average Rating",
      moviesByYear: "Movies by Year",
      languages: "Languages",
      releaseEvolution: "Release Evolution",
      favoritesVsArchived: "Favorites vs Archived",
      ratingsDistribution: "Ratings Distribution",
      prev: "Previous",
      next: "Next",
      page: "Page",
      noMoviesFound: "No movies found",
      confirmDelete: "Delete this movie?",
      confirmArchive: "Archive this movie?",
      confirmUnarchive: "Unarchive this movie?",
      loginError: "Invalid username or password",
      pdfDescription: "Description",
      pdfDate: "Date",
      pdfRating: "Rating",
      pdfLanguage: "Language",
    },
    ar: {
      dashboard: "لوحة التحكم",
      movies: "الأفلام",
      favorites: "المفضلة",
      archives: "الأرشيف",
      logout: "تسجيل الخروج",
      addMovie: "إضافة فيلم",
      editMovie: "تعديل الفيلم",
      searchPlaceholder: "ابحث عن فيلم...",
      title: "العنوان",
      description: "الوصف",
      releaseDate: "تاريخ الإصدار",
      rating: "التقييم",
      language: "اللغة",
      poster: "رابط الملصق",
      cancel: "إلغاء",
      save: "حفظ",
      close: "إغلاق",
      exportPdf: "تصدير PDF",
      totalMovies: "إجمالي الأفلام",
      popularMovies: "الأفلام الشائعة",
      archivedMovies: "أفلام مؤرشفة",
      favoriteMovies: "المفضلة",
      averageRating: "متوسط التقييم",
      moviesByYear: "الأفلام حسب السنة",
      languages: "اللغات",
      releaseEvolution: "تطور الإصدارات",
      favoritesVsArchived: "المفضلة مقابل المؤرشفة",
      ratingsDistribution: "توزيع التقييمات",
      prev: "السابق",
      next: "التالي",
      page: "صفحة",
      noMoviesFound: "لم يتم العثور على أفلام",
      confirmDelete: "حذف هذا الفيلم؟",
      confirmArchive: "أرشفة هذا الفيلم؟",
      confirmUnarchive: "إلغاء الأرشفة؟",
      loginError: "اسم المستخدم أو كلمة المرور غير صحيحة",
      pdfDescription: "الوصف",
      pdfDate: "التاريخ",
      pdfRating: "التقييم",
      pdfLanguage: "اللغة",
    },
  },

  t(key) {
    return this.translations?.[state.lang]?.[key] || key;
  },

  apply() {
    document.documentElement.setAttribute("lang", state.lang);
    document.documentElement.setAttribute("dir", state.lang === "ar" ? "rtl" : "ltr");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = this.t(el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", this.t(el.getAttribute("data-i18n-placeholder")));
    });
  },

  setLang(lang) {
    state.lang = lang;
    localStorage.setItem("language", state.lang);
    this.apply();
  },
};

// =============================
// 4) Store (LocalStorage) - CRUD simple
// =============================
const store = {
  getCurrentUser() {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  },
  setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  },
  clearCurrentUser() {
    localStorage.removeItem("currentUser");
  },

  readArray(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
  },
  writeArray(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  },

  get favorites() {
    return this.readArray("favorites");
  },
  set favorites(arr) {
    this.writeArray("favorites", arr);
  },
  get archived() {
    return this.readArray("archived");
  },
  set archived(arr) {
    this.writeArray("archived", arr);
  },
  get customMovies() {
    return this.readArray("customMovies");
  },
  set customMovies(arr) {
    this.writeArray("customMovies", arr);
  },
};

// =============================
// 5) API TMDB (async/await)
// =============================
async function fetchMoviesFromTmdb(url) {
  try {
    const res = await fetch(url);
        const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    return results.map((m) => ({
            id: m.id,
            title: m.title,
            description: m.overview,
            releaseDate: m.release_date,
            rating: m.vote_average,
            language: m.original_language,
      poster: m.poster_path ? `${TMDB_IMAGE_URL}${m.poster_path}` : PLACEHOLDER_POSTER,
      isFromTMDB: true,
        }));
  } catch (e) {
    console.error("TMDB error:", e);
        return [];
    }
}

async function fetchPopularMovies(page = 1) {
  const lang = toTmdbLocale(state.lang);
  const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&language=${lang}`;
  return fetchMoviesFromTmdb(url);
}

async function searchMovies(query, page = 1) {
  const lang = toTmdbLocale(state.lang);
  const q = encodeURIComponent(query);
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${q}&page=${page}&language=${lang}`;
  return fetchMoviesFromTmdb(url);
}

// =============================
// 6) Auth + UI commun
// =============================
function enforceAuth() {
  const page = getPageName();
  const isLoginPage = page === "index.html" || page === "";
  if (!isLoginPage && !store.getCurrentUser()) window.location.href = "index.html";
}

function initLogout() {
  const btn = $("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    store.clearCurrentUser();
    window.location.href = "index.html";
  });
}

function initSidebarToggle() {
  const toggle = $("sidebarToggle");
  const sidebar = $("sidebar");
  if (!toggle || !sidebar) return;
  toggle.addEventListener("click", () => sidebar.classList.toggle("show"));
}

function initLanguageSelector(onChange) {
  const select = $("languageSelect");
  if (!select) return;
  select.value = state.lang;
  select.addEventListener("change", function () {
    i18n.setLang(this.value);
    onChange && onChange();
  });
  i18n.apply();
}

// =============================
// 7) Page: index.html (login)
// =============================
function initLoginPage() {
  const form = $("loginForm");
  const err = $("loginError");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = $("username")?.value || "";
    const password = $("password")?.value || "";

    if (username === "admin" && password === "admin") {
      store.setCurrentUser({ username });
      window.location.href = "dashboard.html";
      return;
    }

    if (err) {
      err.textContent = i18n.t("loginError");
      err.classList.remove("d-none");
    }
  });
}

// =============================
// 8) Page: dashboard.html
// =============================
function destroyCharts() {
  state.charts.forEach((c) => {
    try {
      c.destroy();
    } catch {
      // ignore
    }
  });
  state.charts = [];
}

function addChart(id, config) {
  const canvas = $(id);
  if (!canvas || typeof window.Chart === "undefined") return;
  state.charts.push(new window.Chart(canvas, config));
}

function updateDashboardStats(movies) {
  const archived = store.archived;
  const favorites = store.favorites;
  const avg = movies.length ? (movies.reduce((s, m) => s + (m.rating || 0), 0) / movies.length).toFixed(1) : "0.0";

  setText("statTotalMovies", movies.length);
  setText("statPopularMovies", movies.filter((m) => m.isFromTMDB).length);
  setText("statArchivedMovies", archived.length);
  setText("statFavoriteMovies", favorites.length);
  setText("statAverageRating", avg);
}

function renderDashboardCharts(movies) {
  destroyCharts();
  if (typeof window.Chart === "undefined") return;

  // Films par année
  const byYear = {};
  movies.forEach((m) => {
    if (!m.releaseDate) return;
    const y = m.releaseDate.split("-")[0];
    byYear[y] = (byYear[y] || 0) + 1;
  });
  const years = Object.keys(byYear).sort();

  // Langues
  const langs = {};
  movies.forEach((m) => {
    const l = m.language || "unknown";
    langs[l] = (langs[l] || 0) + 1;
  });

  // Distribution des notes
  const ranges = { "0-2": 0, "2-4": 0, "4-6": 0, "6-8": 0, "8-10": 0 };
  movies.forEach((m) => {
    const r = m.rating || 0;
    if (r < 2) ranges["0-2"]++;
    else if (r < 4) ranges["2-4"]++;
    else if (r < 6) ranges["4-6"]++;
    else if (r < 8) ranges["6-8"]++;
    else ranges["8-10"]++;
  });

  addChart("chartByYear", {
    type: "bar",
    data: {
      labels: years,
      datasets: [{ label: i18n.t("movies"), data: years.map((y) => byYear[y]), backgroundColor: "rgba(13, 110, 253, 0.8)" }],
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } },
  });

  addChart("chartLanguages", {
    type: "pie",
    data: {
      labels: Object.keys(langs),
      datasets: [{ data: Object.values(langs), backgroundColor: ["rgba(255,99,132,0.8)", "rgba(54,162,235,0.8)", "rgba(255,206,86,0.8)", "rgba(75,192,192,0.8)", "rgba(153,102,255,0.8)"] }],
    },
    options: { responsive: true },
  });

  addChart("chartEvolution", {
    type: "line",
    data: {
      labels: years,
      datasets: [{ label: i18n.t("movies"), data: years.map((y) => byYear[y] || 0), borderColor: "rgba(75, 192, 192, 1)", tension: 0.4 }],
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } },
  });

  addChart("chartFavoritesArchived", {
    type: "doughnut",
    data: {
      labels: [i18n.t("favorites"), i18n.t("archives")],
      datasets: [{ data: [store.favorites.length, store.archived.length], backgroundColor: ["rgba(255,206,86,0.8)", "rgba(255,99,132,0.8)"] }],
    },
    options: { responsive: true },
  });

  addChart("chartRatings", {
    type: "bar",
    data: { labels: Object.keys(ranges), datasets: [{ label: i18n.t("movies"), data: Object.values(ranges), backgroundColor: "rgba(153, 102, 255, 0.8)" }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } } },
  });
}

async function loadDashboard() {
  const popular = await fetchPopularMovies(1);
  const all = [...popular, ...store.customMovies].filter((m) => !store.archived.includes(m.id));
  updateDashboardStats(all);
  renderDashboardCharts(all);
}

function initDashboardPage() {
  initLanguageSelector(loadDashboard);
  loadDashboard();
}

// =============================
// 9) Page: movies.html
// =============================
function readMoviesModeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  state.mode.favorites = params.get("favorites") === "true";
  state.mode.archived = params.get("archived") === "true";

  const addBtn = $("addMovieBtn");
  if (addBtn) addBtn.style.display = state.mode.favorites || state.mode.archived ? "none" : "";

  const title = $("pageTitle");
  if (title) title.textContent = state.mode.favorites ? i18n.t("favorites") : state.mode.archived ? i18n.t("archives") : i18n.t("movies");
}

function renderPagination() {
  const pag = $("pagination");
  if (!pag) return;
  const prevDisabled = state.currentPage === 1 ? "disabled" : "";
  pag.innerHTML = `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" data-page="${state.currentPage - 1}">${i18n.t("prev")}</a>
    </li>
    <li class="page-item"><span class="page-link">${i18n.t("page")} ${state.currentPage}</span></li>
    <li class="page-item">
      <a class="page-link" href="#" data-page="${state.currentPage + 1}">${i18n.t("next")}</a>
    </li>
  `;
}

function renderMoviesGrid(movies) {
  const container = $("moviesContainer");
    if (!container) return;
    
  if (!movies.length) {
    container.innerHTML = `<div class="col-12"><div class="empty-state"><i class="bi bi-film"></i><h4>${i18n.t("noMoviesFound")}</h4></div></div>`;
        return;
    }
    
  const favorites = store.favorites;
  const archived = store.archived;

  container.innerHTML = movies
    .map((m) => {
      const isFav = favorites.includes(m.id);
      const isArch = archived.includes(m.id);
      const year = m.releaseDate ? m.releaseDate.split("-")[0] : "N/A";
      const rating = (m.rating || 0).toFixed(1);
      const desc = (m.description || "").substring(0, 100);

      return `
        <div class="col-md-6 col-lg-3">
            <div class="card movie-card">
            <img src="${m.poster}" alt="${m.title}" onerror="this.src='${PLACEHOLDER_POSTER}'">
                <div class="card-body">
                    <h5 class="card-title">${m.title}</h5>
              <p class="card-text">${desc}${m.description && m.description.length > 100 ? "..." : ""}</p>
                    <div class="d-flex justify-content-between mb-2">
                <span class="badge bg-primary">${rating}</span>
                <span class="badge bg-secondary">${year}</span>
                    </div>
                    <div class="movie-actions">
                <button class="btn btn-sm btn-info" data-action="view" data-id="${m.id}"><i class="bi bi-eye"></i></button>
                <button class="btn btn-sm ${isFav ? "btn-warning" : "btn-outline-warning"}" data-action="toggleFav" data-id="${m.id}">
                  <i class="bi ${isFav ? "bi-star-fill" : "bi-star"}"></i>
                </button>
                ${
                  !m.isFromTMDB
                    ? `<button class="btn btn-sm btn-primary" data-action="edit" data-id="${m.id}"><i class="bi bi-pencil"></i></button>
                       <button class="btn btn-sm btn-danger" data-action="delete" data-id="${m.id}"><i class="bi bi-trash"></i></button>`
                    : ""
                }
                ${
                  isArch
                    ? `<button class="btn btn-sm btn-success" data-action="unarchive" data-id="${m.id}"><i class="bi bi-archive-fill"></i></button>`
                    : `<button class="btn btn-sm btn-secondary" data-action="archive" data-id="${m.id}"><i class="bi bi-archive"></i></button>`
                }
              </div>
                </div>
            </div>
        </div>
      `;
    })
    .join("");
}

async function loadMovies() {
  const container = $("moviesContainer");
  if (!container) return;
  container.innerHTML = '<div class="col-12 text-center"><div class="spinner-border"></div></div>';

  try {
    const q = $("searchInput")?.value?.trim() || "";

    // 1) Source TMDB + films custom
    const tmdb = q ? await searchMovies(q, state.currentPage) : await fetchPopularMovies(state.currentPage);
    const custom = store.customMovies;
    const customFiltered = q
      ? custom.filter((m) => {
          const qq = q.toLowerCase();
          return m.title.toLowerCase().includes(qq) || (m.description && m.description.toLowerCase().includes(qq));
        })
      : custom;

    // 2) Fusion + filtres modes
    let all = [...tmdb, ...customFiltered];
    if (state.mode.favorites) all = all.filter((m) => store.favorites.includes(m.id));
    else if (state.mode.archived) all = all.filter((m) => store.archived.includes(m.id));
    else all = all.filter((m) => !store.archived.includes(m.id));

    state.lastMovies = all;
    renderMoviesGrid(all);
    renderPagination();
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="col-12"><div class="alert alert-danger">${i18n.t("noMoviesFound")}</div></div>`;
  }
}

function toggleFavorite(id) {
  const favorites = store.favorites;
  const idx = favorites.indexOf(id);
  if (idx > -1) favorites.splice(idx, 1);
  else favorites.push(id);
  store.favorites = favorites;
        loadMovies();
}

function archiveMovie(id) {
  if (!confirm(i18n.t("confirmArchive"))) return;
  const archived = store.archived;
        if (!archived.includes(id)) archived.push(id);
  store.archived = archived;
        loadMovies();
}

function unarchiveMovie(id) {
  if (!confirm(i18n.t("confirmUnarchive"))) return;
  store.archived = store.archived.filter((x) => x !== id);
  loadMovies();
}

function deleteMovie(id) {
  if (!confirm(i18n.t("confirmDelete"))) return;
  store.customMovies = store.customMovies.filter((m) => m.id !== id);
  store.favorites = store.favorites.filter((x) => x !== id);
  store.archived = store.archived.filter((x) => x !== id);
        loadMovies();
    }

function openEditModal(id) {
  const m = store.customMovies.find((x) => x.id === id);
  if (!m) return;

  setText("modalTitle", i18n.t("editMovie"));
  $("movieId").value = String(m.id);
  $("movieTitle").value = m.title || "";
  $("movieDescription").value = m.description || "";
  $("movieReleaseDate").value = m.releaseDate || "";
  $("movieRating").value = String(m.rating ?? 0);
  $("movieLanguage").value = m.language || "";
  $("moviePoster").value = m.poster || "";

  if (window.bootstrap) new window.bootstrap.Modal($("movieModal")).show();
}

function saveMovieFromForm() {
  const form = $("movieForm");
  if (!form) return;
  if (!form.checkValidity()) return form.reportValidity();

  const idRaw = $("movieId").value;
  const data = {
    title: $("movieTitle").value.trim(),
    description: $("movieDescription").value.trim(),
    releaseDate: $("movieReleaseDate").value,
    rating: clamp($("movieRating").value, 0, 10),
    language: $("movieLanguage").value.trim(),
    poster: $("moviePoster").value.trim() || PLACEHOLDER_POSTER,
    isFromTMDB: false,
  };

  const custom = store.customMovies;
  if (idRaw) {
    const id = Number(idRaw);
    const idx = custom.findIndex((m) => m.id === id);
    if (idx !== -1) custom[idx] = { ...custom[idx], ...data };
  } else {
    custom.push({ ...data, id: Date.now() });
  }
  store.customMovies = custom;

  if (window.bootstrap) new window.bootstrap.Modal($("movieModal")).hide();
  form.reset();
  $("movieId").value = "";
    loadMovies();
}

function viewDetails(id) {
  const m = state.lastMovies.find((x) => x.id === id) || store.customMovies.find((x) => x.id === id);
    if (!m) return;

  setText("detailMovieTitle", m.title);
  const posterEl = $("detailMoviePoster");
  if (posterEl) {
    posterEl.src = m.poster;
    posterEl.onerror = () => (posterEl.src = PLACEHOLDER_POSTER);
  }

  setText("detailMovieDescription", m.description || "N/A");
  setText("detailMovieReleaseDate", m.releaseDate || "N/A");
  setText("detailMovieRating", (m.rating || 0).toFixed(1));
  setText("detailMovieLanguage", m.language || "N/A");
  setText("detailMovieId", m.id);

  const exportBtn = $("exportPdfBtn");
  if (exportBtn) exportBtn.dataset.movieId = String(m.id);

  if (window.bootstrap) new window.bootstrap.Modal($("movieDetailModal")).show();
}

function exportDetailPdf() {
  const id = Number($("exportPdfBtn")?.dataset?.movieId);
  if (!id) return;
  const m = state.lastMovies.find((x) => x.id === id) || store.customMovies.find((x) => x.id === id);
  if (!m || !window.jspdf?.jsPDF) return;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text(m.title, 20, 20);

            doc.setFontSize(12);
            let y = 40;
  doc.text(`${i18n.t("pdfDescription")}: ${m.description || "N/A"}`, 20, y);
            y += 10;
  doc.text(`${i18n.t("pdfDate")}: ${m.releaseDate || "N/A"}`, 20, y);
            y += 10;
  doc.text(`${i18n.t("pdfRating")}: ${(m.rating || 0).toFixed(1)}`, 20, y);
            y += 10;
  doc.text(`${i18n.t("pdfLanguage")}: ${m.language || "N/A"}`, 20, y);

            doc.save(`movie-${m.id}.pdf`);
}

function initMoviesPage() {
  initLanguageSelector(() => {
    readMoviesModeFromUrl();
    loadMovies();
  });
  readMoviesModeFromUrl();

  // Bouton Ajouter: reset form + titre
  const addBtn = $("addMovieBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      $("movieForm")?.reset();
      $("movieId").value = "";
      setText("modalTitle", i18n.t("addMovie"));
    });
  }

  // Recherche (debounce)
  const input = $("searchInput");
  if (input) {
    let timeout;
    input.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        state.currentPage = 1;
        loadMovies();
      }, 400);
    });
  }

  // Save
  $("saveMovieBtn")?.addEventListener("click", saveMovieFromForm);

  // Export PDF
  $("exportPdfBtn")?.addEventListener("click", exportDetailPdf);

  // Actions cards (event delegation)
  $("moviesContainer")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const id = Number(btn.getAttribute("data-id"));
    if (!id) return;

    if (action === "view") viewDetails(id);
    else if (action === "toggleFav") toggleFavorite(id);
    else if (action === "archive") archiveMovie(id);
    else if (action === "unarchive") unarchiveMovie(id);
    else if (action === "edit") openEditModal(id);
    else if (action === "delete") deleteMovie(id);
  });

  // Pagination
  $("pagination")?.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-page]");
    if (!link) return;
    e.preventDefault();
    const page = Number(link.getAttribute("data-page"));
    if (!page || page < 1) return;
    state.currentPage = page;
    loadMovies();
    window.scrollTo(0, 0);
  });

  loadMovies();
}

// =============================
// 10) Démarrage (entrypoint)
// =============================
document.addEventListener("DOMContentLoaded", () => {
  enforceAuth();
  initSidebarToggle();

  const page = getPageName();
  if (page === "index.html" || page === "") {
    initLoginPage();
    return;
  }

  initLogout();

  if (page === "dashboard.html") initDashboardPage();
  if (page === "movies.html") initMoviesPage();
});
