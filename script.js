/* ═══════════════════════════════════════
   CROWNTOST — Interactive Script (Optimized)
   ═══════════════════════════════════════ */

// ─── Disable canvas on touch devices (mobile performance) ───
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
if (isTouchDevice) {
  const c = document.getElementById('gridCanvas');
  if (c) c.style.display = 'none';
}

// ─── Liquid Nebula / Ambient Fluid Canvas ───
(function initAmbientFluid() {
  const canvas = document.getElementById("gridCanvas");
  if (!canvas || isTouchDevice) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  let w, h;
  let particles = [];
  const MOUSE_RADIUS = 120; // Zmniejszony promień interakcji
  const mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
  let lastMouse = { x: -1000, y: -1000 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    init();
  }

  window.addEventListener("resize", () => {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(resize, 200);
  });

  document.addEventListener("mousemove", (e) => {
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (lastMouse.x !== -1000) {
      mouse.vx = mouse.x - lastMouse.x;
      mouse.vy = mouse.y - lastMouse.y;
    }
  });

  document.addEventListener("mouseleave", () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  class FogNode {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.radius = Math.random() * 100 + 60; // Duże, miękkie kształty

      const isPrimary = Math.random() > 0.5;
      this.r = isPrimary ? 108 : 0;
      this.g = isPrimary ? 99 : 212;
      this.b = 255;

      // Ekstremalnie niska widoczność (minimalizm)
      this.baseAlpha = Math.random() * 0.015 + 0.005;
      this.alpha = this.baseAlpha;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Zapętlanie na krawędziach
      if (this.x < -this.radius) this.x = w + this.radius;
      if (this.x > w + this.radius) this.x = -this.radius;
      if (this.y < -this.radius) this.y = h + this.radius;
      if (this.y > h + this.radius) this.y = -this.radius;

      // Płynna, miękka interakcja z kursorem ("rozmyte" odpychanie jak dym)
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MOUSE_RADIUS) {
        let force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;

        // Popychanie zgodnie z wektorem ruchu myszy
        let pushX = mouse.vx * force * 0.02;
        let pushY = mouse.vy * force * 0.02;

        // Delikatne, powolne odpychanie na boki
        let radialPushX = (dx / distance) * -force * 0.3;
        let radialPushY = (dy / distance) * -force * 0.3;

        this.vx += pushX + radialPushX;
        this.vy += pushY + radialPushY;

        // Rozświetla się delikatnie przy interakcji
        this.alpha = Math.min(this.baseAlpha * 3, 0.06);
      } else {
        // Płynne powracanie do bazowej prędkości i przezroczystości
        this.vx *= 0.98;
        this.vy *= 0.98;
        if (Math.abs(this.vx) < 0.1) this.vx += (Math.random() - 0.5) * 0.02;
        if (Math.abs(this.vy) < 0.1) this.vy += (Math.random() - 0.5) * 0.02;

        this.alpha += (this.baseAlpha - this.alpha) * 0.03;
      }
    }

    draw() {
      // Rozmyty gradient zamiast ostrych krawędzi
      let grad = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.radius,
      );
      grad.addColorStop(
        0,
        `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`,
      );
      grad.addColorStop(1, `rgba(${this.r}, ${this.g}, ${this.b}, 0)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    const count = Math.min(Math.floor((w * h) / 18000), 80);
    for (let i = 0; i < count; i++) {
      particles.push(new FogNode());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    mouse.vx *= 0.85;
    mouse.vy *= 0.85;

    // Nakładanie z efektem "świecenia"
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // Delikatna poświata samego kursora (rozmycie)
    if (mouse.x !== -1000) {
      let grad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        100,
      );
      grad.addColorStop(0, "rgba(108, 99, 255, 0.06)");
      grad.addColorStop(1, "rgba(108, 99, 255, 0)");
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(animate);
  }

  resize();
  animate();
})();

// ─── Navbar: Hamburger & Scroll Logic ───
(function initNavbar() {
  const hamburger = document.getElementById('navHamburger');
  const navLinks  = document.getElementById('navLinks');
  const navbar    = document.getElementById('navbar');

  if (!hamburger || !navLinks || !navbar) return;

  function openMenu() {
    navLinks.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navLinks.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close on link click
  navLinks.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // Scroll effect
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

// ─── Services Interactive Cards (Mouse Tracker) ───
(function initServicesCards() {
  const cards = document.querySelectorAll(".service-panel");

  cards.forEach((card) => {
    const glow = card.querySelector(".service-panel__glow");

    card.addEventListener("mousemove", (e) => {
      if (isTouchDevice) return; 
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Magnetic glow
      if (glow) {
        glow.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }

      // Subtle 3D tilt
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      // Temporarily remove transition for instant follow
      card.style.transition = "none";
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      // Restore transition for smooth return
      card.style.transition =
        "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease";
      card.style.transform = "";

      if (glow) {
        glow.style.transform = `translate(50%, 50%) translate(-50%, -50%)`;
      }
    });

    card.addEventListener("mouseenter", () => {
      // Smooth enter before turning off transition
      card.style.transition = "transform 0.1s linear";
    });
  });
})();



// ─── Counter animation ───
(function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          let current = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = current;
          }, 30);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 },
  );
  counters.forEach((c) => observer.observe(c));
})();

// ─── Magnetic buttons (Smooth & Subtle) ───
(function initMagnetic() {
  document.querySelectorAll(".btn--primary, .btn--outline").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      if (isTouchDevice) return;
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
      
      btn.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
      btn.style.transition = "transform 0.1s ease-out"; // Fast follow
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate(0, 0) scale(1)";
      btn.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)"; // Smooth spring back
    });
  });
})();



// ─── Scroll Indicator (Interactive & Auto-hide) ───
(function initScrollIndicator() {
  const scrollIndicator = document.getElementById("heroScroll");
  if (!scrollIndicator) return;

  // Smooth fade out on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      scrollIndicator.classList.add("is-scrolled");
    } else {
      scrollIndicator.classList.remove("is-scrolled");
    }
  });

  // Smooth scroll to services on click
  scrollIndicator.addEventListener("click", () => {
    const services = document.getElementById("uslugi");
    if (services) {
      services.scrollIntoView({ behavior: "smooth" });
    }
  });
})();

// ─── Portfolio Image Pause on Click ───
(function initPortfolioPause() {
  const images = document.querySelectorAll('.project-showcase__visual-inner img');
  
  images.forEach(img => {
    const pause = () => {
      const computedStyle = window.getComputedStyle(img);
      const currentPos = computedStyle.getPropertyValue('object-position');
      img.style.objectPosition = currentPos;
      img.style.transition = 'none';
    };

    const resume = () => {
      img.style.objectPosition = '';
      img.style.transition = '';
    };

    img.addEventListener('mousedown', pause);
    img.addEventListener('mouseup', resume);
    img.addEventListener('mouseleave', resume);
    
    // Zapobieganie domyślnemu przeciąganiu obrazka
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });
})();

// ─── Contact Form Wizard ───
(function initContactWizard() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const steps = document.querySelectorAll(".wizard-step");
  const progressSteps = document.querySelectorAll(".wizard-progress__step");
  const progressLines = document.querySelectorAll(".wizard-progress__line-fill");
  const nextBtns = document.querySelectorAll(".wizard-btn--next");
  const prevBtns = document.querySelectorAll(".wizard-btn--prev");
  
  let currentStep = 1;

  function updateWizard(step) {
    const selectedType = form.querySelector('input[name="project_type"]:checked')?.value || '';
    
    // If moving to step 2, check the selected project type for tags
    if (step === 2) {
      const tagContainers = document.querySelectorAll(".wizard-tags");
      tagContainers.forEach((container) => {
        container.style.display = container.id === `tags-${selectedType}` ? "flex" : "none";
      });
    }

    // Toggle website field visibility in Step 3 if it's "Renowacja"
    const websiteGroup = document.getElementById("group-website");
    if (websiteGroup) {
      websiteGroup.style.display = selectedType === "renowacja" ? "block" : "none";
    }

    // Update steps
    steps.forEach((s) => {
      s.classList.toggle("active", s.id === `step-${step}`);
    });

    // Update progress text
    progressSteps.forEach((ps) => {
      ps.classList.toggle("active", parseInt(ps.dataset.step) <= step);
    });

    // Update progress lines
    progressLines.forEach((pl, index) => {
      pl.style.width = index < step - 1 ? "100%" : "0%";
    });
  }

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentStep = parseInt(btn.dataset.to);
      updateWizard(currentStep);
    });
  });

  prevBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentStep = parseInt(btn.dataset.to);
      updateWizard(currentStep);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector(".wizard-btn--submit");
    const originalHTML = btn.innerHTML;

    // Validate required fields
    const nameVal  = document.getElementById("name").value.trim();
    const emailVal = document.getElementById("email").value.trim();
    if (!nameVal || !emailVal) {
      btn.innerHTML = '⚠ Uzupełnij wymagane pola';
      btn.style.background = "#e74c3c";
      setTimeout(() => { btn.innerHTML = originalHTML; btn.style.background = ""; }, 2500);
      return;
    }

    // Collect data from all wizard steps
    const projectType = form.querySelector('input[name="project_type"]:checked')?.value || '';
    const features = Array.from(form.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value);
    const message = document.getElementById("message").value.trim();
    const websiteUrl = document.getElementById("website_url")?.value.trim() || '';

    const payload = {
      name: nameVal,
      email: emailVal,
      project_type: projectType,
      features: features,
      message: message,
      website_url: websiteUrl
    };

    // UI: loading state
    btn.innerHTML = '<span class="btn__text">Wysyłanie...</span>';
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.7";

    fetch("/send.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok && data.status === "success") {
        btn.innerHTML = "✓ Wysłano pomyślnie!";
        btn.style.background = "linear-gradient(135deg, #00b894, #00cec9)";
        btn.style.opacity = "1";

        setTimeout(() => {
          form.reset();
          currentStep = 1;
          updateWizard(currentStep);
          btn.innerHTML = originalHTML;
          btn.style.background = "";
          btn.style.pointerEvents = "all";
        }, 4000);
      } else {
        throw new Error(data.message || "Błąd serwera");
      }
    })
    .catch(err => {
      console.error("Form error:", err);
      btn.innerHTML = '⚠ Błąd wysyłki';
      btn.style.background = "#e74c3c";
      btn.style.opacity = "1";

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = "";
        btn.style.pointerEvents = "all";
      }, 3500);
    });
  });
})();

// ─── Navbar Active Link Tracking ───
(function initNavbarTracking() {
  const navLinks = document.querySelectorAll(".navbar__link");
  const sections = ["hero", "uslugi", "realizacje", "kontakt"];
  const isAboutPage = window.location.pathname.includes("o-nas");

  if (isAboutPage) {
    // Force "O nas" active on About page
    navLinks.forEach(link => {
      link.classList.remove("navbar__link--active");
      if (link.getAttribute("href").includes("o-nas")) {
        link.classList.add("navbar__link--active");
      }
    });
    return;
  }

  // Tracking for Index Page
  const observerOptions = {
    root: null,
    rootMargin: "-40% 0px -40% 0px", // Trigger when section is roughly in the middle
    threshold: 0
  };

  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach(link => {
          link.classList.remove("navbar__link--active");
          const href = link.getAttribute("href");
          if (href === `/#${id}` || (id === "hero" && (href === "/#hero" || href === "/"))) {
            link.classList.add("navbar__link--active");
          }
        });
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();

