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

    const mobileMenuBtnSidebar = document.querySelector('.mobile-menu-btn');
    mobileMenuBtnSidebar?.addEventListener('click', openMobileSidebar);
    mobileSidebarClose?.addEventListener('click', closeMobileSidebar);
    mobileSidebarOverlay?.addEventListener('click', closeMobileSidebar);

    // ====================================
    // FEEDBACK SYSTEM - Editorial Comments
    // ====================================
    
    // Configuration
    const FEEDBACK_CONFIG = {
        passphrase: 'userology2025',
        authorEmail: 'anurag@userology.co',
        highlightColor: '#FEF3C7',
        keyboardShortcut: 'F'
    };

    // State
    let feedbackModeActive = false;
    let feedbackData = {};
    let currentArticle = window.location.pathname.split('/').pop();

    // Load feedback data
    async function loadFeedbackData() {
        try {
            // First, load from localStorage (imported data)
            const localData = localStorage.getItem('imported_feedback_cache');
            let mergedData = {};
            
            if (localData) {
                try {
                    mergedData = JSON.parse(localData);
                } catch (e) {
                    console.error('Error parsing local feedback data', e);
                }
            }

            // Then fetch server data and merge
            const response = await fetch('feedback.json?t=' + new Date().getTime());
            if (response.ok) {
                const serverData = await response.json();
                delete serverData._meta; // Remove metadata
                
                // Merge logic: server data takes precedence for same IDs, but we keep local additions
                Object.keys(serverData).forEach(key => {
                    if (!mergedData[key]) {
                        mergedData[key] = [];
                    }
                    
                    const existingIds = new Set(mergedData[key].map(f => f.id));
                    serverData[key].forEach(item => {
                        if (!existingIds.has(item.id)) {
                            mergedData[key].push(item);
                        } else {
                            // Update existing item
                            const idx = mergedData[key].findIndex(f => f.id === item.id);
                            if (idx !== -1) mergedData[key][idx] = item;
                        }
                    });
                });
            }
            
            feedbackData = mergedData;
        } catch (err) {
            console.log('No feedback data available or error loading', err);
            // Fallback to local data if server fetch fails
            const localData = localStorage.getItem('imported_feedback_cache');
            if (localData) {
                feedbackData = JSON.parse(localData);
            } else {
            feedbackData = {};
            }
        }
    }

    // Check if feedback mode is enabled
    function isFeedbackModeEnabled() {
        return localStorage.getItem('feedbackModeEnabled') === 'true';
    }

    // Passphrase prompt
    function promptPassphrase() {
        const modal = document.createElement('div');
        modal.className = 'feedback-passphrase-modal';
        modal.innerHTML = `
            <div class="feedback-passphrase-content">
                <h3>🔒 Feedback Mode</h3>
                <p>Enter passphrase to activate editorial feedback:</p>
                <input type="password" class="feedback-passphrase-input" placeholder="Enter passphrase">
                <div class="feedback-passphrase-error"></div>
                <div class="feedback-passphrase-buttons">
                    <button class="feedback-passphrase-cancel">Cancel</button>
                    <button class="feedback-passphrase-submit">Activate</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const input = modal.querySelector('.feedback-passphrase-input');
        const errorDiv = modal.querySelector('.feedback-passphrase-error');
        const submitBtn = modal.querySelector('.feedback-passphrase-submit');
        const cancelBtn = modal.querySelector('.feedback-passphrase-cancel');

        input.focus();

        function checkPassphrase() {
            const value = input.value;
            if (value === FEEDBACK_CONFIG.passphrase) {
                localStorage.setItem('feedbackModeEnabled', 'true');
                modal.remove();
                activateFeedbackMode();
            } else {
                errorDiv.textContent = 'Incorrect passphrase';
                input.value = '';
                input.focus();
            }
        }

        submitBtn.addEventListener('click', checkPassphrase);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkPassphrase();
            }
        });

        cancelBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Toggle feedback mode
    function toggleFeedbackMode() {
        if (!isFeedbackModeEnabled()) {
            promptPassphrase();
        } else {
            if (feedbackModeActive) {
                deactivateFeedbackMode();
            } else {
                activateFeedbackMode();
            }
        }
    }

    // Activate feedback mode
    async function activateFeedbackMode() {
        feedbackModeActive = true;
        await loadFeedbackData();
        
        // Show feedback mode badge
        let badge = document.querySelector('.feedback-mode-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'feedback-mode-badge';
            badge.innerHTML = '🔧 Feedback Mode <button class="feedback-mode-close">&times;</button>';
            document.body.appendChild(badge);

            badge.querySelector('.feedback-mode-close').addEventListener('click', toggleFeedbackMode);
        }
        badge.style.display = 'flex';

        // Show export button
        let exportBtn = document.querySelector('.feedback-export-btn');
        if (!exportBtn) {
            exportBtn = document.createElement('button');
            exportBtn.className = 'feedback-export-btn';
            exportBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export Feedback
            `;
            document.body.appendChild(exportBtn);
            exportBtn.addEventListener('click', exportFeedbackData);
        }
        exportBtn.style.display = 'flex';

        // Show import button
        let importBtn = document.querySelector('.feedback-import-btn');
        if (!importBtn) {
            importBtn = document.createElement('button');
            importBtn.className = 'feedback-import-btn';
            importBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Import Feedback
            `;
            document.body.appendChild(importBtn);
            importBtn.addEventListener('click', importFeedbackData);
        }
        importBtn.style.display = 'flex';

        // Render highlights
        renderHighlights();

        // Enable text selection
        enableTextSelection();

        console.log('Feedback mode activated');
    }

    // Deactivate feedback mode
    function deactivateFeedbackMode() {
        feedbackModeActive = false;

        // Hide badge and export button
        const badge = document.querySelector('.feedback-mode-badge');
        const exportBtn = document.querySelector('.feedback-export-btn');
        const importBtn = document.querySelector('.feedback-import-btn');
        if (badge) badge.style.display = 'none';
        if (exportBtn) exportBtn.style.display = 'none';
        if (importBtn) importBtn.style.display = 'none';

        // Remove all highlights
        document.querySelectorAll('.feedback-highlight').forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });

        // Remove tooltip
        const tooltip = document.querySelector('.feedback-selection-tooltip');
        if (tooltip) tooltip.remove();

        // Disable text selection
        disableTextSelection();

        console.log('Feedback mode deactivated');
    }

    // Text selection handling
    let selectionHandler = null;

    function enableTextSelection() {
        const articleContent = document.querySelector('.article-content');
        if (!articleContent) return;

        selectionHandler = function(e) {
            // Small delay to ensure selection is complete
            setTimeout(() => {
                const selection = window.getSelection();
                const selectedText = selection.toString().trim();

                if (selectedText.length > 0 && selectedText.length < 500) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    
                    showSelectionTooltip(rect, selectedText, selection, range);
                } else {
                    hideSelectionTooltip();
                }
            }, 10);
        };

        articleContent.addEventListener('mouseup', selectionHandler);
    }

    function disableTextSelection() {
        const articleContent = document.querySelector('.article-content');
        if (articleContent && selectionHandler) {
            articleContent.removeEventListener('mouseup', selectionHandler);
        }
    }

    function showSelectionTooltip(rect, selectedText, selection, range) {
        hideSelectionTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'feedback-selection-tooltip';
        tooltip.innerHTML = `
            <button class="feedback-add-comment-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Add Feedback
            </button>
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;
        
        tooltip.style.position = 'absolute';
        tooltip.style.left = (rect.left + scrollX + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.top + scrollY - tooltip.offsetHeight - 8) + 'px';

        // Add click handler
        tooltip.querySelector('.feedback-add-comment-btn').addEventListener('click', () => {
            openCommentModal(selectedText);
            selection.removeAllRanges();
            hideSelectionTooltip();
        });

        // Hide on click outside
        setTimeout(() => {
            document.addEventListener('click', function hideOnClick(e) {
                if (!tooltip.contains(e.target)) {
                    hideSelectionTooltip();
                    document.removeEventListener('click', hideOnClick);
                }
            });
        }, 100);
    }

    function hideSelectionTooltip() {
        const tooltip = document.querySelector('.feedback-selection-tooltip');
        if (tooltip) tooltip.remove();
    }

    // Helper function to normalize text for comparison
    function normalizeText(text) {
        return text
            .replace(/\s+/g, ' ')           // Collapse all whitespace to single space
            .replace(/[\u00A0]/g, ' ')      // Replace non-breaking spaces
            .trim();                        // Remove leading/trailing whitespace
    }

    // Helper function to create position mapping between original and normalized text
    function createPositionMap(originalText) {
        const normalized = normalizeText(originalText);
        const map = []; // Maps normalized position to original position
        let normPos = 0;
        let origPos = 0;

        while (origPos < originalText.length) {
            const char = originalText[origPos];

            if (/\s/.test(char)) {
                // Whitespace in original - may collapse in normalized
                const wsStart = origPos;
                while (origPos < originalText.length && /\s/.test(originalText[origPos])) {
                    origPos++;
                }
                // All whitespace maps to single space in normalized
                if (normPos < normalized.length && normalized[normPos] === ' ') {
                    map[normPos] = { start: wsStart, end: origPos, isWhitespace: true };
                    normPos++;
                }
            } else {
                // Non-whitespace character
                map[normPos] = { start: origPos, end: origPos + 1, isWhitespace: false };
                normPos++;
                origPos++;
            }
        }

        return { normalized, map };
    }

    // Render highlights
    function renderHighlights() {
        const articleContent = document.querySelector('.article-content');
        if (!articleContent) return;

        const articleFeedback = feedbackData[currentArticle] || [];
        const openFeedback = articleFeedback.filter(f => f.status === 'open');

        let successCount = 0;
        let failureCount = 0;
        const failedFeedback = [];

        openFeedback.forEach(feedback => {
            const success = highlightText(articleContent, feedback);
            if (success) {
                successCount++;
            } else {
                failureCount++;
                failedFeedback.push({
                    id: feedback.id,
                    text: feedback.selectedText.substring(0, 50) + '...',
                    comment: feedback.comment.substring(0, 50) + '...'
                });
            }
        });

        // Log failed highlights for debugging
        if (failedFeedback.length > 0) {
            console.warn(`Failed to highlight ${failureCount} feedback items:`, failedFeedback);
        }

        return { successCount, failureCount, failedFeedback };
    }

    function highlightText(container, feedback) {
        const searchText = feedback.selectedText.trim();
        if (!searchText) return false;

        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        let allText = '';
        const nodes = [];
        const nodeOffsets = [];

        // Build text content map
        while (node = walker.nextNode()) {
            nodeOffsets.push(allText.length);
            nodes.push(node);
            allText += node.textContent;
        }

        if (allText.length === 0) return false;

        // Strategy 1: Exact match
        let index = allText.indexOf(searchText);
        let matchLength = searchText.length;

        // Strategy 2: Normalized match with position mapping
        if (index === -1) {
            const normalizedSearch = normalizeText(searchText);
            const { normalized: normalizedAll, map } = createPositionMap(allText);
            const normIndex = normalizedAll.indexOf(normalizedSearch);

            if (normIndex !== -1) {
                // Map normalized position back to original
                const startMapping = map[normIndex];
                const endMapping = map[Math.min(normIndex + normalizedSearch.length - 1, map.length - 1)];

                if (startMapping && endMapping) {
                    index = startMapping.start;
                    matchLength = endMapping.end - startMapping.start;
                }
            }
        }

        // Strategy 3: Partial match on first significant chunk
        if (index === -1 && searchText.length > 50) {
            // Try finding first 50 characters (normalized)
            const partialSearch = normalizeText(searchText.substring(0, 50));
            const { normalized: normalizedAll, map } = createPositionMap(allText);
            const normIndex = normalizedAll.indexOf(partialSearch);

            if (normIndex !== -1) {
                const startMapping = map[normIndex];
                if (startMapping) {
                    index = startMapping.start;
                    // Use approximate length based on ratio
                    const ratio = searchText.length / normalizeText(searchText).length;
                    matchLength = Math.min(
                        Math.round(normalizeText(searchText).length * ratio),
                        allText.length - index
                    );
                }
            }
        }

        // If we found a match, create the highlight
        if (index !== -1) {
            try {
                const range = document.createRange();

                // Find start node
                let startNodeIdx = nodeOffsets.findIndex((offset, i) =>
                    offset <= index && (i === nodeOffsets.length - 1 || nodeOffsets[i+1] > index)
                );

                // Find end node
                let endPos = index + matchLength;
                let endNodeIdx = nodeOffsets.findIndex((offset, i) =>
                    offset <= endPos && (i === nodeOffsets.length - 1 || nodeOffsets[i+1] > endPos)
                );

                if (startNodeIdx !== -1 && endNodeIdx !== -1) {
                    range.setStart(nodes[startNodeIdx], index - nodeOffsets[startNodeIdx]);
                    range.setEnd(nodes[endNodeIdx], Math.min(
                        endPos - nodeOffsets[endNodeIdx],
                        nodes[endNodeIdx].textContent.length
                    ));

                    const mark = document.createElement('mark');
                    mark.className = 'feedback-highlight';
                    mark.dataset.feedbackId = feedback.id;
                    mark.style.backgroundColor = FEEDBACK_CONFIG.highlightColor;

                    const content = range.extractContents();
                    mark.appendChild(content);
                    range.insertNode(mark);

                    // Add click handler
                    mark.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showCommentPopover(mark, feedback);
                    });

                    // Add hover preview
                    mark.title = `💬 ${feedback.comment.substring(0, 100)}${feedback.comment.length > 100 ? '...' : ''}`;

                    return true; // Success
                }
            } catch (err) {
                console.warn('Could not highlight text across nodes:', err);
                // Fallback to simple single-node search
                return simpleHighlightFallback(container, feedback);
            }
        }

        // No match found
        return false;
    }

    function simpleHighlightFallback(container, feedback) {
        const normalizedSearch = normalizeText(feedback.selectedText);
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
        let node;

        while (node = walker.nextNode()) {
            const text = node.textContent;
            const normalizedText = normalizeText(text);

            // Try exact match first
            let index = text.indexOf(feedback.selectedText);

            // Try normalized match
            if (index === -1) {
                const normIndex = normalizedText.indexOf(normalizedSearch);
                if (normIndex !== -1) {
                    // Approximate original position
                    const ratio = text.length / normalizedText.length;
                    index = Math.round(normIndex * ratio);
                }
            }

            if (index !== -1 && index < text.length) {
                try {
                    const range = document.createRange();
                    const matchEnd = Math.min(
                        index + feedback.selectedText.length,
                        text.length
                    );
                    range.setStart(node, index);
                    range.setEnd(node, matchEnd);

                    const mark = document.createElement('mark');
                    mark.className = 'feedback-highlight';
                    mark.dataset.feedbackId = feedback.id;
                    mark.style.backgroundColor = FEEDBACK_CONFIG.highlightColor;

                    range.surroundContents(mark);
                    mark.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showCommentPopover(mark, feedback);
                    });
                    mark.title = `💬 ${feedback.comment.substring(0, 100)}${feedback.comment.length > 100 ? '...' : ''}`;

                    return true; // Success
                } catch (e) {
                    console.warn('Fallback highlight failed:', e);
                }
            }
        }

        return false; // Failed to highlight
    }

    // Comment modal
    function openCommentModal(selectedText) {
        const modal = document.createElement('div');
        modal.className = 'feedback-comment-modal';
        modal.innerHTML = `
            <div class="feedback-comment-content">
                <div class="feedback-comment-header">
                    <h3>Add Feedback</h3>
                    <button class="feedback-comment-close">&times;</button>
                </div>
                <div class="feedback-selected-text">
                    <strong>Selected text:</strong>
                    <p>"${selectedText}"</p>
                </div>
                <textarea class="feedback-comment-textarea" placeholder="Enter your feedback or suggestions..." rows="4"></textarea>
                <div class="feedback-comment-footer">
                    <button class="feedback-comment-cancel">Cancel</button>
                    <button class="feedback-comment-save">Save Feedback</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const textarea = modal.querySelector('.feedback-comment-textarea');
        const saveBtn = modal.querySelector('.feedback-comment-save');
        const cancelBtn = modal.querySelector('.feedback-comment-cancel');
        const closeBtn = modal.querySelector('.feedback-comment-close');

        textarea.focus();

        function closeModal() {
            modal.remove();
        }

        function saveFeedback() {
            const comment = textarea.value.trim();
            if (comment.length === 0) {
                alert('Please enter a comment');
                return;
            }

            // Create feedback object
            const feedback = {
                id: 'fb_' + Date.now(),
                selectedText: selectedText,
                comment: comment,
                author: FEEDBACK_CONFIG.authorEmail,
                createdAt: new Date().toISOString(),
                status: 'open'
            };

            // Add to data
            if (!feedbackData[currentArticle]) {
                feedbackData[currentArticle] = [];
            }
            feedbackData[currentArticle].push(feedback);

            // Re-render highlights
            const articleContent = document.querySelector('.article-content');
            if (articleContent) {
                highlightText(articleContent, feedback);
            }

            closeModal();
            
            // Show success message
            showNotification('Feedback added! Don\'t forget to export and commit changes.', 'success');
        }

        saveBtn.addEventListener('click', saveFeedback);
        cancelBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Comment popover
    function showCommentPopover(highlightElement, feedback) {
        // Remove existing popovers
        document.querySelectorAll('.feedback-comment-popover').forEach(p => p.remove());

        const popover = document.createElement('div');
        popover.className = 'feedback-comment-popover';
        popover.innerHTML = `
            <div class="feedback-popover-header">
                <strong>💬 Feedback</strong>
                <button class="feedback-popover-close">&times;</button>
            </div>
            <div class="feedback-popover-text">"${feedback.selectedText}"</div>
            <div class="feedback-popover-comment">${feedback.comment}</div>
            <div class="feedback-popover-meta">
                <span>${feedback.author}</span>
                <span>${new Date(feedback.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="feedback-popover-actions">
                <button class="feedback-popover-resolve">✓ Resolve</button>
                <button class="feedback-popover-delete">Delete</button>
            </div>
        `;

        document.body.appendChild(popover);

        // Position popover
        const rect = highlightElement.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;

        popover.style.position = 'absolute';
        popover.style.left = (rect.left + scrollX) + 'px';
        popover.style.top = (rect.bottom + scrollY + 8) + 'px';

        // Adjust if off-screen
        setTimeout(() => {
            const popoverRect = popover.getBoundingClientRect();
            if (popoverRect.right > window.innerWidth) {
                popover.style.left = (window.innerWidth - popoverRect.width - 20 + scrollX) + 'px';
            }
        }, 0);

        // Event handlers
        popover.querySelector('.feedback-popover-close').addEventListener('click', () => {
            popover.remove();
        });

        popover.querySelector('.feedback-popover-resolve').addEventListener('click', () => {
            resolveFeedback(feedback.id);
            popover.remove();
        });

        popover.querySelector('.feedback-popover-delete').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this feedback?')) {
                deleteFeedback(feedback.id);
                popover.remove();
            }
        });

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closePopover(e) {
                if (!popover.contains(e.target) && !highlightElement.contains(e.target)) {
                    popover.remove();
                    document.removeEventListener('click', closePopover);
                }
            });
        }, 100);
    }

    // Resolve feedback
    function resolveFeedback(feedbackId) {
        const articleFeedback = feedbackData[currentArticle] || [];
        const feedback = articleFeedback.find(f => f.id === feedbackId);
        
        if (feedback) {
            feedback.status = 'resolved';
            
            // Remove highlight
            const highlight = document.querySelector(`[data-feedback-id="${feedbackId}"]`);
            if (highlight) {
                const parent = highlight.parentNode;
                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                parent.normalize();
            }

            showNotification('Feedback resolved! Don\'t forget to export changes.', 'success');
        }
    }

    // Delete feedback
    function deleteFeedback(feedbackId) {
        const articleFeedback = feedbackData[currentArticle] || [];
        const index = articleFeedback.findIndex(f => f.id === feedbackId);
        
        if (index !== -1) {
            articleFeedback.splice(index, 1);
            
            // Remove highlight
            const highlight = document.querySelector(`[data-feedback-id="${feedbackId}"]`);
            if (highlight) {
                const parent = highlight.parentNode;
                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                parent.normalize();
            }

            showNotification('Feedback deleted! Don\'t forget to export changes.', 'warning');
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `feedback-notification feedback-notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Import feedback data
    function importFeedbackData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    // Basic validation
                    if (typeof data === 'object') {
                        // Merge with existing feedback
                        // Remove metadata from import if present
                        if (data._meta) delete data._meta;
                        
                        // Merge logic: Add imported feedback to current state
                        let updatedPages = [];
                        Object.keys(data).forEach(key => {
                            if (!feedbackData[key]) {
                                feedbackData[key] = [];
                            }
                            
                            // Add only unique feedback (by ID)
                            const existingIds = new Set(feedbackData[key].map(f => f.id));
                            let hasNewItems = false;
                            
                            data[key].forEach(item => {
                                if (!existingIds.has(item.id)) {
                                    feedbackData[key].push(item);
                                    hasNewItems = true;
                                }
                            });
                            
                            if (hasNewItems) {
                                updatedPages.push(key);
                            }
                        });
                        
                        // Save to localStorage for persistence
                        localStorage.setItem('imported_feedback_cache', JSON.stringify(feedbackData));

                        // Re-render highlights and log results
                        const highlightResults = renderHighlights();

                        // Log highlight results to console
                        if (highlightResults && highlightResults.successCount > 0) {
                            console.log(`Feedback import: ${highlightResults.successCount} highlights applied successfully`);
                        }
                        if (highlightResults && highlightResults.failureCount > 0) {
                            console.warn(`Feedback import: ${highlightResults.failureCount} items could not be highlighted (text may have changed)`);
                        }

                        // Show detailed notification
                        if (updatedPages.length > 0) {
                            const pageList = updatedPages.length > 3
                                ? `${updatedPages.slice(0, 3).join(', ')} and ${updatedPages.length - 3} more`
                                : updatedPages.join(', ');
                            showNotification(`Feedback imported for: ${pageList}. It is now saved to your browser storage.`, 'success');
                        } else {
                            showNotification('Feedback imported! No new unique items found.', 'info');
                        }
                    } else {
                        throw new Error('Invalid JSON structure');
                    }
                } catch (err) {
                    console.error('Import error:', err);
                    showNotification('Failed to import feedback: ' + err.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Export feedback data
    function exportFeedbackData() {
        // Add metadata
        const exportData = {
            _meta: {
                version: '1.0.0',
                lastUpdated: new Date().toISOString(),
                description: 'Editorial feedback for help desk articles. Managed internally by team members.'
            },
            ...feedbackData
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().split('T')[0];
        a.download = `feedback_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Feedback exported! Replace feedback.json with this file and commit to Git.', 'success');
    }

    // Global keyboard shortcut for feedback mode
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === FEEDBACK_CONFIG.keyboardShortcut.toLowerCase()) {
            e.preventDefault();
            toggleFeedbackMode();
        }
    });

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
