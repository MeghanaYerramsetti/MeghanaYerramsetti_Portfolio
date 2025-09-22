// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initScrollAnimations();
    initSmoothScrolling();
    initTypewriter();
    initDarkModeToggle();
    initScrollProgressBar();
    initParallaxEffect();
    initAccessibility();
    initLeetCodeStats(); // Initialize LeetCode live stats

    // Initialize fade in animations
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        el.classList.add('show');
    });
});

// Initialize Accessibility Features
function initAccessibility() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector('#main-content');
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Add keyboard navigation for interactive elements
    const interactiveElements = document.querySelectorAll('.skill-item, .project-card, .cert-card');
    interactiveElements.forEach(element => {
        element.setAttribute('tabindex', '0');
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
    });

    // Announce page changes for screen readers
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '-50px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionTitle = entry.target.querySelector('.section-title, h1, h2, h3');
                if (sectionTitle) {
                    // Update aria-live region for screen readers
                    updateAriaLive(`Now viewing: ${sectionTitle.textContent}`);
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
}

// Update ARIA live region for screen reader announcements
function updateAriaLive(message) {
    let liveRegion = document.querySelector('#aria-live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
    
    // Clear and set new message
    liveRegion.textContent = '';
    setTimeout(() => {
        liveRegion.textContent = message;
    }, 100);
}

// Initialize Enhanced Navbar functionality
function initNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;
    
    if (!hamburger || !navMenu) return;
    
    // Enhanced mobile menu toggle with proper ARIA attributes
    hamburger.addEventListener('click', function() {
        const isActive = hamburger.classList.contains('active');
        
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Update ARIA attributes for accessibility
        hamburger.setAttribute('aria-expanded', !isActive);
        
        // Prevent body scroll when menu is open
        if (!isActive) {
            body.style.overflow = 'hidden';
            // Focus first menu item
            setTimeout(() => {
                const firstLink = navMenu.querySelector('.nav-link');
                if (firstLink) firstLink.focus();
            }, 300);
        } else {
            body.style.overflow = '';
        }
        
        // Announce state change
        updateAriaLive(!isActive ? 'Navigation menu opened' : 'Navigation menu closed');
    });
    
    // Enhanced mobile menu link handling
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            // Close mobile menu
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
            
            // Smooth scroll to target
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Offset for fixed navbar
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Focus the target section for accessibility
                    setTimeout(() => {
                        targetElement.focus();
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 500);
                }
            }
        });

        // Keyboard navigation within menu
        link.addEventListener('keydown', function(e) {
            if (navMenu.classList.contains('active')) {
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        const nextLink = navLinks[index + 1] || navLinks[0];
                        nextLink.focus();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        const prevLink = navLinks[index - 1] || navLinks[navLinks.length - 1];
                        prevLink.focus();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        hamburger.click();
                        hamburger.focus();
                        break;
                }
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !hamburger.contains(e.target)) {
            hamburger.click();
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            hamburger.click();
            hamburger.focus();
        }
    });
    
    // Enhanced navbar scroll effects
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        const currentScrollY = window.scrollY;
        
        // Update navbar background based on scroll
        if (currentScrollY > 50) {
            navbar.style.background = document.body.classList.contains('dark-mode') 
                ? 'rgba(15, 23, 42, 0.98)' 
                : 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = document.body.classList.contains('dark-mode') 
                ? 'rgba(15, 23, 42, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Highlight active nav link based on scroll position
    window.addEventListener('scroll', highlightActiveNavLink);
}

// Enhanced dark mode toggle functionality
function initDarkModeToggle() {
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (!toggleButton) return;

    // Load saved mode from localStorage
    const savedMode = localStorage.getItem('darkMode');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial mode
    const shouldUseDarkMode = savedMode === 'enabled' || (savedMode === null && prefersDarkMode);
    
    if (shouldUseDarkMode) {
        document.body.classList.add('dark-mode');
        toggleButton.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
        toggleButton.setAttribute('aria-label', 'Switch to light mode');
    } else {
        toggleButton.setAttribute('aria-label', 'Switch to dark mode');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
                toggleButton.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
                toggleButton.setAttribute('aria-label', 'Switch to light mode');
            } else {
                document.body.classList.remove('dark-mode');
                toggleButton.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i>';
                toggleButton.setAttribute('aria-label', 'Switch to dark mode');
            }
        }
    });

    toggleButton.addEventListener('click', () => {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        
        if (isDarkMode) {
            toggleButton.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
            toggleButton.setAttribute('aria-label', 'Switch to light mode');
            localStorage.setItem('darkMode', 'enabled');
            updateAriaLive('Dark mode enabled');
        } else {
            toggleButton.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i>';
            toggleButton.setAttribute('aria-label', 'Switch to dark mode');
            localStorage.setItem('darkMode', 'disabled');
            updateAriaLive('Light mode enabled');
        }
        
        // Update navbar background immediately
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = isDarkMode 
                ? 'rgba(15, 23, 42, 0.98)' 
                : 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = isDarkMode 
                ? 'rgba(15, 23, 42, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)';
        }
    });

    // Keyboard support
    toggleButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleButton.click();
        }
    });
}

