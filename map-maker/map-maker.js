// ============================================================
//  DEVELOPER KEY — change this to whatever you want
// ============================================================
const DEV_KEY = 'dev2024';

class MapMaker {
  constructor() {
    this.mode = null;
    this.canvas = null;
    this.ctx = null;
    this.gridSize = 32;
    this.zoomLevel = 1;
    this.currentTool = 'brush';
    this.selectedAsset = null;
    this.isDrawing = false;
    this.activeLayer = 'platforms';
    this.devAuthenticated = false;
    this.mapData = this._freshMap();
    this.stages = {};   // runtime stage arrays
    this.history = [];
    this.historyIndex = -1;
    this.currentExportData = null;
    this.sessionKey = 'dev_' + Math.random().toString(36).slice(2,8);

    this._initStages();
    this._loadFromLocalStorage();
    this._setupEventListeners();
  }

  // ─── Helpers ─────────────────────────────────────────────
  _freshMap(name='stage1_map1') {
    return {
      id: name,
      width: 25, height: 19,
      layers: { background:[], platforms:[], traps:[], entities:[], foreground:[] },
      metadata: { name:'', author:'', difficulty:'medium', version:'1.0' }
    };
  }

  _initStages() {
    for (let i=1; i<=9; i++) {
      this.stages[i] = { maps:[], shufflePool:[], randomizationRules:{
        platformVariance:0.3, trapDensity:0.5, itemDensity:0.4, mobDensity:0.3
      }};
    }
  }

  // ─── LocalStorage ────────────────────────────────────────
  _storageKey(stage) { return `mapmaker_stage_${stage}`; }

  _saveToLocalStorage() {
    for (let i=1; i<=9; i++) {
      try { localStorage.setItem(this._storageKey(i), JSON.stringify(this.stages[i].maps)); } catch(e){}
    }
    this._updateStorageUI();
  }

  _loadFromLocalStorage() {
    for (let i=1; i<=9; i++) {
      try {
        const raw = localStorage.getItem(this._storageKey(i));
        if (raw) { this.stages[i].maps = JSON.parse(raw); }
      } catch(e){}
    }
    this._updateStorageUI();
  }

  _updateStorageUI() {
    const total = Object.values(this.stages).reduce((s,st)=>s+st.maps.length, 0);
    const el = document.getElementById('storage-count');
    if (el) el.textContent = total;
    const sk = document.getElementById('session-key');
    if (sk) sk.textContent = this.sessionKey;
    this._renderStageLibrary();
  }

  _renderStageLibrary() {
    const stageNum = parseInt(document.getElementById('admin-stage-select')?.value||1);
    const maps = this.stages[stageNum].maps;
    const label = document.getElementById('stage-lib-label');
    const count = document.getElementById('stage-lib-count');
    const list = document.getElementById('stage-map-list');
    if (!list) return;
    if (label) label.textContent = `Stage ${stageNum}`;
    if (count) count.textContent = maps.length;
    if (!maps.length) {
      list.innerHTML = '<span class="no-maps">No maps saved yet for this stage.</span>';
      return;
    }
    list.innerHTML = maps.map((m,i)=>`
      <div class="stage-map-chip" onclick="app.loadSavedMap(${stageNum},${i})" title="Click to load">
        📄 ${m.id}
        <span class="del-chip" onclick="event.stopPropagation();app.deleteSavedMap(${stageNum},${i})" title="Delete">✕</span>
      </div>
    `).join('');
  }

  loadSavedMap(stageNum, index) {
    const m = this.stages[stageNum].maps[index];
    if (!m) return;
    this.mapData = JSON.parse(JSON.stringify(m));
    document.getElementById('admin-map-id').value = m.id;
    this.saveState();
    this.render();
    this.updateObjectCount();
  }

  deleteSavedMap(stageNum, index) {
    if (!confirm(`Delete map "${this.stages[stageNum].maps[index].id}"?`)) return;
    this.stages[stageNum].maps.splice(index, 1);
    this._saveToLocalStorage();
  }

