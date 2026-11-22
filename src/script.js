// ============================================
// FLIPPLAY - MULTI CATEGORY PUBLIC API
// ============================================

// 1. KONFIGURASI SUMBER DATA
const MEDIA_CONFIG = {
    anime: {
        heading: "Anime Grid.",
        description: "Jelajahi anime populer dari berbagai genre.",
        searchLabel: "Cari judul anime favoritmu",
        placeholder: "Ketik judul anime...",
        itemName: "anime",
        sourceName: "Tenrai API",
        sourceURL: "https://api.tenrai.org/documentation",
        urls: [
            "https://api.tenrai.org/v1/top/anime?limit=24",
            "https://api.tenrai.org/v1/anime?limit=24"
        ],
        type: "tenrai"
    },

    manga: {
        heading: "Manga Grid.",
        description: "Temukan manga dengan cerita dan genre yang beragam.",
        searchLabel: "Cari judul manga favoritmu",
        placeholder: "Ketik judul manga...",
        itemName: "manga",
        sourceName: "Tenrai API",
        sourceURL: "https://api.tenrai.org/documentation",
        urls: [
            "https://api.tenrai.org/v1/manga?type=manga&limit=24",
            "https://api.tenrai.org/v1/manga?type=manga&limit=24&order_by=popularity&sort=asc"
        ],
        type: "tenrai"
    },

    lightnovel: {
        heading: "Light Novel Grid.",
        description: "Jelajahi light novel dan kisah fantasi pilihan.",
        searchLabel: "Cari judul light novel",
        placeholder: "Ketik judul light novel...",
        itemName: "light novel",
        sourceName: "Tenrai API",
        sourceURL: "https://api.tenrai.org/documentation",
        urls: [
            "https://api.tenrai.org/v1/manga?type=lightnovel&limit=24",
            "https://api.tenrai.org/v1/manga?type=novel&limit=24"
        ],
        type: "tenrai"
    },

    drama: {
        heading: "Drama Grid.",
        description: "Temukan serial TV bergenre drama dan berbagai kisah menarik.",
        searchLabel: "Cari judul drama",
        placeholder: "Ketik judul drama...",
        itemName: "drama",
        sourceName: "TVMaze API",
        sourceURL: "https://www.tvmaze.com/api",
        urls: [
            "https://api.tvmaze.com/shows?page=0",
            "https://api.tvmaze.com/shows?page=1"
        ],
        type: "tvmaze"
    }
};


// ============================================
// 2. MENGAMBIL ELEMEN HTML
// ============================================

const animeGrid = document.querySelector("#animeGrid");
const statusMessage = document.querySelector("#statusMessage");
const resultsCount = document.querySelector("#resultsCount");

const searchInput = document.querySelector("#searchInput");
const clearSearch = document.querySelector("#clearSearch");

const auraButtons = document.querySelector("#auraButtons");
const reloadButton = document.querySelector("#reloadButton");

const emptyState = document.querySelector("#emptyState");
const resetFilters = document.querySelector("#resetFilters");

const mediaHeading = document.querySelector("#mediaHeading");
const mediaDescription = document.querySelector("#mediaDescription");
const searchLabel = document.querySelector("#searchLabel");
const apiNote = document.querySelector("#apiNote");

const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");

const contactForm = document.querySelector("#contactForm");

const nameInput = document.querySelector("#nameInput");
const emailInput = document.querySelector("#emailInput");
const messageInput = document.querySelector("#messageInput");

const nameError = document.querySelector("#nameError");
const emailError = document.querySelector("#emailError");
const messageError = document.querySelector("#messageError");

const formFeedback = document.querySelector("#formFeedback");


// ============================================
// 3. STATE APLIKASI
// ============================================

let currentMedia = "anime";
let currentData = [];
let activeAura = "All";
let requestNumber = 0;
let browserOffline = !navigator.onLine;

// ============================================
// 4. FUNGSI BANTU
// ============================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


