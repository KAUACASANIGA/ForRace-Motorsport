(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const topGap = 18;

  document.addEventListener("click", (event) => {
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

    window.scrollTo({
      top: scrollTop,
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });

    history.pushState(null, "", hash);
  });
})();

(() => {
  const canUseHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const fleetRoot = document.getElementById("fleet-focus-root");
  const fleetCards = Array.from(document.querySelectorAll(".fleet .car"));

  if (!canUseHover || !React || !ReactDOM || !fleetRoot || fleetCards.length === 0) return;

  const { useEffect, useState } = React;

  const extractCardData = (card) => ({
    imageSrc: card.querySelector(".car-photo img")?.getAttribute("src") || "",
    imageAlt: card.querySelector(".car-photo img")?.getAttribute("alt") || "Carro da frota",
    tag: card.querySelector(".tag")?.textContent?.trim() || "",
    title: card.querySelector("h3")?.textContent?.trim() || "Frota ForRace",
    copy: card.querySelector("p")?.textContent?.trim() || "",
  });

  function FleetFocusOverlay() {
    const [activeCard, setActiveCard] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const enterDelayMs = 35;
    const hideDelayMs = 120;
    const unmountDelayMs = 360;
    let hideTimer = null;
    let showTimer = null;

    useEffect(() => {
      const clearHideTimer = () => {
        if (hideTimer) {
          window.clearTimeout(hideTimer);
          hideTimer = null;
        }
      };
      const clearShowTimer = () => {
        if (showTimer) {
          window.clearTimeout(showTimer);
          showTimer = null;
        }
      };

      const show = (card) => {
        clearShowTimer();
        clearHideTimer();
        setActiveCard(extractCardData(card));
        showTimer = window.setTimeout(() => setIsVisible(true), enterDelayMs);
      };

      const hide = () => {
        clearShowTimer();
        clearHideTimer();
        hideTimer = window.setTimeout(() => {
          setIsVisible(false);
          window.setTimeout(() => setActiveCard(null), unmountDelayMs);
        }, hideDelayMs);
      };

      const handlers = fleetCards.map((card) => {
        const onEnter = () => show(card);
        const onLeave = () => hide();
        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);
        return { card, onEnter, onLeave };
      });

      return () => {
        clearShowTimer();
        clearHideTimer();
        handlers.forEach(({ card, onEnter, onLeave }) => {
          card.removeEventListener("mouseenter", onEnter);
          card.removeEventListener("mouseleave", onLeave);
        });
      };
    }, []);

    if (!activeCard) return null;

    return React.createElement(
      "div",
      { className: `fleet-focus-overlay ${isVisible ? "is-visible" : ""}`, "aria-hidden": "true" },
      React.createElement(
        "article",
        { className: "fleet-focus-card" },
        activeCard.imageSrc
          ? React.createElement("img", {
              className: "fleet-focus-media",
              src: activeCard.imageSrc,
              alt: activeCard.imageAlt,
            })
          : null,
        React.createElement(
          "div",
          { className: "fleet-focus-content" },
          activeCard.tag ? React.createElement("div", { className: "tag" }, activeCard.tag) : null,
          React.createElement("h3", { className: "fleet-focus-title" }, activeCard.title),
          React.createElement("p", { className: "fleet-focus-copy" }, activeCard.copy)
        )
      )
    );
  }

  if (typeof ReactDOM.createRoot === "function") {
    ReactDOM.createRoot(fleetRoot).render(React.createElement(FleetFocusOverlay));
  } else {
    ReactDOM.render(React.createElement(FleetFocusOverlay), fleetRoot);
  }
})();
