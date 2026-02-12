const STORAGE_KEY = "menu_builder_v1";
const $ = (s, el = document) => el.querySelector(s);

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(2, 6);
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(() => t.classList.remove("show"), 1600);
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "menu";
}

function ensureUniqueMenuId(base) {
  const all = new Set(state.menus.map(m => m.id));
  if (!all.has(base)) return base;
  let i = 2;
  while (all.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

function makeDefaultState() {
  return {
    activeMenuId: null,
    menus: [],
    history: {}
  };
}

function normalizeState(parsed) {
  const result = parsed && parsed.menus && Array.isArray(parsed.menus) ? parsed : makeDefaultState();
  result.history = {};

  result.menus = result.menus.map(menu => ({
    ...menu,
    location: menu.location || "header",
    maxDepth: Number.isInteger(menu.maxDepth) ? menu.maxDepth : 2,
    items: (Array.isArray(menu.items) ? menu.items : []).map(item => ({
      ...item,
      open: false
    }))
  }));

  const hasPersistedActiveMenu = result.menus.some(menu => menu.id === result.activeMenuId);
  result.activeMenuId = hasPersistedActiveMenu ? result.activeMenuId : (result.menus[0]?.id || null);

  return result;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch (e) { }
  return makeDefaultState();
}

let state = loadState();
let savedMenusSnapshot = JSON.stringify(state.menus);
const dirtyMenuIds = new Set();
let pendingMenuSwitchId = null;

function markDirty(menuId) {
  if (menuId) dirtyMenuIds.add(menuId);
}

function syncSavedSnapshot() {
  savedMenusSnapshot = JSON.stringify(state.menus);
  dirtyMenuIds.clear();
}

function hasUnsavedChanges() {
  if (dirtyMenuIds.size > 0) return true;
  return JSON.stringify(state.menus) !== savedMenusSnapshot;
}

function saveState() {
  const persistedState = {
    activeMenuId: state.activeMenuId,
    menus: state.menus,
    history: {}
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
}

function getActiveMenu() {
  return state.menus.find(m => m.id === state.activeMenuId) || state.menus[0] || null;
}

function setActiveMenu(id) {
  state.activeMenuId = id || null;
  state.history = {};
  render();
}

function getHistory(menuId) {
  state.history[menuId] ||= { undo: [], redo: [] };
  return state.history[menuId];
}

function cloneItems(items) {
  return items.map(item => ({ ...item }));
}

function recordHistory(menu) {
  if (!menu) return;
  markDirty(menu.id);
  const history = getHistory(menu.id);
  history.undo.push(cloneItems(menu.items));
  history.redo = [];
  if (history.undo.length > 100) history.undo.shift();
}

function undo() {
  const menu = getActiveMenu();
  const history = getHistory(menu.id);
  if (history.undo.length === 0) return;
  history.redo.push(cloneItems(menu.items));
  menu.items = history.undo.pop();
  renderList();
}

function redo() {
  const menu = getActiveMenu();
  const history = getHistory(menu.id);
  if (history.redo.length === 0) return;
  history.undo.push(cloneItems(menu.items));
  menu.items = history.redo.pop();
  renderList();
}

function updateUndoRedoButtons() {
  const menu = getActiveMenu();
  const undoBtn = $("#undoBtn");
  const redoBtn = $("#redoBtn");
  if (!menu) {
    undoBtn.disabled = true;
    redoBtn.disabled = true;
    return;
  }
  const history = getHistory(menu.id);
  undoBtn.disabled = history.undo.length === 0;
  redoBtn.disabled = history.redo.length === 0;
}

function blockEnd(items, startIdx) {
  const base = items[startIdx].level;
  let end = startIdx;
  for (let i = startIdx + 1; i < items.length; i++) {
    if (items[i].level <= base) break;
    end = i;
  }
  return end;
}

function extractBlock(items, startIdx) {
  const end = blockEnd(items, startIdx);
  return items.splice(startIdx, end - startIdx + 1);
}

function insertBlock(items, idx, block) {
  items.splice(idx, 0, ...block);
}

function findPrevSibling(items, idx) {
  const lvl = items[idx].level;
  for (let i = idx - 1; i >= 0; i--) {
    if (items[i].level === lvl) return i;
    if (items[i].level < lvl) break;
  }
  return -1;
}

function findNextSibling(items, idx) {
  const lvl = items[idx].level;
  const end = blockEnd(items, idx);
  for (let i = end + 1; i < items.length; i++) {
    if (items[i].level === lvl) return i;
    if (items[i].level < lvl) break;
  }
  return -1;
}

function siblingsFirstIndex(items, idx) {
  const lvl = items[idx].level;
  if (lvl === 0) return 0;

  let parentIdx = -1;
  for (let i = idx - 1; i >= 0; i--) {
    if (items[i].level === lvl - 1) {
      parentIdx = i;
      break;
    }
  }
  if (parentIdx < 0) return 0;

  for (let i = parentIdx + 1; i < items.length; i++) {
    if (items[i].level < lvl) break;
    if (items[i].level === lvl) return i;
  }
  return idx;
}

function moveUp(items, idx) {
  const prev = findPrevSibling(items, idx);
  if (prev < 0) return;
  const block = extractBlock(items, idx);
  insertBlock(items, prev, block);
}

function moveDown(items, idx) {
  let next = findNextSibling(items, idx);
  if (next < 0) return;
  const block = extractBlock(items, idx);
  if (idx < next) next -= block.length;
  const nextEnd = blockEnd(items, next);
  insertBlock(items, nextEnd + 1, block);
}

function moveTop(items, idx) {
  const first = siblingsFirstIndex(items, idx);
  if (first === idx) return;
  const block = extractBlock(items, idx);
  insertBlock(items, first, block);
}

function promote(items, idx) {
  if (items[idx].level === 0) return;
  const end = blockEnd(items, idx);
  for (let i = idx; i <= end; i++) items[i].level -= 1;
}

function demote(items, idx, maxDepth) {
  if (idx === 0) return;
  const curLvl = items[idx].level;
  const maxAllowed = Math.min(items[idx - 1].level + 1, maxDepth);
  const desired = Math.min(curLvl + 1, maxAllowed);
  if (desired <= curLvl) return;
  const delta = desired - curLvl;
  const end = blockEnd(items, idx);
  for (let i = idx; i <= end; i++) items[i].level += delta;
}

function renderMenuSelect() {
  const sel = $("#menuSelect");
  sel.innerHTML = "";

  if (state.menus.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Žádné menu";
    sel.appendChild(opt);
    sel.value = "";
    sel.disabled = true;
    return;
  }

  sel.disabled = false;
  state.menus.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.name} (${m.location === "footer" ? "zápatí" : "záhlaví"})`;
    sel.appendChild(opt);
  });
  if (getActiveMenu()) sel.value = getActiveMenu().id;
  sel.onchange = () => requestMenuSwitch(sel.value);
}

function requestMenuSwitch(nextMenuId) {
  const currentMenu = getActiveMenu();
  if (!currentMenu || currentMenu.id === nextMenuId) {
    setActiveMenu(nextMenuId);
    return;
  }

  if (!dirtyMenuIds.has(currentMenu.id)) {
    setActiveMenu(nextMenuId);
    return;
  }

  pendingMenuSwitchId = nextMenuId;
  $("#menuSelect").value = currentMenu.id;
  openModal("unsavedChangesModal");
}

function discardCurrentMenuChanges() {
  const currentMenu = getActiveMenu();
  if (!currentMenu) return;

  const savedMenus = JSON.parse(savedMenusSnapshot || "[]");
  const savedMenu = savedMenus.find(menu => menu.id === currentMenu.id);

  if (savedMenu) {
    const idx = state.menus.findIndex(menu => menu.id === currentMenu.id);
    if (idx >= 0) {
      state.menus[idx] = {
        ...savedMenu,
        items: (savedMenu.items || []).map(item => ({ ...item, open: false }))
      };
    }
  } else {
    state.menus = state.menus.filter(menu => menu.id !== currentMenu.id);
  }

  dirtyMenuIds.delete(currentMenu.id);
}

function resolvePendingMenuSwitch() {
  if (!pendingMenuSwitchId) return;
  const targetId = pendingMenuSwitchId;
  pendingMenuSwitchId = null;
  setActiveMenu(targetId);
}

function arrowIcon() {
  return `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("\n", " ");
}

function sanitizePreviewHref() {
  return "javascript:void(0)";
}

const editingGuard = new Set();
const trashDropzone = $("#trashDropzone");
let draggingItemId = null;
let dragPreview = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

const emptyDragImage = new Image();
emptyDragImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function showTrashDropzone() {
  trashDropzone.classList.add("show");
}

function hideTrashDropzone() {
  trashDropzone.classList.remove("show", "active");
}

function removeItemBlock(menu, id) {
  const idxNow = menu.items.findIndex(x => x.id === id);
  if (idxNow < 0) return false;
  const end = blockEnd(menu.items, idxNow);
  menu.items.splice(idxNow, end - idxNow + 1);
  return true;
}

function renderList() {
  const menu = getActiveMenu();
  const list = $("#list");
  list.innerHTML = "";

  if (!menu) {
    const empty = document.createElement("div");
    empty.style.padding = "14px";
    empty.style.color = "var(--muted)";
    empty.textContent = "Zatím neexistuje žádné menu. Vytvořte ho tlačítkem „Nové menu“.";
    list.appendChild(empty);
    return;
  }

  const hint = document.createElement("div");
  hint.className = "drop-hint";
  list.appendChild(hint);

  menu.items.forEach(item => {
    const row = document.createElement("div");
    row.className = "menu-row";
    row.style.setProperty("--lvl", item.level);

    const card = document.createElement("div");
    card.className = "menu-item" + (item.open ? " open" : "");
    card.draggable = false;

    const head = document.createElement("div");
    head.className = "head";
    head.draggable = true;

    const title = document.createElement("div");
    title.className = "title";
    title.innerHTML = `<span class="txt">${escapeHtml(item.title || "(bez názvu)")}</span><span class="badge">Custom Link</span>`;

    const toggle = document.createElement("button");
    toggle.className = "toggle";
    toggle.type = "button";
    toggle.title = "Otevřít / zavřít detail";
    toggle.innerHTML = arrowIcon();
    toggle.addEventListener("click", e => {
      e.stopPropagation();
      item.open = !item.open;
      renderList();
    });

    head.addEventListener("click", e => {
      const clickedToggle = e.target.closest(".toggle");
      if (clickedToggle) return;
      item.open = !item.open;
      renderList();
    });

    head.appendChild(title);
    head.appendChild(toggle);
    card.appendChild(head);

    const details = document.createElement("div");
    details.className = "details";
    details.innerHTML = `
      <div class="grid">
        <div>
          <label style="display:block;font-size:12px;color:var(--muted);margin-bottom:4px;">Název položky</label>
          <input type="text" data-field="title" value="${escapeAttr(item.title)}" placeholder="Např. O nás" />
        </div>
        <div>
          <label style="display:block;font-size:12px;color:var(--muted);margin-bottom:4px;">URL</label>
          <input type="url" data-field="url" value="${escapeAttr(item.url)}" placeholder="Např. https://example.com/about" />
        </div>
        <div class="full actions">
          <div class="links">
            <button class="linkbtn" data-act="up">Nahoru</button>
            <button class="linkbtn" data-act="down">Dolů</button>
            <button class="linkbtn" data-act="promote">Povýšit</button>
            <button class="linkbtn" data-act="demote">Ponížit</button>
            <button class="linkbtn" data-act="top">Na začátek úrovně</button>
          </div>
          <div class="spacer"></div>
          <button class="btn danger" data-act="remove" type="button">Smazat</button>
        </div>
      </div>
      <div class="meta">Úroveň: <b>${item.level}</b> &nbsp;•&nbsp; ID: <code>${item.id}</code></div>
    `;

    details.addEventListener("input", e => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement)) return;
      const field = t.dataset.field;
      if (!field) return;
      if (!editingGuard.has(item.id)) {
        recordHistory(menu);
        editingGuard.add(item.id);
      }
      if (field === "title") item.title = t.value;
      if (field === "url") item.url = t.value;
      const headTxt = card.querySelector(".title .txt");
      if (headTxt && field === "title") headTxt.textContent = item.title || "(bez názvu)";
      updateUndoRedoButtons();
    });

    details.addEventListener("focusout", () => editingGuard.delete(item.id));

    details.addEventListener("click", e => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      const idxNow = menu.items.findIndex(x => x.id === item.id);
      if (idxNow < 0) return;

      recordHistory(menu);
      if (act === "up") moveUp(menu.items, idxNow);
      if (act === "down") moveDown(menu.items, idxNow);
      if (act === "top") moveTop(menu.items, idxNow);
      if (act === "promote") promote(menu.items, idxNow);
      if (act === "demote") demote(menu.items, idxNow, menu.maxDepth);
      if (act === "remove") removeItemBlock(menu, item.id);
      renderList();
    });

    card.appendChild(details);

    head.addEventListener("dragstart", e => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        e.preventDefault();
        return;
      }
      card.classList.add("dragging");
      draggingItemId = item.id;

      // Custom Drag Preview with full subtree
      const menu = getActiveMenu();
      const idx = menu.items.findIndex(x => x.id === item.id);
      const end = blockEnd(menu.items, idx);
      const movingItems = menu.items.slice(idx, end + 1);

      const rect = card.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;

      dragPreview = document.createElement("div");
      dragPreview.className = "drag-preview";
      dragPreview.style.setProperty("--w", `${rect.width}px`);
      dragPreview.style.left = `${rect.left}px`;
      dragPreview.style.top = `${rect.top}px`;

      // Clone all items in the block
      const allRows = Array.from(list.querySelectorAll(".menu-row"));
      // Assumption: renderList creates rows in order corresponding to menu.items

      movingItems.forEach((sub, i) => {
        const rowEl = allRows[idx + i];
        if (rowEl) {
          const cardEl = rowEl.querySelector(".menu-item");
          if (cardEl) {
            const clone = cardEl.cloneNode(true);
            clone.classList.remove("dragging", "open");
            clone.querySelector(".details")?.remove();

            // Apply relative indentation logic if needed for visual group
            // In the DOM, indentation is handled by padding-left on the row.
            // In the preview, we are stacking clones.
            // To look like a tree, we can add margin-left to clones.
            const relLvl = sub.level - item.level;
            clone.style.marginLeft = `${relLvl * 30}px`;
            clone.style.width = `calc(100% - ${relLvl * 30}px)`; // Adjust width
            clone.style.marginBottom = "2px";

            clone.style.border = "1px solid var(--blue)";
            clone.style.boxShadow = "none";

            dragPreview.appendChild(clone);
          }
        }
      });

      document.body.appendChild(dragPreview);

      e.dataTransfer.setDragImage(emptyDragImage, 0, 0);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", item.id);

      showTrashDropzone();
    });

    head.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      document.querySelectorAll('.drop-target-parent').forEach(el => el.classList.remove('drop-target-parent'));
      draggingItemId = null;
      if (dragPreview) {
        dragPreview.remove();
        dragPreview = null;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      hint.classList.remove("show");
      hideTrashDropzone();
    });

    row.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      const rect = row.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      const height = rect.height;
      const zone = 0.25; // top/bottom 25% for reorder, middle 50% for parent

      // Clear previous states
      document.querySelectorAll('.drop-target-parent').forEach(el => el.classList.remove('drop-target-parent'));

      // Determine mode
      let mode = "parent";
      let insertBefore = false;

      if (relY < height * zone) {
        mode = "reorder";
        insertBefore = true;
      } else if (relY > height * (1 - zone)) {
        mode = "reorder";
        insertBefore = false; // after
      }

      // Prevent dropping parent on itself or its children is handled in drop,
      // but we can also hide feedback if invalid (optimization).
      // For now, simple visual feedback.

      if (mode === "parent") {
        card.classList.add("drop-target-parent");
        hint.classList.remove("show");
        hint.dataset.dropMode = "parent";
      } else {
        hint.classList.add("show");
        hint.dataset.dropMode = "reorder";
        hint.dataset.dropBefore = insertBefore ? "1" : "0";
        if (insertBefore) row.before(hint);
        else row.after(hint);
        hint.style.marginLeft = `${item.level * 30}px`;
      }
      hint.dataset.targetId = item.id;
    });

    row.addEventListener("dragleave", e => {
      // Only remove if leaving the row entirely, usually dragover handles this by clearing.
      // But if we leave the row to go to another row, dragover on other row clears it.
      // If we leave to go outside list, we might want to clear.
      // However, often dragleave fires when entering children.
      // Safe bet is to rely on dragover clearing or dragend clearing, 
      // or check if relatedTarget is not inside the row.
      if (!row.contains(e.relatedTarget)) {
        card.classList.remove("drop-target-parent");
      }
    });

    row.addEventListener("drop", e => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      const targetId = item.id;
      if (!draggedId || draggedId === targetId) return;

      const items = menu.items;
      const from = items.findIndex(x => x.id === draggedId);
      let to = items.findIndex(x => x.id === targetId);
      if (from < 0 || to < 0) return;

      // 1. Check if `to` is inside the range of `from` block (prevent dropping parent on child)
      const rangeEnd = blockEnd(items, from);
      if (to >= from && to <= rangeEnd) return;

      recordHistory(menu);

      // Now extract the block
      const block = items.splice(from, rangeEnd - from + 1);

      // Update `to` index because extraction might have shifted it
      if (from < to) to -= block.length;

      const dropMode = hint.dataset.dropMode;

      if (dropMode === "parent") {
        // Drop AS CHILD of target
        const targetItem = items[to];
        const desiredLevel = targetItem.level + 1;
        const levelDiff = desiredLevel - block[0].level;

        const maxDepth = menu.maxDepth || 5;
        let valid = true;
        block.forEach(x => {
          if (x.level + levelDiff > maxDepth) valid = false;
        });

        if (!valid) {
          toast("Nelze vnořit: překročena maximální hloubka");
          undo();
          return;
        }

        // Apply level change
        block.forEach(x => x.level += levelDiff);

        // Insert AFTER target (as first child)
        insertBlock(items, to + 1, block);

        // Auto-open is intentionally removed on user request
        // targetItem.open = true;

      } else {
        // Reorder logic
        const targetItem = items[to];

        // Adjust level to match the new sibling
        const desiredLevel = targetItem.level;
        const levelDiff = desiredLevel - block[0].level;

        // Validation check
        const maxDepth = menu.maxDepth || 5;
        let valid = true;
        block.forEach(x => {
          const newLevel = x.level + levelDiff;
          if (newLevel > maxDepth || newLevel < 0) valid = false;
        });

        if (!valid) {
          toast("Nelze přesunout: neplatná úroveň");
          undo();
          return;
        }

        // Apply level change
        block.forEach(x => x.level += levelDiff);

        const before = hint.dataset.dropBefore === "1";
        if (before) {
          insertBlock(items, to, block);
        } else {
          const targetEnd = blockEnd(items, to);
          insertBlock(items, targetEnd + 1, block);
        }
      }
      renderList();
    });

    row.appendChild(card);
    list.appendChild(row);
  });

  if (menu.items.length === 0) {
    const empty = document.createElement("div");
    empty.style.padding = "14px";
    empty.style.color = "var(--muted)";
    empty.textContent = "Menu je prázdné. Klikněte na „Nová položka“.";
    list.appendChild(empty);
  }

  updateUndoRedoButtons();
}

