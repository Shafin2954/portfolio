# Gate Scroll Mechanism & File Tree Design

## Overview

This system controls two key interactions:
1. **Horizontal Scroll Gating** - Locks vertical scrolling while navigating cards in Works/Interests sections
2. **File Tree Menu System** - Generates a hierarchical navigation menu synced with scroll state

---

## Part 1: Horizontal Scroll Gating

### Problem Solved

When users scroll vertically while viewing horizontal card sequences (Works, Interests), the system must decide:
- **Lock vertical scroll** → navigate to next/previous card horizontally
- **Release scroll** → allow vertical section navigation

### Solution: Direction-Based Gating

The gate uses scroll direction and card position to control behavior:

```
First Card:
  └─ Scroll Down (forward) → Next Card
  └─ Scroll Up (backward)  → Exit Up (Vertical)

Middle Cards:
  ├─ Scroll Down (forward) → Next Card
  └─ Scroll Up (backward)  → Previous Card

Last Card:
  ├─ Scroll Down (forward) → Exit Down (Vertical)
  └─ Scroll Up (backward)  → Previous Card
```

### State Structure

```javascript
const state = {
    currentIndex: 0,        // Which card (0 = first, n = last)
    lastIndex: 0,           // Previously viewed card (for restoration)
    isComplete: false,      // Flag: true when at last card
    initialized: false,     // Track if section setup is done
    lastScrollTime: 0,      // Throttle rapid scrolls (250ms cooldown)
    track: element,         // Container with cards (.services-track)
    cards: nodeList         // All card elements
};
```

### Direction Detection

```javascript
const direction = e.deltaY > 0 ? 1 : -1;
// direction = 1  → Scroll down (forward/next)
// direction = -1 → Scroll up (backward/previous)
```

### Gate Logic

**Rule 1: Forward Scroll (direction > 0)**
```javascript
if (direction > 0 && state.currentIndex < state.cards.length - 1) {
    // NOT at last card → Move to next card
    e.preventDefault();
    state.currentIndex++;
    updateServiceCardPositions(state);
    state.isComplete = (state.currentIndex === state.cards.length - 1);
    return false;  // Locked: don't scroll vertically
}
```

**Rule 2: Backward Scroll (direction < 0)**
```javascript
if (direction < 0 && state.currentIndex > 0) {
    // NOT at first card → Move to previous card
    e.preventDefault();
    state.currentIndex--;
    updateServiceCardPositions(state);
    state.isComplete = false;
    return false;  // Locked: don't scroll vertically
}
```

**Rule 3: Release Condition (At Edges)**
```javascript
if ((direction < 0 && state.currentIndex === 0) ||    // First card + scroll up
    (direction > 0 && state.isComplete)) {             // Last card + scroll down
    state.lastScrollTime = now;
    return true;  // RELEASED: Allow vertical scroll
}
```

### Cooldown Throttling

```javascript
const scrollCooldown = 250; // milliseconds

if (now - state.lastScrollTime < scrollCooldown) {
    e.preventDefault();
    return false;  // Ignore rapid scrolls
}
```

Prevents multiple card transitions from a single scroll gesture.

### Card Position Update

```javascript
function updateServiceCardPositions(state) {
    const cardWidth = cards[0].offsetWidth;
    const gap = 32;  // 2rem between cards
    const containerWidth = track.parentElement.clientWidth;
    const totalCardWidth = cardWidth + gap;
    
    // Calculate where to shift the track
    const centerOffset = (containerWidth - cardWidth) / 2;
    const scrollOffset = currentIndex * totalCardWidth;
    const translateX = centerOffset - scrollOffset;
    
    track.style.transform = `translateX(${translateX}px)`;
    
    // Update each card's active/inactive state
    cards.forEach((card, index) => {
        card.classList.remove('active', 'near-prev', 'near-next', 'prev', 'next', 'far-prev', 'far-next');
        
        const distance = index - currentIndex;
        if (distance === 0) card.classList.add('active');
        else if (distance === -1) card.classList.add('near-prev');
        else if (distance === 1) card.classList.add('near-next');
        else if (distance < -1) card.classList.add('far-prev');
        else if (distance > 1) card.classList.add('far-next');
    });
}
```

### State Persistence

When leaving a horizontal section:
```javascript
if (!isActive && state.initialized) {
    state.lastIndex = state.currentIndex;  // Save current position
    state.initialized = false;
}
```

When returning to it:
```javascript
if (isActive && !state.initialized) {
    state.currentIndex = state.lastIndex;  // Restore position
    state.initialized = true;
    updateServiceCardPositions(state);
}
```

Users see the card they were viewing, not reset to the first.

---

## Part 2: File Tree Menu System

### Data Structure

```javascript
const menuTree = {
    label: '~/',
    id: 'root',
    children: [
        { label: 'README.md', sectionIndex: 0 },
        { 
            label: 'Works', 
            sectionIndex: 1,
            children: [
                { label: 'Apps', sectionIndex: 1, panelId: 'apps-panel' },
                { label: 'Data_Science', sectionIndex: 1, panelId: 'data-science-panel' },
                { label: 'Creative', sectionIndex: 1, panelId: 'creative-panel' }
            ]
        },
        { label: 'Interests', sectionIndex: 2 },
        { 
            label: 'About', 
            sectionIndex: 3,
            children: [
                { label: 'Background', sectionIndex: 4 },
                { label: 'Contact', sectionIndex: 5 }
            ]
        }
    ]
};
```

**Key Fields:**
- `label` - Text displayed in menu
- `sectionIndex` - Which vertical section this points to (0-5)
- `panelId` - For horizontal sections, which panel within (e.g., 'apps-panel')
- `children` - Nested menu items (creates folder structure)

