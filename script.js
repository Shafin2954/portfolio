// Smooth Vertical Scroll Animation Script
// Enhanced version with proper shrinking and smooth transitions

const scrollContainer = document.querySelector('.scroll-container');
const sections = document.querySelectorAll('.section');
const menuNumbers = document.querySelector('.menu-numbers');

// --- Define Section Colors ---
// Using specific Hex codes for a curated look, now including RGB for shadows
// Re-indexed after removing sections 2, 3, 4
const sectionColors = {
    default: { hex: '#003f97ff', rgb: '0,63,151' }, // Welcome (0)
    1: { hex: '#3b82f6', rgb: '59,130,246' },        // Works (1) - now combines Apps, Data Science, Creative
    2: { hex: '#f59e0b', rgb: '245,158,11' },        // Interests (formerly 5)
    3: { hex: '#06b6d4', rgb: '6,182,212' },        // About (formerly 6)
    4: { hex: '#0ea5e9', rgb: '14,165,233' },        // Background (formerly 7)
    5: { hex: '#6366f1', rgb: '99,102,241' }         // Contact (formerly 8)
};


// --- 1. Define Tree Structure ---
// Updated with new section indexing and panel IDs
const menuTree = {
    label: '~/',
    id: 'root',
    children: [
        { label: 'README.md', sectionIndex: 0 },
        {
            label: 'Works',
            sectionIndex: 1, // This refers to the main vertical Works section
            children: [
                { label: 'Apps', sectionIndex: 1, panelId: 'apps-panel' },
                { label: 'Data_Science', sectionIndex: 1, panelId: 'data-science-panel' },
                { label: 'Creative', sectionIndex: 1, panelId: 'creative-panel' },
            ]
        },
        {
            label: 'Interests',
            sectionIndex: 2 // Formerly 5
        },
        {
            label: 'About',
            sectionIndex: 3, // Formerly 6
            children: [
                { label: 'Background', sectionIndex: 4 }, // Formerly 7
                { label: 'Contact', sectionIndex: 5 },    // Formerly 8
            ]
        }
    ]
};

// --- Breadcrumb Initialization (MUST be early before updateSections is called) ---
const breadcrumbText = document.querySelector('.path-text');
const sectionPaths = {}; // Stores paths for main vertical sections
const panelPaths = {};    // Stores paths for horizontal panels within Works

// Pre-calculate paths for every index and panel
function mapPaths(node, currentPath = '') {
    let newPath = currentPath;

    if (node.id === 'root') {
        newPath = '~';
    } else {
        const prefix = currentPath === '~' ? '/' : '/';
        newPath = currentPath + prefix + node.label;
    }

    if (node.sectionIndex !== undefined && node.sectionIndex !== -1) {
        // Store path for main vertical section
        sectionPaths[node.sectionIndex] = newPath;

        // If it's a panel, also store its path
        if (node.panelId) {
            panelPaths[node.panelId] = newPath;
        }
    }

    if (node.children) {
        node.children.forEach(child => mapPaths(child, newPath));
    }
}

// Function to update the visual header
// Can update based on main section index OR a panel ID
function updateBreadcrumb(index, panelId = null) {
    if (!breadcrumbText) return;

    let newPath = '~/';
    if (panelId && panelPaths[panelId]) {
        newPath = panelPaths[panelId];
    } else if (sectionPaths[index]) {
        newPath = sectionPaths[index];
    }

    if (breadcrumbText.textContent !== newPath) {
        breadcrumbText.classList.add('changing');
        setTimeout(() => {
            breadcrumbText.textContent = newPath;
            breadcrumbText.classList.remove('changing');
        }, 300);
    }
}

// --- 2. Generate Recursive HTML ---
menuNumbers.innerHTML = '';

// Track manually expanded folders (user clicks)
const manuallyExpandedMenus = new Set();

