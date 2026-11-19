/* Neon Vice Cover Studio — offline multi-panel cover art maker.
   Photos are read locally with FileReader / Image and never uploaded.
   Rendering is plain 2D canvas: drawImageCover per panel, gradient-map
   grades, halftone title block, grain + vignette, then PNG export. */
"use strict";

/* ---------- data: layouts, grades, sizes, presets ---------- */
var LAYOUTS = [
  { id: "hero", name: "Hero Grid", desc: "1 hero + 3 stack", panels: [
    { x: 0, y: 0, w: 0.62, h: 1 }, { x: 0.62, y: 0, w: 0.38, h: 0.34 },
    { x: 0.62, y: 0.34, w: 0.38, h: 0.33 }, { x: 0.62, y: 0.67, w: 0.38, h: 0.33 } ] },
  { id: "nine", name: "Nine Panel", desc: "3 × 3 poster grid", panels: [
    { x: 0, y: 0, w: 0.333, h: 0.333 }, { x: 0.333, y: 0, w: 0.334, h: 0.333 }, { x: 0.667, y: 0, w: 0.333, h: 0.333 },
    { x: 0, y: 0.333, w: 0.333, h: 0.334 }, { x: 0.333, y: 0.333, w: 0.334, h: 0.334 }, { x: 0.667, y: 0.333, w: 0.333, h: 0.334 },
    { x: 0, y: 0.667, w: 0.333, h: 0.333 }, { x: 0.333, y: 0.667, w: 0.334, h: 0.333 }, { x: 0.667, y: 0.667, w: 0.333, h: 0.333 } ] },
  { id: "bleed", name: "Full Bleed", desc: "one photo, full frame", panels: [ { x: 0, y: 0, w: 1, h: 1 } ] },
  { id: "tilted", name: "Tilted Snaps", desc: "3 tilted snapshots", panels: [
    { x: 0.03, y: 0.05, w: 0.44, h: 0.62, rot: -4 }, { x: 0.52, y: 0.02, w: 0.44, h: 0.62, rot: 3 },
    { x: 0.24, y: 0.5, w: 0.52, h: 0.44, rot: -1.5 } ] },
  { id: "duo", name: "Split Duo", desc: "two halves, hard split", panels: [
    { x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 } ] },
  { id: "triptych", name: "Triptych", desc: "three tall columns", panels: [
    { x: 0, y: 0, w: 0.333, h: 1 }, { x: 0.333, y: 0, w: 0.334, h: 1 }, { x: 0.667, y: 0, w: 0.333, h: 1 } ] },
  { id: "strips", name: "Strip Reel", desc: "5 vertical strips", panels: [
    { x: 0, y: 0, w: 0.2, h: 1 }, { x: 0.2, y: 0, w: 0.2, h: 1 }, { x: 0.4, y: 0, w: 0.2, h: 1 },
    { x: 0.6, y: 0, w: 0.2, h: 1 }, { x: 0.8, y: 0, w: 0.2, h: 1 } ] },
  { id: "frame", name: "Poster Frame", desc: "centre photo + side strips", panels: [
    { x: 0, y: 0, w: 0.16, h: 1 }, { x: 0.16, y: 0.08, w: 0.68, h: 0.84 }, { x: 0.84, y: 0, w: 0.16, h: 1 } ] }
];
/* grade: [shadow, mid, highlight] gradient-map stops + overlay tint + glow colour */
var GRADES = [
  { id: "heatwave", name: "Heatwave", desc: "pink → orange sunset", stops: ["#2b0a4e", "#ff2e88", "#ffd319"], tint: "#ff7a18", glow: "#ff9a3d" },
  { id: "vice", name: "Vice Sunset", desc: "violet dusk, gold sun", stops: ["#12082b", "#7b2ff7", "#ffb347"], tint: "#b04dff", glow: "#ffcf5e" },
  { id: "neon", name: "Neon Nights", desc: "pink + teal night street", stops: ["#03131f", "#ff2e88", "#22e6c8"], tint: "#22e6c8", glow: "#ff2e88" },
  { id: "gold", name: "Golden Coast", desc: "warm gold hour", stops: ["#1d1206", "#e07b00", "#ffe89e"], tint: "#ffb347", glow: "#fff3b0" },
  { id: "dusk", name: "Palm Dusk", desc: "deep purple evening", stops: ["#0b0620", "#5b2a86", "#ff7eb6"], tint: "#8b5cf6", glow: "#ff7eb6" },
  { id: "miami", name: "Miami Pink", desc: "bubblegum + sky", stops: ["#160a2e", "#ff5da2", "#7fe7ff"], tint: "#ff5da2", glow: "#7fe7ff" },
  { id: "turbo", name: "Turbo Teal", desc: "teal + lime drive", stops: ["#02141a", "#0aa6a6", "#c8ff4d"], tint: "#22e6c8", glow: "#c8ff4d" },
  { id: "ink", name: "Poster Ink", desc: "high-contrast B&W pop", stops: ["#000000", "#5a5a6e", "#ffffff"], tint: "#ffffff", glow: "#ffffff" }
];
var SIZES = [
  { id: "sq", name: "Square", label: "1080 × 1080 · Square", w: 1080, h: 1080 },
  { id: "port", name: "Portrait", label: "1080 × 1350 · Portrait", w: 1080, h: 1350 },
  { id: "wide", name: "Landscape", label: "1920 × 1080 · Landscape", w: 1920, h: 1080 },
  { id: "story", name: "Story", label: "1080 × 1920 · Story", w: 1080, h: 1920 },
  { id: "wide2k", name: "Wide 2K", label: "2048 × 1152 · Wide 2K", w: 2048, h: 1152 },
  { id: "link", name: "Link card", label: "1200 × 630 · Link card", w: 1200, h: 630 },
  { id: "banner", name: "Banner", label: "1080 × 566 · Banner", w: 1080, h: 566 }
];
var PRESETS = [
  { name: "Heatwave Hero", layout: 0, grade: 0, style: "gradient" },
  { name: "Neon Nine", layout: 1, grade: 2, style: "neon" },
  { name: "Golden Bleed", layout: 2, grade: 3, style: "white" },
  { name: "Tilted Dusk", layout: 3, grade: 4, style: "gradient" },
  { name: "Miami Triptych", layout: 5, grade: 5, style: "neon" },
  { name: "Ink Strips", layout: 6, grade: 7, style: "ink" }
];

