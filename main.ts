// Elektrikerr – Main TypeScript entry point

// ─────────────────────────────────────────
// Navigation Controller
// ─────────────────────────────────────────
class NavigationController {
  private navbar!: HTMLElement;
  private hamburger!: HTMLButtonElement;
  private navMenu!: HTMLElement;
  private navLinks!: NodeListOf<HTMLAnchorElement>;
  private isMenuOpen: boolean = false;

  constructor() {
    const navbarEl = document.getElementById("navbar");
    const hamburgerEl = document.getElementById("hamburger");
    const navMenuEl = document.getElementById("nav-menu");

    if (!navbarEl || !hamburgerEl || !navMenuEl) return;

    this.navbar = navbarEl as HTMLElement;
    this.hamburger = hamburgerEl as HTMLButtonElement;
    this.navMenu = navMenuEl as HTMLElement;
    this.navLinks = document.querySelectorAll<HTMLAnchorElement>(".nav-link");

    this.init();
  }

  private init(): void {
    this.hamburger.addEventListener("click", () => this.toggleMenu());
    this.navLinks.forEach((link) => {
      link.addEventListener("click", () => this.closeMenu());
    });
    window.addEventListener("scroll", () => this.onScroll());
    document.addEventListener("click", (e) => this.handleOutsideClick(e));
    this.onScroll();
  }

  private toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.hamburger.setAttribute("aria-expanded", String(this.isMenuOpen));
    this.navMenu.classList.toggle("is-open", this.isMenuOpen);
    this.hamburger.classList.toggle("is-active", this.isMenuOpen);
    document.body.style.overflow = this.isMenuOpen ? "hidden" : "";
  }

  private closeMenu(): void {
    if (!this.isMenuOpen) return;
    this.isMenuOpen = false;
    this.hamburger.setAttribute("aria-expanded", "false");
    this.navMenu.classList.remove("is-open");
    this.hamburger.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  private onScroll(): void {
    const scrolled = window.scrollY > 50;
    this.navbar.classList.toggle("navbar--scrolled", scrolled);
    this.updateActiveLink();
  }

  private updateActiveLink(): void {
    const scrollPos = window.scrollY + 100;
    this.navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const section = document.querySelector<HTMLElement>(href);
      if (!section) return;
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      link.classList.toggle("nav-link--active", scrollPos >= top && scrollPos < bottom);
    });
  }

  private handleOutsideClick(e: MouseEvent): void {
    if (!this.isMenuOpen) return;
    const target = e.target as Node;
    if (!this.navMenu.contains(target) && !this.hamburger.contains(target)) {
      this.closeMenu();
    }
  }
}

// ─────────────────────────────────────────
// Smooth Scroll Controller
// ─────────────────────────────────────────
class SmoothScrollController {
  constructor() {
    this.init();
  }

  private init(): void {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector<HTMLElement>(href);
        if (!target) return;
        e.preventDefault();
        const navbarHeight = (document.getElementById("navbar")?.offsetHeight) ?? 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      });
    });
  }
}

// ─────────────────────────────────────────
// Form Controller
// ─────────────────────────────────────────
interface FormField {
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  errorEl: HTMLElement | null;
  validate: (value: string) => string | null;
}

class ContactFormController {
  private form!: HTMLFormElement;
  private submitBtn!: HTMLButtonElement;
  private successMsg: HTMLElement | null = null;
  private fields: FormField[] = [];

