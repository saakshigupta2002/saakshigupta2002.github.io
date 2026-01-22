// Utility function to debounce scroll events
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Module for handling mobile menu interactions
const mobileMenuHandler = (() => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const topNavbar = document.querySelector('.top-navbar');
    const body = document.body;

    const init = () => {
        if (mobileMenuToggle && topNavbar) {
            mobileMenuToggle.addEventListener('click', toggleMenu);
            topNavbar.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', closeMenuOnNavLinkClick);
            });
        }
    };

    const toggleMenu = () => {
        topNavbar.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        body.classList.toggle('menu-open');
    };

    const closeMenu = () => {
        topNavbar.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        body.classList.remove('menu-open');
    };

    const closeMenuOnNavLinkClick = (e) => {
        // Close menu if it's a link to another page or an anchor on the current page
        if (e.target.href.includes('.html') || e.target.hash) {
            closeMenu();
        }
    };

    return {
        init,
        closeMenu
    };
})();

// Module for handling navigation and active links
const navigationHandler = (() => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    const init = () => {
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });
        window.addEventListener('load', setInitialActiveLinks);
        window.addEventListener('scroll', debounce(updateActiveSidebarLinks, 50));
        window.addEventListener('resize', debounce(updateActiveSidebarLinks, 50));
    };

    const handleNavLinkClick = (e) => {
        const linkHref = e.currentTarget.getAttribute('href');

        if (linkHref.startsWith('#')) {
            e.preventDefault();
            const targetId = linkHref.substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const topOffset = document.querySelector('.top-navbar')?.offsetHeight || 0;
                const scrollBuffer = 20;
                const elementPosition = targetSection.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - topOffset - scrollBuffer,
                    behavior: 'smooth'
                });
            }

            if (window.innerWidth <= 768) {
                mobileMenuHandler.closeMenu();
            }
        }
    };

    const updateActiveSidebarLinks = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const topNavbarHeight = document.querySelector('.top-navbar')?.offsetHeight || 0;

        document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll('.nav-menu .sub-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll('.sub-nav-menu').forEach(subMenu => {
            subMenu.style.display = 'none';
        });

        if (window.innerWidth <= 768) {
            const mainPageLinkForCurrentPage = document.querySelector(`.nav-menu a[href="${currentPage}"]`);
            if (mainPageLinkForCurrentPage) {
                mainPageLinkForCurrentPage.classList.add('active');
            }
        } else {
            let currentSectionId = '';
            let bestMatchRatio = 0;
            let bestMatchId = '';

            const sections = document.querySelectorAll('.main-content .section'); // Get all sections

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const sectionHeight = rect.height;

                // Calculate visible portion of the section
                const visibleTop = Math.max(0, rect.top);
                const visibleBottom = Math.min(window.innerHeight, rect.bottom);
                const visibleHeight = visibleBottom - visibleTop;

                const visibilityRatio = sectionHeight > 0 ? visibleHeight / sectionHeight : 0;

                // Check if the section's top is past the activation offset
                // OR if a significant portion of it is visible
                const activationOffset = topNavbarHeight + 50; // Adjust as needed

                if (rect.top <= activationOffset && rect.bottom > activationOffset) {
                    // This section is "intersecting" the activation line
                    // priori this, but can also use visibility ratio as a tie-breaker
                    if (visibilityRatio > bestMatchRatio) {
                        bestMatchRatio = visibilityRatio;
                        bestMatchId = section.getAttribute('id');
                    }
                } else if (rect.top > activationOffset && rect.top < window.innerHeight && visibilityRatio > 0.5) {
                    // If the section hasn't reached the activation offset yet,
                    // but it's significantly visible in the viewport, consider it if no better match
                    if (visibilityRatio > bestMatchRatio) {
                        bestMatchRatio = visibilityRatio;
                        bestMatchId = section.getAttribute('id');
                    }
                }
            });

            if (bestMatchId) {
                currentSectionId = bestMatchId;
            } else {
                // Fallback: If no section crosses the activationOffset, check the section closest to the top of the viewport
                // safety net for edge cases or very short pages
                let closestTop = Infinity;
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top < closestTop && rect.bottom > 0) { // Section is at least partially visible
                        closestTop = rect.top;
                        currentSectionId = section.getAttribute('id');
                    }
                });
            }

            const mainPageLinkForCurrentPage = document.querySelector(`.nav-menu a[href="${currentPage}"]`);
            if (mainPageLinkForCurrentPage) {
                mainPageLinkForCurrentPage.classList.add('active');
            }


            if (currentSectionId) {
                const activeSidebarLink = document.querySelector(`.nav-menu a[href="#${currentSectionId}"]`);
                if (activeSidebarLink) {
                    activeSidebarLink.classList.add('active');

                    const parentNavLink = activeSidebarLink.closest('.sub-nav-menu')?.previousElementSibling;
                    if (parentNavLink && parentNavLink.classList.contains('nav-link')) {
                        const isInternalAnchorParent = parentNavLink.getAttribute('href').startsWith('#');
                        const parentLinkPage = parentNavLink.getAttribute('href').split('/').pop();
                        const isCurrentPageParent = (parentLinkPage === currentPage || (currentPage === 'index.html' && parentLinkPage === ''));

                        if (isInternalAnchorParent || isCurrentPageParent) {
                            parentNavLink.classList.add('active');
                            const subMenu = parentNavLink.nextElementSibling;
                            if (subMenu && subMenu.classList.contains('sub-nav-menu')) {
                                // Only display if it's the current page or an internal anchor
                                subMenu.style.display = 'block';
                            }
                        }
                    }
                }
            }
        }
    };

    const setInitialActiveLinks = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        document.querySelectorAll('.top-navbar nav a').forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        updateActiveSidebarLinks();

    };

    return {
        init
    };
})();