function createTreeDom(node, isRoot = false) {
    const li = document.createElement('li');
    li.className = isRoot ? 'tree-item root-item' : 'tree-item';

    // Create the text label
    const label = document.createElement('div');
    label.className = 'tree-label';
    label.textContent = node.label;

    // Create the children UL first so we can reference it in the click handler
    let ul = null;
    if (node.children && node.children.length > 0) {
        ul = document.createElement('ul');
        if (isRoot || (node.sectionIndex === 1 && node.label === 'Works')) ul.classList.add('expanded'); // Works expanded by default

        node.children.forEach(childNode => {
            ul.appendChild(createTreeDom(childNode));
        });
    }

    // Dataset and Events
    if (node.sectionIndex !== undefined && node.sectionIndex !== -1) {
        label.dataset.index = node.sectionIndex;
    }
    if (node.panelId) {
        label.dataset.panelId = node.panelId;
    }

    // Unified Click Handler
    label.addEventListener('click', (e) => {
        // 1. Navigation: Scroll to section (vertical) or panel (horizontal)
        if (node.sectionIndex !== undefined && node.sectionIndex !== -1) {
            const targetSection = sections[node.sectionIndex];
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // If it's a panel, also scroll horizontally to it within the Works section
                if (node.panelId) {
                    const worksSection = document.querySelector('.works-section[data-index="1"]');
                    const targetPanel = worksSection ? worksSection.querySelector(`#${node.panelId}`) : null;
                    if (targetPanel) {
                        worksSection.querySelector('.works-track').scrollTo({
                            left: targetPanel.offsetLeft,
                            behavior: 'smooth'
                        });
                        // Update active panel immediately when clicked
                        updateWorksPanelState(node.panelId);
                        updateBreadcrumb(node.sectionIndex, node.panelId);
                    }
                }
            }
        }

        // 2. Expansion: Toggle folder if it has children
        if (ul) {
            ul.classList.toggle('expanded');

            // Track manual expansion: add to set if expanding, remove if collapsing
            if (ul.classList.contains('expanded')) {
                manuallyExpandedMenus.add(ul);
            } else {
                manuallyExpandedMenus.delete(ul);
            }

            // Optional: If opening, ensure the label looks active immediately
            if (ul.classList.contains('expanded')) {
                label.classList.add('folder-active');
            }
        }
    });

    li.appendChild(label);
    if (ul) li.appendChild(ul);

    return li;
}

// Build the Root UL
const rootUl = document.createElement('ul');
rootUl.className = 'file-tree';
rootUl.appendChild(createTreeDom(menuTree, true));
menuNumbers.appendChild(rootUl);

// Initialize breadcrumb paths
mapPaths(menuTree);

// Configuration for smoother animation
const config = {
    updateInterval: 10,
    centerThreshold: 0.15
};

// --- 3. Enhanced Active State Logic ---

function updateSections() {
    const containerHeight = scrollContainer.clientHeight;
    const scrollTop = scrollContainer.scrollTop;
    const viewportCenter = scrollTop + (containerHeight / 2);

    // 1. Find the currently active section
    let activeSectionIndex = -1;
    let minDistance = Infinity;

    // Filter out parent-sections that are only containers, like the 'About' section itself
    const visibleSections = Array.from(sections).filter(s => s.offsetHeight > 0);

    visibleSections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionCenter = sectionTop + (sectionHeight / 2);

        const dist = Math.abs(viewportCenter - sectionCenter);

        // Logic for visual transformation of cards (Your existing animation logic)
        const normalizedDist = (sectionCenter - viewportCenter) / containerHeight;
        section.classList.remove('active', 'near-above', 'above', 'far-above', 'near-below', 'below', 'far-below');

        if (Math.abs(normalizedDist) < config.centerThreshold) {
            section.classList.add('active');
        } else if (normalizedDist < 0) {
            if (Math.abs(normalizedDist) < 0.5) section.classList.add('near-above');
            else if (Math.abs(normalizedDist) < 0.85) section.classList.add('above');
            else section.classList.add('far-above');
        } else {
            if (Math.abs(normalizedDist) < 0.5) section.classList.add('near-below');
            else if (Math.abs(normalizedDist) < 0.85) section.classList.add('below');
            else section.classList.add('far-below');
        }

        // Identify the single "most active" section for the menu
        // Use data-index for the comparison
        const sectionDataIndex = parseInt(section.dataset.index);
        if (dist < minDistance && dist < containerHeight * 0.6) {
            minDistance = dist;
            activeSectionIndex = sectionDataIndex; // Use the data-index here
        }
    });

    // 2. Update Menu Tree based on Active Index
    if (activeSectionIndex !== -1) {
        currentActiveSectionIndex = activeSectionIndex;
        if (activeSectionIndex === 1) {
            if (!activeWorksPanelId) {
                syncActiveWorksPanelFromTrack();
            }

            if (activeWorksPanelId) {
                updateTreeState(activeSectionIndex, activeWorksPanelId);
                updateBreadcrumb(activeSectionIndex, activeWorksPanelId);
            } else {
                updateTreeState(activeSectionIndex);
                updateBreadcrumb(activeSectionIndex);
            }
        } else {
            if (activeWorksPanelId !== null) {
                activeWorksPanelId = null;
                updateWorksPanelState(null);
            }
            updateTreeState(activeSectionIndex);
            updateBreadcrumb(activeSectionIndex);
        }

        // 3. Update Ambient Background Color
        const colorData = sectionColors[activeSectionIndex] || sectionColors.default;
        document.documentElement.style.setProperty('--accent-color', colorData.hex);
        document.documentElement.style.setProperty('--accent-rgb', colorData.rgb);

        // 4. Update Background Shapes Visibility (only on section change to keep transitions smooth)
        if (activeSectionIndex !== lastActiveSectionIndex) {
            lastActiveSectionIndex = activeSectionIndex;
            updateBackgroundShapes(activeSectionIndex);
        }

        updateBackgroundMotion(activeSectionIndex);
    }
}

