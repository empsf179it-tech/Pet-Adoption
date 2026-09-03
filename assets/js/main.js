/**
 * PAWORA - Main JavaScript
 * Handles Lenis smooth scrolling, GSAP animations, Three.js Hero, and UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. Initialize Lenis (Smooth Scrolling)
    // ----------------------------------------------------------------------
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate Lenis with GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Update ScrollTrigger on Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // ----------------------------------------------------------------------
    // 3. Page Loader Sequence
    // ----------------------------------------------------------------------
    const loaderPercentage = document.querySelector('.loader-percentage');
    const loaderBar = document.querySelector('.loader-bar');
    let progress = 0;
    
    // Simulate loading progress
    const loadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress > 100) progress = 100;
        
        loaderPercentage.textContent = progress + '%';
        loaderBar.style.width = progress + '%';
        
        if (progress === 100) {
            clearInterval(loadInterval);
            finishLoading();
        }
    }, 150);

    function finishLoading() {
        const tl = gsap.timeline();
        
        tl.to('.loader-heart', { opacity: 1, scale: 1.2, duration: 0.5, ease: "back.out(1.7)" })
          .to('.loader-logo', { opacity: 1, y: -20, duration: 0.5, ease: "power2.out" }, "-=0.2")
          .to('.page-loader', {
              y: '-100%',
              duration: 1,
              ease: "power4.inOut",
              delay: 0.5
          })
          .from('.hero-content h1 .word', {
              y: 50,
              opacity: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: "back.out(1.5)"
          }, "-=0.3")
          .from('.floating-card', {
              scale: 0,
              opacity: 0,
              duration: 0.8,
              stagger: 0.2,
              ease: "back.out(1.5)"
          }, "-=0.5");
    }

    // ----------------------------------------------------------------------
    // 4. Mobile Navigation & Sticky Header
    // ----------------------------------------------------------------------
    const nav = document.querySelector('.main-nav');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let isMenuOpen = false;

    // Sticky Nav
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Toggle Menu
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        if (isMenuOpen) {
            lenis.stop(); // Prevent scrolling when menu is open
        } else {
            lenis.start();
        }
    }

    hamburger.addEventListener('click', toggleMenu);
    
    // Close menu when clicking links
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if(isMenuOpen) toggleMenu();
        });
    });

    // Active Navigation State (ScrollSpy)
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Trigger when section is in the middle of the screen
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active from all
                navItems.forEach(item => item.classList.remove('active'));
                // Add active to current
                const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if(activeLink) activeLink.classList.add('active');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // ----------------------------------------------------------------------
    // 5. GSAP Scroll Animations
    // ----------------------------------------------------------------------
    
    // Split text setup
    const splitTexts = document.querySelectorAll('.split-text');
    splitTexts.forEach(text => {
        new SplitType(text, { types: 'words, chars' });
    });

    // Animate headings on scroll
    const headings = document.querySelectorAll('h2.split-text');
    headings.forEach(heading => {
        gsap.from(heading.querySelectorAll('.word'), {
            scrollTrigger: {
                trigger: heading,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power3.out"
        });
    });

    // Parallax images
    const parallaxImgs = document.querySelectorAll('.parallax-img');
    parallaxImgs.forEach(img => {
        gsap.to(img, {
            scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            },
            y: "20%",
            ease: "none"
        });
    });

    // Timeline steps animation
    const steps = document.querySelectorAll('.step-item');
    steps.forEach((step, index) => {
        gsap.to(step, {
            scrollTrigger: {
                trigger: step,
                start: "top 70%",
                onEnter: () => step.classList.add('active'),
                onLeaveBack: () => step.classList.remove('active')
            }
        });
    });

    // Timeline progress line
    if(document.querySelector('.process-section')) {
        gsap.to('.timeline-progress', {
            scrollTrigger: {
                trigger: '.timeline-steps',
                start: "top 70%",
                end: "bottom 50%",
                scrub: 1
            },
            width: "100%",
            height: "100%", // for mobile
            ease: "none"
        });
    }

    // Bento Cards cascade
    if(document.querySelector('.bento-grid')) {
        gsap.from('.bento-card', {
            scrollTrigger: {
                trigger: '.bento-grid',
                start: "top 80%"
            },
            y: 50,
            opacity: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out"
        });
    }

    // ----------------------------------------------------------------------
    // 6. Three.js Subtle Background (Hero)
    // ----------------------------------------------------------------------
    const initThreeJS = () => {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        // Skip heavy 3D on small mobile devices to save battery/performance
        if(window.innerWidth < 768) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 100;
        const posArray = new Float32Array(particlesCount * 3);

        for(let i = 0; i < particlesCount * 3; i++) {
            // Spread particles across the screen
            posArray[i] = (Math.random() - 0.5) * 10;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        // Simple circular particle using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const context = canvas.getContext('2d');
        context.beginPath();
        context.arc(8, 8, 8, 0, Math.PI * 2);
        context.fillStyle = '#C58B5C';
        context.fill();
        const texture = new THREE.CanvasTexture(canvas);

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            map: texture,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        camera.position.z = 3;

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX);
            mouseY = (event.clientY - windowHalfY);
        });

        // Animation Loop
        const clock = new THREE.Clock();

        const animate = () => {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            targetX = mouseX * 0.001;
            targetY = mouseY * 0.001;

            particlesMesh.rotation.y += 0.001;
            particlesMesh.rotation.x += 0.0005;

            // Parallax based on mouse
            particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
            particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

            // Gentle wave motion
            particlesMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.1;

            renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };

    initThreeJS();

    // ----------------------------------------------------------------------
    // 7. Pet Personality Discovery Logic
    // ----------------------------------------------------------------------
    const traits = document.querySelectorAll('.trait-btn');
    const matchName = document.getElementById('matchName');
    const matchBreed = document.getElementById('matchBreed');
    const matchImg = document.getElementById('matchImg');
    const matchCard = document.getElementById('matchCard');
    
    // Pet database mapped to traits
    const petDB = {
        'energetic': { name: "MAX", breed: "Border Collie Mix", img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop" },
        'calm': { name: "BELLA", breed: "Persian Cat", img: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=600&auto=format&fit=crop" },
        'playful': { name: "CHARLIE", breed: "Golden Retriever Puppy", img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=600&auto=format&fit=crop" },
        'affectionate': { name: "DAISY", breed: "Rescue Mix", img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop" },
        'independent': { name: "MILO", breed: "Domestic Shorthair", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop" },
        'family': { name: "BUDDY", breed: "Labrador Retriever", img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=600&auto=format&fit=crop" },
        'kids': { name: "ROCKY", breed: "Beagle", img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=600&auto=format&fit=crop" },
        'pets': { name: "OLIVER", breed: "Maine Coon", img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=600&auto=format&fit=crop" }
    };

    traits.forEach(btn => {
        btn.addEventListener('click', () => {
            // Prevent re-animating if already active
            if(btn.classList.contains('active')) return;

            // Toggle active class
            traits.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            
            const traitKey = btn.getAttribute('data-trait');
            const matchedPet = petDB[traitKey] || petDB['affectionate'];
            
            // Animate card out
            gsap.to(matchCard, {
                scale: 0.95,
                opacity: 0.5,
                duration: 0.3,
                onComplete: () => {
                    // Update content
                    matchName.textContent = matchedPet.name;
                    matchBreed.textContent = matchedPet.breed;
                    matchImg.src = matchedPet.img;
                    
                    // Animate card in
                    gsap.to(matchCard, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.4,
                        ease: "back.out(1.5)"
                    });
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 8. Form Submission Feedback
    // ----------------------------------------------------------------------
    const adoptionForm = document.getElementById('adoptionForm');
    if(adoptionForm) {
        adoptionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = adoptionForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<span>SENDING...</span>';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                submitBtn.innerHTML = '<span><i data-lucide="check"></i> INTEREST RECEIVED</span>';
                submitBtn.classList.remove('btn-primary');
                submitBtn.style.backgroundColor = '#2ecc71';
                submitBtn.style.color = '#fff';
                lucide.createIcons(); // refresh icon
                
                setTimeout(() => {
                    adoptionForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.add('btn-primary');
                    submitBtn.style.backgroundColor = '';
                    lucide.createIcons();
                }, 3000);
            }, 1500);
        });
    }

});
