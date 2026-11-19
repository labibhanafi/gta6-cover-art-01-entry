/* Neon Vice Cover Studio — offline GTA-style cover maker.
   Everything runs on one canvas: photos are drawn into poster panels,
   a sunset/neon grade is painted over them, and the title is lettered
   on top. Photos never leave the machine; there are no network calls. */
'use strict';

/* ------------------------------------------------------------------ data */

var LAYOUTS = [
  { name: 'Palm Split', panels: function (w, h) {
    return [
      { x: 0, y: 0, w: w, h: h * 0.62, photo: 0 },
      { x: 0, y: h * 0.62, w: w * 0.5, h: h * 0.38, photo: 1 },
      { x: w * 0.5, y: h * 0.62, w: w * 0.5, h: h * 0.38, photo: 2 },
    ]; } },
  { name: 'Hero Left', panels: function (w, h) {
    return [
      { x: 0, y: 0, w: w * 0.56, h: h, photo: 0 },
      { x: w * 0.56, y: 0, w: w * 0.44, h: h * 0.5, photo: 1 },
      { x: w * 0.56, y: h * 0.5, w: w * 0.44, h: h * 0.5, photo: 2 },
    ]; } },
  { name: 'Hero Right', panels: function (w, h) {
    return [
      { x: 0, y: 0, w: w * 0.44, h: h * 0.5, photo: 1 },
      { x: 0, y: h * 0.5, w: w * 0.44, h: h * 0.5, photo: 2 },
      { x: w * 0.44, y: 0, w: w * 0.56, h: h, photo: 0 },
    ]; } },
  { name: 'Quad Grid', panels: function (w, h) {
    return [
      { x: 0, y: 0, w: w * 0.5, h: h * 0.5, photo: 0 },
      { x: w * 0.5, y: 0, w: w * 0.5, h: h * 0.5, photo: 1 },
      { x: 0, y: h * 0.5, w: w * 0.5, h: h * 0.5, photo: 2 },
      { x: w * 0.5, y: h * 0.5, w: w * 0.5, h: h * 0.5, photo: 3 },
    ]; } },
  { name: 'Triptych', panels: function (w, h) {
    return [
      { x: 0, y: 0, w: w / 3, h: h, photo: 0 },
      { x: w / 3, y: 0, w: w / 3, h: h, photo: 1 },
      { x: (w / 3) * 2, y: 0, w: w / 3, h: h, photo: 2 },
    ]; } },
  { name: 'Full Bleed', panels: function (w, h) {
    return [ { x: 0, y: 0, w: w, h: h, photo: 0 } ]; } },
  { name: 'Strip Stack', panels: function (w, h) {
    return [
      { x: 0, y: 0, w: w, h: h * 0.34, photo: 0 },
      { x: 0, y: h * 0.34, w: w, h: h * 0.33, photo: 1 },
      { x: 0, y: h * 0.67, w: w, h: h * 0.33, photo: 2 },
    ]; } },
  { name: 'Sunset Trio', panels: function (w, h) {
    return [
      { x: 0, y: 0, w: w, h: h * 0.58, photo: 0 },
      { x: 0, y: h * 0.58, w: w / 3, h: h * 0.42, photo: 1 },
      { x: w / 3, y: h * 0.58, w: w / 3, h: h * 0.42, photo: 2 },
      { x: (w / 3) * 2, y: h * 0.58, w: w / 3, h: h * 0.42, photo: 3 },
    ]; } },
];

