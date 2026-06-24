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

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    if (!prefersReducedMotion) {
        domainBgLayers.forEach(layer => {
            layer.style.transform = `translateX(${currentX * 0.35}px)`;
        });

        domainIllusLayers.forEach(layer => {
            layer.style.transform = `translateX(${currentX * 0.35}px) translateY(${mouseDriftY}px)`;
        });
    }

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

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let ticking = false;

    document.addEventListener("mousemove", event => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(animateRing);
        }

        const imgEl = event.target.closest(".project-image");
        if (imgEl) {
            const rect = imgEl.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            imgEl.style.setProperty("--lens-x", `${x}px`);
            imgEl.style.setProperty("--lens-y", `${y}px`);
            imgEl.style.setProperty("--lens-r", "70px");
        }
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
            requestAnimationFrame(animateRing);
        } else {
            ticking = false;
        }
    }

    document.addEventListener("mouseover", event => {
        const projectImg = event.target.closest(".project-image");
        const hoverable = event.target.closest("a, button, .shelf-item, .project-card");
        document.body.classList.toggle("cursor-hover", Boolean(hoverable) && !projectImg);
        document.body.classList.toggle("cursor-lens", Boolean(projectImg));
    });

    document.addEventListener("mouseout", event => {
        const imgEl = event.target.closest(".project-image");
        if (imgEl && !imgEl.contains(event.relatedTarget)) {
            imgEl.style.setProperty("--lens-r", "0px");
            document.body.classList.remove("cursor-lens");
        }
    });
}

function setupDomainHint() {
    if (!domainsWrapper || !domainsTrack || prefersReducedMotion) return;

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
    if (!domainsSection || prefersReducedMotion) return;

    domainsSection.addEventListener("mousemove", event => {
        const cy = window.innerHeight / 2;
        mouseDriftY = ((event.clientY - cy) / cy) * 8;
        updateDomainsScroll();
    });
}

