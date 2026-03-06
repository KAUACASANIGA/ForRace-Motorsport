(() => {
    const projectRoot = document.getElementById("project-focus-root");
    const projectCards = Array.from(document.querySelectorAll(".project-card[data-gallery]"));
    if (!projectRoot || projectCards.length === 0) return;

    // Create Overlay
    const overlay = document.createElement("div");
    overlay.className = "project-focus-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const card = document.createElement("article");
    card.className = "project-focus-card";

    const header = document.createElement("div");
    header.className = "project-focus-header";
    header.innerHTML = `<span class="project-focus-header-label">ForRace Motorsport</span><span class="project-focus-header-title">Detalhes do projeto</span>`;

    const closeButton = document.createElement("button");
    closeButton.className = "project-focus-close";
    closeButton.textContent = "X";

    const mediaWrap = document.createElement("div");
    mediaWrap.className = "project-focus-media-wrap";
    const media = document.createElement("img");
    media.className = "project-focus-media";
    const mediaVideo = document.createElement("iframe");
    mediaVideo.className = "project-focus-media project-focus-video";
    mediaVideo.style.display = "none";
    mediaVideo.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    mediaVideo.setAttribute("allowfullscreen", "true");

    const dots = document.createElement("div");
    dots.className = "project-focus-dots";
    mediaWrap.append(media, mediaVideo, dots);

    const content = document.createElement("div");
    content.className = "project-focus-content";
    const title = document.createElement("h3");
    const projectInfo = document.createElement("div");
    projectInfo.className = "project-info";
    const shortCopy = document.createElement("p");
    shortCopy.className = "project-focus-copy project-focus-summary";
    const detailCopy = document.createElement("p");
    detailCopy.className = "project-focus-copy";
    projectInfo.append(shortCopy, detailCopy);

    const trackHeading = document.createElement("div");
    trackHeading.className = "project-track-heading";
    trackHeading.textContent = "Autódromos";
    const trackButtons = document.createElement("div");
    trackButtons.className = "project-track-buttons";
    const trackNote = document.createElement("p");
    trackNote.className = "project-focus-copy project-track-note";

    content.append(title, projectInfo, trackHeading, trackButtons, trackNote);
    card.append(header, closeButton, mediaWrap, content);
    overlay.append(card);
    projectRoot.appendChild(overlay);

    let activeCardIndex = 0;
    let activePhotoIndex = 0;
    let activeTrackIndex = 0;
    let activeView = "project"; // "project" or "track"
    const projectDataList = [];

    const render = () => {
        const data = projectDataList[activeCardIndex];
        if (!data) return;

        title.textContent = data.title;
        shortCopy.textContent = data.shortCopy;
        detailCopy.textContent = data.detail;

        // Media logic
        const isTrackView = activeView === "track";
        const tracks = data.tracks || [];
        const currentTrack = tracks[activeTrackIndex];

        // Specific video logic (example from original)
        const shouldShowVideo = (activeCardIndex === 0 && isTrackView && activeTrackIndex === 2) ||
            (activeCardIndex === 1 && isTrackView && activeTrackIndex === 0);

        if (shouldShowVideo) {
            media.style.display = "none";
            mediaVideo.style.display = "block";
            mediaVideo.src = (activeCardIndex === 1) ? "https://www.youtube.com/embed/0NaIWkdqVAs" : "https://www.youtube.com/embed/2hlKoQCpf9I?start=136";
        } else {
            mediaVideo.style.display = "none";
            mediaVideo.removeAttribute("src");
            media.style.display = "block";
            window.runFadeSwap(media, "is-fading", 120, () => {
                media.src = data.gallery[activePhotoIndex];
                media.alt = data.alts[activePhotoIndex] || data.title;
            });
        }

        // Project Info vs Track Note
        projectInfo.style.display = isTrackView ? "none" : "block";
        trackNote.style.display = isTrackView ? "block" : "none";
        if (isTrackView && currentTrack) {
            trackNote.innerHTML = currentTrack.text;
            if (currentTrack.name.includes("|")) {
                const p = currentTrack.name.split("|");
                title.innerHTML = `<div class="track-title-container"><span>${p[0]}</span><br><small>${p[1]}</small></div>`;
            } else {
                title.textContent = currentTrack.name;
            }
        }

        // Dots and Track Buttons
        dots.innerHTML = "";
        data.gallery.forEach((_, i) => {
            const dot = document.createElement("button");
            dot.className = `project-focus-dot ${i === activePhotoIndex ? "is-active" : ""}`;
            dot.addEventListener("click", () => { activePhotoIndex = i; render(); });
            dots.appendChild(dot);
        });

        trackButtons.innerHTML = "";
        tracks.forEach((t, i) => {
            const btn = document.createElement("button");
            btn.className = `project-track-button ${isTrackView && i === activeTrackIndex ? "is-active" : ""}`;
            btn.innerHTML = `<img src="img/track-01.webp" alt="Pista">`; // Use dynamic icons if needed
            btn.addEventListener("click", () => {
                if (activeView === "track" && activeTrackIndex === i) {
                    activeView = "project";
                } else {
                    activeView = "track";
                    activeTrackIndex = i;
                }
                render();
            });
            trackButtons.appendChild(btn);
        });
    };

    const open = (index) => {
        activeCardIndex = index;
        activePhotoIndex = 0;
        activeTrackIndex = 0;
        activeView = "project";
        render();
        if (window.lockBodyScroll) window.lockBodyScroll();
        overlay.classList.add("is-visible");
        overlay.setAttribute("aria-hidden", "false");
    };

    const close = () => {
        overlay.classList.remove("is-visible");
        overlay.setAttribute("aria-hidden", "true");
        if (window.unlockBodyScroll) window.unlockBodyScroll();
    };

    projectCards.forEach((el, i) => {
        const gallery = window.parseDelimitedList(el.dataset.gallery, ",");
        const alts = window.parseDelimitedList(el.dataset.galleryAlts, "|");
        const trackInfo = (el.dataset.trackInfo || "").split("||").filter(Boolean).map(t => {
            const p = t.split("::");
            return { name: p[0], text: p[1] || "" };
        });

        projectDataList.push({
            title: el.querySelector("h3")?.textContent || "Projeto",
            shortCopy: el.querySelector("p")?.textContent || "",
            detail: el.dataset.detail || "",
            gallery,
            alts,
            tracks: trackInfo
        });

        el.addEventListener("click", (e) => {
            if (e.target.closest("a, button")) return;
            open(i);
        });
    });

    closeButton.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    // Animated CoverFlow for Projects Carousel
    (() => {
        const carousel = document.querySelector(".projects-carousel");
        const track = carousel?.querySelector(".projects-carousel-track");
        if (!carousel || !track) return;
        const cards = Array.from(track.querySelectorAll(".project-card"));
        let activeIdx = 0;
        const renderCarousel = () => {
            cards.forEach((c, i) => {
                c.classList.remove("is-active", "is-side", "is-left", "is-right", "is-hidden");
                const offset = (i - activeIdx + cards.length) % cards.length;
                if (offset === 0) c.classList.add("is-active");
                else if (offset === 1) c.classList.add("is-side", "is-right");
                else if (offset === cards.length - 1) c.classList.add("is-side", "is-left");
                else c.classList.add("is-hidden");
            });
        };
        carousel.querySelector(".prev")?.addEventListener("click", () => { activeIdx = (activeIdx - 1 + cards.length) % cards.length; renderCarousel(); });
        carousel.querySelector(".next")?.addEventListener("click", () => { activeIdx = (activeIdx + 1) % cards.length; renderCarousel(); });
        renderCarousel();
    })();
})();
