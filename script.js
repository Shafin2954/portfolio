const pageWrapper = document.getElementById("pageWrapper");
const sections = Array.from(document.querySelectorAll(".section"));
const dots = Array.from(document.querySelectorAll(".dot-nav .dot"));

const domainsSection = document.getElementById("domains");
const domainsTrack = document.getElementById("domainsTrack");
const domainPanels = domainsTrack ? Array.from(domainsTrack.querySelectorAll(".domain-panel")) : [];
const domainBgLayers = domainsTrack ? Array.from(domainsTrack.querySelectorAll(".domain-bg")) : [];
const domainIllusLayers = domainsTrack ? Array.from(domainsTrack.querySelectorAll(".domain-illus")) : [];

const indexScrollHint = document.getElementById("indexScrollHint");

const gateState = {
    currentIndex: 0,
    lastIndex: 0,
    isComplete: false,
    initialized: false,
    lastScrollTime: 0,
    track: domainsTrack,
    cards: domainPanels
};

const scrollCooldown = 250;
let mouseDriftY = 0;
let touchStartY = null;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function updateDotState(activeId) {
    dots.forEach(dot => {
        const isActive = dot.getAttribute("href") === `#${activeId}`;
        dot.classList.toggle("active", isActive);
    });
}

function updateDomainPanelPositions(state) {
    if (!state.track || !state.cards.length) return;

    const maxIndex = state.cards.length - 1;
    state.currentIndex = clamp(state.currentIndex, 0, maxIndex);
    state.isComplete = state.currentIndex === maxIndex;

    const viewportWidth = window.innerWidth;
    const scrollOffset = state.currentIndex * viewportWidth;
    state.track.style.transform = `translateX(-${scrollOffset}px)`;

    state.cards.forEach((panel, index) => {
        panel.classList.toggle("active", index === state.currentIndex);
    });

    domainBgLayers.forEach((layer, index) => {
        const relativeOffset = (index - state.currentIndex) * viewportWidth;
        layer.style.transform = `translateX(${relativeOffset * 0.35}px)`;
    });

    domainIllusLayers.forEach((layer, index) => {
        const relativeOffset = (index - state.currentIndex) * viewportWidth;
        layer.style.transform = `translateX(${relativeOffset * 0.65}px) translateY(${mouseDriftY}px)`;
    });
}

function isSectionCentered(section, band = 0.18) {
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportCenter = viewportHeight / 2;
    const sectionCenter = rect.top + (rect.height / 2);
    const centerBand = viewportHeight * band;

    return Math.abs(sectionCenter - viewportCenter) <= centerBand;
}

function initializeGateIfNeeded() {
    if (!domainsSection || !isSectionCentered(domainsSection)) {
        if (gateState.initialized) {
            gateState.lastIndex = gateState.currentIndex;
            gateState.initialized = false;
        }
        return;
    }

    if (!gateState.initialized) {
        gateState.currentIndex = gateState.lastIndex;
        gateState.initialized = true;
        updateDomainPanelPositions(gateState);
    }
}

function applyGateDirection(direction) {
    const now = Date.now();
    const maxIndex = gateState.cards.length - 1;

    if (now - gateState.lastScrollTime < scrollCooldown) {
        return false;
    }

    if (direction > 0 && gateState.currentIndex < maxIndex) {
        gateState.currentIndex += 1;
        gateState.isComplete = gateState.currentIndex === maxIndex;
        gateState.lastScrollTime = now;
        updateDomainPanelPositions(gateState);
        return false;
    }

    if (direction < 0 && gateState.currentIndex > 0) {
        gateState.currentIndex -= 1;
        gateState.isComplete = false;
        gateState.lastScrollTime = now;
        updateDomainPanelPositions(gateState);
        return false;
    }

    if ((direction < 0 && gateState.currentIndex === 0) || (direction > 0 && gateState.isComplete)) {
        gateState.lastScrollTime = now;
        return true;
    }

    return false;
}

function hideScrollHint() {
    if (indexScrollHint) {
        indexScrollHint.classList.add("faded");
    }
}

function setupSectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                updateDotState(entry.target.id);
            }
        });
    }, {
        root: pageWrapper,
        threshold: 0.6
    });

    sections.forEach(section => observer.observe(section));
}

