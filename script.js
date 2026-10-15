/* ============================================================
   Sadia.AI — interactions
   Mobile menu, smooth scroll, header state, active links,
   reveal-on-scroll, form validation, back-to-top, toast
   ============================================================ */

(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var hamburger = document.getElementById("hamburger");
  var navLinks = document.getElementById("navLinks");
  var backToTop = document.getElementById("backToTop");
  var toast = document.getElementById("toast");
  var toastTimer = null;

  /* ---------- Toast ---------- */
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 3200);
  }

  /* ---------- Mobile menu toggle ---------- */
  function closeMenu() {
    if (!navLinks || !hamburger) return;
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close menu on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      if (
        navLinks.classList.contains("open") &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /* ---------- Smooth scroll with sticky-header offset ---------- */
  function smoothScrollTo(target) {
    var headerOffset = header ? header.offsetHeight + 12 : 76;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          closeMenu();
          smoothScrollTo(target);
          // Move focus for accessibility without jumping
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      }
    });
  });

  /* ---------- Header shadow + back-to-top visibility ---------- */
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (backToTop) backToTop.style.display = y > 500 ? "inline-flex" : "none";
  }
  if (backToTop) backToTop.style.display = "none";
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Active nav-link highlighting ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navAnchors = document.querySelectorAll(".nav-link");

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navAnchors.forEach(function (a) {
              var match = a.getAttribute("href") === "#" + id;
              a.classList.toggle("active", match);
              if (match) a.setAttribute("aria-current", "true");
              else a.removeAttribute("aria-current");
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
    // Safety: hero is above the fold — show it immediately so mascot never stays hidden
    document.querySelectorAll(".hero .reveal").forEach(function (el) {
      el.classList.add("visible");
    });
    // Fallback: force everything visible after 1.5s in case observer never fires
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.visible)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("visible");
      });
    }, 1500);
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  var submitBtn = document.getElementById("submitBtn");
  var statusEl = document.getElementById("formStatus");
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var err = document.getElementById(errorId);
    if (err) err.textContent = message || "";
    if (input) input.classList.toggle("invalid", Boolean(message));
    return !message;
  }

  function validateField(inputId, errorId) {
    var input = document.getElementById(inputId);
    if (!input) return true;
    var value = input.value.trim();

    if (inputId === "name") {
      if (!value) return setError(inputId, errorId, "Please enter your name.");
      if (value.length < 2) return setError(inputId, errorId, "Name must be at least 2 characters.");
      return setError(inputId, errorId, "");
    }
    if (inputId === "email") {
      if (!value) return setError(inputId, errorId, "Please enter your email address.");
      if (!emailPattern.test(value)) return setError(inputId, errorId, "Please enter a valid email address.");
      return setError(inputId, errorId, "");
    }
    if (inputId === "subject") {
      if (!value) return setError(inputId, errorId, "Please enter a subject.");
      if (value.length < 3) return setError(inputId, errorId, "Subject must be at least 3 characters.");
      return setError(inputId, errorId, "");
    }
    if (inputId === "message") {
      if (!value) return setError(inputId, errorId, "Please write your message.");
      if (value.length < 10) return setError(inputId, errorId, "Message must be at least 10 characters.");
      return setError(inputId, errorId, "");
    }
    return true;
  }

  if (form) {
    // Live validation on input
    ["name", "email", "subject", "message"].forEach(function (id) {
      var input = document.getElementById(id);
      if (input) {
        input.addEventListener("input", function () {
          validateField(id, id + "Error");
          if (statusEl) { statusEl.textContent = ""; statusEl.className = "form-status"; }
        });
        input.addEventListener("blur", function () {
          validateField(id, id + "Error");
        });
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var validName = validateField("name", "nameError");
      var validEmail = validateField("email", "emailError");
      var validSubject = validateField("subject", "subjectError");
      var validMessage = validateField("message", "messageError");

      if (!(validName && validEmail && validSubject && validMessage)) {
        if (statusEl) {
          statusEl.textContent = "Please fix the highlighted fields and try again.";
          statusEl.className = "form-status error";
        }
        var firstInvalid = form.querySelector(".invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Simulate send (front-end only) with loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        var btnText = submitBtn.querySelector(".btn-text");
        var original = btnText ? btnText.textContent : "";
        if (btnText) btnText.textContent = "Sending...";

        setTimeout(function () {
          if (btnText) btnText.textContent = original || "Send Message";
          submitBtn.disabled = false;
          form.reset();
          if (statusEl) {
            statusEl.textContent = "Message sent successfully! Thank you — I'll get back to you within 1–2 days.";
            statusEl.className = "form-status success";
          }
          showToast("Message sent successfully. Thank you!");
        }, 1200);
      }
    });
  }
})();