// Module for image lightbox modal
const imageModalHandler = (() => {
    const imageModal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const captionText = document.getElementById("caption");
    const imageModalCloseBtn = imageModal ? imageModal.querySelector(".close-button") : null;
    const body = document.body;

    const init = () => {
        if (imageModal && modalImg && captionText && imageModalCloseBtn) {
            // Use event delegation for images to handle dynamically added content
            document.addEventListener('click', handleImageClick); // Keep this for general images outside project modal
            imageModalCloseBtn.addEventListener('click', closeModal);
            imageModal.addEventListener('click', handleOutsideClick);
            document.addEventListener('keydown', handleEscapeKey);
        }
    };

    const openImageDirectly = (imgElement) => {
        imageModal.style.display = "flex";
        imageModal.classList.add('active');
        modalImg.src = imgElement.getAttribute('data-full-src') || imgElement.src; // Use data-full-src first, then src
        captionText.innerHTML = imgElement.getAttribute('data-caption') || imgElement.alt;
        modalImg.style.animation = 'modalZoomIn 0.6s forwards';
        body.classList.add('modal-open');
    };

    const handleImageClick = (e) => {
        // This handler is for images outside the project modal, or for fallback
        const img = e.target.closest('img[data-full-src], img.project-modal-image, .gallery-item img'); // Also target gallery images
        if (img && !e.target.closest('.project-modal-content')) { // Don't open if clicking inside project modal
            e.preventDefault();
            e.stopPropagation();
            // Ensure data-full-src is set for gallery images
            if (!img.getAttribute('data-full-src')) {
                img.setAttribute('data-full-src', img.src);
            }
            if (!img.getAttribute('data-caption')) {
                img.setAttribute('data-caption', img.alt);
            }
            openImageDirectly(img);
        }
    };

    const closeModal = () => {
        imageModal.classList.remove('active');
        modalImg.style.animation = 'modalZoomOut 0.6s forwards';
        setTimeout(() => {
            imageModal.style.display = "none";
            modalImg.style.animation = '';
            body.classList.remove('modal-open');
        }, 600);
    };

    const handleOutsideClick = (e) => {
        if (e.target === imageModal) {
            closeModal();
        }
    };

    const handleEscapeKey = (e) => {
        if (e.key === "Escape" && imageModal.classList.contains('active')) {
            closeModal();
        }
    };

    return {
        init,
        openImageDirectly // Expose the new function
    };
})();