/* ---------- state ---------- */
var state = {
  layout: 0, grade: 0, size: 0, titleStyle: "gradient", titleSize: "big",
  title: "VICE CITY", subtitle: "neon nights, palm dreams", badge: "EST. 2026 · LEONIDA",
  grain: true, vignette: true, sun: true, showBadge: true,
  photos: [],            /* {img, url, name} */
  assign: [],            /* photo index per panel, -1 = empty */
  crop: [],              /* {zoom, px, py} per panel */
  selPanel: 0, selPhoto: 0
};
var undoStack = [], redoStack = [];
var preview = document.getElementById("preview");
var pctx = preview.getContext("2d");

function snapshot() { return JSON.stringify({ layout: state.layout, grade: state.grade, size: state.size, titleStyle: state.titleStyle, titleSize: state.titleSize, title: state.title, subtitle: state.subtitle, badge: state.badge, grain: state.grain, vignette: state.vignette, sun: state.sun, showBadge: state.showBadge, assign: state.assign, crop: state.crop, selPanel: state.selPanel }); }
function pushUndo() { undoStack.push(snapshot()); if (undoStack.length > 40) undoStack.shift(); redoStack = []; }
function restore(snap) {
  var s = JSON.parse(snap);
  state.layout = s.layout; state.grade = s.grade; state.size = s.size;
  state.titleStyle = s.titleStyle; state.titleSize = s.titleSize;
  state.title = s.title; state.subtitle = s.subtitle; state.badge = s.badge;
  state.grain = s.grain; state.vignette = s.vignette; state.sun = s.sun; state.showBadge = s.showBadge;
  state.assign = s.assign; state.crop = s.crop; state.selPanel = s.selPanel;
  syncControls(); renderPreview();
}
function undo() { if (!undoStack.length) return; redoStack.push(snapshot()); restore(undoStack.pop()); }
function redo() { if (!redoStack.length) return; undoStack.push(snapshot()); restore(redoStack.pop()); }