function render() {
  const hasMenu = Boolean(getActiveMenu());
  $("#newItemBtn").disabled = !hasMenu;
  $("#previewBtn").disabled = !hasMenu;
  renderMenuSelect();
  renderList();
}

function buildPreviewTree(items) {
  const root = [];
  const stack = [];
  items.forEach(item => {
    const node = { ...item, children: [] };
    while (stack.length && stack[stack.length - 1].level >= item.level) stack.pop();
    if (stack.length === 0) root.push(node);
    else stack[stack.length - 1].children.push(node);
    stack.push(node);
  });
  return root;
}

function renderPreviewMenu(nodes, depth = 0) {
  if (nodes.length === 0) return "";
  const listClass = depth === 0 ? "preview-menu-list" : "preview-submenu-list";
  const submenuClass = depth === 0 ? "preview-submenu depth-1" : "preview-submenu depth-2plus";
  return `<ul class="${listClass}">${nodes.map(node => {
    const hasChildren = node.children.length > 0;
    return `<li class="preview-menu-item${hasChildren ? " has-children" : ""}">
      <a href="${escapeAttr(sanitizePreviewHref())}" class="preview-link">
        <span>${escapeHtml(node.title || "(bez názvu)")}</span>
        ${hasChildren ? '<span class="preview-marker">▾</span>' : ''}
      </a>
      ${hasChildren ? `<div class="${submenuClass}">${renderPreviewMenu(node.children, depth + 1)}</div>` : ""}
    </li>`;
  }).join("")}</ul>`;
}

