
(function() {
  var STORAGE_KEY = "minos_edu_demo_inventory_v2";
  var MAX_ITEMS = 5;
  var QUESTIONS = [{"q": "What does HTML stand for?", "choices": ["HyperText Markup Language", "HighText Machine Language", "Hyper Tool Multi Language"], "answer": 0}, {"q": "What is 12 ÷ 3?", "choices": ["3", "4", "5"], "answer": 1}, {"q": "What is the capital of the Philippines?", "choices": ["Cebu", "Manila", "Davao"], "answer": 1}, {"q": "Which planet is known as the Red Planet?", "choices": ["Venus", "Mars", "Jupiter"], "answer": 1}, {"q": "Which gas do humans need to breathe?", "choices": ["Oxygen", "Helium", "Carbon"], "answer": 0}, {"q": "Which device is used to point and click?", "choices": ["Mouse", "Monitor", "Speaker"], "answer": 0}, {"q": "What is 9 + 7?", "choices": ["15", "16", "17"], "answer": 1}, {"q": "Which part of a plant absorbs water?", "choices": ["Leaf", "Root", "Flower"], "answer": 1}];
  var lastE = false;
  var itemState = null;

  var STAGE_ITEMS = {
    1: [
      { platform: 2, type: "book", icon: "📘", name: "Book" },
      { platform: 6, type: "feather", icon: "🪶", name: "Feather" },
      { platform: 11, type: "scroll", icon: "📜", name: "Scroll" },
      { platform: 15, type: "tablet", icon: "🪨", name: "Tablet" }
    ],
    2: [
      { platform: 1, type: "book", icon: "📘", name: "Book" },
      { platform: 5, type: "feather", icon: "🪶", name: "Feather" },
      { platform: 10, type: "scroll", icon: "📜", name: "Scroll" },
      { platform: 16, type: "tablet", icon: "🪨", name: "Tablet" }
    ],
    3: [
      { platform: 1, type: "book", icon: "📘", name: "Book" },
      { platform: 4, type: "feather", icon: "🪶", name: "Feather" },
      { platform: 9, type: "scroll", icon: "📜", name: "Scroll" },
      { platform: 14, type: "tablet", icon: "🪨", name: "Tablet" }
    ],
    4: [
      { platform: 1, type: "book", icon: "📘", name: "Book" },
      { platform: 5, type: "feather", icon: "🪶", name: "Feather" },
      { platform: 12, type: "scroll", icon: "📜", name: "Scroll" },
      { platform: 18, type: "tablet", icon: "🪨", name: "Tablet" }
    ]
  };

  function getStageNumber() {
    var m = (location.pathname || "").match(/stage(\d+)\.html/i);
    return m ? parseInt(m[1], 10) : 0;
  }

  function loadInventory() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.slice(0, MAX_ITEMS) : [];
    } catch (e) {
      return [];
    }
  }

  function saveInventory(inv) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(inv || []));
    } catch (e) {}
  }

  function ensureInventoryUI() {
    if (document.getElementById("inventory-wrap")) return;
    var wrap = document.createElement("div");
    wrap.id = "inventory-wrap";
    wrap.style.position = "fixed";
    wrap.style.right = "24px";
    wrap.style.bottom = "86px";
    wrap.style.zIndex = "25";
    wrap.style.minWidth = "230px";
    wrap.style.padding = "12px 14px";
    wrap.style.border = "1px solid rgba(214,168,67,.35)";
    wrap.style.borderRadius = "14px";
    wrap.style.background = "rgba(10,6,8,.72)";
    wrap.style.boxShadow = "0 0 20px rgba(0,0,0,.35)";
    wrap.style.backdropFilter = "blur(4px)";
    wrap.innerHTML =
      '<div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#d4a843;margin-bottom:8px;">Inventory <span id="inventory-count" style="color:#f0d18a;"></span></div>' +
      '<div id="inventory-ui" style="display:flex;gap:8px;flex-wrap:wrap;"></div>';
    document.body.appendChild(wrap);
  }

  function updateInventoryUI() {
    ensureInventoryUI();
    var ui = document.getElementById("inventory-ui");
    var count = document.getElementById("inventory-count");
    if (!ui || !count) return;
    var inv = loadInventory();
    count.textContent = "(" + inv.length + "/" + MAX_ITEMS + ")";
    ui.innerHTML = "";
    for (var i = 0; i < MAX_ITEMS; i++) {
      var slot = document.createElement("div");
      slot.style.width = "36px";
      slot.style.height = "36px";
      slot.style.border = "1px solid rgba(212,168,67,.45)";
      slot.style.borderRadius = "8px";
      slot.style.display = "flex";
      slot.style.alignItems = "center";
      slot.style.justifyContent = "center";
      slot.style.background = "rgba(24,13,12,.86)";
      slot.style.color = "#f0d18a";
      slot.style.fontSize = "18px";
      slot.textContent = inv[i] ? inv[i].icon : "";
      slot.title = inv[i] ? inv[i].name : "Empty";
      ui.appendChild(slot);
    }
  }

  function showEduBadge(msg) {
    var d = document.createElement("div");
    d.textContent = msg;
    d.style.position = "fixed";
    d.style.left = "50%";
    d.style.bottom = "146px";
    d.style.transform = "translateX(-50%)";
    d.style.padding = "8px 14px";
    d.style.border = "1px solid rgba(212,168,67,.5)";
    d.style.borderRadius = "10px";
    d.style.background = "rgba(14,8,10,.88)";
    d.style.color = "#f0d18a";
    d.style.letterSpacing = "1px";
    d.style.fontSize = "13px";
    d.style.zIndex = "40";
    d.style.boxShadow = "0 0 18px rgba(0,0,0,.35)";
    document.body.appendChild(d);
    setTimeout(function() {
      if (d.parentNode) d.parentNode.removeChild(d);
    }, 1400);
  }

  function addItemToInventory(item) {
    var inv = loadInventory();
    if (inv.length >= MAX_ITEMS) {
      showEduBadge("Inventory full (5/5)");
      return false;
    }
    inv.push({ type: item.type, name: item.name, icon: item.icon });
    saveInventory(inv);
    updateInventoryUI();
    showEduBadge(item.name + " added");
    return true;
  }

  function askQuestion(item) {
    var q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    var text = item.name + "\n\n" + q.q + "\n\n";
    for (var i = 0; i < q.choices.length; i++) {
      text += (i + 1) + ". " + q.choices[i] + "\n";
    }
    var ans = window.prompt(text + "\nType 1, 2, or 3");
    if (ans === null) return;
    var idx = parseInt(ans, 10) - 1;
    if (idx === q.answer) {
      if (window.PL && typeof window.PL.stamina === "number" && typeof window.STAM_MAX !== "undefined") {
        window.PL.stamina = Math.min(window.STAM_MAX, window.PL.stamina + 18);
      }
      showEduBadge("Correct! +18 stamina");
    } else {
      showEduBadge("Not quite. Keep learning!");
    }
  }

  function getItemsForStage() {
    if (itemState) return itemState;
    if (!window.MAP || !MAP.platforms || !MAP.platforms.length) return null;
    var stage = getStageNumber();
    var defs = STAGE_ITEMS[stage];
    if (!defs) return null;
    itemState = defs.map(function(def, i) {
      var p = MAP.platforms[Math.min(def.platform, MAP.platforms.length - 1)] || MAP.platforms[0];
      var px = p.x + Math.max(22, Math.min((p.w || 140) - 54, 34 + (i % 2) * 42));
      var py = p.y - 40;
      return {
        type: def.type,
        icon: def.icon,
        name: def.name,
        x: px,
        y: py,
        w: 34,
        h: 34,
        collected: false
      };
    });
    return itemState;
  }

  function playerIntersects(item) {
    if (!window.PL) return false;
    var px = PL.x + (window.PL_COX || 0);
    var py = PL.y + (window.PL_COY || 0);
    var pw = PL.w || 34;
    var ph = PL.h || 68;
    return px < item.x + item.w &&
           px + pw > item.x &&
           py < item.y + item.h &&
           py + ph > item.y;
  }

  function updateItems() {
    var items = getItemsForStage();
    if (!items || !window.PL) return;
    var eDown = !!(window.KEYS && window.KEYS["KeyE"]);
    var ePressed = eDown && !lastE;
    lastE = eDown;
    if (!ePressed) return;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.collected) continue;
      if (!playerIntersects(it)) continue;
      if (!addItemToInventory(it)) return;
      it.collected = true;
      if (typeof window.spawnGoldPtcls === "function") {
        spawnGoldPtcls(it.x + it.w / 2, it.y + it.h / 2);
      }
      if (it.type === "feather") {
        if (window.PL && typeof window.PL.stamina === "number" && typeof window.STAM_MAX !== "undefined") {
          window.PL.stamina = Math.min(window.STAM_MAX, window.PL.stamina + 10);
        }
        showEduBadge("Feather found! +10 stamina");
      } else {
        askQuestion(it);
      }
      break;
    }
  }

  function drawItems() {
    var items = getItemsForStage();
    if (!items || !window.TX || !window.CAM) return;
    TX.save();
    TX.textAlign = "center";
    TX.textBaseline = "middle";
    TX.font = "18px serif";
    items.forEach(function(it) {
      if (it.collected) return;
      var bob = Math.sin(Date.now() * 0.004 + it.x * 0.01) * 4;
      var sx = it.x - CAM.x;
      var sy = it.y - CAM.y + bob;
      TX.save();
      TX.globalAlpha = 0.95;
      TX.fillStyle = "rgba(18,10,10,.94)";
      TX.strokeStyle = "rgba(212,168,67,.72)";
      TX.lineWidth = 2;
      if (typeof window.roundRect === "function") {
        roundRect(TX, sx, sy, it.w, it.h, 8);
        TX.fill();
        TX.stroke();
      } else {
        TX.fillRect(sx, sy, it.w, it.h);
        TX.strokeRect(sx, sy, it.w, it.h);
      }
      TX.fillStyle = "#f0d18a";
      TX.fillText(it.icon || "?", sx + it.w / 2, sy + it.h / 2 + 1);
      TX.restore();
    });
    TX.restore();
  }

  function loop() {
    try {
      updateInventoryUI();
      updateItems();
      drawItems();
    } catch (e) {}
    requestAnimationFrame(loop);
  }

  window.addEventListener("load", function() {
    updateInventoryUI();
    requestAnimationFrame(loop);
  });
})();
