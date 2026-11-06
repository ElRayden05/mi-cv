import { ParticleBackground } from './modules/particles.js';

// ============================================
// TYPEWRITER
// ============================================
class Typewriter {
  private element: HTMLElement;
  private words: string[];
  private typingSpeed: number;
  private deletingSpeed: number;
  private pauseTime: number;
  private wordIndex: number = 0;
  private charIndex: number = 0;
  private isDeleting: boolean = false;

  constructor(el: HTMLElement, words: string[]) {
    this.element = el;
    this.words = words;
    this.typingSpeed = 75;
    this.deletingSpeed = 40;
    this.pauseTime = 2200;
    this.tick();
  }

  private tick = (): void => {
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

// ============================================
// SCROLL REVEAL OBSERVER
// ============================================
class ScrollObserver {
  constructor() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale')
      .forEach((el) => observer.observe(el));
  }
}

// ============================================
// NAVEGACIÓN ACTIVA Y SELECT LATERAL
// ============================================
class NavigationController {
  private links: NodeListOf<HTMLAnchorElement>;

  constructor() {
    this.links = document.querySelectorAll('.nav-link');
    this.initScrollSpy();
    this.initSmoothScroll();
    this.initMobileNav();
  }

  private initScrollSpy(): void {
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

  private initSmoothScroll(): void {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = (a as HTMLAnchorElement).getAttribute('href');
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

  private initMobileNav(): void {
    const toggle = document.getElementById('mobileNavToggle');
    const nav = document.getElementById('sideNav');
    toggle?.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav?.classList.toggle('open');
    });
  }
}

// ============================================
// MODAL DETALLE EXPERIENCIA / CERTIFICADOS
// ============================================
class ModalController {
  private overlay: HTMLElement | null;
  private titleEl: HTMLElement | null;
  private subtitleEl: HTMLElement | null;
  private bodyEl: HTMLElement | null;

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
  }

  public open(title: string, subtitle: string, content: string): void {
    if (!this.overlay) return;
    if (this.titleEl) this.titleEl.textContent = title;
    if (this.subtitleEl) this.subtitleEl.textContent = subtitle;
    if (this.bodyEl) this.bodyEl.innerHTML = content;
    this.overlay.classList.add('open');
  }

  public close(): void {
    this.overlay?.classList.remove('open');
  }
}

// ============================================
// CURSOR GLOW Y TILT SUAVE
// ============================================
class SmoothEffects {
  constructor() {
    this.initCursorGlow();
    this.init3DTilt();
  }

  private initCursorGlow(): void {
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

  private init3DTilt(): void {
    const cards = document.querySelectorAll('.hover-card');
    cards.forEach((card) => {
      const el = card as HTMLElement;
      el.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = -(y / (rect.height / 2)) * 3;
        const rotateY = (x / (rect.width / 2)) * 3;
        el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }
}

// INICIALIZACIÓN GENERAL
document.addEventListener('DOMContentLoaded', () => {
  new ParticleBackground('particles-canvas');
  new ScrollObserver();
  new NavigationController();
  new ModalController();
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
