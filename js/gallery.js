/* ── Cursor ── */
(function setupCursor() {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, ticking = false;

    document.addEventListener("mousemove", e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = `${mouseX}px`;
        dot.style.top  = `${mouseY}px`;
        if (!ticking) { ticking = true; requestAnimationFrame(animateRing); }
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = `${ringX}px`;
        ring.style.top  = `${ringY}px`;
        if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
            requestAnimationFrame(animateRing);
        } else {
            ticking = false;
        }
    }

    document.addEventListener("mouseover", e => {
        const hoverable = e.target.closest("a, button, .gallery-tile, .shelf-item");
        document.body.classList.toggle("cursor-hover", Boolean(hoverable));
    });
})();

/* ── Lightbox ── */
const lightbox      = document.getElementById("galleryLightbox");
const lightboxInner = document.getElementById("lightboxInner");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(src, type) {
    lightboxInner.replaceChildren();
    let el;
    if (type === "video") {
        el = document.createElement("video");
        el.src = src;
        el.autoplay = true;
        el.muted = true;
        el.loop = true;
        el.setAttribute("playsinline", "");
        el.controls = true;
    } else {
        el = document.createElement("img");
        el.src = src;
        el.alt = "";
    }
    lightboxInner.appendChild(el);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lightboxInner.replaceChildren();
}

document.querySelectorAll(".gallery-tile").forEach(tile => {
    tile.addEventListener("click", () => openLightbox(tile.dataset.src, tile.dataset.type));
});

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener("keydown", e => {
    if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
});