// Function to update which shape group is visible
function updateBackgroundShapes(activeSectionIndex) {
    const shapeGroups = document.querySelectorAll('.shape-group');
    shapeGroups.forEach(group => {
        const groupSection = parseInt(group.getAttribute('data-section'));
        if (groupSection === activeSectionIndex) {
            group.classList.add('active');
        } else {
            group.classList.remove('active');
        }
    });
}

function getHorizontalScrollOffset(activeIndex) {
    if (activeIndex === 1 && worksTrack) return worksTrack.scrollLeft;
    if (activeIndex === 2 && interestsTrackHorizontal) return interestsTrackHorizontal.scrollLeft;
    return 0;
}

function updateBackgroundMotion(activeIndex = currentActiveSectionIndex) {
    const shapeGroups = document.querySelectorAll('.shape-group');
    const verticalOffset = -scrollContainer.scrollTop * 0.25;
    const horizontalOffset = -getHorizontalScrollOffset(activeIndex) * 0.35;

    shapeGroups.forEach(group => {
        const groupSection = parseInt(group.getAttribute('data-section'));
        const xOffset = groupSection === activeIndex ? horizontalOffset : 0;
        const yOffset = groupSection === activeIndex ? verticalOffset : 0;
        group.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
    });
}

function isSectionCentered(section, band = 0.15) {
    if (!section) return false;

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const centerBand = viewportHeight * band;
    const viewportCenter = viewportHeight / 2;
    const sectionCenter = rect.top + (rect.height / 2);

    return section.classList.contains('active') && Math.abs(sectionCenter - viewportCenter) <= centerBand;
}

function updateTreeState(activeIndex, activePanelId = null) {
    // 1. Reset all text highlighting (active state)
    document.querySelectorAll('.tree-label').forEach(el => {
        el.classList.remove('active', 'folder-active');
    });

    // 2. Collapse all auto-expanded ULs (keep only manually expanded ones)
    const pathToActive = new Set(); // Store ULs that are in the path to the active section/panel

    // Find the active label (either main section or specific panel)
    let activeLabelElement = null;
    if (activePanelId) {
        activeLabelElement = document.querySelector(`.tree-label[data-panel-id="${activePanelId}"]`);
    } else {
        activeLabelElement = document.querySelector(`.tree-label[data-index="${activeIndex}"]:not([data-panel-id])`);
    }

    if (activeLabelElement) {
        // Build the path to the active element
        let parentUl = activeLabelElement.parentElement.parentElement; // li -> ul
        while (parentUl && parentUl.classList.contains('file-tree') === false) {
            pathToActive.add(parentUl);
            parentUl = parentUl.parentElement.parentElement;
        }
    }

    // Now collapse all ULs that are NOT manually expanded AND NOT in the path
    document.querySelectorAll('.file-tree ul').forEach(el => {
        if (!el.parentElement.classList.contains('root-item')) { // Keep root expanded
            const isManual = manuallyExpandedMenus.has(el);
            const isInPath = pathToActive.has(el);

            if (!isManual && !isInPath) {
                // Auto-expanded and not in current path → collapse it
                el.classList.remove('expanded');
            } else if (isInPath) {
                // In the path to active section/panel → ensure it's expanded
                el.classList.add('expanded');
            }
            // If isManual=true, keep its current state (do nothing)
        }
    });

    // 3. Highlight the active element and its path
    if (activeLabelElement) {
        // Highlight the file/panel label itself
        activeLabelElement.classList.add('active');

        // Traverse up to highlight parent folder labels
        let parentUl = activeLabelElement.parentElement.parentElement; // li -> ul
        while (parentUl && parentUl.classList.contains('file-tree') === false) {
            // Highlight the parent folder label
            const parentLabel = parentUl.previousElementSibling; // ul -> label
            if (parentLabel && parentLabel.classList.contains('tree-label')) {
                parentLabel.classList.add('folder-active');
            }

            // Go up to next level
            parentUl = parentUl.parentElement.parentElement;
        }
    }
}