function setupWorkDetail() {
    const overlay = document.getElementById("workOverlay");
    const backBtn = document.getElementById("workBack");
    if (!overlay || !backBtn) return;

    function getCardImage(slug) {
        const card = document.querySelector(`.project-card[data-work="${slug}"]`);
        return card ? card.querySelector(".project-image") : null;
    }

    function getDetailHero(slug) {
        const detail = document.getElementById(`work-${slug}`);
        return detail ? detail.querySelector(".work-detail-hero") : null;
    }

    let activeIntro = null;

    function cancelIntro() {
        if (activeIntro) {
            activeIntro.cancel();
            activeIntro = null;
        }
    }

    function restoreDetail(article) {
        const hook = article.querySelector(".work-detail-hook");
        const title = article.querySelector(".work-detail-title");
        if (hook && hook.dataset.full) { hook.textContent = hook.dataset.full; hook.classList.remove("is-typing"); }
        if (title && title.dataset.full) { title.textContent = title.dataset.full; title.classList.remove("is-typing"); }
        article.classList.remove("playing-intro", "intro-done");
    }

    function playIntro(slug) {
        if (prefersReducedMotion) return;
        const article = document.getElementById(`work-${slug}`);
        if (!article) return;
        const hook = article.querySelector(".work-detail-hook");
        const title = article.querySelector(".work-detail-title");
        if (!hook || !title) return;

        if (!hook.dataset.full) hook.dataset.full = hook.textContent;
        if (!title.dataset.full) title.dataset.full = title.textContent;

        let cancelled = false;
        const timers = [];

        function cancel() {
            cancelled = true;
            timers.forEach(clearTimeout);
            timers.length = 0;
        }

        activeIntro = { cancel };
        article.classList.add("playing-intro");
        article.classList.remove("intro-done");

        function typeText(el, fullText, speed) {
            return new Promise(resolve => {
                el.textContent = "";
                el.classList.add("is-typing");
                let i = 0;
                function step() {
                    if (cancelled) { el.classList.remove("is-typing"); resolve(); return; }
                    if (i >= fullText.length) { el.classList.remove("is-typing"); resolve(); return; }
                    el.textContent = fullText.slice(0, ++i);
                    timers.push(setTimeout(step, speed));
                }
                timers.push(setTimeout(step, speed));
            });
        }

        typeText(hook, hook.dataset.full, 22)
            .then(() => cancelled ? null : typeText(title, title.dataset.full, 30))
            .then(() => {
                if (cancelled) return;
                activeIntro = null;
                article.classList.add("intro-done");
            });
    }

    function fadeSurroundings(heroImg) {
        const faded = [];
        let node = heroImg;
        while (node !== pageWrapper) {
            const parent = node.parentElement;
            if (!parent) break;
            Array.from(parent.children).forEach(child => {
                if (child !== node) {
                    child.classList.add("zoom-faded");
                    faded.push(child);
                }
            });
            node = parent;
        }
        return faded;
    }

    function clearFaded(faded) {
        faded.forEach(el => el.classList.remove("zoom-faded"));
        pageWrapper.classList.remove("zoom-fade", "zoom-fade-instant");
    }

    function openDetail(slug) {
        document.querySelectorAll(".work-detail").forEach(el => { el.hidden = true; });
        const target = document.getElementById(`work-${slug}`);
        if (target) target.hidden = false;
        overlay.dataset.work = slug;
        overlay.classList.add("open");
        overlay.setAttribute("aria-hidden", "false");
        overlay.scrollTop = 0;
        document.body.style.overflow = "hidden";
    }

    function closeDetail() {
        cancelIntro();
        document.querySelectorAll(".work-detail").forEach(el => restoreDetail(el));
        overlay.classList.remove("open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        document.querySelectorAll(".work-detail").forEach(el => { el.hidden = true; });
        delete overlay.dataset.work;
    }

    function triggerOpen(slug) {
        const cardImg = getCardImage(slug);
        const hero = getDetailHero(slug);

        if (prefersReducedMotion || !cardImg || !hero) {
            openDetail(slug);
            return;
        }

        // Capture FROM: card image in the grid (viewport coords)
        const fromRect = cardImg.getBoundingClientRect();

        // Capture TO: briefly show overlay for measurement (synchronous — no paint)
        const article = document.getElementById(`work-${slug}`);
        article.hidden = false;
        overlay.classList.add("open");
        const toRect = hero.getBoundingClientRect();
        overlay.classList.remove("open");
        article.hidden = true;

        // FLIP math (transform-origin: 0 0)
        const scale = toRect.width / fromRect.width;
        const tx = toRect.left - fromRect.left * scale;
        const ty = toRect.top - fromRect.top * scale;

        // Fade surroundings; keep hero's ancestor chain untouched
        const faded = fadeSurroundings(cardImg);
        pageWrapper.classList.add("zoom-fade");

        // Set initial (identity) state and kick off zoom-in
        pageWrapper.style.transformOrigin = "0 0";
        pageWrapper.style.transform = "none";
        pageWrapper.classList.add("zooming");
        pageWrapper.offsetHeight; // force reflow — commits fade + initial transform

        pageWrapper.style.transition = "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)";
        pageWrapper.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;

        pageWrapper.addEventListener("transitionend", function onEnd() {
            // Cut: overlay appears instantly (opaque background covers pageWrapper)
            openDetail(slug);
            // Reset + clear fade classes behind the opaque overlay — no flash
            clearFaded(faded);
            pageWrapper.style.transition = "";
            pageWrapper.style.transform = "";
            pageWrapper.style.transformOrigin = "";
            pageWrapper.classList.remove("zooming");
            // Kick off typewriter + cascade reveal
            playIntro(slug);
        }, { once: true });
    }

    function triggerClose() {
        const slug = overlay.dataset.work;
        const cardImg = slug ? getCardImage(slug) : null;
        const hero = slug ? getDetailHero(slug) : null;

        if (prefersReducedMotion || !cardImg || !hero) {
            closeDetail();
            return;
        }

        // Rects while overlay is visible
        const heroRect = hero.getBoundingClientRect();
        const cardRect = cardImg.getBoundingClientRect();

        // Same transform that maps the card onto the hero position
        const scale = heroRect.width / cardRect.width;
        const tx = heroRect.left - cardRect.left * scale;
        const ty = heroRect.top - cardRect.top * scale;

        // Instantly hide surroundings (behind the still-visible overlay — no flash)
        const faded = fadeSurroundings(cardImg);
        pageWrapper.classList.add("zoom-fade", "zoom-fade-instant");

        // Pre-position pageWrapper instantly so card sits where hero is
        pageWrapper.style.transformOrigin = "0 0";
        pageWrapper.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        pageWrapper.classList.add("zooming");
        pageWrapper.offsetHeight; // force reflow

        // Cut: hide overlay instantly → zoomed card is now at hero position
        closeDetail();

        // Zoom out to natural grid; fade surroundings back in simultaneously
        requestAnimationFrame(() => {
            pageWrapper.classList.remove("zoom-fade-instant"); // restore transition on .zoom-faded
            pageWrapper.offsetHeight; // commit: elements now have transition but opacity still 0
            pageWrapper.classList.remove("zoom-fade"); // opacity goes 0→1, fade-in fires
            pageWrapper.style.transition = "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)";
            pageWrapper.style.transform = "none";

            pageWrapper.addEventListener("transitionend", function onEnd() {
                pageWrapper.style.transition = "";
                pageWrapper.style.transformOrigin = "";
                pageWrapper.classList.remove("zooming");
                clearFaded(faded);
            }, { once: true });
        });
    }

    document.querySelectorAll(".project-card[data-work]").forEach(card => {
        card.addEventListener("click", () => {
            const slug = card.dataset.work;
            history.pushState({ work: slug }, "", `?work=${slug}`);
            triggerOpen(slug);
        });

        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                card.click();
            }
        });

        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `Open ${card.querySelector(".project-title").textContent.trim()} detail`);
    });

    backBtn.addEventListener("click", () => {
        history.pushState(null, "", location.pathname);
        triggerClose();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && overlay.classList.contains("open")) {
            history.pushState(null, "", location.pathname);
            triggerClose();
        }
    });

    window.addEventListener("popstate", event => {
        if (event.state && event.state.work) {
            triggerOpen(event.state.work);
        } else if (overlay.classList.contains("open")) {
            triggerClose();
        }
    });

    const params = new URLSearchParams(location.search);
    const initialWork = params.get("work");
    if (initialWork && document.getElementById(`work-${initialWork}`)) {
        openDetail(initialWork);
    }
}