// Module for project detail modal
const projectDetailModalHandler = (() => {
    const projectDetailModal = document.getElementById('projectDetailModal');
    const projectModalTitle = document.getElementById('projectModalTitle');
    const projectModalDescription = document.getElementById('projectModalDescription');
    const projectModalTech = document.getElementById('projectModalTech');
    const projectModalGithubLink = document.getElementById('projectModalGithubLink');
    const projectModalImages = document.getElementById('projectModalImages');
    const projectModalDemoLink = document.getElementById('projectModalDemoLink');
    const projectDetailModalCloseBtn = projectDetailModal ? projectDetailModal.querySelector('.close-button') : null;
    const body = document.body;

    const init = () => {
        if (projectDetailModal && projectModalTitle && projectModalDescription && projectModalTech && projectModalGithubLink && projectModalImages && projectDetailModalCloseBtn) {
            document.querySelectorAll('.project-card').forEach(card => {
                card.addEventListener('click', openProjectModal);
            });
            projectDetailModalCloseBtn.addEventListener('click', closeProjectModal);
            projectDetailModal.addEventListener('click', handleOutsideClick);
            document.addEventListener('keydown', handleEscapeKey);
        }
    };

    const openProjectModal = (e) => {
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            return;
        }

        const card = e.currentTarget;
        projectModalTitle.textContent = card.querySelector('h3').textContent;
        projectModalDescription.textContent = card.dataset.fullDescription;

        projectModalTech.innerHTML = '';
        card.querySelectorAll('.tech-pill').forEach(pill => {
            const newPill = document.createElement('span');
            newPill.classList.add('tech-pill');
            newPill.textContent = pill.textContent;
            projectModalTech.appendChild(newPill);
        });

        const githubLink = card.dataset.githubLink;
        if (githubLink) {
            projectModalGithubLink.href = githubLink;
            projectModalGithubLink.style.display = 'flex';
        } else {
            projectModalGithubLink.style.display = 'none';
        }

        // Handle Hugging Face link
        const huggingfaceLink = card.dataset.huggingfaceLink;
        const projectModalHuggingFaceLink = document.getElementById('projectModalHuggingFaceLink');
        if (huggingfaceLink && projectModalHuggingFaceLink) {
            projectModalHuggingFaceLink.href = huggingfaceLink;
            projectModalHuggingFaceLink.style.display = 'flex';
        } else if (projectModalHuggingFaceLink) {
            projectModalHuggingFaceLink.style.display = 'none';
        }

        // Handle demo link
        const demoLink = card.dataset.demoLink;
        const linkLabel = card.dataset.linkLabel || 'Demo';
        if (demoLink && projectModalDemoLink) {
            projectModalDemoLink.href = demoLink;
            projectModalDemoLink.textContent = `▶ ${linkLabel}`;
            projectModalDemoLink.style.display = 'flex';
        } else if (projectModalDemoLink) {
            projectModalDemoLink.style.display = 'none';
        }

        projectModalImages.innerHTML = '';
        const images = card.dataset.images ? card.dataset.images.split(',') : [];
        if (images.length > 0) {
            images.forEach(src => {
                // Create container for image and caption
                const imageContainer = document.createElement('div');
                imageContainer.classList.add('project-modal-image-container');
                
                const img = document.createElement('img');
                img.src = src.trim(); // Use src for actual image display
                img.alt = projectModalTitle.textContent + " image";
                img.classList.add('project-modal-image');
                
                // Extract classification from filename
                const filename = src.trim().split('/').pop().replace('.png', '').replace('.jpg', '').replace('.jpeg', '');
                let classification = filename;
                // Convert filename to readable classification
                if (filename.includes('Alzheimers_Disease') || filename.includes('Alzheimers')) {
                    classification = "Alzheimer's Disease";
                } else if (filename.includes('Normal_Cognition') || filename.includes('Normal')) {
                    classification = "Normal Cognition";
                } else {
                    // Convert snake_case or camelCase to Title Case
                    classification = filename
                        .replace(/_/g, ' ')
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .trim();
                }
                
                // Create caption element
                const caption = document.createElement('div');
                caption.classList.add('project-modal-image-caption');
                caption.textContent = classification;
                
                // Store the full resolution source in a data attribute for the lightbox
                img.setAttribute('data-full-src', src.trim()); // Ensure data-full-src is set
                img.setAttribute('data-caption', classification); // Set caption for the lightbox
                // Call the new direct function from imageModalHandler
                img.addEventListener('click', () => imageModalHandler.openImageDirectly(img));
                
                // Append image and caption to container
                imageContainer.appendChild(img);
                imageContainer.appendChild(caption);
                projectModalImages.appendChild(imageContainer);
            });
            projectModalImages.style.display = 'grid';
        } else {
            projectModalImages.style.display = 'none';
        }

        projectDetailModal.style.display = 'flex';
        projectDetailModal.classList.add('active');
        body.classList.add('modal-open');
    };

    const closeProjectModal = () => {
        projectDetailModal.classList.remove('active');
        setTimeout(() => {
            projectDetailModal.style.display = 'none';
            body.classList.remove('modal-open');
        }, 300);
    };

    const handleOutsideClick = (e) => {
        if (e.target === projectDetailModal) {
            closeProjectModal();
        }
    };

    const handleEscapeKey = (e) => {
        if (e.key === "Escape" && projectDetailModal.classList.contains('active')) {
            closeProjectModal();
        }
    };

    return {
        init
    };
})();

