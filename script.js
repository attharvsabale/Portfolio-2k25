


gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    const lenis = new Lenis();

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // set alternating data-origin
    document.querySelectorAll(".img:not([data-origin])").forEach((img, index) => {
        img.setAttribute("data-origin", index % 2 === 0 ? "left" : "right");
    });

    // start scaled down
    gsap.set(".img", { scale: 0, force3D: true });

    const rows = document.querySelectorAll(".row");

    rows.forEach((row, index) => {
        const rowImages = row.querySelectorAll(".img");

        if (rowImages.length > 0) {
            row.id = `row-${index}`;

            // SCALE IN
            ScrollTrigger.create({
                id: `scaleIn-${index}`,
                trigger: row,
                start: "top bottom",
                end: "bottom bottom-=10%",
                scrub: 1,
                invalidateOnRefresh: true,
                onUpdate: function (self) {
                    if (!self.isActive) return;

                    const progress = self.progress;
                    const easedProgress = Math.min(1, progress * 1.2);
                    const scaleValue = gsap.utils.interpolate(0, 1, easedProgress);

                    // use batch set for performance
                    gsap.set(rowImages, { scale: scaleValue, force3D: true });

                    if (progress > 0.95) {
                        gsap.set(rowImages, { scale: 1, force3D: true });
                    }
                },
                onLeave: function () {
                    gsap.set(rowImages, { scale: 1, force3D: true });
                },
            });

            // SCALE OUT
            ScrollTrigger.create({
                id: `scaleOut-${index}`,
                trigger: row,
                start: "top top",
                end: "bottom top",
                pin: true,
                pinSpacing: false,
                scrub: 1,
                invalidateOnRefresh: true,
                onEnter: function () {
                    gsap.set(rowImages, { scale: 1, force3D: true });
                },
                onUpdate: function (self) {
                    if (!self.isActive) return;

                    const scale = gsap.utils.interpolate(1, 0, self.progress);
                    gsap.set(rowImages, {
                        scale: scale,
                        force3D: true,
                        clearProps: self.progress === 1 ? "scale" : "",
                    });
                },
            });

            // MARKER FIX
            ScrollTrigger.create({
                id: `marker-${index}`,
                trigger: row,
                start: "bottom bottom",
                end: "top top",
                onEnter: () => {
                    const scaleOut = ScrollTrigger.getById(`scaleOut-${index}`);
                    if (scaleOut && scaleOut.progress === 0) {
                        gsap.set(rowImages, { scale: 1, force3D: true });
                    }
                },
                onLeave: () => {
                    const scaleOut = ScrollTrigger.getById(`scaleOut-${index}`);
                    if (scaleOut && scaleOut.progress === 0) {
                        gsap.set(rowImages, { scale: 1, force3D: true });
                    }
                },
                onEnterBack: () => {
                    const scaleOut = ScrollTrigger.getById(`scaleOut-${index}`);
                    if (scaleOut && scaleOut.progress === 0) {
                        gsap.set(rowImages, { scale: 1, force3D: true });
                    }
                },
            });
        }
    });

    // refresh once
    window.addEventListener("resize", () => {
        ScrollTrigger.refresh(true);
    });
});





/* ==========================================================================
   Matter.js Testimonials Section - OPTIMIZED VERSION
   ========================================================================== */

const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;

let engine;
let world;
let items = [];
let canvas;
let isTestimonialsVisible = false; // The new variable to track visibility

// --- Data for Testimonials ---
const testimonialData = {
    names: ["Rohan", "Kabir", "Arjun", "Sophia", "Ananya", "Vikram", "Sneha", "Isha", "Unnati", "Liam", "Emma", "Meera"],
    messages: [
        "absolutely loved the service, will recommend to friends!", "the experience was amazing, truly satisfied.",
        "highly impressed by the quality and support.", "very happy with the product, exceeded expectations!",
        "exceptional service, everyone should try this.", "great experience! The effort and dedication are impressive.",
        "amazing attention to detail, really appreciated it.", "excellent service, would definitely use again.",
        "Truly happy with Atharv's work, very attentive and helpful!", "fantastic product, I am extremely happy.",
        "wonderful experience, smooth and hassle-free.", "the service was outstanding, highly recommended!"
    ],
    colors: ["#8EBD9D", "#FAD563", "#B4BD62", "#FF5500", "#694AFF", "#FF7FEC", "#41DF82", "#FFEDA9", "#B0A7E0", "#F0E6DA", "#FFF5D1", "#F8F7F2"],
};