// Track which section's background is currently shown, to avoid re-triggering transitions every frame
let lastActiveSectionIndex = -1;
let activeWorksPanelId = null;
let currentActiveSectionIndex = 0;

// Initial update
updateSections();

// Initialize background shapes on page load
updateBackgroundShapes(0);

// Cursor Spotlight effect
document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
    document.documentElement.style.setProperty('--my', `${e.clientY}px`);
});

// Update on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateSections, 100);
});

// --- Works Section Horizontal Panel Logic (New) ---
const worksSection = document.querySelector('.works-section[data-index="1"]');
const worksTrack = worksSection ? worksSection.querySelector('.works-track') : null;
const worksPanels = worksSection ? worksSection.querySelectorAll('.works-panel') : [];

const worksPanelDecorations = {
    'apps-panel': [
        { top: '14%', left: '6%', width: '170px', rotate: '-18deg', speed: '0.08', opacity: '0.24' },
        { top: '22%', left: '78%', width: '120px', rotate: '24deg', speed: '-0.05', opacity: '0.18' },
        { top: '78%', left: '12%', width: '96px', rotate: '42deg', speed: '0.12', opacity: '0.16' }
    ],
    'data-science-panel': [
        { top: '10%', left: '14%', width: '150px', rotate: '16deg', speed: '0.07', opacity: '0.22' },
        { top: '68%', left: '74%', width: '140px', rotate: '-28deg', speed: '-0.06', opacity: '0.2' },
        { top: '36%', left: '86%', width: '86px', rotate: '52deg', speed: '0.11', opacity: '0.14' }
    ],
    'creative-panel': [
        { top: '18%', left: '10%', width: '140px', rotate: '-36deg', speed: '0.06', opacity: '0.2' },
        { top: '72%', left: '68%', width: '160px', rotate: '18deg', speed: '-0.04', opacity: '0.18' },
        { top: '44%', left: '84%', width: '92px', rotate: '-54deg', speed: '0.1', opacity: '0.15' }
    ]
};

function setupWorksVectorLayers() {
    if (!worksPanels.length) return;

    worksPanels.forEach(panel => {
        if (panel.querySelector('.works-vector-layer')) return;

        const layer = document.createElement('div');
        layer.className = 'works-vector-layer';
        layer.setAttribute('aria-hidden', 'true');

        const decorations = worksPanelDecorations[panel.id] || [];
        decorations.forEach(spec => {
            const vector = document.createElement('span');
            vector.className = 'works-vector';
            vector.style.setProperty('--vector-top', spec.top);
            vector.style.setProperty('--vector-left', spec.left);
            vector.style.setProperty('--vector-width', spec.width);
            vector.style.setProperty('--vector-rotate', spec.rotate);
            vector.style.setProperty('--vector-speed', spec.speed);
            vector.style.setProperty('--vector-opacity', spec.opacity);
            layer.appendChild(vector);
        });

        panel.prepend(layer);
    });
}

setupWorksVectorLayers();

function updateWorksPanEffects() {
    if (!worksTrack) return;

    worksTrack.style.setProperty('--pan-scroll', `${worksTrack.scrollLeft}px`);
}

function panHorizontalSection(section, track, delta) {
    if (!section || !track) return false;

    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    if (maxScrollLeft <= 0) return false;

    const atStart = track.scrollLeft <= 0;
    const atEnd = track.scrollLeft >= maxScrollLeft - 1;

    if ((delta < 0 && atStart) || (delta > 0 && atEnd)) {
        return false;
    }

    const nextScrollLeft = Math.max(0, Math.min(maxScrollLeft, track.scrollLeft + (delta * 0.9)));
    track.scrollLeft = nextScrollLeft;

    if (track === worksTrack) {
        updateWorksPanEffects();
    }

    return true;
}

