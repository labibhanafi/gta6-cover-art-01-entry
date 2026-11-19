/* Neon Vice Cover Studio — offline GTA-style cover art maker.
   Every pixel is drawn on a canvas from photos on this machine.
   No network request is made, ever. */
'use strict';

/* ------------------------------------------------------------------ data */

var LAYOUTS = [
  { name: 'Vice Split', panels: [
    { x: 0, y: 0, w: 1, h: 0.62 }, { x: 0, y: 0.62, w: 0.5, h: 0.38 }, { x: 0.5, y: 0.62, w: 0.5, h: 0.38 } ] },
  { name: 'Triple Stack', panels: [
    { x: 0, y: 0, w: 1, h: 0.34 }, { x: 0, y: 0.34, w: 1, h: 0.33 }, { x: 0, y: 0.67, w: 1, h: 0.33 } ] },
  { name: 'Hero Left', panels: [
    { x: 0, y: 0, w: 0.62, h: 1 }, { x: 0.62, y: 0, w: 0.38, h: 0.5 }, { x: 0.62, y: 0.5, w: 0.38, h: 0.5 } ] },
  { name: 'Hero Right', panels: [
    { x: 0.38, y: 0, w: 0.62, h: 1 }, { x: 0, y: 0, w: 0.38, h: 0.5 }, { x: 0, y: 0.5, w: 0.38, h: 0.5 } ] },
  { name: 'Quad Grid', panels: [
    { x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 } ] },
  { name: 'Full Bleed', panels: [ { x: 0, y: 0, w: 1, h: 1 } ] },
  { name: 'Marquee', panels: [
    { x: 0, y: 0, w: 0.22, h: 1 }, { x: 0.22, y: 0, w: 0.56, h: 1 }, { x: 0.78, y: 0, w: 0.22, h: 1 } ] },
  { name: 'Skyline Trio', panels: [
    { x: 0, y: 0, w: 1, h: 0.5 }, { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 } ] },
];

var GRADES = [
  { name: 'Vice Sunset', top: '#ff2e88', bottom: '#ff9a3d', sun: '#ffd76a', glow: '#ff5e7a' },
  { name: 'Neon Nights', top: '#00e5ff', bottom: '#ff2ec4', sun: '#b8fff4', glow: '#00e5ff' },
  { name: 'Palm Dusk', top: '#7b2fff', bottom: '#ff5e7a', sun: '#ffb3c8', glow: '#c98aff' },
  { name: 'Ocean Drive', top: '#00c2a8', bottom: '#ffc93d', sun: '#fff3b0', glow: '#2affd5' },
  { name: 'Bubblegum', top: '#ff7ad9', bottom: '#8a5cff', sun: '#ffe3f6', glow: '#ff7ad9' },
  { name: 'Heatwave', top: '#ff3b30', bottom: '#ffb03d', sun: '#ffe9a8', glow: '#ff6a3d' },
  { name: 'Ultraviolet', top: '#3d2bff', bottom: '#ff2fb3', sun: '#e3d4ff', glow: '#8a7bff' },
  { name: 'After Hours', top: '#0a2a6b', bottom: '#00d4ff', sun: '#c8f6ff', glow: '#00e5ff' },
];

var TITLE_GRADIENTS = [
  { name: 'Sunset', from: '#ffd76a', to: '#ff2e88' },
  { name: 'Neon', from: '#00e5ff', to: '#ff2ec4' },
  { name: 'Gold', from: '#fff3b0', to: '#ff9a3d' },
  { name: 'Ice', from: '#e8fbff', to: '#7dd8ff' },
];

var EXPORT_SIZES = [
  { label: 'Square', w: 1080, h: 1080 },
  { label: 'Portrait', w: 1080, h: 1350 },
  { label: 'Wide HD', w: 1920, h: 1080 },
  { label: 'Story', w: 1080, h: 1920 },
  { label: 'Banner XL', w: 2048, h: 1152 },
  { label: 'Link card', w: 1200, h: 630 },
  { label: 'Feed wide', w: 1080, h: 566 },
];

var SAMPLES = { pier: 'samples/pier.jpg', boulevard: 'samples/boulevard.jpg' };

/* ------------------------------------------------------------------ state */

var state = {
  layout: 0,
  grade: 0,
  titleGrad: 0,
  title: 'Sunset Heist',
  subtitle: 'VICE CITY · SUMMER 2026',
  titleScale: 1,
  size: 0,
};