/**
 * Main setup function, runs once.
 */
function setup() {
    const testimonialsSection = document.querySelector('.testimonials-section');
    if (!testimonialsSection) return;

    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent(testimonialsSection);

    // ✅ NEW: Set up the Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isTestimonialsVisible = entry.isIntersecting;
        });
    }, { threshold: 0.1 }); // Triggers when 10% of the section is visible

    observer.observe(testimonialsSection);

    initializeSimulation();
}

/**
 * p5.js draw loop, runs continuously.
 */
function draw() {
    // ✅ NEW: This check pauses the entire simulation when off-screen
    if (!engine || !isTestimonialsVisible) return;

    clear(); // Transparent background
    Engine.update(engine);
    items.forEach((item) => item.update());
}

/**
 * Clears and re-builds the entire physics simulation.
 */
function initializeSimulation() {
    cleanupSimulation();
    engine = Engine.create();
    world = engine.world;
    world.gravity.y = 0;
    addBoundaries();

    const screenWidth = window.innerWidth;
    let itemCount, itemW;

    if (screenWidth <= 480) {
        itemCount = 5;
        itemW = 180;
    } else if (screenWidth <= 1024) {
        itemCount = 6;
        itemW = 250;
    } else {
        itemCount = 12;
        itemW = 300;
    }

    const spawnPadding = 20;
    const xMin = (itemW / 2) + spawnPadding;
    const xMax = screenWidth - (itemW / 2) - spawnPadding;

    for (let i = 0; i < itemCount; i++) {
        let x = random(xMin, xMax);
        let y = random(100, height - 250);
        items.push(new Item(x, y, `./assets/img${i + 1}.jpg`, testimonialData.names[i], testimonialData.messages[i], testimonialData.colors[i]));
    }
}

/**
 * Safely removes all old items from the DOM and the physics world.
 */
function cleanupSimulation() {
    const existingItems = document.querySelectorAll('.testimonials-section .item');
    existingItems.forEach(item => item.remove());
    if (world) World.clear(world);
    if (engine) Engine.clear(engine);
    items = [];
}

/**
 * Adds static wall boundaries to the world.
 */
function addBoundaries() {
    const thickness = 100;
    World.add(world, [
        Bodies.rectangle(width / 2, -thickness / 2, width, thickness, { isStatic: true }),
        Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, { isStatic: true }),
        Bodies.rectangle(-thickness / 2, height / 2, thickness, height, { isStatic: true }),
        Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, { isStatic: true }),
    ]);
}

/**
 * The Item class, responsible for a single testimonial card.
 */
class Item {
    constructor(x, y, imagePath, name, text, color) {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 480) {
            this.itemW = 180;
            this.itemH = 240;
        } else if (screenWidth <= 1024) {
            this.itemW = 250;
            this.itemH = 100;
        } else {
            this.itemW = 300;
            this.itemH = 120;
        }

        let options = {
            frictionAir: 0.075,
            restitution: 0.25,
            density: 0.002,
            angle: Math.random() * Math.PI * 2,
        };

        this.body = Bodies.rectangle(x, y, this.itemW, this.itemH, options);
        World.add(world, this.body);

        this.div = document.createElement("div");
        this.div.className = "item";
        this.div.style.position = "absolute";

        const img = document.createElement("img");
        img.src = imagePath;
        this.div.appendChild(img);
        const h1 = document.createElement("h1");
        h1.style.color = color;
        h1.innerText = name;
        this.div.appendChild(h1);
        const p = document.createElement("p");
        p.innerText = text;
        if (screenWidth <= 1024) {
            p.style.marginTop = "5px";
        }
        this.div.appendChild(p);
        document.querySelector(".testimonials-section").appendChild(this.div);
        this.div.addEventListener("click", () => this.showPopup(imagePath, name, text, color));
    }

    update() {
        this.div.style.left = `${this.body.position.x - this.itemW / 2}px`;
        this.div.style.top = `${this.body.position.y - this.itemH / 2}px`;
        this.div.style.transform = `rotate(${this.body.angle}rad)`;
    }

    showPopup(imagePath, name, text, color) {
        const overlay = document.createElement("div");
        overlay.className = "popup-overlay";
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.remove();
        });
        const card = document.createElement("div");
        card.className = "popup-card";
        const closeBtn = document.createElement("span");
        closeBtn.className = "close-btn";
        closeBtn.innerHTML = "&times;";
        closeBtn.onclick = () => overlay.remove();
        const img = document.createElement("img");
        img.src = imagePath;
        const h1 = document.createElement("h1");
        h1.innerText = name;
        h1.style.color = color;
        const p = document.createElement("p");
        p.innerText = text;
        card.appendChild(closeBtn);
        card.appendChild(img);
        card.appendChild(h1);
        card.appendChild(p);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
    }
}