  constructor() {
    const formEl = document.getElementById("contact-form") as HTMLFormElement | null;
    if (!formEl) return;
    this.form = formEl;
    this.submitBtn = formEl.querySelector<HTMLButtonElement>('[type="submit"]') as HTMLButtonElement;
    this.successMsg = document.getElementById("form-success");
    this.setupFields();
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  private setupFields(): void {
    const makeField = (
      id: string,
      validate: (v: string) => string | null
    ): void => {
      const input = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (!input) return;
      const errorEl = document.getElementById(`${id}-error`);
      this.fields.push({ input, errorEl, validate });
      input.addEventListener("blur", () => this.validateField({ input, errorEl, validate }));
      input.addEventListener("input", () => {
        if (input.classList.contains("input--error")) {
          this.validateField({ input, errorEl, validate });
        }
      });
    };

    makeField("name", (v) => (v.trim().length < 2 ? "Please enter your full name." : null));
    makeField("email", (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Please enter a valid email address."
    );
    makeField("phone", (v) =>
      v.trim() === "" || /^[\d\s\+\-\(\)]{7,}$/.test(v.trim())
        ? null
        : "Please enter a valid phone number."
    );
    makeField("service", (v) => (v === "" ? "Please select a service." : null));
    makeField("message", (v) =>
      v.trim().length < 10 ? "Please enter a message of at least 10 characters." : null
    );
  }

  private validateField(field: FormField): boolean {
    const error = field.validate(field.input.value);
    if (error) {
      field.input.classList.add("input--error");
      if (field.errorEl) {
        field.errorEl.textContent = error;
        field.errorEl.style.display = "block";
      }
      return false;
    } else {
      field.input.classList.remove("input--error");
      if (field.errorEl) {
        field.errorEl.textContent = "";
        field.errorEl.style.display = "none";
      }
      return true;
    }
  }

  private handleSubmit(e: Event): void {
    e.preventDefault();
    const allValid = this.fields.every((f) => this.validateField(f));
    if (!allValid) return;

    this.submitBtn.disabled = true;
    this.submitBtn.textContent = "Sending...";

    // Simulate async form submission
    setTimeout(() => {
      this.form.reset();
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = "Send Message";
      this.fields.forEach((f) => {
        f.input.classList.remove("input--error");
        if (f.errorEl) f.errorEl.style.display = "none";
      });
      if (this.successMsg) {
        this.successMsg.style.display = "flex";
        setTimeout(() => {
          if (this.successMsg) this.successMsg.style.display = "none";
        }, 5000);
      }
    }, 1200);
  }
}

// ─────────────────────────────────────────
// Cookie Consent Controller
// ─────────────────────────────────────────
class CookieConsentController {
  private banner: HTMLElement | null;
  private STORAGE_KEY = "elektrikerr_cookie_consent";

  constructor() {
    this.banner = document.getElementById("cookie-banner");
    if (!this.banner) return;

    const acceptBtn = document.getElementById("cookie-accept");
    const declineBtn = document.getElementById("cookie-decline");

    if (localStorage.getItem(this.STORAGE_KEY)) {
      this.hideBanner();
      return;
    }

    setTimeout(() => {
      if (this.banner) this.banner.classList.add("cookie-banner--visible");
    }, 1500);

    acceptBtn?.addEventListener("click", () => {
      localStorage.setItem(this.STORAGE_KEY, "accepted");
      this.hideBanner();
    });

    declineBtn?.addEventListener("click", () => {
      localStorage.setItem(this.STORAGE_KEY, "declined");
      this.hideBanner();
    });
  }

  private hideBanner(): void {
    if (!this.banner) return;
    this.banner.classList.remove("cookie-banner--visible");
    this.banner.classList.add("cookie-banner--hidden");
  }
}

// ─────────────────────────────────────────
// Scroll Animation Controller
// ─────────────────────────────────────────
class ScrollAnimationController {
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate--visible");
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".animate").forEach((el) => this.observer.observe(el));
  }
}

// ─────────────────────────────────────────
// Counter Animation Controller
// ─────────────────────────────────────────
class CounterController {
  constructor() {
    const counters = document.querySelectorAll<HTMLElement>("[data-count]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => observer.observe(c));
  }

  private animateCounter(el: HTMLElement): void {
    const target = parseInt(el.getAttribute("data-count") ?? "0", 10);
    const suffix = el.getAttribute("data-suffix") ?? "";
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current).toLocaleString() + suffix;
    }, step);
  }
}

// ─────────────────────────────────────────
// Back-to-Top Controller
// ─────────────────────────────────────────
class BackToTopController {
  private btn: HTMLElement | null;

  constructor() {
    this.btn = document.getElementById("back-to-top");
    if (!this.btn) return;
    window.addEventListener("scroll", () => this.onScroll());
    this.btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  private onScroll(): void {
    if (!this.btn) return;
    this.btn.classList.toggle("back-to-top--visible", window.scrollY > 400);
  }
}

// ─────────────────────────────────────────
// App Bootstrap
// ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  new NavigationController();
  new SmoothScrollController();
  new ContactFormController();
  new CookieConsentController();
  new ScrollAnimationController();
  new CounterController();
  new BackToTopController();
});
