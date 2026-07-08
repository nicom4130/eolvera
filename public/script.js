/* ============================================================
   ENRIQUE OLVERA — "DEVOLUTION"
   Menu overlay (P2 accordions) · NYT masthead · EN/ES · news front page.
   Vanilla, no build step.
   ============================================================ */
(function () {
  "use strict";

  var doc = document;

  doc.addEventListener("dragstart", function (e) {
    if (e.target && e.target.tagName === "IMG") e.preventDefault();
  });
  doc.addEventListener("contextmenu", function (e) {
    if (e.target && e.target.tagName === "IMG") e.preventDefault();
  });

  /* ---------------------------------------------------------
     i18n — UI chrome + news copy. EN is the source; ES below.
     --------------------------------------------------------- */
  var I18N = {
    en: {
      menu: "Menu", close: "Close", sections: "Sections",
      news: "News", about: "About", consulting: "Consulting",
      consultingContact: "Consulting & Contact",
      otherProjects: "Other Projects", bio: "Bio", contact: "Contact",
      archive: "Archive", all: "All", externalLink: "External Link",
      name: "Name", email: "Email", message: "Message", send: "Send",
      getInTouch: "Get in touch", books: "Books", emailLink: "Email",
      mexicoCity: "Mexico City", newYork: "New York", losAngeles: "Los Angeles",
      sending: "Sending...",
      formOk: "Thank you. We'll be in touch.",
      formNotConfigured: "Form isn't live yet. Please email us directly.",
      formError: "Something went wrong. Please email us directly.",
      formNetwork: "Network error. Please email us directly.",
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
      otherProjects: "Otros proyectos", bio: "Bio", contact: "Contacto",
      archive: "Archivo", all: "Todas", externalLink: "Enlace externo",
      name: "Nombre", email: "Correo electrónico", message: "Mensaje", send: "Enviar",
      getInTouch: "Contactar", books: "Libros", emailLink: "Correo",
      mexicoCity: "Ciudad de México", newYork: "Nueva York", losAngeles: "Los Ángeles",
      sending: "Enviando...",
      formOk: "Gracias. Te responderemos pronto.",
      formNotConfigured: "El formulario todavía no está activo. Escríbenos por email.",
      formError: "Algo salió mal. Escríbenos por email.",
      formNetwork: "Error de red. Escríbenos por email.",
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

  function saveLang(next) {
    try { window.localStorage.setItem("eo-lang", next); } catch (e) {}
  }

  function getSavedLang() {
    try { return window.localStorage.getItem("eo-lang") || "en"; } catch (e) { return "en"; }
  }

  function applyLang(next) {
    if (!I18N[next]) next = "en";
    lang = next;
    var dict = I18N[lang];
    doc.documentElement.lang = lang;
    saveLang(lang);

    doc.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = dict[el.getAttribute("data-i18n")];
      if (v != null) el.textContent = v;
    });

    doc.querySelectorAll("[data-lang-content]").forEach(function (el) {
      el.hidden = el.getAttribute("data-lang-content") !== lang;
    });

    doc.querySelectorAll(".lang__opt").forEach(function (b) {
      var on = b.getAttribute("data-lang-set") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    alignHomeStoryTitles();
  }

  var langFadeTimer = null;

  function canFadeLang() {
    return doc.body && (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function switchLang(next) {
    if (!I18N[next]) next = "en";
    if (next === lang) return;
    if (!canFadeLang()) {
      applyLang(next);
      return;
    }

    if (langFadeTimer) clearTimeout(langFadeTimer);
    doc.body.classList.add("is-lang-fading");
    langFadeTimer = setTimeout(function () {
      applyLang(next);
      window.requestAnimationFrame(function () {
        doc.body.classList.remove("is-lang-fading");
        langFadeTimer = null;
      });
    }, 120);
  }

  doc.querySelectorAll(".lang__opt").forEach(function (b) {
    b.addEventListener("click", function () { switchLang(b.getAttribute("data-lang-set")); });
  });

  /* Home option 1 — keep the first title line aligned across centred stories. */
  var storyAlignTimer = null;
  function alignHomeStoryTitles() {
    var grid = doc.querySelector(".home .news-grid");
    if (!grid) return;
    var texts = Array.prototype.slice.call(grid.querySelectorAll(".story__text"));
    if (!texts.length) return;
    texts.forEach(function (text) { text.style.transform = ""; });
    window.requestAnimationFrame(function () {
      var heights = texts.map(function (text) { return text.getBoundingClientRect().height; });
      var maxHeight = Math.max.apply(Math, heights);
      texts.forEach(function (text, i) {
        var offset = Math.max(0, (maxHeight - heights[i]) / 2);
        text.style.transform = offset ? "translateY(-" + offset.toFixed(2) + "px)" : "";
      });
    });
  }

  window.addEventListener("resize", function () {
    if (storyAlignTimer) clearTimeout(storyAlignTimer);
    storyAlignTimer = setTimeout(alignHomeStoryTitles, 120);
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

  /* preview pane — the third column. Hovering a restaurant swaps its image in. */
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
        if (src) crossfadeTo(src);
        else clear();
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

  function isTouchTabletLandscape() {
    var touch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    var w = window.innerWidth || doc.documentElement.clientWidth;
    var h = window.innerHeight || doc.documentElement.clientHeight;
    return !!touch && w > h && w >= 761 && w <= 1366;
  }

  megaLinks.forEach(function (link) {
    var group = link.getAttribute("data-mega");
    link.addEventListener("mouseenter", function () { showMega(group); });
    link.addEventListener("focus", function () { showMega(group); });
    link.addEventListener("mouseleave", scheduleHide);
    // touch / click: toggle (there is no hover on touch devices)
    link.addEventListener("click", function (e) {
      if (link.hasAttribute("data-mega-click-through")) return;
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
    mega.addEventListener("click", function (e) {
      if (!isTouchTabletLandscape()) return;
      var item = e.target && e.target.closest ? e.target.closest(".mega__item[data-img]") : null;
      if (!item || !mega.contains(item)) return;

      var href = item.getAttribute("href");
      if (!href || href === "#") return;

      e.preventDefault();
      clearHide();
      item.focus();

      window.setTimeout(function () {
        window.location.href = href;
      }, 1300);
    });
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
     Contact / Consulting forms — post to our own /api/contact.
     Anti-spam is invisible: a _t timestamp stamped here on load
     (timing trap) + the hidden "company" honeypot. No external captcha.
     --------------------------------------------------------- */
  var cforms = doc.querySelectorAll("[data-cform]");
  for (var ci = 0; ci < cforms.length; ci++) {
    (function (form) {
      var tsEl = form.querySelector("[data-cform-ts]");
      if (tsEl) tsEl.value = String(Date.now());
      var val = function (n) { var el = form.elements[n]; return el ? el.value : ""; };

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = form.querySelector("[data-cform-msg]");
        var btn = form.querySelector(".cform__submit");
        var setMsg = function (text, cls) { if (msg) { msg.textContent = text; msg.className = "cform__msg" + (cls ? " " + cls : ""); } };

        if (val("company")) return;            // honeypot tripped → ignore
        if (btn) btn.disabled = true;
        setMsg(I18N[lang].sending, "");

        fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: val("name"), email: val("email"), message: val("message"),
            company: val("company"), _t: Number(val("_t")), source: val("source")
          })
        })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok && d && d.ok, d: d || {} }; }); })
          .then(function (res) {
            if (res.ok) {
              form.reset();
              if (tsEl) tsEl.value = String(Date.now());
              setMsg(I18N[lang].formOk, "is-ok");
            } else if (res.d.error === "not_configured") {
              setMsg(I18N[lang].formNotConfigured, "is-err");
            } else {
              setMsg(I18N[lang].formError, "is-err");
            }
          })
          .catch(function () { setMsg(I18N[lang].formNetwork, "is-err"); })
          .finally(function () { if (btn) btn.disabled = false; });
      });
    })(cforms[ci]);
  }

  /* ---------------------------------------------------------
     Mobile menu — hamburger opens a drawer; each group is an
     accordion row that expands its directory.
     --------------------------------------------------------- */
  var mham = doc.getElementById("mham");
  var mnav = doc.getElementById("mnav");

  function setMnav(open) {
    if (!mnav || !mham) return;
    mnav.classList.toggle("is-open", open);
    mham.classList.toggle("is-active", open);
    mham.setAttribute("aria-expanded", open ? "true" : "false");
    mnav.setAttribute("aria-hidden", open ? "false" : "true");
    doc.documentElement.classList.toggle("mnav-open", open);
  }

  if (mham && mnav) {
    mham.addEventListener("click", function () {
      setMnav(!mnav.classList.contains("is-open"));
    });

    // accordion rows
    var heads = mnav.querySelectorAll(".macc__head");
    for (var hi = 0; hi < heads.length; hi++) {
      heads[hi].addEventListener("click", function () {
        var open = this.getAttribute("aria-expanded") === "true";
        this.setAttribute("aria-expanded", open ? "false" : "true");
        if (this.parentNode) this.parentNode.classList.toggle("is-open", !open);
        var body = this.nextElementSibling;
        if (body) body.style.maxHeight = open ? "0px" : body.scrollHeight + "px";
      });
    }

    // tapping any link closes the drawer
    mnav.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a");
      if (a) setMnav(false);
    });

    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") setMnav(false); });
  }

  /* ---------------------------------------------------------
     News archive — category filters.
     --------------------------------------------------------- */
  var filterBar = doc.querySelector("[data-news-filters]");
  var archiveGrid = doc.querySelector("[data-news-grid]");
  if (filterBar && archiveGrid) {
    var cards = Array.prototype.slice.call(archiveGrid.querySelectorAll("[data-category]"));
    var canMotion = !window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("[data-filter]");
      if (!btn) return;
      if (btn.classList.contains("is-active")) return;
      var filter = btn.getAttribute("data-filter");
      var first = new Map();
      if (canMotion) {
        cards.forEach(function (card) {
          if (!card.classList.contains("is-hidden")) first.set(card, card.getBoundingClientRect());
        });
      }
      filterBar.querySelectorAll("[data-filter]").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      cards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.classList.toggle("is-hidden", !match);
      });
      if (!canMotion) return;
      cards.forEach(function (card) {
        if (card.classList.contains("is-hidden")) return;
        var before = first.get(card);
        var after = card.getBoundingClientRect();
        var dx = before ? before.left - after.left : 0;
        var dy = before ? before.top - after.top : 10;
        var startOpacity = before ? 1 : 0;
        card.animate(
          [
            { transform: "translate(" + dx + "px, " + dy + "px)", opacity: startOpacity },
            { transform: "translate(0, 0)", opacity: 1 }
          ],
          { duration: 420, easing: "cubic-bezier(.16, 1, .3, 1)" }
        );
      });
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  applyLang(getSavedLang());
})();