function getHorizontalPanels(track) {
    if (!track) return [];

    return Array.from(track.children).filter(child => {
        return child.classList && (child.classList.contains('works-panel') || child.classList.contains('interests-panel'));
    });
}

function getActiveHorizontalPanelIndex(track, panels) {
    if (!track || !panels.length) return -1;

    const viewportCenter = track.scrollLeft + (track.clientWidth / 2);
    let activeIndex = 0;
    let minDistance = Infinity;

    panels.forEach((panel, index) => {
        const panelCenter = panel.offsetLeft + (panel.offsetWidth / 2);
        const distance = Math.abs(panelCenter - viewportCenter);
        if (distance < minDistance) {
            minDistance = distance;
            activeIndex = index;
        }
    });

    return activeIndex;
}

function scrollToAdjacentVisibleSection(currentSection, direction) {
    if (!currentSection || direction === 0) return false;

    const visibleSections = Array.from(sections)
        .filter(section => section.offsetHeight > 0)
        .sort((a, b) => a.offsetTop - b.offsetTop);
    const currentIndex = visibleSections.indexOf(currentSection);
    if (currentIndex === -1) return false;

    const targetSection = visibleSections[currentIndex + direction];
    if (!targetSection) return false;

    unlockGate();
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
}

function snapHorizontalTrackByPanel(track, delta) {
    if (!track) return false;

    const panels = getHorizontalPanels(track);
    if (!panels.length) return false;

    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    if (maxScrollLeft <= 0) return false;

    const currentScrollLeft = track.scrollLeft;
    const tolerance = 2;
    let targetPanel = null;

    if (delta > 0) {
        targetPanel = panels.find(panel => panel.offsetLeft > currentScrollLeft + tolerance);
    } else if (delta < 0) {
        for (let index = panels.length - 1; index >= 0; index -= 1) {
            if (panels[index].offsetLeft < currentScrollLeft - tolerance) {
                targetPanel = panels[index];
                break;
            }
        }
    }

    if (!targetPanel) return false;

    track.scrollTo({
        left: Math.max(0, Math.min(maxScrollLeft, targetPanel.offsetLeft)),
        behavior: 'smooth'
    });

    if (track === worksTrack) {
        updateWorksPanEffects();
    }

    return true;
}

updateWorksPanEffects();

function syncActiveWorksPanelFromTrack() {
    if (!worksTrack || !worksPanels.length) return;

    const activePanelIndex = getActiveHorizontalPanelIndex(worksTrack, worksPanels);
    if (activePanelIndex < 0) return;

    const activePanelId = worksPanels[activePanelIndex].id;
    if (activeWorksPanelId === activePanelId) return;

    activeWorksPanelId = activePanelId;
    updateTreeState(1, activeWorksPanelId);
    updateBreadcrumb(1, activeWorksPanelId);
    updateWorksPanelState(activeWorksPanelId);
}

// Store state for each works panel's inner service cards
const worksPanelServiceStates = {};
worksPanels.forEach((panel, idx) => {
    const panelId = panel.id;
    worksPanelServiceStates[panelId] = {
        currentIndex: 0,
        lastIndex: 0,
        isComplete: false,
        initialized: false,
        lastScrollTime: 0,
        staticLayout: true,
        track: panel.querySelector('.services-track'),
        cards: panel.querySelectorAll('.service-card')
    };
});

function updateWorksPanelState(currentActivePanelId) {
    worksPanels.forEach(panel => {
        const panelId = panel.id;
        if (panelId === currentActivePanelId) {
            panel.classList.add('active');
            // Initialize inner service cards for the active panel
            const state = worksPanelServiceStates[panelId];
            if (state && !state.initialized && !state.staticLayout) {
                initServiceCardGroup(state);
            }
        } else {
            panel.classList.remove('active');
            // When leaving a panel, save its state
            const state = worksPanelServiceStates[panelId];
            if (state && state.initialized && !state.staticLayout) {
                state.lastIndex = state.currentIndex;
                state.initialized = false;
            }
        }
    });
}