// Module for Intersection Observer animations and lazy loading
const animationObserver = (() => {
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Load images when they are 50px from the bottom of the viewport
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apply animation styles
                entry.target.style.opacity = '1';
                if (entry.target.classList.contains('slide-in-left') || entry.target.classList.contains('slide-in-right')) {
                    entry.target.style.transform = 'translateX(0)';
                }

                // Handle lazy loading for images within the intersecting element
                const lazyImages = entry.target.querySelectorAll('img[data-src]');
                lazyImages.forEach(img => {
                    img.src = img.dataset.src; // Set the actual source from data-src
                    img.removeAttribute('data-src'); // Remove data-src to prevent re-loading
                });

                // Stop observing this element after it has been animated and images loaded
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const init = () => {
        // Observe elements for animation
        document.querySelectorAll('.timeline-item').forEach(item => {
            observer.observe(item);
        });
        document.querySelectorAll('.gallery-container .gallery-item').forEach(item => {
            observer.observe(item);
        });
        // Also observe any other images that should be lazy loaded, e.g., if you add data-src to them directly
        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    };

    return {
        init
    };
})();

// Module for horizontal auto-scrolling galleries
const horizontalGalleryHandler = (() => {
    function initAutoScrollGallery(galleryElement, scrollSpeed = 0.5, pauseOnHover = true) {
        if (!galleryElement) return;

        let animationFrameId;
        let currentScroll = 0;
        let isPaused = false;
        let userInteracting = false; // New flag to detect manual interaction

        // Duplicate content for seamless loop
        const galleryContent = galleryElement.innerHTML;
        galleryElement.innerHTML += galleryContent;

        const animateScroll = () => {
            // Only auto-scroll if not paused AND not user interacting
            if (!isPaused && !userInteracting) {
                currentScroll += scrollSpeed;
                if (currentScroll >= galleryElement.scrollWidth / 2) {
                    currentScroll = 0;
                }
                galleryElement.scrollLeft = currentScroll;
            }
            animationFrameId = requestAnimationFrame(animateScroll);
        };

        const startScrolling = () => {
            if (!animationFrameId) {
                animateScroll();
            }
        };

        // Pause on hover for desktop (existing)
        if (pauseOnHover) {
            // Find all individual gallery items within this gallery and attach listeners
            const galleryItems = galleryElement.querySelectorAll('.gallery-item');
            galleryItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    isPaused = true;
                });
                item.addEventListener('mouseleave', () => {
                    isPaused = false;
                });
            });
        }

        // New: Event listeners for touch interaction to pause auto-scroll
        galleryElement.addEventListener('touchstart', () => {
            userInteracting = true; // User started touching
            isPaused = true; // Also pause on touch to be safe
        });

        galleryElement.addEventListener('touchend', () => {
            // Give a small delay before resuming auto-scroll to allow for natural lift-off
            setTimeout(() => {
                userInteracting = false; // User stopped touching
                isPaused = false;
            }, 300); // Adjust delay as needed
        });

        // Add a 'scroll' event listener to the gallery itself to detect manual scrolling
        galleryElement.addEventListener('scroll', () => {
            // If the user manually scrolls, reset the auto-scroll position to match
            // This helps prevent jumps if the user scrolls and then auto-scroll resumes
            currentScroll = galleryElement.scrollLeft;
        });


        startScrolling();
    }

    const init = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPage === 'creative.html') {
            document.querySelectorAll('.horizontal-gallery').forEach(gallery => {
                initAutoScrollGallery(gallery, 0.5);
            });
        }
    };

    return {
        init
    };
})();

