/* ============================================================
   ENRIQUE OLVERA — "DEVOLUTION"
   Menu overlay (P2 accordions) · NYT masthead · EN/ES · news front page.
   Vanilla, no build step.
   ============================================================ */
(function () {
  "use strict";

  var doc = document;

  /* ---------------------------------------------------------
     i18n — UI chrome + news copy. EN is the source; ES below.
     --------------------------------------------------------- */
  var I18N = {
    en: {
      menu: "Menu", close: "Close", sections: "Sections",
      news: "News", about: "About", consulting: "Consulting",
      consultingContact: "Consulting & Contact",
      kicker: "The gastronomic universe of Enrique Olvera",
      view: "View +", shop: "Shop",
      autumn26: "Opening Autumn 2026", spring26: "Opening Spring 2026",
      open28: "Opening 2028", open27: "Opening 2027", summer26: "Opening Summer 2026",
      d_pujol: "April 2026",
      h_pujol: "Pujol refreshes its seasonal menu with heirloom Oaxacan corn.",
      k_pujol: "A new tasting built around native maize from small Oaxacan growers, milled each morning at Molino “El Pujol”.",
      d_cosme: "March 2026",
      h_cosme: "Cosme marks a decade in Manhattan with a special tasting menu.",
      d_damian: "February 2026",
      h_damian: "How Damian became one of L.A.’s finest modern California-Mexican restaurants.",
      d_atla: "January 2026",
      h_atla: "Atla unveils a new-season collaboration with local visual artists.",
      d_ticuchi: "December 2025",
      h_ticuchi: "Ticuchi launches a new mezcal list from independent Oaxacan producers.",
      d_manta: "November 2025",
      h_manta: "Manta opens an oceanfront terrace overlooking the Pacific in Los Cabos.",
      d_detroit: "October 2025",
      h_detroit: "Ditroit opens its doors with a taquería and barbacoa concept."
    },
    es: {
      menu: "Menú", close: "Cerrar", sections: "Secciones",
      news: "Noticias", about: "Perfil", consulting: "Consultoría",
      consultingContact: "Consultoría y Contacto",
      kicker: "El universo gastronómico de Enrique Olvera",
      view: "Ver +", shop: "Tienda",
      autumn26: "Apertura Otoño 2026", spring26: "Apertura Primavera 2026",
      open28: "Apertura 2028", open27: "Apertura 2027", summer26: "Apertura Verano 2026",
      d_pujol: "Abril 2026",
      h_pujol: "Pujol renueva su menú de temporada con maíz criollo oaxaqueño.",
      k_pujol: "Un nuevo menú degustación en torno al maíz nativo de pequeños productores oaxaqueños, molido cada mañana en el Molino “El Pujol”.",
      d_cosme: "Marzo 2026",
      h_cosme: "Cosme celebra una década en Manhattan con un menú degustación especial.",
      d_damian: "Febrero 2026",
      h_damian: "Cómo Damian se volvió uno de los mejores restaurantes californiano-mexicanos de L.A.",
      d_atla: "Enero 2026",
      h_atla: "Atla presenta una colaboración de temporada con artistas visuales locales.",
      d_ticuchi: "Diciembre 2025",
      h_ticuchi: "Ticuchi estrena una carta de mezcales de productores independientes oaxaqueños.",
      d_manta: "Noviembre 2025",
      h_manta: "Manta abre una terraza frente al Pacífico en Los Cabos.",
      d_detroit: "Octubre 2025",
      h_detroit: "Ditroit abre sus puertas con un concepto de taquería y barbacoa."
    }
  };

  var lang = "en";

  function applyLang(next) {
    lang = next;
    var dict = I18N[lang];
    doc.documentElement.lang = lang;

    doc.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = dict[el.getAttribute("data-i18n")];
      if (v != null) el.textContent = v;
    });

    doc.querySelectorAll(".lang__opt").forEach(function (b) {
      var on = b.getAttribute("data-lang-set") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  doc.querySelectorAll(".lang__opt").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang-set")); });
  });

  /* ---------------------------------------------------------
     Mega menu — NYT-style. Hover (or tap) a ribbon group to drop
     its full-width panel; the directory is always fully expanded.
     --------------------------------------------------------- */
  var mega = doc.getElementById("mega");
  var megaLinks = Array.prototype.slice.call(doc.querySelectorAll(".ribbon__link[data-mega]"));
  var megaPanels = Array.prototype.slice.call(doc.querySelectorAll(".mega__panel"));
  var plainLinks = Array.prototype.slice.call(doc.querySelectorAll(".ribbon__link:not([data-mega])"));
  var hideTimer = null;

  /* preview pane — the third column. Hovering a restaurant swaps its image in;
     items with no photo (no data-img) fall back to a neutral placeholder that
     shows the restaurant's name. Each panel resets to its group default. */
  function setupPreview(panel) {
    var fig = panel.querySelector(".mega__preview");
    if (!fig) return function () {};
    var layers = fig.querySelectorAll(".mega__preview-img");  // two stacked layers
    var active = 0;   // index of the currently-shown layer

    // crossfade: load the new photo into the hidden layer, then swap which is shown
    function crossfadeTo(src) {
      var cur  = layers[active];
      var next = layers[active === 0 ? 1 : 0];
      function reveal() {
        next.onload = null;
        next.classList.add("is-shown");
        cur.classList.remove("is-shown");
        active = active === 0 ? 1 : 0;
      }
      if (next.getAttribute("src") === src) { reveal(); return; }
      next.onload = reveal;
      next.src = src;
      if (next.complete && next.naturalWidth) reveal();   // already cached
    }
    // empty the centre column (fades the current photo out)
    function clear() { layers.forEach(function (l) { l.classList.remove("is-shown"); }); }

    clear();
    panel.querySelectorAll(".mega__item").forEach(function (item) {
      function onEnter() {
        var src = item.getAttribute("data-img");
        if (src) crossfadeTo(src);   // photo → show it
        else clear();                // no photo → show nothing
      }
      item.addEventListener("mouseenter", onEnter);
      item.addEventListener("focus", onEnter);
    });
    panel.addEventListener("mouseleave", clear);   // nothing shown at rest
    return clear;
  }

  var previewResets = megaPanels.map(setupPreview);
  function resetPreviews() { previewResets.forEach(function (r) { r(); }); }

  function clearHide() { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } }

  function showMega(group) {
    if (!mega) return;
    clearHide();
    megaPanels.forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-panel") === group); });
    megaLinks.forEach(function (l) { l.classList.toggle("is-current", l.getAttribute("data-mega") === group); });
    resetPreviews();
    mega.classList.add("is-open");
    mega.setAttribute("aria-hidden", "false");
  }
  function hideMega() {
    clearHide();
    if (!mega) return;
    mega.classList.remove("is-open");
    mega.setAttribute("aria-hidden", "true");
    megaLinks.forEach(function (l) { l.classList.remove("is-current"); });
    resetPreviews();
  }
  function scheduleHide() { clearHide(); hideTimer = setTimeout(hideMega, 160); }

  megaLinks.forEach(function (link) {
    var group = link.getAttribute("data-mega");
    link.addEventListener("mouseenter", function () { showMega(group); });
    link.addEventListener("focus", function () { showMega(group); });
    link.addEventListener("mouseleave", scheduleHide);
    // touch / click: toggle (there is no hover on touch devices)
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var open = mega && mega.classList.contains("is-open") && link.classList.contains("is-current");
      open ? hideMega() : showMega(group);
    });
  });

  // hovering a non-group ribbon link (News / About / Consulting) dismisses the mega
  plainLinks.forEach(function (link) {
    link.addEventListener("mouseenter", scheduleHide);
    link.addEventListener("focus", hideMega);
  });

  if (mega) {
    mega.addEventListener("mouseenter", clearHide);
    mega.addEventListener("mouseleave", scheduleHide);
  }

  doc.addEventListener("keydown", function (e) { if (e.key === "Escape") hideMega(); });

  // click outside the ribbon/mega closes it
  doc.addEventListener("mousedown", function (e) {
    if (!mega || !mega.classList.contains("is-open")) return;
    var t = e.target;
    if (mega.contains(t) || (t.closest && t.closest(".ribbon__link[data-mega]"))) return;
    hideMega();
  });

  /* ---------------------------------------------------------
     Masonry — CSS Grid + JS row spans. The grid gives each card a
     column span (the CMS `size`); this measures the card's real
     content height and sets grid-row span so cards pack like masonry
     while keeping every image's native aspect ratio.
     --------------------------------------------------------- */
  var mosaic = doc.getElementById("mosaic");

  function layoutMasonry() {
    if (!mosaic) return;
    var cs = window.getComputedStyle(mosaic);
    var rowH = parseFloat(cs.gridAutoRows) || 1;
    var rowGap = parseFloat(cs.rowGap) || 0;
    var stories = mosaic.querySelectorAll(".story");
    for (var i = 0; i < stories.length; i++) {
      var inner = stories[i].querySelector(".story__inner") || stories[i];
      var h = inner.getBoundingClientRect().height;
      var span = Math.ceil((h + rowGap) / (rowH + rowGap));
      stories[i].style.gridRowEnd = "span " + span;
    }
  }

  if (mosaic) {
    // first pass now (DOM is ready — script runs at end of body)
    layoutMasonry();

    // re-measure as each image finishes loading (heights change)
    var imgs = mosaic.querySelectorAll("img");
    for (var k = 0; k < imgs.length; k++) {
      if (!imgs[k].complete) imgs[k].addEventListener("load", layoutMasonry);
    }

    // web fonts can change title heights once swapped in
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(layoutMasonry);

    // and on load + resize (rAF-throttled)
    window.addEventListener("load", layoutMasonry);
    var raf;
    window.addEventListener("resize", function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layoutMasonry);
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  applyLang("en");
})();