const modalBackdrop = $("#modalBackdrop");

function openModal(modalId) {
  modalBackdrop.hidden = false;
  $(`#${modalId}`).hidden = false;
}

function closeModal(modalId) {
  $(`#${modalId}`).hidden = true;
  if (modalId === "unsavedChangesModal") {
    pendingMenuSwitchId = null;
    const activeMenu = getActiveMenu();
    if (activeMenu) $("#menuSelect").value = activeMenu.id;
  }
  const hasOpen = Array.from(document.querySelectorAll(".modal")).some(m => !m.hidden);
  modalBackdrop.hidden = !hasOpen;
}

modalBackdrop.addEventListener("click", () => {
  document.querySelectorAll(".modal").forEach(modal => { modal.hidden = true; });
  pendingMenuSwitchId = null;
  const activeMenu = getActiveMenu();
  if (activeMenu) $("#menuSelect").value = activeMenu.id;
  modalBackdrop.hidden = true;
});

document.querySelectorAll("[data-close-modal]").forEach(btn => {
  btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
});

window.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal").forEach(modal => { modal.hidden = true; });
    pendingMenuSwitchId = null;
    const activeMenu = getActiveMenu();
    if (activeMenu) $("#menuSelect").value = activeMenu.id;
    modalBackdrop.hidden = true;
  }
});

