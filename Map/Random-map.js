var LAST_RANDOM_MAP_INDEX = -1;

function getRandomMapSprite() {
  var maps = [
    typeof SPRITE_MAP !== "undefined" ? SPRITE_MAP : null,
    typeof SPRITE_MAP2 !== "undefined" ? SPRITE_MAP2 : null,
    typeof SPRITE_MAP3 !== "undefined" ? SPRITE_MAP3 : null,
  ];

  var choices = maps
    .map(function (sprite, index) {
      return { sprite: sprite, index: index };
    })
    .filter(function (map) {
      return map.sprite && map.index !== LAST_RANDOM_MAP_INDEX;
    });

  if (choices.length === 0) {
    choices = maps
      .map(function (sprite, index) {
        return { sprite: sprite, index: index };
      })
      .filter(function (map) {
        return map.sprite;
      });
  }

  if (choices.length === 0) {
    console.error("No SPRITE_MAP found. Check map.js script order.");
    return null;
  }

  var selected = choices[Math.floor(Math.random() * choices.length)];
  LAST_RANDOM_MAP_INDEX = selected.index;

  console.log("Using map sprite:", LAST_RANDOM_MAP_INDEX + 1);
  return selected.sprite;
}