function setupDotNavigation() {
    dots.forEach(dot => {
        dot.addEventListener("click", (event) => {
            event.preventDefault();
            const selector = dot.getAttribute("href");
            if (!selector) return;
            const target = document.querySelector(selector);
            if (!target) return;
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function setupCursor() {
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorRing = document.querySelector(".cursor-ring");
    if (!cursorDot || !cursorRing) return;

    document.addEventListener("mousemove", (event) => {
        cursorDot.style.left = `${event.clientX}px`;
        cursorDot.style.top = `${event.clientY}px`;
        cursorRing.style.left = `${event.clientX}px`;
        cursorRing.style.top = `${event.clientY}px`;
    });

    document.addEventListener("mouseover", (event) => {
        const hoverable = event.target.closest("a, button, .shelf-item, .project-card");
        document.body.classList.toggle("cursor-hover", Boolean(hoverable));
    });
}

function setupHorizontalGating() {
    if (!pageWrapper || !domainsSection || !domainsTrack || !domainPanels.length) return;

    pageWrapper.addEventListener("wheel", (event) => {
        initializeGateIfNeeded();
        hideScrollHint();

        if (!isSectionCentered(domainsSection)) return;

        const direction = event.deltaY > 0 ? 1 : -1;
        const allowVertical = applyGateDirection(direction);
        if (!allowVertical) {
            event.preventDefault();
        }
    }, { passive: false });

    pageWrapper.addEventListener("touchstart", (event) => {
        if (event.touches.length === 0) return;
        touchStartY = event.touches[0].clientY;
    }, { passive: true });

    pageWrapper.addEventListener("touchmove", (event) => {
        if (touchStartY === null || event.touches.length === 0) return;
        initializeGateIfNeeded();
        if (!isSectionCentered(domainsSection)) return;

        const currentY = event.touches[0].clientY;
        const delta = touchStartY - currentY;
        if (Math.abs(delta) < 8) return;

        const direction = delta > 0 ? 1 : -1;
        const allowVertical = applyGateDirection(direction);
        if (!allowVertical) {
            event.preventDefault();
            touchStartY = currentY;
        }
    }, { passive: false });

    pageWrapper.addEventListener("touchend", () => {
        touchStartY = null;
    });

    window.addEventListener("keydown", (event) => {
        if (!isSectionCentered(domainsSection)) return;
        if (event.key !== "ArrowDown" && event.key !== "PageDown" && event.key !== "ArrowUp" && event.key !== "PageUp") {
            return;
        }

        initializeGateIfNeeded();
        const direction = event.key === "ArrowDown" || event.key === "PageDown" ? 1 : -1;
        const allowVertical = applyGateDirection(direction);
        if (!allowVertical) {
            event.preventDefault();
        }
    });
}

function setupDomainParallax() {
    if (!domainsSection || !domainIllusLayers.length) return;

    domainsSection.addEventListener("mousemove", (event) => {
        const centerY = window.innerHeight / 2;
        mouseDriftY = ((event.clientY - centerY) / centerY) * 8;
        updateDomainPanelPositions(gateState);
    });
}

function playDomainEntryHint() {
    if (!domainsTrack) return;

    let hintPlayed = false;
    const hintObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || hintPlayed) return;
            hintPlayed = true;

            const currentTransform = domainsTrack.style.transform;
            domainsTrack.style.transition = "transform 0.15s ease-out";
            domainsTrack.style.transform = "translateX(-60px)";
            setTimeout(() => {
                domainsTrack.style.transition = "transform 0.3s ease-in-out";
                domainsTrack.style.transform = currentTransform || "translateX(0)";
                setTimeout(() => {
                    domainsTrack.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
                }, 300);
            }, 150);
        });
    }, {
        root: pageWrapper,
        threshold: 0.5
    });

    hintObserver.observe(domainsSection);
}

function init() {
    setupSectionObserver();
    setupDotNavigation();
    setupCursor();
    setupHorizontalGating();
    setupDomainParallax();
    playDomainEntryHint();

    if (pageWrapper) {
        pageWrapper.addEventListener("scroll", hideScrollHint, { passive: true });
    }

    updateDomainPanelPositions(gateState);
    updateDotState("index");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