// Initialize scroll progress bar functionality
function initScrollProgressBar() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
        
        progressBar.style.width = scrollPercent + '%';
        progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
    });
}

// Initialize parallax effect with reduced motion support
function initParallaxEffect() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const heroImage = document.querySelector('.hero-image');
    if (!heroImage) return;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const rate = scrollY * -0.3;
        heroImage.style.transform = `translateY(${rate}px)`;
    });
}

// Enhanced scroll animations with intersection observer and staggered effects
function initScrollAnimations() {
    const skillItems = document.querySelectorAll('.skill-item');
    const projectCards = document.querySelectorAll('.project-card');
    const certCards = document.querySelectorAll('.cert-card');
    const stats = document.querySelectorAll('.stat');
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // If user prefers reduced motion, just show elements immediately
        const allElements = [...skillItems, ...projectCards, ...certCards, ...stats];
        allElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
        return;
    }
    
    // Enhanced animation for skills with staggered effect
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillsSection = entry.target;
                const skills = skillsSection.querySelectorAll('.skill-item');
                
                skills.forEach((skill, index) => {
                    setTimeout(() => {
                        skill.style.opacity = '1';
                        skill.style.transform = 'translateY(0) scale(1)';
                        skill.setAttribute('aria-hidden', 'false');
                        
                        // Add bounce effect
                        setTimeout(() => {
                            skill.style.transform = 'translateY(0) scale(1.02)';
                            setTimeout(() => {
                                skill.style.transform = 'translateY(0) scale(1)';
                            }, 150);
                        }, 300);
                    }, index * 100);
                });
            }
        });
    }, { threshold: 0.2 });
    
    // Enhanced animation for projects with slide-in effect
    const projectsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const projectsSection = entry.target;
                const projects = projectsSection.querySelectorAll('.project-card');
                
                projects.forEach((project, index) => {
                    setTimeout(() => {
                        project.style.opacity = '1';
                        project.style.transform = 'translateX(0) translateY(0)';
                        project.setAttribute('aria-hidden', 'false');
                    }, index * 150);
                });
            }
        });
    }, { threshold: 0.1 });
    
    // Enhanced animation for certifications with fade-scale effect
    const certsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const certsSection = entry.target;
                const certs = certsSection.querySelectorAll('.cert-card');
                
                certs.forEach((cert, index) => {
                    setTimeout(() => {
                        cert.style.opacity = '1';
                        cert.style.transform = 'scale(1) translateY(0)';
                        cert.setAttribute('aria-hidden', 'false');
                    }, index * 120);
                });
            }
        });
    }, { threshold: 0.15 });
    
    // Stats counter animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const numberElement = stat.querySelector('.stat-number');
                if (numberElement) {
                    const finalNumber = numberElement.textContent;
                    const number = parseInt(finalNumber);
                    
                    if (!isNaN(number)) {
                        animateCounter(numberElement, 0, number, 1500);
                    }
                }
                
                stat.style.opacity = '1';
                stat.style.transform = 'translateY(0)';
                stat.setAttribute('aria-hidden', 'false');
            }
        });
    }, { threshold: 0.3 });
    
    // Set initial states
    skillItems.forEach((skill, index) => {
        skill.style.opacity = '0';
        skill.style.transform = 'translateY(40px) scale(0.9)';
        skill.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`;
        skill.setAttribute('aria-hidden', 'true');
    });
    
    projectCards.forEach((project, index) => {
        project.style.opacity = '0';
        project.style.transform = `translateX(${index % 2 === 0 ? '-30px' : '30px'}) translateY(30px)`;
        project.style.transition = `all 0.7s cubic-bezier(0.4, 0, 0.2, 1)`;
        project.setAttribute('aria-hidden', 'true');
    });
    
    certCards.forEach((cert, index) => {
        cert.style.opacity = '0';
        cert.style.transform = 'scale(0.85) translateY(40px)';
        cert.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1)`;
        cert.setAttribute('aria-hidden', 'true');
    });
    
    stats.forEach((stat, index) => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(30px)';
        stat.style.transition = `all 0.6s ease ${index * 0.1}s`;
        stat.setAttribute('aria-hidden', 'true');
    });
    
    // Observe sections
    const skillsSection = document.querySelector('#skills');
    const projectsSection = document.querySelector('#projects');
    const certsSection = document.querySelector('#certifications');
    
    if (skillsSection) skillsObserver.observe(skillsSection);
    if (projectsSection) projectsObserver.observe(projectsSection);
    if (certsSection) certsObserver.observe(certsSection);
    
    stats.forEach(stat => statsObserver.observe(stat));
    
    // Animate progress bars when visible
    const progressBars = document.querySelectorAll('.progress-fill');
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressFill = entry.target;
                const width = progressFill.style.width || '0%';
                const progressBar = progressFill.parentElement;
                
                // Animate the width
                progressFill.style.width = '0%';
                setTimeout(() => {
                    progressFill.style.width = width;
                }, 500);
                
                // Update ARIA attributes
                if (progressBar && progressBar.hasAttribute('aria-valuenow')) {
                    const value = parseFloat(width);
                    progressBar.setAttribute('aria-valuenow', value);
                }
            }
        });
    }, { threshold: 0.1 });
    
    progressBars.forEach(bar => progressObserver.observe(bar));
}