var photos = [null, null, null, null]; // { img, name, zoom, ox, oy }

var canvas = document.getElementById('poster');
var ctx = canvas.getContext('2d');
var statusEl = document.getElementById('export-status');
var captionEl = document.getElementById('stage-caption');

/* ------------------------------------------------------------------ helpers */

function $(id) { return document.getElementById(id); }

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

function loadedPhotos() { return photos.filter(function (p) { return p !== null; }); }

function photoForPanel(i) {
  if (photos[i]) return photos[i];
  var loaded = loadedPhotos();
  if (loaded.length === 1) return loaded[0];
  return null;
}

function setStatus(msg, ok) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (ok ? ' ok' : '');
}

/* ------------------------------------------------------------------ drawing */

function drawPhotoCover(c, img, rect, zoom, ox, oy) {
  var scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  var dw = img.naturalWidth * scale;
  var dh = img.naturalHeight * scale;
  var dx = rect.x + (rect.w - dw) / 2 + ox * rect.w * 0.35;
  var dy = rect.y + (rect.h - dh) / 2 + oy * rect.h * 0.35;
  c.drawImage(img, dx, dy, dw, dh);
}

function drawPlaceholder(c, rect, index) {
  var g = c.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  g.addColorStop(0, '#241638');
  g.addColorStop(1, '#12081f');
  c.fillStyle = g;
  c.fillRect(rect.x, rect.y, rect.w, rect.h);
  c.save();
  c.beginPath();
  c.rect(rect.x, rect.y, rect.w, rect.h);
  c.clip();
  c.strokeStyle = 'rgba(255,255,255,0.06)';
  c.lineWidth = Math.max(2, rect.w * 0.01);
  var step = rect.w * 0.12;
  for (var d = -rect.h; d < rect.w + rect.h; d += step) {
    c.beginPath();
    c.moveTo(rect.x + d, rect.y);
    c.lineTo(rect.x + d + rect.h, rect.y + rect.h);
    c.stroke();
  }
  c.restore();
  var fs = Math.max(12, Math.min(rect.w, rect.h) * 0.09);
  c.fillStyle = 'rgba(244,236,255,0.75)';
  c.font = '700 ' + Math.round(fs) + 'px Arial, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('ADD PHOTO ' + (index + 1), rect.x + rect.w / 2, rect.y + rect.h / 2);
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
}