function safeURL(value) {
    try {
        const url = new URL(value);

        if (url.protocol === "https:" || url.protocol === "http:") {
            return url.href;
        }
    } catch (error) {
        // URL tidak valid, gunakan fallback di bawah.
    }

    return "#";
}


function setStatus(message, type = "", loading = false) {
    statusMessage.className = type;

    if (loading) {
        statusMessage.innerHTML =
            `<span class="loading-spinner"></span>${escapeHTML(message)}`;
    } else {
        statusMessage.textContent = message;
    }
}


// ============================================
// 5. NORMALISASI DATA TENRAI
// ============================================

function normalizeTenrai(item, media) {
    const image =
        item.images?.jpg?.large_image_url ||
        item.images?.jpg?.image_url ||
        "";

    const genres = (item.genres || [])
        .map((genre) => typeof genre === "string" ? genre : genre.name)
        .filter(Boolean);

    const year =
        item.year ||
        item.aired?.prop?.from?.year ||
        item.published?.prop?.from?.year ||
        "Tahun tidak diketahui";

    let detailText;

    if (media === "anime") {
        detailText = item.episodes != null
            ? `${item.episodes} episode`
            : "Episode tidak diketahui";
    } else if (media === "manga") {
        detailText = item.chapters != null
            ? `${item.chapters} chapters`
            : item.volumes != null
                ? `${item.volumes} volumes`
                : "Jumlah bab tidak diketahui";
    } else {
        detailText = item.volumes != null
            ? `${item.volumes} volumes`
            : item.chapters != null
                ? `${item.chapters} chapters`
                : "Jumlah volume tidak diketahui";
    }

    return {
        title: item.title_english || item.title || "Judul tidak tersedia",
        image,
        score: item.score,
        year,
        detailText,
        genres,
        url: item.url || "https://tenrai.org/"
    };
}


// ============================================
// 6. NORMALISASI DATA DRAMA DARI TVMAZE
// ============================================

function normalizeDrama(show) {
    return {
        title: show.name || "Judul tidak tersedia",
        image: show.image?.original || show.image?.medium || "",
        score: show.rating?.average,
        year: show.premiered
            ? show.premiered.slice(0, 4)
            : "Tahun tidak diketahui",
        detailText: show.averageRuntime
            ? `${show.averageRuntime} min/episode`
            : "Serial TV",
        genres: show.genres || [],
        url: show.url || "https://www.tvmaze.com/"
    };
}


// ============================================
// 7. FETCH API
// ============================================

async function requestJSON(url) {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
}


async function fetchTenrai(urls, media) {
    let lastError;

    for (const url of urls) {
        try {
            const result = await requestJSON(url);

            if (!Array.isArray(result.data)) {
                throw new Error("Struktur data Tenrai tidak sesuai.");
            }

            let entries = result.data;

            if (media === "manga") {
                entries = entries.filter((item) =>
                    !/light[\s_-]?novel/i.test(item.type || "")
                );
            }

            if (media === "lightnovel") {
                const novels = entries.filter((item) =>
                    /light[\s_-]?novel/i.test(item.type || "")
                );

                if (novels.length > 0) {
                    entries = novels;
                }
            }

            return entries.map((item) => normalizeTenrai(item, media));

        } catch (error) {
            console.warn("Tenrai endpoint gagal:", url, error);
            lastError = error;
        }
    }

    throw lastError || new Error("Tenrai API tidak dapat diakses.");
}


async function fetchDrama(urls) {
    let lastError;

    for (const url of urls) {
        try {
            const result = await requestJSON(url);

            if (!Array.isArray(result)) {
                throw new Error("Struktur data TVMaze tidak sesuai.");
            }

            const dramas = result
                .filter((show) =>
                    Array.isArray(show.genres) &&
                    show.genres.some((genre) =>
                        genre.toLowerCase() === "drama"
                    )
                )
                .map(normalizeDrama)
                .slice(0, 24);

            return dramas;

        } catch (error) {
            console.warn("TVMaze endpoint gagal:", url, error);
            lastError = error;
        }
    }

    throw lastError || new Error("TVMaze API tidak dapat diakses.");
}