var GRADES = [
  { name: 'Vice Sunset', sky: ['#ff9a3d', '#ff2e88', '#7b2ff7'], tint: 'rgba(255,110,60,0.20)', title: ['#ffe259', '#ff7a18', '#ff2e88'], neon: '#19e3c2' },
  { name: 'Neon Nights', sky: ['#12002e', '#ff2e88', '#00e5ff'], tint: 'rgba(255,46,136,0.22)', title: ['#7df9ff', '#ff2e88', '#b967ff'], neon: '#00e5ff' },
  { name: 'Ocean Drive', sky: ['#00c6a2', '#0077ff', '#0b1035'], tint: 'rgba(0,180,220,0.20)', title: ['#eafffb', '#19e3c2', '#0077ff'], neon: '#ffc93c' },
  { name: 'Pink Heat', sky: ['#ff5e62', '#ff2e88', '#c9184a'], tint: 'rgba(255,46,136,0.28)', title: ['#fff0f5', '#ff8fb1', '#ff2e88'], neon: '#ffe259' },
  { name: 'Teal Rush', sky: ['#0f2027', '#19e3c2', '#ff7a18'], tint: 'rgba(25,227,194,0.20)', title: ['#d8fff4', '#19e3c2', '#ff7a18'], neon: '#ff2e88' },
  { name: 'Golden Hour', sky: ['#f7971e', '#ffd200', '#ff5e62'], tint: 'rgba(255,180,40,0.22)', title: ['#fff7cc', '#ffc93c', '#ff7a18'], neon: '#ff2e88' },
  { name: 'Ultraviolet', sky: ['#240b36', '#7b2ff7', '#ff2e88'], tint: 'rgba(123,47,247,0.26)', title: ['#e0c3ff', '#b967ff', '#ff2e88'], neon: '#19e3c2' },
  { name: 'Mono Noir', sky: ['#1a1a2e', '#4a4a6a', '#0f0f1a'], tint: 'rgba(120,120,160,0.16)', title: ['#ffffff', '#c9c9d6', '#8a8aa3'], neon: '#ffffff' },
];

var SIZES = [
  { name: 'Square 1080×1080', w: 1080, h: 1080 },
  { name: 'Portrait 1080×1350', w: 1080, h: 1350 },
  { name: 'Wide HD 1920×1080', w: 1920, h: 1080 },
  { name: 'Story 1080×1920', w: 1080, h: 1920 },
  { name: 'Wide 2K 2048×1152', w: 2048, h: 1152 },
  { name: 'Link 1200×630', w: 1200, h: 630 },
  { name: 'Wide Post 1080×566', w: 1080, h: 566 },
];

/* --------------------------------------------------------------- state */

var state = {
  layout: 0,
  grade: 0,
  size: 2, // Wide HD preview by default so the title fits the frame
  title: 'SUNSET HEIST',
  subtitle: 'one last ride down Ocean Drive',
  titleSize: 104,
  grain: true,
  badge: true,
  photos: [null, null, null, null], // {img, name, zoom, dx, dy}
};

var canvas = document.getElementById('coverCanvas');
var ctx = canvas.getContext('2d');
var statusLine = document.getElementById('statusLine');

/* ------------------------------------------------------------ helpers */

function $(id) { return document.getElementById(id); }

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadImage(src) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.onload = function () { resolve(img); };
    img.onerror = function () { reject(new Error('cannot load ' + src)); };
    img.src = src;
  });
}

function fitText(text, maxWidth, startPx, family) {
  var px = startPx;
  ctx.font = '900 ' + px + 'px ' + family;
  while (px > 24 && ctx.measureText(text).width > maxWidth) {
    px -= 4;
    ctx.font = '900 ' + px + 'px ' + family;
  }
  return px;
}

/* ------------------------------------------------------------ drawing */

function drawPhotoInto(panel, slot) {
  var img = slot.img;
  var pw = panel.w, ph = panel.h;
  var scale = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * slot.zoom;
  var dw = img.naturalWidth * scale;
  var dh = img.naturalHeight * scale;
  var dx = panel.x + (pw - dw) / 2 + (slot.dx / 100) * pw;
  var dy = panel.y + (ph - dh) / 2 + (slot.dy / 100) * ph;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPlaceholder(panel, grade) {
  var g = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
  g.addColorStop(0, grade.sky[0]);
  g.addColorStop(0.55, grade.sky[1]);
  g.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  // setting sun
  var cx = panel.x + panel.w / 2, cy = panel.y + panel.h * 0.42;
  var r = Math.min(panel.w, panel.h) * 0.2;
  var sun = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  sun.addColorStop(0, '#fff3c4');
  sun.addColorStop(0.6, '#ffb347');
  sun.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = sun;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  // palm-ish silhouette: a few sweeping fronds
  ctx.strokeStyle = 'rgba(20,4,31,0.85)';
  ctx.lineWidth = Math.max(3, panel.w * 0.008);
  ctx.lineCap = 'round';
  var bx = panel.x + panel.w * 0.12, by = panel.y + panel.h;
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + panel.w * 0.05, by - panel.h * 0.4, bx + panel.w * 0.16, by - panel.h * 0.55); ctx.stroke();
  for (var i = 0; i < 5; i++) {
    var a = -0.3 - i * 0.35;
    ctx.beginPath();
    ctx.moveTo(bx + panel.w * 0.16, by - panel.h * 0.55);
    ctx.quadraticCurveTo(
      bx + panel.w * 0.16 + Math.cos(a) * panel.w * 0.22,
      by - panel.h * 0.55 + Math.sin(a) * panel.h * 0.22 - panel.h * 0.06,
      bx + panel.w * 0.16 + Math.cos(a) * panel.w * 0.34,
      by - panel.h * 0.55 + Math.sin(a) * panel.h * 0.3);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = '700 ' + Math.max(16, panel.w * 0.035) + 'px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LOAD A PHOTO', cx, panel.y + panel.h * 0.86);
  ctx.textAlign = 'left';
}