window.addEventListener("beforeunload", e => {
  if (!hasUnsavedChanges()) return;
  e.preventDefault();
  e.returnValue = "";
});

$("#newItemBtn").addEventListener("click", () => {
  const menu = getActiveMenu();
  if (!menu) return;
  recordHistory(menu);
  menu.items.push({ id: uid(), title: "Nová položka", url: "", level: 0, open: false });
  renderList();
  toast("Položka přidána");
});

const newMenuForm = $("#newMenuForm");
const newMenuName = $("#newMenuName");
const newMenuId = $("#newMenuId");

function prepareNewMenuModal() {
  newMenuForm.reset();
  newMenuName.value = "";
  newMenuId.value = "menu";
  $("#newMenuLocation").value = "header";
  $("#newMenuDepth").value = "2";
}

newMenuName.addEventListener("input", () => {
  newMenuId.value = ensureUniqueMenuId(slugify(newMenuName.value));
});

$("#newMenuBtn").addEventListener("click", () => {
  prepareNewMenuModal();
  openModal("newMenuModal");
  newMenuName.focus();
});

newMenuForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = newMenuName.value.trim();
  if (!name) {
    newMenuName.focus();
    return;
  }
  const id = ensureUniqueMenuId(slugify(name));
  const location = $("#newMenuLocation").value;
  const maxDepth = Math.max(0, Math.min(10, Number($("#newMenuDepth").value || 0)));

  state.menus.push({ id, name, location, maxDepth, items: [] });
  state.activeMenuId = id;
  markDirty(id);
  getHistory(id);
  closeModal("newMenuModal");
  render();
  toast("Menu vytvořeno");
});