async function fetchMediaData(media) {
    const config = MEDIA_CONFIG[media];

    if (config.type === "tvmaze") {
        return await fetchDrama(config.urls);
    }

    return await fetchTenrai(config.urls, media);
}


// ============================================
// 8. KATEGORI AURA
// ============================================

function getAura(item) {
    const genres = (item.genres || [])
        .map((genre) => genre.toLowerCase());

    if (
        genres.some((genre) =>
            ["action", "adventure", "sports", "suspense", "thriller"]
                .includes(genre)
        )
    ) {
        return "High Energy";
    }

    if (
        genres.some((genre) =>
            ["drama", "romance", "tragedy", "psychological"]
                .includes(genre)
        )
    ) {
        return "Melancholy";
    }

    return "Binge Mode";
}


// ============================================
// 9. MENAMPILKAN KARTU
// ============================================

function renderCards(list) {
    if (list.length === 0) {
        animeGrid.replaceChildren();
        emptyState.classList.remove("hidden");
        resultsCount.textContent = "0 RESULTS";
        return;
    }

    emptyState.classList.add("hidden");
    resultsCount.textContent = `${list.length} RESULTS`;

    animeGrid.innerHTML = list.map((item) => {
        const title = escapeHTML(item.title);
        const image = item.image ? escapeHTML(item.image) : "";
        const url = escapeHTML(safeURL(item.url));

        const score = item.score != null
            ? Number(item.score).toFixed(1)
            : "N/A";

        const genres = (item.genres || [])
            .slice(0, 3)
            .map(escapeHTML)
            .join(" · ") || "Genre belum tersedia";

        const aura = getAura(item);

        return `
            <article class="anime-card">

                <div class="anime-poster-wrap">

                    <img
                        class="anime-poster"
                        src="${image}"
                        alt="Poster ${title}"
                        loading="lazy"
                        style="display:${image ? "block" : "none"}">

                    <div
                        class="poster-fallback"
                        style="display:${image ? "none" : "grid"}">
                        F.
                    </div>

                    <span class="aura-chip">
                        ${escapeHTML(aura)}
                    </span>

                </div>

                <div class="anime-card-body">

                    <h3>${title}</h3>

                    <div class="anime-meta">
                        <span class="meta-pill">
                            ${escapeHTML(item.year)}
                        </span>

                        <span class="meta-pill">
                            ${escapeHTML(item.detailText)}
                        </span>
                    </div>

                    <p class="anime-genres">
                        ${genres}
                    </p>

                    <div class="anime-score">
                        <span>
                            <span class="score-star">★</span>
                            ${score}
                        </span>

                        <a
                            class="anime-link"
                            href="${url}"
                            target="_blank"
                            rel="noopener noreferrer">
                            Detail ↗
                        </a>
                    </div>

                </div>

            </article>
        `;
    }).join("");

    // Menampilkan fallback jika poster tidak berhasil dimuat.
    animeGrid.querySelectorAll(".anime-poster").forEach((image) => {
        image.addEventListener("error", () => {
            image.style.display = "none";
            image.nextElementSibling.style.display = "grid";
        });
    });
}


// ============================================
// 10. SEARCH DAN FILTER AURA
// ============================================

function applyFilters(updateStatus = true) {
    const keyword = searchInput.value.trim().toLowerCase();

    const filteredData = currentData.filter((item) => {
        const title = item.title.toLowerCase();

        const matchesSearch = title.includes(keyword);

        const matchesAura =
            activeAura === "All" ||
            getAura(item) === activeAura;

        return matchesSearch && matchesAura;
    });

    renderCards(filteredData);

    if (updateStatus && currentData.length > 0) {
        setStatus(
            `Menampilkan ${filteredData.length} dari ${currentData.length} ${MEDIA_CONFIG[currentMedia].itemName}.`,
            "success"
        );
    }
}