function drawPoster(c, W, H) {
  var grade = GRADES[state.grade];
  var gap = Math.max(3, Math.round(W * 0.006));

  /* sky */
  var sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.top);
  sky.addColorStop(0.55, grade.bottom);
  sky.addColorStop(1, '#12081f');
  c.fillStyle = sky;
  c.fillRect(0, 0, W, H);

  /* glowing sun low on the horizon, behind the panels */
  var sunR = W * 0.16;
  var sunX = W * 0.72;
  var sunY = H * 0.30;
  var sun = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 2.4);
  sun.addColorStop(0, grade.sun);
  sun.addColorStop(0.35, grade.sun + '55');
  sun.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = sun;
  c.fillRect(sunX - sunR * 2.4, sunY - sunR * 2.4, sunR * 4.8, sunR * 4.8);
  c.fillStyle = grade.sun;
  c.beginPath();
  c.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  c.fill();

  /* panels */
  var layout = LAYOUTS[state.layout];
  layout.panels.forEach(function (p, i) {
    var rect = {
      x: p.x * W + gap, y: p.y * H + gap,
      w: p.w * W - gap * 2, h: p.h * H - gap * 2,
    };
    c.save();
    c.beginPath();
    c.rect(rect.x, rect.y, rect.w, rect.h);
    c.clip();
    var photo = photoForPanel(i);
    if (photo && photo.img.complete && photo.img.naturalWidth > 0) {
      drawPhotoCover(c, photo.img, rect, photo.zoom, photo.ox, photo.oy);
    } else {
      drawPlaceholder(c, rect, i);
    }
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.55)';
    c.lineWidth = Math.max(1.5, W * 0.0016);
    c.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });

  /* sunset wash over everything */
  var wash = c.createLinearGradient(0, 0, W, H);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  c.globalCompositeOperation = 'overlay';
  c.globalAlpha = 0.30;
  c.fillStyle = wash;
  c.fillRect(0, 0, W, H);
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';

  /* vignette */
  var vig = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(8,0,16,0.38)');
  c.fillStyle = vig;
  c.fillRect(0, 0, W, H);

  /* caption scrim */
  var scrim = c.createLinearGradient(0, H * 0.60, 0, H);
  scrim.addColorStop(0, 'rgba(5,0,12,0)');
  scrim.addColorStop(1, 'rgba(5,0,12,0.78)');
  c.fillStyle = scrim;
  c.fillRect(0, H * 0.60, W, H * 0.40);

  /* studio tag, top left */
  var tagSize = Math.round(W * 0.020);
  c.font = '700 ' + tagSize + 'px Arial, sans-serif';
  try { c.letterSpacing = Math.round(tagSize * 0.35) + 'px'; } catch (e) { /* older canvas */ }
  c.fillStyle = grade.glow;
  c.shadowColor = grade.glow;
  c.shadowBlur = Math.round(W * 0.012);
  c.fillText('NEON VICE', W * 0.045, H * 0.055);
  c.shadowBlur = 0;
  try { c.letterSpacing = '0px'; } catch (e) { /* older canvas */ }

  /* subtitle, neon */
  var subSize = Math.round(H * 0.026);
  var titlePx = Math.round(W * 0.105 * state.titleScale);
  var titleY = H * 0.935;
  c.font = '700 ' + subSize + 'px Arial, sans-serif';
  try { c.letterSpacing = Math.round(subSize * 0.45) + 'px'; } catch (e) { /* older canvas */ }
  c.fillStyle = '#ffffff';
  c.shadowColor = grade.glow;
  c.shadowBlur = Math.round(W * 0.014);
  var subText = (state.subtitle || '').toUpperCase();
  c.fillText(subText, W * 0.05, titleY - titlePx * 1.05);
  c.shadowBlur = 0;
  try { c.letterSpacing = '0px'; } catch (e) { /* older canvas */ }

  /* title, gradient fill + dark outline, slight lean */
  var titleText = state.title || '';
  c.save();
  c.translate(W * 0.05, titleY);
  c.rotate(-0.018);
  c.font = '900 ' + titlePx + 'px "Arial Black", Arial, sans-serif';
  var tw = c.measureText(titleText).width;
  var maxW = W * 0.92;
  if (tw > maxW) {
    var shrink = maxW / tw;
    c.scale(shrink, shrink);
    tw = maxW;
  }
  var tg = TITLE_GRADIENTS[state.titleGrad];
  var grad = c.createLinearGradient(0, -titlePx * 0.85, 0, titlePx * 0.1);
  grad.addColorStop(0, tg.from);
  grad.addColorStop(1, tg.to);
  c.lineJoin = 'round';
  c.strokeStyle = 'rgba(8,0,18,0.92)';
  c.lineWidth = Math.max(3, titlePx * 0.07);
  c.strokeText(titleText, 0, 0);
  c.fillStyle = grad;
  c.fillText(titleText, 0, 0);
  c.restore();

  /* poster frame + corner ticks */
  var inset = Math.max(6, Math.round(W * 0.012));
  c.strokeStyle = 'rgba(255,255,255,0.85)';
  c.lineWidth = Math.max(2, W * 0.003);
  c.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  var tick = Math.max(14, W * 0.035);
  c.strokeStyle = grade.glow;
  c.lineWidth = Math.max(3, W * 0.005);
  c.beginPath();
  [[inset, inset, 1, 1], [W - inset, inset, -1, 1], [inset, H - inset, 1, -1], [W - inset, H - inset, -1, -1]].forEach(function (k) {
    c.moveTo(k[0] + tick * k[2], k[1]);
    c.lineTo(k[0], k[1]);
    c.lineTo(k[0], k[1] + tick * k[3]);
  });
  c.stroke();
}

/* ------------------------------------------------------------------ render */

function previewDims() {
  var size = EXPORT_SIZES[state.size];
  var scale = Math.min(1, 1080 / Math.max(size.w, size.h));
  return { w: Math.round(size.w * scale), h: Math.round(size.h * scale) };
}

function render() {
  var d = previewDims();
  if (canvas.width !== d.w || canvas.height !== d.h) {
    canvas.width = d.w;
    canvas.height = d.h;
  }
  drawPoster(ctx, d.w, d.h);
  var size = EXPORT_SIZES[state.size];
  captionEl.textContent = size.w + ' × ' + size.h + ' · ' + size.label;
  var count = loadedPhotos().length;
  $('photo-count').textContent = count + ' / 4';
  window.__neonViceReady = true;
}