console.log(
  "%c KingTos dev %c Powered by Maciej Toś & Krzysztof Król ",
  "background: linear-gradient(90deg, #6C63FF, #00D4FF); color: white; padding: 6px 12px; border-radius: 4px 0 0 4px; font-weight: bold;",
  "background: #0c0c1d; color: #a0a0c0; padding: 6px 12px; border-radius: 0 4px 4px 0;",
);

// ─── Cookie Consent & Google Consent Mode v2 ───
(function initCookieConsent() {
  const consentHTML = `
  <div id="cookie-banner" class="cookie-banner">
      <div class="cookie-banner__content">
          <div class="cookie-banner__text">
              <h3>Szanujemy Twoją prywatność</h3>
              <p>Używamy plików cookie (niezbędnych), aby zapewnić prawidłowe działanie naszej strony. Za Twoją zgodą używamy również analitycznych i marketingowych plików cookie, by optymalizować stronę. Zgoda jest dobrowolna i możesz ją w dowolnym momencie wycofać. Szczegóły znajdziesz w naszej <a href="/polityka-prywatnosci" style="color: var(--c-accent); text-decoration: underline;">Polityce Prywatności</a>.</p>
          </div>
          <div class="cookie-banner__actions">
              <button id="btn-accept-all" class="btn btn--primary">Akceptuj wszystkie</button>
              <button id="btn-accept-necessary" class="btn btn--outline">Tylko niezbędne</button>
              <button id="btn-manage-cookies" class="btn btn--text">Zarządzaj</button>
          </div>
      </div>
  </div>

  <div id="cookie-modal" class="cookie-modal">
      <div class="cookie-modal__content">
          <div class="cookie-modal__header">
              <h3>Zarządzanie preferencjami</h3>
              <button id="btn-close-modal" class="btn-close">&times;</button>
          </div>
          <div class="cookie-modal__body">
              <div class="cookie-option">
                  <div class="cookie-option__info">
                      <h4>Niezbędne (Wymagane)</h4>
                      <p>Pliki absolutnie niezbędne do działania strony internetowej i podstawowych funkcji bezpieczeństwa.</p>
                  </div>
                  <label class="toggle-switch">
                      <input type="checkbox" id="toggle-necessary" checked disabled>
                      <span class="slider"></span>
                  </label>
              </div>
              <div class="cookie-option">
                  <div class="cookie-option__info">
                      <h4>Analityczne</h4>
                      <p>Pomagają nam zrozumieć, w jaki sposób odwiedzający korzystają ze strony (np. Google Analytics).</p>
                  </div>
                  <label class="toggle-switch">
                      <input type="checkbox" id="toggle-analytics">
                      <span class="slider"></span>
                  </label>
              </div>
              <div class="cookie-option">
                  <div class="cookie-option__info">
                      <h4>Marketingowe</h4>
                      <p>Wykorzystywane do śledzenia odwiedzających. Służą do wyświetlania odpowiednich reklam.</p>
                  </div>
                  <label class="toggle-switch">
                      <input type="checkbox" id="toggle-marketing">
                      <span class="slider"></span>
                  </label>
              </div>
          </div>
          <div class="cookie-modal__footer">
              <button id="btn-save-preferences" class="btn btn--primary">Zapisz ustawienia</button>
          </div>
      </div>
  </div>

  <button id="cookie-trigger" class="cookie-trigger" aria-label="Ustawienia plików cookie">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 12.5v.01"></path><path d="M12 16v.01"></path><path d="M11 11v.01"></path></svg>
  </button>
  `;
  
  document.body.insertAdjacentHTML('beforeend', consentHTML);

  const banner = document.getElementById('cookie-banner');
  const modal = document.getElementById('cookie-modal');
  const btnAcceptAll = document.getElementById('btn-accept-all');
  const btnAcceptNecessary = document.getElementById('btn-accept-necessary');
  const btnManage = document.getElementById('btn-manage-cookies');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnSavePreferences = document.getElementById('btn-save-preferences');
  const btnTrigger = document.getElementById('cookie-trigger');

  const toggleAnalytics = document.getElementById('toggle-analytics');
  const toggleMarketing = document.getElementById('toggle-marketing');

  let settings = JSON.parse(localStorage.getItem('cookieConsentSettings'));

  if (!settings) {
      setTimeout(() => banner.classList.add('bp-visible'), 500);
  } else {
      toggleAnalytics.checked = settings.analytics;
      toggleMarketing.checked = settings.marketing;
  }

  function updateGtag(analytics, marketing) {
      if (typeof gtag !== 'undefined') {
          gtag('consent', 'update', {
              'analytics_storage': analytics ? 'granted' : 'denied',
              'ad_storage': marketing ? 'granted' : 'denied',
              'ad_user_data': marketing ? 'granted' : 'denied',
              'ad_personalization': marketing ? 'granted' : 'denied'
          });
      }
  }

  function saveSettings(analytics, marketing) {
      const newSettings = { analytics, marketing };
      localStorage.setItem('cookieConsentSettings', JSON.stringify(newSettings));
      updateGtag(analytics, marketing);
      banner.classList.remove('bp-visible');
      modal.classList.remove('bp-visible');
  }

  btnAcceptAll.addEventListener('click', () => {
      toggleAnalytics.checked = true;
      toggleMarketing.checked = true;
      saveSettings(true, true);
  });

  btnAcceptNecessary.addEventListener('click', () => {
      toggleAnalytics.checked = false;
      toggleMarketing.checked = false;
      saveSettings(false, false);
  });

  btnManage.addEventListener('click', () => {
      modal.classList.add('bp-visible');
  });

  btnCloseModal.addEventListener('click', () => {
      modal.classList.remove('bp-visible');
  });

  btnSavePreferences.addEventListener('click', () => {
      saveSettings(toggleAnalytics.checked, toggleMarketing.checked);
  });

  btnTrigger.addEventListener('click', () => {
      if (settings) {
          toggleAnalytics.checked = settings.analytics;
          toggleMarketing.checked = settings.marketing;
      }
      modal.classList.add('bp-visible');
  });
})();