// Module for ripple effect on buttons
const rippleEffect = (() => {
    const init = () => {
        document.querySelectorAll('.contact-button, .nav-link').forEach(button => {
            button.addEventListener('click', addRippleEffect);
        });
    };

    const addRippleEffect = function(e) {
        if (this.tagName === 'A' && this.href && !this.href.includes('#')) {
            return;
        }

        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    };

    return {
        init
    };
})();

// Module for typing effect on profile name
const typingEffect = (() => {
    const init = () => {
        const profileName = document.querySelector('#index-page .profile-name');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (profileName && (currentPage === '' || currentPage === 'index.html')) {
            const fullText = profileName.textContent;
            profileName.style.width = profileName.offsetWidth + 'px';
            profileName.textContent = '';

            let index = 0;
            const typeText = () => {
                if (index < fullText.length) {
                    profileName.textContent += fullText.charAt(index);
                    index++;
                    setTimeout(typeText, 100);
                }
            };
            setTimeout(typeText, 500);
        }
    };

    return {
        init
    };
})();


// Technology descriptions for the info modal
const techDescriptions = {
    'Python': 'A versatile, high-level programming language known for its readability and broad ecosystem. Widely used in AI/ML, web development, data science, and automation.',
    'Java': 'A robust, object-oriented programming language designed for cross-platform compatibility. Popular for enterprise applications, Android development, and large-scale systems.',
    'JavaScript': 'The language of the web, enabling interactive and dynamic content in browsers. Also used server-side with Node.js for full-stack development.',
    'C': 'A foundational low-level programming language offering direct memory access and high performance. Essential for system programming, embedded systems, and performance-critical applications.',
    'React': 'A popular JavaScript library for building user interfaces with reusable components. Created by Facebook, it uses a virtual DOM for efficient updates and supports modern web development patterns.',
    'Node.js': 'A JavaScript runtime built on Chrome\'s V8 engine that enables server-side JavaScript execution. Great for building scalable network applications and APIs.',
    'TypeScript': 'A typed superset of JavaScript that compiles to plain JavaScript. Adds static typing, interfaces, and better tooling support for large-scale applications.',
    'CSS': 'Cascading Style Sheets - the styling language for the web. Controls layout, colors, fonts, and responsive design for HTML documents.',
    'AWS': 'Amazon Web Services - a comprehensive cloud computing platform offering 200+ services including compute, storage, databases, and AI/ML tools.',
    'Git': 'A distributed version control system for tracking code changes and collaborating with teams. The industry standard for source code management.',
    'Linux': 'An open-source operating system kernel powering servers, supercomputers, and embedded devices worldwide. Known for stability, security, and flexibility.',
    'Bash': 'The Bourne Again SHell - a command-line interpreter for Unix/Linux systems. Essential for scripting, automation, and system administration.',
    'PyTorch': 'An open-source deep learning framework known for its dynamic computation graphs and Pythonic interface. Popular in research and production AI systems.',
    'TensorFlow': 'Google\'s open-source machine learning framework for building and deploying ML models. Supports both research prototyping and production deployment at scale.',
    'Hugging Face': 'A platform and library ecosystem for state-of-the-art NLP and ML models. Provides pre-trained models, datasets, and tools for the ML community.',
    'CNNs': 'Convolutional Neural Networks - deep learning architectures specialized for processing grid-like data such as images. The backbone of modern computer vision.',
    'Transformers': 'A revolutionary neural network architecture using self-attention mechanisms. The foundation of modern NLP models like BERT, GPT, and LLMs.',
    'LLMs': 'Large Language Models - AI systems trained on massive text datasets to understand and generate human-like text. Powers chatbots, code assistants, and content generation.',
    'Computer Vision': 'AI field enabling machines to interpret and understand visual information from the world. Applications include image recognition, object detection, and autonomous vehicles.',
    'YOLO': 'You Only Look Once - a real-time object detection algorithm known for its speed and accuracy. Processes images in a single forward pass through the network.',
    'OpenCV': 'Open Source Computer Vision Library - a comprehensive toolkit for image and video processing. Supports real-time applications with optimized algorithms.',
    'LangChain': 'A framework for building applications with LLMs. Provides tools for prompt management, chains, agents, and integration with various data sources.',
    'LangGraph': 'An extension of LangChain for building stateful, multi-actor applications with LLMs. Enables complex agent workflows and decision graphs.',
    'LlamaIndex': 'A data framework for LLM applications. Specializes in connecting custom data sources to large language models for retrieval-augmented generation.',
    'OpenAI API': 'The API for accessing OpenAI\'s powerful language models including GPT-4. Enables text generation, code completion, image generation, and more.',
    'Anthropic Claude': 'An AI assistant built by Anthropic focused on being helpful, harmless, and honest. Known for nuanced reasoning and following complex instructions.',
    'CrewAI': 'A framework for orchestrating role-playing AI agents. Enables building multi-agent systems where agents collaborate to accomplish complex tasks.',
    'AutoGen': 'Microsoft\'s framework for building multi-agent conversational AI systems. Supports customizable agents that can converse, execute code, and collaborate.'
};