function drawGrain(w, h) {
  var rand = mulberry32(20261120);
  var n = Math.floor((w * h) / 9000);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (var i = 0; i < n; i++) {
    var x = rand() * w, y = rand() * h, s = 1 + rand() * 2;
    ctx.fillRect(x, y, s, s);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (var j = 0; j < n / 2; j++) {
    ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 2, 1 + rand() * 2);
  }
}

function drawVignette(w, h) {
  var g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(10,2,20,0.42)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawTitleBlock(w, h, grade) {
  var bandH = h * 0.24;
  var bandY = h - bandH;
  var g = ctx.createLinearGradient(0, bandY, 0, h);
  g.addColorStop(0, 'rgba(12,4,24,0)');
  g.addColorStop(0.35, 'rgba(12,4,24,0.72)');
  g.addColorStop(1, 'rgba(12,4,24,0.92)');
  ctx.fillStyle = g;
  ctx.fillRect(0, bandY, w, bandH);

  var margin = w * 0.045;
  var title = state.title.trim() || 'UNTITLED';
  var maxW = w - margin * 2;
  var px = fitText(title.toUpperCase(), maxW, Math.round(state.titleSize * (w / 1080)), 'Arial, sans-serif');
  var grad = ctx.createLinearGradient(0, h - bandH * 0.72, 0, h - bandH * 0.08);
  grad.addColorStop(0, grade.title[0]);
  grad.addColorStop(0.55, grade.title[1]);
  grad.addColorStop(1, grade.title[2]);
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.font = '900 ' + px + 'px Arial, sans-serif';
  try { ctx.letterSpacing = Math.round(px * 0.02) + 'px'; } catch (e) { /* older canvas */ }
  var titleY = h - bandH * 0.30;
  ctx.strokeStyle = 'rgba(16,3,28,0.95)';
  ctx.lineWidth = Math.max(4, px * 0.09);
  ctx.strokeText(title.toUpperCase(), margin, titleY);
  ctx.fillStyle = grad;
  ctx.fillText(title.toUpperCase(), margin, titleY);
  try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }

  if (state.subtitle.trim()) {
    var subPx = Math.max(20, Math.round(w * 0.024));
    ctx.font = 'italic 700 ' + subPx + 'px Georgia, serif';
    ctx.fillStyle = grade.neon;
    ctx.shadowColor = grade.neon;
    ctx.shadowBlur = Math.max(8, w * 0.012);
    ctx.fillText(state.subtitle.trim(), margin, titleY + subPx * 1.7);
    ctx.shadowBlur = 0;
  }
}

function drawBadge(w, h) {
  var label = 'VICE CITY · 2026';
  var px = Math.max(16, Math.round(w * 0.018));
  ctx.font = '800 ' + px + 'px Arial, sans-serif';
  var tw = ctx.measureText(label).width;
  var pad = px * 0.9;
  var bx = w - tw - pad * 2 - w * 0.03;
  var by = h * 0.03;
  var bh = px * 2.1;
  ctx.fillStyle = 'rgba(12,4,24,0.78)';
  ctx.beginPath();
  ctx.roundRect(bx, by, tw + pad * 2, bh, bh / 2);
  ctx.fill();
  ctx.strokeStyle = '#ffc93c';
  ctx.lineWidth = Math.max(2, w * 0.0015);
  ctx.stroke();
  ctx.fillStyle = '#ffc93c';
  ctx.fillText(label, bx + pad, by + bh * 0.68);
}

