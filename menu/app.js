// --- Simple WordPress-like Menu Builder (flat array + level), stored in localStorage ---
const STORAGE_KEY = "menu_builder_v1";
const $ = (s, el=document) => el.querySelector(s);

function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(2,6); }

function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(()=>t.classList.remove("show"), 1600);
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed && parsed.menus && Array.isArray(parsed.menus)) return parsed;
    }
  }catch(e){}
  // default
  return {
    activeMenuId: "default",
    menus: [
      {
        id:"default",
        name:"My First Menu",
        items:[
          {id:uid(), title:"Main Page", url:"/", level:0, open:false},
          {id:uid(), title:"About", url:"/about", level:0, open:true},
          {id:uid(), title:"Contact", url:"/contact", level:0, open:false},
          {id:uid(), title:"Parent Page", url:"/parent", level:0, open:false},
          {id:uid(), title:"Sub Page 1", url:"/parent/sub1", level:1, open:false},
          {id:uid(), title:"Sub Page 2", url:"/parent/sub2", level:1, open:false}
        ]
      }
    ]
  };
}

let state = loadState();

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveMenu(){
  return state.menus.find(m => m.id === state.activeMenuId) || state.menus[0];
}

function setActiveMenu(id){
  state.activeMenuId = id;
  saveState();
  render();
}

// --- Flat array helpers (block = item + its descendants) ---
function blockEnd(items, startIdx){
  const base = items[startIdx].level;
  let end = startIdx;
  for(let i=startIdx+1;i<items.length;i++){
    if(items[i].level <= base) break;
    end = i;
  }
  return end;
}

function extractBlock(items, startIdx){
  const end = blockEnd(items, startIdx);
  return items.splice(startIdx, end - startIdx + 1);
}

function insertBlock(items, idx, block){
  items.splice(idx, 0, ...block);
}

function findPrevSibling(items, idx){
  const lvl = items[idx].level;
  for(let i=idx-1;i>=0;i--){
    if(items[i].level === lvl) return i;
    if(items[i].level < lvl) break;
  }
  return -1;
}

function findNextSibling(items, idx){
  const lvl = items[idx].level;
  const end = blockEnd(items, idx);
  for(let i=end+1;i<items.length;i++){
    if(items[i].level === lvl) return i;
    if(items[i].level < lvl) break;
  }
  return -1;
}

function siblingsFirstIndex(items, idx){
  const lvl = items[idx].level;
  if(lvl === 0) return 0;

  let parentIdx = -1;
  for(let i=idx-1;i>=0;i--){
    if(items[i].level === lvl-1){ parentIdx = i; break; }
  }
  if(parentIdx < 0) return 0;

  for(let i=parentIdx+1;i<items.length;i++){
    if(items[i].level < lvl) break;
    if(items[i].level === lvl) return i;
  }
  return idx;
}

function moveUp(items, idx){
  const prev = findPrevSibling(items, idx);
  if(prev < 0) return;
  const block = extractBlock(items, idx);
  insertBlock(items, prev, block);
}

function moveDown(items, idx){
  let next = findNextSibling(items, idx);
  if(next < 0) return;
  const block = extractBlock(items, idx);
  if(idx < next) next -= block.length;
  const nextEnd = blockEnd(items, next);
  insertBlock(items, nextEnd + 1, block);
}

function moveTop(items, idx){
  const first = siblingsFirstIndex(items, idx);
  if(first === idx) return;
  const block = extractBlock(items, idx);
  insertBlock(items, first, block);
}

function promote(items, idx){
  if(items[idx].level === 0) return;
  const end = blockEnd(items, idx);
  for(let i=idx;i<=end;i++) items[i].level -= 1;
}

function demote(items, idx){
  if(idx === 0) return;
  const curLvl = items[idx].level;
  const maxAllowed = items[idx-1].level + 1;
  const desired = Math.min(curLvl + 1, maxAllowed);
  if(desired <= curLvl) return;
  const delta = desired - curLvl;
  const end = blockEnd(items, idx);
  for(let i=idx;i<=end;i++) items[i].level += delta;
}