// Module for tech item info modal
const techItemHandler = (() => {
    const techInfoModal = document.getElementById('techInfoModal');
    const techModalTitle = document.getElementById('techModalTitle');
    const techModalIcon = document.getElementById('techModalIcon');
    const techModalDescription = document.getElementById('techModalDescription');
    const techModalDocLink = document.getElementById('techModalDocLink');
    const techInfoModalCloseBtn = techInfoModal ? techInfoModal.querySelector('.close-button') : null;
    const body = document.body;

    const init = () => {
        if (techInfoModal && techModalTitle && techModalDescription && techModalDocLink && techInfoModalCloseBtn) {
            document.querySelectorAll('.tech-item[data-doc-link]').forEach(item => {
                item.addEventListener('click', openTechModal);
            });
            techInfoModalCloseBtn.addEventListener('click', closeTechModal);
            techInfoModal.addEventListener('click', handleOutsideClick);
            document.addEventListener('keydown', handleEscapeKey);
        }
    };

    const openTechModal = (e) => {
        const item = e.currentTarget;
        const techName = item.getAttribute('data-tech');
        const docLink = item.getAttribute('data-doc-link');
        
        // Get icon - either an image or emoji text
        const iconImg = item.querySelector('img');
        const iconText = item.querySelector('.tech-icon-text');
        
        if (iconImg) {
            techModalIcon.innerHTML = `<img src="${iconImg.src}" alt="${techName}">`;
        } else if (iconText) {
            techModalIcon.innerHTML = `<span class="tech-icon-emoji">${iconText.textContent}</span>`;
        }
        
        techModalTitle.textContent = techName;
        techModalDescription.textContent = techDescriptions[techName] || `${techName} is a technology used in modern software development.`;
        techModalDocLink.href = docLink;
        
        techInfoModal.style.display = 'flex';
        techInfoModal.classList.add('active');
        body.classList.add('modal-open');
    };

    const closeTechModal = () => {
        techInfoModal.classList.remove('active');
        setTimeout(() => {
            techInfoModal.style.display = 'none';
            body.classList.remove('modal-open');
        }, 300);
    };

    const handleOutsideClick = (e) => {
        if (e.target === techInfoModal) {
            closeTechModal();
        }
    };

    const handleEscapeKey = (e) => {
        if (e.key === "Escape" && techInfoModal.classList.contains('active')) {
            closeTechModal();
        }
    };

    return {
        init
    };
})();

// Initialize all modules when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    mobileMenuHandler.init();
    navigationHandler.init();
    imageModalHandler.init();
    projectDetailModalHandler.init();
    animationObserver.init();
    horizontalGalleryHandler.init();
    rippleEffect.init();
    typingEffect.init();
    techItemHandler.init();
});