function drawCover(targetCtx, w, h) {
  var savedCtx = ctx;
  ctx = targetCtx;
  var grade = GRADES[state.grade];
  var layout = LAYOUTS[state.layout];

  // sky backdrop behind the panels
  var sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  var gap = Math.max(6, w * 0.007);
  var panels = layout.panels(w, h);
  var loaded = state.photos.filter(function (p) { return p !== null; });
  panels.forEach(function (panel) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(panel.x + gap / 2, panel.y + gap / 2, panel.w - gap, panel.h - gap);
    ctx.clip();
    var slot = state.photos[panel.photo];
    if (!slot && loaded.length > 0) slot = loaded[panel.photo % loaded.length];
    if (slot) drawPhotoInto({ x: panel.x + gap / 2, y: panel.y + gap / 2, w: panel.w - gap, h: panel.h - gap }, slot);
    else drawPlaceholder({ x: panel.x + gap / 2, y: panel.y + gap / 2, w: panel.w - gap, h: panel.h - gap }, grade);
    // grade wash over the photo
    ctx.fillStyle = grade.tint;
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    ctx.restore();
    // white poster frame around the panel
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = Math.max(2, w * 0.003);
    ctx.strokeRect(panel.x + gap / 2, panel.y + gap / 2, panel.w - gap, panel.h - gap);
  });

  if (state.grain) drawGrain(w, h);
  drawVignette(w, h);
  drawTitleBlock(w, h, grade);
  if (state.badge) drawBadge(w, h);
  ctx = savedCtx;
}

function renderPreview() {
  var size = SIZES[state.size];
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(ctx, size.w, size.h);
}

/* ------------------------------------------------------------ export */

function exportPng() {
  var size = SIZES[state.size];
  var off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  var offCtx = off.getContext('2d');
  drawCover(offCtx, size.w, size.h);
  off.toBlob(function (blob) {
    if (!blob) { setStatus('Export failed — try again.'); return; }
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var safe = (state.title.trim() || 'cover').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cover';
    a.href = url;
    a.download = 'neon-vice-' + safe + '-' + size.w + 'x' + size.h + '.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    setStatus('Exported ' + size.w + ' × ' + size.h + ' PNG — check your downloads.');
  }, 'image/png');
}

function setStatus(msg) {
  if (statusLine) statusLine.textContent = msg;
}

/* ------------------------------------------------------------ photos */

function setPhoto(slotIndex, img, name) {
  state.photos[slotIndex] = { img: img, name: name, zoom: 1, dx: 0, dy: 0 };
  renderPreview();
  refreshSlot(slotIndex);
  setStatus('Photo ' + (slotIndex + 1) + ' loaded: ' + name);
}

function loadSampleInto(slotIndex, sample) {
  return loadImage('samples/' + sample + '.jpg').then(function (img) {
    setPhoto(slotIndex, img, sample + '.jpg');
    return img;
  });
}

