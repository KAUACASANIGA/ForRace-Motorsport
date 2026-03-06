(() => {
    const fleetRoot = document.getElementById("fleet-focus-root");
    const fleetCards = Array.from(document.querySelectorAll(".fleet .car"));

    if (!fleetRoot || fleetCards.length === 0) return;

    const extractCardData = (card) => {
        const photo = card.querySelector(".car-photo");
        const fallbackSrc = photo?.querySelector("img")?.getAttribute("src") || "";
        const fallbackAlt = photo?.querySelector("img")?.getAttribute("alt") || "Carro da frota";
        const gallery = parseDelimitedList(photo?.dataset.gallery, ",");
        const galleryAlts = parseDelimitedList(photo?.dataset.galleryAlts, "|");
        const activeIndex = Number.parseInt(photo?.dataset.activeIndex || "0", 10);
        const normalizedGallery = gallery.length > 0 ? gallery : fallbackSrc ? [fallbackSrc] : [];

        return {
            cardId: card.dataset.cardId || "",
            imageSrc: fallbackSrc,
            imageAlt: fallbackAlt,
            gallery: normalizedGallery,
            galleryAlts,
            activeIndex: Number.isFinite(activeIndex) ? activeIndex : 0,
            tag: card.querySelector(".tag")?.textContent?.trim() || "",
            title: card.querySelector("h3")?.textContent?.trim() || "Frota ForRace",
            copy: card.querySelector("p")?.textContent?.trim() || "",
        };
    };

    const enterDelayMs = 35;
    const hideDelayMs = 360;
    let activeCard = null;
    let activeCardIndex = 0;
    let activeImageIndex = 0;
    let isMounted = false;
    let showTimer = null;
    let hideTimer = null;

    const clearTimers = () => {
        if (showTimer) {
            window.clearTimeout(showTimer);
            showTimer = null;
        }
        if (hideTimer) {
            window.clearTimeout(hideTimer);
            hideTimer = null;
        }
    };

    const syncCardSelection = (cardData, selectedIndex) => {
        if (!cardData) return;
        const gallerySize = cardData.gallery?.length || 0;
        if (gallerySize === 0) return;
        const safeIndex = ((selectedIndex % gallerySize) + gallerySize) % gallerySize;

        if (cardData.cardId && fleetGalleryControllers.has(cardData.cardId)) {
            const controller = fleetGalleryControllers.get(cardData.cardId);
            controller.setSlide(safeIndex);
            return;
        }

        const card = cardData.cardId
            ? document.querySelector(`.fleet .car[data-card-id="${cardData.cardId}"]`)
            : null;
        const photo = card?.querySelector(".car-photo");
        const img = photo?.querySelector("img");
        if (!photo || !img) return;

        img.src = cardData.gallery[safeIndex];
        img.alt = (cardData.galleryAlts && cardData.galleryAlts[safeIndex]) || cardData.imageAlt || "Carro da frota";
        photo.dataset.activeIndex = String(safeIndex);
    };

    const overlay = document.createElement("div");
    overlay.className = "fleet-focus-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const cardEl = document.createElement("article");
    cardEl.className = "fleet-focus-card";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "fleet-focus-close";
    closeButton.setAttribute("aria-label", "Fechar destaque");
    closeButton.textContent = "X";

    const media = document.createElement("img");
    media.className = "fleet-focus-media";
    media.alt = "Carro da frota";

    const cardPrevButton = document.createElement("button");
    cardPrevButton.type = "button";
    cardPrevButton.className = "fleet-focus-card-control prev";
    cardPrevButton.setAttribute("aria-label", "Carro anterior");
    cardPrevButton.textContent = "<";

    const cardNextButton = document.createElement("button");
    cardNextButton.type = "button";
    cardNextButton.className = "fleet-focus-card-control next";
    cardNextButton.setAttribute("aria-label", "Proximo carro");
    cardNextButton.textContent = ">";

    const dots = document.createElement("div");
    dots.className = "fleet-focus-dots";
    const cardDots = document.createElement("div");
    cardDots.className = "fleet-focus-card-dots";

    const content = document.createElement("div");
    content.className = "fleet-focus-content";
    const tag = document.createElement("div");
    tag.className = "tag";
    const title = document.createElement("h3");
    title.className = "fleet-focus-title";
    const copy = document.createElement("p");
    copy.className = "fleet-focus-copy";

    content.append(tag, title, copy);
    cardEl.append(closeButton, media, dots, content);
    overlay.append(cardEl, cardDots, cardPrevButton, cardNextButton);
    fleetRoot.appendChild(overlay);

    const syncFleetMediaHeight = () => {
        media.style.height = "";
        cardEl.classList.remove("is-compact");
    };

    media.addEventListener("load", syncFleetMediaHeight);

    const updateDots = () => {
        dots.innerHTML = "";
        const gallerySize = activeCard?.gallery?.length || 0;
        if (gallerySize <= 1) return;

        for (let i = 0; i < gallerySize; i += 1) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = `fleet-focus-dot ${i === activeImageIndex ? "is-active" : ""}`;
            dot.setAttribute("aria-label", `Ir para foto ${i + 1}`);
            dot.addEventListener("click", (event) => {
                event.stopPropagation();
                changeOverlaySlide(() => i);
            });
            dots.appendChild(dot);
        }
    };

    const updateCardDots = () => {
        cardDots.innerHTML = "";
        if (fleetCards.length <= 1) {
            cardDots.style.display = "none";
            cardPrevButton.style.display = "none";
            cardNextButton.style.display = "none";
            return;
        }

        cardDots.style.display = "flex";
        cardPrevButton.style.display = "grid";
        cardNextButton.style.display = "grid";
        for (let i = 0; i < fleetCards.length; i += 1) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = `fleet-focus-card-dot ${i === activeCardIndex ? "is-active" : ""}`;
            dot.setAttribute("aria-label", `Ir para carro ${i + 1}`);
            dot.addEventListener("click", (event) => {
                event.stopPropagation();
                changeFocusedCard(() => i);
            });
            cardDots.appendChild(dot);
        }
    };

    const renderOverlay = () => {
        if (!activeCard) return;
        const gallerySize = activeCard.gallery?.length || 0;
        const currentImageSrc = gallerySize > 0 ? activeCard.gallery[activeImageIndex] : activeCard.imageSrc;
        const currentImageAlt =
            (activeCard.galleryAlts && activeCard.galleryAlts[activeImageIndex]) || activeCard.imageAlt || "Carro da frota";

        media.src = currentImageSrc || "";
        media.alt = currentImageAlt;
        media.style.display = currentImageSrc ? "block" : "none";
        tag.textContent = activeCard.tag || "";
        tag.style.display = activeCard.tag ? "inline-block" : "none";
        title.textContent = activeCard.title;
        copy.textContent = activeCard.copy;

        const hasGallery = gallerySize > 1;
        dots.style.display = hasGallery ? "flex" : "none";
        updateDots();
        syncFleetMediaHeight();
    };

    const setActiveCard = (nextCardIndex, shouldSyncCurrent = true) => {
        if (fleetCards.length === 0) return;
        const normalizedIndex = ((nextCardIndex % fleetCards.length) + fleetCards.length) % fleetCards.length;

        if (shouldSyncCurrent && activeCard) {
            syncCardSelection(activeCard, activeImageIndex);
        }

        const data = extractCardData(fleetCards[normalizedIndex]);
        const maxIndex = Math.max((data.gallery?.length || 1) - 1, 0);
        activeCard = data;
        activeCardIndex = normalizedIndex;
        activeImageIndex = Math.min(Math.max(data.activeIndex, 0), maxIndex);
        renderOverlay();
        updateCardDots();
        cardEl.scrollTop = 0;
    };

    const changeFocusedCard = (resolver) => {
        if (fleetCards.length <= 1) return;
        const nextCardIndex = resolver(activeCardIndex, fleetCards.length);
        const normalizedIndex = ((nextCardIndex % fleetCards.length) + fleetCards.length) % fleetCards.length;
        if (normalizedIndex === activeCardIndex) return;

        runFadeSwap(media, "is-fading", 120, () => {
            setActiveCard(normalizedIndex);
        });
    };

    const openOverlay = (cardIndex) => {
        clearTimers();
        setActiveCard(cardIndex, false);
        overlay.scrollTop = 0;
        overlay.setAttribute("aria-hidden", "false");
        lockBodyScroll();

        isMounted = true;
        overlay.style.display = "grid";
        showTimer = window.setTimeout(() => {
            overlay.classList.add("is-visible");
        }, enterDelayMs);
        syncFleetMediaHeight();
    };

    const closeOverlay = () => {
        if (!isMounted) return;
        clearTimers();
        syncCardSelection(activeCard, activeImageIndex);
        overlay.classList.remove("is-visible");
        hideTimer = window.setTimeout(() => {
            overlay.style.display = "none";
            overlay.setAttribute("aria-hidden", "true");
            unlockBodyScroll();
            activeCard = null;
            isMounted = false;
        }, hideDelayMs);
    };

    const changeOverlaySlide = (resolver) => {
        const gallerySize = activeCard?.gallery?.length || 0;
        if (gallerySize <= 1) return;

        runFadeSwap(media, "is-fading", 120, () => {
            const next = resolver(activeImageIndex, gallerySize);
            activeImageIndex = (next + gallerySize) % gallerySize;
            renderOverlay();
        });
    };

    overlay.addEventListener("click", (event) => {
        if (event.target !== overlay) return;
        closeOverlay();
    });
    cardEl.addEventListener("click", (event) => event.stopPropagation());
    closeButton.addEventListener("click", closeOverlay);
    cardPrevButton.addEventListener("click", (event) => {
        event.stopPropagation();
        changeFocusedCard((index, size) => (index - 1 + size) % size);
    });
    cardNextButton.addEventListener("click", (event) => {
        event.stopPropagation();
        changeFocusedCard((index, size) => (index + 1) % size);
    });

    bindHorizontalSwipe(
        cardEl,
        () => changeFocusedCard((index, size) => (index + 1) % size),
        () => changeFocusedCard((index, size) => (index - 1 + size) % size)
    );

    fleetCards.forEach((card, cardIndex) => {
        card.addEventListener("click", (event) => {
            if (event.target.closest("a, button")) return;
            openOverlay(cardIndex);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (!isMounted || !activeCard) return;
        if (event.key === "Escape") closeOverlay();
        if (event.key === "ArrowRight") changeOverlaySlide((index, size) => (index + 1) % size);
        if (event.key === "ArrowLeft") changeOverlaySlide((index, size) => (index - 1 + size) % size);
    });

    overlay.style.display = "none";

    window.addEventListener("resize", syncFleetMediaHeight);
})();
