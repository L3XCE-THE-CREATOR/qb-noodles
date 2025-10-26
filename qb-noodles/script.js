/* script.js - shared across pages
   Handles nav toggle, marquee, orders, dark mode toggle + prompt, and small animations.
*/

(() => {
  const WHATSAPP_BASE = 'https://wa.me/2348100245463';
  const ORDER_MSG = "Hi, I'd like to order a plate of noodles!"; // exact message required by user
  const ORDER_URL = WHATSAPP_BASE + '?text=' + encodeURIComponent(ORDER_MSG);

  // set order buttons that have js-order
  document.addEventListener('DOMContentLoaded', () => {
    // Update copyright years
    const yr = new Date().getFullYear();
    ['year','year-2','year-3','year-4'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = yr;
    });

    // Make sure any static WhatsApp links are properly encoded (some were already links in HTML).
    document.querySelectorAll('[href]').forEach(a => {
      // if anchor uses special placeholder tag 'data-ws-order' we override
      if (a.dataset && a.dataset.wsOrder === 'true') {
        a.href = ORDER_URL;
      }
    });

    // Hook order buttons
    document.querySelectorAll('.js-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = btn.dataset.item || 'Delicious Indomie';
        const text = encodeURIComponent(`Hi, I'd like to order a plate of noodles! I want: ${item}`);
        window.location.href = WHATSAPP_BASE + '?text=' + text;
      });
    });

    // Details buttons
    document.querySelectorAll('.js-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const details = btn.dataset.details || 'Details not provided.';
        // stylish modal fallback: simple alert for now
        alert(details);
      });
    });

    // Simple nav toggle for mobile
    const navToggle = document.querySelector('.js-toggle-nav');
    const nav = document.querySelector('.js-nav');
    if (navToggle && nav) {
      navToggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        navToggle.classList.toggle('open');
      });
    }

    // Marquee
    const marquees = document.querySelectorAll('.js-marquee');
    marquees.forEach(mq => {
      const span = mq.querySelector('span');
      if (!span) return;
      let width = span.scrollWidth;
      let pos = 0;
      const speed = 45; // px/sec
      function frame(ts) {
        pos = (pos + speed / 60) % width;
        span.style.transform = `translateX(${-pos}px)`;
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });

    // Plate parallax
    const platesWrap = document.querySelector('.plate-stack');
    if (platesWrap) {
      platesWrap.addEventListener('mousemove', (ev) => {
        const rX = (ev.offsetY - platesWrap.clientHeight/2) / platesWrap.clientHeight * 10;
        const rY = (ev.offsetX - platesWrap.clientWidth/2) / platesWrap.clientWidth * -10;
        platesWrap.style.transform = `perspective(800px) rotateX(${rX}deg) rotateY(${rY}deg)`;
      });
      platesWrap.addEventListener('mouseleave', () => {
        platesWrap.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg)`;
      });
    }

    // Testimonials rotate if present
    const testiWrap = document.querySelector('.js-testi');
    if (testiWrap) {
      const testis = testiWrap.querySelectorAll('.testi');
      let idx = 0;
      if (testis.length) {
        testis.forEach((t, i) => { if (i !== 0) t.style.opacity = 0; });
        setInterval(() => {
          const prev = testis[idx];
          idx = (idx + 1) % testis.length;
          const next = testis[idx];
          if (prev && next) {
            prev.style.transition = 'opacity 700ms';
            next.style.transition = 'opacity 700ms';
            prev.style.opacity = 0;
            next.style.opacity = 1;
          }
        }, 5000);
      }
    }

    // hunger meter small fun
    (function hungerMeter(){
      const el = document.createElement('div');
      el.className = 'hunger-meter';
      el.innerHTML = `<div class="hunger-fill"></div><span class="hunger-text">Crave: 0%</span>`;
      document.body.appendChild(el);
      let val = 0;
      setInterval(() => {
        val = (val + 11) % 100;
        const fill = el.querySelector('.hunger-fill');
        fill.style.width = val + '%';
        el.querySelector('.hunger-text').textContent = `Crave: ${val}%`;
      }, 1500);
    })();

    // keyboard shortcut "o" to order
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'o') {
        window.open(ORDER_URL, '_blank');
      }
    });

    // Accessibility nav close on escape
    if (nav) {
      nav.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          nav.classList.remove('open');
        }
      });
    }

    // THEME HANDLING
    initThemeControls();
  });

  // --------------------------
  // Theme (light default) + prompt
  // --------------------------
  function initThemeControls() {
    const THEME_KEY = 'nbxl_theme'; // 'light' or 'dark'
    const PROMPT_KEY = 'nbxl_prompt'; // 'never' if user chose never ask again
    const promptEl = document.getElementById('theme-prompt');
    const promptYes = document.getElementById('prompt-yes');
    const promptNo = document.getElementById('prompt-no');
    const promptNever = document.getElementById('prompt-never');

    // Buttons in header across pages (they have different IDs)
    const toggles = Array.from(document.querySelectorAll('.theme-toggle'));
    toggles.forEach(t => t.addEventListener('click', () => toggleTheme(true)));

    // If theme stored, use it; otherwise default to light
    let stored = localStorage.getItem(THEME_KEY);
    let promptNeverFlag = localStorage.getItem(PROMPT_KEY) === 'never';

    if (stored) {
      applyTheme(stored, false);
    } else {
      applyTheme('light', false); // default light

      // If user hasn't chosen "never ask", show prompt after short delay
      if (!promptNeverFlag) {
        // show prompt stylishly after a small timeout (not immediate)
        setTimeout(() => {
          if (promptEl) {
            promptEl.setAttribute('aria-hidden', 'false');
            promptEl.classList.add('visible');
          }
        }, 900); // small delay for nicer UX
      }
    }

    if (promptYes) {
      promptYes.addEventListener('click', () => {
        applyTheme('dark', true);
        if (promptNever && promptNever.checked) {
          localStorage.setItem(PROMPT_KEY, 'never');
        }
        hidePrompt();
      });
    }
    if (promptNo) {
      promptNo.addEventListener('click', () => {
        applyTheme('light', true);
        if (promptNever && promptNever.checked) {
          localStorage.setItem(PROMPT_KEY, 'never');
        }
        hidePrompt();
      });
    }

    // clicking outside prompt hides it
    if (promptEl) {
      promptEl.addEventListener('click', (e) => {
        if (e.target === promptEl) hidePrompt();
      });
    }

    function hidePrompt() {
      if (!promptEl) return;
      promptEl.classList.remove('visible');
      promptEl.setAttribute('aria-hidden', 'true');
    }

    function toggleTheme(byUser = false) {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, byUser);
    }

    function applyTheme(theme, persist = true) {
      // theme: 'light' or 'dark'
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('theme-dark');
        updateToggleButtons(true);
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.remove('theme-dark');
        updateToggleButtons(false);
      }
      if (persist) {
        localStorage.setItem(THEME_KEY, theme);
      }
    }

    function updateToggleButtons(isDark) {
      toggles.forEach(t => {
        t.setAttribute('aria-pressed', String(isDark));
        t.textContent = isDark ? '🌕' : '🌙';
      });
    }
  }

})(); // end script