if (worksSection) {
    worksTrack?.addEventListener('scroll', () => {
        updateWorksPanEffects();
        if (worksSection.classList.contains('active')) {
            syncActiveWorksPanelFromTrack();
            updateBackgroundMotion(currentActiveSectionIndex);
        }
    }, { passive: true });
}

const interestsSectionHorizontal = document.querySelector('.interests-section[data-index="2"]');
const interestsTrackHorizontal = interestsSectionHorizontal ? interestsSectionHorizontal.querySelector('.interests-track') : null;

if (interestsTrackHorizontal) {
    interestsTrackHorizontal.addEventListener('scroll', () => {
        if (interestsSectionHorizontal?.classList.contains('active')) {
            updateBackgroundMotion(currentActiveSectionIndex);
        }
    }, { passive: true });
}

const horizontalGates = [
    { id: 'works', section: worksSection, track: worksTrack },
    { id: 'interests', section: interestsSectionHorizontal, track: interestsTrackHorizontal }
].filter(gate => gate.section && gate.track);

let activeGate = null;
let gateLocked = false;
let releasedGate = null;
let releasedDirection = 0;
let lastWheelDirection = 0;

function lockGate(gate) {
    if (!gate || (gateLocked && activeGate === gate)) return;

    gateLocked = true;
    activeGate = gate;
    scrollContainer.style.overflowY = 'hidden';
}

function unlockGate() {
    if (!gateLocked) return;

    gateLocked = false;
    activeGate = null;
    scrollContainer.style.overflowY = 'scroll';
}

function clampValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function redirectHorizontal(delta) {
    if (!gateLocked || !activeGate) return false;

    const { track } = activeGate;
    const panels = getHorizontalPanels(track);
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    if (!panels.length) {
        unlockGate();
        return false;
    }

    const goingRight = delta > 0;
    const activePanelIndex = getActiveHorizontalPanelIndex(track, panels);
    const atStart = activePanelIndex === 0;
    const atEnd = activePanelIndex === panels.length - 1;

    if ((goingRight && atEnd) || (!goingRight && atStart)) {
        releasedGate = activeGate;
        releasedDirection = goingRight ? 1 : -1;
        if (goingRight && atEnd) {
            return scrollToAdjacentVisibleSection(activeGate.section, 1) ? 'handoff-forward' : false;
        }
        if (!goingRight && atStart) {
            return scrollToAdjacentVisibleSection(activeGate.section, -1) ? 'handoff-back' : false;
        }
        return false;
    }

    const moved = snapHorizontalTrackByPanel(track, delta);
    if (!moved) {
        track.scrollLeft = clampValue(track.scrollLeft + delta, 0, maxScrollLeft);
    }

    if (track === worksTrack) {
        updateWorksPanEffects();
    }

    return true;
}

if (scrollContainer && horizontalGates.length) {
    const gateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const gate = horizontalGates.find(item => item.section === entry.target);
            if (!gate) return;

            if (entry.isIntersecting && entry.intersectionRatio >= 0.95) {
                if (releasedGate === gate && releasedDirection === lastWheelDirection) {
                    return;
                }
                lockGate(gate);
                return;
            }

            if (gateLocked && activeGate === gate && entry.intersectionRatio < 0.95) {
                unlockGate();
            }

            if (releasedGate === gate && entry.intersectionRatio < 0.95) {
                releasedGate = null;
                releasedDirection = 0;
            }
        });
    }, {
        root: scrollContainer,
        threshold: 0.95
    });

    horizontalGates.forEach(gate => gateObserver.observe(gate.section));
}


// --- Timeline scroll handling ---
// Re-indexed timeline section from data-index="7" to data-index="4"
const timeline = document.querySelector('.timeline');
const timelineSection = document.querySelector('.timeline-section[data-index="4"]');
const timelineNodes = document.querySelectorAll('.timeline-node');
let currentTimelineIndex = 0;
let isTimelineComplete = false;

let timelineLastScrollTime = 0;
const timelineScrollCooldown = 300;

