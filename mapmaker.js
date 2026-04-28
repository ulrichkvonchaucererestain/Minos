// ═══════════════════════════════════════════════════════════════════════
//  LABYRINTH OF MINOS — MAP MAKER  v2  (mapmaker.js)
//  Player Mode  : create / test / share / export custom rooms
//  Dev Mode     : obstacles, full palette, pool export, dev gallery
// ═══════════════════════════════════════════════════════════════════════
(function(){
'use strict';

/* ── CONSTANTS ─────────────────────────────────────────────────────── */
const MM_DEV_CODE  = 'MINOS2024';
const CANVAS_W     = 960;
const CANVAS_H     = 540;
const GRID_SIZE    = 16;
const STORAGE_KEY  = 'minoslm_maps';
const DEV_KEY      = 'minoslm_devmode';
const DEV_MAPS_KEY = 'minoslm_devmaps';   // dev gallery storage

/* ── STATE ─────────────────────────────────────────────────────────── */
let devMode     = false;
let mmOpen      = false;
let activeTool  = 'select';
let activeObjType  = null;
let activeObstType = null;   // obstacle sub-type
let activeSec   = 0;
let zoom        = 1.2;
let panX = 0, panY = 0;
let showGrid    = true;
let isDragging  = false;
let dragStart   = null;
let selectedEl  = null;
let hoverPos    = { x:0, y:0 };
let isPanning   = false;
let panOrigin   = null;
let testPlaying = false;
let debugMode   = false;
let devClickN   = 0;

// Current map being edited
let currentMap = freshMap();
let savedMaps  = [];
let devMaps    = [];   // maps authored by dev (shown in gallery)

function freshMap(){
  return {
    id: null,
    name: 'Untitled Room',
    author: 'Player',
    stageTarget: -1,
    sections:[
      {platforms:[{x:0,y:.92,w:.2,h:.08},{x:.78,y:.92,w:.22,h:.08}], items:[], obstacles:[], lore:'', hammers:[]},
      {platforms:[{x:0,y:.92,w:.2,h:.08},{x:.78,y:.92,w:.22,h:.08}], items:[], obstacles:[], lore:'', hammers:[]},
      {platforms:[
        {x:0,y:.92,w:.28,h:.08},{x:.32,y:.82,w:.18,h:.07},
        {x:.54,y:.92,w:.14,h:.08},{x:.72,y:.82,w:.14,h:.07},{x:.88,y:.92,w:.12,h:.08}
      ], items:[], obstacles:[], lore:'', hammers:[]}
    ],
    puzzle:{q:'',opts:['A) ','B) ','C) ','D) '],ans:'A',hint:'',need:''},
    createdAt: Date.now(),
    shared: false,
    devCreated: false
  };
}

/* ── TOOL DEFINITIONS ──────────────────────────────────────────────── */
const TOOLS_PLAYER = [
  {id:'select',   icon:'⬡', label:'Select',    key:'V'},
  {id:'platform', icon:'▬', label:'Platform',   key:'P'},
  {id:'fake',     icon:'⬢', label:'Fake Plat',  key:'F'},
  {id:'item',     icon:'✦', label:'Place Item', key:'I'},
  {id:'obstacle', icon:'⚡', label:'Obstacle',  key:'O'},
  {id:'eraser',   icon:'✕', label:'Erase',      key:'E'},
  {id:'pan',      icon:'✋', label:'Pan',        key:'H'},
];
const TOOLS_DEV = [
  {id:'select',   icon:'⬡', label:'Select',    key:'V'},
  {id:'platform', icon:'▬', label:'Platform',   key:'P'},
  {id:'fake',     icon:'⬢', label:'Fake Plat',  key:'F'},
  {id:'hammer',   icon:'🔨', label:'Hammer',    key:'G', dev:true},
  {id:'item',     icon:'✦', label:'Place Item', key:'I'},
  {id:'obstacle', icon:'⚡', label:'Obstacle',  key:'O'},
  {id:'eraser',   icon:'✕', label:'Erase',      key:'E'},
  {id:'pan',      icon:'✋', label:'Pan',        key:'H'},
];

/* ── OBSTACLE CATALOGUE ────────────────────────────────────────────── */
// All obstacles available to PLAYERS (no dev gate needed for basic ones)
const OBSTACLES_ALL = [
  {id:'spike_up',   label:'Spikes',       icon:'🔺', color:'#cc3333', desc:'Instant death if touched from above'},
  {id:'spike_down', label:'Stalactite',   icon:'🔻', color:'#cc3333', desc:'Hanging ceiling spikes'},
  {id:'lava',       label:'Lava Pool',    icon:'🌋', color:'#ff5500', desc:'Kills on contact. Placed on floor.'},
  {id:'saw',        label:'Spinning Saw', icon:'⚙',  color:'#aaaaaa', desc:'Rotates in place, instant kill'},
  {id:'arrow',      label:'Arrow Trap',   icon:'➡',  color:'#aa8830', desc:'Fires arrows horizontally'},
  {id:'pit',        label:'Death Pit',    icon:'⬛', color:'#222233', desc:'Invisible floor gap — player falls'},
];
// Dev-only extras (placeable only in dev mode)
const OBSTACLES_DEV_EXTRA = [
  {id:'boulder_trigger', label:'Boulder Trigger', icon:'🪨', color:'#7a5030', desc:'[DEV] Triggers rolling boulder on entry'},
  {id:'moving_plat',     label:'Moving Platform', icon:'↔',  color:'#2255aa', desc:'[DEV] Platform that oscillates horizontally'},
];
function getObstacles(){ return devMode ? [...OBSTACLES_ALL, ...OBSTACLES_DEV_EXTRA] : OBSTACLES_ALL; }

/* ── ITEM PALETTE ──────────────────────────────────────────────────── */
const ITEMS_BASIC = [
  {id:'scroll_c',  label:'Scroll',  icon:'📜', rp:true },
  {id:'torch_c',   label:'Torch',   icon:'🔦', rp:true },
  {id:'gem_d',     label:'Gem',     icon:'💎', rp:false},
  {id:'coin_d',    label:'Coin',    icon:'🪙', rp:false},
  {id:'key_b',     label:'Key',     icon:'🗝️', rp:true },
];
const ITEMS_DEV = [
  ...ITEMS_BASIC,
  {id:'crown_b',   label:'Crown',   icon:'👑', rp:true },
  {id:'skull_b',   label:'Skull',   icon:'💀', rp:false},
  {id:'compass_b', label:'Compass', icon:'🧭', rp:true },
  {id:'map_b',     label:'Map',     icon:'🗺️', rp:true },
  {id:'rune_a',    label:'Rune',    icon:'🔮', rp:true },
  {id:'feather_b', label:'Feather', icon:'🪶', rp:false},
  {id:'fossil_b',  label:'Fossil',  icon:'🐚', rp:false},
];

/* ── CANVAS ────────────────────────────────────────────────────────── */
let canvas, ctx;

/* ══════════════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════════════ */
function init(){
  loadDevMode();
  loadMaps();
  buildHTML();
  canvas = document.getElementById('mm-editor-canvas');
  ctx    = canvas.getContext('2d');
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  bindEvents();
  render();
}

/* ── BUILD HTML ─────────────────────────────────────────────────────── */
function buildHTML(){
  // CSS is now merged into style.css — no separate injection needed

  const overlay = document.createElement('div');
  overlay.id = 'mapmaker-overlay';
  overlay.innerHTML = buildOverlayHTML();
  document.body.appendChild(overlay);

  buildToolGrid();
  buildObjGrid();
  buildObstacleGrid();
  refreshMapList();
  refreshDevGallery();
}

function buildOverlayHTML(){
  return `
  <!-- TOP BAR -->
  <div id="mm-topbar">
    <div class="mm-title">🗺 MAP MAKER</div>
    <div class="mm-tab-bar" id="mm-tabs">
      <div class="mm-tab active" data-tab="editor"    onclick="MM.switchTab('editor')">✏ Editor</div>
      <div class="mm-tab"        data-tab="browse"    onclick="MM.switchTab('browse')">📂 My Maps</div>
      <div class="mm-tab"        data-tab="community" onclick="MM.switchTab('community')">🌐 Community</div>
      ${devMode?`<div class="mm-tab" data-tab="devgallery" onclick="MM.switchTab('devgallery')">🏛 Dev Gallery <span class="dev-badge">DEV</span></div>`:''}
      ${devMode?`<div class="mm-tab" data-tab="devtools"   onclick="MM.switchTab('devtools')">🔧 Dev Tools <span class="dev-badge">DEV</span></div>`:''}
    </div>
    <div id="mm-topbar-right">
      <button class="mm-btn primary"  onclick="MM.newMap()">+ New</button>
      <button class="mm-btn"          onclick="MM.saveMap()">💾 Save</button>
      <button class="mm-btn"          onclick="MM.exportFile()">📁 Save File</button>
      <button class="mm-btn"          onclick="MM.testPlay()">▶ Test</button>
      ${devMode?`<button class="mm-btn dev-only" onclick="MM.markDevMap()">🏛 Publish as Dev</button>`:''}
      ${devMode?`<button class="mm-btn dev-only" onclick="MM.exportToPool()">⬆ Export to Pool</button>`:''}
      <button class="mm-btn"          onclick="MM.shareMap()">📤 Share</button>
      <button class="mm-btn danger"   onclick="MM.close()">✕ Close</button>
    </div>
  </div>

  <!-- DEV MODE STRIP -->
  <div id="dev-mode-strip" class="${devMode?'visible':''}">
    ⚠ DEVELOPER MODE ACTIVE — Advanced tools enabled — Changes to POOLS affect all players
  </div>

  <!-- TEST BANNER -->
  <div id="mm-test-banner">
    <span class="test-label">▶ TEST PLAY</span>
    <span>Playing your map — ESC or button to stop</span>
    <button class="mm-btn danger" style="margin-left:auto" onclick="MM.stopTest()">■ Stop Test</button>
  </div>

  <!-- ══ EDITOR TAB ══ -->
  <div id="mm-tab-editor" class="mm-tab-content" style="display:flex;flex:1;overflow:hidden;flex-direction:column">
    <!-- SECTION TABS -->
    <div id="mm-section-tabs">
      <div class="mm-sec-tab active" onclick="MM.switchSec(0)">§ Hint Room</div>
      <div class="mm-sec-tab"        onclick="MM.switchSec(1)">§ Puzzle Room</div>
      <div class="mm-sec-tab"        onclick="MM.switchSec(2)">§ Door Room</div>
      <div class="mm-sec-tab" style="margin-left:auto" onclick="MM.switchSec(3)">📋 Quiz / Lore</div>
    </div>

    <!-- EDITOR BODY -->
    <div id="mm-body">
      <!-- SIDEBAR -->
      <div id="mm-sidebar">

        <div class="mm-sidebar-section">
          <div class="mm-sidebar-label">🔧 Tools</div>
          <div class="mm-tool-grid" id="mm-tool-grid"></div>
        </div>

        <!-- ITEM PALETTE (shown when item tool active) -->
        <div class="mm-sidebar-section" id="mm-item-section" style="display:none">
          <div class="mm-sidebar-label">✦ Items</div>
          <div class="mm-obj-grid" id="mm-obj-grid"></div>
        </div>

        <!-- OBSTACLE PALETTE (shown when obstacle tool active) -->
        <div class="mm-sidebar-section" id="mm-obst-section" style="display:none">
          <div class="mm-sidebar-label">⚡ Obstacles</div>
          <div class="mm-obst-grid" id="mm-obst-grid"></div>
          <div id="mm-obst-desc" style="font-size:.5rem;color:rgba(212,168,67,.5);padding:4px 2px;line-height:1.5;min-height:28px"></div>
        </div>

        <!-- PROPERTIES -->
        <div class="mm-sidebar-section" style="flex:1;overflow:hidden;display:flex;flex-direction:column">
          <div class="mm-sidebar-label">⚙ Properties</div>
          <div id="mm-props">
            <div style="font-size:.55rem;color:rgba(212,168,67,.3);text-align:center;padding:12px">Select an element to edit</div>
          </div>
        </div>

        <!-- MAP INFO -->
        <div class="mm-sidebar-section" style="padding:8px 12px">
          <div class="mm-sidebar-label">📐 Map Info</div>
          <div class="mm-prop-row">
            <label class="mm-prop-label">Name</label>
            <input class="mm-prop-input" style="width:120px" id="mm-map-name"
                   value="Untitled Room" onchange="MM.updateMapName(this.value)">
          </div>
          <div class="mm-prop-row">
            <label class="mm-prop-label">Author</label>
            <input class="mm-prop-input" style="width:120px" id="mm-map-author"
                   value="Player" onchange="MM.updateAuthor(this.value)">
          </div>
          <div class="mm-prop-row">
            <label class="mm-prop-label">Stage Slot</label>
            <select class="mm-prop-select" style="width:120px" id="mm-stage-target"
                    onchange="MM.updateStageTarget(this.value)">
              <option value="-1">Custom Only</option>
              ${[...Array(8)].map((_,i)=>`<option value="${i}">Stage ${i+1}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- CANVAS AREA -->
      <div id="mm-canvas-wrap">
        <div id="mm-canvas-toolbar">
          <span class="mm-zoom-label">ZOOM</span>
          <button class="mm-btn" style="padding:2px 8px" onclick="MM.zoomOut()">−</button>
          <span class="mm-zoom-val" id="mm-zoom-val">120%</span>
          <button class="mm-btn" style="padding:2px 8px" onclick="MM.zoomIn()">+</button>
          <button class="mm-btn" style="padding:2px 8px;margin-left:6px" onclick="MM.resetZoom()">⌂</button>
          <label class="mm-grid-toggle">
            <input type="checkbox" id="mm-grid-chk" checked onchange="MM.toggleGrid(this.checked)"> Grid
          </label>
          <label class="mm-grid-toggle">
            <input type="checkbox" id="mm-snap-chk" checked> Snap
          </label>
          <span class="mm-coords" id="mm-coords">x:— y:—</span>
        </div>
        <div id="mm-canvas-container">
          <canvas id="mm-editor-canvas"></canvas>
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <div id="mm-right-panel">
        <div class="mm-sidebar-section">
          <div class="mm-sidebar-label">📋 Elements</div>
        </div>
        <div class="mm-map-list" id="mm-element-list">
          <div class="mm-empty-state">
            <div class="mm-empty-icon">🏗</div>
            <p>Draw on canvas<br>to place elements</p>
          </div>
        </div>
        <div class="mm-map-actions">
          <button class="mm-btn danger" style="width:100%" onclick="MM.deleteSelected()">🗑 Delete Selected</button>
          <button class="mm-btn"        style="width:100%" onclick="MM.clearSection()">⬛ Clear Section</button>
        </div>
      </div>
    </div>

    <!-- QUIZ/LORE PANEL -->
    <div id="mm-quiz-section" style="display:none;flex:1;overflow-y:auto;padding:20px">
      <div style="max-width:640px;margin:0 auto">
        <div style="font-size:.7rem;color:var(--gold);letter-spacing:2px;margin-bottom:16px">📋 QUIZ & LORE</div>
        <div id="mm-quiz-panel">
          <div class="mm-quiz-row">
            <label>LORE TEXT (Hint Room clue displayed to player)</label>
            <input type="text" id="mm-lore" value="" oninput="MM.updateLore(this.value)"
                   placeholder="e.g. Runes: 'Two numbers add to 5 and multiply to 6.'">
          </div>
          <div class="mm-quiz-row" style="margin-top:16px">
            <label>PUZZLE QUESTION</label>
            <input type="text" id="mm-q" value="" oninput="MM.updateQ('q',this.value)">
          </div>
          <div class="mm-quiz-row">
            <label>HINT (shown on wrong answer)</label>
            <input type="text" id="mm-hint" value="" oninput="MM.updateQ('hint',this.value)">
          </div>
          <div class="mm-quiz-row">
            <label>REQUIRED ITEM ID (leave blank if none)</label>
            <input type="text" id="mm-need" value="" oninput="MM.updateQ('need',this.value)"
                   placeholder="e.g. scroll_c">
          </div>
          <div class="mm-quiz-row" style="margin-top:12px">
            <label>ANSWER OPTIONS — select the correct one</label>
            ${[0,1,2,3].map(i=>`
            <div class="mm-opt-row">
              <input type="radio" name="mm-ans" value="${String.fromCharCode(65+i)}"
                     onchange="MM.updateQ('ans',this.value)">
              <input type="text" id="mm-opt-${i}" value=""
                     oninput="MM.updateOpt(${i},this.value)"
                     placeholder="Option ${String.fromCharCode(65+i)}">
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div><!-- /editor tab -->

  <!-- ══ BROWSE TAB ══ -->
  <div id="mm-tab-browse" class="mm-tab-content" style="display:none;flex:1;overflow:hidden">
    <div style="display:flex;height:100%">
      <div style="flex:1;overflow-y:auto;padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div style="font-size:.7rem;color:var(--gold);letter-spacing:2px">MY SAVED MAPS</div>
          <div style="display:flex;gap:6px">
            <button class="mm-btn primary" onclick="MM.newMap()">+ New Map</button>
            <button class="mm-btn" onclick="MM.importFilePrompt()">📁 Load File</button>
          </div>
        </div>
        <div id="mm-my-maps-list"></div>
      </div>
    </div>
  </div>

  <!-- ══ COMMUNITY TAB ══ -->
  <div id="mm-tab-community" class="mm-tab-content" style="display:none;flex:1;overflow:hidden">
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;opacity:.6">
      <div style="font-size:3rem">🌐</div>
      <div style="font-family:Cinzel,serif;font-size:.8rem;color:var(--gold);letter-spacing:3px">COMMUNITY MAPS</div>
      <div style="font-size:.65rem;color:var(--text-dim);text-align:center;max-width:340px;line-height:1.8">
        Share maps with a Base64 code, or import codes from others.
      </div>
      <div style="display:flex;gap:10px">
        <button class="mm-btn primary" onclick="MM.shareMap()">📤 Share Current Map</button>
        <button class="mm-btn" onclick="MM.importPrompt()">📥 Import Share Code</button>
      </div>
    </div>
  </div>

  <!-- ══ DEV GALLERY TAB ══ -->
  <div id="mm-tab-devgallery" class="mm-tab-content" style="display:none;flex:1;overflow:hidden;flex-direction:column">
    <div style="padding:16px 20px;border-bottom:1px solid rgba(200,80,0,.25);background:rgba(40,10,0,.4)">
      <div style="font-size:.65rem;color:#ff8866;letter-spacing:3px;margin-bottom:6px">🏛 DEVELOPER MAP GALLERY</div>
      <div style="font-size:.58rem;color:var(--text-dim);line-height:1.7">
        Maps published by the developer using <strong style="color:#ffaa66">🏛 Publish as Dev</strong>.
        These are shown here as reference / official layouts. Players can load them as templates.
      </div>
    </div>
    <div style="flex:1;overflow-y:auto;padding:16px" id="mm-devgallery-list"></div>
  </div>

  <!-- ══ DEV TOOLS TAB ══ -->
  <div id="mm-tab-devtools" class="mm-tab-content" style="display:none;flex:1;overflow:hidden">
    <div style="padding:20px;overflow-y:auto;height:100%;box-sizing:border-box">
      <div style="font-size:.65rem;color:var(--crimson);letter-spacing:2px;margin-bottom:16px">⚠ DEVELOPER TOOLS</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="mm-devbox">
          <div class="mm-devbox-title">POOL INJECTION</div>
          <p class="mm-devbox-desc">Export current map as copy-paste code for <code>POOLS</code> in script.js.</p>
          <button class="mm-btn dev-only" onclick="MM.generatePoolCode()">⬆ Generate Pool Code</button>
        </div>
        <div class="mm-devbox">
          <div class="mm-devbox-title">ELEMENT PACK</div>
          <p class="mm-devbox-desc">Bundle items + obstacles for future distribution updates.</p>
          <button class="mm-btn dev-only" onclick="MM.exportElementPack()">📦 Export Element Pack</button>
        </div>
        <div class="mm-devbox">
          <div class="mm-devbox-title">JSON EDITOR</div>
          <p class="mm-devbox-desc">Edit raw map JSON directly.</p>
          <textarea id="mm-raw-json" style="width:100%;min-height:100px;background:#0a0408;border:1px solid #cc3300;color:#ffaa66;font-family:monospace;font-size:.58rem;padding:8px;box-sizing:border-box;resize:vertical"></textarea>
          <button class="mm-btn dev-only" style="margin-top:8px" onclick="MM.applyRawJSON()">✓ Apply JSON</button>
        </div>
        <div class="mm-devbox">
          <div class="mm-devbox-title">PLATFORM DEBUGGER</div>
          <p class="mm-devbox-desc">Toggle collision bounds and coordinate overlay.</p>
          <label style="font-size:.6rem;color:#ffaa66;cursor:pointer">
            <input type="checkbox" id="mm-debug-chk" onchange="MM.toggleDebug(this.checked)"> Show collision bounds
          </label>
        </div>
      </div>
      <div style="margin-top:20px;background:rgba(0,0,0,.4);border:1px solid rgba(212,168,67,.15);padding:16px">
        <div style="font-size:.65rem;color:var(--gold-dark);letter-spacing:2px;margin-bottom:12px">GENERATED POOL CODE</div>
        <pre id="mm-pool-output" style="font-family:monospace;font-size:.58rem;color:#88ccff;white-space:pre-wrap;word-break:break-all;max-height:240px;overflow-y:auto;background:#020408;padding:12px;border:1px solid #1a3a5a">// Click "Generate Pool Code" above</pre>
        <button class="mm-btn" style="margin-top:8px" onclick="MM.copyPoolCode()">📋 Copy</button>
      </div>
    </div>
  </div>

  <!-- ══ MODALS ══ -->
  <div class="mm-modal-bg" id="mm-share-modal">
    <div class="mm-modal">
      <button class="mm-modal-close" onclick="MM.closeModal('mm-share-modal')">✕</button>
      <div class="mm-modal-title">📤 Share Map</div>
      <div class="mm-field">
        <label>Share Code — copy and send to others</label>
        <textarea class="share-code" id="mm-share-code" readonly rows="5"></textarea>
      </div>
      <div class="mm-field">
        <label>Map Name</label>
        <input type="text" id="mm-share-name" readonly>
      </div>
      <div class="mm-modal-actions">
        <button class="mm-btn primary" onclick="MM.copyShareCode()">📋 Copy Code</button>
        <button class="mm-btn" onclick="MM.closeModal('mm-share-modal')">Close</button>
      </div>
    </div>
  </div>

  <div class="mm-modal-bg" id="mm-import-modal">
    <div class="mm-modal">
      <button class="mm-modal-close" onclick="MM.closeModal('mm-import-modal')">✕</button>
      <div class="mm-modal-title">📥 Import Share Code</div>
      <div class="mm-field">
        <label>Paste Share Code</label>
        <textarea id="mm-import-code" placeholder="Paste map code here..." rows="5"></textarea>
      </div>
      <div class="mm-modal-actions">
        <button class="mm-btn primary" onclick="MM.doImport()">✓ Import</button>
        <button class="mm-btn" onclick="MM.closeModal('mm-import-modal')">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Hidden file input for loading .json files -->
  <input type="file" id="mm-file-input" accept=".json" style="display:none" onchange="MM.loadFromFile(this)">

  <div class="mm-modal-bg" id="mm-pool-modal">
    <div class="mm-modal" style="max-width:640px">
      <button class="mm-modal-close" onclick="MM.closeModal('mm-pool-modal')">✕</button>
      <div class="mm-modal-title">⬆ Export to Pool</div>
      <div class="mm-field">
        <label>Stage Target</label>
        <select id="mm-pool-stage">
          ${[...Array(8)].map((_,i)=>`<option value="${i}">Stage ${i+1} — ${['Entry Halls','Pit Corridors','Stone Halls','Cliff Paths','Ancient Ruins','Forge Depths','Sanctum','Throne of Minos'][i]}</option>`).join('')}
        </select>
      </div>
      <div class="mm-field">
        <label>Generated Code</label>
        <textarea id="mm-pool-code-out" style="font-family:monospace;font-size:.6rem;color:#88ccff;background:#020408;border:1px solid #1a3a5a;min-height:160px" readonly></textarea>
      </div>
      <div class="mm-modal-actions">
        <button class="mm-btn primary" onclick="MM.regeneratePool()">↺ Regenerate</button>
        <button class="mm-btn" onclick="navigator.clipboard.writeText(document.getElementById('mm-pool-code-out').value)">📋 Copy</button>
        <button class="mm-btn" onclick="MM.closeModal('mm-pool-modal')">Close</button>
      </div>
    </div>
  </div>

  <!-- STATUS BAR -->
  <div id="mm-statusbar">
    <div class="mm-status-item">Platforms: <span id="mm-stat-plat">0</span></div>
    <div class="mm-status-item">Items: <span id="mm-stat-items">0</span></div>
    <div class="mm-status-item">Obstacles: <span id="mm-stat-obst">0</span></div>
    <div class="mm-status-item">Tool: <span id="mm-stat-tool">select</span></div>
    <div class="mm-status-item" style="margin-left:auto">
      ${devMode?'<span style="color:#ff6644">⚠ DEV MODE</span>':''}
      <span style="color:rgba(212,168,67,.3);margin-left:12px">Saved: <span id="mm-stat-saved">never</span></span>
    </div>
  </div>
  `;
}

/* ── GRID BUILDERS ─────────────────────────────────────────────────── */
function buildToolGrid(){
  const tools = devMode ? TOOLS_DEV : TOOLS_PLAYER;
  const g = document.getElementById('mm-tool-grid');
  if(!g) return;
  g.innerHTML = tools.map(t=>`
    <div class="mm-tool${t.dev?' dev-tool':''}${activeTool===t.id?' active':''}"
         onclick="MM.setTool('${t.id}')" title="${t.label} [${t.key}]">
      <div class="mm-tool-icon">${t.icon}</div>
      <div class="mm-tool-label">${t.label}</div>
    </div>`).join('');
}

function buildObjGrid(){
  const items = devMode ? ITEMS_DEV : ITEMS_BASIC;
  const g = document.getElementById('mm-obj-grid');
  if(!g) return;
  g.innerHTML = items.map(it=>`
    <div class="mm-obj${activeObjType===it.id?' active':''}"
         onclick="MM.setActiveObj('${it.id}')" title="${it.label}">
      <div class="mm-obj-icon">${it.icon}</div>
      <div class="mm-obj-label">${it.label}</div>
    </div>`).join('');
}

function buildObstacleGrid(){
  const g = document.getElementById('mm-obst-grid');
  if(!g) return;
  g.innerHTML = getObstacles().map(o=>`
    <div class="mm-obst-card${activeObstType===o.id?' active':''}"
         onclick="MM.setObstacle('${o.id}')"
         data-desc="${o.desc}">
      <div class="mm-obst-icon" style="color:${o.color}">${o.icon}</div>
      <div class="mm-obst-label">${o.label}</div>
    </div>`).join('');
  // Hover descriptions
  g.querySelectorAll('.mm-obst-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>{
      const d=document.getElementById('mm-obst-desc');
      if(d) d.textContent=el.dataset.desc;
    });
    el.addEventListener('mouseleave',()=>{
      const d=document.getElementById('mm-obst-desc');
      if(d) d.textContent='';
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════
   RENDER
══════════════════════════════════════════════════════════════════════ */
function render(){
  if(!ctx){ requestAnimationFrame(render); return; }
  const W=CANVAS_W, H=CANVAS_H;
  ctx.clearRect(0,0,W,H);

  // Background
  ctx.fillStyle='#050305'; ctx.fillRect(0,0,W,H);
  const themes = typeof STAGE_THEMES!=='undefined' ? STAGE_THEMES : [];
  const th = themes[currentMap.stageTarget]||{color:'#3a2010',accentColor:'#d4a843'};
  ctx.fillStyle=th.color+'18'; ctx.fillRect(0,0,W,H);

  // Grid
  if(showGrid){
    const gs=GRID_SIZE*zoom;
    const ox=((panX%gs)+gs)%gs, oy=((panY%gs)+gs)%gs;
    ctx.strokeStyle='rgba(212,168,67,0.07)'; ctx.lineWidth=0.5;
    for(let x=ox;x<W;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=oy;y<H;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.strokeStyle='rgba(212,168,67,0.14)';
    const mg=gs*5, mox=((panX%mg)+mg)%mg, moy=((panY%mg)+mg)%mg;
    for(let x=mox;x<W;x+=mg){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=moy;y<H;y+=mg){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  }

  // Canvas boundary
  ctx.strokeStyle='rgba(212,168,67,0.25)'; ctx.lineWidth=1.5;
  ctx.strokeRect(panX,panY,W*zoom,H*zoom);
  ctx.fillStyle='rgba(212,168,67,0.05)';
  ctx.fillRect(panX,panY+H*0.88*zoom,W*zoom,H*0.12*zoom);

  const secIdx = activeSec > 2 ? 0 : activeSec;
  const sec = currentMap.sections[secIdx];

  // PLATFORMS
  sec.platforms.forEach((p,idx)=>{
    drawPlatformOnCanvas(p,idx);
  });

  // OBSTACLES
  (sec.obstacles||[]).forEach((o,idx)=>{
    drawObstacleOnCanvas(o,idx);
  });

  // ITEMS
  sec.items.forEach((item,idx)=>{
    const ix=panX+item.x*W*zoom, iy=panY+item.y*H*zoom;
    const isSel=selectedEl?.type==='item'&&selectedEl?.idx===idx;
    ctx.font=`${Math.max(12,18*zoom)}px serif`;
    ctx.textAlign='center';
    ctx.fillText(item.icon,ix,iy);
    ctx.fillStyle=item.rp?'rgba(255,215,0,.8)':'rgba(150,180,255,.8)';
    ctx.font=`${Math.max(7,8*zoom)}px Cinzel,serif`;
    ctx.fillText(item.label,ix,iy+13*zoom);
    if(isSel){
      ctx.strokeStyle='#44aaff'; ctx.lineWidth=1.5;
      ctx.strokeRect(ix-14*zoom,iy-16*zoom,28*zoom,28*zoom);
    }
  });

  // HAMMERS (dev)
  if(devMode&&sec.hammers){
    sec.hammers.forEach((h,idx)=>{
      const hx=panX+h.x*W*zoom, hy=panY+h.y*H*zoom;
      const isSel=selectedEl?.type==='hammer'&&selectedEl?.idx===idx;
      ctx.fillStyle='#777'; ctx.fillRect(hx-12*zoom,hy-8*zoom,24*zoom,16*zoom);
      ctx.strokeStyle=isSel?'#ff6600':'#444'; ctx.lineWidth=1;
      ctx.strokeRect(hx-12*zoom,hy-8*zoom,24*zoom,16*zoom);
      ctx.font=`${Math.max(10,14*zoom)}px serif`; ctx.textAlign='center';
      ctx.fillText('🔨',hx,hy+4);
    });
  }

  // DRAG PREVIEW
  if(isDragging&&activeTool!=='select'&&activeTool!=='pan'&&dragStart&&
     (activeTool==='platform'||activeTool==='fake')){
    const snap=document.getElementById('mm-snap-chk')?.checked!==false;
    let x1=Math.min(dragStart.canvasX,hoverPos.canvasX);
    let y1=Math.min(dragStart.canvasY,hoverPos.canvasY);
    let x2=Math.max(dragStart.canvasX,hoverPos.canvasX);
    let y2=Math.max(dragStart.canvasY,hoverPos.canvasY);
    if(snap){x1=snapV(x1);y1=snapV(y1);x2=snapV(x2);y2=snapV(y2);}
    ctx.fillStyle=activeTool==='fake'?'rgba(200,60,30,.3)':'rgba(60,150,255,.25)';
    ctx.fillRect(x1,y1,x2-x1,y2-y1);
    ctx.strokeStyle=activeTool==='fake'?'#ff6633':'#44aaff';
    ctx.lineWidth=1.5; ctx.setLineDash([4,4]);
    ctx.strokeRect(x1,y1,x2-x1,y2-y1); ctx.setLineDash([]);
    const pw=((x2-x1)/(W*zoom)).toFixed(2), ph2=((y2-y1)/(H*zoom)).toFixed(2);
    ctx.fillStyle='#fff'; ctx.font=`${Math.max(9,10*zoom)}px monospace`; ctx.textAlign='center';
    ctx.fillText(`w:${pw} h:${ph2}`,(x1+x2)/2,y1-5);
  }

  ctx.textAlign='left';
  updateStatusBar();
  requestAnimationFrame(render);
}

function drawPlatformOnCanvas(p, idx){
  const W=CANVAS_W, H=CANVAS_H;
  const rx=panX+p.x*W*zoom, ry=panY+p.y*H*zoom;
  const rw=p.w*W*zoom, rh=p.h*H*zoom;
  const isSel=selectedEl?.type==='platform'&&selectedEl?.idx===idx;

  if(p.fake){
    ctx.fillStyle='#2c1a1a'; ctx.fillRect(rx,ry,rw,rh);
    ctx.fillStyle='rgba(212,168,67,.4)'; ctx.fillRect(rx,ry,rw,2);
    ctx.strokeStyle='rgba(180,60,30,.7)'; ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(rx+rw*0.3,ry);ctx.lineTo(rx+rw*0.2,ry+rh);
    ctx.moveTo(rx+rw*0.7,ry);ctx.lineTo(rx+rw*0.8,ry+rh);
    ctx.stroke();
    if(rw>30){
      ctx.fillStyle='rgba(255,100,60,.7)';
      ctx.font=`${Math.max(7,9*zoom)}px Cinzel,serif`; ctx.textAlign='center';
      ctx.fillText('FAKE',rx+rw/2,ry+rh/2+3);
    }
  } else {
    const sg=ctx.createLinearGradient(rx,ry,rx,ry+rh);
    sg.addColorStop(0,'#3a2628');sg.addColorStop(.3,'#2c1e1e');sg.addColorStop(1,'#180e0e');
    ctx.fillStyle=sg; ctx.fillRect(rx,ry,rw,rh);
    ctx.fillStyle='rgba(212,168,67,.55)'; ctx.fillRect(rx,ry,rw,2);
    ctx.fillStyle='rgba(90,65,35,.8)'; ctx.fillRect(rx,ry+2,rw,2);
    ctx.fillStyle='rgba(0,0,0,.4)';
    ctx.fillRect(rx,ry,2,rh); ctx.fillRect(rx+rw-2,ry,2,rh);
  }

  if(isSel){
    ctx.strokeStyle='#ffd700'; ctx.lineWidth=2;
    ctx.strokeRect(rx-1,ry-1,rw+2,rh+2);
    ctx.fillStyle='#ffd700';
    [[0,0],[1,0],[0,1],[1,1]].forEach(([hx,hy2])=>ctx.fillRect(rx+hx*rw-3,ry+hy2*rh-3,6,6));
  }

  if(debugMode){
    ctx.strokeStyle='rgba(0,255,0,.5)'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.strokeRect(rx,ry,rw,rh); ctx.setLineDash([]);
    ctx.fillStyle='rgba(0,255,0,.8)'; ctx.font='8px monospace'; ctx.textAlign='left';
    ctx.fillText(`${p.x.toFixed(2)},${p.y.toFixed(2)}`,rx+2,ry+9);
  }
}

function drawObstacleOnCanvas(o, idx){
  const W=CANVAS_W, H=CANVAS_H;
  const ox2=panX+o.x*W*zoom, oy2=panY+o.y*H*zoom;
  const isSel=selectedEl?.type==='obstacle'&&selectedEl?.idx===idx;
  const def=getObstacles().find(d=>d.id===o.type)||{icon:'⚡',color:'#ff4400',label:'?'};

  ctx.save();
  ctx.textAlign='center';

  switch(o.type){
    case 'spike_up':
    case 'spike_down':{
      const w=(o.w||0.06)*W*zoom, h2=(o.h||0.04)*H*zoom;
      const bx=ox2-w/2, by=o.type==='spike_up'?oy2-h2:oy2;
      const tipY=o.type==='spike_up'?oy2:oy2+h2;
      // Draw spike row
      const count=Math.max(1,Math.round(w/10));
      const sw=w/count;
      ctx.fillStyle='#cc2222';
      for(let i=0;i<count;i++){
        ctx.beginPath();
        if(o.type==='spike_up'){
          ctx.moveTo(bx+i*sw,by+h2); ctx.lineTo(bx+i*sw+sw/2,by); ctx.lineTo(bx+(i+1)*sw,by+h2);
        } else {
          ctx.moveTo(bx+i*sw,by); ctx.lineTo(bx+i*sw+sw/2,by+h2); ctx.lineTo(bx+(i+1)*sw,by);
        }
        ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle='#ff4444'; ctx.lineWidth=0.5;
      break;
    }
    case 'lava':{
      const lw=(o.w||0.12)*W*zoom, lh2=(o.h||0.03)*H*zoom;
      const lx=ox2-lw/2, ly=oy2-lh2;
      const lg=ctx.createLinearGradient(lx,ly,lx,ly+lh2);
      lg.addColorStop(0,'#ff5500');lg.addColorStop(1,'#880000');
      ctx.fillStyle=lg; ctx.fillRect(lx,ly,lw,lh2);
      // Bubble animation using time
      const t=Date.now()*0.003;
      ctx.fillStyle='rgba(255,150,0,.6)';
      [.2,.5,.8].forEach((bp,bi)=>{
        const bx2=lx+lw*bp, bySin=ly+Math.sin(t+bi*2)*3;
        ctx.beginPath(); ctx.arc(bx2,bySin,3*zoom,0,Math.PI*2); ctx.fill();
      });
      break;
    }
    case 'saw':{
      const r=(o.r||0.025)*Math.min(W,H)*zoom;
      const t2=Date.now()*0.005;
      ctx.save(); ctx.translate(ox2,oy2); ctx.rotate(t2);
      ctx.fillStyle='#aaaaaa';
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
      const teeth=12;
      ctx.fillStyle='#dddddd';
      for(let i=0;i<teeth;i++){
        const a=(i/teeth)*Math.PI*2;
        ctx.save(); ctx.rotate(a);
        ctx.fillRect(r-2,-2,6,4); ctx.restore();
      }
      ctx.strokeStyle='#444'; ctx.lineWidth=1; ctx.stroke();
      ctx.restore();
      break;
    }
    case 'arrow':{
      const sz=16*zoom;
      ctx.fillStyle='#aa8830';
      // Arrow body
      ctx.fillRect(ox2-sz*0.6,oy2-2*zoom,sz,4*zoom);
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(ox2+sz*0.5,oy2-6*zoom);
      ctx.lineTo(ox2+sz,oy2); ctx.lineTo(ox2+sz*0.5,oy2+6*zoom);
      ctx.closePath(); ctx.fill();
      // Animated "firing" pulse
      const pulse=0.5+0.5*Math.sin(Date.now()*0.008);
      ctx.strokeStyle=`rgba(255,200,60,${pulse*0.7})`; ctx.lineWidth=1;
      ctx.strokeRect(ox2-sz*0.6-2,oy2-8*zoom,sz+sz*0.5+6,16*zoom);
      break;
    }
    case 'pit':{
      const pw=(o.w||0.1)*W*zoom;
      // Dark chasm
      ctx.fillStyle='rgba(0,0,0,.85)'; ctx.fillRect(ox2-pw/2,oy2,pw,20*zoom);
      ctx.strokeStyle='rgba(80,40,200,.4)'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.strokeRect(ox2-pw/2,oy2,pw,20*zoom); ctx.setLineDash([]);
      ctx.fillStyle='rgba(80,40,200,.5)'; ctx.font=`${Math.max(8,10*zoom)}px Cinzel,serif`;
      ctx.fillText('VOID',ox2-8*zoom,oy2+14*zoom);
      break;
    }
    case 'boulder_trigger':{
      ctx.fillStyle='rgba(100,60,20,.4)';
      ctx.strokeStyle='#7a5030'; ctx.lineWidth=1.5; ctx.setLineDash([5,5]);
      ctx.strokeRect(ox2-20*zoom,oy2-20*zoom,40*zoom,40*zoom); ctx.setLineDash([]);
      ctx.font=`${Math.max(10,14*zoom)}px serif`; ctx.fillText('🪨',ox2-7,oy2+5);
      ctx.fillStyle='#cc8840'; ctx.font=`${Math.max(6,7*zoom)}px Cinzel,serif`;
      ctx.fillText('TRIGGER',ox2-12*zoom,oy2+18*zoom);
      break;
    }
    case 'moving_plat':{
      const mpw=(o.w||0.1)*W*zoom, mph=(o.h||0.04)*H*zoom;
      const anim=Math.sin(Date.now()*0.002)*(o.range||0.1)*W*zoom;
      const mpx=ox2+anim-mpw/2, mpy=oy2-mph/2;
      const sg2=ctx.createLinearGradient(mpx,mpy,mpx,mpy+mph);
      sg2.addColorStop(0,'#2255aa');sg2.addColorStop(1,'#112255');
      ctx.fillStyle=sg2; ctx.fillRect(mpx,mpy,mpw,mph);
      ctx.fillStyle='rgba(100,160,255,.7)'; ctx.fillRect(mpx,mpy,mpw,2);
      ctx.strokeStyle='rgba(80,120,255,.5)'; ctx.lineWidth=1; ctx.setLineDash([6,4]);
      ctx.strokeRect(ox2-(o.range||0.1)*W*zoom-mpw/2,mpy,(o.range||0.1)*W*zoom*2+mpw,mph+2);
      ctx.setLineDash([]);
      ctx.fillStyle='rgba(100,180,255,.8)'; ctx.font=`${Math.max(6,7*zoom)}px Cinzel,serif`;
      ctx.fillText('MOVING',mpx+4,mpy+mph/2+3);
      break;
    }
    default:{
      ctx.fillStyle=def.color+'55';
      ctx.fillRect(ox2-15*zoom,oy2-15*zoom,30*zoom,30*zoom);
      ctx.font=`${Math.max(10,16*zoom)}px serif`; ctx.fillText(def.icon,ox2-8,oy2+6);
    }
  }

  // Label
  ctx.fillStyle='rgba(255,220,80,.65)';
  ctx.font=`${Math.max(5,6*zoom)}px Cinzel,serif`;
  ctx.fillText(def.label.toUpperCase(),ox2-(def.label.length*2.5),oy2-18*zoom);

  // Selection ring
  if(isSel){
    ctx.strokeStyle='#ffaa00'; ctx.lineWidth=2; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(ox2,oy2,20*zoom,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
  }

  ctx.restore();
  ctx.textAlign='left';
}

/* ── COORD HELPERS ──────────────────────────────────────────────────── */
function canvasToNorm(cx,cy){
  return {x:(cx-panX)/(CANVAS_W*zoom), y:(cy-panY)/(CANVAS_H*zoom)};
}
function snapV(v){ const gs=GRID_SIZE*zoom; return Math.round(v/gs)*gs; }
function snapNorm(n,axis){
  const gs=GRID_SIZE*zoom, total=axis==='x'?CANVAS_W*zoom:CANVAS_H*zoom;
  return Math.round(n*total/gs)*gs/total;
}

/* ── EVENTS ─────────────────────────────────────────────────────────── */
function bindEvents(){
  const c=document.getElementById('mm-canvas-container');
  if(!c) return;
  c.addEventListener('mousedown',onMouseDown);
  c.addEventListener('mousemove',onMouseMove);
  c.addEventListener('mouseup',  onMouseUp);
  c.addEventListener('wheel',    onWheel,{passive:false});
  c.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('keydown',onKeyDown);
}

function getCanvasPos(e){
  const rect=canvas.getBoundingClientRect();
  return {
    x:(e.clientX-rect.left)*(CANVAS_W/rect.width),
    y:(e.clientY-rect.top) *(CANVAS_H/rect.height)
  };
}

function onMouseDown(e){
  const pos=getCanvasPos(e);
  if(e.button===1||activeTool==='pan'||e.altKey){
    isPanning=true; panOrigin={x:e.clientX-panX,y:e.clientY-panY}; return;
  }
  if(activeTool==='select'){ doSelect(pos); return; }
  if(activeTool==='eraser'){ eraseAt(pos); return; }
  if(activeTool==='item'){   placeItemAt(pos); return; }
  if(activeTool==='hammer'&&devMode){ placeHammerAt(pos); return; }
  if(activeTool==='obstacle'){ placeObstacleAt(pos); return; }
  if(activeTool==='platform'||activeTool==='fake'){
    isDragging=true; dragStart={canvasX:pos.x,canvasY:pos.y};
  }
}

function doSelect(pos){
  const sec=currentMap.sections[activeSec>2?0:activeSec];
  let hit=false;
  // Items
  for(let i=sec.items.length-1;i>=0;i--){
    const ix=panX+sec.items[i].x*CANVAS_W*zoom, iy=panY+sec.items[i].y*CANVAS_H*zoom;
    if(Math.abs(pos.x-ix)<16*zoom&&Math.abs(pos.y-iy)<16*zoom){
      selectedEl={type:'item',idx:i}; isDragging=true;
      dragStart={canvasX:pos.x,canvasY:pos.y,origX:sec.items[i].x,origY:sec.items[i].y};
      showProps(); hit=true; break;
    }
  }
  if(!hit){
    // Obstacles
    for(let i=(sec.obstacles||[]).length-1;i>=0;i--){
      const o=sec.obstacles[i];
      const ox2=panX+o.x*CANVAS_W*zoom, oy2=panY+o.y*CANVAS_H*zoom;
      if(Math.abs(pos.x-ox2)<22*zoom&&Math.abs(pos.y-oy2)<22*zoom){
        selectedEl={type:'obstacle',idx:i}; isDragging=true;
        dragStart={canvasX:pos.x,canvasY:pos.y,origX:o.x,origY:o.y};
        showProps(); hit=true; break;
      }
    }
  }
  if(!hit){
    // Platforms
    for(let i=currentMap.sections[activeSec>2?0:activeSec].platforms.length-1;i>=0;i--){
      const p=currentMap.sections[activeSec>2?0:activeSec].platforms[i];
      const rx=panX+p.x*CANVAS_W*zoom, ry=panY+p.y*CANVAS_H*zoom;
      const rw=p.w*CANVAS_W*zoom, rh=p.h*CANVAS_H*zoom;
      if(pos.x>=rx&&pos.x<=rx+rw&&pos.y>=ry&&pos.y<=ry+rh){
        selectedEl={type:'platform',idx:i}; isDragging=true;
        dragStart={canvasX:pos.x,canvasY:pos.y,origX:p.x,origY:p.y};
        showProps(); hit=true; break;
      }
    }
  }
  if(!hit){selectedEl=null;showProps();}
}

function onMouseMove(e){
  const pos=getCanvasPos(e);
  hoverPos={x:e.clientX,y:e.clientY,canvasX:pos.x,canvasY:pos.y};
  const norm=canvasToNorm(pos.x,pos.y);
  const co=document.getElementById('mm-coords');
  if(co) co.textContent=`x:${norm.x.toFixed(2)} y:${norm.y.toFixed(2)}`;
  if(isPanning&&panOrigin){panX=e.clientX-panOrigin.x;panY=e.clientY-panOrigin.y;return;}
  if(isDragging&&activeTool==='select'&&selectedEl&&dragStart){
    const dx=(pos.x-dragStart.canvasX)/(CANVAS_W*zoom);
    const dy=(pos.y-dragStart.canvasY)/(CANVAS_H*zoom);
    const sec=currentMap.sections[activeSec>2?0:activeSec];
    const snap=document.getElementById('mm-snap-chk')?.checked!==false;
    if(selectedEl.type==='platform'){
      let nx=dragStart.origX+dx, ny=dragStart.origY+dy;
      if(snap){nx=snapNorm(nx,'x');ny=snapNorm(ny,'y');}
      sec.platforms[selectedEl.idx].x=Math.max(0,Math.min(0.95,nx));
      sec.platforms[selectedEl.idx].y=Math.max(0,Math.min(0.98,ny));
    } else if(selectedEl.type==='item'){
      sec.items[selectedEl.idx].x=Math.max(0,Math.min(1,dragStart.origX+dx));
      sec.items[selectedEl.idx].y=Math.max(0,Math.min(1,dragStart.origY+dy));
    } else if(selectedEl.type==='obstacle'){
      sec.obstacles[selectedEl.idx].x=Math.max(0,Math.min(1,dragStart.origX+dx));
      sec.obstacles[selectedEl.idx].y=Math.max(0,Math.min(1,dragStart.origY+dy));
    }
    showProps();
  }
}

function onMouseUp(e){
  const pos=getCanvasPos(e);
  if(isPanning){isPanning=false;panOrigin=null;return;}
  if(isDragging&&(activeTool==='platform'||activeTool==='fake')&&dragStart){
    const snap=document.getElementById('mm-snap-chk')?.checked!==false;
    let x1=Math.min(dragStart.canvasX,pos.x), y1=Math.min(dragStart.canvasY,pos.y);
    let x2=Math.max(dragStart.canvasX,pos.x), y2=Math.max(dragStart.canvasY,pos.y);
    if(snap){const gs=GRID_SIZE*zoom;x1=Math.round(x1/gs)*gs;y1=Math.round(y1/gs)*gs;x2=Math.round(x2/gs)*gs;y2=Math.round(y2/gs)*gs;}
    const W2=CANVAS_W*zoom, H2=CANVAS_H*zoom;
    const pw=(x2-x1)/W2, ph2=(y2-y1)/H2;
    if(pw>0.01&&ph2>0.005){
      const sec=currentMap.sections[activeSec>2?0:activeSec];
      sec.platforms.push({x:(x1-panX)/W2,y:(y1-panY)/H2,w:pw,h:ph2,fake:activeTool==='fake'});
      selectedEl={type:'platform',idx:sec.platforms.length-1}; showProps();
    }
  }
  isDragging=false; dragStart=null; updateElementList();
}

function onWheel(e){
  e.preventDefault();
  const d=e.deltaY>0?0.9:1.1, pos=getCanvasPos(e);
  panX=pos.x-(pos.x-panX)*d; panY=pos.y-(pos.y-panY)*d;
  zoom=Math.max(0.3,Math.min(5,zoom*d));
  const zv=document.getElementById('mm-zoom-val'); if(zv) zv.textContent=Math.round(zoom*100)+'%';
}

function onKeyDown(e){
  if(!mmOpen)return;
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  const tools=devMode?TOOLS_DEV:TOOLS_PLAYER;
  for(const t of tools){if(e.key.toUpperCase()===t.key){MM.setTool(t.id);return;}}
  if(e.key==='Delete'||e.key==='Backspace'){MM.deleteSelected();return;}
  if(e.key==='Escape'){if(testPlaying)MM.stopTest();return;}
  if(selectedEl&&e.key.startsWith('Arrow')){
    e.preventDefault();
    const amt=e.shiftKey?5/CANVAS_W:1/CANVAS_W;
    const sec=currentMap.sections[activeSec>2?0:activeSec];
    let el=null;
    if(selectedEl.type==='platform') el=sec.platforms[selectedEl.idx];
    else if(selectedEl.type==='item') el=sec.items[selectedEl.idx];
    else if(selectedEl.type==='obstacle') el=sec.obstacles[selectedEl.idx];
    if(!el)return;
    if(e.key==='ArrowLeft')  el.x=Math.max(0,el.x-amt);
    if(e.key==='ArrowRight') el.x=Math.min(0.98,el.x+amt);
    if(e.key==='ArrowUp')    el.y=Math.max(0,el.y-(e.shiftKey?5/CANVAS_H:1/CANVAS_H));
    if(e.key==='ArrowDown')  el.y=Math.min(0.98,el.y+(e.shiftKey?5/CANVAS_H:1/CANVAS_H));
    showProps();
  }
}

/* ── PLACEMENT HELPERS ──────────────────────────────────────────────── */
function eraseAt(pos){
  const sec=currentMap.sections[activeSec>2?0:activeSec];
  for(let i=sec.items.length-1;i>=0;i--){
    const ix=panX+sec.items[i].x*CANVAS_W*zoom, iy=panY+sec.items[i].y*CANVAS_H*zoom;
    if(Math.abs(pos.x-ix)<16*zoom&&Math.abs(pos.y-iy)<16*zoom){sec.items.splice(i,1);updateElementList();return;}
  }
  for(let i=(sec.obstacles||[]).length-1;i>=0;i--){
    const o=sec.obstacles[i];
    const ox2=panX+o.x*CANVAS_W*zoom, oy2=panY+o.y*CANVAS_H*zoom;
    if(Math.abs(pos.x-ox2)<22*zoom&&Math.abs(pos.y-oy2)<22*zoom){sec.obstacles.splice(i,1);updateElementList();return;}
  }
  for(let i=sec.platforms.length-1;i>=0;i--){
    const p=sec.platforms[i];
    const rx=panX+p.x*CANVAS_W*zoom, ry=panY+p.y*CANVAS_H*zoom;
    const rw=p.w*CANVAS_W*zoom, rh=p.h*CANVAS_H*zoom;
    if(pos.x>=rx&&pos.x<=rx+rw&&pos.y>=ry&&pos.y<=ry+rh){
      sec.platforms.splice(i,1);
      if(selectedEl?.type==='platform'&&selectedEl.idx===i)selectedEl=null;
      updateElementList();return;
    }
  }
}

function placeItemAt(pos){
  if(!activeObjType)return;
  const norm=canvasToNorm(pos.x,pos.y);
  const items=devMode?ITEMS_DEV:ITEMS_BASIC;
  const item=items.find(it=>it.id===activeObjType);
  if(!item)return;
  const sec=currentMap.sections[activeSec>2?0:activeSec];
  sec.items.push({id:item.id+'_'+Date.now()%1000,label:item.label,icon:item.icon,x:norm.x,y:norm.y,rp:item.rp});
  updateElementList();
}

function placeHammerAt(pos){
  const norm=canvasToNorm(pos.x,pos.y);
  const sec=currentMap.sections[activeSec>2?0:activeSec];
  if(!sec.hammers)sec.hammers=[];
  sec.hammers.push({x:norm.x,y:norm.y,length:100,angle:1.57,angleV:0.02,g:0.013,hw:36,hh:22});
  updateElementList();
}

function placeObstacleAt(pos){
  if(!activeObstType){flash2('Select an obstacle type first!');return;}
  const norm=canvasToNorm(pos.x,pos.y);
  const sec=currentMap.sections[activeSec>2?0:activeSec];
  if(!sec.obstacles)sec.obstacles=[];
  const def=getObstacles().find(d=>d.id===activeObstType)||{};
  // Default sizes per type
  const defaults={spike_up:{w:.06,h:.04},spike_down:{w:.06,h:.04},lava:{w:.12,h:.03},
                  saw:{r:.025},arrow:{},pit:{w:.1},boulder_trigger:{},moving_plat:{w:.1,h:.04,range:.1}};
  sec.obstacles.push(Object.assign({type:activeObstType,x:norm.x,y:norm.y},defaults[activeObstType]||{}));
  selectedEl={type:'obstacle',idx:sec.obstacles.length-1};
  showProps(); updateElementList();
}

/* ── PROPERTIES PANEL ───────────────────────────────────────────────── */
function showProps(){
  const panel=document.getElementById('mm-props'); if(!panel)return;
  if(!selectedEl){panel.innerHTML='<div style="font-size:.55rem;color:rgba(212,168,67,.3);text-align:center;padding:12px">Select an element to edit</div>';return;}
  const sec=currentMap.sections[activeSec>2?0:activeSec];

  if(selectedEl.type==='platform'){
    const p=sec.platforms[selectedEl.idx]; if(!p)return;
    panel.innerHTML=`
      <div style="font-size:.6rem;color:var(--gold);letter-spacing:1px;margin-bottom:8px">PLATFORM #${selectedEl.idx+1}${p.fake?'<span style="color:#ff6633"> [FAKE]</span>':''}</div>
      ${pr('X','mm-px',p.x.toFixed(3),'MM.updateSelProp("x",this.value)')}
      ${pr('Y','mm-py',p.y.toFixed(3),'MM.updateSelProp("y",this.value)')}
      ${pr('W','mm-pw',p.w.toFixed(3),'MM.updateSelProp("w",this.value)')}
      ${pr('H','mm-ph',p.h.toFixed(3),'MM.updateSelProp("h",this.value)')}
      <div class="mm-prop-row" style="margin-top:6px">
        <label class="mm-prop-label">Fake</label>
        <input class="mm-prop-checkbox" type="checkbox" ${p.fake?'checked':''} onchange="MM.updateSelProp('fake',this.checked)">
      </div>`;
  } else if(selectedEl.type==='item'){
    const it=sec.items[selectedEl.idx]; if(!it)return;
    panel.innerHTML=`
      <div style="font-size:.6rem;color:var(--gold);letter-spacing:1px;margin-bottom:8px">ITEM — ${it.icon} ${it.label}</div>
      ${pr('X','mm-ix',it.x.toFixed(3),'MM.updateSelProp("x",this.value)')}
      ${pr('Y','mm-iy',it.y.toFixed(3),'MM.updateSelProp("y",this.value)')}
      <div class="mm-prop-row" style="margin-top:6px">
        <label class="mm-prop-label">Required</label>
        <input class="mm-prop-checkbox" type="checkbox" ${it.rp?'checked':''} onchange="MM.updateSelProp('rp',this.checked)">
      </div>`;
  } else if(selectedEl.type==='obstacle'){
    const o=(sec.obstacles||[])[selectedEl.idx]; if(!o)return;
    const def=getObstacles().find(d=>d.id===o.type)||{label:o.type,icon:'⚡'};
    // Build size props dynamically based on what the obstacle has
    const sizeProps=[];
    if('w' in o) sizeProps.push(pr('Width','mm-ow',o.w.toFixed(3),'MM.updateSelProp("w",this.value)'));
    if('h' in o) sizeProps.push(pr('Height','mm-oh',o.h.toFixed(3),'MM.updateSelProp("h",this.value)'));
    if('r' in o) sizeProps.push(pr('Radius','mm-or',o.r.toFixed(3),'MM.updateSelProp("r",this.value)'));
    if('range' in o) sizeProps.push(pr('Range','mm-orange',o.range.toFixed(3),'MM.updateSelProp("range",this.value)'));
    panel.innerHTML=`
      <div style="font-size:.6rem;color:#ff8844;letter-spacing:1px;margin-bottom:8px">${def.icon} ${def.label.toUpperCase()}</div>
      ${pr('X','mm-ox',o.x.toFixed(3),'MM.updateSelProp("x",this.value)')}
      ${pr('Y','mm-oy',o.y.toFixed(3),'MM.updateSelProp("y",this.value)')}
      ${sizeProps.join('')}
      <div style="font-size:.5rem;color:rgba(255,150,80,.5);margin-top:8px;line-height:1.5">${def.desc||''}</div>`;
  }
  updateElementList();
}

function pr(lbl,id,val,handler){
  return `<div class="mm-prop-row">
    <label class="mm-prop-label">${lbl}</label>
    <input class="mm-prop-input" id="${id}" type="number" step="0.001" value="${val}" onchange="${handler}">
  </div>`;
}

function updateSelProp(key,val){
  if(!selectedEl)return;
  const sec=currentMap.sections[activeSec>2?0:activeSec];
  let target=null;
  if(selectedEl.type==='platform') target=sec.platforms[selectedEl.idx];
  else if(selectedEl.type==='item') target=sec.items[selectedEl.idx];
  else if(selectedEl.type==='obstacle') target=(sec.obstacles||[])[selectedEl.idx];
  if(!target)return;
  if(key==='fake'||key==='rp') target[key]=Boolean(val);
  else target[key]=parseFloat(val)||0;
  showProps();
}

/* ── ELEMENT LIST ────────────────────────────────────────────────────── */
function updateElementList(){
  const list=document.getElementById('mm-element-list'); if(!list)return;
  const sec=currentMap.sections[activeSec>2?0:activeSec];
  const all=[
    ...sec.platforms.map((p,i)=>({type:'platform',idx:i,label:`Plat ${i+1}${p.fake?' [F]':''}`,icon:'▬',col:''})),
    ...(sec.obstacles||[]).map((o,i)=>{
      const def=getObstacles().find(d=>d.id===o.type)||{icon:'⚡',label:o.type};
      return {type:'obstacle',idx:i,label:`${def.label}`,icon:def.icon,col:'color:#ff8844'};
    }),
    ...sec.items.map((it,i)=>({type:'item',idx:i,label:it.label,icon:it.icon,col:'color:#aaddff'})),
  ];
  if(!all.length){list.innerHTML='<div class="mm-empty-state"><div class="mm-empty-icon">🏗</div><p>Draw on canvas<br>to add elements</p></div>';return;}
  list.innerHTML=all.map(el=>`
    <div class="mm-map-card${selectedEl?.type===el.type&&selectedEl?.idx===el.idx?' selected':''}"
         onclick="MM.selectEl('${el.type}',${el.idx})">
      <div class="mm-card-name" style="${el.col}">${el.icon} ${el.label}</div>
    </div>`).join('');
}

function selectEl(type,idx){ selectedEl={type,idx}; showProps(); }

function updateStatusBar(){
  const sec=currentMap.sections[activeSec>2?0:activeSec]; if(!sec)return;
  const sp=document.getElementById('mm-stat-plat'), si2=document.getElementById('mm-stat-items');
  const so=document.getElementById('mm-stat-obst'), st=document.getElementById('mm-stat-tool');
  if(sp) sp.textContent=sec.platforms.length;
  if(si2) si2.textContent=sec.items.length;
  if(so) so.textContent=(sec.obstacles||[]).length;
  if(st) st.textContent=activeTool+(activeObstType&&activeTool==='obstacle'?':'+activeObstType:'');
}

/* ══════════════════════════════════════════════════════════════════════
   PUBLIC API
══════════════════════════════════════════════════════════════════════ */
const MM = {
  open(){ openMapMaker(); },
  close(){ closeMapMaker(); },

  setTool(id){
    activeTool=id;
    const is=document.getElementById('mm-item-section');
    const os=document.getElementById('mm-obst-section');
    if(is) is.style.display=id==='item'?'block':'none';
    if(os) os.style.display=id==='obstacle'?'block':'none';
    buildToolGrid();
  },

  setActiveObj(id){ activeObjType=id; if(activeTool!=='item')MM.setTool('item'); buildObjGrid(); },

  setObstacle(id){
    activeObstType=id;
    if(activeTool!=='obstacle') MM.setTool('obstacle');
    buildObstacleGrid();
    // Show desc
    const def=getObstacles().find(d=>d.id===id);
    const d=document.getElementById('mm-obst-desc'); if(d&&def) d.textContent=def.desc;
  },

  switchTab(tab){
    document.querySelectorAll('.mm-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
    document.querySelectorAll('.mm-tab-content').forEach(c=>c.style.display='none');
    const el=document.getElementById(`mm-tab-${tab}`); if(el) el.style.display='flex';
    if(tab==='devgallery') refreshDevGallery();
    if(tab==='browse') refreshMapList();
  },

  switchSec(s){
    document.querySelectorAll('.mm-sec-tab').forEach((t,i)=>t.classList.toggle('active',i===s));
    activeSec=s; selectedEl=null;
    const qs=document.getElementById('mm-quiz-section');
    const mb=document.getElementById('mm-body');
    if(s===3){if(qs)qs.style.display='flex';if(mb)mb.style.display='none';}
    else{if(qs)qs.style.display='none';if(mb)mb.style.display='flex';}
    showProps(); updateElementList();
  },

  newMap(){
    currentMap=freshMap();
    currentMap.id='map_'+Date.now();
    selectedEl=null;
    const mn=document.getElementById('mm-map-name'); if(mn) mn.value=currentMap.name;
    const ma=document.getElementById('mm-map-author'); if(ma) ma.value=currentMap.author;
    const ms=document.getElementById('mm-stage-target'); if(ms) ms.value=-1;
    MM.switchTab('editor'); MM.switchSec(0); updateElementList();
  },

  saveMap(){
    if(!currentMap.id) currentMap.id='map_'+Date.now();
    currentMap.savedAt=Date.now();
    const idx=savedMaps.findIndex(m=>m.id===currentMap.id);
    const copy=JSON.parse(JSON.stringify(currentMap));
    if(idx>=0) savedMaps[idx]=copy; else savedMaps.push(copy);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(savedMaps));
    const ss=document.getElementById('mm-stat-saved');
    if(ss) ss.textContent=new Date().toLocaleTimeString();
    refreshMapList(); flash2('💾 Map saved to browser!');
  },

  // ── SAVE TO FILE ─────────────────────────────────────────────────────
  exportFile(){
    const data=JSON.parse(JSON.stringify(currentMap));
    data._exportedAt=new Date().toISOString();
    data._version=2;
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    const safe=currentMap.name.replace(/[^a-z0-9_\-]/gi,'_').substring(0,30)||'map';
    a.href=URL.createObjectURL(blob);
    a.download=`minos_map_${safe}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    flash2('📁 Map file saved!');
  },

  importFilePrompt(){
    const fi=document.getElementById('mm-file-input'); if(fi) fi.click();
  },

  loadFromFile(input){
    const file=input.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=(e)=>{
      try{
        const data=JSON.parse(e.target.result);
        if(!data.sections||!data.puzzle) throw new Error('Not a valid Minos map file');
        data.id='map_'+Date.now(); data.shared=false;
        // Ensure obstacles array exists in every section
        data.sections.forEach(s=>{if(!s.obstacles)s.obstacles=[];});
        currentMap=data;
        savedMaps.push(JSON.parse(JSON.stringify(data)));
        localStorage.setItem(STORAGE_KEY,JSON.stringify(savedMaps));
        const mn=document.getElementById('mm-map-name'); if(mn) mn.value=data.name;
        const ma=document.getElementById('mm-map-author'); if(ma) ma.value=data.author||'';
        const ms=document.getElementById('mm-stage-target'); if(ms) ms.value=data.stageTarget||'-1';
        selectedEl=null; MM.switchTab('editor'); MM.switchSec(0); refreshMapList();
        flash2('📁 Map loaded from file: '+data.name);
      }catch(err){ alert('Error loading file: '+err.message); }
    };
    reader.readAsText(file);
    input.value='';
  },

  // ── DEV: PUBLISH TO GALLERY ──────────────────────────────────────────
  markDevMap(){
    if(!devMode){flash2('Dev mode required');return;}
    const copy=JSON.parse(JSON.stringify(currentMap));
    copy.devCreated=true;
    copy.publishedAt=Date.now();
    copy.id='devmap_'+Date.now();
    const idx=devMaps.findIndex(m=>m.name===copy.name);
    if(idx>=0) devMaps[idx]=copy; else devMaps.push(copy);
    localStorage.setItem(DEV_MAPS_KEY,JSON.stringify(devMaps));
    refreshDevGallery();
    flash2('🏛 Published to Dev Gallery!');
  },

  testPlay(){
    const banner=document.getElementById('mm-test-banner');
    if(banner) banner.classList.add('visible');
    testPlaying=true;
    closeMapMaker();
    if(typeof launchCustomMap==='function') launchCustomMap(currentMap);
  },

  stopTest(){
    const banner=document.getElementById('mm-test-banner');
    if(banner) banner.classList.remove('visible');
    testPlaying=false; openMapMaker();
    if(typeof returnToMenu==='function') returnToMenu();
  },

  shareMap(){
    const code=btoa(unescape(encodeURIComponent(JSON.stringify(currentMap))));
    document.getElementById('mm-share-code').value=code;
    document.getElementById('mm-share-name').value=currentMap.name;
    document.getElementById('mm-share-modal').classList.add('open');
  },
  copyShareCode(){ navigator.clipboard.writeText(document.getElementById('mm-share-code').value).then(()=>flash2('Copied!')); },

  importPrompt(){ document.getElementById('mm-import-modal').classList.add('open'); },
  doImport(){
    try{
      const raw=document.getElementById('mm-import-code').value.trim();
      const data=JSON.parse(decodeURIComponent(escape(atob(raw))));
      if(!data.sections||!data.puzzle) throw new Error('Invalid map');
      data.id='map_'+Date.now(); data.shared=true;
      data.sections.forEach(s=>{if(!s.obstacles)s.obstacles=[];});
      savedMaps.push(data);
      localStorage.setItem(STORAGE_KEY,JSON.stringify(savedMaps));
      currentMap=data; refreshMapList();
      MM.closeModal('mm-import-modal');
      flash2('Map imported: '+data.name);
    }catch(e){alert('Invalid share code.');}
  },

  closeModal(id){ document.getElementById(id).classList.remove('open'); },

  deleteSelected(){
    if(!selectedEl)return;
    const sec=currentMap.sections[activeSec>2?0:activeSec];
    if(selectedEl.type==='platform') sec.platforms.splice(selectedEl.idx,1);
    else if(selectedEl.type==='item') sec.items.splice(selectedEl.idx,1);
    else if(selectedEl.type==='obstacle'&&sec.obstacles) sec.obstacles.splice(selectedEl.idx,1);
    else if(selectedEl.type==='hammer'&&sec.hammers) sec.hammers.splice(selectedEl.idx,1);
    selectedEl=null; showProps(); updateElementList();
  },

  clearSection(){
    if(!confirm('Clear all elements in this section?'))return;
    const sec=currentMap.sections[activeSec>2?0:activeSec];
    sec.platforms=[];sec.items=[];sec.obstacles=[];if(sec.hammers)sec.hammers=[];
    selectedEl=null;showProps();updateElementList();
  },

  selectEl(type,idx){ selectEl(type,idx); },
  updateSelProp(k,v){ updateSelProp(k,v); },
  updateMapName(v){ currentMap.name=v; },
  updateAuthor(v){ currentMap.author=v; },
  updateStageTarget(v){ currentMap.stageTarget=parseInt(v); },
  updateLore(v){ currentMap.sections[0].lore=v; currentMap.sections[1].lore=v; },
  updateQ(k,v){ currentMap.puzzle[k]=v; },
  updateOpt(i,v){
    currentMap.puzzle.opts[i]=v;
    document.querySelectorAll('.mm-opt-row input[type="text"]').forEach((el,j)=>{
      el.classList.toggle('correct-opt',currentMap.puzzle.ans===String.fromCharCode(65+j));
    });
  },

  zoomIn(){ zoom=Math.min(5,zoom*1.15); document.getElementById('mm-zoom-val').textContent=Math.round(zoom*100)+'%'; },
  zoomOut(){ zoom=Math.max(0.3,zoom/1.15); document.getElementById('mm-zoom-val').textContent=Math.round(zoom*100)+'%'; },
  resetZoom(){ zoom=1.2;panX=0;panY=0; document.getElementById('mm-zoom-val').textContent='120%'; },
  toggleGrid(v){ showGrid=v; },
  toggleDebug(v){ debugMode=v; },

  loadMap(id){
    const m=savedMaps.find(m=>m.id===id); if(!m)return;
    currentMap=JSON.parse(JSON.stringify(m));
    currentMap.sections.forEach(s=>{if(!s.obstacles)s.obstacles=[];});
    const mn=document.getElementById('mm-map-name'); if(mn) mn.value=currentMap.name;
    const ma=document.getElementById('mm-map-author'); if(ma) ma.value=currentMap.author||'';
    const ms=document.getElementById('mm-stage-target'); if(ms) ms.value=currentMap.stageTarget;
    selectedEl=null; MM.switchTab('editor'); MM.switchSec(0); updateElementList();
  },

  loadDevMapAsTemplate(id){
    const m=devMaps.find(m=>m.id===id); if(!m)return;
    currentMap=JSON.parse(JSON.stringify(m));
    currentMap.id='map_'+Date.now(); currentMap.devCreated=false;
    currentMap.sections.forEach(s=>{if(!s.obstacles)s.obstacles=[];});
    MM.switchTab('editor'); MM.switchSec(0); updateElementList();
    flash2('Loaded dev map as template');
  },

  deleteMap(id){
    if(!confirm('Delete this map?'))return;
    savedMaps=savedMaps.filter(m=>m.id!==id);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(savedMaps));
    refreshMapList();
  },

  deleteDevMap(id){
    if(!confirm('Remove from dev gallery?'))return;
    devMaps=devMaps.filter(m=>m.id!==id);
    localStorage.setItem(DEV_MAPS_KEY,JSON.stringify(devMaps));
    refreshDevGallery();
  },

  // DEV TOOLS
  generatePoolCode(){ document.getElementById('mm-pool-output').textContent=generatePoolEntry(); },
  copyPoolCode(){ navigator.clipboard.writeText(document.getElementById('mm-pool-output').textContent).then(()=>flash2('Copied!')); },

  exportToPool(){
    const code=generatePoolEntry();
    document.getElementById('mm-pool-code-out').value=code;
    document.getElementById('mm-pool-stage').value=Math.max(0,currentMap.stageTarget);
    document.getElementById('mm-pool-modal').classList.add('open');
  },
  regeneratePool(){ document.getElementById('mm-pool-code-out').value=generatePoolEntry(); },

  exportElementPack(){
    const pack={version:2,type:'element_pack',items:ITEMS_DEV,obstacles:getObstacles(),devMode:true,timestamp:Date.now()};
    const blob=new Blob([JSON.stringify(pack,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='minos_element_pack.json'; a.click();
  },

  applyRawJSON(){
    try{
      const data=JSON.parse(document.getElementById('mm-raw-json').value);
      if(data.sections) currentMap.sections=data.sections;
      if(data.puzzle) currentMap.puzzle=data.puzzle;
      currentMap.sections.forEach(s=>{if(!s.obstacles)s.obstacles=[];});
      selectedEl=null;updateElementList();flash2('JSON applied');
    }catch(e){alert('Invalid JSON: '+e.message);}
  },

  testMap(id){ MM.loadMap(id); MM.testPlay(); },
};

/* ── POOL GENERATOR ─────────────────────────────────────────────────── */
function generatePoolEntry(){
  const m=currentMap;
  const id='custom_'+m.name.toLowerCase().replace(/\s+/g,'_').substring(0,12);
  const secs=m.sections.map(sec=>{
    const plats=sec.platforms.map(p=>
      `        {x:${p.x.toFixed(2)},y:${p.y.toFixed(2)},w:${p.w.toFixed(2)},h:${p.h.toFixed(2)}${p.fake?',fake:true':''}}`
    ).join(',\n');
    const items=sec.items.map(it=>
      `{id:'${it.id}',label:'${it.label}',icon:'${it.icon}',x:${it.x.toFixed(2)},y:${it.y.toFixed(2)},rp:${it.rp}}`
    ).join(',');
    const loreStr=sec.lore?`lore:"${sec.lore.replace(/"/g,"'")}"` :'';
    return `      {\n       platforms:[\n${plats}\n       ],\n       items:[${items}]${loreStr?',\n       '+loreStr:''}\n      }`;
  }).join(',\n');
  const opts=m.puzzle.opts.map(o=>`'${o}'`).join(',');
  return `    {id:'${id}',name:'${m.name}',\n     sections:[\n${secs}\n     ],\n     puzzle:{q:'${m.puzzle.q}',opts:[${opts}],ans:'${m.puzzle.ans}',hint:'${m.puzzle.hint}',need:'${m.puzzle.need||''}'}}`;
}

/* ── MAP + DEV GALLERY LISTS ─────────────────────────────────────────── */
function refreshMapList(){
  const list=document.getElementById('mm-my-maps-list'); if(!list)return;
  if(!savedMaps.length){
    list.innerHTML='<div class="mm-empty-state"><div class="mm-empty-icon">📂</div><p>No saved maps yet.<br>Create your first!</p></div>';return;
  }
  list.innerHTML=savedMaps.map(m=>`
    <div class="mm-map-card${currentMap.id===m.id?' selected':''}">
      <div class="mm-card-name">${m.name}</div>
      <div class="mm-card-meta">
        <span>${m.stageTarget>=0?'Stage '+(m.stageTarget+1):'Custom'}</span>
        <span>${m.sections?.[0]?.platforms?.length||0} plats</span>
        <span>${(m.sections?.[0]?.obstacles||[]).length} obst</span>
        <span>${m.savedAt?new Date(m.savedAt).toLocaleDateString():'unsaved'}</span>
      </div>
      <span class="mm-card-badge ${m.shared?'badge-custom':'badge-builtin'}">${m.shared?'IMPORTED':'MINE'}</span>
      <div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap">
        <button class="mm-btn primary" onclick="MM.loadMap('${m.id}')">✏ Edit</button>
        <button class="mm-btn" onclick="MM.testMap('${m.id}')">▶ Test</button>
        <button class="mm-btn" onclick="MM.exportFileById('${m.id}')">📁 Save File</button>
        <button class="mm-btn danger" onclick="MM.deleteMap('${m.id}')">🗑</button>
      </div>
    </div>`).join('');
}

// Attach exportFileById to MM
MM.exportFileById=function(id){
  const m=savedMaps.find(m=>m.id===id); if(!m)return;
  const blob=new Blob([JSON.stringify(m,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  const safe=m.name.replace(/[^a-z0-9_\-]/gi,'_').substring(0,30)||'map';
  a.href=URL.createObjectURL(blob); a.download=`minos_map_${safe}.json`; a.click();
  flash2('📁 Saved: '+m.name);
};

function refreshDevGallery(){
  const list=document.getElementById('mm-devgallery-list'); if(!list)return;
  if(!devMaps.length){
    list.innerHTML=`<div class="mm-empty-state">
      <div class="mm-empty-icon">🏛</div>
      <p>No dev maps published yet.<br>Use <strong style="color:#ffaa66">🏛 Publish as Dev</strong><br>to add maps here.</p>
    </div>`;return;
  }
  list.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
    ${devMaps.map(m=>{
      const totalPlats=m.sections.reduce((s,sec)=>s+(sec.platforms?.length||0),0);
      const totalObst=m.sections.reduce((s,sec)=>s+(sec.obstacles?.length||0),0);
      const totalItems=m.sections.reduce((s,sec)=>s+(sec.items?.length||0),0);
      return `<div class="mm-devgallery-card">
        <div class="mm-devgallery-badge">🏛 DEVELOPER MAP</div>
        <div class="mm-devgallery-name">${m.name}</div>
        <div class="mm-devgallery-author">by ${m.author||'Developer'}</div>
        <div class="mm-devgallery-meta">
          <span>Stage ${m.stageTarget>=0?m.stageTarget+1:'Custom'}</span>
          <span>${totalPlats} platforms</span>
          <span>${totalObst} obstacles</span>
          <span>${totalItems} items</span>
        </div>
        <div class="mm-devgallery-date">${m.publishedAt?'Published '+new Date(m.publishedAt).toLocaleDateString():''}</div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <button class="mm-btn primary" onclick="MM.loadDevMapAsTemplate('${m.id}')">📋 Use as Template</button>
          <button class="mm-btn" onclick="MM.testDevMap('${m.id}')">▶ Preview</button>
          ${devMode?`<button class="mm-btn danger" onclick="MM.deleteDevMap('${m.id}')">🗑</button>`:''}
        </div>
      </div>`;
    }).join('')}
    </div>`;
}

MM.testDevMap=function(id){
  const m=devMaps.find(m=>m.id===id); if(!m)return;
  const prev=currentMap; currentMap=m; MM.testPlay(); currentMap=prev;
};

/* ── DEV MODE ──────────────────────────────────────────────────────── */
function loadDevMode(){ devMode=localStorage.getItem(DEV_KEY)==='1'; }
function loadMaps(){
  try{savedMaps=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');}catch(e){savedMaps=[];}
  try{devMaps=JSON.parse(localStorage.getItem(DEV_MAPS_KEY)||'[]');}catch(e){devMaps=[];}
}

/* ── OPEN / CLOSE ───────────────────────────────────────────────────── */
function openMapMaker(){
  mmOpen=true;
  // Hide any overlapping screens
  document.getElementById('start-screen')?.classList.add('hidden');
  document.getElementById('custom-maps-screen')?.classList.add('hidden');
  const ol=document.getElementById('mapmaker-overlay'); if(ol) ol.classList.add('open');
}
function closeMapMaker(){
  mmOpen=false;
  const ol=document.getElementById('mapmaker-overlay'); if(ol) ol.classList.remove('open');
}

/* ── CUSTOM MAP LAUNCH ──────────────────────────────────────────────── */
window.launchCustomMap=function(map){
  if(typeof genMaze==='undefined')return;
  const room={
    id:map.id||'custom', name:map.name, puzzle:map.puzzle,
    sections:map.sections.map(s=>({
      platforms:s.platforms, lore:s.lore||'',
      items:s.items?s.items.map(it=>Object.assign({},it)):[],
      obstacles:s.obstacles||[]
    }))
  };
  window.maze=[{room}]; window.si=0; window.sec=0; window.lives=3;
  window.gameState='playing'; window.paused=false; window.quizOpen=false;
  document.getElementById('start-screen')?.classList.add('hidden');
  document.getElementById('ui-layer')?.classList.remove('hidden');
  document.getElementById('hud-bottom')?.classList.remove('hidden');
  if(typeof resetSec==='function') resetSec(false);
  if(typeof startLoop==='function') startLoop();
};

/* ── SETTINGS DEV TOGGLE ─────────────────────────────────────────────── */
window.devModePrompt=function(){
  devClickN++;
  if(devClickN>=3){
    const code=prompt('Enter developer code:'); devClickN=0;
    if(code===MM_DEV_CODE){
      devMode=true; localStorage.setItem(DEV_KEY,'1');
      const row=document.getElementById('dev-mode-row');
      const hint=document.getElementById('dev-mode-hint');
      const tog=document.getElementById('tog-devmode');
      if(row) row.style.display='flex';
      if(hint) hint.style.display='block';
      if(tog) tog.classList.add('on');
      alert('Developer mode unlocked! Reopen Map Maker to see Dev Gallery & tools.');
    } else if(code!==null){ alert('Incorrect code.'); }
  } else {
    const hint=document.getElementById('dev-unlock-hint');
    if(hint) hint.textContent='· '.repeat(devClickN)+'·'.repeat(3-devClickN);
    setTimeout(()=>{if(hint)hint.textContent='· · ·';devClickN=0;},4000);
  }
};

window.toggleDevMode=function(el){
  el.classList.toggle('on'); devMode=el.classList.contains('on');
  localStorage.setItem(DEV_KEY,devMode?'1':'0');
  const strip=document.getElementById('dev-mode-strip');
  if(strip) strip.classList.toggle('visible',devMode);
};

/* ── UTILITY ─────────────────────────────────────────────────────────── */
function flash2(msg){
  const el=document.createElement('div');
  el.style.cssText='position:fixed;bottom:40px;left:50%;transform:translateX(-50%);background:rgba(212,168,67,.96);color:#1a0a04;font-family:Cinzel,serif;font-size:.7rem;padding:9px 22px;letter-spacing:1px;z-index:9999;pointer-events:none;transition:opacity .5s;box-shadow:0 4px 20px rgba(0,0,0,.5)';
  el.textContent=msg; document.body.appendChild(el);
  setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),600);},1800);
}

/* ── EXPOSE ──────────────────────────────────────────────────────────── */
window.MM=MM;
window.openMapMaker=openMapMaker;
window.closeMapMaker=closeMapMaker;

/* ── INIT ────────────────────────────────────────────────────────────── */
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{ init(); }

})();