function buildSlots() {
  var host = $('photoSlots');
  host.innerHTML = '';
  for (var i = 0; i < 4; i++) {
    (function (slotIndex) {
      var box = document.createElement('div');
      box.className = 'slot';
      box.id = 'slot-' + slotIndex;
      var head = document.createElement('div');
      head.className = 'slot-head';
      var strong = document.createElement('strong');
      strong.textContent = 'Photo ' + (slotIndex + 1);
      var fname = document.createElement('span');
      fname.className = 'fname';
      fname.id = 'fname-' + slotIndex;
      fname.textContent = 'empty';
      head.appendChild(strong);
      head.appendChild(fname);
      box.appendChild(head);

      var row = document.createElement('div');
      row.className = 'row';
      var upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'mini';
      upBtn.textContent = 'Upload';
      var file = document.createElement('input');
      file.type = 'file';
      file.accept = 'image/*';
      upBtn.addEventListener('click', function () { file.click(); });
      file.addEventListener('change', function () {
        var f = file.files && file.files[0];
        if (!f) return;
        var url = URL.createObjectURL(f);
        loadImage(url).then(function (img) { setPhoto(slotIndex, img, f.name); })
          .catch(function () { setStatus('Could not read that image file.'); });
      });
      var sBtn = document.createElement('button');
      sBtn.type = 'button';
      sBtn.className = 'mini';
      sBtn.textContent = 'Sample';
      sBtn.addEventListener('click', function () {
        loadSampleInto(slotIndex, slotIndex % 2 === 0 ? 'boulevard' : 'pier')
          .catch(function () { setStatus('Sample photo failed to load.'); });
      });
      var clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'mini';
      clearBtn.textContent = 'Clear';
      clearBtn.addEventListener('click', function () {
        state.photos[slotIndex] = null;
        renderPreview();
        refreshSlot(slotIndex);
      });
      row.appendChild(upBtn);
      row.appendChild(sBtn);
      row.appendChild(clearBtn);
      box.appendChild(file);
      box.appendChild(row);

      var sliders = [['Zoom', 'zoom', 1, 3, 0.05], ['Shift X', 'dx', -40, 40, 1], ['Shift Y', 'dy', -40, 40, 1]];
      sliders.forEach(function (def) {
        var r = document.createElement('div');
        r.className = 'row';
        var lab = document.createElement('label');
        lab.textContent = def[0];
        var input = document.createElement('input');
        input.type = 'range';
        input.min = String(def[2]);
        input.max = String(def[3]);
        input.step = String(def[4]);
        input.value = String(def[1] === 'zoom' ? 1 : 0);
        input.id = 'slot-' + slotIndex + '-' + def[1];
        input.addEventListener('input', function () {
          var slot = state.photos[slotIndex];
          if (!slot) return;
          slot[def[1]] = parseFloat(input.value);
          renderPreview();
        });
        r.appendChild(lab);
        r.appendChild(input);
        box.appendChild(r);
      });
      host.appendChild(box);
    })(i);
  }
}

function refreshSlot(slotIndex) {
  var fname = $('fname-' + slotIndex);
  var slot = state.photos[slotIndex];
  if (fname) fname.textContent = slot ? slot.name : 'empty';
  var zoom = $('slot-' + slotIndex + '-zoom');
  var dx = $('slot-' + slotIndex + '-dx');
  var dy = $('slot-' + slotIndex + '-dy');
  if (zoom) zoom.value = slot ? String(slot.zoom) : '1';
  if (dx) dx.value = slot ? String(slot.dx) : '0';
  if (dy) dy.value = slot ? String(slot.dy) : '0';
}

/* ------------------------------------------------------------ pickers */

function buildPickers() {
  var lg = $('layoutGrid');
  LAYOUTS.forEach(function (layout, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = layout.name;
    b.addEventListener('click', function () {
      state.layout = i;
      markActive(lg, i);
      renderPreview();
    });
    lg.appendChild(b);
  });
  markActive(lg, state.layout);

  var gg = $('gradeGrid');
  GRADES.forEach(function (grade, i) {
    var b = document.createElement('button');
    b.type = 'button';
    var sw = document.createElement('span');
    sw.className = 'sw';
    sw.style.background = 'linear-gradient(90deg,' + grade.sky.join(',') + ')';
    b.appendChild(sw);
    b.appendChild(document.createTextNode(grade.name));
    b.addEventListener('click', function () {
      state.grade = i;
      markActive(gg, i);
      renderPreview();
    });
    gg.appendChild(b);
  });
  markActive(gg, state.grade);

  var sg = $('sizeGrid');
  sg.classList.add('wide-sizes');
  SIZES.forEach(function (size, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = size.name;
    b.addEventListener('click', function () {
      state.size = i;
      markActive(sg, i);
      renderPreview();
    });
    sg.appendChild(b);
  });
  markActive(sg, state.size);
}

function markActive(container, index) {
  var kids = container.querySelectorAll('button');
  kids.forEach(function (b, i) { b.classList.toggle('active', i === index); });
}

/* ------------------------------------------------------------ wiring */