$("#undoBtn").addEventListener("click", () => {
  if (!getActiveMenu()) return;
  undo();
});
$("#redoBtn").addEventListener("click", () => {
  if (!getActiveMenu()) return;
  redo();
});

$("#saveBtn").addEventListener("click", () => {
  saveState();
  syncSavedSnapshot();
  toast("Uloženo do localStorage");
});

$("#saveAndSwitchBtn").addEventListener("click", () => {
  saveState();
  syncSavedSnapshot();
  resolvePendingMenuSwitch();
  closeModal("unsavedChangesModal");
  toast("Uloženo do localStorage");
});

$("#discardAndSwitchBtn").addEventListener("click", () => {
  discardCurrentMenuChanges();
  resolvePendingMenuSwitch();
  closeModal("unsavedChangesModal");
  toast("Neuložené změny byly zahozeny");
});

$("#previewBtn").addEventListener("click", () => {
  const menu = getActiveMenu();
  if (!menu) return;
  const tree = buildPreviewTree(menu.items);
  const rows = renderPreviewMenu(tree);
  $("#previewTitle").textContent = `Náhled: ${menu.name}`;
  $("#previewContent").innerHTML = `
    <div class="preview-nav">${rows || '<div style="color:#646970;padding:8px;">Menu je prázdné.</div>'}</div>
  `;
  openModal("previewModal");
});

trashDropzone.addEventListener("dragover", e => {
  if (!draggingItemId) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  trashDropzone.classList.add("active");
});

trashDropzone.addEventListener("dragleave", () => {
  trashDropzone.classList.remove("active");
});

trashDropzone.addEventListener("drop", e => {
  if (!draggingItemId) return;
  e.preventDefault();
  const menu = getActiveMenu();
  recordHistory(menu);
  const removed = removeItemBlock(menu, draggingItemId);
  draggingItemId = null;
  hideTrashDropzone();
  if (removed) {
    renderList();
    toast("Položka smazána přes koš");
  }
});

let rafId = null;
let currentClientX = 0;
let currentClientY = 0;

function updateDragPreviewPosition() {
  if (dragPreview) {
    dragPreview.style.left = `${currentClientX - dragOffsetX}px`;
    dragPreview.style.top = `${currentClientY - dragOffsetY}px`;
    rafId = requestAnimationFrame(updateDragPreviewPosition);
  }
}

document.addEventListener("dragover", e => {
  if (dragPreview) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    currentClientX = e.clientX;
    currentClientY = e.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(updateDragPreviewPosition);
    }
  }
});

render();