/* ---------- seeded random (deterministic grain) ---------- */
function mulberry32(seed) {
  var a = seed >>> 0;
  return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ---------- canvas helpers ---------- */
function drawImageCover(ctx, img, x, y, w, h, zoom, px, py) {
  var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  var scale = Math.max(w / iw, h / ih) * zoom;
  var dw = iw * scale, dh = ih * scale;
  var dx = x + (w - dw) / 2 + px * w, dy = y + (h - dh) / 2 + py * h;
  ctx.drawImage(img, dx, dy, dw, dh);
}
function hexRgb(hex) { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; }
function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

/* Gradient-map grade: per-pixel remap through the grade stops, then a
   soft tint wash. Runs on a temp canvas so the preview stays fast. */
function applyGrade(ctx, w, h, grade) {
  var img = ctx.getImageData(0, 0, w, h), d = img.data;
  var s0 = hexRgb(grade.stops[0]), s1 = hexRgb(grade.stops[1]), s2 = hexRgb(grade.stops[2]);
  for (var i = 0; i < d.length; i += 4) {
    var l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    var c = l < 0.5 ? mix(s0, s1, l * 2) : mix(s1, s2, (l - 0.5) * 2);
    d[i] = d[i] * 0.55 + c[0] * 0.45; d[i + 1] = d[i + 1] * 0.55 + c[1] * 0.45; d[i + 2] = d[i + 2] * 0.55 + c[2] * 0.45;
  }
  ctx.putImageData(img, 0, 0);
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.22; ctx.fillStyle = grade.tint; ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
}
function drawGrain(ctx, w, h) {
  var rnd = mulberry32(20261119);
  ctx.save(); ctx.globalAlpha = 0.07;
  for (var i = 0; i < w * h / 90; i++) {
    var v = rnd() > 0.5 ? 255 : 0;
    ctx.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
    ctx.fillRect(rnd() * w, rnd() * h, 1.6, 1.6);
  }
  ctx.restore();
}
function drawVignette(ctx, w, h) {
  var g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
function drawSun(ctx, w, h, grade) {
  var cx = w * 0.78, cy = h * 0.24, r = Math.min(w, h) * 0.16;
  var g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 2.2);
  g.addColorStop(0, grade.glow); g.addColorStop(0.35, grade.tint); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.fillStyle = grade.glow;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  /* retro sun slats */
  ctx.save(); ctx.fillStyle = "rgba(10,5,20,0.85)";
  for (var i = 0; i < 4; i++) { var y = cy + r * (0.15 + i * 0.22); ctx.fillRect(cx - r, y, r * 2, r * 0.07); }
  ctx.restore();
}

/* ---------- the cover renderer (shared by preview + export) ---------- */
function renderCover(canvas, sizeIdx) {
  var size = SIZES[sizeIdx], W = size.w, H = size.h;
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext("2d");
  var layout = LAYOUTS[state.layout], grade = GRADES[state.grade];
  /* sunset sky backdrop behind every panel */
  var sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#1a0b2e"); sky.addColorStop(0.45, "#7b2ff7");
  sky.addColorStop(0.72, "#ff2e88"); sky.addColorStop(1, "#ffd319");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  if (state.sun) drawSun(ctx, W, H, grade);
  var gap = Math.max(4, Math.round(W * 0.006));
  var n = layout.panels.length;
  for (var p = 0; p < n; p++) {
    var pr = layout.panels[p];
    var x = pr.x * W + gap, y = pr.y * H + gap, w = pr.w * W - gap * 2, h = pr.h * H - gap * 2;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (pr.rot) { ctx.translate(x + w / 2, y + h / 2); ctx.rotate(pr.rot * Math.PI / 180); ctx.translate(-(x + w / 2), -(y + h / 2)); }
    var pi = state.assign[p];
    var cr = state.crop[p] || { zoom: 1.15, px: 0, py: 0 };
    if (pi != null && pi >= 0 && state.photos[pi]) {
      drawImageCover(ctx, state.photos[pi].img, x, y, w, h, cr.zoom, cr.px, cr.py);
    } else {
      /* empty panel: palm-silhouette placeholder gradient */
      var ph = ctx.createLinearGradient(x, y, x, y + h);
      ph.addColorStop(0, "#241040"); ph.addColorStop(1, "#120826");
      ctx.fillStyle = ph; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "700 " + Math.round(h * 0.06) + "px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("＋ PHOTO " + (p + 1), x + w / 2, y + h / 2);
    }
    ctx.restore();
    /* white poster frame + hard shadow per panel */
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.92)"; ctx.lineWidth = Math.max(3, W * 0.004);
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = "rgba(0,0,0,0.45)"; ctx.lineWidth = Math.max(2, W * 0.002);
    ctx.strokeRect(x + 3, y + 3, w, h);
    ctx.restore();
  }
  /* grade over the whole poster */
  applyGrade(ctx, W, H, grade);
  /* halftone dots band at the bottom */
  var bandH = H * 0.045, bandY = H - bandH;
  ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = "#000";
  var rnd = mulberry32(77);
  for (var dx = 0; dx < W; dx += 14) for (var dy = 0; dy < bandH; dy += 14) {
    var r = 1 + rnd() * 3; ctx.beginPath(); ctx.arc(dx + 7, bandY + dy + 7, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  drawTitleBlock(ctx, W, H, grade);
  if (state.vignette) drawVignette(ctx, W, H);
  if (state.grain) drawGrain(ctx, W, H);
}
function drawTitleBlock(ctx, W, H, grade) {
  var fs = state.titleSize === "huge" ? 0.15 : state.titleSize === "mid" ? 0.09 : 0.12;
  var size = Math.round(W * fs);
  var y = H * 0.86;
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = "900 " + size + "px 'Arial Black', Impact, system-ui, sans-serif";
  ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = size * 0.08; ctx.shadowOffsetY = size * 0.05;
  var title = (state.title || "VICE CITY").toUpperCase();
  if (state.titleStyle === "gradient") {
    var g = ctx.createLinearGradient(0, y - size, 0, y + size * 0.15);
    g.addColorStop(0, "#fff7ae"); g.addColorStop(0.45, "#ffd319"); g.addColorStop(0.75, "#ff7a18"); g.addColorStop(1, "#ff2e88");
    ctx.fillStyle = g;
  } else if (state.titleStyle === "neon") {
    ctx.fillStyle = "#fff"; ctx.strokeStyle = grade.glow; ctx.lineWidth = size * 0.06;
    ctx.shadowColor = grade.glow; ctx.shadowBlur = size * 0.35;
  } else if (state.titleStyle === "ink") {
    ctx.fillStyle = "#111"; ctx.strokeStyle = "#fff"; ctx.lineWidth = size * 0.05;
  } else { ctx.fillStyle = "#fff"; }
  ctx.lineJoin = "round";
  ctx.strokeStyle = ctx.strokeStyle || "rgba(20,5,35,0.9)";
  ctx.lineWidth = ctx.lineWidth || size * 0.045;
  ctx.strokeText(title, W / 2, y);
  ctx.fillText(title, W / 2, y);
  ctx.restore();
  /* neon script subtitle */
  if (state.subtitle) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "italic 700 " + Math.round(W * 0.032) + "px 'Segoe Script', 'Brush Script MT', cursive";
    ctx.fillStyle = "#fff"; ctx.shadowColor = grade.glow; ctx.shadowBlur = W * 0.018;
    ctx.fillText(state.subtitle, W / 2, y + size * 0.42);
    ctx.restore();
  }
  /* badge ribbon, top-left */
  if (state.showBadge && state.badge) {
    ctx.save();
    var bw = ctx.measureText(state.badge).width + W * 0.05;
    ctx.font = "800 " + Math.round(W * 0.02) + "px system-ui, sans-serif";
    bw = ctx.measureText(state.badge).width + W * 0.05;
    var bh = H * 0.045, bx = W * 0.03, by = H * 0.035;
    ctx.fillStyle = "rgba(10,4,20,0.85)";
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw - bh * 0.6, by + bh); ctx.lineTo(bx, by + bh); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffd319"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(state.badge, bx + W * 0.015, by + bh / 2);
    ctx.restore();
  }
}
function renderPreview() {
  renderCover(preview, state.size);
  var hint = document.getElementById("stageHint");
  hint.style.display = state.photos.length ? "none" : "block";
  document.getElementById("sizeLabel").textContent = SIZES[state.size].label;
  document.getElementById("photoCount").textContent = state.photos.length + (state.photos.length === 1 ? " photo loaded" : " photos loaded");
  syncPanelStrip();
}