/* ------------------------------------------------------------------ photos */

function loadSampleInto(slot, key) {
  var img = new Image();
  img.onload = function () {
    photos[slot] = { img: img, name: key, zoom: 1, ox: 0, oy: 0 };
    refreshSlots();
    render();
  };
  img.onerror = function () { setStatus('Could not load the ' + key + ' sample.', false); };
  img.src = SAMPLES[key];
}

function loadFileInto(slot, file) {
  if (!file || file.type.indexOf('image/') !== 0) return;
  var reader = new FileReader();
  reader.onload = function () {
    var img = new Image();
    img.onload = function () {
      photos[slot] = { img: img, name: file.name, zoom: 1, ox: 0, oy: 0 };
      refreshSlots();
      render();
    };
    img.src = String(reader.result);
  };
  reader.readAsDataURL(file);
}

/* ------------------------------------------------------------------ slots UI */

function buildSlots() {
  var host = $('slots');
  host.innerHTML = '';
  for (var i = 0; i < 4; i++) {
    (function (slot) {
      var box = document.createElement('div');
      box.className = 'slot';
      box.id = 'slot-' + slot;

      var head = document.createElement('div');
      head.className = 'slot-head';
      var label = document.createElement('span');
      label.textContent = 'PHOTO ' + (slot + 1);
      var clear = document.createElement('button');
      clear.type = 'button';
      clear.textContent = 'Clear';
      clear.addEventListener('click', function () {
        photos[slot] = null;
        refreshSlots();
        render();
      });
      head.appendChild(label);
      head.appendChild(clear);
      box.appendChild(head);

      var thumb = document.createElement('img');
      thumb.className = 'slot-thumb';
      thumb.id = 'thumb-' + slot;
      thumb.alt = '';
      box.appendChild(thumb);
      var empty = document.createElement('div');
      empty.className = 'slot-empty';
      empty.id = 'empty-' + slot;
      empty.textContent = 'Empty slot';
      box.appendChild(empty);

      var row = document.createElement('div');
      row.className = 'mini-row';
      [['Pier', 'pier'], ['Blvd', 'boulevard']].forEach(function (pair) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = 'Sample ' + pair[0];
        b.addEventListener('click', function () { loadSampleInto(slot, pair[1]); });
        row.appendChild(b);
      });
      var up = document.createElement('button');
      up.type = 'button';
      up.textContent = 'Upload…';
      var file = document.createElement('input');
      file.type = 'file';
      file.accept = 'image/*';
      file.addEventListener('change', function () {
        loadFileInto(slot, file.files && file.files[0]);
        file.value = '';
      });
      up.addEventListener('click', function () { file.click(); });
      row.appendChild(up);
      box.appendChild(row);
      box.appendChild(file);

      [['Zoom', 'zoom', 1, 2.5, 0.05], ['Shift X', 'ox', -50, 50, 1], ['Shift Y', 'oy', -50, 50, 1]].forEach(function (spec) {
        var lab = document.createElement('label');
        lab.textContent = spec[0];
        var range = document.createElement('input');
        range.type = 'range';
        range.min = String(spec[2]);
        range.max = String(spec[3]);
        range.step = String(spec[4]);
        range.value = spec[1] === 'zoom' ? '1' : '0';
        range.id = 'slot-' + slot + '-' + spec[1];
        range.addEventListener('input', function () {
          var p = photos[slot];
          if (!p) return;
          if (spec[1] === 'zoom') p.zoom = parseFloat(range.value);
          else if (spec[1] === 'ox') p.ox = parseFloat(range.value) / 50;
          else p.oy = parseFloat(range.value) / 50;
          render();
        });
        lab.appendChild(range);
        box.appendChild(lab);
      });

      box.addEventListener('dragover', function (e) { e.preventDefault(); });
      box.addEventListener('drop', function (e) {
        e.preventDefault();
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        loadFileInto(slot, f);
      });
      host.appendChild(box);
    })(i);
  }
}

