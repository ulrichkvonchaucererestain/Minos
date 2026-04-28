// ── SFX (Web Audio — no crash if unsupported) ────────────────
const SFX = (function(){
  var actx = null;
  function ac(){ if(!actx){ try{ actx=new(window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return actx; }
  function beep(f,d,v,t){
    try{ var c=ac();if(!c)return;var o=c.createOscillator(),g=c.createGain();
      o.connect(g);g.connect(c.destination);o.type=t||'sine';o.frequency.value=f;
      g.gain.setValueAtTime(v||.15,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);
      o.start(c.currentTime);o.stop(c.currentTime+d); }catch(e){}
  }
  function noise(d,v){
    try{ var c=ac();if(!c)return;var b=c.createBuffer(1,c.sampleRate*d,c.sampleRate),da=b.getChannelData(0);
      for(var i=0;i<da.length;i++)da[i]=(Math.random()*2-1);
      var s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.connect(g);g.connect(c.destination);
      g.gain.setValueAtTime(v||.07,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);
      s.start(c.currentTime); }catch(e){}
  }
  return {
    jump:     function(){ beep(320,.12,.2,'square'); },
    land:     function(){ noise(.06,.07); },
    dash:     function(){ beep(200,.08,.25,'sawtooth');beep(400,.12,.15,'sawtooth'); },
    step:     function(){ noise(.04,.03); },
    portal:   function(){ beep(440,.1,.15);beep(660,.15,.12); },
    roomClear:function(){ beep(523,.1,.2);beep(659,.1,.2);beep(784,.2,.2); },
    loseLife: function(){ beep(200,.2,.3,'sawtooth');beep(150,.3,.2,'sawtooth'); },
    death:    function(){ beep(180,.4,.3,'sawtooth');beep(100,.6,.25,'sawtooth'); },
    victory:  function(){ [523,659,784,1047].forEach(function(f,i){setTimeout(function(){beep(f,.3,.25);},i*120);}); },
    spikeHit: function(){ beep(80,.1,.5,'sawtooth');beep(140,.15,.35,'sawtooth');noise(.2,.15); },
    boulderWarn: function(){ beep(180,.08,.3,'sawtooth');beep(120,.1,.2,'sawtooth'); },
    boulderHit:  function(){ noise(.18,.4);beep(90,.25,.5,'sawtooth'); },
    startBG:  function(){},
    stopBG:   function(){},
    pauseBG:  function(){}
  };
})();

// ── STAGE THEMES ─────────────────────────────────────────────
var STAGE_THEMES = [
  {name:'Entry Halls',    color:'#7a4a2a',accentColor:'#d4a843'},
  {name:'Pit Corridors',  color:'#2a3a7a',accentColor:'#4a8aff'},
  {name:'Stone Halls',    color:'#3a2a4a',accentColor:'#aa66dd'},
  {name:'Cliff Paths',    color:'#2a5a3a',accentColor:'#44cc88'},
  {name:'Ancient Ruins',  color:'#5a3a2a',accentColor:'#ff8844'},
  {name:'Forge Depths',   color:'#5a2a2a',accentColor:'#ff4444'},
  {name:'Sanctum',        color:'#2a4a5a',accentColor:'#44ccff'},
  {name:'Throne of Minos',color:'#3a2a1a',accentColor:'#ffd700'}
];

// ── ROOM DATA ────────────────────────────────────────────────
var POOLS = [
  // ── STAGE 1 ──────────────────────────────────────────
  [
    {id:'s1r1',name:'Threshold Court',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.26,h:.08},
        {x:.31, y:.84,w:.17,h:.06},
        {x:.54, y:.78,w:.14,h:.06},
        {x:.73, y:.86,w:.13,h:.06},
        {x:.89, y:.92,w:.11,h:.08}
       ],
       items:[{id:'scroll_a',label:'Stone Tablet',icon:'\u{1F4DC}',x:.56,y:.70,rp:true}],
       lore:"Runes: 'Two numbers add to 5 and multiply to 6. Find them to open the gate.'"},
      {platforms:[
        {x:0,   y:.92,w:.16,h:.08},
        {x:.20, y:.82,w:.13,h:.06},
        {x:.39, y:.72,w:.11,h:.06},
        {x:.56, y:.72,w:.11,h:.06},
        {x:.73, y:.82,w:.13,h:.06},
        {x:.90, y:.92,w:.10,h:.08}
       ],
       items:[{id:'coin_a',label:'Gold Coin',icon:'\u{1FA99}',x:.56,y:.64,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.24,h:.08},
        {x:.29, y:.86,w:.16,h:.06},
        {x:.50, y:.92,w:.14,h:.08},
        {x:.69, y:.84,w:.14,h:.06},
        {x:.87, y:.92,w:.13,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'Solve: x\u00B2 - 5x + 6 = 0',opts:['A) x=1,x=6','B) x=2,x=3','C) x=-2,x=-3','D) x=5,x=6'],ans:'B',hint:'Sum=5, product=6.',need:'scroll_a'}},
    {id:'s1r2',name:'Webbed Galleries',
     sections:[
      {platforms:[
        {x:0,   y:.90,w:.18,h:.08},
        {x:.24, y:.80,w:.11,h:.06},
        {x:.40, y:.90,w:.11,h:.06},
        {x:.56, y:.76,w:.12,h:.06},
        {x:.73, y:.86,w:.12,h:.06},
        {x:.90, y:.92,w:.10,h:.08}
       ],
       items:[{id:'torch_a',label:'Mystic Torch',icon:'\u{1F526}',x:.57,y:.68,rp:true}],
       lore:"Torch: '2 raised to the 4th, plus 4 squared. What is the sum?'"},
      {platforms:[
        {x:0,   y:.92,w:.15,h:.08},
        {x:.20, y:.82,w:.10,h:.06},
        {x:.35, y:.70,w:.10,h:.06},
        {x:.50, y:.78,w:.12,h:.06},
        {x:.67, y:.68,w:.10,h:.06},
        {x:.82, y:.82,w:.10,h:.06},
        {x:.94, y:.92,w:.06,h:.08}
       ],
       items:[{id:'gem_a',label:'Blue Gem',icon:'\u{1F48E}',x:.68,y:.60,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.18,h:.08},
        {x:.24, y:.84,w:.16,h:.06},
        {x:.45, y:.92,w:.12,h:.08},
        {x:.62, y:.82,w:.14,h:.06},
        {x:.81, y:.92,w:.19,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'What is 2\u2074 + 4\u00B2?',opts:['A) 16','B) 24','C) 32','D) 48'],ans:'C',hint:'16+16=?',need:'torch_a'}},
    {id:'s1r3',name:'Trial of the Low Causeway',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.20,h:.08},
        {x:.24, y:.84,w:.14,h:.06},
        {x:.43, y:.74,w:.12,h:.06},
        {x:.60, y:.84,w:.14,h:.06},
        {x:.79, y:.92,w:.21,h:.08}
       ],
       items:[{id:'bone_a',label:'Carved Bone',icon:'\u{1F9B4}',x:.44,y:.66,rp:true}],
       lore:"Bone: 'Pythagoras \u2014 right triangle legs 3 and 4. Hypotenuse?'"},
      {platforms:[
        {x:0,   y:.92,w:.14,h:.08},
        {x:.18, y:.82,w:.10,h:.06},
        {x:.33, y:.70,w:.10,h:.06},
        {x:.48, y:.60,w:.11,h:.06},
        {x:.64, y:.72,w:.11,h:.06},
        {x:.80, y:.84,w:.10,h:.06},
        {x:.93, y:.92,w:.07,h:.08}
       ],
       items:[{id:'feather_a',label:'Owl Feather',icon:'\u{1FAB6}',x:.49,y:.52,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.26,h:.08},
        {x:.31, y:.84,w:.16,h:.06},
        {x:.52, y:.92,w:.14,h:.08},
        {x:.71, y:.84,w:.12,h:.06},
        {x:.87, y:.92,w:.13,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'Right triangle legs 3,4. Hypotenuse=?',opts:['A) 5','B) 6','C) 7','D) 4.5'],ans:'A',hint:'\u221A(9+16)=\u221A25=?',need:'bone_a'}}
  ],
  // ── STAGE 2 ──────────────────────────────────────────
  [
    {id:'s2r1',name:'The Abyssal Bridge',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.15,h:.08},
        {x:.19, y:.80,w:.09,h:.06},
        {x:.31, y:.70,w:.09,h:.06},
        {x:.43, y:.80,w:.09,h:.06},
        {x:.55, y:.68,w:.09,h:.06},
        {x:.67, y:.78,w:.09,h:.06},
        {x:.79, y:.88,w:.09,h:.06},
        {x:.90, y:.92,w:.10,h:.08}
       ],
       items:[{id:'map_a',label:'Torn Map',icon:'\u{1F5FA}\uFE0F',x:.55,y:.60,rp:true}],
       lore:"Map: 'Fibonacci 1,1,2,3,5,8,_  Know the next to cross.'"},
      {platforms:[
        {x:0,   y:.92,w:.13,h:.08},
        {x:.16, y:.80,w:.09,h:.06},
        {x:.28, y:.68,w:.09,h:.06},
        {x:.40, y:.78,w:.09,h:.06},
        {x:.52, y:.66,w:.09,h:.06},
        {x:.64, y:.76,w:.09,h:.06},
        {x:.76, y:.64,w:.09,h:.06},
        {x:.88, y:.92,w:.12,h:.08}
       ],
       items:[{id:'ring_a',label:'Iron Ring',icon:'\u{1F48D}',x:.52,y:.58,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'Next: 1,1,2,3,5,8,__?',opts:['A) 11','B) 13','C) 12','D) 16'],ans:'B',hint:'5+8=?',need:'map_a'}},
    {id:'s2r2',name:'Pit of Reflections',
     sections:[
      {platforms:[
        {x:0,   y:.88,w:.14,h:.08},
        {x:.18, y:.76,w:.10,h:.06},
        {x:.31, y:.86,w:.10,h:.06},
        {x:.44, y:.74,w:.10,h:.06},
        {x:.57, y:.84,w:.10,h:.06},
        {x:.70, y:.72,w:.10,h:.06},
        {x:.83, y:.88,w:.10,h:.08},
        {x:.92, y:.92,w:.08,h:.08}
       ],
       items:[{id:'mirror_a',label:'Bronze Mirror',icon:'\u{1FA9E}',x:.70,y:.64,rp:true}],
       lore:"Mirror: 'Double me and add 6 equals 20. What am I?'"},
      {platforms:[
        {x:0,   y:.92,w:.13,h:.08},
        {x:.17, y:.80,w:.09,h:.06},
        {x:.29, y:.68,w:.09,h:.06},
        {x:.41, y:.78,w:.09,h:.06},
        {x:.53, y:.88,w:.09,h:.06},
        {x:.65, y:.76,w:.09,h:.06},
        {x:.77, y:.66,w:.09,h:.06},
        {x:.89, y:.92,w:.11,h:.08}
       ],
       items:[{id:'vial_a',label:'Glass Vial',icon:'\u{1F9EA}',x:.41,y:.70,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'2x + 6 = 20. x=?',opts:['A) 5','B) 6','C) 7','D) 8'],ans:'C',hint:'20-6=14, 14/2=?',need:'mirror_a'}},
    {id:'s2r3',name:'The Narrow Crossing',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.14,h:.08},
        {x:.18, y:.80,w:.09,h:.06},
        {x:.30, y:.70,w:.09,h:.06},
        {x:.42, y:.80,w:.09,h:.06},
        {x:.54, y:.70,w:.09,h:.06},
        {x:.66, y:.80,w:.09,h:.06},
        {x:.78, y:.70,w:.09,h:.06},
        {x:.90, y:.92,w:.10,h:.08}
       ],
       items:[{id:'compass_a',label:'Old Compass',icon:'\u{1F9ED}',x:.54,y:.62,rp:true}],
       lore:"Compass: 'Circle radius 5 \u2014 the door needs the integer area.'"},
      {platforms:[
        {x:0,   y:.92,w:.12,h:.08},
        {x:.15, y:.80,w:.08,h:.06},
        {x:.26, y:.68,w:.08,h:.06},
        {x:.37, y:.58,w:.08,h:.06},
        {x:.48, y:.68,w:.08,h:.06},
        {x:.59, y:.78,w:.08,h:.06},
        {x:.70, y:.68,w:.08,h:.06},
        {x:.81, y:.78,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'key_a',label:'Rusted Key',icon:'\u{1F5DD}\uFE0F',x:.37,y:.50,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'Circle radius 5. Area integer part?',opts:['A) 75','B) 78','C) 80','D) 85'],ans:'B',hint:'\u03C0\u002525\u224878.5',need:'compass_a'}}
  ],
  // ── STAGE 3 ──────────────────────────────────────────
  [
    {id:'s3r1',name:'The Echo Chamber',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.15,h:.08},
        {x:.19, y:.78,w:.10,h:.06},
        {x:.32, y:.66,w:.10,h:.06},
        {x:.45, y:.78,w:.10,h:.06},
        {x:.58, y:.66,w:.10,h:.06},
        {x:.71, y:.78,w:.10,h:.06},
        {x:.84, y:.92,w:.16,h:.08}
       ],
       items:[{id:'shard_a',label:'Crystal Shard',icon:'\u{1F52E}',x:.58,y:.58,rp:true}],
       lore:"Shard: '30 students, 60% passed. How many failed?'"},
      {platforms:[
        {x:0,   y:.92,w:.13,h:.08},
        {x:.16, y:.82,w:.09,h:.06},
        {x:.28, y:.70,w:.09,h:.06},
        {x:.40, y:.60,w:.09,h:.06},
        {x:.52, y:.70,w:.09,h:.06},
        {x:.64, y:.60,w:.09,h:.06},
        {x:.76, y:.70,w:.09,h:.06},
        {x:.88, y:.92,w:.12,h:.08}
       ],
       items:[{id:'skull_a',label:'Skull',icon:'\u{1F480}',x:.40,y:.52,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'30 students, 60% passed. Failed=?',opts:['A) 10','B) 12','C) 14','D) 18'],ans:'B',hint:'30-18=?',need:'shard_a'}},
    {id:'s3r2',name:'Hall of Columns',
     sections:[
      {platforms:[
        {x:0,   y:.88,w:.13,h:.08},
        {x:.17, y:.76,w:.10,h:.06},
        {x:.30, y:.88,w:.10,h:.06},
        {x:.43, y:.76,w:.10,h:.06},
        {x:.56, y:.64,w:.10,h:.06},
        {x:.69, y:.76,w:.10,h:.06},
        {x:.82, y:.88,w:.10,h:.06},
        {x:.92, y:.92,w:.08,h:.08}
       ],
       items:[{id:'chisel_a',label:'Stone Chisel',icon:'\u26CF\uFE0F',x:.56,y:.56,rp:true}],
       lore:"Chisel: 'Triangular prism \u2014 how many edges?'"},
      {platforms:[
        {x:0,   y:.92,w:.12,h:.08},
        {x:.15, y:.80,w:.09,h:.06},
        {x:.27, y:.70,w:.09,h:.06},
        {x:.39, y:.80,w:.09,h:.06},
        {x:.51, y:.68,w:.09,h:.06},
        {x:.63, y:.78,w:.09,h:.06},
        {x:.75, y:.66,w:.09,h:.06},
        {x:.87, y:.92,w:.13,h:.08}
       ],
       items:[{id:'coin_b',label:'Silver Coin',icon:'\u{1FA99}',x:.51,y:.60,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'Edges of a triangular prism?',opts:['A) 6','B) 8','C) 9','D) 12'],ans:'C',hint:'3+3+3=9',need:'chisel_a'}},
    {id:'s3r3',name:'The Sunken Gallery',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.14,h:.08},
        {x:.18, y:.80,w:.10,h:.06},
        {x:.31, y:.70,w:.10,h:.06},
        {x:.44, y:.80,w:.10,h:.06},
        {x:.57, y:.68,w:.10,h:.06},
        {x:.70, y:.78,w:.10,h:.06},
        {x:.83, y:.92,w:.17,h:.08}
       ],
       items:[{id:'urn_a',label:'Clay Urn',icon:'\u{1F3FA}',x:.44,y:.72,rp:true}],
       lore:"Urn: 'Rectangle 8cm, perimeter 26cm. Width?'"},
      {platforms:[
        {x:0,   y:.92,w:.12,h:.08},
        {x:.15, y:.82,w:.09,h:.06},
        {x:.27, y:.70,w:.09,h:.06},
        {x:.39, y:.60,w:.09,h:.06},
        {x:.51, y:.70,w:.09,h:.06},
        {x:.63, y:.80,w:.09,h:.06},
        {x:.75, y:.68,w:.09,h:.06},
        {x:.87, y:.92,w:.13,h:.08}
       ],
       items:[{id:'gem_b',label:'Red Gem',icon:'\u{1F48E}',x:.39,y:.52,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'Perimeter=26, length=8. Width=?',opts:['A) 4','B) 5','C) 6','D) 7'],ans:'B',hint:'13-8=?',need:'urn_a'}}
  ],
  // ── STAGE 4 ──────────────────────────────────────────
  [
    {id:'s4r1',name:'The Windy Ledge',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.13,h:.08},
        {x:.17, y:.80,w:.09,h:.06},
        {x:.29, y:.68,w:.09,h:.06},
        {x:.41, y:.78,w:.09,h:.06},
        {x:.53, y:.66,w:.09,h:.06},
        {x:.65, y:.76,w:.09,h:.06},
        {x:.77, y:.64,w:.09,h:.06},
        {x:.89, y:.92,w:.11,h:.08}
       ],
       items:[{id:'arrow_a',label:'Obsidian Arrow',icon:'\u{1F3F9}',x:.53,y:.58,rp:true}],
       lore:"Arrow: 'Slope of line through (2,3) and (6,11)?'"},
      {platforms:[
        {x:0,   y:.92,w:.12,h:.08},
        {x:.15, y:.82,w:.08,h:.06},
        {x:.26, y:.70,w:.08,h:.06},
        {x:.37, y:.60,w:.08,h:.06},
        {x:.48, y:.70,w:.08,h:.06},
        {x:.59, y:.58,w:.08,h:.06},
        {x:.70, y:.68,w:.08,h:.06},
        {x:.81, y:.78,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'rope_a',label:'Frayed Rope',icon:'\u{1FAA2}',x:.37,y:.52,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'Slope through (2,3) and (6,11)?',opts:['A) 1','B) 1.5','C) 2','D) 3'],ans:'C',hint:'8/4=?',need:'arrow_a'}},
    {id:'s4r2',name:'Crags of Daedalus',
     sections:[
      {platforms:[
        {x:0,   y:.88,w:.13,h:.08},
        {x:.17, y:.76,w:.09,h:.06},
        {x:.29, y:.88,w:.09,h:.06},
        {x:.41, y:.76,w:.09,h:.06},
        {x:.53, y:.64,w:.09,h:.06},
        {x:.65, y:.76,w:.09,h:.06},
        {x:.77, y:.64,w:.09,h:.06},
        {x:.89, y:.92,w:.11,h:.08}
       ],
       items:[{id:'wing_a',label:'Wax Wing',icon:'\u{1FAB6}',x:.65,y:.68,rp:true}],
       lore:"Wax: '144 bricks/hr \u00D7 7 hrs \u2212 36 = ?'"},
      {platforms:[
        {x:0,   y:.92,w:.12,h:.08},
        {x:.15, y:.80,w:.08,h:.06},
        {x:.26, y:.68,w:.08,h:.06},
        {x:.37, y:.78,w:.08,h:.06},
        {x:.48, y:.66,w:.08,h:.06},
        {x:.59, y:.76,w:.08,h:.06},
        {x:.70, y:.64,w:.08,h:.06},
        {x:.81, y:.74,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'stone_a',label:'Smooth Stone',icon:'\u{1FAA8}',x:.48,y:.58,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'144\u00D77 \u2212 36 = ?',opts:['A) 968','B) 972','C) 988','D) 1008'],ans:'B',hint:'1008-36=?',need:'wing_a'}},
    {id:'s4r3',name:'The Precipice',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.13,h:.08},
        {x:.17, y:.80,w:.09,h:.06},
        {x:.29, y:.68,w:.09,h:.06},
        {x:.41, y:.58,w:.09,h:.06},
        {x:.53, y:.68,w:.09,h:.06},
        {x:.65, y:.78,w:.09,h:.06},
        {x:.77, y:.68,w:.09,h:.06},
        {x:.89, y:.92,w:.11,h:.08}
       ],
       items:[{id:'fossil_a',label:'Ammonite',icon:'\u{1F41A}',x:.41,y:.50,rp:true}],
       lore:"Fossil: 'Sequence 2,6,18,54... next term?'"},
      {platforms:[
        {x:0,   y:.92,w:.11,h:.08},
        {x:.14, y:.80,w:.08,h:.06},
        {x:.25, y:.68,w:.08,h:.06},
        {x:.36, y:.58,w:.08,h:.06},
        {x:.47, y:.68,w:.08,h:.06},
        {x:.58, y:.56,w:.08,h:.06},
        {x:.69, y:.66,w:.08,h:.06},
        {x:.80, y:.76,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'shell_a',label:'Shell',icon:'\u{1F40C}',x:.36,y:.50,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'2,6,18,54,__?',opts:['A) 108','B) 144','C) 162','D) 216'],ans:'C',hint:'\u00D73: 54\u00D73=?',need:'fossil_a'}}
  ],
  // ── STAGE 5 ──────────────────────────────────────────
  [
    {id:'s5r1',name:'Temple of Thoth',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.14,h:.08},
        {x:.18, y:.78,w:.09,h:.06},
        {x:.30, y:.66,w:.09,h:.06},
        {x:.42, y:.78,w:.09,h:.06},
        {x:.54, y:.66,w:.09,h:.06},
        {x:.66, y:.78,w:.09,h:.06},
        {x:.78, y:.66,w:.09,h:.06},
        {x:.90, y:.92,w:.10,h:.08}
       ],
       items:[{id:'papyrus_a',label:'Papyrus',icon:'\u{1F4DC}',x:.54,y:.58,rp:true}],
       lore:"Papyrus: 'sin(\u03B8)=0.5. What is \u03B8 degrees (first quadrant)?'"},
      {platforms:[
        {x:0,   y:.92,w:.12,h:.08},
        {x:.15, y:.82,w:.08,h:.06},
        {x:.26, y:.70,w:.08,h:.06},
        {x:.37, y:.60,w:.08,h:.06},
        {x:.48, y:.50,w:.08,h:.06},
        {x:.59, y:.60,w:.08,h:.06},
        {x:.70, y:.70,w:.08,h:.06},
        {x:.81, y:.80,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'scarab_a',label:'Scarab',icon:'\u{1FAB2}',x:.48,y:.42,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'sin(\u03B8)=0.5. \u03B8 (first quadrant)?',opts:['A) 45\u00B0','B) 30\u00B0','C) 60\u00B0','D) 90\u00B0'],ans:'B',hint:'sin(30\u00B0)=0.5',need:'papyrus_a'}},
    {id:'s5r2',name:'The Cracked Amphitheatre',
     sections:[
      {platforms:[
        {x:0,   y:.88,w:.13,h:.08},
        {x:.17, y:.76,w:.09,h:.06},
        {x:.29, y:.64,w:.09,h:.06},
        {x:.41, y:.76,w:.09,h:.06},
        {x:.53, y:.64,w:.09,h:.06},
        {x:.65, y:.76,w:.09,h:.06},
        {x:.77, y:.88,w:.09,h:.06},
        {x:.89, y:.92,w:.11,h:.08}
       ],
       items:[{id:'mask_a',label:'Theater Mask',icon:'\u{1F3AD}',x:.53,y:.56,rp:true}],
       lore:"Mask: 'f(x)=3x\u00B2\u22122. What is f(3)?'"},
      {platforms:[
        {x:0,   y:.92,w:.12,h:.08},
        {x:.15, y:.80,w:.08,h:.06},
        {x:.26, y:.68,w:.08,h:.06},
        {x:.37, y:.58,w:.08,h:.06},
        {x:.48, y:.68,w:.08,h:.06},
        {x:.59, y:.56,w:.08,h:.06},
        {x:.70, y:.66,w:.08,h:.06},
        {x:.81, y:.76,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'laurel_a',label:'Laurel',icon:'\u{1F33F}',x:.37,y:.50,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'f(x)=3x\u00B2\u22122. f(3)=?',opts:['A) 21','B) 25','C) 27','D) 29'],ans:'B',hint:'3\u00D79\u22122=?',need:'mask_a'}},
    {id:'s5r3',name:'Ruins of Knossos',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.13,h:.08},
        {x:.17, y:.80,w:.09,h:.06},
        {x:.29, y:.68,w:.09,h:.06},
        {x:.41, y:.78,w:.09,h:.06},
        {x:.53, y:.66,w:.09,h:.06},
        {x:.65, y:.76,w:.09,h:.06},
        {x:.77, y:.64,w:.09,h:.06},
        {x:.89, y:.92,w:.11,h:.08}
       ],
       items:[{id:'plaque_a',label:'Bronze Plaque',icon:'\u{1F3DB}\uFE0F',x:.65,y:.68,rp:true}],
       lore:"Plaque: 'Logarithms guard my gate. log\u2082(64)=?'"},
      {platforms:[
        {x:0,   y:.92,w:.12,h:.08},
        {x:.15, y:.80,w:.08,h:.06},
        {x:.26, y:.68,w:.08,h:.06},
        {x:.37, y:.56,w:.08,h:.06},
        {x:.48, y:.66,w:.08,h:.06},
        {x:.59, y:.54,w:.08,h:.06},
        {x:.70, y:.64,w:.08,h:.06},
        {x:.81, y:.74,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'coin_c',label:'Bronze Coin',icon:'\u{1FA99}',x:.37,y:.48,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'log\u2082(64)=?',opts:['A) 4','B) 5','C) 6','D) 8'],ans:'C',hint:'2\u2076=64',need:'plaque_a'}}
  ],
  // ── STAGE 6 ──────────────────────────────────────────
  [
    {id:'s6r1',name:'The Smelting Pit',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.13,h:.08},
        {x:.17, y:.80,w:.09,h:.06},
        {x:.29, y:.68,w:.09,h:.06},
        {x:.41, y:.80,w:.09,h:.06},
        {x:.53, y:.68,w:.09,h:.06},
        {x:.65, y:.56,w:.09,h:.06},
        {x:.77, y:.68,w:.09,h:.06},
        {x:.89, y:.92,w:.11,h:.08}
       ],
       items:[{id:'tongs_a',label:'Iron Tongs',icon:'\u{1F527}',x:.65,y:.48,rp:true}],
       lore:"Tongs: 'Metal block 4\u00D75\u00D76 cm. Volume cm\u00B3?'"},
      {platforms:[
        {x:0,   y:.92,w:.11,h:.08},
        {x:.14, y:.80,w:.08,h:.06},
        {x:.25, y:.68,w:.08,h:.06},
        {x:.36, y:.58,w:.08,h:.06},
        {x:.47, y:.68,w:.08,h:.06},
        {x:.58, y:.56,w:.08,h:.06},
        {x:.69, y:.66,w:.08,h:.06},
        {x:.80, y:.76,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'ingot_a',label:'Iron Ingot',icon:'\u{1F9F1}',x:.36,y:.50,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'4\u00D75\u00D76 cm cuboid volume?',opts:['A) 90','B) 100','C) 120','D) 140'],ans:'C',hint:'4\u00D75\u00D76=?',need:'tongs_a'}},
    {id:'s6r2',name:'Hephaestus Workshop',
     sections:[
      {platforms:[
        {x:0,   y:.88,w:.12,h:.08},
        {x:.16, y:.76,w:.09,h:.06},
        {x:.28, y:.64,w:.09,h:.06},
        {x:.40, y:.76,w:.09,h:.06},
        {x:.52, y:.64,w:.09,h:.06},
        {x:.64, y:.76,w:.09,h:.06},
        {x:.76, y:.64,w:.09,h:.06},
        {x:.88, y:.92,w:.12,h:.08}
       ],
       items:[{id:'hammer_a',label:'Forge Hammer',icon:'\u{1F528}',x:.52,y:.56,rp:true}],
       lore:"Hammer: 'Mode of 4,7,7,3,7,9,2,7?'"},
      {platforms:[
        {x:0,   y:.92,w:.11,h:.08},
        {x:.14, y:.80,w:.08,h:.06},
        {x:.25, y:.68,w:.08,h:.06},
        {x:.36, y:.78,w:.08,h:.06},
        {x:.47, y:.66,w:.08,h:.06},
        {x:.58, y:.56,w:.08,h:.06},
        {x:.69, y:.66,w:.08,h:.06},
        {x:.80, y:.76,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'chip_a',label:'Anvil Chip',icon:'\u2699\uFE0F',x:.47,y:.58,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'Mode of: 4,7,7,3,7,9,2,7',opts:['A) 3','B) 4','C) 7','D) 9'],ans:'C',hint:'7 appears 4 times',need:'hammer_a'}},
    {id:'s6r3',name:'The Cooling Vats',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.12,h:.08},
        {x:.16, y:.80,w:.09,h:.06},
        {x:.28, y:.68,w:.09,h:.06},
        {x:.40, y:.78,w:.09,h:.06},
        {x:.52, y:.66,w:.09,h:.06},
        {x:.64, y:.76,w:.09,h:.06},
        {x:.76, y:.64,w:.09,h:.06},
        {x:.88, y:.92,w:.12,h:.08}
       ],
       items:[{id:'ladle_a',label:'Stone Ladle',icon:'\u{1F944}',x:.64,y:.68,rp:true}],
       lore:"Ladle: '3 workers finish in 12 days. How long for 9 workers?'"},
      {platforms:[
        {x:0,   y:.92,w:.11,h:.08},
        {x:.14, y:.82,w:.08,h:.06},
        {x:.25, y:.70,w:.08,h:.06},
        {x:.36, y:.60,w:.08,h:.06},
        {x:.47, y:.70,w:.08,h:.06},
        {x:.58, y:.58,w:.08,h:.06},
        {x:.69, y:.68,w:.08,h:.06},
        {x:.80, y:.78,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'ember_a',label:'Ember',icon:'\u{1F525}',x:.36,y:.52,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'3 workers,12 days \u2192 9 workers,? days',opts:['A) 2','B) 3','C) 4','D) 6'],ans:'C',hint:'36\u00F79=?',need:'ladle_a'}}
  ],
  // ── STAGE 7 ──────────────────────────────────────────
  [
    {id:'s7r1',name:'Inner Sanctum Alpha',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.13,h:.08},
        {x:.17, y:.80,w:.09,h:.06},
        {x:.29, y:.68,w:.09,h:.06},
        {x:.41, y:.56,w:.09,h:.06},
        {x:.53, y:.66,w:.09,h:.06},
        {x:.65, y:.76,w:.09,h:.06},
        {x:.77, y:.64,w:.09,h:.06},
        {x:.89, y:.92,w:.11,h:.08}
       ],
       items:[{id:'tome_a',label:'Ancient Tome',icon:'\u{1F4D5}',x:.41,y:.48,rp:true}],
       lore:"Tome: 'C(6,2) \u2014 choose 2 from 6 scholars. How many pairs?'"},
      {platforms:[
        {x:0,   y:.92,w:.11,h:.08},
        {x:.14, y:.80,w:.08,h:.06},
        {x:.25, y:.68,w:.08,h:.06},
        {x:.36, y:.56,w:.08,h:.06},
        {x:.47, y:.46,w:.08,h:.06},
        {x:.58, y:.56,w:.08,h:.06},
        {x:.69, y:.66,w:.08,h:.06},
        {x:.80, y:.76,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'candle_a',label:'Black Candle',icon:'\u{1F56F}\uFE0F',x:.47,y:.38,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'C(6,2)=?',opts:['A) 12','B) 15','C) 18','D) 30'],ans:'B',hint:'6\u00D75/2=?',need:'tome_a'}},
    {id:'s7r2',name:'Hall of the Oracle',
     sections:[
      {platforms:[
        {x:0,   y:.88,w:.12,h:.08},
        {x:.16, y:.76,w:.09,h:.06},
        {x:.28, y:.88,w:.09,h:.06},
        {x:.40, y:.76,w:.09,h:.06},
        {x:.52, y:.64,w:.09,h:.06},
        {x:.64, y:.76,w:.09,h:.06},
        {x:.76, y:.64,w:.09,h:.06},
        {x:.88, y:.92,w:.12,h:.08}
       ],
       items:[{id:'oracle_a',label:'Oracle Stone',icon:'\u{1F52E}',x:.52,y:.56,rp:true}],
       lore:"Oracle: '3 red, 5 blue, 2 green. Probability of drawing blue?'"},
      {platforms:[
        {x:0,   y:.92,w:.11,h:.08},
        {x:.14, y:.80,w:.08,h:.06},
        {x:.25, y:.68,w:.08,h:.06},
        {x:.36, y:.78,w:.08,h:.06},
        {x:.47, y:.66,w:.08,h:.06},
        {x:.58, y:.54,w:.08,h:.06},
        {x:.69, y:.64,w:.08,h:.06},
        {x:.80, y:.74,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'dice_a',label:'Ancient Dice',icon:'\u{1F3B2}',x:.47,y:.58,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'3 red,5 blue,2 green. P(blue)=?',opts:['A) 1/2','B) 5/11','C) 3/10','D) 2/5'],ans:'A',hint:'5/10=1/2',need:'oracle_a'}},
    {id:'s7r3',name:'The Veil Chamber',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.12,h:.08},
        {x:.16, y:.80,w:.09,h:.06},
        {x:.28, y:.68,w:.09,h:.06},
        {x:.40, y:.78,w:.09,h:.06},
        {x:.52, y:.66,w:.09,h:.06},
        {x:.64, y:.56,w:.09,h:.06},
        {x:.76, y:.66,w:.09,h:.06},
        {x:.88, y:.92,w:.12,h:.08}
       ],
       items:[{id:'veil_a',label:'Mystic Veil',icon:'\u{1F32B}\uFE0F',x:.52,y:.58,rp:true}],
       lore:"Veil: 'Smallest prime between 50 and 60 (exclusive).'"},
      {platforms:[
        {x:0,   y:.92,w:.11,h:.08},
        {x:.14, y:.82,w:.08,h:.06},
        {x:.25, y:.70,w:.08,h:.06},
        {x:.36, y:.58,w:.08,h:.06},
        {x:.47, y:.48,w:.08,h:.06},
        {x:.58, y:.58,w:.08,h:.06},
        {x:.69, y:.68,w:.08,h:.06},
        {x:.80, y:.78,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'glass_a',label:'Hourglass',icon:'\u{231B}',x:.47,y:.40,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'Smallest prime: 50 < p < 60?',opts:['A) 51','B) 53','C) 57','D) 59'],ans:'B',hint:'53 is prime; 51=3\u00D717',need:'veil_a'}}
  ],
  // ── STAGE 8 ──────────────────────────────────────────
  [
    {id:'s8r1',name:'The Judgment Hall',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.12,h:.08},
        {x:.16, y:.80,w:.09,h:.06},
        {x:.28, y:.68,w:.09,h:.06},
        {x:.40, y:.56,w:.09,h:.06},
        {x:.52, y:.66,w:.09,h:.06},
        {x:.64, y:.54,w:.09,h:.06},
        {x:.76, y:.64,w:.09,h:.06},
        {x:.88, y:.92,w:.12,h:.08}
       ],
       items:[{id:'crown_a',label:"Minos' Crown",icon:'\u{1F451}',x:.40,y:.48,rp:true}],
       lore:"Crown: '1000 gold, 20% tax/year. After 2 years?'"},
      {platforms:[
        {x:0,   y:.92,w:.11,h:.08},
        {x:.14, y:.80,w:.08,h:.06},
        {x:.25, y:.68,w:.08,h:.06},
        {x:.36, y:.56,w:.08,h:.06},
        {x:.47, y:.46,w:.08,h:.06},
        {x:.58, y:.56,w:.08,h:.06},
        {x:.69, y:.44,w:.08,h:.06},
        {x:.80, y:.54,w:.08,h:.06},
        {x:.91, y:.92,w:.09,h:.08}
       ],
       items:[{id:'scepter_a',label:'Scepter',icon:'\u{1F3FA}',x:.47,y:.38,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'1000 gold, 20% tax/yr. After 2 yrs=?',opts:['A) 620','B) 640','C) 660','D) 680'],ans:'B',hint:'1000\u00D70.8\u00D70.8=?',need:'crown_a'}},
    {id:'s8r2',name:'Chamber of Reckoning',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.11,h:.08},
        {x:.15, y:.80,w:.09,h:.06},
        {x:.27, y:.68,w:.09,h:.06},
        {x:.39, y:.58,w:.09,h:.06},
        {x:.51, y:.68,w:.09,h:.06},
        {x:.63, y:.56,w:.09,h:.06},
        {x:.75, y:.66,w:.09,h:.06},
        {x:.87, y:.92,w:.13,h:.08}
       ],
       items:[{id:'tablet_b',label:'Final Tablet',icon:'\u{1F5FF}',x:.39,y:.50,rp:true}],
       lore:"Tablet: 'Derivative of x\u00B3+2x\u00B2\u22125. Only the correct answer frees you.'"},
      {platforms:[
        {x:0,   y:.92,w:.10,h:.08},
        {x:.13, y:.80,w:.08,h:.06},
        {x:.24, y:.68,w:.08,h:.06},
        {x:.35, y:.56,w:.08,h:.06},
        {x:.46, y:.46,w:.08,h:.06},
        {x:.57, y:.56,w:.08,h:.06},
        {x:.68, y:.44,w:.08,h:.06},
        {x:.79, y:.54,w:.08,h:.06},
        {x:.90, y:.92,w:.10,h:.08}
       ],
       items:[{id:'gem_c',label:'Eternity Gem',icon:'\u{1F48E}',x:.46,y:.38,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'d/dx of x\u00B3+2x\u00B2\u22125=?',opts:['A) 3x\u00B2+4x','B) 3x\u00B2+2x','C) x\u00B2+4x\u22125','D) 3x+4'],ans:'A',hint:'x\u00B3\u21923x\u00B2, 2x\u00B2\u21924x',need:'tablet_b'}},
    {id:'s8r3',name:'Throne of the Minotaur',
     sections:[
      {platforms:[
        {x:0,   y:.92,w:.11,h:.08},
        {x:.15, y:.80,w:.09,h:.06},
        {x:.27, y:.68,w:.09,h:.06},
        {x:.39, y:.56,w:.09,h:.06},
        {x:.51, y:.46,w:.09,h:.06},
        {x:.63, y:.56,w:.09,h:.06},
        {x:.75, y:.66,w:.09,h:.06},
        {x:.87, y:.92,w:.13,h:.08}
       ],
       items:[{id:'horn_a',label:'Minotaur Horn',icon:'\u{1F9AC}',x:.51,y:.38,rp:true}],
       lore:"Horn: 'In modular arithmetic, 17 mod 5=?'"},
      {platforms:[
        {x:0,   y:.92,w:.10,h:.08},
        {x:.13, y:.80,w:.08,h:.06},
        {x:.24, y:.68,w:.08,h:.06},
        {x:.35, y:.56,w:.08,h:.06},
        {x:.46, y:.44,w:.08,h:.06},
        {x:.57, y:.54,w:.08,h:.06},
        {x:.68, y:.42,w:.08,h:.06},
        {x:.79, y:.52,w:.08,h:.06},
        {x:.90, y:.92,w:.10,h:.08}
       ],
       items:[{id:'trophy_a',label:'Trophy',icon:'\u{1F3C6}',x:.46,y:.36,rp:false}]},
      {platforms:[
        {x:0,   y:.92,w:.28,h:.08},
        {x:.32, y:.82,w:.18,h:.07},
        {x:.54, y:.92,w:.14,h:.08},
        {x:.72, y:.82,w:.14,h:.07},
        {x:.88, y:.92,w:.12,h:.08}
       ],items:[]}
     ],
     puzzle:{q:'17 mod 5=?',opts:['A) 1','B) 2','C) 3','D) 4'],ans:'B',hint:'17=5\u00D73+2',need:'horn_a'}}
  ]
];


// ── TUTORIAL STATE ───────────────────────────────────────────
var TUT = {
  active: false, step: 0,
  jumpCount: 0, dashCount: 0,
  sprintFrames: 0, sprintDone: false,
  itemPickedUp: false, invOpened: false,
  itemDropped: false, itemRePickedUp: false
};
var TUT_STEPS = [
  { id:'move',   text:'Walk right with [W] or [D].  Walk left with [A].',
    done: function(){ return player.x > canvas.width * 0.25; } },
  { id:'jump',   text:'Press [Space] to jump!  Jump at least twice.',
    done: function(){ return TUT.jumpCount >= 2; } },
  { id:'sprint', text:'Hold [Shift] to sprint.  Watch the stamina bar!',
    done: function(){ return TUT.sprintDone; } },
  { id:'dash',   text:'Press [F] to Dash — a burst of speed!  Try it twice.',
    done: function(){ return TUT.dashCount >= 2; } },
  { id:'pickup', text:'See the glowing scroll? Walk near it and press [E]!',
    done: function(){ return TUT.itemPickedUp; } },
  { id:'inv',    text:'Picked it up! Now open your bag — click the [Bag] button.',
    done: function(){ return TUT.invOpened; } },
  { id:'drop',   text:'Press [Q] or click the item slot to drop the scroll.',
    done: function(){ return TUT.itemDropped; } },
  { id:'repick', text:'Item dropped nearby. Pick it back up with [E]!',
    done: function(){ TUT.itemPickedUp=false; return TUT.itemRePickedUp; } },
  { id:'lore',   text:'Structure: Hint Room — grab clue item. Puzzle Room — platforms. Door Room — answer quiz.',
    done: function(){ return player.x > canvas.width * 0.58; } },
  { id:'portal', text:'Training complete! Head to the glowing portal on the right!',
    done: function(){ return false; } }
];
var TUT_ROOM = {
  name:'Training Hall',
  sections:[{
    platforms:[
      {x:0,   y:.92,w:.18,h:.08},
      {x:.22, y:.82,w:.10,h:.06},
      {x:.36, y:.72,w:.10,h:.06},
      {x:.50, y:.82,w:.10,h:.06},
      {x:.64, y:.72,w:.10,h:.06},
      {x:.78, y:.82,w:.10,h:.06},
      {x:.90, y:.92,w:.10,h:.08}
    ],
    items:[{id:'tut_scroll',label:'Ancient Scroll',icon:'\u{1F4DC}',x:.64,y:.64,rp:true}],
    lore:'Welcome, hero. These halls will prepare you for what lies ahead.'
  }],
  puzzle: null
};

function tutStart(){
  TUT.active=true; TUT.step=0; TUT.jumpCount=0; TUT.dashCount=0;
  TUT.sprintFrames=0; TUT.sprintDone=false;
  TUT.itemPickedUp=false; TUT.invOpened=false;
  TUT.itemDropped=false; TUT.itemRePickedUp=false;
  maze=[{room:TUT_ROOM}]; si=0; sec=0; lives=3;
  gameState='playing'; paused=false; quizOpen=false;
  if(menuLoopId){cancelAnimationFrame(menuLoopId);menuLoopId=null;}
  deathAnim=false; deathTimer=0; bodyChunks=[]; ptcls=[];
  startTime=Date.now();
  player.stamina=SMAX; player.dcd=0;
  BOULDER_STAGE=-1;
  boulder.active=false; boulder.dropped=false; boulder.rolling=false;
  boulder.squishTimer=0; boulder.warnTimer=0; boulder.x=-200; boulder.y=-200; boulder.vy=0;
  for(var i=0;i<INVMAX;i++) inv[i]=null;
  renderInv(); invOpen=false;
  var tp=document.getElementById('tut-prompt');   if(tp) tp.classList.add('hidden');
  var ss=document.getElementById('start-screen'); if(ss) ss.classList.add('hidden');
  var ul=document.getElementById('ui-layer');     if(ul) ul.classList.remove('hidden');
  var hb=document.getElementById('hud-bottom');   if(hb) hb.classList.remove('hidden');
  var iu=document.getElementById('inventory-ui'); if(iu) iu.classList.add('hidden');
  SFX.startBG();
  var e1=document.getElementById('layer-name'); if(e1) e1.innerText='Training Hall';
  var e2=document.getElementById('room-prog');  if(e2) e2.innerText='Tutorial';
  updateHUD();
  // Snap player onto first platform of tutorial room
  player.x=60;
  player.y=TUT_ROOM.sections[0].platforms[0].y*canvas.height - SH;
  player.vx=0; player.vy=0; player.grounded=true;
  player.frame=0; player.atick=0; player.ifrm=0; player.itick=0;
  player.dashing=false; player.dtmr=0;
  for(var k in jp) jp[k]=false;
  startLoop();
}

function tutEnd(){
  TUT.active=false; paused=false;
  // Stop game and show summary
  gameState='menu';
  if(loopId){cancelAnimationFrame(loopId);loopId=null;}
  var el=document.getElementById('tut-summary');
  if(el) el.classList.remove('hidden');
}

function tutUpdate(){
  if(!TUT.active) return;
  var s=TUT_STEPS[TUT.step];
  if(!s) return;
  if(s.id==='sprint' && player.sprinting && player.moving){
    TUT.sprintFrames++;
    if(TUT.sprintFrames>=60) TUT.sprintDone=true;
  }
  if(s.id==='inv' && invOpen) TUT.invOpened=true;
  if(s.done && s.done()){
    TUT.step++;
    if(TUT.step>=TUT_STEPS.length){ tutEnd(); return; }
  }
}

function tutDraw(){
  if(!TUT.active) return;
  if(TUT.step>=TUT_STEPS.length) return;
  var s=TUT_STEPS[TUT.step];
  var W=canvas.width, H=canvas.height;
  var boxW=Math.min(580,W*0.80), boxH=68;
  var bx=(W-boxW)/2, by=H*0.055;
  ctx.save();
  ctx.fillStyle='rgba(6,3,10,0.93)';
  ctx.strokeStyle='rgba(212,168,67,0.85)';
  ctx.lineWidth=2;
  ctx.beginPath();
  if(ctx.roundRect){ ctx.roundRect(bx,by,boxW,boxH,6); } else { ctx.rect(bx,by,boxW,boxH); }
  ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(212,168,67,0.55)';
  ctx.font='bold 10px Georgia,serif';
  ctx.textAlign='center';
  ctx.fillText('STEP '+(TUT.step+1)+' / '+TUT_STEPS.length+'  \u2022  '+s.id.toUpperCase(), W/2, by+16);
  ctx.fillStyle='#f0d890';
  ctx.font='13px Georgia,serif';
  var words=s.text.split(' '), line='', lines=[], maxW=boxW-30;
  for(var i=0;i<words.length;i++){
    var test=line+words[i]+' ';
    if(ctx.measureText(test).width>maxW && line){ lines.push(line.trim()); line=words[i]+' '; }
    else line=test;
  }
  lines.push(line.trim());
  var startY=by+34-(lines.length-1)*9;
  for(var j=0;j<lines.length;j++) ctx.fillText(lines[j], W/2, startY+j*18);
  if(['move','jump','sprint','pickup','lore','portal'].indexOf(s.id)!==-1){
    var bounce=Math.sin(Date.now()*0.006)*6;
    ctx.fillStyle='#f0c060';
    ctx.font='bold 20px sans-serif';
    ctx.fillText('\u25B6', player.x+SW/2+32+bounce, player.y-20);
  }
  ctx.restore();
}


// ── CANVAS ───────────────────────────────────────────────────
var canvas = document.getElementById('gameCanvas');
var ctx    = canvas.getContext('2d');
function noSmooth(){ ctx.imageSmoothingEnabled=false; }

// ── CONSTANTS ────────────────────────────────────────────────
var SW=80,SH=80,CW=34,CH=68,COX=(SW-CW)/2,COY=SH-CH;
var GRAV=0.58,FRIC=0.80,BSPD=2.8,SMULT=1.20,JVEL=-13.5;
var SMAX=100,SDRAIN=0.55,SREGEN=0.3,SSMIN=15;
var DCOST=28,DSPD=14,DDUR=13,DCDWN=50,INVMAX=3;

// ── VOID FLOOR — brick wall 45 blocks below the canvas ───────
var BRICK_H      = 22;                        // one block = 22 px (matches platform grid)
var VOID_FLOOR_OFFSET = 45 * BRICK_H;         // 990 px below canvas bottom
var VOID_FLOOR_H = BRICK_H * 4;               // brick wall is 4 blocks tall
var SPIKE_W      = 28;                        // kept for body-chunk blood particle spacing

// ── DEATH ANIMATION STATE ────────────────────────────────────
var deathAnim  = false;
var deathTimer = 0;
var bodyChunks = [];
var DEATH_DUR  = 125;   // frames until reset fires after body-shatter

// ── BOULDER — rolling rock that tracks the player ────────────
// Spawns in a randomly chosen stage (picked once per run) in the PUZZLE section (sec=1).
// It follows the player horizontally across sec 0→1→2 and stops when player reaches sec 2 (door room).
// If it squishes the player: -1 life, brief invincibility, respawn in place.
var BOULDER_SIZE    = 52;   // px, width & height of the rock
var BOULDER_STAGE   = -1;   // which stage index (0-7) the boulder appears in (random per run)
var boulder = {
  active:  false,
  x:       -200,
  y:       -200,
  vy:      0,
  rolling: false,
  squishTimer: 0,
  warnTimer:   0,
  dropped:     false
};

// ── HAMMERS — 4 random rooms per run, swinging pendulum ──────────────────────
var HAMMER_ROOMS = [];   // 4 stage indices that have a hammer this run
var hammers = [];        // active hammer objects for current room

function pickHammerRooms(){
  var pool=[0,1,2,3,4,5,6,7];
  // Fisher-Yates shuffle then take first 4
  for(var i=pool.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var tmp=pool[i];pool[i]=pool[j];pool[j]=tmp;
  }
  HAMMER_ROOMS=pool.slice(0,4);
}

function spawnHammers(){
  hammers=[];
  if(TUT.active) return;
  if(sec===2) return;
  if(HAMMER_ROOMS.indexOf(si)===-1) return;
  var W=canvas.width, H=canvas.height;
  var cs=getCurSec();
  if(!cs||!cs.platforms||cs.platforms.length<2) return;
  // Anchor on the middle platform
  var midIdx=Math.floor(cs.platforms.length/2);
  var pAnchor=cs.platforms[midIdx];
  var anchorX=(pAnchor.x+pAnchor.w*0.5)*W;
  var anchorY=Math.max(28, pAnchor.y*H - 120);
  hammers.push({
    anchorX: anchorX,
    anchorY: anchorY,
    length:  85 + Math.random()*40,
    angle:   Math.PI*0.5,
    angleV:  0.018 + Math.random()*0.008,  // initial swing speed
    g:       0.013 + Math.random()*0.005,  // pendulum gravity constant
    hw: 36, hh: 22,
    hitCooldown: 0
  });
}

function updateHammers(){
  if(hammers.length===0) return;
  for(var i=0;i<hammers.length;i++){
    var h=hammers[i];
    if(h.hitCooldown>0) h.hitCooldown--;
    // Pendulum physics
    h.angleV += -h.g * Math.sin(h.angle);
    h.angleV *= 0.9995;  // tiny damping
    h.angle  += h.angleV;
    // Clamp swing to ±70 degrees
    if(h.angle> 1.22){ h.angle= 1.22; h.angleV=-Math.abs(h.angleV)*0.92; }
    if(h.angle<-1.22){ h.angle=-1.22; h.angleV= Math.abs(h.angleV)*0.92; }
    // Hammer head world position
    var hx = h.anchorX + Math.sin(h.angle)*h.length;
    var hy = h.anchorY + Math.cos(h.angle)*h.length;
    // AABB hit check
    if(!deathAnim && player.ifrm<=0 && h.hitCooldown<=0){
      var plx=player.x+COX, ply=player.y+COY;
      var pR=plx+CW, pB=ply+CH;
      var hL=hx-h.hw/2, hR=hx+h.hw/2;
      var hT=hy-h.hh/2, hBot=hy+h.hh/2;
      if(pR>hL && plx<hR && pB>hT && ply<hBot){
        // Hit! knock up and lose a life
        var knockDir=(player.x+SW/2 < hx) ? -1 : 1;
        player.vx = knockDir * 10;
        player.vy = -11;   // strong upward knock
        player.grounded = false;
        player.ifrm = 90;
        h.hitCooldown = 90;
        lives--;
        SFX.loseLife();
        flash('\u{1F528} Hit by the hammer! ' + lives + ' \u2665 left');
        updateHUD();
        if(lives<=0){ lives=0; triggerDeath(); }
      }
    }
  }
}

function triggerDeath(){
  SFX.death();
  spawnBodyChunks(player.x, player.y);
  deathAnim=true;
  deathTimer=0;
}

function drawHammers(){
  if(hammers.length===0) return;
  for(var i=0;i<hammers.length;i++){
    var h=hammers[i];
    var hx = h.anchorX + Math.sin(h.angle)*h.length;
    var hy = h.anchorY + Math.cos(h.angle)*h.length;
    ctx.save();
    // Anchor bolt
    ctx.fillStyle='#5a4020';
    ctx.beginPath(); ctx.arc(h.anchorX, h.anchorY, 8, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle='#d4a843'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(h.anchorX, h.anchorY, 8, 0, Math.PI*2); ctx.stroke();
    // Chain — 7 segments
    var segs=7;
    for(var s=1;s<=segs;s++){
      var t0=(s-1)/segs, t1=s/segs;
      var x0=h.anchorX+Math.sin(h.angle)*h.length*t0;
      var y0=h.anchorY+Math.cos(h.angle)*h.length*t0;
      var x1=h.anchorX+Math.sin(h.angle)*h.length*t1;
      var y1=h.anchorY+Math.cos(h.angle)*h.length*t1;
      ctx.strokeStyle = s%2===0 ? '#4a3820' : '#7a5830';
      ctx.lineWidth=5;
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
    }
    // Hammer head
    ctx.translate(hx, hy);
    ctx.rotate(h.angle);
    var dist=Math.hypot((player.x+SW/2)-hx,(player.y+SH/2)-hy);
    if(dist<150){ ctx.shadowBlur=20; ctx.shadowColor='rgba(255,60,0,0.75)'; }
    // Handle
    ctx.fillStyle='#5a3010';
    ctx.fillRect(-5, -h.hh/2-20, 10, 24);
    // Head gradient
    var hg=ctx.createLinearGradient(-h.hw/2,-h.hh/2, h.hw/2, h.hh/2);
    hg.addColorStop(0,'#909090'); hg.addColorStop(0.4,'#c0c0c8'); hg.addColorStop(1,'#484858');
    ctx.fillStyle=hg;
    ctx.fillRect(-h.hw/2,-h.hh/2, h.hw, h.hh);
    ctx.strokeStyle='#282830'; ctx.lineWidth=2;
    ctx.strokeRect(-h.hw/2,-h.hh/2, h.hw, h.hh);
    // Highlight
    ctx.fillStyle='rgba(255,255,255,0.22)';
    ctx.fillRect(-h.hw/2+2,-h.hh/2+2, h.hw-4, 4);
    ctx.shadowBlur=0;
    ctx.restore();
    // Danger indicator when close
    if(dist<200 && !deathAnim){
      var alpha=Math.max(0,(200-dist)/200)*(0.5+0.4*Math.abs(Math.sin(Date.now()*0.01)));
      ctx.save();
      ctx.globalAlpha=alpha;
      ctx.font='bold 15px serif'; ctx.fillStyle='#ff3300'; ctx.textAlign='center';
      ctx.fillText('\u26A0', hx, hy-h.hh/2-14);
      ctx.restore();
    }
  }
}


// ── SPEED BOOST — 3s burst at game start ─────────────────────
var speedBoostActive = false;
var speedBoostTimer  = 0;
var SPEED_BOOST_DUR  = 180;  // 3 seconds @ 60fps
var SPEED_BOOST_MULT = 2.2;  // how fast during boost

// ── GAME STATE ───────────────────────────────────────────────
var maze=[],si=0,sec=0;
var gameState='menu',paused=false,quizOpen=false;
var lives=3,startTime=0,bgX=0,ptcls=[],flicker=0;
// ── CAMERA ── only active during death fall; tracks player downward
var camY=0;  // world-space Y offset; positive = camera moved down
var msgTxt='',msgTmr=0;
var inv=[null,null,null];
var invOpen=false,loopId=null;

var player={x:60,y:0,vx:0,vy:0,dir:1,grounded:false,was:false,
  moving:false,sprinting:false,frame:0,atick:0,ifrm:0,itick:0,
  stamina:SMAX,dashing:false,dtmr:0,dcd:0,ddir:1};

// ── SPRITES ──────────────────────────────────────────────────
var SPR={idle:null,idle2:null,walk:[],run:[],torch:null};
var sprOK=false;
function loadImg(s){return new Promise(function(r){var i=new Image();i.onload=function(){r(i);};i.onerror=function(){r(null);};i.src=s;});}
var RUN_FRAME_SOURCES=['run_animation1.png','run_animation2.png','run_animation3.png','run_animation4.png','run_animation5.png','run_animation6.png','run_animation7.png'];
async function initSpr(){
  if(typeof SPRITE_IDLE!=='undefined'){
    SPR.idle=await loadImg(SPRITE_IDLE);SPR.idle2=await loadImg(SPRITE_IDLE2);
    SPR.walk=await Promise.all([SPRITE_WALK1,SPRITE_WALK2,SPRITE_WALK3].map(loadImg));
    SPR.run=await Promise.all(RUN_FRAME_SOURCES.map(loadImg));
    SPR.torch=await loadImg('../torch.png');
  }
  sprOK=true;
}
initSpr();

// ── MAZE GENERATION ──────────────────────────────────────────
var used=Array.from({length:8},function(){return {};});
function shuffle(a,seed){
  var s=seed>>>0,r=function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/0x100000000;};
  var b=a.slice();
  for(var i=b.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}
  return b;
}
function pickRoom(stage,seed){
  var pool=POOLS[stage];
  var avail=pool.filter(function(r){return !used[stage][r.id];});
  if(!avail.length){used[stage]={};avail=pool.slice();}
  var chosen=shuffle(avail,seed+stage*9999)[0];
  used[stage][chosen.id]=true;
  return {id:chosen.id,name:chosen.name,puzzle:chosen.puzzle,sections:chosen.sections.map(function(s){
    return {platforms:s.platforms,lore:s.lore||'',items:s.items?s.items.map(function(it){return Object.assign({},it);}):[]};
  })};
}
function genMaze(){
  var seed=(Date.now()^(Math.random()*0xffffffff|0))>>>0;
  return Array.from({length:8},function(_,i){return {room:pickRoom(i,seed)};});
}
function getRoom(){ return maze[si]?maze[si].room:null; }
function getCurSec(){ var r=getRoom();return r?r.sections[sec]:null; }

// ── PARTICLES ────────────────────────────────────────────────
function spawn(x,y,col,type){ptcls.push({x:x,y:y,vx:(Math.random()-.5)*3,vy:-(Math.random()*2+.5),life:1,dec:.016+Math.random()*.02,sz:Math.random()*2.5+1,col:col,type:type||'ember'});}
function spawnDash(){for(var i=0;i<4;i++)ptcls.push({x:player.x+SW/2+(Math.random()-.5)*CW,y:player.y+SH*.5+(Math.random()-.5)*20,vx:-player.ddir*(Math.random()*2+1),vy:(Math.random()-.5)*1.5,life:1,dec:.08+Math.random()*.06,sz:Math.random()*5+3,col:'#44aaff',type:'dash'});}

// ── INVENTORY ────────────────────────────────────────────────
function invAdd(it){
  for(var i=0;i<INVMAX;i++){
    if(!inv[i]){
      inv[i]=it;renderInv();
      if(TUT.active){if(!TUT.itemDropped)TUT.itemPickedUp=true;else TUT.itemRePickedUp=true;}
      return true;
    }
  }
  return false;
}
function invRem(i){var it=inv[i];inv[i]=null;renderInv();return it;}
function invHas(id){return inv.some(function(s){return s&&s.id===id;});}
function dropItem(i){
  var it=inv[i];if(!it)return;
  if(TUT.active&&it.id==='tut_scroll')TUT.itemDropped=true;
  var s=getCurSec();
  if(s)s.items.push({id:it.id,label:it.label,icon:it.icon,x:Math.max(.05,Math.min(.9,(player.x+SW/2)/canvas.width)),y:Math.max(.1,(player.y+SH)/canvas.height-.04),rp:false,dropped:true});
  invRem(i);flash('Dropped '+it.icon+' '+it.label);
}
function renderInv(){
  var row=document.getElementById('inv-row');if(!row)return;
  row.innerHTML='';
  var filled=0;
  for(var i=0;i<INVMAX;i++){
    var it=inv[i];if(it)filled++;
    var slot=document.createElement('div');
    slot.className='inv-slot'+(it?' filled':'');
    slot.title=it?it.label+' — click to drop':'Slot '+(i+1)+' empty';
    slot.innerHTML=it?('<span class="inv-icon">'+it.icon+'</span><span class="inv-label">'+it.label+'</span>'):('<span class="inv-empty">'+(i+1)+'</span>');
    (function(idx){if(inv[idx])slot.addEventListener('click',function(){dropItem(idx);});})(i);
    row.appendChild(slot);
  }
  var btn=document.getElementById('inv-toggle-btn');
  if(btn)btn.textContent=filled>0?'🎒 Bag ('+filled+')':'🎒 Bag';
}
function flash(t){msgTxt=t;msgTmr=120;}

// ── INPUT ────────────────────────────────────────────────────
var keys={},jp={};
var loreHidden=false;
window.addEventListener('keydown',function(e){
  if(['Space','ArrowUp','ArrowLeft','ArrowRight','ArrowDown','KeyW','KeyA','KeyS','KeyD'].indexOf(e.code)!==-1)e.preventDefault();
  if(keys[e.code])return;
  keys[e.code]=true; jp[e.code]=true;
  if(e.code==='KeyP')window.togglePause();
  if(e.code==='Enter'&&gameState==='menu')startGame();
  if(e.code==='KeyI')window.toggleInventory();
  if(e.code==='KeyQ'&&gameState==='playing'){for(var i=0;i<INVMAX;i++){if(inv[i]){dropItem(i);break;}}}
});
window.addEventListener('keyup',function(e){keys[e.code]=false;});

// ── DRAW BACKGROUND ──────────────────────────────────────────
function drawBG(){
  var W=canvas.width,H=canvas.height;
  // Paint extra height so camera pan never reveals raw canvas behind the world
  var extraH = VOID_FLOOR_OFFSET + VOID_FLOOR_H + 20;
  flicker=Math.sin(Date.now()*.003)*.08+Math.random()*.04;
  var th=STAGE_THEMES[si]||STAGE_THEMES[0];
  var g=ctx.createLinearGradient(0,0,0,H+extraH);
  if(si===0){
    g.addColorStop(0,'#050309');
    g.addColorStop(.56,'#0a0608');
    g.addColorStop(1,'#040203');
  }else{
    g.addColorStop(0,'#120c12');g.addColorStop(.5,'#0d0810');g.addColorStop(1,'#09050a');
  }
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H+extraH);
  ctx.fillStyle=si===0 ? 'rgba(120,72,34,.08)' : th.color+'20';
  ctx.fillRect(0,0,W,H+extraH);
  ctx.strokeStyle=si===0 ? 'rgba(74,52,38,.42)' : 'rgba(42,26,34,.42)';
  ctx.lineWidth=1;
  var bw=80,bh=50,ox=(bgX*.2)%bw;
  for(var bx=-ox;bx<W+bw;bx+=bw)for(var by=0;by<H;by+=bh)ctx.strokeRect(bx+(Math.floor(by/bh)%2)*bw*.5-bw*.25,by,bw,bh);
  [W*.12,W*.5,W*.88].forEach(function(tx){
    var ty=H*.28,inten=(si===0 ? .18 : .22)+flicker*(si===0 ? .26 : .45);
    var tg=ctx.createRadialGradient(tx,ty,0,tx,ty,si===0 ? 170 : 140);
    tg.addColorStop(0,'rgba(255,214,122,'+(si===0 ? (.22+inten*.55) : inten)+')');
    tg.addColorStop(.34,'rgba(214,104,32,'+(si===0 ? (.12+inten*.25) : inten*.38)+')');
    tg.addColorStop(1,'transparent');
    ctx.fillStyle=tg;ctx.fillRect(0,0,W,H);
    if(si===0 && SPR.torch && SPR.torch.complete && SPR.torch.naturalWidth){
      var torchW=34,torchH=34,torchBaseY=ty-6;
      ctx.drawImage(SPR.torch,tx-torchW*.5,torchBaseY-torchH,torchW,torchH);
      var emberGlow=ctx.createRadialGradient(tx,torchBaseY-28,0,tx,torchBaseY-28,34);
      emberGlow.addColorStop(0,'rgba(255,240,184,.48)');
      emberGlow.addColorStop(.3,'rgba(255,170,70,.26)');
      emberGlow.addColorStop(1,'transparent');
      ctx.fillStyle=emberGlow;
      ctx.fillRect(tx-34,torchBaseY-64,68,68);
      var flameWobble=Math.sin(Date.now()*.007+tx*.015)*4;
      ctx.save();
      ctx.globalCompositeOperation='screen';
      ctx.fillStyle='rgba(255,164,63,.88)';
      ctx.beginPath();
      ctx.moveTo(tx,torchBaseY-45-flameWobble*.12);
      ctx.quadraticCurveTo(tx+10,torchBaseY-30,tx,torchBaseY-12);
      ctx.quadraticCurveTo(tx-12,torchBaseY-30,tx,torchBaseY-45-flameWobble*.12);
      ctx.fill();
      ctx.fillStyle='rgba(255,241,190,.96)';
      ctx.beginPath();
      ctx.moveTo(tx,torchBaseY-38-flameWobble*.08);
      ctx.quadraticCurveTo(tx+5,torchBaseY-28,tx,torchBaseY-18);
      ctx.quadraticCurveTo(tx-6,torchBaseY-28,tx,torchBaseY-38-flameWobble*.08);
      ctx.fill();
      ctx.restore();
    }else{
      ctx.fillStyle='#3a2010';ctx.fillRect(tx-5,ty-28,10,22);
      ctx.fillStyle='#5a3018';ctx.fillRect(tx-4,ty-33,8,8);
      ctx.save();ctx.globalAlpha=.7+flicker;
      ctx.fillStyle='rgba(220,90,6,.85)';ctx.beginPath();ctx.ellipse(tx,ty-38+flicker*6,5,10,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,180,30,.75)';ctx.beginPath();ctx.ellipse(tx,ty-43+flicker*4,3,7,0,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    if(Math.random()<.10)spawn(tx+(Math.random()-.5)*8,ty-48,'#cc6008','ember');
  });
  var fg=ctx.createLinearGradient(0,H*.55,0,H);
  fg.addColorStop(0,'transparent');
  fg.addColorStop(1,si===0 ? 'rgba(8,4,8,.18)' : 'rgba(6,3,8,.56)');
  ctx.fillStyle=fg;ctx.fillRect(0,H*.55,W,H*.45);
  // Extra darkness overlay across entire room
  ctx.fillStyle=si===0 ? 'rgba(0,0,0,.01)' : 'rgba(0,0,0,.10)';
  ctx.fillRect(0,0,W,H+extraH);
}

function drawPlatforms(){
  var cs=getCurSec();if(!cs)return;
  var W=canvas.width,H=canvas.height;
  cs.platforms.forEach(function(p){
    var rx=p.x*W,ry=p.y*H,rw=p.w*W,rh=p.h*H;
    var sg=ctx.createLinearGradient(rx,ry,rx,ry+rh);
    if(si===0){
      sg.addColorStop(0,'#503539');
      sg.addColorStop(.28,'#3c2528');
      sg.addColorStop(1,'#261619');
    }else{
      sg.addColorStop(0,'#4a3135');sg.addColorStop(.3,'#372326');sg.addColorStop(1,'#231415');
    }
    ctx.fillStyle=sg;ctx.fillRect(rx,ry,rw,rh);
    ctx.strokeStyle=si===0 ? 'rgba(122,88,58,.45)' : 'rgba(92,66,46,.4)';
    ctx.lineWidth=1;
    for(var tx=rx;tx<rx+rw;tx+=48){ctx.beginPath();ctx.moveTo(tx,ry);ctx.lineTo(tx,ry+rh);ctx.stroke();}
    for(var ty=ry;ty<ry+rh;ty+=22){ctx.beginPath();ctx.moveTo(rx,ty);ctx.lineTo(rx+rw,ty);ctx.stroke();}
    ctx.fillStyle=si===0 ? 'rgba(238,198,108,.92)' : 'rgba(232,190,98,.82)';
    ctx.fillRect(rx,ry,rw,3);
    ctx.fillStyle=si===0 ? 'rgba(146,102,52,.82)' : 'rgba(120,82,40,.75)';
    ctx.fillRect(rx,ry+3,rw,3);
    ctx.fillStyle='rgba(0,0,0,.45)';
    ctx.fillRect(rx,ry,3,rh);ctx.fillRect(rx+rw-3,ry,3,rh);
  });
}

// ── VOID FLOOR — brick wall at the bottom of the pit ─────────
function drawVoidFloor(){
  var W=canvas.width,H=canvas.height;
  var wallY = H + VOID_FLOOR_OFFSET - VOID_FLOOR_H;  // top of brick wall in world space
  var wallH  = VOID_FLOOR_OFFSET + VOID_FLOOR_H + 40; // fill from wall top to well below

  // Solid background fill beneath the wall
  ctx.fillStyle='#0e0808';
  ctx.fillRect(0, wallY, W, wallH);

  // Brick rows
  var brickW = 64, brickH = BRICK_H;
  var rows   = Math.ceil(VOID_FLOOR_H / brickH) + 1;
  for(var row=0; row<rows; row++){
    var rowY   = wallY + row * brickH;
    var offset = (row % 2 === 0) ? 0 : brickW / 2;   // stagger alternate rows
    for(var bx = -brickW + offset; bx < W + brickW; bx += brickW){
      // Brick face — dark brown with slight gradient
      var bg2 = ctx.createLinearGradient(bx, rowY, bx, rowY+brickH);
      bg2.addColorStop(0, '#4a2a1a');
      bg2.addColorStop(0.45,'#3a1e10');
      bg2.addColorStop(1,   '#2a1208');
      ctx.fillStyle = bg2;
      ctx.fillRect(bx+1, rowY+1, brickW-2, brickH-2);

      // Highlight top edge
      ctx.fillStyle = 'rgba(120,70,30,0.55)';
      ctx.fillRect(bx+1, rowY+1, brickW-2, 2);

      // Shadow bottom edge
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(bx+1, rowY+brickH-3, brickW-2, 2);

      // Mortar gaps (dark lines between bricks)
      ctx.fillStyle = '#110606';
      ctx.fillRect(bx, rowY, 1, brickH);           // left mortar
      ctx.fillRect(bx, rowY, brickW, 1);            // top mortar
    }
  }

  // Strong dark shadow line at very top of wall (ground contact)
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, wallY, W, 3);

  // Faint red glow emanating upward from the floor (danger cue)
  var gl = ctx.createLinearGradient(0, wallY-80, 0, wallY);
  gl.addColorStop(0, 'transparent');
  gl.addColorStop(1, 'rgba(160,20,20,0.18)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, wallY-80, W, 80);

  // Blood pools beneath resting chunks
  if(deathAnim && deathTimer > 8){
    var bAlpha = Math.min(0.72, (deathTimer-8) / 28);
    bodyChunks.forEach(function(c){
      if(c.resting){
        ctx.fillStyle = 'rgba(130,4,4,'+bAlpha+')';
        ctx.beginPath();
        ctx.ellipse(c.x+c.w/2, wallY+3, c.w*0.9+6, 4, 0, 0, Math.PI*2);
        ctx.fill();
      }
    });
  }
}

// ── SPAWN BODY CHUNKS on impact ──────────────────────────────
function spawnBodyChunks(px, py){
  bodyChunks=[];
  // [colour, relX from player left, relY from player top, w, h]
  var parts=[
    ['#eab878', SW/2-10,  0,  20, 20],  // head
    ['#7c2a18', SW/2-13, 24,  26, 28],  // torso
    ['#eab878', SW/2-28, 28,  11, 20],  // left arm
    ['#eab878', SW/2+17, 28,  11, 20],  // right arm
    ['#3c1a62', SW/2-15, 54,  12, 26],  // left leg
    ['#3c1a62', SW/2+ 3, 54,  12, 26],  // right leg
  ];
  parts.forEach(function(p, idx){
    // Fan outward — first 3 lean left, last 3 lean right
    var side = (idx < 3) ? -1 : 1;
    var angle = (Math.PI * 1.1) + side*(0.2 + Math.random()*0.7);
    var spd   = 6 + Math.random()*9;
    bodyChunks.push({
      col:   p[0],
      x:     px + p[1],
      y:     py + p[2],
      w:     p[3],
      h:     p[4],
      vx:    Math.cos(angle)*spd,
      vy:    -(5 + Math.random()*10),
      rot:   0,
      vrot:  (Math.random()-.5)*0.35,
      alpha: 1,
      resting: false
    });
  });
  // Blood burst at impact point
  for(var i=0;i<28;i++){
    spawn(
      px + SW/2 + (Math.random()-.5)*50,
      canvas.height + VOID_FLOOR_OFFSET - VOID_FLOOR_H,
      '#c40808', 'blood'
    );
  }
}

// ── UPDATE BODY CHUNKS each frame ────────────────────────────
function updateBodyChunks(){
  if(!deathAnim) return;
  deathTimer++;
  var floorY = canvas.height + VOID_FLOOR_OFFSET - VOID_FLOOR_H;

  bodyChunks.forEach(function(c){
    if(c.resting) return;
    c.vy  += 0.6;        // gravity
    c.vx  *= 0.93;       // air drag
    c.x   += c.vx;
    c.y   += c.vy;
    c.rot += c.vrot;
    // Wall bounce
    if(c.x < 0)              { c.x=0;                  c.vx=Math.abs(c.vx)*0.35; }
    if(c.x+c.w > canvas.width){ c.x=canvas.width-c.w;  c.vx=-Math.abs(c.vx)*0.35; }
    // Floor impact — weak bounce then rest
    if(c.y+c.h >= floorY){
      c.y    = floorY - c.h;
      c.vy  *= -0.12;
      c.vx  *=  0.55;
      c.vrot*=  0.35;
      if(Math.abs(c.vy)<0.5){ c.vy=0; c.resting=true; }
    }
  });

  // Fade out in the last 40 frames
  if(deathTimer > DEATH_DUR - 40){
    var fade = (DEATH_DUR - deathTimer) / 40;
    bodyChunks.forEach(function(c){ c.alpha = Math.max(0, fade); });
  }

  // Animation complete — trigger game death logic
  if(deathTimer >= DEATH_DUR){
    deathAnim  = false;
    deathTimer = 0;
    bodyChunks = [];
    camY = 0;   // reset camera back to normal view
    if(lives <= 0){
      SFX.death();
      showAlert('\u{1F480}','Lost Forever','The Minotaur claims your soul.','\u21BA Restart');
    } else {
      updateHUD();
      resetSec(false);
    }
  }
}

// ── DRAW BODY CHUNKS ─────────────────────────────────────────
function drawBodyChunks(){
  if(!deathAnim || bodyChunks.length===0) return;

  bodyChunks.forEach(function(c){
    ctx.save();
    ctx.globalAlpha = c.alpha;
    ctx.translate(c.x + c.w/2, c.y + c.h/2);
    ctx.rotate(c.rot);
    // Main block
    ctx.fillStyle = c.col;
    ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
    // Wound edge
    ctx.strokeStyle = 'rgba(210,15,15,.8)';
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(-c.w/2, -c.h/2, c.w, c.h);
    // Blood smear detail
    ctx.fillStyle = 'rgba(140,4,4,.55)';
    ctx.fillRect(-c.w/2+2, -c.h/2+2, c.w*(0.3+Math.random()*0.4), 3);
    // Inner depth shadow
    var ig = ctx.createLinearGradient(-c.w/2,-c.h/2, c.w/2, c.h/2);
    ig.addColorStop(0,'rgba(0,0,0,0)'); ig.addColorStop(1,'rgba(0,0,0,.35)');
    ctx.fillStyle=ig; ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h);
    ctx.restore();
  });

  // Red screen-flash on impact frames
  if(deathTimer < 18){
    var iv = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, canvas.height*.18,
      canvas.width/2, canvas.height/2, canvas.height*.9
    );
    iv.addColorStop(0,'transparent');
    iv.addColorStop(1,'rgba(180,0,0,'+(0.55*(1-deathTimer/18))+')');
    ctx.fillStyle=iv; ctx.fillRect(0,0,canvas.width,canvas.height);
  }
}

// ── DRAW BOULDER ─────────────────────────────────────────────
function drawBoulder(){
  if(!boulder.active) return;
  var bx = boulder.x, by = boulder.y, bs = BOULDER_SIZE;
  var cx = bx + bs/2, cy = by + bs/2, r = bs/2;

  // Find the ground Y under the player to anchor the warning shadow
  var warnFloorY = canvas.height * 0.92;
  var cs4 = getCurSec();
  if(cs4){
    var pcx = player.x + SW/2;
    cs4.platforms.forEach(function(p){
      var px2 = p.x*canvas.width, py2 = p.y*canvas.height, pw = p.w*canvas.width;
      if(pcx >= px2 && pcx <= px2+pw && py2 < warnFloorY) warnFloorY = py2;
    });
  }

  // Pre-drop warning shadow on the ground directly beneath player
  if(!boulder.dropped){
    var shadowAlpha = Math.min(0.75, 0.15 + (180 - boulder.warnTimer) / 100);
    ctx.save();
    ctx.globalAlpha = shadowAlpha;
    // Red ellipse on floor = target zone
    ctx.fillStyle = '#cc1100';
    ctx.beginPath();
    ctx.ellipse(player.x + SW/2, warnFloorY - 4, bs*0.62, 9, 0, 0, Math.PI*2);
    ctx.fill();
    // Pulsing ⚠ warning sign above the shadow
    var pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.012);
    ctx.globalAlpha = shadowAlpha * pulse;
    ctx.font = 'bold 18px serif';
    ctx.fillStyle = '#ff4400';
    ctx.textAlign = 'center';
    ctx.fillText('\u26A0', player.x + SW/2, warnFloorY - 22);
    ctx.textAlign = 'left';
    ctx.restore();
    return; // don't draw rock body yet
  }

  ctx.save();

  // Falling shadow — scales with height
  var shadowScale = Math.max(0.15, 1 - (by - warnFloorY + bs) / 400);
  ctx.globalAlpha = 0.32 * shadowScale;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(cx, warnFloorY - 3, r * shadowScale * 1.3, 7 * shadowScale, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Red squish flash when player was just hit
  if(boulder.squishTimer > 70){
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#ff1100';
    ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Rock body gradient
  var rg = ctx.createRadialGradient(cx - r*0.28, cy - r*0.28, r*0.04, cx, cy, r);
  rg.addColorStop(0,   '#a89080');
  rg.addColorStop(0.35,'#6e5848');
  rg.addColorStop(0.72,'#4c3c30');
  rg.addColorStop(1,   '#2c2018');
  ctx.fillStyle = rg;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();

  // Cracks
  ctx.strokeStyle = 'rgba(25,12,8,0.72)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-9,cy-13); ctx.lineTo(cx+3,cy+1); ctx.lineTo(cx+15,cy-7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-15,cy+3); ctx.lineTo(cx-5,cy+15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+6,cy+8);  ctx.lineTo(cx+14,cy+14); ctx.stroke();

  // Highlight
  ctx.fillStyle = 'rgba(230,210,190,0.18)';
  ctx.beginPath(); ctx.arc(cx - r*0.3, cy - r*0.3, r*0.3, 0, Math.PI*2); ctx.fill();

  // Outline
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();

  // Rolling dust trail
  if(boulder.rolling && Math.random() < 0.45){
    spawn(bx + (Math.random() < 0.5 ? 2 : bs - 2), by + bs - 6, '#8a7060', 'dust');
  }

  ctx.restore();
}

// ── UPDATE BOULDER ────────────────────────────────────────────
function updateBoulder(){
  // Boulder only active in its chosen stage, and NOT in the door room (sec 2)
  if(si !== BOULDER_STAGE || sec === 2 || deathAnim){
    // Clear it when we leave the boulder stage or reach door room
    if(sec === 2 || si !== BOULDER_STAGE){
      boulder.active=false; boulder.rolling=false; boulder.dropped=false;
    }
    return;
  }

  // ── INITIALISE: first call this section ──────────────────
  if(!boulder.active){
    boulder.active    = true;
    boulder.dropped   = false;
    boulder.rolling   = false;
    boulder.vy        = 0;
    boulder.warnTimer = 180;   // ~3 sec shadow warning at 60fps
    boulder.squishTimer = 0;
    boulder.x = player.x + SW/2 - BOULDER_SIZE/2;
    boulder.y = -BOULDER_SIZE - 40;
    return;
  }

  // ── WARN PHASE: shadow tracks player, countdown ───────────
  if(!boulder.dropped){
    boulder.warnTimer--;
    boulder.x = player.x + SW/2 - BOULDER_SIZE/2; // lock X onto player
    if(boulder.warnTimer <= 0){
      // Release from above the screen directly over player
      boulder.x   = player.x + SW/2 - BOULDER_SIZE/2;
      boulder.y   = -BOULDER_SIZE - 10;
      boulder.vy  = 0;
      boulder.dropped = true;
      SFX.boulderWarn();
    }
    return;
  }

  // ── Helper: find the Y of the surface directly below boulder centre ──
  // Returns the world-Y of the top of the highest solid surface under the rock.
  function groundUnder(boulderX){
    var bcx   = boulderX + BOULDER_SIZE/2;
    var floor = canvas.height * 0.92;   // default floor level
    var cs3   = getCurSec();
    if(cs3){
      cs3.platforms.forEach(function(p){
        var px2 = p.x * canvas.width;
        var py2 = p.y * canvas.height;
        var pw  = p.w * canvas.width;
        // only count platforms whose X range contains the boulder's centre
        if(bcx >= px2 && bcx <= px2 + pw){
          // "higher" visually = smaller Y number; pick the smallest py2
          if(py2 < floor) floor = py2;
        }
      });
    }
    return floor - BOULDER_SIZE;  // boulder sits ON TOP of that surface
  }

  // ── AIRBORNE: fall with gravity until it lands ────────────
  if(!boulder.rolling){
    boulder.vy += 0.9;
    boulder.y  += boulder.vy;
    var landY = groundUnder(boulder.x);
    if(boulder.y >= landY){
      boulder.y      = landY;
      boulder.vy     = 0;
      boulder.rolling = true;
      SFX.land && SFX.land();
    }
    // Squish check while falling (drop hit)
    if(boulder.squishTimer <= 0){
      var hit = boulder.x < player.x+COX+CW && boulder.x+BOULDER_SIZE > player.x+COX &&
                boulder.y < player.y+COY+CH  && boulder.y+BOULDER_SIZE > player.y+COY;
      if(hit){ squishPlayer(); return; }
    } else { boulder.squishTimer--; }
    return;
  }

  // ── ROLLING: chase player's X position ───────────────────
  var targetX = player.x + SW/2 - BOULDER_SIZE/2;
  var dx      = targetX - boulder.x;
  // Speed scales slightly with stage difficulty
  var speed   = Math.min(Math.abs(dx), 2.8 + si * 0.25);
  boulder.x  += (dx === 0) ? 0 : Math.sign(dx) * speed;

  // Keep on terrain each frame
  var gY = groundUnder(boulder.x);
  if(boulder.y < gY){
    boulder.vy += 0.9;
    boulder.y  += boulder.vy;
    if(boulder.y >= gY){ boulder.y = gY; boulder.vy = 0; }
  } else {
    boulder.y  = gY;
    boulder.vy = 0;
  }

  // Squish check while rolling
  if(boulder.squishTimer > 0){
    boulder.squishTimer--;
  } else {
    var bL = boulder.x,            bR = boulder.x + BOULDER_SIZE;
    var bT = boulder.y,            bB = boulder.y + BOULDER_SIZE;
    var pL = player.x + COX,      pR = player.x + COX + CW;
    var pT = player.y + COY,      pB = player.y + COY + CH;
    if(bL < pR && bR > pL && bT < pB && bB > pT){ squishPlayer(); }
  }
}

// ── SQUISH — lose 1 life but survive; bounce away ────────────
function squishPlayer(){
  lives = Math.max(0, lives - 1);
  SFX.boulderHit();
  updateHUD();
  boulder.squishTimer = 100; // ~1.7 sec invincibility
  // Knock player away
  var pushDir = (player.x + SW/2 < boulder.x + BOULDER_SIZE/2) ? -1 : 1;
  player.vx = pushDir * 10;
  player.vy = -8;
  flash('\u{1FAA8} Crushed by the boulder!  ' + lives + ' \u2665 left');
  if(lives <= 0){
    SFX.death();
    boulder.active = false;
    showAlert('\u{1F480}','Flattened!','The great stone had the last word.','\u21BA Restart');
  }
}




function drawPortalOrDoor(){
  var W=canvas.width,H=canvas.height,t=Date.now()*.002;
  if(sec>0||(si>0)){
    var bx=8,bh=H*.32,by=H*.5-bh/2;
    var bg2=ctx.createRadialGradient(bx+22,by+bh/2,4,bx+22,by+bh/2,75);
    bg2.addColorStop(0,'rgba(100,180,255,'+(.12+Math.sin(t*1.3)*.04)+')');
    bg2.addColorStop(.5,'rgba(60,120,200,.05)');bg2.addColorStop(1,'transparent');
    ctx.fillStyle=bg2;ctx.fillRect(bx-20,by-20,110,bh+40);
    ctx.save();
    ctx.strokeStyle='rgba(100,180,255,'+(.5+Math.sin(t*1.3)*.2)+')';
    ctx.lineWidth=2.5;ctx.shadowBlur=12;ctx.shadowColor='#44aaff';
    ctx.strokeRect(bx,by,44,bh);ctx.shadowBlur=0;ctx.restore();
    ctx.fillStyle='rgba(100,200,255,'+(.5+Math.sin(t*1.8)*.2)+')';
    ctx.font='bold 22px serif';ctx.textAlign='center';ctx.fillText('⊖',bx+22,by+bh/2+8);
    ctx.font='10px Cinzel,serif';ctx.fillStyle='rgba(100,200,255,.75)';ctx.textAlign='center';
    var backLabel='← '+(sec===0?(si>0?'PREV STAGE':''):'HINT ROOM');
    if(sec===1)backLabel='← HINT ROOM';
    if(sec===2)backLabel='← PUZZLE ROOM';
    ctx.fillText(backLabel,bx+22,by-8);ctx.textAlign='left';
    if(player.x<120){
      ctx.font='bold 11px Cinzel,serif';ctx.fillStyle='#88ccff';ctx.textAlign='center';
      ctx.fillText('[A] Go back',bx+22,by+bh+16);ctx.textAlign='left';
    }
    if(Math.random()<.15)spawn(bx+22+(Math.random()-.5)*12,by+bh/2,'#44aaff','ember');
  }
  if(sec<2){
    var px=W-58,ph=H*.38,py=H*.62-ph;
    var pg=ctx.createRadialGradient(px+25,py+ph/2,5,px+25,py+ph/2,90);
    pg.addColorStop(0,'rgba(255,215,0,'+(.14+Math.sin(t)*.05)+')');
    pg.addColorStop(.5,'rgba(180,140,20,.07)');pg.addColorStop(1,'transparent');
    ctx.fillStyle=pg;ctx.fillRect(px-35,py-25,120,ph+50);
    ctx.save();ctx.strokeStyle='rgba(255,215,0,'+(.6+Math.sin(t)*.2)+')';
    ctx.lineWidth=3;ctx.shadowBlur=15;ctx.shadowColor='#ffd700';
    ctx.strokeRect(px,py,50,ph);ctx.shadowBlur=0;ctx.restore();
    ctx.fillStyle='rgba(255,215,0,'+(.5+Math.sin(t*1.5)*.2)+')';
    ctx.font='bold 26px serif';ctx.textAlign='center';ctx.fillText('⊕',px+25,py+ph/2+10);ctx.textAlign='left';
    ctx.font='11px Cinzel,serif';ctx.fillStyle='rgba(255,215,0,.7)';ctx.textAlign='center';
    ctx.fillText(sec===0?'PUZZLE ROOM →':'DOOR ROOM →',px+25,py-10);ctx.textAlign='left';
    if(Math.random()<.25)spawn(px+25+(Math.random()-.5)*18,py+ph/2,'#ffd700','ember');
  } else {
    var room=getRoom(),puz=room?room.puzzle:null;
    var nid=puz&&puz.need,has=nid?invHas(nid):true;
    var dx=W-70,dh=H*.45,dy=H*.55-dh;
    var dg=ctx.createRadialGradient(dx+30,dy+dh/2,10,dx+30,dy+dh/2,100);
    dg.addColorStop(0,has?'rgba(160,110,40,.25)':'rgba(80,20,20,.2)');dg.addColorStop(1,'transparent');
    ctx.fillStyle=dg;ctx.fillRect(dx-40,dy-20,140,dh+40);
    ctx.strokeStyle=has?'#a07040':'#442020';ctx.lineWidth=4;ctx.strokeRect(dx,dy,60,dh);
    ctx.fillStyle='#2a1a0e';ctx.fillRect(dx+2,dy+2,56,dh-4);
    for(var i=0;i<5;i++){ctx.fillStyle='#3a2010';ctx.fillRect(dx+4,dy+4+i*(dh/5),52,dh/5-3);}
    ctx.fillStyle='#444';ctx.fillRect(dx+2,dy+dh*.3,56,6);ctx.fillRect(dx+2,dy+dh*.65,56,6);
    ctx.fillStyle=has?'#d4a843':'#cc2222';ctx.beginPath();ctx.arc(dx+30,dy+dh*.5,9,0,Math.PI*2);ctx.fill();
    ctx.font='bold 14px serif';ctx.textAlign='center';ctx.fillText(has?'\uD83D\uDD13':'\uD83D\uDD12',dx+30,dy+dh*.5+6);ctx.textAlign='left';
    ctx.font='11px Cinzel,serif';ctx.fillStyle=has?'rgba(212,168,67,.8)':'rgba(180,60,60,.8)';ctx.textAlign='center';
    ctx.fillText(has?'APPROACH TO ENTER':(nid?'NEED: '+nid.split('_')[0].toUpperCase():''),dx+30,dy-10);ctx.textAlign='left';
    if(has&&Math.random()<.1)spawn(dx+30+(Math.random()-.5)*20,dy,'#d4a843','ember');
  }
}

function drawItems(){
  var cs=getCurSec();if(!cs)return;
  var W=canvas.width,H=canvas.height,t=Date.now()*.003;
  cs.items.forEach(function(item){
    var ix=item.x*W,iy=item.y*H,bob=Math.sin(t+ix*.01)*4;
    var gl=ctx.createRadialGradient(ix,iy+bob,2,ix,iy+bob,30);
    gl.addColorStop(0,item.rp?'rgba(255,215,0,.3)':'rgba(100,150,255,.2)');gl.addColorStop(1,'transparent');
    ctx.fillStyle=gl;ctx.fillRect(ix-35,iy+bob-35,70,70);
    ctx.font='24px serif';ctx.textAlign='center';ctx.fillText(item.icon,ix,iy+bob);ctx.textAlign='left';
    ctx.font='9px Cinzel,serif';ctx.fillStyle=item.rp?'rgba(255,215,0,.9)':'rgba(150,180,255,.9)';
    ctx.textAlign='center';ctx.fillText(item.label,ix,iy+bob+18);ctx.textAlign='left';
    var px2=player.x+SW/2,py2=player.y+SH/2;
    if(Math.hypot(px2-ix,py2-(iy+bob))<80){
      ctx.font='bold 11px Cinzel,serif';ctx.fillStyle='#ffd700';ctx.textAlign='center';
      ctx.fillText('[E] Pick up',ix,iy+bob-32);ctx.textAlign='left';
    }
  });
}

function drawPlayer(){
  // Hidden during death animation
  if(deathAnim) return;
  ctx.save();noSmooth();
  var sx=player.x,sy=player.y;
  if(player.dashing){ctx.globalAlpha=.5+Math.random()*.3;ctx.shadowBlur=20;ctx.shadowColor='#44aaff';}
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(sx+SW/2,sy+SH+2,CW*.65,5,0,0,Math.PI*2);ctx.fill();
  var img=null;
  if(!player.moving){img=player.ifrm===0?SPR.idle:SPR.idle2;}
  else if(player.sprinting||player.dashing){img=SPR.run[player.frame%Math.max(SPR.run.length,1)];}
  else{img=SPR.walk[player.frame%Math.max(SPR.walk.length,1)];}
  if(img&&img.complete&&img.naturalWidth){
    if(player.dir===-1){ctx.translate(sx+SW,sy);ctx.scale(-1,1);ctx.drawImage(img,0,0,SW,SH);}
    else ctx.drawImage(img,sx,sy,SW,SH);
  } else {
    if(player.dir===-1){ctx.translate((sx+SW/2)*2,0);ctx.scale(-1,1);}
    ctx.fillStyle='#d4a843';ctx.fillRect(sx+8,sy+20,SW-16,SH-28);
    ctx.fillStyle='#f0c080';ctx.fillRect(sx+10,sy+2,SW-20,20);
    ctx.fillStyle='#8a3020';ctx.fillRect(sx+8,sy+22,SW-16,6);
  }
  ctx.restore();noSmooth();
}

function drawStam(){
  var barW=120,barH=8,barX=16,barY=canvas.height-38;
  var pct=player.stamina/SMAX,low=player.stamina<30;
  var dr=player.dcd<=0&&player.stamina>=DCOST;
  ctx.save();
  ctx.fillStyle='rgba(10,6,14,.75)';ctx.fillRect(barX-2,barY-14,barW+64,barH+22);
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(barX,barY,barW,barH);
  ctx.strokeStyle='rgba(212,168,67,.35)';ctx.lineWidth=1;ctx.strokeRect(barX,barY,barW,barH);
  if(pct>0){
    var fc=player.dashing?'#88ccff':(low?'#aa4400':'#3399dd');
    var gr=ctx.createLinearGradient(barX,0,barX+barW,0);
    gr.addColorStop(0,fc);gr.addColorStop(1,player.dashing?'#fff':'#66bbff');
    ctx.fillStyle=gr;ctx.fillRect(barX,barY,barW*pct,barH);
  }
  ctx.font='600 10px Cinzel,serif';ctx.fillStyle=low?'#ff6633':'rgba(212,168,67,.9)';ctx.fillText('STAMINA',barX,barY-3);
  var dx=barX+barW+10,dw=44,dh=barH+6;
  ctx.fillStyle=dr?'rgba(30,80,140,.9)':'rgba(20,20,30,.7)';ctx.fillRect(dx,barY-3,dw,dh);
  ctx.strokeStyle=dr?'#44aaff':'rgba(100,100,120,.4)';ctx.lineWidth=1.5;ctx.strokeRect(dx,barY-3,dw,dh);
  if(!dr&&player.dcd>0){ctx.fillStyle='rgba(68,170,255,.25)';ctx.fillRect(dx,barY-3,dw*(1-player.dcd/DCDWN),dh);}
  ctx.font='600 9px Cinzel,serif';ctx.fillStyle=dr?'#88ddff':'#445566';ctx.textAlign='center';
  ctx.fillText('DASH [F]',dx+dw/2,barY+barH+1);ctx.textAlign='left';
  // Speed boost bar
  if(speedBoostActive){
    var pct2=speedBoostTimer/SPEED_BOOST_DUR;
    var sbx=barX,sby=barY-24,sbw=barW+54,sbh=7;
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(sbx,sby,sbw,sbh);
    var sg2=ctx.createLinearGradient(sbx,0,sbx+sbw,0);
    sg2.addColorStop(0,'#ffdd00');sg2.addColorStop(1,'#ff8800');
    ctx.fillStyle=sg2;ctx.fillRect(sbx,sby,sbw*pct2,sbh);
    ctx.strokeStyle='rgba(255,200,0,.5)';ctx.lineWidth=1;ctx.strokeRect(sbx,sby,sbw,sbh);
    ctx.font='700 9px Cinzel,serif';ctx.fillStyle='#ffee88';ctx.textAlign='center';
    ctx.fillText('⚡ SPEED BOOST',sbx+sbw/2,sby-3);ctx.textAlign='left';
    // Glow effect on player
  }
  ctx.restore();
}

function drawHUD(){
  var W=canvas.width,th=STAGE_THEMES[si]||STAGE_THEMES[0];
  var labels=['§ HINT','§ PUZZLE','§ DOOR'];
  ctx.save();ctx.textAlign='center';
  for(var i=0;i<3;i++){
    ctx.fillStyle=i===sec?th.accentColor:'rgba(255,255,255,.2)';
    ctx.beginPath();ctx.arc(W/2-28+i*28,14,i===sec?7:5,0,Math.PI*2);ctx.fill();
  }
  ctx.font='700 11px Cinzel,serif';ctx.fillStyle=th.accentColor;ctx.fillText(labels[sec],W/2,32);
  var rm=getRoom();
  if(rm){ctx.font='10px Cinzel,serif';ctx.fillStyle='rgba(212,168,67,.7)';ctx.fillText(rm.name,W/2,44);}
  ctx.restore();
}

function drawLore(){
  var cs=getCurSec();if(sec!==0||!cs||!cs.lore||loreHidden)return;
  var W=canvas.width,H=canvas.height;
  var pw=Math.min(W*.6,480),px=(W-pw)/2,py=H*.68,ph=86;
  ctx.save();
  ctx.fillStyle='rgba(10,6,14,.9)';ctx.strokeStyle='rgba(212,168,67,.5)';ctx.lineWidth=1.5;
  ctx.fillRect(px,py,pw,ph);ctx.strokeRect(px,py,pw,ph);
  ctx.fillStyle='rgba(212,168,67,.85)';ctx.font='9px Cinzel,serif';ctx.textAlign='center';
  var words=cs.lore.split(' '),line='',lines=[],maxW=pw-24;
  for(var i=0;i<words.length;i++){
    var t=line+(line?' ':'')+words[i];
    if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=words[i];}else line=t;
  }
  if(line)lines.push(line);
  lines.slice(0,4).forEach(function(l,i){ctx.fillText(l,W/2,py+18+i*16);});
  ctx.fillStyle='rgba(255,215,0,.45)';ctx.font='8px Cinzel,serif';
  ctx.fillText('📖 Find the glowing item for the puzzle clue!',W/2,py+ph-6);
  ctx.restore();
}

function drawMsg(){
  if(msgTmr<=0)return;
  ctx.save();ctx.globalAlpha=Math.min(1,msgTmr/30);
  ctx.font='bold 13px Cinzel,serif';ctx.fillStyle='#ffd700';ctx.textAlign='center';
  ctx.fillText(msgTxt,canvas.width/2,canvas.height*.38);ctx.restore();
}

function drawPtcls(){
  ptcls.forEach(function(p){
    ctx.save();ctx.globalAlpha=p.life*.75;ctx.fillStyle=p.col;
    ctx.shadowBlur=p.type==='dash'?12:(p.type==='blood'?10:6);ctx.shadowColor=p.col;
    ctx.fillRect(Math.round(p.x-p.sz/2),Math.round(p.y-p.sz/2),Math.ceil(p.sz),Math.ceil(p.sz));
    ctx.restore();
  });
}

// ── MASTER DRAW ──────────────────────────────────────────────
function draw(){
  noSmooth();
  // ── World-space layer (camera-translated) ───────────────────
  ctx.save();
  ctx.translate(0, -camY);   // camera follows player downward during death fall
  drawBG();
  drawPlatforms();
  drawVoidFloor();
  drawPortalOrDoor();
  drawItems();
  drawPtcls();
  drawBoulder();
  drawHammers();
  drawPlayer();
  drawBodyChunks();
  ctx.restore();
  // ── Screen-space layer (fixed HUD, never translated) ────────
  if(si===0){ drawMsg(); }
  else{ drawStam();drawHUD();drawLore();drawMsg();tutDraw(); }
  // Vignette
  var W=canvas.width,H=canvas.height;
  var vg=ctx.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H*.85);
  vg.addColorStop(0,'rgba(0,0,0,.04)');vg.addColorStop(1,si===0?'rgba(0,0,0,.24)':'rgba(0,0,0,.42)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
}

// ── UPDATE ───────────────────────────────────────────────────
function update(){
  if(paused||gameState!=='playing'||deathAnim)return;
  bgX+=.6;
  syncStageHudFrame();
  var canSpr=player.stamina>SSMIN;
  player.sprinting=(keys['ShiftLeft']||keys['ShiftRight'])&&canSpr&&!player.dashing;
  player.moving=false;
  if(!player.dashing){
    var _boostMult = speedBoostActive ? SPEED_BOOST_MULT : (player.sprinting ? SMULT : 1);
    var spd=BSPD*_boostMult;
    if(keys['KeyW']||keys['KeyD']||keys['ArrowRight']){player.vx+=spd;player.dir=1;player.moving=true;}
    if(keys['KeyA']||keys['ArrowLeft']){player.vx-=spd;player.dir=-1;player.moving=true;}
    if(keys['KeyS']||keys['ArrowDown']){player.vx*=0.55;}
  }
  if(speedBoostActive){
    speedBoostTimer--;
    if(speedBoostTimer<=0){ speedBoostActive=false; }
  }
  var cap=BSPD*(speedBoostActive?SPEED_BOOST_MULT:(player.sprinting?SMULT:1))*4;
  player.vx=Math.max(-cap,Math.min(cap,player.vx));
  if(player.moving&&!loreHidden&&sec===0){loreHidden=true;}
  if((jp['Space']||jp['ArrowUp'])&&player.grounded){
    player.vy=JVEL;player.grounded=false;jp['Space']=jp['ArrowUp']=false;SFX.jump();
    if(TUT.active)TUT.jumpCount++;
  }
  if(jp['KeyF']&&player.dcd<=0&&player.stamina>=DCOST&&!player.dashing){
    player.dashing=true;player.dtmr=DDUR;player.ddir=player.dir;
    player.stamina-=DCOST;player.dcd=DCDWN;if(player.vy>0)player.vy*=.3;
    jp['KeyF']=false;SFX.dash();
    if(TUT.active)TUT.dashCount++;
  }
  if(player.dashing){player.vx=player.ddir*DSPD;player.dtmr--;spawnDash();if(player.dtmr<=0){player.dashing=false;player.vx*=.4;}}
  if(player.sprinting&&player.moving)player.stamina=Math.max(0,player.stamina-SDRAIN);
  else if(!player.dashing)player.stamina=Math.min(SMAX,player.stamina+(player.moving?SREGEN*.5:SREGEN));
  if(player.dcd>0)player.dcd--;
  player.vy+=GRAV;player.vx*=FRIC;player.x+=player.vx;player.y+=player.vy;
  if(player.x<0){player.x=0;player.vx=0;}
  var cs=getCurSec();
  player.grounded=false;
  if(cs)cs.platforms.forEach(function(p){
    var rx=p.x*canvas.width,ry=p.y*canvas.height,rw=p.w*canvas.width,rh=p.h*canvas.height;
    var cx=player.x+COX,cy=player.y+COY,prevBot=cy+CH-player.vy;
    if(cx<rx+rw&&cx+CW>rx&&cy+CH>ry&&prevBot<=ry+8&&player.vy>=0){
      player.y=ry-COY-CH;player.vy=0;if(!player.was)SFX.land();player.grounded=true;
    }
  });
  if(player.moving&&player.grounded){
    player.atick++;
    if(player.atick>(player.sprinting||player.dashing?4:7)){
      var arr=(player.sprinting||player.dashing)?SPR.run:SPR.walk;
      player.frame=(player.frame+1)%Math.max(arr.length,1);player.atick=0;
      if(!player.dashing)SFX.step();
    }
    if(!player.dashing&&Math.random()<.1)spawn(player.x+SW/2+(Math.random()-.5)*10,player.y+SH,'#7a4a28','dust');
  } else if(!player.moving&&!player.dashing){
    player.frame=0;if(++player.itick>40){player.ifrm=(player.ifrm+1)%2;player.itick=0;}
  }
  if(jp['KeyE']){jp['KeyE']=false;
    if(cs){var px=player.x+SW/2,py=player.y+SH/2;
      for(var i=cs.items.length-1;i>=0;i--){
        var it=cs.items[i];
        if(Math.hypot(px-it.x*canvas.width,py-it.y*canvas.height)<80){
          if(inv.every(function(s){return s!==null;}))flash('⚠ Inventory full! Press Q to drop');
          else{invAdd(it);cs.items.splice(i,1);flash('Picked up '+it.icon+' '+it.label);SFX.portal();}
          break;
        }
      }
    }
  }
  // Left edge — go back
  if(player.x<=0&&player.vx<=0&&!quizOpen){
    if(sec>0){SFX.portal();sec--;resetSec(true);}
    else if(si>0){SFX.portal();si--;sec=2;resetSec(true);}
    else{player.x=2;player.vx=0;flash('⬅ You are at the beginning of the Labyrinth!');}
  }
  // Right edge
  if(player.x+SW>canvas.width-6&&!quizOpen){
    if(TUT.active&&TUT.step>=TUT_STEPS.length-1){tutEnd();return;}
    if(TUT.active){flash('Complete all steps first!');player.x=canvas.width-SW-14;player.vx=-2;return;}
    if(sec<2){SFX.roomClear();sec++;resetSec(false);}
    else{
      var room=getRoom();
      if(room&&room.puzzle){
        var nid=room.puzzle.need;
        if(nid&&!invHas(nid)){flash('🔒 Need the '+nid.split('_')[0]+' item!');player.x=canvas.width-SW-12;player.vx=-3;}
        else{quizOpen=true;paused=true;openQuiz(room);}
      }
    }
  }

  // ── VOID FLOOR IMPACT — shatter death ────────────────────
  var voidTopY = canvas.height + VOID_FLOOR_OFFSET - VOID_FLOOR_H;
  if(!deathAnim && player.y + SH >= voidTopY && player.vy > 0){
    // Snap Icarus onto the spike tips for one frame so chunks spawn correctly
    player.y  = voidTopY - SH;
    player.vx = 0;
    player.vy = 0;
    lives--;
    SFX.spikeHit();
    spawnBodyChunks(player.x, player.y);
    deathAnim  = true;
    deathTimer = 0;
    // keep loop running (don't pause) so animation plays
  }

  // ── CAMERA — only follow when falling off the bottom ────────
  // Activate only when player has dropped below the visible canvas floor
  // and is still moving downward (vy > 0). On any other condition, snap back.
  var fallingOff = (player.y + SH > canvas.height) && (player.vy > 0);
  if(fallingOff){
    // Keep player vertically centred on screen as they fall
    var targetCamY = player.y + SH/2 - canvas.height/2;
    camY += (targetCamY - camY) * 0.18;
  } else if(!deathAnim){
    // Not falling off-screen and no death anim — camera is always at 0
    camY = 0;
  }

  tutUpdate();
  // ── BOULDER — update chasing rock ────────────────────────
  if(!TUT.active)updateBoulder();
  if(!TUT.active)updateHammers();
  // Timer
  var diff=Math.floor((Date.now()-startTime)/1000);
  var tel=document.getElementById('timer');
  if(tel)tel.innerText=String(Math.floor(diff/60)).padStart(2,'0')+':'+String(diff%60).padStart(2,'0');
  player.was=player.grounded;
  if(msgTmr>0)msgTmr--;
  for(var i=ptcls.length-1;i>=0;i--){
    var p=ptcls[i];p.x+=p.vx;p.y+=p.vy;
    if(p.type==='ember')     p.vy-=.04;
    else if(p.type==='dash') {p.vx*=.85;p.vy*=.85;}
    else if(p.type==='blood'){p.vy+=0.38;p.vx*=0.88;}
    else                      p.vy+=.05;
    p.life-=p.dec;if(p.life<=0)ptcls.splice(i,1);
  }
}

// ── GAME LOOP ────────────────────────────────────────────────
function gameLoop(){
  if(gameState!=='playing'){loopId=null;return;}
  if(deathAnim){
    updateBodyChunks();
    draw();
  } else if(!paused){
    update();draw();
  }
  loopId=requestAnimationFrame(gameLoop);
}
function startLoop(){
  if(loopId){cancelAnimationFrame(loopId);loopId=null;}
  loopId=requestAnimationFrame(gameLoop);
}

// ── MENU BACKGROUND LOOP — keeps canvas alive while on start screen ──────────
var menuLoopId=null;
function menuLoop(){
  if(gameState!=='menu'){menuLoopId=null;return;}
  bgX+=0.4;
  // Update embers
  for(var i=ptcls.length-1;i>=0;i--){
    var p=ptcls[i];p.x+=p.vx;p.y+=p.vy;p.vy-=0.04;
    p.life-=p.dec;if(p.life<=0)ptcls.splice(i,1);
  }
  drawBG();
  drawPtcls();
  // Vignette
  var W=canvas.width,H=canvas.height;
  var vg=ctx.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H*.85);
  vg.addColorStop(0,'rgba(0,0,0,.15)');vg.addColorStop(1,'rgba(0,0,0,.78)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  menuLoopId=requestAnimationFrame(menuLoop);
}
function startMenuLoop(){
  if(menuLoopId){cancelAnimationFrame(menuLoopId);menuLoopId=null;}
  menuLoopId=requestAnimationFrame(menuLoop);
}

// ── QUIZ ─────────────────────────────────────────────────────
function openQuiz(room){
  var puz=room.puzzle;
  var panel=document.getElementById('door-quiz');
  var tEl=document.getElementById('quiz-room-title');
  var qEl=document.getElementById('quiz-question-text');
  var oEl=document.getElementById('quiz-options');
  var hEl=document.getElementById('quiz-hint-text');
  if(tEl)tEl.textContent='🚪 '+room.name;
  if(qEl)qEl.textContent=puz.q;
  if(hEl){hEl.textContent='';hEl.style.color='';}
  if(oEl){
    oEl.innerHTML='';
    puz.opts.forEach(function(opt,i){
      var lbl=document.createElement('label');
      lbl.className='quiz-option';
      lbl.innerHTML='<input type="radio" name="quiz-answer" value="'+String.fromCharCode(65+i)+'"><span>'+opt+'</span>';
      oEl.appendChild(lbl);
    });
  }
  panel.dataset.answer=puz.ans;panel.dataset.hint=puz.hint;
  panel.classList.remove('hidden');
}
window.submitQuizAnswer=function(){
  var sel=document.querySelector('input[name="quiz-answer"]:checked');
  var hEl=document.getElementById('quiz-hint-text');
  if(!sel){if(hEl){hEl.textContent='Please select an answer!';hEl.style.color='#ff8844';}return;}
  var panel=document.getElementById('door-quiz');
  if(sel.value===panel.dataset.answer){
    panel.classList.add('hidden');quizOpen=false;paused=false;advStage();
  } else {
    if(hEl){hEl.textContent='\u2717 Wrong! Hint: '+panel.dataset.hint;hEl.style.color='#ff6644';}
    player.stamina=Math.max(0,player.stamina-20);
  }
};
window.closeDoorQuiz=function(){
  document.getElementById('door-quiz').classList.add('hidden');
  quizOpen=false;paused=false;
  player.x=canvas.width-SW-90;player.vx=-3;
  startLoop();
};

// ── STAGE ADVANCE ────────────────────────────────────────────
function advStage(){
  SFX.roomClear();
  // ── Stage 8 complete (si=7) — door leads to stage2.html ──
  if(si>=maze.length-1){
    SFX.victory();
    var overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;background:#000;opacity:0;z-index:999;transition:opacity 1.2s;pointer-events:none;font-family:Cinzel,serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:#ffd700;text-align:center;';
    overlay.innerHTML='<div style="font-size:2.2rem;letter-spacing:6px;">YOU ESCAPED</div><div style="font-size:.9rem;color:#d4a843;letter-spacing:3px;">The Labyrinth releases you...</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function(){ overlay.style.opacity='1'; });
    setTimeout(function(){ window.location.href='stage2.html'; }, 2000);
    return;
  }
  si++;sec=0;resetSec(false);startLoop();
}

// ── INIT ─────────────────────────────────────────────────────
// startGame: called by "Enter the Maze" — shows the tutorial prompt
function startGame(){
  document.getElementById('start-screen').classList.add('hidden');
  launchGame();
}

// launchGame: actually starts the maze (called after tutorial choice)
async function launchGame(){
  var tp=document.getElementById('tut-prompt');  if(tp) tp.classList.add('hidden');
  var ts=document.getElementById('tut-summary'); if(ts) ts.classList.add('hidden');
  TUT.active=false;
  if(!sprOK)await initSpr();
  maze=genMaze();si=0;sec=0;lives=3;
  gameState='playing';paused=false;quizOpen=false;
  if(menuLoopId){cancelAnimationFrame(menuLoopId);menuLoopId=null;}
  deathAnim=false;deathTimer=0;bodyChunks=[];
  ptcls=[];startTime=Date.now();
  player.stamina=SMAX;player.dcd=0;
  speedBoostActive=true;speedBoostTimer=SPEED_BOOST_DUR;
  BOULDER_STAGE=Math.floor(Math.random()*7)+1;
  boulder.active=false;boulder.dropped=false;boulder.rolling=false;
  boulder.squishTimer=0;boulder.warnTimer=0;boulder.x=-200;boulder.y=-200;boulder.vy=0;
  pickHammerRooms();
  hammers=[];
  for(var i=0;i<INVMAX;i++)inv[i]=null;
  renderInv();invOpen=false;
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('ui-layer').classList.remove('hidden');
  document.getElementById('hud-bottom').classList.remove('hidden');
  document.getElementById('inventory-ui').classList.add('hidden');
  SFX.startBG();
  resetSec(false);
  startLoop();
}

function resetSec(fromRight){
  loreHidden=false;
  deathAnim=false;deathTimer=0;bodyChunks=[];camY=0;
  // Reset boulder each section transition so it drops fresh
  boulder.active=false;boulder.dropped=false;boulder.rolling=false;
  boulder.warnTimer=0;boulder.squishTimer=0;boulder.x=-200;boulder.y=-200;boulder.vy=0;
  // ── Snap player onto the spawn platform so they walk in, not fall ──
  (function(){
    var spawnX = fromRight ? (canvas.width - SW - 80) : 60;
    player.x = spawnX;
    player.vx = 0; player.vy = 0;
    // Find the platform whose top edge the player should stand on
    var cs = getCurSec();
    var landY = canvas.height * 0.88 - CH; // fallback near floor
    if(cs){
      cs.platforms.forEach(function(p){
        var px = p.x * canvas.width;
        var pw = p.w * canvas.width;
        var py = p.y * canvas.height;
        var pcx = spawnX + SW/2;
        if(pcx >= px && pcx <= px + pw){
          // Player centre is above this platform — use its top
          if(py - CH < landY) landY = py - CH;
        }
      });
    }
    player.y = landY - COY; // position so feet sit on platform top
    player.grounded = true;
  })();
  player.frame=0;player.atick=0;player.ifrm=0;player.itick=0;
  player.dashing=false;player.dtmr=0;
  for(var k in jp)jp[k]=false;
  var room=getRoom(),th=STAGE_THEMES[si]||STAGE_THEMES[0];
  var sl=['Hint','Puzzle','Door'][sec]||'';
  var e1=document.getElementById('layer-name'),e2=document.getElementById('room-prog'),e3=document.getElementById('prog-fill');
  if(e1)e1.innerText=room?th.name+': '+room.name:'—';
  if(e2)e2.innerText='Stage '+(si+1)+'/8 · '+sl+' Room';
  if(si===0){
    if(e1)e1.innerText='Stage I';
    if(e2)e2.innerText=room?room.name:'Threshold Court';
  }
  if(e3)e3.style.width=Math.max(5,((si*3+sec+1)/24)*100)+'%';
  updateHUD();
  spawnHammers();
}

function updateHUD(){
  var hb=document.getElementById('health-bar');if(!hb)return;
  var h='';
  for(var i=0;i<3;i++){
    var full=i<lives;
    h+='<div class="heart '+(full?'full':'')+'"><svg viewBox="0 0 20 18" xmlns="http://www.w3.org/2000/svg"><path d="M10 16.5S1 11 1 5.5A4.5 4.5 0 0 1 10 3.6 4.5 4.5 0 0 1 19 5.5C19 11 10 16.5 10 16.5z" fill="'+(full?'#cc2222':'#2a1010')+'" stroke="'+(full?'#ff4444':'#4a2020')+'" stroke-width="1.5"/></svg></div>';
  }
  hb.innerHTML=h;
  syncStageHudFrame();
}

function syncStageHudFrame(){
  var sf=document.getElementById('stam-fill');
  if(sf){
    sf.style.width=Math.max(0,Math.min(100,(player.stamina/SMAX)*100))+'%';
  }
  var dr=document.getElementById('dash-ready');
  if(dr){
    var ready=player.dcd<=0&&player.stamina>=DCOST;
    dr.textContent=ready?'Ready':'Recover';
    dr.style.color=ready?'#44aaff':'#8c7350';
  }
  var tel=document.getElementById('timer');
  if(tel){
    var secT=((Date.now()-startTime)/1000)|0,m=(secT/60)|0,s=secT%60;
    tel.textContent=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  }
}

function showAlert(icon,title,msg,btn){
  paused=true;
  document.getElementById('alert-icon').innerText=icon;
  document.getElementById('alert-title').innerText=title;
  document.getElementById('alert-message').innerText=msg;
  var b=document.querySelector('#custom-alert .btn');if(b)b.innerHTML=btn||'↺ Try Again';
  document.getElementById('custom-alert').classList.remove('hidden');
}

// ── WINDOW FUNCTIONS ─────────────────────────────────────────
window.togglePause=function(){
  if(gameState!=='playing'||quizOpen||deathAnim)return;
  if(document.getElementById('custom-alert').offsetParent!==null)return;
  paused=!paused;
  document.getElementById('pause-menu').classList.toggle('hidden',!paused);
  SFX.pauseBG(paused);
  if(!paused)startLoop();
};
window.toggleInventory=function(){
  invOpen=!invOpen;
  if(TUT.active&&invOpen)TUT.invOpened=true;
  document.getElementById('inventory-ui').classList.toggle('hidden',!invOpen);
  var btn=document.getElementById('inv-toggle-btn');
  if(btn)btn.classList.toggle('active',invOpen);
};
window.handleAlertConfirm=function(){
  document.getElementById('custom-alert').classList.add('hidden');
  window.resetMaze();
};
window.resetMaze=function(){
  si=0;sec=0;lives=3;startTime=Date.now();ptcls=[];quizOpen=false;
  deathAnim=false;deathTimer=0;bodyChunks=[];camY=0;
  BOULDER_STAGE = Math.floor(Math.random() * 7) + 1;
  boulder.active=false;boulder.dropped=false;boulder.rolling=false;
  boulder.squishTimer=0;boulder.warnTimer=0;boulder.x=-200;boulder.y=-200;boulder.vy=0;
  pickHammerRooms();
  hammers=[];
  player.stamina=SMAX;player.dcd=0;
  speedBoostActive=true;speedBoostTimer=SPEED_BOOST_DUR;
  for(var i=0;i<INVMAX;i++)inv[i]=null;
  renderInv();invOpen=false;
  maze=genMaze();
  document.getElementById('pause-menu').classList.add('hidden');
  document.getElementById('custom-alert').classList.add('hidden');
  document.getElementById('inventory-ui').classList.add('hidden');
  resetSec(false);paused=false;startLoop();
};
window.returnToMenu=function(){
  SFX.stopBG();
  window.location.href='index.html';
};
window.showPanel=function(id){var el=document.getElementById(id);if(el)el.classList.remove('hidden');};
window.hidePanels=function(){
  document.querySelectorAll('.overlay').forEach(function(e){
    if(['start-screen','pause-menu','custom-alert','tut-prompt','tut-summary'].indexOf(e.id)===-1)e.classList.add('hidden');
  });
};
window.toggleSetting=function(el){
  el.classList.toggle('on');
  if(el.id==='tog-scanlines')
    document.getElementById('scanlines').style.display=el.classList.contains('on')?'block':'none';
};
window.startGame=startGame;
window.launchGame=launchGame;
window.tutStart=tutStart;

// ── RESIZE ───────────────────────────────────────────────────
function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;noSmooth();}
window.addEventListener('resize',function(){resize();if(gameState==='playing')resetSec(false);});
resize();

// ── START SCREEN EMBERS + MENU LOOP ─────────────────────────
(function(){
  var c=document.getElementById('ember-container');if(!c)return;
  setInterval(function(){
    var e=document.createElement('div');e.className='particle';
    e.style.cssText='left:'+Math.random()*100+'vw;bottom:'+Math.random()*30+'vh;animation-delay:'+Math.random()*4+'s;animation-duration:'+(3+Math.random()*3)+'s;background:'+(Math.random()<.5?'#d4a843':'#ff6020');
    c.appendChild(e);setTimeout(function(){e.remove();},8000);
  },300);
})();
startGame();
