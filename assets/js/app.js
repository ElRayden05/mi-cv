// Bundle compilado directo para ejecutar en navegador de forma nativa sin transpilador externo
class ParticleBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.resize();
    this.init();
    this.animate();

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const count = Math.min(Math.floor(window.innerWidth * 0.035), 45);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.5 + 0.4,
        opacity: Math.random() * 0.25 + 0.05,
        opacitySpeed: (Math.random() - 0.5) * 0.002
      });
    }
  }

  animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 180) {
        const force = ((180 - dist) / 180) * 0.002;
        p.vx -= dx * force;
        p.vy -= dy * force;
      }

      p.vx *= 0.999;
      p.vy *= 0.999;

      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      p.opacity += p.opacitySpeed;
      if (p.opacity > 0.35 || p.opacity < 0.05) p.opacitySpeed *= -1;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      this.ctx.fill();

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < 110) {
          const alpha = (1 - d / 110) * 0.05;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
    requestAnimationFrame(this.animate);
  };
}

class Typewriter {
  constructor(el, words) {
    this.element = el;
    this.words = words;
    this.typingSpeed = 75;
    this.deletingSpeed = 40;
    this.pauseTime = 2200;
    this.wordIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.tick();
  }

  tick = () => {
    const current = this.words[this.wordIndex];
    if (this.isDeleting) {
      this.charIndex--;
    } else {
      this.charIndex++;
    }

    this.element.textContent = current.substring(0, this.charIndex);
    let delay = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

    if (!this.isDeleting && this.charIndex === current.length) {
      delay = this.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
      delay = 400;
    }
    setTimeout(this.tick, delay);
  };
}

// Observador bidireccional suave: aparece al bajar y desaparece al subir
class ScrollObserver {
  constructor() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          } else {
            // Suavidad al subir: si el elemento sale por abajo al hacer scroll hacia arriba
            const rect = entry.target.getBoundingClientRect();
            if (rect.top > window.innerHeight * 0.8) {
              entry.target.classList.remove('revealed');
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale')
      .forEach((el) => observer.observe(el));
  }
}

class NavigationController {
  constructor() {
    this.links = document.querySelectorAll('.nav-link');
    this.initScrollSpy();
    this.initSmoothScroll();
    this.initMobileNav();
  }

  initScrollSpy() {
    const sections = document.querySelectorAll('.section');
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            this.links.forEach((link) => {
              link.classList.toggle('active', link.dataset.section === id);
            });
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((sec) => spy.observe(sec));
  }

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = a.getAttribute('href');
        if (!targetId) return;
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        document.getElementById('sideNav')?.classList.remove('open');
        document.getElementById('mobileNavToggle')?.classList.remove('active');
      });
    });
  }

  initMobileNav() {
    const toggle = document.getElementById('mobileNavToggle');
    const nav = document.getElementById('sideNav');
    const backdrop = document.getElementById('menuBackdrop');

    const toggleMenu = () => {
      const isOpen = nav?.classList.toggle('open');
      toggle?.classList.toggle('active', isOpen);
      backdrop?.classList.toggle('open', isOpen);
    };

    const closeMenu = () => {
      nav?.classList.remove('open');
      toggle?.classList.remove('active');
      backdrop?.classList.remove('open');
    };

    toggle?.addEventListener('click', toggleMenu);
    backdrop?.addEventListener('click', closeMenu);

    // Cerrar al dar clic en cualquier enlace
    this.links.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }
}

class ModalController {
  constructor() {
    this.overlay = document.getElementById('detailsModal');
    this.titleEl = document.getElementById('modalTitle');
    this.subtitleEl = document.getElementById('modalSubtitle');
    this.bodyEl = document.getElementById('modalBody');

    document.querySelectorAll('.modal-trigger').forEach((el) => {
      el.addEventListener('click', () => {
        const title = el.getAttribute('data-modal-title') || '';
        const subtitle = el.getAttribute('data-modal-subtitle') || '';
        const content = el.getAttribute('data-modal-content') || '';
        this.open(title, subtitle, content);
      });
    });

    document.getElementById('closeModalBtn')?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Cerrar suavemente con tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay?.classList.contains('open')) {
        this.close();
      }
    });
  }

  open(title, subtitle, content) {
    if (!this.overlay) return;
    if (this.titleEl) this.titleEl.textContent = title;
    if (this.subtitleEl) this.subtitleEl.textContent = subtitle;
    if (this.bodyEl) this.bodyEl.innerHTML = content;
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Videos de proyectos: reproducen en loop al pasar el mouse, se pausan al salir
class ProjectVideoHover {
  constructor() {
    document.querySelectorAll('[data-video-hover]').forEach((wrap) => {
      const video = wrap.querySelector('video');
      if (!video) return;

      wrap.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
      });
      wrap.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });

      // En táctil: tocar el video alterna play/pausa
      video.addEventListener('click', () => {
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    });
  }
}

class SmoothEffects {
  constructor() {
    this.initCursorGlow();
    this.init3DTilt();
  }

  initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow) return;
    let cx = 0, cy = 0, tx = 0, ty = 0;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      glow.classList.add('visible');
    });

    const follow = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      glow.style.left = `${cx}px`;
      glow.style.top = `${cy}px`;
      requestAnimationFrame(follow);
    };
    follow();
  }

  init3DTilt() {
    // Solo activar tilt en pantallas grandes (no táctiles)
    if (window.innerWidth < 768) return;

    const cards = document.querySelectorAll('.hover-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = -(y / (rect.height / 2)) * 3;
        const rotateY = (x / (rect.width / 2)) * 3;
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParticleBackground('particles-canvas');
  new ScrollObserver();
  new NavigationController();
  new ModalController();
  new ProjectVideoHover();
  new SmoothEffects();

  const typewriter = document.getElementById('typewriter');
  if (typewriter) {
    new Typewriter(typewriter, [
      'QA Analyst & Aseguramiento de Calidad',
      'Ingeniero Electrónico',
      'Especialista en Telecomunicaciones & Redes',
      'Diseño Eléctrico y Cálculos RETIE',
      'Análisis de Datos con Python & Excel'
    ]);
  }
});