  // ─── Dev Auth ────────────────────────────────────────────
  requestAdminMode() {
    if (this.devAuthenticated) { this.setMode('admin'); return; }
    document.getElementById('dev-login-overlay').classList.remove('hidden');
    document.getElementById('dev-password-input').value = '';
    document.getElementById('dev-error').textContent = '';
    setTimeout(()=>document.getElementById('dev-password-input').focus(), 50);
  }

  cancelDevLogin() {
    document.getElementById('dev-login-overlay').classList.add('hidden');
  }

  submitDevLogin() {
    const input = document.getElementById('dev-password-input');
    const val = input.value.trim();
    if (val === DEV_KEY) {
      this.devAuthenticated = true;
      document.getElementById('dev-login-overlay').classList.add('hidden');
      this.setMode('admin');
    } else {
      document.getElementById('dev-error').textContent = '⚠️ Incorrect key. Access denied.';
      input.classList.add('error');
      setTimeout(()=>input.classList.remove('error'), 400);
      input.value = '';
      input.focus();
    }
  }

  // ─── Mode ────────────────────────────────────────────────
  setMode(mode) {
    this.mode = mode;
    document.getElementById('mode-selector').classList.add('hidden');
    if (mode === 'admin') {
      document.getElementById('admin-interface').classList.remove('hidden');
      this.canvas = document.getElementById('map-canvas');
      this.ctx = this.canvas.getContext('2d');
      this._setupCanvasEvents();
      this._refreshAssetListeners();
      this.saveState();
      this.render();
      this.updateObjectCount();
      this._renderStageLibrary();
    } else {
      document.getElementById('community-interface').classList.remove('hidden');
      this._initCommunityBrowser();
    }
  }

  backToMenu() {
    document.getElementById('mode-selector').classList.remove('hidden');
    document.getElementById('admin-interface').classList.add('hidden');
    document.getElementById('community-interface').classList.add('hidden');
    this.mode = null;
  }

  onStageChange() { this._renderStageLibrary(); }

  // ─── Canvas Setup ────────────────────────────────────────
  _setupCanvasEvents() {
    if (this._canvasEventsAttached) return;
    this._canvasEventsAttached = true;
    this.canvas.addEventListener('mousedown', e => this._handleMouseDown(e));
    this.canvas.addEventListener('mousemove', e => this._handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => { this.isDrawing = false; });
    this.canvas.addEventListener('mouseleave', () => { this.isDrawing = false; });
    this.canvas.addEventListener('dragover', e => e.preventDefault());
    this.canvas.addEventListener('drop', e => this._handleDrop(e));
  }