/* ---------- photo loading ---------- */
function addPhotoFile(file) {
  return new Promise(function (resolve) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () { state.photos.push({ img: img, url: reader.result, name: file.name }); resolve(true); };
      img.onerror = function () { resolve(false); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function loadSamplePhotos() {
  var urls = ["samples/boulevard.jpg", "samples/pier.jpg"];
  var loaded = 0;
  urls.forEach(function (u, i) {
    var img = new Image();
    img.onload = function () {
      state.photos[i] = { img: img, url: u, name: u.split("/").pop() };
      loaded++;
      if (loaded === urls.length) { afterPhotosLoaded(); }
    };
    img.onerror = function () { loaded++; if (loaded === urls.length) afterPhotosLoaded(); };
    img.src = u;
  });
}
function afterPhotosLoaded() {
  state.photos = state.photos.filter(Boolean);
  ensureAssignments();
  state.selPhoto = 0;
  syncThumbs(); renderPreview();
}
function ensureAssignments() {
  var n = LAYOUTS[state.layout].panels.length;
  while (state.assign.length < n) state.assign.push(-1);
  while (state.crop.length < n) state.crop.push({ zoom: 1.15, px: 0, py: 0 });
  state.assign.length = n; state.crop.length = n;
  for (var i = 0; i < n; i++) {
    if (state.assign[i] < 0 && state.photos.length) state.assign[i] = i % state.photos.length;
    if (state.assign[i] >= state.photos.length) state.assign[i] = state.photos.length ? 0 : -1;
  }
}

/* ---------- UI: buttons, thumbs, panel strip ---------- */
function buildButtons(container, items, current, onPick, fmt) {
  var box = document.getElementById(container);
  box.innerHTML = "";
  items.forEach(function (it, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.innerHTML = fmt(it, i);
    if (i === current) b.classList.add("active");
    b.addEventListener("click", function () { pushUndo(); onPick(i); syncControls(); renderPreview(); });
    box.appendChild(b);
  });
}
function syncControls() {
  ensureAssignments();
  buildButtons("layoutBtns", LAYOUTS, state.layout, function (i) { state.layout = i; state.selPanel = 0; },
    function (it) { return it.name + "<small>" + it.desc + "</small>"; });
  buildButtons("gradeBtns", GRADES, state.grade, function (i) { state.grade = i; },
    function (it) { return it.name + "<small>" + it.desc + "</small>"; });
  buildButtons("sizeBtns", SIZES, state.size, function (i) { state.size = i; },
    function (it) { return it.name + "<small>" + it.w + " × " + it.h + "</small>"; });
  buildButtons("presetBtns", PRESETS, -1, function (i) {
    var p = PRESETS[i]; state.layout = p.layout; state.grade = p.grade; state.titleStyle = p.style;
    document.getElementById("titleStyle").value = p.style;
  }, function (it) { return "★ " + it.name; });
  document.querySelectorAll("#layoutBtns button").forEach(function (b, i) { b.classList.toggle("active", i === state.layout); });
  document.querySelectorAll("#gradeBtns button").forEach(function (b, i) { b.classList.toggle("active", i === state.grade); });
  document.querySelectorAll("#sizeBtns button").forEach(function (b, i) { b.classList.toggle("active", i === state.size); });
  document.getElementById("titleInput").value = state.title;
  document.getElementById("subtitleInput").value = state.subtitle;
  document.getElementById("badgeInput").value = state.badge;
  document.getElementById("titleStyle").value = state.titleStyle;
  document.getElementById("titleSize").value = state.titleSize;
  document.getElementById("chkGrain").checked = state.grain;
  document.getElementById("chkVignette").checked = state.vignette;
  document.getElementById("chkSun").checked = state.sun;
  document.getElementById("chkBadge").checked = state.showBadge;
  var cr = state.crop[state.selPanel] || { zoom: 1.15, px: 0, py: 0 };
  document.getElementById("zoom").value = cr.zoom; document.getElementById("zoomOut").textContent = cr.zoom.toFixed(2) + "×";
  document.getElementById("panX").value = cr.px; document.getElementById("panXOut").textContent = cr.px.toFixed(2);
  document.getElementById("panY").value = cr.py; document.getElementById("panYOut").textContent = cr.py.toFixed(2);
  syncThumbs();
}
function syncThumbs() {
  var box = document.getElementById("thumbs");
  box.innerHTML = "";
  if (!state.photos.length) { box.innerHTML = '<span class="empty">No photos yet — add your own or load the samples.</span>'; return; }
  state.photos.forEach(function (ph, i) {
    var im = document.createElement("img");
    im.src = ph.url; im.alt = ph.name; im.title = ph.name;
    if (i === state.selPhoto) im.classList.add("sel");
    im.addEventListener("click", function () {
      pushUndo();
      state.selPhoto = i;
      state.assign[state.selPanel] = i;
      syncThumbs(); syncPanelStrip(); renderPreview();
    });
    box.appendChild(im);
  });
}
function syncPanelStrip() {
  var box = document.getElementById("panelStrip");
  box.innerHTML = "";
  var n = LAYOUTS[state.layout].panels.length;
  for (var i = 0; i < n; i++) {
    (function (i) {
      var b = document.createElement("button");
      b.type = "button";
      var pi = state.assign[i];
      b.textContent = "Panel " + (i + 1) + (pi >= 0 && state.photos[pi] ? " · " + state.photos[pi].name : " · empty");
      if (i === state.selPanel) b.classList.add("active");
      b.addEventListener("click", function () { state.selPanel = i; syncControls(); renderPreview(); });
      box.appendChild(b);
    })(i);
  }
}

/* ---------- export ---------- */
function downloadCanvas(canvas, filename) {
  canvas.toBlob(function (blob) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }, "image/png");
}
function exportCurrent() {
  var c = document.createElement("canvas");
  renderCover(c, state.size);
  var s = SIZES[state.size];
  var ov = document.getElementById("exportOverlay");
  var ec = document.getElementById("exportCanvas");
  ec.width = c.width; ec.height = c.height;
  ec.getContext("2d").drawImage(c, 0, 0);
  document.getElementById("overlayLabel").textContent = "Exported cover — " + s.label + " · PNG";
  ov.hidden = false;
  window.__lastExport = { canvas: c, name: "neon-vice-cover-" + s.w + "x" + s.h + ".png" };
}
function exportAllSizes() {
  SIZES.forEach(function (s, i) {
    setTimeout(function () {
      var c = document.createElement("canvas");
      renderCover(c, i);
      downloadCanvas(c, "neon-vice-cover-" + s.w + "x" + s.h + ".png");
    }, i * 350);
  });
}

/* ---------- wire events ---------- */
document.getElementById("fileInput").addEventListener("change", function (e) {
  var files = Array.prototype.slice.call(e.target.files || []);
  var jobs = files.slice(0, 4 - state.photos.length).map(addPhotoFile);
  Promise.all(jobs).then(function () { ensureAssignments(); syncThumbs(); renderPreview(); });
  e.target.value = "";
});
document.getElementById("btnSamples").addEventListener("click", function () { loadSamplePhotos(); });
document.getElementById("btnClearPhotos").addEventListener("click", function () {
  pushUndo(); state.photos = []; state.assign = []; state.crop = []; syncThumbs(); renderPreview();
});
function bindCrop(id, out, key) {
  document.getElementById(id).addEventListener("input", function (e) {
    var v = parseFloat(e.target.value);
    ensureAssignments();
    state.crop[state.selPanel][key] = v;
    document.getElementById(out).textContent = key === "zoom" ? v.toFixed(2) + "×" : v.toFixed(2);
    renderPreview();
  });
  document.getElementById(id).addEventListener("change", function () { /* crop tweaks stay undoable per drag end */ });
}
bindCrop("zoom", "zoomOut", "zoom"); bindCrop("panX", "panXOut", "px"); bindCrop("panY", "panYOut", "py");
document.getElementById("titleInput").addEventListener("input", function (e) { state.title = e.target.value; renderPreview(); });
document.getElementById("subtitleInput").addEventListener("input", function (e) { state.subtitle = e.target.value; renderPreview(); });
document.getElementById("badgeInput").addEventListener("input", function (e) { state.badge = e.target.value; renderPreview(); });
document.getElementById("titleStyle").addEventListener("change", function (e) { pushUndo(); state.titleStyle = e.target.value; renderPreview(); });
document.getElementById("titleSize").addEventListener("change", function (e) { pushUndo(); state.titleSize = e.target.value; renderPreview(); });
document.getElementById("chkGrain").addEventListener("change", function (e) { state.grain = e.target.checked; renderPreview(); });
document.getElementById("chkVignette").addEventListener("change", function (e) { state.vignette = e.target.checked; renderPreview(); });
document.getElementById("chkSun").addEventListener("change", function (e) { state.sun = e.target.checked; renderPreview(); });
document.getElementById("chkBadge").addEventListener("change", function (e) { state.showBadge = e.target.checked; renderPreview(); });
document.getElementById("btnExport").addEventListener("click", exportCurrent);
document.getElementById("btnExportAll").addEventListener("click", exportAllSizes);
document.getElementById("btnCloseOverlay").addEventListener("click", function () { document.getElementById("exportOverlay").hidden = true; });
document.getElementById("btnDownloadOverlay").addEventListener("click", function () {
  if (window.__lastExport) downloadCanvas(window.__lastExport.canvas, window.__lastExport.name);
});
document.getElementById("btnUndo").addEventListener("click", undo);
document.getElementById("btnRedo").addEventListener("click", redo);
document.getElementById("btnShuffle").addEventListener("click", function () {
  pushUndo();
  state.layout = Math.floor(Math.random() * LAYOUTS.length);
  state.grade = Math.floor(Math.random() * GRADES.length);
  syncControls(); renderPreview();
});
/* ?shot=editor loads the samples + a ready cover; ?shot=cover opens the
   export overlay at once — used for honest screenshots of the real app. */
(function boot() {
  ensureAssignments();
  syncControls();
  renderPreview();
  var q = new URLSearchParams(location.search);
  if (q.get("shot") === "editor" || q.get("shot") === "cover") {
    if (q.get("layout")) state.layout = Math.min(LAYOUTS.length - 1, parseInt(q.get("layout"), 10) || 0);
    if (q.get("grade")) state.grade = Math.min(GRADES.length - 1, parseInt(q.get("grade"), 10) || 0);
    if (q.get("size")) state.size = Math.min(SIZES.length - 1, parseInt(q.get("size"), 10) || 0);
    if (q.get("title")) state.title = q.get("title");
    loadSamplePhotos();
    var tries = 0;
    var wait = setInterval(function () {
      tries++;
      if (state.photos.length || tries > 40) {
        clearInterval(wait);
        syncControls(); renderPreview();
        if (q.get("shot") === "cover") setTimeout(exportCurrent, 150);
      }
    }, 100);
  }
})();