function handleTimelineScroll(e) {
    if (!timelineSection.classList.contains('active') || !isSectionCentered(timelineSection)) return true;

    const direction = e.deltaY > 0 ? 1 : -1;
    const now = Date.now();

    // Prevent scroll if cooldown hasn't passed
    if (now - timelineLastScrollTime < timelineScrollCooldown) return;

    // Scrolling right (next node)
    if (direction > 0 && currentTimelineIndex < timelineNodes.length - 1) {
        e.preventDefault();
        currentTimelineIndex++;
        updateTimelinePositions();
        timelineLastScrollTime = now;

        if (currentTimelineIndex === timelineNodes.length - 1) {
            isTimelineComplete = true;
        }
        return false;
    }

    // Scrolling left (previous node)
    if (direction < 0 && currentTimelineIndex > 0) {
        e.preventDefault();
        currentTimelineIndex--;
        updateTimelinePositions();
        timelineLastScrollTime = now;
        isTimelineComplete = false;
        return false;
    }

    // Allow vertical scroll: at start going up, or at end going down
    if ((direction < 0 && currentTimelineIndex === 0) ||
        (direction > 0 && isTimelineComplete)) {
        timelineLastScrollTime = now;
        return true;
    }

    // Block horizontal scroll otherwise
    e.preventDefault();
    return false;
}

function handleUnifiedWheel(e) {
    if (!scrollContainer) return;

    if (timelineSection && isSectionCentered(timelineSection)) {
        const allowVertical = handleTimelineScroll(e);
        if (!allowVertical) {
            e.preventDefault();
            return;
        }
    }

    if (!gateLocked || !activeGate) return;

    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (delta === 0) return;

    lastWheelDirection = delta > 0 ? 1 : -1;

    const moved = redirectHorizontal(delta);
    if (moved === true) {
        e.preventDefault();
    } else if (moved === 'handoff-forward' || moved === 'handoff-back') {
        e.preventDefault();
    }
}

function updateTimelinePositions() {
    // Get node width
    const nodeWidth = timelineNodes[0].offsetWidth;

    // Calculate gap from 20vw
    const gapVw = 20;
    const gap = (window.innerWidth / 100) * gapVw;
    const totalNodeWidth = nodeWidth + gap;

    // Get the timeline section's bounding rect to account for the left menu
    const timelineRect = timelineSection.getBoundingClientRect();
    const viewportCenter = timelineRect.left + timelineRect.width / 2;

    // Clamp index to valid range
    const clampedIndex = Math.max(0, Math.min(currentTimelineIndex, timelineNodes.length - 1));
    currentTimelineIndex = clampedIndex;

    // Calculate position of the focused node's center in the timeline
    const focusedNodeCenter = (clampedIndex * totalNodeWidth) + (nodeWidth / 2);

    // Calculate translateX to move focused node to viewport center
    const translateX = viewportCenter - focusedNodeCenter;

    // Apply smooth transition
    timeline.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    timeline.style.transform = `translateX(${translateX}px)`;

    // Update node states - only focused node gets scaling and circle
    timelineNodes.forEach((node, index) => {
        node.classList.remove('focus');

        if (index === clampedIndex) {
            node.classList.add('focus');
        }
    });
}

// Initialize timeline - set first node as focused
function initTimeline() {
    currentTimelineIndex = 0;
    isTimelineComplete = false;
    updateTimelinePositions();
}

// Initialize timeline immediately after DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        currentTimelineIndex = 0;
        isTimelineComplete = false;
        updateTimelinePositions();
        timelineInitialized = true;
    });
} else {
    // If script loads after DOMContentLoaded
    currentTimelineIndex = 0;
    isTimelineComplete = false;
    updateTimelinePositions();
    timelineInitialized = true;
}

if (scrollContainer) {
    document.addEventListener('wheel', handleUnifiedWheel, { passive: false });
}

let gateTouchStartY = null;

document.addEventListener('touchstart', (e) => {
    if (!gateLocked || !activeGate || e.touches.length === 0) {
        gateTouchStartY = null;
        return;
    }

    gateTouchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (!gateLocked || !activeGate || gateTouchStartY === null || e.touches.length === 0) return;

    const currentY = e.touches[0].clientY;
    const delta = gateTouchStartY - currentY;

    if (Math.abs(delta) < 2) return;

    lastWheelDirection = delta > 0 ? 1 : -1;
    const moved = redirectHorizontal(delta);
    if (moved === true) {
        e.preventDefault();
    } else if (moved === 'handoff-forward' || moved === 'handoff-back') {
        e.preventDefault();
    }

    gateTouchStartY = currentY;
}, { passive: false });

document.addEventListener('touchend', () => {
    gateTouchStartY = null;
});

