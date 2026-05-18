// Smooth Vertical Scroll Animation Script
// Enhanced version with proper shrinking and smooth transitions

const scrollContainer = document.querySelector('.scroll-container');
const sections = document.querySelectorAll('.section');
const menuNumbers = document.querySelector('.menu-numbers');

// --- Define Section Colors ---
// Using specific Hex codes for a curated look, now including RGB for shadows
// Re-indexed after removing sections 2, 3, 4
const sectionColors = {
    default: {hex: '#003f97ff', rgb: '0,63,151'}, // Welcome (0)
    1: {hex: '#3b82f6', rgb: '59,130,246'},        // Works (1) - now combines Apps, Data Science, Creative
    2: {hex: '#f59e0b', rgb: '245,158,11'},        // Interests (formerly 5)
    3: {hex: '#06b6d4', rgb: '6,182,212'},        // About (formerly 6)
    4: {hex: '#0ea5e9', rgb: '14,165,233'},        // Background (formerly 7)
    5: {hex: '#6366f1', rgb: '99,102,241'}         // Contact (formerly 8)
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
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
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
    centerThreshold: 0.35
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
        updateTreeState(activeSectionIndex); // Pass the data-index
        
        // If the active section is 'Works' (index 1), let the IntersectionObserver handle breadcrumb for sub-panels
        // Otherwise, update the breadcrumb for the main section
        if (activeSectionIndex !== 1) {
            updateBreadcrumb(activeSectionIndex);
        } else {
            // For 'Works' section, the IntersectionObserver for works-panels will update the breadcrumb
            // Default to '~/Works' if no panel is specifically active yet.
            const currentActiveWorksPanel = document.querySelector('.works-panel.active');
            if (!currentActiveWorksPanel) {
                 updateBreadcrumb(activeSectionIndex);
            }
        }
        
        // 3. Update Ambient Background Color
        const colorData = sectionColors[activeSectionIndex] || sectionColors.default;
        document.documentElement.style.setProperty('--accent-color', colorData.hex);
        document.documentElement.style.setProperty('--accent-rgb', colorData.rgb);
        
        // 4. Update Background Shapes Visibility
        updateBackgroundShapes(activeSectionIndex);
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

// Use requestAnimationFrame for ultra-smooth updates
let rafId = null;
let lastScrollTop = scrollContainer.scrollTop;

function smoothUpdate() {
    const currentScrollTop = scrollContainer.scrollTop;
    
    // Only update if scroll position changed
    if (currentScrollTop !== lastScrollTop) {
        updateSections();
        lastScrollTop = currentScrollTop;
    }
    
    rafId = requestAnimationFrame(smoothUpdate);
}

// Start smooth update loop
smoothUpdate();

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

// --- Services sections handling ---
// This now only applies to the Interests section (formerly data-index 5, now 2)
const interestsSection = document.querySelector('.section[data-index="2"].services-section');
const interestsTrack = interestsSection ? interestsSection.querySelector('.services-track') : null;
const interestsCards = interestsSection ? interestsSection.querySelectorAll('.service-card') : [];

let interestsState = {
    currentIndex: 0,
    lastIndex: 0,
    isComplete: false,
    initialized: false,
    lastScrollTime: 0,
    track: interestsTrack,
    cards: interestsCards
};

function handleServiceCardScroll(e, state) {
    if (!state.cards.length) return true; // No cards, allow vertical scroll

    // Check if the parent vertical section is active
    const parentSection = state.track.closest('.section');
    if (!parentSection || !parentSection.classList.contains('active')) return true;

    const direction = e.deltaY > 0 ? 1 : -1;
    const now = Date.now();
    const scrollCooldown = 250; // Faster cooldown for snappier feel
    
    if (now - state.lastScrollTime < scrollCooldown) {
        e.preventDefault();
        return false;
    }
    
    if (direction > 0 && state.currentIndex < state.cards.length - 1) {
        e.preventDefault();
        state.currentIndex++;
        updateServiceCardPositions(state);
        state.lastScrollTime = now;
        state.isComplete = (state.currentIndex === state.cards.length - 1);
        return false;
    }
    
    if (direction < 0 && state.currentIndex > 0) {
        e.preventDefault();
        state.currentIndex--;
        updateServiceCardPositions(state);
        state.lastScrollTime = now;
        state.isComplete = false;
        return false;
    }
    
    // Allow vertical scroll: at start going up, or at end going down
    if ((direction < 0 && state.currentIndex === 0) || (direction > 0 && state.isComplete)) {
        state.lastScrollTime = now;
        return true;
    }
    
    e.preventDefault();
    return false;
}

function updateServiceCardPositions(state) {
    const { track, cards, currentIndex } = state;
    
    if (cards.length === 0 || !track) return;
    
    const cardWidth = cards[0].offsetWidth;
    const gap = 32; // Gap between cards (2rem)
    const containerWidth = track.parentElement.clientWidth; // Get width of services-container
    const totalCardWidth = cardWidth + gap;
    
    const centerOffset = (containerWidth - cardWidth) / 2;
    const scrollOffset = currentIndex * totalCardWidth;
    const translateX = centerOffset - scrollOffset;
    
    track.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    track.style.transform = `translateX(${translateX}px)`;
    
    cards.forEach((card, index) => {
        card.classList.remove('active', 'near-prev', 'near-next', 'prev', 'next', 'far-prev', 'far-next');
        const distance = index - currentIndex;
        card.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        if (distance === 0) {
            card.classList.add('active');
        } else if (distance === -1) {
            card.classList.add('near-prev');
        } else if (distance === 1) {
            card.classList.add('near-next');
        } else if (distance === -2) {
            card.classList.add('prev');
        } else if (distance === 2) {
            card.classList.add('next');
        } else if (distance < -2) {
            card.classList.add('far-prev');
        } else if (distance > 2) {
            card.classList.add('far-next');
        }
    });
}

// Initialize service card group - restore last position when returning
function initServiceCardGroup(state) {
    state.currentIndex = state.lastIndex;
    state.isComplete = state.currentIndex === state.cards.length - 1;
    state.initialized = true;
    updateServiceCardPositions(state);
}

// Listen for when Interests section becomes active/inactive
if (interestsSection) {
    scrollContainer.addEventListener('scroll', () => {
        const isActive = interestsSection.classList.contains('active');
        if (isActive && !interestsState.initialized) {
            initServiceCardGroup(interestsState);
        }
        if (!isActive && interestsState.initialized) {
            interestsState.lastIndex = interestsState.currentIndex;
            interestsState.initialized = false;
        }
    });

    interestsSection.addEventListener('wheel', (e) => {
        const shouldAllowVerticalScroll = handleServiceCardScroll(e, interestsState);
        if (!shouldAllowVerticalScroll) {
            e.preventDefault();
        }
    }, { passive: false });
}


// --- Works Section Horizontal Panel Logic (New) ---
const worksSection = document.querySelector('.works-section[data-index="1"]');
const worksTrack = worksSection ? worksSection.querySelector('.works-track') : null;
const worksPanels = worksSection ? worksSection.querySelectorAll('.works-panel') : [];

let activeWorksPanelId = null;

// Intersection Observer for Works Panels
const worksPanelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.75) { // Panel mostly in view
            const panelId = entry.target.id;
            const panelLabel = entry.target.dataset.label;
            
            if (activeWorksPanelId !== panelId) {
                activeWorksPanelId = panelId;
                updateTreeState(1, activeWorksPanelId); // Update menu for Works (index 1) and its panel
                updateBreadcrumb(1, activeWorksPanelId); // Update breadcrumb
                updateWorksPanelState(activeWorksPanelId); // Update internal card states for the newly active panel
            }
        }
    });
}, {
    root: worksTrack,
    rootMargin: '0px',
    threshold: 0.75 // Trigger when 75% of the panel is visible
});

