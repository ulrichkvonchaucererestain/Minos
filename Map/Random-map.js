var MINOS_MAP_DEATH_COUNT_KEY = "minos-map-death-count";

function getMapDeathCount() {
  var saved = parseInt(localStorage.getItem(MINOS_MAP_DEATH_COUNT_KEY), 10);
  return isNaN(saved) ? 0 : saved;
}

function markPlayerDeathForNextMap() {
  var nextCount = Math.min(getMapDeathCount() + 1, 2);
  localStorage.setItem(MINOS_MAP_DEATH_COUNT_KEY, String(nextCount));
}

function getRandomMapSprite() {
  var maps = [
    typeof SPRITE_MAP !== "undefined" ? SPRITE_MAP : null,
    typeof SPRITE_MAP2 !== "undefined" ? SPRITE_MAP2 : null,
    typeof SPRITE_MAP3 !== "undefined" ? SPRITE_MAP3 : null,
  ];

  var deathCount = getMapDeathCount();
  var selected = maps[deathCount] || maps[0] || maps[1] || maps[2];

  if (!selected) {
    console.error("No SPRITE_MAP found. Check map.js script order.");
    return null;
  }

  console.log("Using map sprite:", "SPRITE_MAP" + (deathCount + 1));
  return selected;
}