searchInput.addEventListener("input", () => {
    applyFilters();
});


clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    applyFilters();
    searchInput.focus();
});


auraButtons.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-aura]");

    if (!button) return;

    activeAura = button.dataset.aura;

    auraButtons.querySelectorAll(".aura-button").forEach((item) => {
        const isActive = item === button;

        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
    });

    applyFilters();
});


resetFilters.addEventListener("click", () => {
    searchInput.value = "";
    activeAura = "All";

    auraButtons.querySelectorAll(".aura-button").forEach((button) => {
        const isActive = button.dataset.aura === "All";

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    applyFilters();
});


// ============================================
// 11. MEMILIH KATEGORI DARI EXPLORE
// ============================================

async function selectMedia(media) {
    if (!MEDIA_CONFIG[media]) return;

    currentMedia = media;
    activeAura = "All";

    const config = MEDIA_CONFIG[media];

    mediaHeading.textContent = config.heading;
    mediaDescription.textContent = config.description;
    searchLabel.textContent = config.searchLabel;
    searchInput.placeholder = config.placeholder;

    apiNote.innerHTML =
        `Sumber data: <a href="${config.sourceURL}" target="_blank" rel="noopener noreferrer">${config.sourceName}</a>. Kategori aura merupakan klasifikasi sederhana buatan FlipPlay.`;

    searchInput.value = "";

    auraButtons.querySelectorAll(".aura-button").forEach((button) => {
        const isActive = button.dataset.aura === "All";

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    await loadMedia();
}


document.querySelectorAll(".media-card-link[data-media]").forEach((link) => {
    link.addEventListener("click", () => {
        selectMedia(link.dataset.media);
    });
});


// ============================================
// 12. LOADING DAN ERROR
// ============================================

async function loadMedia() {
    const config = MEDIA_CONFIG[currentMedia];

    // CEK KONEKSI SEBELUM MEMANGGIL API
    if (browserOffline || !navigator.onLine) {
        browserOffline = true;

        // Batalkan hasil dari permintaan sebelumnya.
        requestNumber++;

        // Hilangkan data yang sudah ditampilkan.
        currentData = [];
        animeGrid.replaceChildren();
        emptyState.classList.add("hidden");

        resultsCount.textContent = "OFFLINE";

        setStatus(
            "Koneksi internet terputus. Data Explore tidak tersedia.",
            "error"
        );

        animeGrid.setAttribute("aria-busy", "false");

        reloadButton.disabled = true;
        reloadButton.textContent = "Internet Terputus";

        return; // Berhenti di sini, jangan panggil API.
    }

    const requestedMedia = currentMedia;
    const requestId = ++requestNumber;

    reloadButton.disabled = true;
    reloadButton.textContent = "Memuat data...";

    animeGrid.replaceChildren();
    emptyState.classList.add("hidden");

    animeGrid.setAttribute("aria-busy", "true");
    resultsCount.textContent = "LOADING";

    setStatus(
        `Sedang mengambil data ${config.itemName} dari Public API...`,
        "",
        true
    );

    try {
        const data = await fetchMediaData(requestedMedia);

        // Abaikan hasil lama jika kategori berubah atau koneksi terputus.
        if (
            requestId !== requestNumber ||
            requestedMedia !== currentMedia ||
            browserOffline ||
            !navigator.onLine
        ) {
            return;
        }

        currentData = data;

        if (currentData.length === 0) {
            resultsCount.textContent = "0 RESULTS";
            emptyState.classList.remove("hidden");

            setStatus(
                `Tidak ada data ${config.itemName} yang ditemukan.`,
                "success"
            );

            return;
        }

        applyFilters(false);

        setStatus(
            `Berhasil mengambil ${currentData.length} ${config.itemName}.`,
            "success"
        );

    } catch (error) {
        if (
            requestId !== requestNumber ||
            requestedMedia !== currentMedia
        ) {
            return;
        }

        console.error("Gagal mengambil data:", error);

        currentData = [];
        animeGrid.replaceChildren();
        emptyState.classList.add("hidden");

        resultsCount.textContent = "API ERROR";

        setStatus(
            `Gagal mengambil data ${config.itemName}. Periksa koneksi atau coba lagi.`,
            "error"
        );

    } finally {
        if (requestId === requestNumber) {
            reloadButton.disabled = false;
            reloadButton.textContent = "↻ Muat Ulang Data";

            animeGrid.setAttribute("aria-busy", "false");
        }
    }
}


reloadButton.addEventListener("click", loadMedia);


// ============================================
// 13. NAVBAR MOBILE
// ============================================

menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));

    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
    );
});

navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Buka menu navigasi");
    });
});


// ============================================
// 14. VALIDASI FORM CONTACT
// ============================================

function showFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    input.classList.toggle("invalid", Boolean(message));

    input.setAttribute("aria-invalid", String(Boolean(message)));
}


nameInput.addEventListener("input", () => {
    showFieldError(nameInput, nameError, "");
});

emailInput.addEventListener("input", () => {
    showFieldError(emailInput, emailError, "");
});

messageInput.addEventListener("input", () => {
    showFieldError(messageInput, messageError, "");
});


contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    const nameErrorText = name.length < 2
        ? "Nama wajib diisi minimal 2 karakter."
        : "";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const emailErrorText = !emailPattern.test(email)
        ? "Masukkan email dengan format yang benar."
        : "";

    const messageErrorText = message.length < 10
        ? "Pesan wajib diisi minimal 10 karakter."
        : "";

    showFieldError(nameInput, nameError, nameErrorText);
    showFieldError(emailInput, emailError, emailErrorText);
    showFieldError(messageInput, messageError, messageErrorText);

    const isValid =
        !nameErrorText &&
        !emailErrorText &&
        !messageErrorText;

    if (!isValid) {
        formFeedback.className = "form-feedback error";
        formFeedback.textContent =
            "Periksa kembali kolom yang masih salah.";
        return;
    }

    // Form ini masih demo frontend, belum mengirim ke server.
    formFeedback.className = "form-feedback success";
    formFeedback.textContent =
        "Validasi berhasil! Form ini belum mengirim pesan ke server.";
});


// ============================================
// 15. FOOTER DAN DATA PERTAMA KALI
// ============================================

document.querySelector("#currentYear").textContent =
    new Date().getFullYear();




// ============================================
// 16. DETEKSI PERUBAHAN KONEKSI
// ============================================

window.addEventListener("offline", () => {
    browserOffline = true;

    // Membuat respons request lama tidak berlaku.
    requestNumber++;

    currentData = [];
    animeGrid.replaceChildren();
    emptyState.classList.add("hidden");

    resultsCount.textContent = "OFFLINE";

    setStatus(
        "Koneksi internet terputus. Data Explore tidak tersedia.",
        "error"
    );

    animeGrid.setAttribute("aria-busy", "false");

    reloadButton.disabled = true;
    reloadButton.textContent = "Internet Terputus";
});


window.addEventListener("online", () => {
    browserOffline = false;

    reloadButton.disabled = false;
    reloadButton.textContent = "↻ Muat Ulang Data";

    setStatus(
        "Koneksi terdeteksi kembali. Memuat katalog...",
        "",
        true
    );

    // Ambil ulang kategori yang sedang dipilih.
    loadMedia();
});


// Jika halaman pertama kali dibuka saat offline,
// jangan menampilkan katalog lama atau mencoba meminta data.
if (!navigator.onLine) {
    currentData = [];
    animeGrid.replaceChildren();

    resultsCount.textContent = "OFFLINE";

    setStatus(
        "Kamu sedang offline. Nyalakan koneksi internet untuk melihat katalog.",
        "error"
    );

    reloadButton.disabled = true;
    reloadButton.textContent = "Internet Terputus";
}

selectMedia("anime");