// Initialize observer for each works panel
worksPanels.forEach(panel => {
    worksPanelObserver.observe(panel);
});

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
            if (state && !state.initialized) {
                initServiceCardGroup(state);
            }
        } else {
            panel.classList.remove('active');
            // When leaving a panel, save its state
            const state = worksPanelServiceStates[panelId];
            if (state && state.initialized) {
                state.lastIndex = state.currentIndex;
                state.initialized = false;
            }
        }
    });
}

// Add wheel event listener for inner service cards within works panels
if (worksSection) {
    worksPanels.forEach(panel => {
        panel.addEventListener('wheel', (e) => {
            if (panel.classList.contains('active')) {
                const panelId = panel.id;
                const state = worksPanelServiceStates[panelId];
                if (state) {
                    const shouldAllowVerticalScroll = handleServiceCardScroll(e, state);
                    if (!shouldAllowVerticalScroll) {
                        e.preventDefault();
                    }
                }
            }
        }, { passive: false });
    });
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
    if (!timelineSection.classList.contains('active')) return;
    
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

// Add wheel event listener to timeline section
if (timelineSection) {
    timelineSection.addEventListener('wheel', (e) => {
        const shouldAllowVerticalScroll = handleTimelineScroll(e);
        if (!shouldAllowVerticalScroll) {
            e.preventDefault();
        }
    }, { passive: false });
}

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

// Spring easing function for smooth, appealing animations
function easeSpring(t) {
    // Cubic bezier approximation: cubic-bezier(0.34, 1.56, 0.64, 1)
    // Creates smooth spring-like overshoot effect
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return t === 0 ? 0 : t === 1 ? 1 : c3 * t * t * t - c1 * t * t;
}

// Animate scroll snap with spring easing
function animateScrollSnap(fromY, toY, duration) {
    const startTime = Date.now();
    
    function animateFrame() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Apply spring easing for smooth snap
        const easeProgress = easeSpring(progress);
        const currentY = fromY + (toY - fromY) * easeProgress;
        
        scrollContainer.scrollTop = currentY;
        
        if (progress < 1) {
            requestAnimationFrame(animateFrame);
        }
    }
    
    requestAnimationFrame(animateFrame);
}

// Smooth snap to nearest section when scrolling stops
let scrollTimeout;
let isScrolling = false;

scrollContainer.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        snapToNearestSection();
    }, 150);  // Reduced delay for snappier feel

    // Update scroll progress bar
    const pct = scrollContainer.scrollTop / (scrollContainer.scrollHeight - scrollContainer.clientHeight);
    document.querySelector('.progress-bar').style.width = `${pct * 100}%`;
});

function snapToNearestSection() {
    const containerHeight = scrollContainer.clientHeight;
    const scrollTop = scrollContainer.scrollTop;
    const viewportCenter = scrollTop + (containerHeight / 2);
    
    let closestSection = null;
    let closestDistance = Infinity;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionCenter = sectionTop + (sectionHeight / 2);
        const distance = Math.abs(viewportCenter - sectionCenter);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section;
        }
    });
    
    // Only snap if not already very close to center (reduced threshold for smoother feel)
    if (closestSection && closestDistance > containerHeight * 0.05) {
        // Use spring easing for more appealing snap animation
        const targetScrollTop = closestSection.offsetTop + (closestSection.offsetHeight / 2) - (containerHeight / 2);
        animateScrollSnap(scrollTop, targetScrollTop, 500);
    }
}

// Optional: Mouse wheel smoothing
let wheelTimeout;
scrollContainer.addEventListener('wheel', (e) => {
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
        if (!isScrolling) {
            snapToNearestSection();
        }
    }, 250);
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