/**
 * Applies a repulsive force to items near the cursor/touch point.
 */
function applyForce(x, y) {
    items.forEach((item) => {
        let d = dist(x, y, item.body.position.x, item.body.position.y);
        if (d < 300) {
            let dx = item.body.position.x - x;
            let dy = item.body.position.y - y;
            let mag = Math.sqrt(dx * dx + dy * dy) || 1;
            dx /= mag;
            dy /= mag;
            let forceMagnitude = 0.2;
            Body.applyForce(item.body, { x: item.body.position.x, y: item.body.position.y }, { x: dx * forceMagnitude, y: dy * forceMagnitude });
        }
    });
}

function mouseMoved() {
    if (isTestimonialsVisible) {
        applyForce(mouseX, mouseY);
    }
}

function touchMoved(e) {
    // ✅ NEW: Only prevent default and apply force if the canvas is visible
    if (isTestimonialsVisible) {
        e.preventDefault();
        if (touches.length > 0) {
            applyForce(touches[0].clientX, touches[0].clientY);
        }
        return false;
    }
}

/**
 * Debounce utility to prevent resize events from firing too often.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

const debouncedResize = debounce(() => {
    resizeCanvas(window.innerWidth, window.innerHeight);
    initializeSimulation();
}, 250);

function windowResized() {
    debouncedResize();
}

























document.addEventListener("DOMContentLoaded", () => {
  // check screen width
  if (window.innerWidth <= 768) {
    // 🚫 No animation on mobile → just reset everything
    gsap.set(".branding-wrapper", { y: 0, opacity: 1, filter: "blur(0px)" });
    gsap.set(".large-text", { x: 0 });
    gsap.set(".profile-image-container", { x: 0 });
    gsap.set(".logo", { y: 0, opacity: 1 });
    gsap.set(".nav-links a", { y: 0, opacity: 1 });
    gsap.set(".hero-text-wrapper", { y: 0, opacity: 1, filter: "blur(0px)" });
    gsap.set(".hero-cta-wrapper", { y: 0, opacity: 1, filter: "blur(0px)" });
    return; // stop here
  }

  // ✅ Run animations only on desktop
  let tl = gsap.timeline();

  // 1️⃣ Bottom branding animation
  tl.to(".branding-wrapper", {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    duration: 1.5,
    ease: "power4.out"
  });

  // 2️⃣ Separate large text & profile image horizontally
  tl.to(".large-text", { x: -60, duration: 0.8, ease: "power2.out" }, "+=0.3");
  tl.to(".profile-image-container", { x: 450, duration: 0.8, ease: "power2.out" }, "<");

  // 3️⃣ Navbar slides down AFTER bottom branding
  tl.to(".logo", { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" }, "+=0.2");
  tl.to(".nav-links a", { y: 0, opacity: 1, duration: 0.8, ease: "power4.out", stagger: 0.15 }, "-=0.6");

  // 4️⃣ Hero text + CTA slides up AFTER navbar
  tl.to(".hero-text-wrapper", { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power4.out" }, "+=0.2");
  tl.to(".hero-cta-wrapper", { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power4.out" }, "-=0.8");
});



 document.querySelectorAll(".accordion-item").forEach((item) => {
    const summary = item.querySelector(".accordion-question");
    const content = item.querySelector(".accordion-answer");

    // Initially hide content
    gsap.set(content, { height: 0, opacity: 0 });

    summary.addEventListener("click", (e) => {
      e.preventDefault(); // prevent default toggle

      const isOpen = item.hasAttribute("open");

      if (!isOpen) {
        // Close all other accordions
        document.querySelectorAll(".accordion-item[open]").forEach((otherItem) => {
          otherItem.removeAttribute("open");
          gsap.to(otherItem.querySelector(".accordion-answer"), { height: 0, opacity: 0, duration: 0.5, ease: "power2.out" });
        });

        // Open this one
        item.setAttribute("open", "");
        gsap.to(content, {
          height: content.scrollHeight,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        });
      } else {
        // Close this one
        item.removeAttribute("open");
        gsap.to(content, { height: 0, opacity: 0, duration: 0.5, ease: "power2.out" });
      }
    });
  });