function refreshSlots() {
  for (var i = 0; i < 4; i++) {
    var box = $('slot-' + i);
    var thumb = $('thumb-' + i);
    var empty = $('empty-' + i);
    var p = photos[i];
    box.classList.toggle('filled', !!p);
    if (p) {
      thumb.src = p.img.src;
      thumb.style.display = 'block';
      empty.style.display = 'none';
    } else {
      thumb.removeAttribute('src');
      thumb.style.display = 'none';
      empty.style.display = 'grid';
    }
    var z = $('slot-' + i + '-zoom');
    var x = $('slot-' + i + '-ox');
    var y = $('slot-' + i + '-oy');
    if (z) z.value = p ? String(p.zoom) : '1';
    if (x) x.value = p ? String(Math.round(p.ox * 50)) : '0';
    if (y) y.value = p ? String(Math.round(p.oy * 50)) : '0';
  }
}

/* ------------------------------------------------------------------ pickers */

function buildLayouts() {
  var host = $('layouts');
  host.innerHTML = '';
  LAYOUTS.forEach(function (layout, idx) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'layout-btn';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', idx === state.layout ? 'true' : 'false');
    var thumb = document.createElement('div');
    thumb.className = 'thumb';
    layout.panels.forEach(function (p) {
      var cell = document.createElement('i');
      cell.style.position = 'absolute';
      cell.style.left = (p.x * 100) + '%';
      cell.style.top = (p.y * 100) + '%';
      cell.style.width = (p.w * 100) + '%';
      cell.style.height = (p.h * 100) + '%';
      thumb.appendChild(cell);
    });
    thumb.style.position = 'relative';
    var name = document.createElement('span');
    name.textContent = layout.name;
    b.appendChild(thumb);
    b.appendChild(name);
    b.addEventListener('click', function () {
      state.layout = idx;
      buildLayouts();
      render();
    });
    host.appendChild(b);
  });
}

function buildGrades() {
  var host = $('grades');
  host.innerHTML = '';
  GRADES.forEach(function (grade, idx) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'grade-btn';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', idx === state.grade ? 'true' : 'false');
    var sw = document.createElement('i');
    sw.style.background = 'linear-gradient(135deg,' + grade.top + ',' + grade.bottom + ')';
    var name = document.createElement('span');
    name.textContent = grade.name;
    b.appendChild(sw);
    b.appendChild(name);
    b.addEventListener('click', function () {
      state.grade = idx;
      buildGrades();
      render();
    });
    host.appendChild(b);
  });
}

function buildTitleGradients() {
  var host = $('title-gradients');
  host.innerHTML = '';
  TITLE_GRADIENTS.forEach(function (tg, idx) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.title = tg.name;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', idx === state.titleGrad ? 'true' : 'false');
    b.style.background = 'linear-gradient(90deg,' + tg.from + ',' + tg.to + ')';
    b.addEventListener('click', function () {
      state.titleGrad = idx;
      buildTitleGradients();
      render();
    });
    host.appendChild(b);
  });
}

function buildSizes() {
  var host = $('sizes');
  host.innerHTML = '';
  EXPORT_SIZES.forEach(function (size, idx) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'size-btn';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', idx === state.size ? 'true' : 'false');
    b.innerHTML = '';
    var t = document.createTextNode(size.label + '  ' + size.w + '×' + size.h);
    var s = document.createElement('small');
    s.textContent = size.w >= 1920 ? 'Full HD and up' : (size.h > size.w ? 'Tall post' : 'Feed post');
    b.appendChild(t);
    b.appendChild(s);
    b.addEventListener('click', function () {
      state.size = idx;
      buildSizes();
      render();
    });
    host.appendChild(b);
  });
}

/* ------------------------------------------------------------------ export */

function exportPNG() {
  var size = EXPORT_SIZES[state.size];
  var off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawPoster(off.getContext('2d'), size.w, size.h);
  setStatus('Rendering ' + size.w + ' × ' + size.h + '…', false);
  off.toBlob(function (blob) {
    if (!blob) {
      setStatus('Export failed — the browser could not make the PNG.', false);
      return;
    }
    var url = URL.createObjectURL(blob);
    var a = $('download-link');
    a.href = url;
    a.download = 'neon-vice-cover-' + size.w + 'x' + size.h + '.png';
    a.click();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    var kb = Math.round(blob.size / 1024);
    setStatus('Exported ' + size.w + ' × ' + size.h + ' PNG (' + kb + ' KB). Saved to your downloads.', true);
  }, 'image/png');
}