// Counter animation function
function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    const suffix = element.textContent.replace(/[0-9]/g, '');
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (end - start) * easeOutQuart);
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Enhanced smooth scrolling functionality
function initSmoothScrolling() {
    // Handle all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Calculate offset for fixed navbar
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }
                
                // Focus target for accessibility
                setTimeout(() => {
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                }, 500);
            }
        });
    });
}

// Enhanced typewriter effect with accessibility
function initTypewriter() {
    const typewriterElement = document.getElementById('typewriter');
    if (!typewriterElement) return;
    
    const texts = [
        'AI & ML Student | Python Developer',
        'Passionate Problem Solver',
        'Certified Developer',
        'Innovation Enthusiast'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        typewriterElement.textContent = texts[0];
        return;
    }
    
    function type() {
        const currentText = texts[textIndex];
        
        if (!isDeleting && charIndex < currentText.length) {
            // Typing
            typewriterElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            setTimeout(type, 100);
        } else if (isDeleting && charIndex > 0) {
            // Deleting
            typewriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            setTimeout(type, 50);
        } else if (!isDeleting && charIndex === currentText.length) {
            // Pause before deleting
            if (!isPaused) {
                isPaused = true;
                setTimeout(() => {
                    isPaused = false;
                    isDeleting = true;
                    type();
                }, 2000);
            }
        } else if (isDeleting && charIndex === 0) {
            // Move to next text
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            setTimeout(type, 500);
        }
        
        // Update aria-live for screen readers occasionally
        if (!isDeleting && charIndex === currentText.length) {
            typewriterElement.setAttribute('aria-label', currentText);
        }
    }
    
    // Start the typewriter effect
    setTimeout(type, 1000);
}

// Highlight active navigation link based on scroll position
function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        
        if (window.scrollY >= (sectionTop - navbarHeight - 100)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        link.setAttribute('aria-current', 'false');
        
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

// Performance optimizations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll event listeners
const optimizedScrollHandler = debounce(() => {
    highlightActiveNavLink();
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

// Handle resize events
const optimizedResizeHandler = debounce(() => {
    // Recalculate positions if needed
    const navbar = document.querySelector('.navbar');
    const navMenu = document.querySelector('.nav-menu');
    
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
        const hamburger = document.querySelector('.hamburger');
        if (hamburger) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }
}, 250);

window.addEventListener('resize', optimizedResizeHandler);

// Handle focus management for better accessibility
document.addEventListener('keydown', (e) => {
    // Escape key handling for modal-like overlays
    if (e.key === 'Escape') {
        const activeMenu = document.querySelector('.nav-menu.active');
        if (activeMenu) {
            const hamburger = document.querySelector('.hamburger');
            if (hamburger) hamburger.click();
        }
    }
    
    // Tab trap for mobile menu
    if (e.key === 'Tab') {
        const activeMenu = document.querySelector('.nav-menu.active');
        if (activeMenu) {
            const focusableElements = activeMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }
});

// Initialize on load
window.addEventListener('load', () => {
    // Remove loading states if any
    document.body.classList.remove('loading');
    
    // Announce page load completion
    setTimeout(() => {
        updateAriaLive('Page loaded successfully');
    }, 1000);
});

// Console welcome message
console.log('%c👋 Welcome to Meghana\'s Portfolio!', 'color: #6366f1; font-size: 20px; font-weight: bold;');
console.log('%cFeel free to explore the code and reach out if you have any questions!', 'color: #8b5cf6; font-size: 14px;');