function setupScrollReveal() {
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, { root: pageWrapper, threshold: 0.12 });

    document.querySelectorAll(".project-card, .shelf, .find-content, .section-eyebrow").forEach(el => {
        observer.observe(el);
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

function applyVideoRatios() {
    document.querySelectorAll(".project-image video, .work-detail-hero video").forEach(video => {
        function setRatio() {
            if (!video.videoWidth) return;
            const container = video.closest(".project-image, .work-detail-hero");
            if (container) container.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
        }
        if (video.readyState >= 1) {
            setRatio();
        } else {
            video.addEventListener("loadedmetadata", setRatio, { once: true });
        }
    });
}

function setupScrollSave() {
    document.querySelectorAll('a[href$="gallery.html"]').forEach(link => {
        link.addEventListener("click", () => {
            if (pageWrapper) sessionStorage.setItem("portfolioScroll", pageWrapper.scrollTop);
        });
    });
}

function restoreScroll() {
    const saved = sessionStorage.getItem("portfolioScroll");
    if (!saved || !pageWrapper) return;
    sessionStorage.removeItem("portfolioScroll");
    pageWrapper.scrollTop = parseFloat(saved);
    updateDomainsScroll();
    updateActiveSectionState();
    updateDotProgress();
}

function init() {
    setupDotNavigation();
    setupCursor();
    setupDomainHint();
    setupDomainParallax();
    setupWorkDetail();
    setupScrollReveal();
    setupScrollSync();
    setupResizeHandling();
    setupScrollSave();
    applyVideoRatios();

    restoreScroll();
    updateDomainsScroll();
    updateActiveSectionState();
    updateDotProgress();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
