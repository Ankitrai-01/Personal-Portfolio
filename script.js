/* ==========================================================================
   ANKIT RAI PORTFOLIO INTERACTIVITY SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. Global Theme Switcher (Dark/Light)
       ========================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    // Apply initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    themeToggleBtn.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = activeTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Re-initialize particles to update their color matching the theme
        if (typeof initParticles === 'function') {
            initParticles();
        }
    });

    /* ==========================================
       2. Sticky Navigation Bar & Active Highlight
       ========================================== */
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Scroll Action
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Section Scroll Highlight
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================
       3. Mobile Navigation Menu Toggle
       ========================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const menuIcon = document.getElementById('menu-icon');

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const isActive = navMenu.classList.contains('active');
        
        // Update menu icon
        if (isActive) {
            menuIcon.setAttribute('data-lucide', 'x');
        } else {
            menuIcon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    });

    // Close mobile menu on nav link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuIcon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });

    /* ==========================================
       4. Lightweight Typewriter Effect
       ========================================== */
    const typewriterElement = document.getElementById('typewriter');
    const wordsArray = JSON.parse(typewriterElement.getAttribute('data-words'));
    
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 120;

    function handleTypewriter() {
        const currentWord = wordsArray[wordIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeDelay = 60; // Faster when deleting
        } else {
            typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeDelay = 120;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeDelay = 1500; // Delay before starting deletion
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % wordsArray.length;
            typeDelay = 500; // Short delay before typing next word
        }

        setTimeout(handleTypewriter, typeDelay);
    }
    
    if (wordsArray && wordsArray.length > 0) {
        setTimeout(handleTypewriter, 1000);
    }

    /* ==========================================
       5. Interactive Ambient Particles Background
       ========================================== */
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const maxParticles = 65;
    let mouse = { x: null, y: null, radius: 120 };

    // Setup canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Trace Mouse Coordinates
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.baseRadius = Math.random() * 2 + 1;
            this.radius = this.baseRadius;
        }

        update(primaryColorRgb) {
            // Screen Bounds Collision
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // Move
            this.x += this.vx;
            this.y += this.vy;

            // Mouse Interactive Hover Gravity
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Move slightly towards mouse
                    this.x += (dx / distance) * force * 0.6;
                    this.y += (dy / distance) * force * 0.6;
                    this.radius = this.baseRadius + (force * 2.5);
                } else {
                    if (this.radius > this.baseRadius) {
                        this.radius -= 0.1;
                    }
                }
            } else {
                if (this.radius > this.baseRadius) {
                    this.radius -= 0.1;
                }
            }
        }

        draw(colorString) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = colorString;
            ctx.fill();
        }
    }

    // Initialize/Regenerate Particle Network Array
    let particleColor = 'rgba(99, 102, 241, 0.3)';
    let particleLineColor = 'rgba(99, 102, 241, 0.06)';

    window.initParticles = function() {
        particles = [];
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
        
        // Define colors matching the selected theme
        if (isLightTheme) {
            particleColor = 'rgba(79, 70, 229, 0.2)';
            particleLineColor = 'rgba(79, 70, 229, 0.04)';
        } else {
            particleColor = 'rgba(129, 140, 248, 0.35)';
            particleLineColor = 'rgba(129, 140, 248, 0.08)';
        }

        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
    };

    initParticles();

    // Render Canvas Loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update & Draw Particles
        particles.forEach(p => {
            p.update();
            p.draw(particleColor);
        });

        // Draw Interconnecting Lines between close coordinates
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 110) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = particleLineColor;
                    ctx.lineWidth = (110 - distance) / 100;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    /* ==========================================
       6. Dynamic Projects Filter Tabs Selector
       ========================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle active filter button style
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (filterValue === 'all' || cardCategory === filterValue) {
                    // Smooth Reveal Transition
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    // Smooth Fade Transition
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 350);
                }
            });
        });
    });

    /* ==========================================
       7. Interactive Contact Form Handler
       ========================================== */
    const contactForm = document.getElementById('contact-form');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const formMsgElement = document.getElementById('form-msg');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameVal = document.getElementById('form-name').value.trim();
        const emailVal = document.getElementById('form-email').value.trim();
        const subjectVal = document.getElementById('form-subject').value.trim();
        const contentVal = document.getElementById('form-content').value.trim();

        // Clear existing feedback styles
        formMsgElement.className = 'form-message';
        formMsgElement.textContent = '';
        formMsgElement.style.display = 'none';

        // High-end field validations
        if (!nameVal || !emailVal || !subjectVal || !contentVal) {
            showFormFeedback('error', 'Please fill out all the fields in the contact form.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
            showFormFeedback('error', 'Please enter a valid email address.');
            return;
        }

        // Change button state to sending
        formSubmitBtn.disabled = true;
        formSubmitBtn.innerHTML = `Sending... <i data-lucide="loader" class="animate-spin"></i>`;
        lucide.createIcons();

        // Simulate secure API/SMTP delivery timeline
        setTimeout(() => {
            // Restore button state
            formSubmitBtn.disabled = false;
            formSubmitBtn.innerHTML = `Send Message <i data-lucide="send"></i>`;
            lucide.createIcons();

            // Clear inputs
            contactForm.reset();
            
            showFormFeedback('success', `Thank you, ${nameVal}! Your message has been sent successfully. I will get back to you shortly!`);
        }, 1800);
    });

    function showFormFeedback(status, message) {
        formMsgElement.textContent = message;
        formMsgElement.classList.add(status);
        formMsgElement.style.display = 'block';
        
        // Scroll feedback into view
        formMsgElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