function bindControls() {
  $('titleInput').addEventListener('input', function (e) {
    state.title = e.target.value;
    renderPreview();
  });
  $('subtitleInput').addEventListener('input', function (e) {
    state.subtitle = e.target.value;
    renderPreview();
  });
  $('titleSize').addEventListener('input', function (e) {
    state.titleSize = parseInt(e.target.value, 10) || 104;
    renderPreview();
  });
  $('grainToggle').addEventListener('change', function (e) {
    state.grain = e.target.checked;
    renderPreview();
  });
  $('badgeToggle').addEventListener('change', function (e) {
    state.badge = e.target.checked;
    renderPreview();
  });
  $('exportBtn').addEventListener('click', exportPng);
  $('exportBtn2').addEventListener('click', exportPng);
  $('shuffleBtn').addEventListener('click', function () {
    state.layout = Math.floor(Math.random() * LAYOUTS.length);
    state.grade = Math.floor(Math.random() * GRADES.length);
    markActive($('layoutGrid'), state.layout);
    markActive($('gradeGrid'), state.grade);
    renderPreview();
    setStatus('Shuffled: ' + LAYOUTS[state.layout].name + ' + ' + GRADES[state.grade].name + '.');
  });
  document.querySelectorAll('[data-sample]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sample = btn.getAttribute('data-sample');
      var free = state.photos.findIndex(function (p) { return p === null; });
      loadSampleInto(free === -1 ? 0 : free, sample)
        .catch(function () { setStatus('Sample photo failed to load.'); });
    });
  });
  $('loadAllSamples').addEventListener('click', function () {
    Promise.all([loadSampleInto(0, 'boulevard'), loadSampleInto(1, 'pier')])
      .then(function () { setStatus('Both sample photos loaded.'); })
      .catch(function () { setStatus('Sample photos failed to load.'); });
  });

  // drag & drop photos anywhere on the page
  document.addEventListener('dragover', function (e) { e.preventDefault(); });
  document.addEventListener('drop', function (e) {
    e.preventDefault();
    var files = (e.dataTransfer && e.dataTransfer.files) || [];
    var images = Array.prototype.filter.call(files, function (f) { return f.type.indexOf('image/') === 0; });
    images.slice(0, 4).forEach(function (f, k) {
      var free = state.photos.findIndex(function (p) { return p === null; });
      var slotIndex = free === -1 ? k % 4 : free;
      var url = URL.createObjectURL(f);
      loadImage(url).then(function (img) { setPhoto(slotIndex, img, f.name); });
    });
  });
}

/* ------------------------------------------------------------ shot mode */

function shotParams() {
  var q = new URLSearchParams(window.location.search);
  return {
    shot: q.get('shot') || '',
    caption: q.get('caption') || '',
    layout: parseInt(q.get('layout') || '0', 10),
    grade: parseInt(q.get('grade') || '0', 10),
    size: q.get('size') || '',
  };
}

function applyShotMode() {
  var p = shotParams();
  if (!p.shot) return Promise.resolve(false);
  if (p.caption) {
    state.title = p.caption;
    $('titleInput').value = p.caption;
  }
  if (!isNaN(p.layout) && p.layout >= 0 && p.layout < LAYOUTS.length) state.layout = p.layout;
  if (!isNaN(p.grade) && p.grade >= 0 && p.grade < GRADES.length) state.grade = p.grade;
  var sizeIndex = SIZES.findIndex(function (s) { return (s.w + 'x' + s.h) === p.size; });
  if (sizeIndex !== -1) state.size = sizeIndex;
  markActive($('layoutGrid'), state.layout);
  markActive($('gradeGrid'), state.grade);
  markActive($('sizeGrid'), state.size);

  // every photo slot gets a sample photo so each panel is filled
  return Promise.all([
    loadSampleInto(0, 'boulevard'),
    loadSampleInto(1, 'pier'),
    loadSampleInto(2, 'boulevard'),
    loadSampleInto(3, 'pier'),
  ]).then(function () {
    renderPreview();
    if (p.shot === 'cover' || p.shot === 'export') {
      document.body.classList.add(p.shot === 'cover' ? 'shot-cover' : 'shot-export');
      // Fit the cover inside the 1280x800 screenshot frame at its own aspect
      // ratio (CSS object-fit alone stretched the landscape cover).
      var size = SIZES[state.size];
      var scale = Math.min(1280 / size.w, 800 / size.h);
      canvas.style.width = Math.floor(size.w * scale) + 'px';
      canvas.style.height = Math.floor(size.h * scale) + 'px';
      canvas.style.margin = '0 auto';
    }
    window.__neonViceReady = true;
    return true;
  }).catch(function () {
    renderPreview();
    window.__neonViceReady = true;
    return true;
  });
}

/* ------------------------------------------------------------ boot */

buildSlots();
buildPickers();
bindControls();
renderPreview();
applyShotMode();
