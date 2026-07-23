/* =========================================================
   QISTI ANSA RAMADHAN — PORTFOLIO
   Shared JavaScript for:
   - index.html
   - id.html
   - case-deck.html
   - case-deck-id.html
   ========================================================= */

"use strict";

/*
  Memberi tanda bahwa JavaScript tersedia.
  Pada HTML nanti, kode singkat serupa juga akan ditempatkan di <head>
  agar tidak terjadi kilatan konten sebelum animasi aktif.
*/
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initRevealAnimations();
  initCounters();
  initPrintButtons();
  initCurrentYear();
  initExternalLinks();
});

/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initMobileNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const navigation = document.querySelector(".nav-links");

  if (!toggle || !navigation) {
    return;
  }

  const openNavigation = () => {
    toggle.setAttribute("aria-expanded", "true");
    navigation.classList.add("is-open");
    document.body.classList.add("nav-open");
  };

  const closeNavigation = () => {
    toggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  const navigationIsOpen = () =>
    toggle.getAttribute("aria-expanded") === "true";

  toggle.addEventListener("click", () => {
    if (navigationIsOpen()) {
      closeNavigation();
    } else {
      openNavigation();
    }
  });

  /*
    Menutup menu setelah pengguna memilih salah satu tautan.
  */
  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  /*
    Menutup menu dengan tombol Escape.
  */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigationIsOpen()) {
      closeNavigation();
      toggle.focus();
    }
  });

  /*
    Menutup menu jika pengguna menekan area di luar navigasi.
  */
  document.addEventListener("click", (event) => {
    if (!navigationIsOpen()) {
      return;
    }

    const clickedInsideNavigation = navigation.contains(event.target);
    const clickedToggle = toggle.contains(event.target);

    if (!clickedInsideNavigation && !clickedToggle) {
      closeNavigation();
    }
  });

  /*
    Mengembalikan navigasi ke kondisi normal ketika layar
    berubah dari mobile ke desktop.
  */
  const desktopBreakpoint = window.matchMedia("(min-width: 821px)");

  const handleBreakpointChange = (event) => {
    if (event.matches) {
      closeNavigation();
    }
  };

  if (typeof desktopBreakpoint.addEventListener === "function") {
    desktopBreakpoint.addEventListener("change", handleBreakpointChange);
  } else {
    desktopBreakpoint.addListener(handleBreakpointChange);
  }
}

/* =========================================================
   REVEAL ANIMATIONS
   ========================================================= */

function initRevealAnimations() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!revealItems.length) {
    return;
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /*
    Konten langsung ditampilkan bila pengguna memilih reduced motion
    atau browser tidak mendukung IntersectionObserver.
  */
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("show"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("show");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

/* =========================================================
   METRIC COUNTERS
   ========================================================= */

/*
  Penggunaan pada HTML:

  <strong
    class="metric-value"
    data-counter
    data-target="9"
    data-suffix="+"
  >
    8+
  </strong>

  Nilai asli tetap ditulis di HTML.
  Jika JavaScript gagal, recruiter tetap melihat nilai yang benar.

  Angka berupa rentang seperti 120–130 tidak perlu diberi data-counter.
*/

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");

  if (!counters.length) {
    return;
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const formatNumber = (value, locale) =>
    new Intl.NumberFormat(locale).format(value);

  const animateCounter = (element) => {
    if (element.dataset.animated === "true") {
      return;
    }

    const target = Number(element.dataset.target);
    const prefix = element.dataset.prefix || "";
    const suffix = element.dataset.suffix || "";
    const duration = Number(element.dataset.duration) || 900;
    const locale =
      document.documentElement.lang === "id" ? "id-ID" : "en-US";

    if (!Number.isFinite(target)) {
      return;
    }

    element.dataset.animated = "true";

    if (reducedMotion) {
      element.textContent =
        prefix + formatNumber(target, locale) + suffix;
      return;
    }

    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      /*
        Ease-out cubic membuat animasi terasa lebih natural.
      */
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(target * easedProgress);

      element.textContent =
        prefix + formatNumber(currentValue, locale) + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(update);
      } else {
        element.textContent =
          prefix + formatNumber(target, locale) + suffix;
      }
    };

    window.requestAnimationFrame(update);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.55
    }
  );

  counters.forEach((counter) => observer.observe(counter));
}

/* =========================================================
   PRINT / SAVE CASE DECK AS PDF
   ========================================================= */

/*
  Penggunaan pada HTML:

  <button type="button" class="btn btn-dark" data-print-deck>
    Simpan sebagai PDF
  </button>
*/

function initPrintButtons() {
  const printButtons = document.querySelectorAll("[data-print-deck]");

  if (!printButtons.length) {
    return;
  }

  printButtons.forEach((button) => {
    button.addEventListener("click", () => {
      /*
        Semua elemen reveal dipastikan terlihat sebelum print.
      */
      document.querySelectorAll(".reveal").forEach((item) => {
        item.classList.add("show");
      });

      window.print();
    });
  });
}

/* =========================================================
   AUTOMATIC FOOTER YEAR
   ========================================================= */

/*
  Penggunaan pada HTML:

  <span data-current-year>2026</span>
*/

function initCurrentYear() {
  const yearElements = document.querySelectorAll("[data-current-year]");

  if (!yearElements.length) {
    return;
  }

  const currentYear = new Date().getFullYear();

  yearElements.forEach((element) => {
    element.textContent = currentYear;
  });
}

/* =========================================================
   EXTERNAL LINKS
   ========================================================= */

/*
  Tautan eksternal yang menggunakan target="_blank" otomatis
  memperoleh rel="noopener noreferrer" untuk keamanan.
*/

function initExternalLinks() {
  const externalLinks = document.querySelectorAll(
    'a[target="_blank"]'
  );

  externalLinks.forEach((link) => {
    const existingRel = link
      .getAttribute("rel")
      ?.split(/\s+/)
      .filter(Boolean) || [];

    const requiredValues = ["noopener", "noreferrer"];

    requiredValues.forEach((value) => {
      if (!existingRel.includes(value)) {
        existingRel.push(value);
      }
    });

    link.setAttribute("rel", existingRel.join(" "));
  });
}