  _setupEventListeners() {
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const area = btn.closest('.canvas-area');
        if (area) area.querySelectorAll('.tool-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTool = btn.dataset.tool;
      });
    });
    // Layer selection
    document.querySelectorAll('.layer-item').forEach(layer => {
      layer.addEventListener('click', () => {
        this.activeLayer = layer.dataset.layer;
        document.querySelectorAll('.layer-item').forEach(l=>l.classList.remove('active'));
        layer.classList.add('active');
      });
    });
    // Difficulty slider
    const diffSlider = document.getElementById('difficulty-var');
    if (diffSlider) diffSlider.addEventListener('input', e => {
      document.getElementById('diff-val').textContent = e.target.value + '%';
    });
    // Keyboard
    document.addEventListener('keydown', e => this._handleKeyDown(e));
  }

  _refreshAssetListeners() {
    document.querySelectorAll('.asset-item').forEach(item => {
      item.onclick = () => {
        document.querySelectorAll('.asset-item').forEach(i=>i.classList.remove('selected'));
        item.classList.add('selected');
        this.selectedAsset = { type: item.dataset.type, subtype: item.dataset.subtype };
      };
      item.ondragstart = e => {
        e.dataTransfer.setData('asset', JSON.stringify({ type:item.dataset.type, subtype:item.dataset.subtype }));
        this.selectedAsset = { type:item.dataset.type, subtype:item.dataset.subtype };
      };
    });
  }

  // ─── Mouse Handling ──────────────────────────────────────
  _handleMouseDown(e) {
    this.isDrawing = true;
    const pos = this._getMousePos(e);
    if (this.currentTool === 'brush' && this.selectedAsset) this.placeObject(pos.x, pos.y, this.selectedAsset);
    else if (this.currentTool === 'eraser') this.removeObject(pos.x, pos.y);
    else if (this.currentTool === 'fill' && this.selectedAsset) this.fillArea(pos.x, pos.y);
  }

  _handleMouseMove(e) {
    const pos = this._getMousePos(e);
    const gx = Math.floor(pos.x / this.gridSize);
    const gy = Math.floor(pos.y / this.gridSize);
    const xEl = document.getElementById(this.mode==='admin'?'coord-x':'c-coord-x');
    const yEl = document.getElementById(this.mode==='admin'?'coord-y':'c-coord-y');
    if (xEl) xEl.textContent = gx;
    if (yEl) yEl.textContent = gy;
    if (this.isDrawing) {
      if (this.currentTool === 'brush' && this.selectedAsset) this.placeObject(pos.x, pos.y, this.selectedAsset);
      else if (this.currentTool === 'eraser') this.removeObject(pos.x, pos.y);
    }
  }

  _handleDrop(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('asset'));
    const pos = this._getMousePos(e);
    this.placeObject(pos.x, pos.y, data);
  }

  _handleKeyDown(e) {
    if (!this.mode) return;
    switch(e.key.toLowerCase()) {
      case 'b': this._setToolBtn('brush'); break;
      case 'e': this._setToolBtn('eraser'); break;
      case 'f': this._setToolBtn('fill'); break;
      case 'z': if (e.ctrlKey||e.metaKey) { e.preventDefault(); this.undo(); } break;
      case 'y': if (e.ctrlKey||e.metaKey) { e.preventDefault(); this.redo(); } break;
    }
  }

  _setToolBtn(tool) {
    this.currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.toggle('active', b.dataset.tool===tool));
  }

  _getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x:(e.clientX-rect.left)/this.zoomLevel, y:(e.clientY-rect.top)/this.zoomLevel };
  }

  // ─── Map Operations ──────────────────────────────────────
  placeObject(x, y, asset) {
    const gridX = Math.floor(x / this.gridSize);
    const gridY = Math.floor(y / this.gridSize);
    if (gridX<0||gridX>=25||gridY<0||gridY>=19) return;
    this._removeObjectAt(gridX, gridY);
    const layer = asset.type === 'trap' ? 'traps'
                : asset.type === 'mob' || asset.type === 'item' || asset.type === 'spawn' ? 'entities'
                : asset.type === 'door' ? 'entities'
                : this.activeLayer;
    this.mapData.layers[layer].push({
      id: Date.now() + Math.random(),
      type: asset.type, subtype: asset.subtype,
      x: gridX*this.gridSize, y: gridY*this.gridSize,
      width: this.gridSize, height: this.gridSize,
      gridX, gridY,
      properties: this._defaultProps(asset)
    });
    this.saveState();
    this.render();
    this.updateObjectCount();
  }

  removeObject(x, y) {
    this._removeObjectAt(Math.floor(x/this.gridSize), Math.floor(y/this.gridSize));
    this.saveState();
    this.render();
    this.updateObjectCount();
  }

  _removeObjectAt(gridX, gridY) {
    Object.keys(this.mapData.layers).forEach(layer => {
      this.mapData.layers[layer] = this.mapData.layers[layer].filter(o=>o.gridX!==gridX||o.gridY!==gridY);
    });
  }

  _defaultProps(asset) {
    return { platform:{solid:true,friction:1.0}, trap:{damage:10,active:true},
             door:{locked:false,destination:''}, item:{value:1,respawn:false},
             spawn:{team:'player',cooldown:0}, mob:{hp:100,aggro:false,patrol:false}
    }[asset.type] || {};
  }

  fillArea(x, y) {
    const gx = Math.floor(x/this.gridSize), gy = Math.floor(y/this.gridSize);
    for (let dx=-1; dx<=1; dx++) for (let dy=-1; dy<=1; dy++)
      this.placeObject((gx+dx)*this.gridSize, (gy+dy)*this.gridSize, this.selectedAsset);
  }

  clearCanvas() {
    if (!confirm('Clear all objects on canvas?')) return;
    this.mapData = this._freshMap(document.getElementById('admin-map-id')?.value||'untitled');
    this.saveState();
    this.render();
    this.updateObjectCount();
  }

  // ─── History ─────────────────────────────────────────────
  saveState() {
    this.history = this.history.slice(0, this.historyIndex+1);
    this.history.push(JSON.parse(JSON.stringify(this.mapData)));
    this.historyIndex++;
    if (this.history.length > 50) { this.history.shift(); this.historyIndex--; }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.mapData = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.render(); this.updateObjectCount();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length-1) {
      this.historyIndex++;
      this.mapData = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.render(); this.updateObjectCount();
    }
  }

  // ─── Zoom ────────────────────────────────────────────────
  zoomIn(delta) {
    this.zoomLevel = Math.max(0.5, Math.min(2, this.zoomLevel + delta));
    document.getElementById('zoom-level').textContent = Math.round(this.zoomLevel*100)+'%';
    this.canvas.style.transform = `scale(${this.zoomLevel})`;
  }

  // ─── Render ──────────────────────────────────────────────
  render() {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#16213e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this._drawGrid();
    ['background','platforms','traps','entities','foreground'].forEach(layer =>
      this.mapData.layers[layer].forEach(obj => this._drawObject(obj))
    );
  }

  _drawGrid() {
    this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    this.ctx.lineWidth = 1;
    for (let x=0; x<=this.canvas.width; x+=this.gridSize) {
      this.ctx.beginPath(); this.ctx.moveTo(x,0); this.ctx.lineTo(x,this.canvas.height); this.ctx.stroke();
    }
    for (let y=0; y<=this.canvas.height; y+=this.gridSize) {
      this.ctx.beginPath(); this.ctx.moveTo(0,y); this.ctx.lineTo(this.canvas.width,y); this.ctx.stroke();
    }
  }

  _drawObject(obj) {
    const colors = {
      platform:{grass:'#4ecca3',stone:'#8b8b8b',wood:'#8b4513',metal:'#b0b0b0',ice:'#a8e6ff',moving:'#f9a826',crumbling:'#d4a373',bounce:'#ff6b9d'},
      trap:{spikes:'#e94560',saw:'#ff6b6b',lava:'#ff4500',arrow:'#f9a826',poison:'#4ecca3',electric:'#f9a826'},
      door:{exit:'#4ecca3',locked:'#e94560',secret:'#8b8b8b',trap:'#2c2c2c'},
      item:{coin:'#ffd700',gem:'#00bfff',key:'#f9a826',potion:'#ff6b9d',chest:'#8b4513',powerup:'#f9a826'},
      spawn:{player:'#4ecca3',checkpoint:'#f9a826'},
      mob:{slime:'#4ecca3',goblin:'#7cb342',skeleton:'#e0e0e0',bat:'#5c4d7d',boss:'#e94560'}
    };
    const color = colors[obj.type]?.[obj.subtype] || '#ffffff';
    this.ctx.fillStyle = color;
    this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    const sym = {platform:'▬',trap:'⚠',door:'🚪',item:'◆',spawn:'○',mob:'👾'}[obj.type]||'?';
    this.ctx.fillText(sym, obj.x+obj.width/2, obj.y+obj.height/2);
  }

  updateObjectCount() {
    const count = Object.values(this.mapData.layers).flat().length;
    const idAdmin = document.getElementById('object-count');
    const idComm  = document.getElementById('c-object-count');
    if (idAdmin) idAdmin.textContent = `Objects: ${count}`;
    if (idComm)  idComm.textContent  = `Objects: ${count}`;
  }

  // ─── Randomization ───────────────────────────────────────
  randomizeMap() {
    const seed = document.getElementById('rand-seed-value').value || Date.now().toString();
    const rng = this._seededRandom(seed);
    const difficulty = parseInt(document.getElementById('difficulty-var')?.value||50)/100;
    const s = {
      platforms: document.getElementById('rand-platforms')?.checked,
      traps:     document.getElementById('rand-traps')?.checked,
      items:     document.getElementById('rand-items')?.checked,
      mobs:      document.getElementById('rand-mobs')?.checked
    };
    const v = JSON.parse(JSON.stringify(this.mapData));
    if (s.platforms) v.layers.platforms = this._randPlatforms(v.layers.platforms, rng);
    if (s.traps)     v.layers.traps     = this._randTraps(v.layers.traps, rng, difficulty);
    if (s.items)     v.layers.entities  = this._randItems(v.layers.entities, rng);
    if (s.mobs)      v.layers.entities  = this._randMobs(v.layers.entities, rng, difficulty);
    this.mapData = v;
    this.saveState();
    this.render();
    this.updateObjectCount();
  }

  _seededRandom(seed) {
    let s=0; for (let i=0;i<seed.length;i++) s+=seed.charCodeAt(i);
    return ()=>{ s=Math.sin(s)*10000; return s-Math.floor(s); };
  }

  _randPlatforms(platforms, rng) {
    return platforms.map(p=>{
      if (rng()>0.7) {
        const gx=Math.max(0,Math.min(24,p.gridX+(Math.floor(rng()*3)-1)));
        const gy=Math.max(0,Math.min(18,p.gridY+(Math.floor(rng()*2)-1)));
        return {...p,gridX:gx,gridY:gy,x:gx*this.gridSize,y:gy*this.gridSize};
      }
      return p;
    });
  }

  _randTraps(traps, rng, diff) {
    const nt=[...traps];
    if (diff>0.5&&rng()>0.5) {
      const gx=Math.floor(rng()*25), gy=Math.floor(rng()*19);
      nt.push({id:Date.now(),type:'trap',subtype:['spikes','saw','arrow'][Math.floor(rng()*3)],
        x:gx*this.gridSize,y:gy*this.gridSize,width:this.gridSize,height:this.gridSize,
        gridX:gx,gridY:gy,properties:{damage:Math.round(10*diff)}});
    }
    return nt;
  }

  _randItems(entities, rng) {
    return entities.map(e=>{
      if (e.type==='item'&&rng()>0.6) {
        const gx=Math.floor(rng()*25),gy=Math.floor(rng()*19);
        return {...e,gridX:gx,gridY:gy,x:gx*this.gridSize,y:gy*this.gridSize};
      }
      return e;
    });
  }

  _randMobs(entities, rng, diff) {
    const mobs=entities.filter(e=>e.type==='mob');
    const target=Math.floor(3+diff*10);
    while(mobs.length<target){
      const gx=Math.floor(rng()*25),gy=Math.floor(rng()*19);
      mobs.push({id:Date.now()+rng(),type:'mob',subtype:['slime','goblin','bat'][Math.floor(rng()*3)],
        x:gx*this.gridSize,y:gy*this.gridSize,width:this.gridSize,height:this.gridSize,
        gridX:gx,gridY:gy,properties:{hp:100,aggro:diff>0.7}});
    }
    return [...entities.filter(e=>e.type!=='mob'),...mobs];
  }

  // ─── Export: Build canonical JSON ────────────────────────
  _buildSingleMapExport() {
    const stageNum = parseInt(document.getElementById('admin-stage-select').value);
    const mapId = document.getElementById('admin-map-id').value || `stage${stageNum}_map${Date.now()}`;
    const allEntities = [
      ...this.mapData.layers.traps,
      ...this.mapData.layers.entities
    ].map(e=>({type:e.type+':'+e.subtype, x:e.x, y:e.y, properties:e.properties}));
    return {
      id: mapId,
      stage: stageNum,
      layout: this._buildLayoutGrid(),
      entities: allEntities,
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        objectCount: Object.values(this.mapData.layers).flat().length
      }
    };
  }

  _buildLayoutGrid() {
    // 0=empty, encode platform subtypes as numeric codes
    const subtypeCode = {grass:1,stone:2,wood:3,metal:4,ice:5,moving:6,crumbling:7,bounce:8};
    const grid = Array.from({length:19},()=>Array(25).fill(0));
    [...this.mapData.layers.background,...this.mapData.layers.platforms,...this.mapData.layers.foreground]
      .forEach(obj=>{ if (obj.gridY>=0&&obj.gridY<19&&obj.gridX>=0&&obj.gridX<25)
        grid[obj.gridY][obj.gridX] = subtypeCode[obj.subtype]||1; });
    return grid;
  }

  // ─── Push map to stage array & localStorage ──────────────
  pushToStage() {
    const single = this._buildSingleMapExport();
    const stageNum = single.stage;
    // Remove existing map with same id, then push
    this.stages[stageNum].maps = this.stages[stageNum].maps.filter(m=>m.id!==single.id);
    // Merge full layers into the saved copy
    const saved = JSON.parse(JSON.stringify(this.mapData));
    saved.id = single.id;
    saved.stage = stageNum;
    saved.exportJson = single;
    this.stages[stageNum].maps.push(saved);
    // Reshuffle pool
    this.stages[stageNum].shufflePool = [...this.stages[stageNum].maps].sort(()=>Math.random()-0.5);
    this._saveToLocalStorage();
    alert(`✅ Map "${single.id}" pushed to Stage ${stageNum}!\nTotal maps in stage: ${this.stages[stageNum].maps.length}\n\nRandomization pool reshuffled.`);
    document.getElementById('export-modal').classList.add('hidden');
  }

  exportAdminMap() {
    const single = this._buildSingleMapExport();
    this.currentExportData = { single, stage: this.stages[single.stage], all: this._buildAllStagesExport() };
    this._showExportTab('single');
    document.getElementById('export-modal').classList.remove('hidden');
  }

  exportAllStages() {
    const stageNum = parseInt(document.getElementById('admin-stage-select').value);
    const single = this._buildSingleMapExport();
    this.currentExportData = { single, stage: this.stages[stageNum], all: this._buildAllStagesExport() };
    this._showExportTab('all');
    document.getElementById('export-modal').classList.remove('hidden');
  }

  _buildAllStagesExport() {
    const out = { stages:{}, metadata:{ totalStages:9, version:'1.0', exportDate:new Date().toISOString() } };
    for (let i=1;i<=9;i++) {
      out.stages[i] = {
        maps: this.stages[i].maps.map(m=>m.exportJson||{id:m.id}),
        count: this.stages[i].maps.length
      };
    }
    return out;
  }

  switchExportTab(tab) {
    document.querySelectorAll('.export-tab').forEach((t,i)=>{
      t.classList.toggle('active', ['single','stage','all'][i]===tab);
    });
    this._showExportTab(tab);
  }

  _showExportTab(tab) {
    if (!this.currentExportData) return;
    const data = tab==='single' ? this.currentExportData.single
               : tab==='stage'  ? this.currentExportData.stage
               :                  this.currentExportData.all;
    document.getElementById('export-json').textContent = JSON.stringify(data, null, 2);
    document.getElementById('export-modal').dataset.filename = `${tab}_export.json`;
    document.getElementById('export-modal').dataset.data = JSON.stringify(data);
  }

  showExportModal(data, filename) {
    const modal = document.getElementById('export-modal');
    document.getElementById('export-json').textContent = JSON.stringify(data, null, 2);
    modal.classList.remove('hidden');
    modal.dataset.filename = filename;
    modal.dataset.data = JSON.stringify(data);
  }

  closeModal() { document.getElementById('export-modal').classList.add('hidden'); }

  copyToClipboard() {
    const data = document.getElementById('export-modal').dataset.data;
    navigator.clipboard.writeText(data).then(()=>alert('Copied to clipboard!')).catch(()=>{
      // fallback
      const ta=document.createElement('textarea'); ta.value=data;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta); alert('Copied!');
    });
  }

  downloadStage() {
    const modal = document.getElementById('export-modal');
    const blob = new Blob([modal.dataset.data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download=modal.dataset.filename||'map_export.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ─── Community Map Browser ───────────────────────────────
  // Called when entering community mode
  _initCommunityBrowser() {
    this._commActiveStage = 'all';
    this._commPreviewMap  = null;
    this._buildStageFilterTabs();
    this._renderMapGrid();
  }

  _buildStageFilterTabs() {
    const container = document.getElementById('comm-stage-tabs');
    if (!container) return;
    const stages = ['all',1,2,3,4,5,6,7,8,9];
    const labels = { all:'All Stages',1:'S1',2:'S2',3:'S3',4:'S4',5:'S5',6:'S6',7:'S7',8:'S8',9:'S9' };
    container.innerHTML = stages.map(s=>`
      <button class="comm-stage-tab${s===this._commActiveStage?' active':''}"
              onclick="app._commFilterStage(${JSON.stringify(s)})">${labels[s]}</button>
    `).join('');
  }

  _commFilterStage(stage) {
    this._commActiveStage = stage;
    this._buildStageFilterTabs();
    this._renderMapGrid();
  }

  _renderMapGrid() {
    const grid  = document.getElementById('comm-map-grid');
    const empty = document.getElementById('comm-empty');
    const countEl = document.getElementById('comm-map-count');
    if (!grid) return;

    // Collect all maps from all stages
    const allMaps = [];
    for (let i=1; i<=9; i++) {
      this.stages[i].maps.forEach(m => allMaps.push({ ...m, _stage: i }));
    }

    // Filter by selected stage
    const filtered = this._commActiveStage === 'all'
      ? allMaps
      : allMaps.filter(m => m._stage === this._commActiveStage);

    if (countEl) countEl.textContent = `${filtered.length} map${filtered.length!==1?'s':''}`;

    if (!filtered.length) {
      grid.style.display = 'none';
      empty.style.display = 'flex';
      return;
    }
    grid.style.display = 'grid';
    empty.style.display = 'none';

    const stageNames = {1:'Tutorial',2:'Forest',3:'Caves',4:'Castle',5:'Dungeon',6:'Sewers',7:'Tower',8:'Hell',9:'Final'};

    grid.innerHTML = filtered.map((m, idx) => {
      const total = Object.values(m.layers||{}).flat().length;
      const platforms = (m.layers?.platforms||[]).length;
      const traps     = (m.layers?.traps||[]).length;
      const entities  = (m.layers?.entities||[]).length;
      const date = m.exportJson?.metadata?.exportDate
        ? new Date(m.exportJson.metadata.exportDate).toLocaleDateString()
        : '—';
      return `
        <div class="map-card" onclick="app._commOpenPreview(${idx})">
          <div class="map-card-thumb">
            <canvas class="comm-thumb-canvas" data-mapidx="${idx}" width="280" height="140"></canvas>
            <span class="map-card-stage-badge">Stage ${m._stage} · ${stageNames[m._stage]||''}</span>
          </div>
          <div class="map-card-body">
            <div class="map-card-id">📄 ${m.id}</div>
            <div class="map-card-stats">
              <span class="map-stat">🧱 ${platforms} platforms</span>
              <span class="map-stat">⚠️ ${traps} traps</span>
              <span class="map-stat">👾 ${entities} entities</span>
              <span class="map-stat">📦 ${total} total</span>
            </div>
          </div>
          <div class="map-card-footer">
            <span class="map-card-date">🕒 ${date}</span>
            <span style="font-size:0.75rem;color:var(--success)">Click to preview →</span>
          </div>
        </div>
      `;
    }).join('');

    // Store filtered list for preview use
    this._commFiltered = filtered;

    // Render thumbnails after DOM update
    requestAnimationFrame(() => this._renderAllThumbnails(filtered));
  }

  _renderAllThumbnails(maps) {
    document.querySelectorAll('.comm-thumb-canvas').forEach((canvas, i) => {
      const m = maps[i];
      if (!m) return;
      this._drawMapToCanvas(canvas, m, 280, 140);
    });
  }

  _drawMapToCanvas(canvas, mapData, w, h) {
    const ctx = canvas.getContext('2d');
    const gs  = 32;
    const scaleX = w / (25 * gs);
    const scaleY = h / (19 * gs);
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, w, h);
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let x=0; x<w; x+=gs*scaleX) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y=0; y<h; y+=gs*scaleY) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    // Objects
    const colors = {
      platform:{grass:'#4ecca3',stone:'#8b8b8b',wood:'#8b4513',metal:'#b0b0b0',ice:'#a8e6ff',moving:'#f9a826',crumbling:'#d4a373',bounce:'#ff6b9d'},
      trap:{spikes:'#e94560',saw:'#ff6b6b',lava:'#ff4500',arrow:'#f9a826',poison:'#4ecca3',electric:'#f9a826'},
      door:{exit:'#4ecca3',locked:'#e94560',secret:'#8b8b8b',trap:'#2c2c2c'},
      item:{coin:'#ffd700',gem:'#00bfff',key:'#f9a826',potion:'#ff6b9d',chest:'#8b4513',powerup:'#f9a826'},
      spawn:{player:'#4ecca3',checkpoint:'#f9a826'},
      mob:{slime:'#4ecca3',goblin:'#7cb342',skeleton:'#e0e0e0',bat:'#5c4d7d',boss:'#e94560'}
    };
    ['background','platforms','traps','entities','foreground'].forEach(layer => {
      (mapData.layers?.[layer]||[]).forEach(obj => {
        ctx.fillStyle = colors[obj.type]?.[obj.subtype] || '#ffffff';
        ctx.fillRect(obj.gridX*gs*scaleX, obj.gridY*gs*scaleY, gs*scaleX-1, gs*scaleY-1);
      });
    });
  }

  _commOpenPreview(idx) {
    const m = this._commFiltered?.[idx];
    if (!m) return;
    this._commPreviewMap = m;
    // Title
    document.getElementById('comm-preview-title').textContent = `📄 ${m.id}`;
    // Draw large preview
    const canvas = document.getElementById('comm-preview-canvas');
    this._drawMapToCanvas(canvas, m, 400, 304);
    // Meta info
    const stageNames = {1:'Tutorial',2:'Forest',3:'Caves',4:'Castle',5:'Dungeon',6:'Sewers',7:'Tower',8:'Hell',9:'Final'};
    const total = Object.values(m.layers||{}).flat().length;
    const date  = m.exportJson?.metadata?.exportDate
      ? new Date(m.exportJson.metadata.exportDate).toLocaleString() : '—';
    document.getElementById('comm-preview-meta').innerHTML = `
      <div style="background:var(--bg-dark);border-radius:8px;padding:0.8rem;border:1px solid var(--border);display:flex;flex-direction:column;gap:0.5rem">
        <div style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em">Map Details</div>
        <div><span style="color:var(--text-muted)">ID</span><br><span style="font-family:monospace;color:var(--text)">${m.id}</span></div>
        <div><span style="color:var(--text-muted)">Stage</span><br><span style="color:var(--success)">${m._stage} — ${stageNames[m._stage]||''}</span></div>
        <div><span style="color:var(--text-muted)">Objects</span><br>
          🧱 ${(m.layers?.platforms||[]).length} platforms &nbsp;
          ⚠️ ${(m.layers?.traps||[]).length} traps<br>
          👾 ${(m.layers?.entities||[]).length} entities &nbsp;
          📦 ${total} total
        </div>
        <div><span style="color:var(--text-muted)">Saved</span><br><span style="font-size:0.8rem">${date}</span></div>
        <div><span style="color:var(--text-muted)">Grid</span><br>25 × 19 tiles</div>
      </div>
    `;
    document.getElementById('comm-preview-modal').classList.remove('hidden');
  }

  commClosePreview() {
    document.getElementById('comm-preview-modal').classList.add('hidden');
    this._commPreviewMap = null;
  }

  commDownloadMap() {
    if (!this._commPreviewMap) return;
    const data = this._commPreviewMap.exportJson || this._commPreviewMap;
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download=`${this._commPreviewMap.id}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  commDownloadAll() {
    const all = this._buildAllStagesExport();
    const blob = new Blob([JSON.stringify(all, null, 2)], {type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download='all_dev_maps.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Boot
const app = new MapMaker();