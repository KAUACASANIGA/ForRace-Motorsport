// core.js - Shared functionality for the ForRace Motorsport site

// Utility functions
const parseDelimitedList = (value, separator) =>
    (value || "")
        .split(separator)
        .map(item => item.trim())
        .filter(Boolean);

const runFadeSwap = (element, fadeClassName, swapDelayMs, swap) => {
    element.classList.add(fadeClassName);
    window.setTimeout(() => {
        swap();
        const clearFade = () => element.classList.remove(fadeClassName);
        if (element.complete) {
            window.requestAnimationFrame(clearFade);
        } else {
            element.addEventListener("load", clearFade, { once: true });
            window.setTimeout(clearFade, 280);
        }
    }, swapDelayMs);
};

const bindHorizontalSwipe = (element, onSwipeLeft, onSwipeRight) => {
    let startX = null;
    let startY = null;
    const reset = () => { startX = null; startY = null; };
    element.addEventListener("touchstart", e => {
        const touch = e.changedTouches?.[0];
        if (!touch) return;
        startX = touch.clientX;
        startY = touch.clientY;
    }, { passive: true });
    element.addEventListener("touchend", e => {
        if (startX === null || startY === null) return;
        const touch = e.changedTouches?.[0];
        if (!touch) { reset(); return; }
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        reset();
        if (Math.abs(deltaX) < 44) return;
        if (Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
        if (deltaX < 0) onSwipeLeft(); else onSwipeRight();
    }, { passive: true });
    element.addEventListener("touchcancel", reset, { passive: true });
};

// Smooth scrolling for anchor links
(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const topGap = 18;
    document.addEventListener("click", event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const hash = link.getAttribute("href");
        if (!hash || hash === "#") return;
        const target = document.querySelector(hash);
        if (!target) return;
        event.preventDefault();
        const targetTop = target.getBoundingClientRect().top + window.scrollY;
        const desiredTop = targetTop - topGap;
        const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = Math.min(Math.max(desiredTop, 0), Math.max(maxScrollTop, 0));
        window.scrollTo({ top: scrollTop, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
        if (window.location.hash !== hash) history.pushState(null, "", hash);
    });
})();

// Mobile navigation toggle
(() => {
    const header = document.querySelector("header");
    const nav = header?.querySelector("nav");
    const quickNav = header?.querySelector(".mobile-quick-nav");
    const toggle = quickNav?.querySelector(".mobile-menu-toggle");
    const panel = header?.querySelector(".mobile-menu-panel");
    if (!header || !nav || !quickNav || !toggle || !panel) return;
    const closeMenu = () => {
        toggle.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
    };
    const openMenu = () => {
        toggle.setAttribute("aria-expanded", "true");
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
    };
    toggle.addEventListener("click", () => {
        if (panel.classList.contains("is-open")) closeMenu(); else openMenu();
    });
    panel.addEventListener("click", e => { if (e.target.closest("a")) closeMenu(); });
    document.addEventListener("click", e => {
        if (!panel.classList.contains("is-open")) return;
        if (header.contains(e.target)) return;
        closeMenu();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && panel.classList.contains("is-open")) closeMenu(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 720) closeMenu(); });
})();

// Service widget click handling (WhatsApp)
(() => {
    const widgets = Array.from(document.querySelectorAll(".service-widget[data-whatsapp]"));
    if (widgets.length === 0) return;
    widgets.forEach(widget => {
        const url = widget.dataset.whatsapp;
        if (!url) return;
        widget.addEventListener("click", e => {
            if (e.target.closest("a, button")) return;
            window.open(url, "_blank", "noopener");
        });
        widget.addEventListener("keydown", e => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            window.open(url, "_blank", "noopener");
        });
        widget.setAttribute("tabindex", "0");
        widget.setAttribute("role", "link");
        widget.setAttribute("aria-label", "Abrir atendimento de locacao no WhatsApp");
    });
})();

// Mobile carousel dot navigation (used by fleet, grid, projects-grid, crew-grid, service-widgets)
(() => {
    const carouselContainers = Array.from(document.querySelectorAll(".fleet, .grid, .projects-grid, .crew-grid, .service-widgets"));
    if (carouselContainers.length === 0) return;
    const isMobileViewport = window.matchMedia("(max-width: 720px)");
    const setups = [];
    carouselContainers.forEach(container => {
        const cards = Array.from(container.children).filter(el => el.matches(".car, .card, .project-card, .crew-card, .service-widget"));
        if (cards.length <= 1) return;
        const dots = document.createElement("div");
        dots.className = "mobile-carousel-dots";
        dots.setAttribute("aria-hidden", "true");
        let activeIndex = 0;
        let ticking = false;
        const dotButtons = cards.map((_, i) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "mobile-carousel-dot";
            dot.setAttribute("aria-label", `Ir para card ${i + 1}`);
            dots.appendChild(dot);
            return dot;
        });
        const setActiveDot = index => {
            if (index === activeIndex) return;
            activeIndex = index;
            dotButtons.forEach((btn, btnIdx) => btn.classList.toggle("is-active", btnIdx === activeIndex));
        };
        const getClosestCardIndex = () => {
            const containerCenter = container.scrollLeft + container.clientWidth / 2;
            let closest = 0;
            let smallest = Number.POSITIVE_INFINITY;
            cards.forEach((card, i) => {
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const distance = Math.abs(cardCenter - containerCenter);
                if (distance < smallest) { smallest = distance; closest = i; }
            });
            return closest;
        };
        const updateDotVisibility = () => {
            const hasOverflow = container.scrollWidth - container.clientWidth > 8;
            const shouldShow = isMobileViewport.matches && hasOverflow;
            dots.classList.toggle("is-visible", shouldShow);
            dots.setAttribute("aria-hidden", String(!shouldShow));
            if (shouldShow) setActiveDot(getClosestCardIndex());
        };
        const onScroll = () => {
            if (!dots.classList.contains("is-visible")) return;
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                ticking = false;
                setActiveDot(getClosestCardIndex());
            });
        };
        dotButtons.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                cards[i].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            });
        });
        container.insertAdjacentElement("afterend", dots);
        dotButtons[0].classList.add("is-active");
        container.addEventListener("scroll", onScroll, { passive: true });
        setups.push(updateDotVisibility);
    });
    if (setups.length === 0) return;
    const refreshAll = () => setups.forEach(fn => fn());
    if (typeof isMobileViewport.addEventListener === "function") {
        isMobileViewport.addEventListener("change", refreshAll);
    } else if (typeof isMobileViewport.addListener === "function") {
        isMobileViewport.addListener(refreshAll);
    }
    window.addEventListener("resize", refreshAll);
    window.addEventListener("load", refreshAll);
    refreshAll();
})();

// Scroll Reveal Observer
(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReducedMotion.matches) return;
    const observerOptions = { root: null, rootMargin: "0px 0px -50px 0px", threshold: 0.1 };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-revealed");
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);
    const revealElements = document.querySelectorAll(".scroll-reveal");
    revealElements.forEach(el => observer.observe(el));
})();

// Export utilities if needed elsewhere
export { parseDelimitedList, runFadeSwap, bindHorizontalSwipe };
