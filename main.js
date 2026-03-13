"use strict";
// Elektrikerr – Main TypeScript entry point
// ─────────────────────────────────────────
// Navigation Controller
// ─────────────────────────────────────────
class NavigationController {
    constructor() {
        this.isMenuOpen = false;
        const navbarEl = document.getElementById("navbar");
        const hamburgerEl = document.getElementById("hamburger");
        const navMenuEl = document.getElementById("nav-menu");
        if (!navbarEl || !hamburgerEl || !navMenuEl)
            return;
        this.navbar = navbarEl;
        this.hamburger = hamburgerEl;
        this.navMenu = navMenuEl;
        this.navLinks = document.querySelectorAll(".nav-link");
        this.init();
    }
    init() {
        this.hamburger.addEventListener("click", () => this.toggleMenu());
        this.navLinks.forEach((link) => {
            link.addEventListener("click", () => this.closeMenu());
        });
        window.addEventListener("scroll", () => this.onScroll());
        document.addEventListener("click", (e) => this.handleOutsideClick(e));
        this.onScroll();
    }
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.hamburger.setAttribute("aria-expanded", String(this.isMenuOpen));
        this.navMenu.classList.toggle("is-open", this.isMenuOpen);
        this.hamburger.classList.toggle("is-active", this.isMenuOpen);
        document.body.style.overflow = this.isMenuOpen ? "hidden" : "";
    }
    closeMenu() {
        if (!this.isMenuOpen)
            return;
        this.isMenuOpen = false;
        this.hamburger.setAttribute("aria-expanded", "false");
        this.navMenu.classList.remove("is-open");
        this.hamburger.classList.remove("is-active");
        document.body.style.overflow = "";
    }
    onScroll() {
        const scrolled = window.scrollY > 50;
        this.navbar.classList.toggle("navbar--scrolled", scrolled);
        this.updateActiveLink();
    }
    updateActiveLink() {
        const scrollPos = window.scrollY + 100;
        this.navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (!href || !href.startsWith("#"))
                return;
            const section = document.querySelector(href);
            if (!section)
                return;
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            link.classList.toggle("nav-link--active", scrollPos >= top && scrollPos < bottom);
        });
    }
    handleOutsideClick(e) {
        if (!this.isMenuOpen)
            return;
        const target = e.target;
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
    init() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", (e) => {
                var _a, _b;
                const href = anchor.getAttribute("href");
                if (!href || href === "#")
                    return;
                const target = document.querySelector(href);
                if (!target)
                    return;
                e.preventDefault();
                const navbarHeight = (_b = ((_a = document.getElementById("navbar")) === null || _a === void 0 ? void 0 : _a.offsetHeight)) !== null && _b !== void 0 ? _b : 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
                window.scrollTo({ top: targetPosition, behavior: "smooth" });
            });
        });
    }
}
class ContactFormController {
    constructor() {
        this.successMsg = null;
        this.fields = [];
        const formEl = document.getElementById("contact-form");
        if (!formEl)
            return;
        this.form = formEl;
        this.submitBtn = formEl.querySelector('[type="submit"]');
        this.successMsg = document.getElementById("form-success");
        this.setupFields();
        this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
    setupFields() {
        const makeField = (id, validate) => {
            const input = document.getElementById(id);
            if (!input)
                return;
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
        makeField("email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Please enter a valid email address.");
        makeField("phone", (v) => v.trim() === "" || /^[\d\s\+\-\(\)]{7,}$/.test(v.trim())
            ? null
            : "Please enter a valid phone number.");
        makeField("service", (v) => (v === "" ? "Please select a service." : null));
        makeField("message", (v) => v.trim().length < 10 ? "Please enter a message of at least 10 characters." : null);
    }
    validateField(field) {
        const error = field.validate(field.input.value);
        if (error) {
            field.input.classList.add("input--error");
            if (field.errorEl) {
                field.errorEl.textContent = error;
                field.errorEl.style.display = "block";
            }
            return false;
        }
        else {
            field.input.classList.remove("input--error");
            if (field.errorEl) {
                field.errorEl.textContent = "";
                field.errorEl.style.display = "none";
            }
            return true;
        }
    }
    handleSubmit(e) {
        e.preventDefault();
        const allValid = this.fields.every((f) => this.validateField(f));
        if (!allValid)
            return;
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = "Sending...";
        // Simulate async form submission
        setTimeout(() => {
            this.form.reset();
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = "Send Message";
            this.fields.forEach((f) => {
                f.input.classList.remove("input--error");
                if (f.errorEl)
                    f.errorEl.style.display = "none";
            });
            if (this.successMsg) {
                this.successMsg.style.display = "flex";
                setTimeout(() => {
                    if (this.successMsg)
                        this.successMsg.style.display = "none";
                }, 5000);
            }
        }, 1200);
    }
}
// ─────────────────────────────────────────
// Cookie Consent Controller
// ─────────────────────────────────────────
class CookieConsentController {
    constructor() {
        this.STORAGE_KEY = "elektrikerr_cookie_consent";
        this.banner = document.getElementById("cookie-banner");
        if (!this.banner)
            return;
        const acceptBtn = document.getElementById("cookie-accept");
        const declineBtn = document.getElementById("cookie-decline");
        if (localStorage.getItem(this.STORAGE_KEY)) {
            this.hideBanner();
            return;
        }
        setTimeout(() => {
            if (this.banner)
                this.banner.classList.add("cookie-banner--visible");
        }, 1500);
        acceptBtn === null || acceptBtn === void 0 ? void 0 : acceptBtn.addEventListener("click", () => {
            localStorage.setItem(this.STORAGE_KEY, "accepted");
            this.hideBanner();
        });
        declineBtn === null || declineBtn === void 0 ? void 0 : declineBtn.addEventListener("click", () => {
            localStorage.setItem(this.STORAGE_KEY, "declined");
            this.hideBanner();
        });
    }
    hideBanner() {
        if (!this.banner)
            return;
        this.banner.classList.remove("cookie-banner--visible");
        this.banner.classList.add("cookie-banner--hidden");
    }
}
// ─────────────────────────────────────────
// Scroll Animation Controller
// ─────────────────────────────────────────
class ScrollAnimationController {
    constructor() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate--visible");
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        document.querySelectorAll(".animate").forEach((el) => this.observer.observe(el));
    }
}
// ─────────────────────────────────────────
// Counter Animation Controller
// ─────────────────────────────────────────
class CounterController {
    constructor() {
        const counters = document.querySelectorAll("[data-count]");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach((c) => observer.observe(c));
    }
    animateCounter(el) {
        var _a, _b;
        const target = parseInt((_a = el.getAttribute("data-count")) !== null && _a !== void 0 ? _a : "0", 10);
        const suffix = (_b = el.getAttribute("data-suffix")) !== null && _b !== void 0 ? _b : "";
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
    constructor() {
        this.btn = document.getElementById("back-to-top");
        if (!this.btn)
            return;
        window.addEventListener("scroll", () => this.onScroll());
        this.btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
    onScroll() {
        if (!this.btn)
            return;
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
//# sourceMappingURL=main.js.map