// Initialize timeline when section becomes active
let timelineInitialized = false;
if (scrollContainer) { // Ensure scrollContainer exists
    scrollContainer.addEventListener('scroll', () => {
        const timelineIsActive = timelineSection && timelineSection.classList.contains('active');
        if (timelineIsActive && !timelineInitialized) {
            timelineInitialized = true;
            initTimeline();
        }
        if (!timelineIsActive) {
            timelineInitialized = false;
        }
    });
}


// Also initialize on page load in case timeline section is already in view
document.addEventListener('DOMContentLoaded', () => {
    // Initialize immediately without delay for first node to be visible
    if (timelineSection && timelineSection.classList.contains('active') && !timelineInitialized) {
        timelineInitialized = true;
        initTimeline();
    }

    // Also try after a small delay in case DOM wasn't fully ready
    setTimeout(() => {
        if (timelineSection && timelineSection.classList.contains('active') && !timelineInitialized) {
            timelineInitialized = true;
            initTimeline();
        }
    }, 50);
});

// Enhanced keyboard navigation
document.addEventListener('keydown', (e) => {
    const containerHeight = scrollContainer.clientHeight;
    const forwardKeys = ['ArrowDown', 'ArrowRight', 'PageDown', ' '];
    const backwardKeys = ['ArrowUp', 'ArrowLeft', 'PageUp'];

    if (gateLocked && activeGate) {
        const forward = forwardKeys.includes(e.key);
        const backward = backwardKeys.includes(e.key);

        if (!forward && !backward) return;
        lastWheelDirection = forward ? 1 : -1;
        const moved = redirectHorizontal(forward ? 120 : -120);
        if (moved === 'handoff-forward' || moved === 'handoff-back') {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        if (!moved) {
            scrollContainer.scrollBy({
                top: forward ? containerHeight : -containerHeight,
                behavior: 'smooth'
            });
        }
        return;
    }

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollContainer.scrollBy({
            top: containerHeight,
            behavior: 'smooth'
        });
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollContainer.scrollBy({
            top: -containerHeight,
            behavior: 'smooth'
        });
    } else if (e.key === 'Home') {
        e.preventDefault();
        scrollContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else if (e.key === 'End') {
        e.preventDefault();
        scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
});

scrollContainer.addEventListener('scroll', () => {
    updateSections();
}, { passive: true });



// Typing Animation for Hero
const titles = ['Developer', 'Engineer', 'Designer'];
let titleIndex = 0; // Using ti for titleIndex
let charIndex = 0;  // Using ci for charIndex
let deleting = false;
const typedOutputElement = document.getElementById('typed-output');

function type() {
    if (!typedOutputElement) return; // Exit if element not found

    const word = titles[titleIndex];
    typedOutputElement.textContent = deleting ? word.slice(0, charIndex--) : word.slice(0, charIndex++);

    if (!deleting && charIndex > word.length) {
        deleting = true;
        setTimeout(type, 1200); // Pause before deleting
        return;
    }
    if (deleting && charIndex < 0) {
        deleting = false;
        titleIndex = (titleIndex + 1) % titles.length; // Move to next word
        charIndex = 0;
    }
    setTimeout(type, deleting ? 60 : 100); // Typing speed
}

// Start typing animation once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    type();
});


// --- Mobile Menu Logic ---
const hamburgerBtn = document.querySelector('.hamburger-btn');
const verticalMenu = document.querySelector('.vertical-menu');

// 1. Toggle Menu
hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    verticalMenu.classList.toggle('menu-active');
    hamburgerBtn.classList.toggle('active');
});

// 2. Close menu when a file link is clicked
verticalMenu.addEventListener('click', (e) => {
    // Use .closest() to handle clicks on child elements (like text or icons)
    const label = e.target.closest('.tree-label');

    // Only proceed if a label was clicked
    if (label) {
        // Check if this is a parent folder (has a sibling <ul> with children)
        const liElement = label.parentElement;
        const hasChildren = liElement && liElement.querySelector('ul');

        // Only close menu if this is a LEAF item (no children)
        // Don't close for parent folders like Works, Interests, About
        if (!hasChildren && window.innerWidth <= 1024) {
            verticalMenu.classList.remove('menu-active');
            hamburgerBtn.classList.remove('active');
        }
    }
});

// 3. Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 && verticalMenu.classList.contains('menu-active')) {
        if (!verticalMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            verticalMenu.classList.remove('menu-active');
            hamburgerBtn.classList.remove('active');
        }
    }
});