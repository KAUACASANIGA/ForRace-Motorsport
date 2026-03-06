(() => {
    const projectRoot = document.getElementById("project-focus-root");
    const projectCards = Array.from(document.querySelectorAll(".project-card[data-gallery]"));
    if (!projectRoot || projectCards.length === 0) return;

    const getActiveData = () => {
        return window.activeProjectData || null;
    }

    const overlay = document.createElement("div");
    overlay.className = "project-focus-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const card = document.createElement("article");
    card.className = "project-focus-card";
    card.style.position = "relative";
    card.style.touchAction = "pan-y";

    const header = document.createElement("div");
    header.className = "project-focus-header";
    const headerLabel = document.createElement("span");
    headerLabel.className = "project-focus-header-label";
    headerLabel.textContent = "ForRace Motorsport";
    const headerTitle = document.createElement("span");
    headerTitle.className = "project-focus-header-title";
    headerTitle.textContent = "Detalhes do projeto";
    header.append(headerLabel, headerTitle);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "project-focus-close";
    closeButton.setAttribute("aria-label", "Fechar projeto");
    closeButton.textContent = "X";

    const closeHotspot = document.createElement("button");
    closeHotspot.type = "button";
    closeHotspot.className = "project-focus-close-hotspot";
    closeHotspot.setAttribute("aria-label", "Fechar projeto");

    const mediaWrap = document.createElement("div");
    mediaWrap.className = "project-focus-media-wrap";
    const media = document.createElement("img");
    media.className = "project-focus-media";
    media.alt = "Foto do projeto";
    const mediaVideo = document.createElement("iframe");
    mediaVideo.className = "project-focus-media project-focus-video";
    mediaVideo.title = "Video do projeto";
    mediaVideo.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    mediaVideo.setAttribute("allowfullscreen", "true");
    mediaVideo.style.display = "none";

    const dots = document.createElement("div");
    dots.className = "project-focus-dots";
    const cardDots = document.createElement("div");
    cardDots.className = "project-focus-card-dots";
    mediaWrap.append(media, mediaVideo, dots);

    const cardPrevButton = document.createElement("button");
    cardPrevButton.type = "button";
    cardPrevButton.className = "project-focus-card-control prev";
    cardPrevButton.setAttribute("aria-label", "Projeto anterior");
    cardPrevButton.textContent = "<";

    const cardNextButton = document.createElement("button");
    cardNextButton.type = "button";
    cardNextButton.className = "project-focus-card-control next";
    cardNextButton.setAttribute("aria-label", "Proximo projeto");
    cardNextButton.textContent = ">";

    const content = document.createElement("div");
    content.className = "project-focus-content";
    const tagRow = document.createElement("div");
    tagRow.className = "project-focus-tag-row";
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = "tag project-tag-toggle";
    tag.setAttribute("aria-label", "Ver especificacoes do projeto");
    const tagLine = document.createElement("span");
    tagLine.className = "project-tag-line";
    tagLine.setAttribute("aria-hidden", "true");
    const tagLabel = document.createElement("span");
    tagLabel.className = "project-tag-label";
    tagLabel.textContent = "Descrição";
    tag.append(tagLine, tagLabel);
    const trackButtons = document.createElement("div");
    trackButtons.className = "project-track-buttons";
    tagRow.append(tag);
    const trackHeading = document.createElement("div");
    trackHeading.className = "project-track-heading";
    trackHeading.textContent = "Autodromos";
    const title = document.createElement("h3");
    const projectInfo = document.createElement("div");
    projectInfo.className = "project-info";
    const shortCopy = document.createElement("p");
    shortCopy.className = "project-focus-copy project-focus-summary";
    const detailCopy = document.createElement("p");
    detailCopy.className = "project-focus-copy";
    projectInfo.append(shortCopy, detailCopy);
    const trackNote = document.createElement("p");
    trackNote.className = "project-focus-copy project-track-note";

    const rentWidget = document.createElement("div");
    rentWidget.className = "project-rent-widget";
    const rentTitle = document.createElement("h4");
    rentTitle.textContent = "Aluga-se";
    const rentText = document.createElement("p");
    const rentCta = document.createElement("a");
    rentCta.className = "cta";
    rentCta.href = "https://wa.me/5511945339281";
    rentCta.target = "_blank";
    rentCta.rel = "noopener";
    rentCta.textContent = "Consultar disponibilidade";
    rentWidget.append(rentTitle, rentText, rentCta);

    content.append(tagRow, title, projectInfo, trackHeading, trackButtons, trackNote, rentWidget);
    card.append(header, closeButton, closeHotspot, mediaWrap, content);
    overlay.append(card, cardDots, cardPrevButton, cardNextButton);
    projectRoot.appendChild(overlay);

    const projectDataList = [];
    let activeData = null;
    let activeCardIndex = 0;
    let activeIndex = 0;
    let activeTrackIndex = 0;
    let activeView = "project";
    const projectMediaQuery = window.matchMedia("(max-width: 720px)");

    const setOverlayDisplay = () => {
        overlay.style.display = projectMediaQuery.matches ? "flex" : "grid";
    };

    const syncProjectMediaHeight = () => {
        mediaWrap.style.height = "";
        card.classList.remove("is-compact");
    };

    const trackIcons = ["img/track-01.webp", "img/track-02.webp", "img/track-03.webp", "img/track-04.webp"];
    trackIcons.forEach((src, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "project-track-button";
        button.dataset.trackIndex = String(index);
        button.setAttribute("aria-label", `Selecionar pista ${index + 1}`);
        const icon = document.createElement("img");
        icon.src = src;
        icon.alt = `Pista ${index + 1}`;
        button.appendChild(icon);
        trackButtons.appendChild(button);
    });


    const renderTracks = () => {
        const tracks = activeData?.tracks || [];
        if (tracks.length === 0) {
            trackButtons.style.display = "none";
            return;
        }

        trackButtons.style.display = "flex";
        const safeIndex = Math.min(Math.max(activeTrackIndex, 0), tracks.length - 1);
        const activeTrack = tracks[safeIndex];

        if (activeView === "track") {
            const trackName = activeTrack.name || "Pista";
            if (trackName.includes("|")) {
                const parts = trackName.split("|");
                title.innerHTML = `
          <div class="track-title-container">
            <div class="track-title-top">
              <svg class="track-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${parts[0] || ""}</span>
            </div>
            <div class="track-title-bottom">${parts[1] || ""}</div>
            ${parts[2] ? `<div class="track-title-city">${parts[2]}</div>` : ""}
          </div>
        `;
            } else {
                title.textContent = trackName;
            }
            trackNote.innerHTML = activeTrack.text || "";
        }

        trackButtons.querySelectorAll("button").forEach((button, index) => {
            const isVisible = index < tracks.length;
            button.style.display = isVisible ? "grid" : "none";
            button.classList.toggle("is-active", activeView === "track" && index === safeIndex);
        });
    };

    const renderDots = () => {
        dots.innerHTML = "";
        const size = activeData?.gallery?.length || 0;
        if (size <= 1) return;
        for (let i = 0; i < size; i += 1) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = `project-focus-dot ${i === activeIndex ? "is-active" : ""}`;
            dot.setAttribute("aria-label", `Ir para foto ${i + 1}`);
            dot.addEventListener("click", (event) => {
                event.stopPropagation();
                changeSlide(() => i);
            });
            dots.appendChild(dot);
        }
    };

    const renderCardDots = () => {
        cardDots.innerHTML = "";
        if (projectDataList.length <= 1) {
            cardDots.style.display = "none";
            return;
        }

        cardDots.style.display = "flex";
        for (let i = 0; i < projectDataList.length; i += 1) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = `project-focus-card-dot ${i === activeCardIndex ? "is-active" : ""}`;
            dot.setAttribute("aria-label", `Ir para projeto ${i + 1}`);
            dot.addEventListener("click", (event) => {
                event.stopPropagation();
                changeFocusedProjectCard(() => i);
            });
            cardDots.appendChild(dot);
        }
    };

    const render = () => {
        if (!activeData) return;
        const size = activeData.gallery.length;
        const src = activeData.gallery[activeIndex] || "";
        const alt = activeData.alts[activeIndex] || activeData.alts[0] || "Foto do projeto";

        const shouldShowFuscaVideo = activeCardIndex === 0 && activeView === "track" && activeTrackIndex === 2;
        const shouldShowEscortVideo = activeCardIndex === 1 && activeView === "track" && activeTrackIndex === 0;
        if (shouldShowFuscaVideo || shouldShowEscortVideo) {
            media.style.display = "none";
            mediaVideo.style.display = "block";
            if (shouldShowEscortVideo) {
                mediaVideo.src = "https://www.youtube.com/embed/0NaIWkdqVAs";
            } else {
                mediaVideo.src = "https://www.youtube.com/embed/2hlKoQCpf9I?start=136";
            }
        } else {
            mediaVideo.style.display = "none";
            mediaVideo.removeAttribute("src");
            media.style.display = "block";
            media.src = src;
            media.alt = alt;
        }
        tag.classList.toggle("is-active", activeView === "project");
        title.textContent = activeData.title;
        shortCopy.textContent = activeData.shortCopy;
        detailCopy.textContent = activeData.detail;
        projectInfo.style.display = activeView === "project" ? "block" : "none";
        trackNote.style.display = activeView === "track" ? "block" : "none";
        renderTracks();
        rentText.textContent = activeData.rentLabel;
        if (activeData.rentUrl) {
            rentWidget.style.display = "block";
            rentCta.href = activeData.rentUrl;
            rentCta.style.pointerEvents = "auto";
            rentCta.style.opacity = "1";
            rentCta.textContent = "Consultar disponibilidade";
            rentCta.removeAttribute("aria-disabled");
            rentCta.setAttribute("target", "_blank");
            rentCta.setAttribute("rel", "noopener");
        } else {
            rentWidget.style.display = "none";
            rentCta.removeAttribute("href");
            rentCta.style.pointerEvents = "none";
            rentCta.style.opacity = "0.6";
            rentCta.textContent = "Locação indisponível";
            rentCta.setAttribute("aria-disabled", "true");
            rentCta.removeAttribute("target");
            rentCta.removeAttribute("rel");
        }

        const hasGallery = size > 1;
        dots.style.display = hasGallery ? "flex" : "none";
        renderDots();
        syncProjectMediaHeight();
    };

    const setActiveProjectCard = (nextCardIndex) => {
        if (projectDataList.length === 0) return;
        const normalizedIndex = ((nextCardIndex % projectDataList.length) + projectDataList.length) % projectDataList.length;
        activeCardIndex = normalizedIndex;
        activeData = projectDataList[normalizedIndex];
        window.activeProjectData = activeData;
        activeIndex = 0;
        activeTrackIndex = 0;
        activeView = "project";
        render();
        renderCardDots();
        card.scrollTop = 0;
    };

    const changeFocusedProjectCard = (resolver) => {
        if (!activeData || projectDataList.length <= 1) return;
        const nextCardIndex = resolver(activeCardIndex, projectDataList.length);
        const normalizedIndex = ((nextCardIndex % projectDataList.length) + projectDataList.length) % projectDataList.length;
        if (normalizedIndex === activeCardIndex) return;

        if (window.runFadeSwap) {
            window.runFadeSwap(media, "is-fading", 110, () => {
                setActiveProjectCard(normalizedIndex);
            });
        } else {
            setActiveProjectCard(normalizedIndex);
        }
    };

    const open = (cardIndex, trackIndex = null) => {
        setActiveProjectCard(cardIndex);
        if (Number.isFinite(trackIndex)) {
            activeView = "track";
            activeTrackIndex = trackIndex;
            render();
        }
        overlay.scrollTop = 0;
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-overlay-open");
        setOverlayDisplay();
        overlay.style.touchAction = "pan-y";
        card.style.touchAction = "pan-y";
        if (window.lockBodyScroll) window.lockBodyScroll();
        window.setTimeout(() => overlay.classList.add("is-visible"), 20);
        syncProjectMediaHeight();
    };

    const close = () => {
        overlay.classList.remove("is-visible");
        window.setTimeout(() => {
            overlay.style.display = "none";
            overlay.setAttribute("aria-hidden", "true");
            document.body.classList.remove("is-overlay-open");
            if (window.unlockBodyScroll) window.unlockBodyScroll();
            activeData = null;
        }, 280);
    };

    const changeSlide = (resolver) => {
        const size = activeData?.gallery?.length || 0;
        if (size <= 1) return;
        if (window.runFadeSwap) {
            window.runFadeSwap(media, "is-fading", 110, () => {
                const nextIndex = resolver(activeIndex, size);
                activeIndex = (nextIndex + size) % size;
                render();
            });
        } else {
            const nextIndex = resolver(activeIndex, size);
            activeIndex = (nextIndex + size) % size;
            render();
        }
    };

    projectCards.forEach((el) => {
        const gallery = window.parseDelimitedList ? window.parseDelimitedList(el.dataset.gallery, ",") : (el.dataset.gallery || "").split(",").map((item) => item.trim()).filter(Boolean);
        if (gallery.length === 0) return;
        const alts = window.parseDelimitedList ? window.parseDelimitedList(el.dataset.galleryAlts, "|") : (el.dataset.galleryAlts || "").split("|").map((item) => item.trim()).filter(Boolean);
        const rentLabel = el.dataset.rentLabel || "Disponivel sob consulta.";
        const rentUrl = el.dataset.rentUrl || "";

        // Parse Track Info inline
        const parseTrackInfoLocal = (value) => {
            const lines = window.parseDelimitedList ? window.parseDelimitedList(value, "||") : (value || "").split("||").map((item) => item.trim()).filter(Boolean);
            return lines
                .map((item) => {
                    const parts = item.split("::").map((part) => part.trim());
                    return {
                        name: parts[0] || "",
                        text: parts.slice(1).join("::") || "",
                    };
                })
                .filter((item) => item.name || item.text);
        };

        const trackInfo = parseTrackInfoLocal(el.dataset.trackInfo);
        const trackFallback = el.dataset.trackNote || "";
        const tracks =
            trackInfo.length > 0
                ? trackInfo
                : trackFallback
                    ? [{ name: "Pista", text: trackFallback }]
                    : [];

        const preview = document.createElement("div");
        preview.className = "project-rent-preview";

        const previewTitle = document.createElement("h4");
        previewTitle.textContent = rentUrl ? "Aluga-se" : "Indisponível";
        preview.append(previewTitle);
        const summaryElement = el.querySelector("p");
        if (summaryElement) {
            summaryElement.insertAdjacentElement("afterend", preview);
        } else {
            const titleElement = el.querySelector("h3");
            if (titleElement) {
                titleElement.insertAdjacentElement("afterend", preview);
            } else {
                el.appendChild(preview);
            }
        }

        const data = {
            gallery,
            alts,
            tag: el.querySelector(".tag")?.textContent?.trim() || "Projeto",
            title: el.querySelector("h3")?.textContent?.trim() || "Projeto ForRace",
            shortCopy: el.querySelector("p")?.textContent?.trim() || "",
            detail: el.dataset.detail || "",
            trackNote: el.dataset.trackNote || "",
            tracks,
            rentLabel,
            rentUrl,
        };
        const cardIndex = projectDataList.length;
        projectDataList.push(data);
        el.addEventListener("click", (event) => {
            if (event.target.closest("a, button")) return;
            open(cardIndex);
        });

    });

    closeButton.addEventListener("click", close);
    closeHotspot.addEventListener("click", close);
    overlay.addEventListener("click", (event) => {
        if (event.target !== overlay) return;
        close();
    });
    card.addEventListener("click", (event) => event.stopPropagation());
    tag.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!activeData) return;
        activeView = "project";
        render();
    });
    trackButtons.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-track-index]");
        if (!button) return;
        event.stopPropagation();
        const nextIndex = Number.parseInt(button.dataset.trackIndex || "0", 10);
        if (!Number.isFinite(nextIndex)) return;
        if (activeView === "track" && activeTrackIndex === nextIndex) {
            activeView = "project";
            render();
            return;
        }
        activeView = "track";
        activeTrackIndex = nextIndex;
        render();
    });
    // photo navigation uses dots only
    cardPrevButton.addEventListener("click", (event) => {
        event.stopPropagation();
        changeFocusedProjectCard((index, size) => (index - 1 + size) % size);
    });
    cardNextButton.addEventListener("click", (event) => {
        event.stopPropagation();
        changeFocusedProjectCard((index, size) => (index + 1) % size);
    });

    if (window.bindHorizontalSwipe) {
        window.bindHorizontalSwipe(
            card,
            () => changeFocusedProjectCard((index, size) => (index + 1) % size),
            () => changeFocusedProjectCard((index, size) => (index - 1 + size) % size)
        );
    }

    document.addEventListener("keydown", (event) => {
        if (!activeData) return;
        if (event.key === "Escape") close();
        if (event.key === "ArrowRight") changeSlide((index, size) => (index + 1) % size);
        if (event.key === "ArrowLeft") changeSlide((index, size) => (index - 1 + size) % size);
    });

    const syncOverlayOnResize = () => {
        if (overlay.style.display === "none") return;
        setOverlayDisplay();
        syncProjectMediaHeight();
    };

    if (typeof projectMediaQuery.addEventListener === "function") {
        projectMediaQuery.addEventListener("change", syncOverlayOnResize);
    } else if (typeof projectMediaQuery.addListener === "function") {
        projectMediaQuery.addListener(syncOverlayOnResize);
    }

    media.addEventListener("load", syncProjectMediaHeight);
    mediaVideo.addEventListener("load", syncProjectMediaHeight);
    window.addEventListener("resize", syncProjectMediaHeight);

    overlay.style.display = "none";
})();

