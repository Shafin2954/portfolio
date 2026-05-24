const pageWrapper = document.getElementById("pageWrapper");
const sections = Array.from(document.querySelectorAll(".section"));
const dots = Array.from(document.querySelectorAll(".dot-nav .dot"));

const domainsWrapper = document.getElementById("domainsWrapper");
const domainsSection = document.getElementById("domains");
const domainsTrack = document.getElementById("domainsTrack");
const domainPanels = domainsTrack ? Array.from(domainsTrack.querySelectorAll(".domain-panel")) : [];
const domainBgLayers = domainsTrack ? Array.from(domainsTrack.querySelectorAll(".domain-bg")) : [];
const domainIllusLayers = domainsTrack ? Array.from(domainsTrack.querySelectorAll(".domain-illus")) : [];

const indexScrollHint = document.getElementById("indexScrollHint");

let currentX = 0;
let mouseDriftY = 0;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function updateDotState(activeId) {
    dots.forEach(dot => {
        const isActive = dot.getAttribute("href") === `#${activeId}`;
        dot.classList.toggle("active", isActive);
    });
}

function updateDotProgress() {
    if (!pageWrapper) return;
    const maxScroll = pageWrapper.scrollHeight - pageWrapper.clientHeight;
    const progress = maxScroll <= 0 ? 0 : clamp(pageWrapper.scrollTop / maxScroll, 0, 1);
    document.documentElement.style.setProperty("--scroll-progress", progress.toString());
}

function getActiveSection() {
    if (!pageWrapper || !sections.length) return null;

    const viewportCenter = pageWrapper.scrollTop + (pageWrapper.clientHeight / 2);
    let active = null;
    let minDistance = Infinity;

    sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const center = top + (section.offsetHeight / 2);

        if (viewportCenter >= top && viewportCenter < bottom) {
            active = section;
            minDistance = 0;
            return;
        }

        const distance = Math.abs(viewportCenter - center);
        if (distance < minDistance) {
            minDistance = distance;
            active = section;
        }
    });

    return active;
}

function updateActiveSectionState() {
    const activeSection = getActiveSection();
    if (activeSection && activeSection.id) {
        updateDotState(activeSection.id);
    }
}

function updateDomainsScroll() {
    if (!domainsWrapper || !domainsTrack || !domainPanels.length) return;

    const rect = domainsWrapper.getBoundingClientRect();
    const scrollable = Math.max(1, domainsWrapper.offsetHeight - pageWrapper.clientHeight);
    const scrolled = clamp(-rect.top, 0, scrollable);
    const progress = scrolled / scrollable;

    const maxX = Math.max(0, (domainPanels.length - 1) * window.innerWidth);
    currentX = progress * maxX;
    domainsTrack.style.transform = `translateX(-${currentX}px)`;

    domainBgLayers.forEach(layer => {
        layer.style.transform = `translateX(${currentX * 0.35}px)`;
    });

    domainIllusLayers.forEach(layer => {
        layer.style.transform = `translateX(${currentX * 0.35}px) translateY(${mouseDriftY}px)`;
    });

    const activePanelIndex = Math.round(progress * (domainPanels.length - 1));
    domainPanels.forEach((panel, index) => {
        panel.classList.toggle("active", index === activePanelIndex);
    });
}

function hideScrollHint() {
    if (indexScrollHint) {
        indexScrollHint.classList.add("faded");
    }
}

function setupDotNavigation() {
    dots.forEach(dot => {
        dot.addEventListener("click", event => {
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

    document.addEventListener("mousemove", event => {
        cursorDot.style.left = `${event.clientX}px`;
        cursorDot.style.top = `${event.clientY}px`;
        cursorRing.style.left = `${event.clientX}px`;
        cursorRing.style.top = `${event.clientY}px`;
    });

    document.addEventListener("mouseover", event => {
        const hoverable = event.target.closest("a, button, .shelf-item, .project-card");
        document.body.classList.toggle("cursor-hover", Boolean(hoverable));
    });
}

function setupDomainHint() {
    if (!domainsWrapper || !domainsTrack) return;

    let hintPlayed = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || hintPlayed) return;
            hintPlayed = true;

            const startX = currentX;
            domainsTrack.style.transition = "transform 0.15s ease-out";
            domainsTrack.style.transform = `translateX(-${startX + 60}px)`;
            setTimeout(() => {
                domainsTrack.style.transition = "transform 0.3s ease-in-out";
                domainsTrack.style.transform = `translateX(-${startX}px)`;
                setTimeout(() => {
                    domainsTrack.style.transition = "";
                }, 300);
            }, 150);
        });
    }, {
        root: pageWrapper,
        threshold: 0.25
    });

    observer.observe(domainsWrapper);
}

function setupDomainParallax() {
    if (!domainsSection) return;

    domainsSection.addEventListener("mousemove", event => {
        const cy = window.innerHeight / 2;
        mouseDriftY = ((event.clientY - cy) / cy) * 8;
        updateDomainsScroll();
    });
}

function setupScrollSync() {
    if (!pageWrapper) return;

    pageWrapper.addEventListener("scroll", () => {
        hideScrollHint();
        updateActiveSectionState();
        updateDomainsScroll();
        updateDotProgress();
    }, { passive: true });
}

function setupResizeHandling() {
    window.addEventListener("resize", () => {
        updateDomainsScroll();
        updateActiveSectionState();
        updateDotProgress();
    });
}

function init() {
    setupDotNavigation();
    setupCursor();
    setupDomainHint();
    setupDomainParallax();
    setupScrollSync();
    setupResizeHandling();

    updateDomainsScroll();
    updateActiveSectionState();
    updateDotProgress();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
