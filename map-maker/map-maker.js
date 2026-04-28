const fs = require("fs");

/**
 * The original Python script defined a variable 'js_content' containing JavaScript code
 * and then wrote that content to a file. This translation maintains that functionality
 * using Node.js and the 'fs' module.
 */

const js_content = `/ ===== MAP MAKER SYSTEM =====
// Admin & Community Level Editor

class MapMaker {
  constructor() {
    this.mode = null; // 'admin' or 'community'
    this.canvas = null;
    this.ctx = null;
    this.gridSize = 32;
    this.zoom = 1;
    this.currentTool = "brush";
    this.selectedAsset = null;
    this.isDrawing = false;
    this.mapData = {
      width: 25,
      height: 19,
      layers: {
        background: [],
        platforms: [],
        traps: [],
        entities: [],
        foreground: [],
      },
      metadata: {
        name: "",
        author: "",
        difficulty: "medium",
        version: "1.0",
      },
    };
    this.stages = {};
    this.history = [];
    this.historyIndex = -1;
    this.activeLayer = "platforms";

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeStages();
  }

  // ===== MODE SELECTION =====
  setMode(mode) {
    this.mode = mode;
    document.getElementById("mode-selector").classList.add("hidden");

    if (mode === "admin") {
      document.getElementById("admin-interface").classList.remove("hidden");
      this.canvas = document.getElementById("map-canvas");
      this.setupAdminCanvas();
    } else {
      document.getElementById("community-interface").classList.remove("hidden");
      this.canvas = document.getElementById("community-canvas");
      this.setupCommunityCanvas();
    }

    this.ctx = this.canvas.getContext("2d");
    this.render();
  }

  backToMenu() {
    document.getElementById("mode-selector").classList.remove("hidden");
    document.getElementById("admin-interface").classList.add("hidden");
    document.getElementById("community-interface").classList.add("hidden");
    this.mode = null;
  }

  // ===== STAGE INITIALIZATION =====
  initializeStages() {
    // Initialize empty stages 1-9 structure
    for (let i = 1; i <= 9; i++) {
      this.stages[i] = {
        baseMap: null,
        variations: [],
        randomizationRules: {
          platformVariance: 0.3,
          trapDensity: 0.5,
          itemDensity: 0.4,
          mobDensity: 0.3,
        },
      };
    }
  }

  // ===== CANVAS SETUP =====
  setupAdminCanvas() {
    this.canvas.width = 800;
    this.canvas.height = 608; // 19 tiles * 32px
    this.setupCanvasEvents();
  }

  setupCommunityCanvas() {
    this.canvas.width = 800;
    this.canvas.height = 608;
    this.setupCanvasEvents();
  }

  setupCanvasEvents() {
    // Mouse events
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.handleMouseUp());
    this.canvas.addEventListener("mouseleave", () => this.handleMouseUp());

    // Drag and drop from palette
    this.canvas.addEventListener("dragover", (e) => e.preventDefault());
    this.canvas.addEventListener("drop", (e) => this.handleDrop(e));

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  // ===== EVENT HANDLERS =====
  setupEventListeners() {
    // Tool selection
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".tool-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentTool = btn.dataset.tool;
      });
    });

    // Asset selection
    document.querySelectorAll(".asset-item").forEach((item) => {
      item.addEventListener("click", () => {
        document
          .querySelectorAll(".asset-item")
          .forEach((i) => i.classList.remove("selected"));
        item.classList.add("selected");
        this.selectedAsset = {
          type: item.dataset.type,
          subtype: item.dataset.subtype,
        };
      });

      item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData(
          "asset",
          JSON.stringify({
            type: item.dataset.type,
            subtype: item.dataset.subtype,
          }),
        );
      });
    });

    // Layer selection
    document.querySelectorAll(".layer-item").forEach((layer) => {
      layer.addEventListener("click", () => {
        this.activeLayer = layer.dataset.layer;
        document
          .querySelectorAll(".layer-item")
          .forEach((l) => l.classList.remove("active"));
        layer.classList.add("active");
      });
    });

    // Difficulty slider
    const diffSlider = document.getElementById("difficulty-var");
    if (diffSlider) {
      diffSlider.addEventListener("input", (e) => {
        document.getElementById("diff-val").textContent = e.target.value + "%";
      });
    }
  }

  handleMouseDown(e) {
    if (!this.selectedAsset && this.currentTool === "brush") return;

    this.isDrawing = true;
    const pos = this.getMousePos(e);

    if (this.currentTool === "brush") {
      this.placeObject(pos.x, pos.y, this.selectedAsset);
    } else if (this.currentTool === "eraser") {
      this.removeObject(pos.x, pos.y);
    } else if (this.currentTool === "fill") {
      this.fillArea(pos.x, pos.y);
    }
  }

  handleMouseMove(e) {
    const pos = this.getMousePos(e);
    document.getElementById("coord-x").textContent = Math.floor(
      pos.x / this.gridSize,
    );
    document.getElementById("coord-y").textContent = Math.floor(
      pos.y / this.gridSize,
    );

    if (this.isDrawing) {
      if (this.currentTool === "brush" && this.selectedAsset) {
        this.placeObject(pos.x, pos.y, this.selectedAsset);
      } else if (this.currentTool === "eraser") {
        this.removeObject(pos.x, pos.y);
      }
    }
  }

  handleMouseUp() {
    this.isDrawing = false;
  }

  handleDrop(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("asset"));
    const pos = this.getMousePos(e);
    this.placeObject(pos.x, pos.y, data);
  }

  handleKeyDown(e) {
    // Tool shortcuts
    switch (e.key.toLowerCase()) {
      case "b":
        this.setTool("brush");
        break;
      case "e":
        this.setTool("eraser");
        break;
      case "f":
        this.setTool("fill");
        break;
      case "s":
        this.setTool("select");
        break;
      case "m":
        this.setTool("move");
        break;
      case "z":
        if (e.ctrlKey) this.undo();
        break;
      case "y":
        if (e.ctrlKey) this.redo();
        break;
    }
  }

  // ===== MAP OPERATIONS =====
  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / this.zoom,
      y: (e.clientY - rect.top) / this.zoom,
    };
  }

  placeObject(x, y, asset) {
    const gridX = Math.floor(x / this.gridSize);
    const gridY = Math.floor(y / this.gridSize);

    // Remove existing object at position
    this.removeObjectAt(gridX, gridY);

    // Add new object
    const obj = {
      id: Date.now() + Math.random(),
      type: asset.type,
      subtype: asset.subtype,
      x: gridX * this.gridSize,
      y: gridY * this.gridSize,
      width: this.gridSize,
      height: this.gridSize,
      gridX,
      gridY,
      properties: this.getDefaultProperties(asset),
    };

    this.mapData.layers[this.activeLayer].push(obj);
    this.saveState();
    this.render();
    this.updateObjectCount();
  }

  removeObject(x, y) {
    const gridX = Math.floor(x / this.gridSize);
    const gridY = Math.floor(y / this.gridSize);
    this.removeObjectAt(gridX, gridY);
    this.saveState();
    this.render();
    this.updateObjectCount();
  }

  removeObjectAt(gridX, gridY) {
    Object.keys(this.mapData.layers).forEach((layer) => {
      this.mapData.layers[layer] = this.mapData.layers[layer].filter(
        (obj) => obj.gridX !== gridX || obj.gridY !== gridY,
      );
    });
  }

  getDefaultProperties(asset) {
    const defaults = {
      platform: { solid: true, friction: 1.0 },
      trap: { damage: 10, active: true },
      door: { locked: false, destination: "" },
      item: { value: 1, respawn: false },
      spawn: { team: "player", cooldown: 0 },
      mob: { hp: 100, aggro: false, patrol: false },
    };
    return defaults[asset.type] || {};
  }

  fillArea(x, y) {
    // Simple fill implementation
    const gridX = Math.floor(x / this.gridSize);
    const gridY = Math.floor(y / this.gridSize);

    if (!this.selectedAsset) return;

    // Fill 3x3 area
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        this.placeObject(
          (gridX + dx) * this.gridSize,
          (gridY + dy) * this.gridSize,
          this.selectedAsset,
        );
      }
    }
  }

  setTool(tool) {
    this.currentTool = tool;
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tool === tool);
    });
  }

  zoom(delta) {
    this.zoom = Math.max(0.5, Math.min(2, this.zoom + delta));
    document.getElementById("zoom-level").textContent =
      Math.round(this.zoom * 100) + "%";
    this.canvas.style.transform = \`scale(\${this.zoom})\`;
  }

  // ===== HISTORY =====
  saveState() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.parse(JSON.stringify(this.mapData)));
    this.historyIndex++;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.mapData = JSON.parse(
        JSON.stringify(this.history[this.historyIndex]),
      );
      this.render();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.mapData = JSON.parse(
        JSON.stringify(this.history[this.historyIndex]),
      );
      this.render();
    }
  }

  // ===== RENDERING =====
  render() {
    // Clear canvas
    this.ctx.fillStyle = "#16213e";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.drawGrid();

    // Draw objects by layer
    const layerOrder = [
      "background",
      "platforms",
      "traps",
      "entities",
      "foreground",
    ];
    layerOrder.forEach((layer) => {
      this.mapData.layers[layer].forEach((obj) => this.drawObject(obj));
    });
  }

  drawGrid() {
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  drawObject(obj) {
    const colors = {
      platform: {
        grass: "#4ecca3",
        stone: "#8b8b8b",
        wood: "#8b4513",
        metal: "#b0b0b0",
        ice: "#a8e6ff",
        moving: "#f9a826",
        crumbling: "#d4a373",
        bounce: "#ff6b9d",
      },
      trap: {
        spikes: "#e94560",
        saw: "#ff6b6b",
        lava: "#ff4500",
        arrow: "#f9a826",
        poison: "#4ecca3",
        electric: "#f9a826",
      },
      door: {
        exit: "#4ecca3",
        locked: "#e94560",
        secret: "#8b8b8b",
        trap: "#2c2c2c",
      },
      item: {
        coin: "#ffd700",
        gem: "#00bfff",
        key: "#f9a826",
        potion: "#ff6b9d",
        chest: "#8b4513",
        powerup: "#f9a826",
      },
      spawn: { player: "#4ecca3", checkpoint: "#f9a826" },
      mob: {
        slime: "#4ecca3",
        goblin: "#7cb342",
        skeleton: "#e0e0e0",
        bat: "#5c4d7d",
        boss: "#e94560",
      },
    };

    const color = colors[obj.type]?.[obj.subtype] || "#fff";

    this.ctx.fillStyle = color;
    this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

    // Draw border
    this.ctx.strokeStyle = "rgba(0,0,0,0.3)";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

    // Draw icon/symbol
    this.ctx.fillStyle = "rgba(0,0,0,0.5)";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const symbols = {
      platform: "▬",
      trap: "⚠",
      door: "⛩",
      item: "◆",
      spawn: "○",
      mob: "👾",
    };

    this.ctx.fillText(
      symbols[obj.type] || "?",
      obj.x + obj.width / 2,
      obj.y + obj.height / 2,
    );
  }

  updateObjectCount() {
    const count = Object.values(this.mapData.layers).flat().length;
    document.getElementById("object-count").textContent = \`Objects: \${count}\`;
  }

  // ===== RANDOMIZATION ALGORITHM =====
  randomizeMap() {
    const seed =
      document.getElementById("rand-seed-value").value || Date.now().toString();
    const rng = this.seededRandom(seed);

    const settings = {
      platforms: document.getElementById("rand-platforms")?.checked,
      traps: document.getElementById("rand-traps")?.checked,
      items: document.getElementById("rand-items")?.checked,
      mobs: document.getElementById("rand-mobs")?.checked,
    };

    const difficulty =
      parseInt(document.getElementById("difficulty-var")?.value || 50) / 100;

    // Create variation based on current map
    const variation = JSON.parse(JSON.stringify(this.mapData));

    if (settings.platforms) {
      variation.layers.platforms = this.randomizePlatforms(
        variation.layers.platforms,
        rng,
        difficulty,
      );
    }
    if (settings.traps) {
      variation.layers.traps = this.randomizeTraps(
        variation.layers.traps,
        rng,
        difficulty,
      );
    }
    if (settings.items) {
      variation.layers.entities = this.randomizeItems(
        variation.layers.entities,
        rng,
        difficulty,
      );
    }
    if (settings.mobs) {
      variation.layers.entities = this.randomizeMobs(
        variation.layers.entities,
        rng,
        difficulty,
      );
    }

    // Store variation
    const stageNum = parseInt(
      document.getElementById("admin-stage-select").value,
    );
    this.stages[stageNum].variations.push({
      seed,
      data: variation,
      difficulty: difficulty * 100,
    });

    alert(
      \`Map randomized with seed: \${seed}\\nVariations for Stage \${stageNum}: \${this.stages[stageNum].variations.length}\`,
    );
  }

  seededRandom(seed) {
    let s = 0;
    for (let i = 0; i < seed.length; i++) {
      s += seed.charCodeAt(i);
    }
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  randomizePlatforms(platforms, rng, difficulty) {
    // Shuffle positions slightly
    return platforms.map((p) => {
      if (rng() > 0.7) {
        const offsetX = Math.floor(rng() * 3) - 1;
        const offsetY = Math.floor(rng() * 2) - 1;
        return {
          ...p,
          gridX: Math.max(0, Math.min(24, p.gridX + offsetX)),
          gridY: Math.max(0, Math.min(18, p.gridY + offsetY)),
          x: Math.max(0, Math.min(24, p.gridX + offsetX)) * this.gridSize,
          y: Math.max(0, Math.min(18, p.gridY + offsetY)) * this.gridSize,
        };
      }
      return p;
    });
  }

  randomizeTraps(traps, rng, difficulty) {
    // Add/remove traps based on difficulty
    const newTraps = [...traps];
    if (difficulty > 0.5 && rng() > 0.5) {
      // Add extra trap
      newTraps.push({
        id: Date.now(),
        type: "trap",
        subtype: ["spikes", "saw", "arrow"][Math.floor(rng() * 3)],
        x: Math.floor(rng() * 25) * this.gridSize,
        y: Math.floor(rng() * 19) * this.gridSize,
        width: this.gridSize,
        height: this.gridSize,
        gridX: Math.floor(rng() * 25),
        gridY: Math.floor(rng() * 19),
        properties: { damage: 10 * difficulty },
      });
    }
    return newTraps;
  }

  randomizeItems(entities, rng, difficulty) {
    // Randomize item positions
    return entities.map((e) => {
      if (e.type === "item" && rng() > 0.6) {
        return {
          ...e,
          gridX: Math.floor(rng() * 25),
          gridY: Math.floor(rng() * 19),
          x: Math.floor(rng() * 25) * this.gridSize,
          y: Math.floor(rng() * 19) * this.gridSize,
        };
      }
      return e;
    });
  }

  randomizeMobs(entities, rng, difficulty) {
    // Adjust mob count based on difficulty
    const mobs = entities.filter((e) => e.type === "mob");
    const targetMobCount = Math.floor(3 + difficulty * 10);

    while (mobs.length < targetMobCount) {
      mobs.push({
        id: Date.now() + rng(),
        type: "mob",
        subtype: ["slime", "goblin", "bat"][Math.floor(rng() * 3)],
        x: Math.floor(rng() * 25) * this.gridSize,
        y: Math.floor(rng() * 19) * this.gridSize,
        width: this.gridSize,
        height: this.gridSize,
        gridX: Math.floor(rng() * 25),
        gridY: Math.floor(rng() * 19),
        properties: { hp: 100, aggro: difficulty > 0.7 },
      });
    }

    return [...entities.filter((e) => e.type !== "mob"), ...mobs];
  }

  // ===== EXPORT FUNCTIONS =====
  exportAdminMap() {
    const stageNum = document.getElementById("admin-stage-select").value;
    const exportData = {
      stage: parseInt(stageNum),
      baseMap: this.mapData,
      variations: this.stages[stageNum].variations,
      randomizationRules: {
        seed: document.getElementById("rand-seed-value").value || "random",
        platformVariance: document.getElementById("rand-platforms")?.checked,
        trapDensity:
          parseInt(document.getElementById("difficulty-var")?.value || 50) /
          100,
        algorithm: "perlin-seeded",
      },
      exportDate: new Date().toISOString(),
    };

    this.showExportModal(exportData, \`stage\${stageNum}_map.json\`);
  }

  exportAllStages() {
    const allStages = {
      stages: this.stages,
      metadata: {
        totalStages: 9,
        version: "1.0",
        exportDate: new Date().toISOString(),
      },
    };

    this.showExportModal(allStages, "all_stages.json");
  }

  showExportModal(data, filename) {
    const modal = document.getElementById("export-modal");
    const preview = document.getElementById("export-json");

    preview.textContent = JSON.stringify(data, null, 2);
    modal.classList.remove("hidden");
    modal.dataset.filename = filename;
    modal.dataset.data = JSON.stringify(data);
  }

  closeModal() {
    document.getElementById("export-modal").classList.add("hidden");
  }

  copyToClipboard() {
    const data = document.getElementById("export-modal").dataset.data;
    navigator.clipboard.writeText(data).then(() => {
      alert("Copied to clipboard!");
    });
  }

  downloadStage() {
    const modal = document.getElementById("export-modal");
    const data = modal.dataset.data;
    const filename = modal.dataset.filename;

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ===== COMMUNITY FUNCTIONS =====
  newMap() {
    this.mapData = {
      width: 25,
      height: 19,
      layers: {
        background: [],
        platforms: [],
        traps: [],
        entities: [],
        foreground: [],
      },
      metadata: { name: "", author: "", difficulty: "medium", version: "1.0" },
    };
    this.render();
  }

  loadMap() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        this.mapData = JSON.parse(event.target.result);
        this.render();
      };
      reader.readAsText(file);
    };
    input.click();
  }

  saveToServer() {
    const levelData = {
      ...this.mapData,
      metadata: {
        name: document.getElementById("level-name").value || "Untitled",
        description: document.getElementById("level-desc").value,
        difficulty: document.getElementById("level-difficulty").value,
        author: document.getElementById("author-name").value || "Anonymous",
        created: new Date().toISOString(),
        type: "community",
      },
    };

    // Simulate server upload
    console.log("Uploading to server:", levelData);
    alert(
      \`Level "\${levelData.metadata.name}" uploaded to community server!\\n\\nIn production, this would POST to your game server API.\`,
    );
  }
}

// // Initialize app
 const app = new MapMaker();
`;

// with open('/mnt/agents/output/map-maker.js', 'w') as f:
//     f.write(js_content)
fs.writeFileSync("/mnt/agents/output/map-maker.js", js_content);