// CoverFlow Animado
(() => {
    const carousel = document.querySelector(".projects-carousel");
    const track = carousel?.querySelector(".projects-carousel-track");
    const pagination = carousel?.querySelector(".projects-carousel-pagination");
    if (!carousel || !track) return;

    const cards = Array.from(track.querySelectorAll(".project-card"));
    if (cards.length <= 1) return;

    const prevButton = carousel.querySelector(".projects-carousel-control.prev");
    const nextButton = carousel.querySelector(".projects-carousel-control.next");
    const mediaQuery = window.matchMedia("(max-width: 720px)");
    let activeIndex = 0;
    let autoTimer = null;
    // Variável para checar se está em tela antes de iniciar os timers
    let isCarouselVisible = false;

    if (pagination) {
        cards.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.className = `carousel-dot ${index === 0 ? "is-active" : ""}`;
            dot.setAttribute("aria-label", `Ir para projeto ${index + 1}`);
            dot.addEventListener("click", () => {
                activeIndex = index;
                render();
                startAuto();
            });
            pagination.appendChild(dot);
        });
    }

    const clearClasses = () => {
        cards.forEach((card) => {
            card.classList.remove("is-active", "is-side", "is-hidden", "is-left", "is-right");
        });
    };

    const render = () => {
        if (mediaQuery.matches) {
            clearClasses();
            return;
        }

        cards.forEach((card, index) => {
            card.classList.remove("is-active", "is-side", "is-hidden", "is-left", "is-right");
            const offset = (index - activeIndex + cards.length) % cards.length;
            if (offset === 0) {
                card.classList.add("is-active");
            } else if (offset === 1) {
                card.classList.add("is-side", "is-right");
            } else if (offset === cards.length - 1) {
                card.classList.add("is-side", "is-left");
            } else {
                card.classList.add("is-hidden");
            }
        });

        if (pagination) {
            const dots = Array.from(pagination.querySelectorAll(".carousel-dot"));
            dots.forEach((dot, i) => dot.classList.toggle("is-active", i === activeIndex));
        }
    };

    const move = (direction) => {
        activeIndex = (activeIndex + direction + cards.length) % cards.length;
        render();
    };

    prevButton?.addEventListener("click", () => { move(-1); startAuto(); });
    nextButton?.addEventListener("click", () => { move(1); startAuto(); });

    cards.forEach((card, index) => {
        card.addEventListener("click", () => {
            if (mediaQuery.matches) return;
            if (card.classList.contains("is-active")) return;
            activeIndex = index;
            render();
            startAuto();
        });
    });

    if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", render);
    } else if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(render);
    }

    const startAuto = () => {
        stopAuto();
        if (!isCarouselVisible) return; // Só inicia se visível
        autoTimer = window.setInterval(() => {
            if (mediaQuery.matches) return;
            move(1);
        }, 4000);
    };

    const stopAuto = () => {
        if (!autoTimer) return;
        window.clearInterval(autoTimer);
        autoTimer = null;
    };

    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", startAuto);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAuto();
        else if (isCarouselVisible) startAuto();
    });

    // OTIMIZAÇÃO: Intersection Observer para pausar Carousel quando fora de tela
    const interactObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            isCarouselVisible = entry.isIntersecting;
            if (entry.isIntersecting) {
                startAuto();
            } else {
                stopAuto();
            }
        });
    }, { threshold: 0.1 });

    interactObserver.observe(carousel);

    render();
})();
