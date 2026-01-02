// Userology Help Center - Enhanced Search and Interactivity
document.addEventListener('DOMContentLoaded', function() {
    console.log('Userology Help Center JS loaded successfully');

    // Article data for search (will be populated from page content)
    let articleIndex = [];

    // Pre-built article index for global search
    const globalArticleIndex = [
        { title: "Creating a Study in Userology", href: "article_25457016697629.html", category: "Study Setup" },
        { title: "Configuring the AI Moderator in Userology", href: "article_25562045316637.html", category: "Study Settings" },
        { title: "Configuring Question Probes in Userology", href: "article_25562114444061.html", category: "Study Settings" },
        { title: "Recordings: Review and Manage Your Study Sessions", href: "article_recordings.html", category: "Responses and Recordings" },
        { title: "Overview of Managing Study Respondents in Userology", href: "article_25561689734941.html", category: "Respondent Management" },
        { title: "How to Manage Respondent Participation in Userology Studies", href: "article_25561782334749.html", category: "Respondent Management" },
        { title: "Creating and Managing Quotes in Userology", href: "article_25562126820125.html", category: "Responses and Recordings" },
        { title: "Creating and Downloading Clips, files in Userology", href: "article_25916497212701.html", category: "Responses and Recordings" },
        { title: "Previewing Recorded Responses in Userology", href: "article_25562210431261.html", category: "Responses and Recordings" },
        { title: "Exporting Recorded Responses from Userology", href: "article_25562216141213.html", category: "Responses and Recordings" },
        { title: "AI Synthesis Studio: How to Use It", href: "article_ai_synthesis_studio.html", category: "Results and Reports" },
        { title: "Understanding the Results Section in Userology", href: "article_results_section.html", category: "Results and Reports" },
        { title: "Understanding Qualitative results section in Userology", href: "article_25916667142045.html", category: "Results and Reports" },
        { title: "Understanding the Dashboard in Userology", href: "article_25562265024797.html", category: "Results and Reports" },
        { title: "Viewing AI Summaries in Userology", href: "article_25562272476829.html", category: "Results and Reports" },
        { title: "QnA Results Section in Userology", href: "article_25562947923741.html", category: "Results and Reports" },
        { title: "Managing Tags in Userology", href: "article_25562292368669.html", category: "Results and Reports" },
        { title: "Overview of Advanced Tools in Userology", href: "article_25562312351389.html", category: "Advanced Tools" },
        { title: "Linking Your Study to Respondent Sources", href: "article_25562330763805.html", category: "Advanced Tools" },
        { title: "Sharing Your Study with Others in Userology", href: "article_25562367390237.html", category: "Advanced Tools" },
        { title: "Embedding Userology in Your Website", href: "article_25562389245085.html", category: "Advanced Tools" },
        { title: "Managing Organization and Team Settings in Userology", href: "article_25562407594781.html", category: "Organization & Team" },
        { title: "Team Collaboration and User Roles in Userology", href: "article_25562457277597.html", category: "Organization & Team" },
        { title: "Managing Notifications and Preferences", href: "article_25562483675165.html", category: "Organization & Team" },
        { title: "Userology Billing and Plans", href: "article_25562500326813.html", category: "Billing" },
        { title: "Onboarding with Userology", href: "article_25456988151453.html", category: "Getting Started" },
        { title: "Understanding Userology Basics", href: "article_25457033877533.html", category: "Getting Started" }
    ];

    // Build search index from all article links on the page
    function buildSearchIndex() {
        const allLinks = document.querySelectorAll('a[href^="article_"]');
        const seen = new Set();

        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!seen.has(href)) {
                seen.add(href);
                const title = link.textContent.trim();
                const parent = link.closest('.topic-card, .article-item, .article-card');
                const meta = parent ? (parent.querySelector('.article-meta, .topic-meta')?.textContent || '') : '';

                articleIndex.push({
                    title: title,
                    href: href,
                    meta: meta,
                    searchText: (title + ' ' + meta).toLowerCase()
                });
            }
        });
    }

    // Create search results dropdown
    function createSearchDropdown() {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer) return null;

        let dropdown = searchContainer.querySelector('.search-results');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'search-results';
            searchContainer.appendChild(dropdown);
        }
        return dropdown;
    }

    // Highlight matching text
    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Perform search
    function performSearch(query) {
        const dropdown = createSearchDropdown();
        if (!dropdown) return;

        if (query.length < 2) {
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
            return;
        }

        const queryLower = query.toLowerCase();
        const results = articleIndex.filter(article =>
            article.searchText.includes(queryLower)
        ).slice(0, 8); // Limit to 8 results

        if (results.length === 0) {
            dropdown.innerHTML = '<div class="search-no-results">No articles found for "' + query + '"</div>';
            dropdown.style.display = 'block';
            return;
        }

        dropdown.innerHTML = results.map(article => `
            <a href="${article.href}" class="search-result-item">
                <div class="search-result-content">
                    <div class="search-result-title">${highlightMatch(article.title, query)}</div>
                    ${article.meta ? `<div class="search-result-meta">${article.meta}</div>` : ''}
                </div>
            </a>
        `).join('');
        dropdown.style.display = 'block';
    }

    // Initialize search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        buildSearchIndex();

        let debounceTimer;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                performSearch(e.target.value);
            }, 150);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            const dropdown = document.querySelector('.search-results');
            if (dropdown && !e.target.closest('.search-container')) {
                dropdown.style.display = 'none';
            }
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', function(e) {
            const dropdown = document.querySelector('.search-results');
            if (!dropdown || dropdown.style.display === 'none') return;

            const items = dropdown.querySelectorAll('.search-result-item');
            const activeItem = dropdown.querySelector('.search-result-item.active');
            let activeIndex = Array.from(items).indexOf(activeItem);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (activeItem) activeItem.classList.remove('active');
                activeIndex = (activeIndex + 1) % items.length;
                items[activeIndex]?.classList.add('active');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeItem) activeItem.classList.remove('active');
                activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
                items[activeIndex]?.classList.add('active');
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeItem) {
                    window.location.href = activeItem.getAttribute('href');
                } else if (items.length > 0) {
                    window.location.href = items[0].getAttribute('href');
                }
            } else if (e.key === 'Escape') {
                dropdown.style.display = 'none';
            }
        });
    }

    // Add active class to current page navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Generate Table of Contents for article pages
    function generateTOC() {
        const articleContent = document.querySelector('.article-content');
        const tocContainer = document.querySelector('.toc');

        if (!articleContent || !tocContainer) return;

        const headings = articleContent.querySelectorAll('h2, h3');
        if (headings.length < 2) {
            tocContainer.style.display = 'none';
            return;
        }

        const tocList = document.createElement('ul');
        headings.forEach((heading, index) => {
            // Add ID to heading if not present
            if (!heading.id) {
                heading.id = 'section-' + index;
            }

            const li = document.createElement('li');
            li.className = heading.tagName.toLowerCase() === 'h3' ? 'toc-h3' : 'toc-h2';

            const link = document.createElement('a');
            link.href = '#' + heading.id;
            link.textContent = heading.textContent;
            link.setAttribute('data-target', heading.id);

            li.appendChild(link);
            tocList.appendChild(li);
        });

        tocContainer.appendChild(tocList);

        // Scroll spy for TOC
        const tocLinks = tocContainer.querySelectorAll('a[data-target]');
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -66%',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tocLinks.forEach(link => link.classList.remove('active'));
                    const activeLink = tocContainer.querySelector(`a[data-target="${entry.target.id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        headings.forEach(heading => observer.observe(heading));
    }

    generateTOC();

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('nav-open');
            this.classList.toggle('active');
        });
    }

    // Add loading states for images (with fallback)
    const images = document.querySelectorAll('.article-content img');
    images.forEach(img => {
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
            img.addEventListener('error', function() {
                this.style.opacity = '1';
                this.alt = 'Image not available';
            });
        }
    });

    // Back to Top Button
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        // Show/hide based on scroll position
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // Scroll to top on click
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // NOTE: "/" keyboard shortcut is handled in the global search modal section below

    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Add copy button to code blocks
    const codeBlocks = document.querySelectorAll('.article-content pre');
    codeBlocks.forEach(pre => {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        copyBtn.title = 'Copy code';
        wrapper.appendChild(copyBtn);

        copyBtn.addEventListener('click', async function() {
            const code = pre.querySelector('code') || pre;
            try {
                await navigator.clipboard.writeText(code.textContent);
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });

    // Image lightbox functionality
    const articleImages = document.querySelectorAll('.article-content img');
    articleImages.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function() {
            const overlay = document.createElement('div');
            overlay.className = 'image-lightbox';
            overlay.innerHTML = `
                <div class="lightbox-content">
                    <img src="${this.src}" alt="${this.alt}">
                    <button class="lightbox-close">&times;</button>
                </div>
            `;
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';

            overlay.addEventListener('click', function(e) {
                if (e.target === overlay || e.target.classList.contains('lightbox-close')) {
                    overlay.remove();
                    document.body.style.overflow = '';
                }
            });

            document.addEventListener('keydown', function closeOnEsc(e) {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.body.style.overflow = '';
                    document.removeEventListener('keydown', closeOnEsc);
                }
            });
        });
    });

    // ====================================
    // P0-1: GLOBAL SEARCH MODAL (Cmd+K)
    // ====================================
    function createSearchModal() {
        const modal = document.createElement('div');
        modal.className = 'search-modal-overlay';
        modal.id = 'searchModal';
        modal.innerHTML = `
            <div class="search-modal">
                <div class="search-modal-header">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" class="search-modal-input" placeholder="Search articles..." autofocus>
                    <div class="search-modal-kbd">
                        <kbd>ESC</kbd>
                    </div>
                </div>
                <div class="search-modal-results">
                    <div class="search-modal-section">
                        <div class="search-modal-section-title">Quick Links</div>
                        <a href="index.html" class="search-modal-item">
                            <div class="search-modal-item-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            </div>
                            <div class="search-modal-item-content">
                                <div class="search-modal-item-title">Home</div>
                                <div class="search-modal-item-meta">Go to homepage</div>
                            </div>
                        </a>
                        <a href="categories.html" class="search-modal-item">
                            <div class="search-modal-item-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            </div>
                            <div class="search-modal-item-content">
                                <div class="search-modal-item-title">Browse Topics</div>
                                <div class="search-modal-item-meta">View all categories</div>
                            </div>
                        </a>
                        <a href="videos.html" class="search-modal-item">
                            <div class="search-modal-item-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </div>
                            <div class="search-modal-item-content">
                                <div class="search-modal-item-title">Video Tutorials</div>
                                <div class="search-modal-item-meta">Watch step-by-step guides</div>
                            </div>
                        </a>
                    </div>
                </div>
                <div class="search-modal-footer">
                    <div class="search-modal-hints">
                        <span class="search-modal-hint"><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
                        <span class="search-modal-hint"><kbd>↵</kbd> to select</span>
                        <span class="search-modal-hint"><kbd>esc</kbd> to close</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    function openSearchModal() {
        let modal = document.getElementById('searchModal');
        if (!modal) {
            modal = createSearchModal();
            setupSearchModalEvents(modal);
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const input = modal.querySelector('.search-modal-input');
        input.value = '';
        input.focus();
        renderSearchResults('');
    }

    function closeSearchModal() {
        const modal = document.getElementById('searchModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function highlightSearchMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function renderSearchResults(query) {
        const modal = document.getElementById('searchModal');
        if (!modal) return;

        const resultsContainer = modal.querySelector('.search-modal-results');

        if (!query || query.length < 2) {
            // Show quick links
            resultsContainer.innerHTML = `
                <div class="search-modal-section">
                    <div class="search-modal-section-title">Quick Links</div>
                    <a href="index.html" class="search-modal-item">
                        <div class="search-modal-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        </div>
                        <div class="search-modal-item-content">
                            <div class="search-modal-item-title">Home</div>
                            <div class="search-modal-item-meta">Go to homepage</div>
                        </div>
                    </a>
                    <a href="categories.html" class="search-modal-item">
                        <div class="search-modal-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </div>
                        <div class="search-modal-item-content">
                            <div class="search-modal-item-title">Browse Topics</div>
                            <div class="search-modal-item-meta">View all categories</div>
                        </div>
                    </a>
                    <a href="videos.html" class="search-modal-item">
                        <div class="search-modal-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </div>
                        <div class="search-modal-item-content">
                            <div class="search-modal-item-title">Video Tutorials</div>
                            <div class="search-modal-item-meta">Watch step-by-step guides</div>
                        </div>
                    </a>
                </div>
            `;
            return;
        }

        const queryLower = query.toLowerCase();
        const results = globalArticleIndex.filter(article =>
            article.title.toLowerCase().includes(queryLower) ||
            article.category.toLowerCase().includes(queryLower)
        );

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-modal-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No results found for "${query}"</p>
                    <p style="font-size: 0.85rem; margin-top: 8px;">Try different keywords or browse topics</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="search-modal-section">
                <div class="search-modal-section-title">Articles (${results.length})</div>
                ${results.map(article => `
                    <a href="${article.href}" class="search-modal-item">
                        <div class="search-modal-item-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div class="search-modal-item-content">
                            <div class="search-modal-item-title">${highlightSearchMatch(article.title, query)}</div>
                            <div class="search-modal-item-meta">${article.category}</div>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    }

    function setupSearchModalEvents(modal) {
        const input = modal.querySelector('.search-modal-input');
        let activeIndex = -1;

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeSearchModal();
        });

        // Search input
        input.addEventListener('input', (e) => {
            activeIndex = -1;
            renderSearchResults(e.target.value);
        });

        // Keyboard navigation
        input.addEventListener('keydown', (e) => {
            const items = modal.querySelectorAll('.search-modal-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                items[activeIndex]?.classList.remove('active');
                activeIndex = (activeIndex + 1) % items.length;
                items[activeIndex]?.classList.add('active');
                items[activeIndex]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                items[activeIndex]?.classList.remove('active');
                activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
                items[activeIndex]?.classList.add('active');
                items[activeIndex]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeIndex >= 0 && items[activeIndex]) {
                    window.location.href = items[activeIndex].getAttribute('href');
                } else if (items.length > 0) {
                    window.location.href = items[0].getAttribute('href');
                }
            } else if (e.key === 'Escape') {
                closeSearchModal();
            }
        });
    }

    // Global keyboard shortcut (Cmd+K or Ctrl+K)
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
        if (e.key === '/' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            openSearchModal();
        }
    });

    // Search trigger buttons
    document.querySelectorAll('.search-trigger').forEach(btn => {
        btn.addEventListener('click', openSearchModal);
    });

    // Hero search input - works directly with inline dropdown
    const heroSearchInput = document.getElementById('searchInput');
    console.log('Hero search input element:', heroSearchInput);
    if (heroSearchInput) {
        console.log('Hero search input found, setting up dropdown');
        // Create inline search dropdown for hero search
        const searchContainer = heroSearchInput.closest('.search-container');
        if (searchContainer) {
            let heroDropdown = document.createElement('div');
            heroDropdown.className = 'hero-search-dropdown';
            searchContainer.appendChild(heroDropdown);
            console.log('Hero dropdown created and appended');

            // Search function for hero input
            function performHeroSearch(query) {
                if (query.length < 2) {
                    heroDropdown.innerHTML = '';
                    heroDropdown.style.display = 'none';
                    return;
                }

                const queryLower = query.toLowerCase();
                const results = globalArticleIndex.filter(article =>
                    article.title.toLowerCase().includes(queryLower) ||
                    article.category.toLowerCase().includes(queryLower)
                ).slice(0, 8);

                if (results.length === 0) {
                    heroDropdown.innerHTML = '<div class="hero-search-no-results">No articles found for "' + query + '"</div>';
                    heroDropdown.style.display = 'block';
                    return;
                }

                heroDropdown.innerHTML = results.map(article => `
                    <a href="${article.href}" class="hero-search-item">
                        <div class="hero-search-title">${article.title}</div>
                        <div class="hero-search-meta">${article.category}</div>
                    </a>
                `).join('');
                heroDropdown.style.display = 'block';
            }

            // Input event
            heroSearchInput.addEventListener('input', function(e) {
                console.log('Hero search input event:', e.target.value);
                performHeroSearch(e.target.value);
            });

            // Focus event for debugging
            heroSearchInput.addEventListener('focus', function() {
                console.log('Hero search input focused');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.search-container')) {
                    heroDropdown.style.display = 'none';
                }
            });

            // Keyboard navigation
            heroSearchInput.addEventListener('keydown', function(e) {
                const items = heroDropdown.querySelectorAll('.hero-search-item');
                const activeItem = heroDropdown.querySelector('.hero-search-item.active');
                let activeIndex = Array.from(items).indexOf(activeItem);

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (activeItem) activeItem.classList.remove('active');
                    activeIndex = (activeIndex + 1) % items.length;
                    items[activeIndex]?.classList.add('active');
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (activeItem) activeItem.classList.remove('active');
                    activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
                    items[activeIndex]?.classList.add('active');
                } else if (e.key === 'Enter' && activeIndex >= 0) {
                    e.preventDefault();
                    window.location.href = items[activeIndex].getAttribute('href');
                } else if (e.key === 'Escape') {
                    heroDropdown.style.display = 'none';
                    heroSearchInput.blur();
                }
            });
        }
    }

    // ====================================
    // P0-2: WAS THIS HELPFUL? FEEDBACK
    // ====================================
    const feedbackBtns = document.querySelectorAll('.feedback-btn');
    feedbackBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const feedback = this.closest('.article-feedback');
            const isHelpful = this.dataset.feedback === 'yes';

            // Mark as selected
            feedbackBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');

            // Show thank you or feedback form
            const thanks = feedback.querySelector('.feedback-thanks');
            const form = feedback.querySelector('.feedback-form');

            if (isHelpful) {
                thanks.classList.add('show');
                form?.classList.remove('show');
            } else {
                form?.classList.add('show');
                thanks.classList.remove('show');
            }
        });
    });

    const feedbackSubmit = document.querySelector('.feedback-submit');
    if (feedbackSubmit) {
        feedbackSubmit.addEventListener('click', function() {
            const feedback = this.closest('.article-feedback');
            const textarea = feedback.querySelector('.feedback-textarea');
            const form = feedback.querySelector('.feedback-form');
            const thanks = feedback.querySelector('.feedback-thanks');

            // In a real implementation, send feedback to server
            console.log('Feedback submitted:', textarea?.value);

            form?.classList.remove('show');
            thanks.textContent = 'Thank you for your feedback! We\'ll use it to improve our documentation.';
            thanks.classList.add('show');
        });
    }

    // ====================================
    // P1-4: DARK MODE TOGGLE
    // ====================================
    function getThemePreference() {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // Initialize theme
    setTheme(getThemePreference());

    // Theme toggle button
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // ====================================
    // P1-5: MOBILE SIDEBAR
    // ====================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileSidebar = document.querySelector('.mobile-sidebar');
    const mobileSidebarOverlay = document.querySelector('.mobile-sidebar-overlay');
    const mobileSidebarClose = document.querySelector('.mobile-sidebar-close');

    function openMobileSidebar() {
        mobileSidebar?.classList.add('active');
        mobileSidebarOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileSidebar() {
        mobileSidebar?.classList.remove('active');
        mobileSidebarOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    mobileMenuBtn?.addEventListener('click', openMobileSidebar);
    mobileSidebarClose?.addEventListener('click', closeMobileSidebar);
    mobileSidebarOverlay?.addEventListener('click', closeMobileSidebar);

    // ====================================
    // ALL ARTICLES PAGE - Search, Filter, Sort
    // ====================================
    const articlesSearchInput = document.getElementById('articlesSearchInput');
    const articlesSortSelect = document.getElementById('articlesSortSelect');
    const articlesGrid = document.getElementById('articlesGrid');
    const articlesCount = document.getElementById('articlesCount');
    const noResults = document.getElementById('noResults');
    const filterTabs = document.querySelectorAll('.filter-tab');

    console.log('Articles page elements:', {
        articlesSearchInput: articlesSearchInput,
        articlesGrid: articlesGrid,
        filterTabs: filterTabs.length
    });

    if (articlesGrid && articlesSearchInput) {
        console.log('Articles search initialized');
        let currentFilter = 'all';
        let currentSearch = '';

        // Get all article cards
        function getArticleCards() {
            return Array.from(articlesGrid.querySelectorAll('.article-card-enhanced'));
        }

        // Filter and search articles
        function filterAndSearchArticles() {
            const cards = getArticleCards();
            let visibleCount = 0;

            cards.forEach(card => {
                const title = card.dataset.title?.toLowerCase() || '';
                const category = card.dataset.category?.toLowerCase() || '';
                const searchText = (title + ' ' + category).toLowerCase();

                // Check filter match
                let filterMatch = currentFilter === 'all';
                if (!filterMatch) {
                    filterMatch = category.includes(currentFilter.toLowerCase());
                }

                // Check search match
                let searchMatch = currentSearch === '' || searchText.includes(currentSearch.toLowerCase());

                // Show/hide card
                if (filterMatch && searchMatch) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Update count and no results message
            if (articlesCount) {
                articlesCount.textContent = visibleCount;
            }

            if (noResults) {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }

            if (articlesGrid) {
                articlesGrid.style.display = visibleCount === 0 ? 'none' : '';
            }
        }

        // Sort articles
        function sortArticles(sortBy) {
            const cards = getArticleCards();
            const parent = articlesGrid;

            cards.sort((a, b) => {
                const titleA = a.dataset.title || '';
                const titleB = b.dataset.title || '';
                const categoryA = a.dataset.category || '';
                const categoryB = b.dataset.category || '';

                switch (sortBy) {
                    case 'title-asc':
                        return titleA.localeCompare(titleB);
                    case 'title-desc':
                        return titleB.localeCompare(titleA);
                    case 'category':
                        return categoryA.localeCompare(categoryB) || titleA.localeCompare(titleB);
                    default:
                        return 0;
                }
            });

            // Re-append sorted cards
            cards.forEach(card => parent.appendChild(card));
        }

        // Search input handler
        articlesSearchInput.addEventListener('input', function(e) {
            console.log('Articles search input event:', e.target.value);
            currentSearch = e.target.value.trim();
            filterAndSearchArticles();
        });

        // Sort select handler
        if (articlesSortSelect) {
            articlesSortSelect.addEventListener('change', function(e) {
                sortArticles(e.target.value);
                filterAndSearchArticles();
            });
        }

        // Filter tab handlers
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Update active state
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Apply filter
                currentFilter = this.dataset.category;
                filterAndSearchArticles();
            });
        });

        // Initial sort
        sortArticles('title-asc');
    }

    // ====================================
    // VIDEOS PAGE - Search, Filter, Sort
    // ====================================
    const videosSearchInput = document.getElementById('videosSearchInput');
    const videosSortSelect = document.getElementById('videosSortSelect');
    const videosGrid = document.getElementById('videosGrid');
    const videosCount = document.getElementById('videosCount');
    const noVideosResults = document.getElementById('noVideosResults');
    const videoFilterTabs = document.querySelectorAll('.video-filter-tab');

    console.log('Videos page elements:', {
        videosSearchInput: videosSearchInput,
        videosGrid: videosGrid,
        videoFilterTabs: videoFilterTabs.length
    });

    if (videosGrid && videosSearchInput) {
        console.log('Videos search initialized');
        let currentVideoFilter = 'all';
        let currentVideoSearch = '';

        // Get all video cards
        function getVideoCards() {
            return Array.from(videosGrid.querySelectorAll('.video-card-enhanced'));
        }

        // Filter and search videos
        function filterAndSearchVideos() {
            const cards = getVideoCards();
            let visibleCount = 0;

            cards.forEach(card => {
                const title = card.dataset.title?.toLowerCase() || '';
                const category = card.dataset.category?.toLowerCase() || '';
                const searchText = (title + ' ' + category).toLowerCase();

                // Check filter match
                let filterMatch = currentVideoFilter === 'all';
                if (!filterMatch) {
                    filterMatch = category.includes(currentVideoFilter.toLowerCase());
                }

                // Check search match
                let searchMatch = currentVideoSearch === '' || searchText.includes(currentVideoSearch.toLowerCase());

                // Show/hide card
                if (filterMatch && searchMatch) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Update count and no results message
            if (videosCount) {
                videosCount.textContent = visibleCount;
            }

            if (noVideosResults) {
                noVideosResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }

            if (videosGrid) {
                videosGrid.style.display = visibleCount === 0 ? 'none' : '';
            }
        }

        // Sort videos
        function sortVideos(sortBy) {
            const cards = getVideoCards();
            const parent = videosGrid;

            cards.sort((a, b) => {
                const titleA = a.dataset.title || '';
                const titleB = b.dataset.title || '';
                const categoryA = a.dataset.category || '';
                const categoryB = b.dataset.category || '';

                switch (sortBy) {
                    case 'title-asc':
                        return titleA.localeCompare(titleB);
                    case 'title-desc':
                        return titleB.localeCompare(titleA);
                    case 'category':
                        return categoryA.localeCompare(categoryB) || titleA.localeCompare(titleB);
                    default:
                        return 0;
                }
            });

            // Re-append sorted cards
            cards.forEach(card => parent.appendChild(card));
        }

        // Search input handler
        videosSearchInput.addEventListener('input', function(e) {
            console.log('Videos search input event:', e.target.value);
            currentVideoSearch = e.target.value.trim();
            filterAndSearchVideos();
        });

        // Sort select handler
        if (videosSortSelect) {
            videosSortSelect.addEventListener('change', function(e) {
                sortVideos(e.target.value);
                filterAndSearchVideos();
            });
        }

        // Filter tab handlers
        videoFilterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Update active state
                videoFilterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Apply filter
                currentVideoFilter = this.dataset.category;
                filterAndSearchVideos();
            });
        });

        // Initial sort
        sortVideos('title-asc');
    }
});