/* ------------------------------------------------------------------ shot mode */

function applyShotParams() {
  var q = new URLSearchParams(window.location.search);
  var shot = q.get('shot');
  if (!shot) return null;
  var photo = q.get('photo');
  var photo2 = q.get('photo2');
  var caption = q.get('caption');
  var subtitle = q.get('subtitle');
  var layout = parseInt(q.get('layout') || '', 10);
  var grade = parseInt(q.get('grade') || '', 10);
  var sizeName = q.get('size');
  var titleGrad = parseInt(q.get('titlegrad') || '', 10);

  if (caption !== null) {
    state.title = caption;
    $('title-input').value = caption;
  }
  if (subtitle !== null) {
    state.subtitle = subtitle;
    $('subtitle-input').value = subtitle;
  }
  if (!isNaN(layout) && layout >= 0 && layout < LAYOUTS.length) state.layout = layout;
  if (!isNaN(grade) && grade >= 0 && grade < GRADES.length) state.grade = grade;
  if (!isNaN(titleGrad) && titleGrad >= 0 && titleGrad < TITLE_GRADIENTS.length) state.titleGrad = titleGrad;
  if (sizeName) {
    var found = -1;
    EXPORT_SIZES.forEach(function (s, i) {
      if ((s.w + 'x' + s.h) === sizeName) found = i;
    });
    if (found >= 0) state.size = found;
  }
  if (shot === 'cover') state.size = 0; // cover shot is always the square

  var first = photo && SAMPLES[photo] ? photo : 'pier';
  var second = photo2 && SAMPLES[photo2] ? photo2 : (first === 'pier' ? 'boulevard' : 'pier');
  loadSampleInto(0, first);
  loadSampleInto(1, second);
  loadSampleInto(2, first);
  loadSampleInto(3, second);

  if (shot === 'cover' || shot === 'export') {
    document.body.classList.add(shot === 'cover' ? 'shot-cover' : 'shot-export');
    var fit = function () {
      var d = previewDims();
      var s = Math.min(window.innerWidth / d.w, window.innerHeight / d.h);
      canvas.style.width = Math.floor(d.w * s) + 'px';
      canvas.style.height = Math.floor(d.h * s) + 'px';
      canvas.style.margin = '0 auto';
    };
    window.__neonViceFit = fit;
    window.addEventListener('resize', fit);
    window.setTimeout(fit, 50);
  }
  buildLayouts();
  buildGrades();
  buildTitleGradients();
  buildSizes();
  render();
  return shot;
}

/* ------------------------------------------------------------------ wire up */

$('title-input').addEventListener('input', function (e) {
  state.title = e.target.value;
  render();
});
$('subtitle-input').addEventListener('input', function (e) {
  state.subtitle = e.target.value;
  render();
});
$('title-size').addEventListener('input', function (e) {
  state.titleScale = parseInt(e.target.value, 10) / 100;
  $('title-size-val').textContent = e.target.value + '%';
  render();
});
$('export-btn').addEventListener('click', exportPNG);
$('reset-all').addEventListener('click', function () {
  photos = [null, null, null, null];
  state.layout = 0;
  state.grade = 0;
  state.titleGrad = 0;
  state.title = 'Sunset Heist';
  state.subtitle = 'VICE CITY · SUMMER 2026';
  state.titleScale = 1;
  state.size = 0;
  $('title-input').value = state.title;
  $('subtitle-input').value = state.subtitle;
  $('title-size').value = '100';
  $('title-size-val').textContent = '100%';
  buildLayouts();
  buildGrades();
  buildTitleGradients();
  buildSizes();
  refreshSlots();
  loadSampleInto(0, 'pier');
  loadSampleInto(1, 'boulevard');
  render();
});
$('load-pier').addEventListener('click', function () { loadSampleInto(0, 'pier'); });
$('load-boulevard').addEventListener('click', function () { loadSampleInto(0, 'boulevard'); });
$('load-both').addEventListener('click', function () {
  loadSampleInto(0, 'pier');
  loadSampleInto(1, 'boulevard');
});

/* ------------------------------------------------------------------ boot */

buildSlots();
buildLayouts();
buildGrades();
buildTitleGradients();
buildSizes();
refreshSlots();
if (!applyShotParams()) {
  loadSampleInto(0, 'pier');
  loadSampleInto(1, 'boulevard');
  render();
}