// --- Rendering ---
function renderMenuSelect(){
  const sel = $("#menuSelect");
  sel.innerHTML = "";
  state.menus.forEach(m=>{
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.name;
    sel.appendChild(opt);
  });
  sel.value = getActiveMenu().id;
  sel.onchange = () => setActiveMenu(sel.value);
}

function arrowIcon(){
  return `
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`;
}

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function escapeAttr(str){ return escapeHtml(str).replaceAll("\\n"," "); }

function renderList(){
  const menu = getActiveMenu();
  const list = $("#list");
  list.innerHTML = "";

  const hint = document.createElement("div");
  hint.className = "drop-hint";
  list.appendChild(hint);

  menu.items.forEach((item, idx)=>{
    const card = document.createElement("div");
    card.className = "menu-item" + (item.open ? " open" : "");
    card.style.setProperty("--lvl", item.level);
    card.draggable = false;
    card.dataset.index = String(idx);

    const head = document.createElement("div");
    head.className = "head";
    head.draggable = true;

    const title = document.createElement("div");
    title.className = "title";
    title.innerHTML = `<span class="txt">${escapeHtml(item.title || "(bez názvu)")}</span>
                       <span class="badge">Custom Link</span>`;

    const toggle = document.createElement("button");
    toggle.className = "toggle";
    toggle.type = "button";
    toggle.title = "Otevřít / zavřít detail";
    toggle.innerHTML = arrowIcon();
    toggle.addEventListener("click", (e)=>{
      e.stopPropagation();
      item.open = !item.open;
      saveState();
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
          <button class="btn danger" data-act="remove" type="button">Odebrat</button>
        </div>
      </div>
      <div class="meta">Úroveň: <b>${item.level}</b> &nbsp;•&nbsp; ID: <code>${item.id}</code></div>
    `;

    details.addEventListener("input", (e)=>{
      const t = e.target;
      if(!(t instanceof HTMLInputElement)) return;
      const field = t.dataset.field;
      if(!field) return;
      if(field === "title") item.title = t.value;
      if(field === "url") item.url = t.value;
      saveState();
      const headTxt = card.querySelector(".title .txt");
      if(headTxt && field === "title") headTxt.textContent = item.title || "(bez názvu)";
    });

    details.addEventListener("click", (e)=>{
      const btn = e.target.closest("[data-act]");
      if(!btn) return;
      const act = btn.dataset.act;
      const menu = getActiveMenu();
      const idxNow = menu.items.findIndex(x=>x.id===item.id);
      if(idxNow < 0) return;

      if(act === "up") moveUp(menu.items, idxNow);
      if(act === "down") moveDown(menu.items, idxNow);
      if(act === "top") moveTop(menu.items, idxNow);
      if(act === "promote") promote(menu.items, idxNow);
      if(act === "demote") demote(menu.items, idxNow);
      if(act === "remove"){
        const end = blockEnd(menu.items, idxNow);
        menu.items.splice(idxNow, end-idxNow+1);
      }
      saveState();
      renderList();
    });

    card.appendChild(details);

    // Drag & Drop (reorder blocks)
    head.addEventListener("dragstart", (e)=>{
      const selection = window.getSelection();
      if(selection && !selection.isCollapsed){
        e.preventDefault();
        return;
      }
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", item.id);
    });
    head.addEventListener("dragend", ()=>{
      card.classList.remove("dragging");
      hint.classList.remove("show");
    });

    card.addEventListener("dragover", (e)=>{
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const rect = card.getBoundingClientRect();
      const before = e.clientY < rect.top + rect.height/2;
      hint.classList.add("show");
      hint.style.marginLeft = `${item.level * 30}px`;
      hint.dataset.dropBefore = before ? "1" : "0";
      hint.dataset.targetId = item.id;

      if(before) card.before(hint);
      else card.after(hint);
    });

    card.addEventListener("drop", (e)=>{
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      const targetId = item.id;
      if(!draggedId || draggedId === targetId) return;

      const menu = getActiveMenu();
      const items = menu.items;
      const from = items.findIndex(x=>x.id===draggedId);
      let to = items.findIndex(x=>x.id===targetId);
      if(from < 0 || to < 0) return;

      const before = hint.dataset.dropBefore === "1";
      const block = extractBlock(items, from);

      if(from < to) to -= block.length;

      if(before){
        insertBlock(items, to, block);
      }else{
        const targetEnd = blockEnd(items, to);
        insertBlock(items, targetEnd + 1, block);
      }

      saveState();
      renderList();
    });

    list.appendChild(card);
  });

  if(menu.items.length === 0){
    const empty = document.createElement("div");
    empty.style.padding = "14px";
    empty.style.color = "var(--muted)";
    empty.textContent = "Menu je prázdné. Klikněte na „Nová položka“.";
    list.appendChild(empty);
  }
}

function render(){
  renderMenuSelect();
  renderList();
}

// Topbar actions
$("#newItemBtn").addEventListener("click", ()=>{
  const menu = getActiveMenu();
  menu.items.push({id:uid(), title:"Nová položka", url:"", level:0, open:true});
  saveState();
  renderList();
  toast("Položka přidána");
});

$("#newMenuBtn").addEventListener("click", ()=>{
  const name = prompt("Název nového menu:", "Nové menu");
  if(!name) return;
  const id = uid();
  state.menus.push({id, name, items:[]});
  state.activeMenuId = id;
  saveState();
  render();
  toast("Menu vytvořeno");
});

$("#saveBtn").addEventListener("click", ()=>{
  saveState();
  toast("Uloženo do localStorage");
});

function buildPreviewTree(items){
  const root = [];
  const stack = [];

  items.forEach(item=>{
    const node = { ...item, children: [] };
    while(stack.length && stack[stack.length-1].level >= item.level) stack.pop();
    if(stack.length === 0) root.push(node);
    else stack[stack.length-1].children.push(node);
    stack.push(node);
  });

  return root;
}

function renderPreviewMenu(nodes){
  if(nodes.length === 0) return "";

  return `<ul class="preview-menu-list">${nodes.map(node=>{
    const child = node.children.length ? `<div class="preview-submenu">${renderPreviewMenu(node.children)}</div>` : "";
    return `<li class="preview-menu-item">
      <a href="${escapeAttr(node.url || "#")}" class="preview-link">${escapeHtml(node.title || "(bez názvu)")}</a>
      ${child}
    </li>`;
  }).join("")}</ul>`;
}

$("#previewBtn").addEventListener("click", ()=>{
  const menu = getActiveMenu();
  const popup = window.open("", "menuPreview", "width=640,height=720,resizable=yes,scrollbars=yes");
  if(!popup){
    toast("Popup okno je blokováno prohlížečem");
    return;
  }

  const tree = buildPreviewTree(menu.items);
  const rows = renderPreviewMenu(tree);

  popup.document.write(`<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Náhled menu – ${escapeHtml(menu.name)}</title>
</head>
<body style="margin:0;padding:20px;background:#f0f2f5;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1d2327;">
  <h1 style="margin:0 0 14px;font-size:22px;">Náhled: ${escapeHtml(menu.name)}</h1>
  <nav class="preview-nav">${rows || '<div style="color:#646970;">Menu je prázdné.</div>'}</nav>

  <style>
    .preview-nav{background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:0 12px;overflow:visible;}
    .preview-menu-list{list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:4px;}
    .preview-menu-item{position:relative;}
    .preview-link{display:block;padding:14px 12px;color:#1d2327;text-decoration:none;font-weight:600;white-space:nowrap;}
    .preview-link:hover{background:#f0f2f5;color:#2271b1;}
    .preview-submenu{display:none;position:absolute;left:0;top:100%;min-width:220px;background:#fff;border:1px solid #dcdcde;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.08);padding:6px;z-index:20;}
    .preview-submenu .preview-menu-list{display:block;}
    .preview-submenu .preview-link{padding:10px 12px;font-weight:500;}
    .preview-menu-item:hover > .preview-submenu{display:block;}
    .preview-submenu .preview-submenu{left:100%;top:0;}
  </style>
</body>
</html>`);
  popup.document.close();
  popup.focus();
});

// init
render();