### Path Generation

Pre-calculate breadcrumb paths for all menu items:

```javascript
function mapPaths(node, currentPath = '') {
    let newPath = currentPath;
    
    if (node.id === 'root') {
        newPath = '~';
    } else {
        const prefix = currentPath === '~' ? '/' : '/';
        newPath = currentPath + prefix + node.label;
    }
    
    if (node.sectionIndex !== undefined) {
        sectionPaths[node.sectionIndex] = newPath;  // For main sections
        if (node.panelId) {
            panelPaths[node.panelId] = newPath;     // For horizontal panels
        }
    }
    
    if (node.children) {
        node.children.forEach(child => mapPaths(child, newPath));
    }
}
```

Results:
- `sectionPaths[1]` = `~/Works`
- `panelPaths['apps-panel']` = `~/Works/Apps`
- `sectionPaths[4]` = `~/About/Background`

### DOM Generation

Recursively build the tree DOM from menuTree:

```javascript
function createTreeDom(node, isRoot = false) {
    const li = document.createElement('li');
    const label = document.createElement('div');
    label.className = 'tree-label';
    label.textContent = node.label;
    
    // Store navigation data on the label
    if (node.sectionIndex !== undefined) {
        label.dataset.index = node.sectionIndex;
    }
    if (node.panelId) {
        label.dataset.panelId = node.panelId;
    }
    
    // Create folder structure
    let ul = null;
    if (node.children && node.children.length > 0) {
        ul = document.createElement('ul');
        if (isRoot || node.label === 'Works') {
            ul.classList.add('expanded');  // Expand by default
        }
        node.children.forEach(child => {
            ul.appendChild(createTreeDom(child));
        });
    }
    
    li.appendChild(label);
    if (ul) li.appendChild(ul);
    return li;
}
```

### Click Handler (Navigation)

When user clicks a menu item:

```javascript
label.addEventListener('click', (e) => {
    // 1. Scroll to vertical section
    if (node.sectionIndex !== undefined) {
        const targetSection = sections[node.sectionIndex];
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // 2. If it's a horizontal panel, scroll horizontally
        if (node.panelId) {
            const panel = document.querySelector(`#${node.panelId}`);
            const track = panel.closest('.horizontal-section')
                              .querySelector('.horizontal-track');
            track.scrollTo({ left: panel.offsetLeft, behavior: 'smooth' });
            
            // 3. Activate card group for that panel
            updateInterestsPanelState(node.panelId);
            updateBreadcrumb(node.sectionIndex, node.panelId);
        }
    }
    
    // 4. Toggle folder expansion
    if (ul) {
        ul.classList.toggle('expanded');
        if (ul.classList.contains('expanded')) {
            manuallyExpandedMenus.add(ul);  // Track manual expansion
        } else {
            manuallyExpandedMenus.delete(ul);
        }
    }
});
```

### Menu State Sync

When scroll reaches a new section, update the menu:

```javascript
function updateTreeState(activeIndex, activePanelId = null) {
    // 1. Find which menu item is active
    let activeLabelElement = null;
    if (activePanelId) {
        activeLabelElement = document.querySelector(
            `.tree-label[data-panel-id="${activePanelId}"]`
        );
    } else {
        activeLabelElement = document.querySelector(
            `.tree-label[data-index="${activeIndex}"]:not([data-panel-id])`
        );
    }
    
    // 2. Build path to this item (which folders must stay expanded)
    const pathToActive = new Set();
    let parentUl = activeLabelElement.parentElement.parentElement;
    while (parentUl && !parentUl.classList.contains('file-tree')) {
        pathToActive.add(parentUl);
        parentUl = parentUl.parentElement.parentElement;
    }
    
    // 3. Collapse all other folders (except manually expanded)
    document.querySelectorAll('.file-tree ul').forEach(ul => {
        const isManuallyExpanded = manuallyExpandedMenus.has(ul);
        const isInPath = pathToActive.has(ul);
        
        if (!isManuallyExpanded && !isInPath) {
            ul.classList.remove('expanded');
        }
    });
    
    // 4. Highlight the active item
    if (activeLabelElement) {
        activeLabelElement.classList.add('active');
    }
}
```

### Breadcrumb Update

Display the path to current location:

```javascript
function updateBreadcrumb(index, panelId = null) {
    let newPath = '~/';
    if (panelId && panelPaths[panelId]) {
        newPath = panelPaths[panelId];
    } else if (sectionPaths[index]) {
        newPath = sectionPaths[index];
    }
    
    breadcrumbText.textContent = newPath;
}
```

### Key Design Patterns

1. **Declarative Tree**: Define the menu structure once in `menuTree`, then generate DOM and paths from it
2. **Dual Navigation**: Menu can navigate both vertical (sections) and horizontal (panels)
3. **Path Calculation**: Pre-compute paths from tree structure for O(1) breadcrumb lookup
4. **Manual Expansion**: User manually expanded folders stay expanded; auto-collapse others to reduce clutter
5. **Active Path Highlighting**: Only folders in the path to active item stay open

---

## Integration: Gate + Menu

The two systems work together:

1. **User scrolls cards** → Gate manages `currentIndex`
2. **Gate detects panel change** (via IntersectionObserver) → Calls `updateTreeState()`
3. **updateTreeState()** highlights menu item → Calls `updateBreadcrumb()`
4. **Breadcrumb shows current path** → User knows location
5. **User clicks menu** → Calls `updateInterestsPanelState()` → Resets `currentIndex`

Result: Menu, breadcrumb, and scroll position all stay in sync without race conditions.