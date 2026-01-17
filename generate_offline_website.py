#!/usr/bin/env python3
"""
Offline Zendesk Help Center Website Generator
Creates a static HTML website from exported Zendesk data
"""

import json
import os
import re
from datetime import datetime
from urllib.parse import urlparse

class OfflineWebsiteGenerator:
    def __init__(self, export_dir="zendesk_export_userology"):
        self.export_dir = export_dir
        self.output_dir = "offline_help_center"
        self.attachments_dir = f"{export_dir}/attachments"
        
        # Load data
        self.categories = self.load_json("categories.json")
        self.sections = self.load_json("sections.json")
        self.articles = self.load_json("articles.json")
        self.manifest = self.load_json("manifest.json")
        
        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(f"{self.output_dir}/css", exist_ok=True)
        os.makedirs(f"{self.output_dir}/js", exist_ok=True)
        os.makedirs(f"{self.output_dir}/attachments", exist_ok=True)
        
        # Set up session for downloading
        import requests
        self.session = requests.Session()
        
        # Copy attachments
        self.copy_attachments()
        
        # Create mappings for easy lookup
        self.sections_by_category = {}
        self.articles_by_section = {}
        
        for section in self.sections:
            cat_id = section['category_id']
            if cat_id not in self.sections_by_category:
                self.sections_by_category[cat_id] = []
            self.sections_by_category[cat_id].append(section)
            
            section_id = section['id']
            self.articles_by_section[section_id] = []
        
        for article in self.articles:
            section_id = article['section_id']
            if section_id in self.articles_by_section:
                self.articles_by_section[section_id].append(article)

    def load_json(self, filename):
        """Load JSON data from export directory"""
        with open(f"{self.export_dir}/{filename}", 'r', encoding='utf-8') as f:
            return json.load(f)

    def copy_attachments(self):
        """Copy attachments to output directory"""
        import shutil
        if os.path.exists(self.attachments_dir):
            for filename in os.listdir(self.attachments_dir):
                src = os.path.join(self.attachments_dir, filename)
                dst = os.path.join(self.output_dir, "attachments", filename)
                shutil.copy2(src, dst)

    def fix_image_urls(self, html_content):
        """Replace Zendesk image URLs with local paths and fix YouTube embeds"""
        # Pattern to match Zendesk article attachment URLs
        pattern = r'https://support\.userology\.co/hc/article_attachments/(\d+)'
        
        def replace_url(match):
            attachment_id = match.group(1)
            # Find the corresponding local file
            for article in self.articles:
                if 'downloaded_attachments' in article:
                    for attachment in article['downloaded_attachments']:
                        if attachment_id in attachment.get('original_url', ''):
                            return f"attachments/{attachment['filename']}"
            return match.group(0)  # Return original if not found
        
        # Fix image URLs
        html_content = re.sub(pattern, replace_url, html_content)
        
        # Fix YouTube iframe URLs to use HTTPS
        youtube_pattern = r'src="//www\.youtube-nocookie\.com/embed/'
        html_content = re.sub(youtube_pattern, 'src="https://www.youtube-nocookie.com/embed/', html_content)
        
        # Also fix any other protocol-relative URLs
        protocol_pattern = r'src="//'
        html_content = re.sub(protocol_pattern, 'src="https://', html_content)
        
        # Wrap YouTube iframes in responsive containers
        youtube_iframe_pattern = r'<iframe[^>]*src="https://www\.youtube-nocookie\.com/embed/[^"]*"[^>]*></iframe>'
        def wrap_youtube_iframe(match):
            iframe_html = match.group(0)
            return f'<div class="youtube-container">{iframe_html}</div>'
        
        html_content = re.sub(youtube_iframe_pattern, wrap_youtube_iframe, html_content)
        
        return html_content

    def extract_attachments_from_html(self, html_content, article_id):
        """Extract attachment URLs from HTML content"""
        # Pattern to match Zendesk article attachment URLs
        pattern = r'https://support\.userology\.co/hc/article_attachments/(\d+)'
        matches = re.findall(pattern, html_content)
        
        attachments = []
        seen_attachments = set()  # Track already processed attachments
        
        for i, attachment_id in enumerate(matches):
            if attachment_id in seen_attachments:
                continue
            seen_attachments.add(attachment_id)
                
            attachment_url = f"https://support.userology.co/hc/article_attachments/{attachment_id}"
            
            # Try to get the original filename from the HTML
            img_pattern = rf'<img[^>]*src="{re.escape(attachment_url)}"[^>]*alt="([^"]*)"'
            img_match = re.search(img_pattern, html_content)
            if img_match:
                original_filename = img_match.group(1)
            else:
                # Try to get filename from title attribute
                title_pattern = rf'<img[^>]*src="{re.escape(attachment_url)}"[^>]*title="([^"]*)"'
                title_match = re.search(title_pattern, html_content)
                if title_match:
                    original_filename = title_match.group(1)
                else:
                    original_filename = f"attachment_{attachment_id}"
            
            # Clean filename
            original_filename = re.sub(r'[<>:"/\\|?*]', '_', original_filename)
            if not original_filename or original_filename == 'Image':
                original_filename = f"attachment_{attachment_id}"
            
            filename = f"{article_id}_{i+1}_{original_filename}"
            filepath = self.download_attachment(attachment_url, filename)
            if filepath:
                attachments.append({
                    'attachment_id': attachment_id,
                    'original_url': attachment_url,
                    'local_path': filepath,
                    'filename': filename,
                    'original_filename': original_filename
                })
                print(f"Downloaded attachment: {filename}")
            else:
                print(f"Failed to download attachment: {attachment_url}")
        
        return attachments

    def download_attachment(self, attachment_url, filename):
        """Download and save an attachment"""
        try:
            response = self.session.get(attachment_url)
            response.raise_for_status()
            
            filepath = os.path.join(self.output_dir, "attachments", filename)
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            return filepath
        except Exception as e:
            print(f"Error downloading attachment {filename}: {e}")
            return None

    def create_css(self):
        """Create CSS styling for the help center"""
        css_content = """
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap');

/* Userology Premium Help Center Theme */
:root {
    /* Brand Colors - Userology Purple */
    --u-color-primary: #6430F7; /* Userology Purple */
    --u-color-primary-dark: #4F26C4;
    --u-color-primary-light: #EDE7FE;
    --u-color-secondary: #0F172A; /* Slate 900 */

    /* Text Colors */
    --u-color-text-main: #1E293B; /* Slate 800 */
    --u-color-text-muted: #64748B; /* Slate 500 */
    --u-color-text-light: #94A3B8; /* Slate 400 */
    --u-color-text-inverse: #FFFFFF;

    /* Background Colors */
    --u-color-bg-main: #F8FAFC; /* Slate 50 */
    --u-color-bg-card: #FFFFFF;
    --u-color-bg-header: #FFFFFF;
    --u-color-bg-footer: #0F172A; /* Slate 900 */

    /* Border Colors */
    --u-color-border: #E2E8F0; /* Slate 200 */
    --u-color-border-hover: #CBD5E1; /* Slate 300 */

    /* Status Colors */
    --u-color-success: #10B981;
    --u-color-warning: #F59E0B;
    --u-color-error: #EF4444;
    --u-color-info: #3B82F6;

    /* Spacing System */
    --u-space-1: 0.25rem;
    --u-space-2: 0.5rem;
    --u-space-3: 0.75rem;
    --u-space-4: 1rem;
    --u-space-6: 1.5rem;
    --u-space-8: 2rem;
    --u-space-12: 3rem;
    --u-space-16: 4rem;

    /* Typography */
    --u-font-sans: 'Figtree', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --u-font-mono: 'JetBrains Mono', monospace;
    
    /* Shadows */
    --u-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --u-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --u-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --u-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* Radius */
    --u-radius-sm: 0.375rem;
    --u-radius-md: 0.5rem;
    --u-radius-lg: 0.75rem;
    --u-radius-xl: 1rem;
    --u-radius-full: 9999px;
    
    /* Transitions */
    --u-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Reset & Base */
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--u-font-sans);
    font-size: 16px;
    line-height: 1.6;
    color: var(--u-color-text-main);
    background-color: var(--u-color-bg-main);
    -webkit-font-smoothing: antialiased;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    color: var(--u-color-secondary);
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: var(--u-space-4);
}

h1 { font-size: 2.5rem; letter-spacing: -0.025em; }
h2 { font-size: 2rem; letter-spacing: -0.025em; margin-top: var(--u-space-12); }
h3 { font-size: 1.5rem; letter-spacing: -0.025em; margin-top: var(--u-space-8); }
h4 { font-size: 1.25rem; }

p { margin-bottom: var(--u-space-4); }

a {
    color: var(--u-color-primary);
    text-decoration: none;
    transition: var(--u-transition);
    font-weight: 500;
}

a:hover {
    color: var(--u-color-primary-dark);
}

/* Layout */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--u-space-6);
}

/* Header */
.header {
    background: var(--u-color-bg-header);
    border-bottom: 1px solid var(--u-color-border);
    padding: var(--u-space-4) 0;
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.9);
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--u-space-8);
}

.header-branding {
    display: flex;
    align-items: center;
    gap: var(--u-space-4);
    text-decoration: none;
}

.header-logo {
    height: 40px;
    width: auto;
}

.header-text h1 {
    font-size: 1.25rem;
    margin: 0;
    color: var(--u-color-secondary);
}

.header-text p {
    display: none; /* Hide tagline in header for cleaner look */
}

/* Search Bar */
.search-container {
    flex: 1;
    max-width: 480px;
    position: relative;
}

.search-input {
    width: 100%;
    padding: var(--u-space-3) var(--u-space-4) var(--u-space-3) var(--u-space-12);
    border: 1px solid var(--u-color-border);
    border-radius: var(--u-radius-full);
    font-size: 0.95rem;
    background: var(--u-color-bg-main);
    transition: var(--u-transition);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: 1rem center;
    background-size: 1.25rem;
}

.search-input:focus {
    outline: none;
    border-color: var(--u-color-primary);
    box-shadow: 0 0 0 4px rgba(100, 48, 247, 0.1);
    background-color: var(--u-color-bg-card);
}

/* Navigation */
.nav {
    background: var(--u-color-bg-card);
    border-bottom: 1px solid var(--u-color-border);
    padding: 0;
}

.nav ul {
    list-style: none;
    display: flex;
    gap: var(--u-space-8);
}

.nav a {
    display: block;
    padding: var(--u-space-4) 0;
    color: var(--u-color-text-muted);
    font-size: 0.95rem;
    border-bottom: 2px solid transparent;
}

.nav a:hover,
.nav a.active {
    color: var(--u-color-primary);
    border-bottom-color: var(--u-color-primary);
}

/* Main Content */
.main {
    padding: var(--u-space-12) 0;
    min-height: calc(100vh - 300px);
}

/* Hero Section (Home) */
.hero {
    text-align: center;
    padding: var(--u-space-16) 0;
    background: linear-gradient(135deg, #EDE7FE 0%, #DDD6FE 100%);
    border-radius: var(--u-radius-xl);
    margin-bottom: var(--u-space-12);
}

.hero h1 {
    font-size: 3rem;
    color: var(--u-color-secondary);
    margin-bottom: var(--u-space-6);
}

.hero p {
    font-size: 1.25rem;
    color: var(--u-color-text-muted);
    max-width: 600px;
    margin: 0 auto;
}

/* Topic Grid */
.topic-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--u-space-6);
    margin-bottom: var(--u-space-12);
}

.topic-card {
    background: var(--u-color-bg-card);
    border: 1px solid var(--u-color-border);
    border-radius: var(--u-radius-lg);
    padding: var(--u-space-8);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-decoration: none;
    transition: var(--u-transition);
    height: 100%;
}

.topic-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--u-shadow-lg);
    border-color: var(--u-color-primary-light);
}

.topic-icon {
    font-size: 2.5rem;
    margin-bottom: var(--u-space-4);
    background: #EDE7FE;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--u-radius-md);
}

.topic-card h3 {
    font-size: 1.25rem;
    margin: 0 0 var(--u-space-2) 0;
    color: var(--u-color-secondary);
}

.topic-card .topic-description {
    color: var(--u-color-text-muted);
    font-size: 0.95rem;
    margin-bottom: var(--u-space-4);
    flex-grow: 1;
}

.topic-meta {
    font-size: 0.875rem;
    color: var(--u-color-primary);
    font-weight: 600;
    background: #EDE7FE;
    padding: var(--u-space-1) var(--u-space-3);
    border-radius: var(--u-radius-full);
}

/* Article Grid */
.article-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--u-space-6);
}

.article-card {
    background: var(--u-color-bg-card);
    border: 1px solid var(--u-color-border);
    border-radius: var(--u-radius-lg);
    padding: var(--u-space-6);
    display: block;
    text-decoration: none;
    transition: var(--u-transition);
}

.article-card:hover {
    box-shadow: var(--u-shadow-md);
    border-color: var(--u-color-primary-light);
}

.article-card h3 {
    font-size: 1.1rem;
    margin: 0 0 var(--u-space-3) 0;
    color: var(--u-color-secondary);
    line-height: 1.4;
}

.article-card:hover h3 {
    color: var(--u-color-primary);
}

.article-meta {
    font-size: 0.875rem;
    color: var(--u-color-text-light);
    display: flex;
    align-items: center;
    gap: var(--u-space-2);
}

/* Article Page Layout */
.article-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: var(--u-space-12);
}

/* Sidebar */
.sidebar {
    position: sticky;
    top: 100px;
    height: fit-content;
}

.sidebar h3 {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--u-color-text-muted);
    margin-bottom: var(--u-space-4);
}

.sidebar ul {
    list-style: none;
}

.sidebar a {
    display: block;
    padding: var(--u-space-2) var(--u-space-3);
    margin: var(--u-space-1) 0;
    color: var(--u-color-text-main);
    border-radius: var(--u-radius-md);
    font-size: 0.95rem;
}

.sidebar a:hover {
    background: var(--u-color-bg-main);
    color: var(--u-color-primary);
}

.sidebar a.active {
    background: #EDE7FE;
    color: var(--u-color-primary);
    font-weight: 600;
}

/* Content Area */
.content {
    background: var(--u-color-bg-card);
    padding: var(--u-space-12);
    border-radius: var(--u-radius-xl);
    box-shadow: var(--u-shadow-sm);
    border: 1px solid var(--u-color-border);
}

.content img {
    max-width: 100%;
    height: auto;
    border-radius: var(--u-radius-lg);
    box-shadow: var(--u-shadow-md);
    margin: var(--u-space-8) 0;
    border: 1px solid var(--u-color-border);
}

.content pre {
    background: #1E293B;
    color: #E2E8F0;
    padding: var(--u-space-6);
    border-radius: var(--u-radius-lg);
    overflow-x: auto;
    margin: var(--u-space-6) 0;
    font-family: var(--u-font-mono);
    font-size: 0.9rem;
}

.content blockquote {
    border-left: 4px solid var(--u-color-primary);
    background: #EDE7FE;
    padding: var(--u-space-6);
    border-radius: 0 var(--u-radius-lg) var(--u-radius-lg) 0;
    margin: var(--u-space-6) 0;
    font-style: italic;
    color: var(--u-color-secondary);
}

/* YouTube Container */
.youtube-container {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    border-radius: var(--u-radius-lg);
    box-shadow: var(--u-shadow-lg);
    margin: var(--u-space-8) 0;
}

.youtube-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* Footer */
.footer {
    background: var(--u-color-bg-footer);
    color: var(--u-color-text-inverse);
    padding: var(--u-space-12) 0;
    margin-top: var(--u-space-16);
}

.footer p {
    color: var(--u-color-text-light);
    text-align: center;
    font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 1024px) {
    .article-layout {
        grid-template-columns: 1fr;
    }
    
    .sidebar {
        display: none; /* Hide sidebar on mobile for now, can be improved later */
    }
}

@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--u-space-4);
    }
    
    .search-container {
        max-width: none;
    }
    
    .nav ul {
        overflow-x: auto;
        padding-bottom: var(--u-space-2);
    }
    
    .hero h1 {
        font-size: 2rem;
    }
    
    .content {
        padding: var(--u-space-6);
    }
}
"""
        
        with open(f"{self.output_dir}/css/style.css", 'w', encoding='utf-8') as f:
            f.write(css_content)

    def create_javascript(self):
        """Create JavaScript for search and interactivity"""
        js_content = """
// Zendesk Help Center - Search and Interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) return;
            
            // Simple client-side search
            const articles = document.querySelectorAll('.article-item, .article-card');
            articles.forEach(article => {
                const titleElement = article.querySelector('h3 a, h3');
                const metaElement = article.querySelector('.article-meta');
                const excerptElement = article.querySelector('.article-excerpt');
                
                const title = titleElement ? titleElement.textContent.toLowerCase() : '';
                const meta = metaElement ? metaElement.textContent.toLowerCase() : '';
                const excerpt = excerptElement ? excerptElement.textContent.toLowerCase() : '';
                
                if (title.includes(query) || meta.includes(query) || excerpt.includes(query)) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
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
    
    // Add loading states for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
});
"""
        
        with open(f"{self.output_dir}/js/main.js", 'w', encoding='utf-8') as f:
            f.write(js_content)

    def get_header_html(self, title, description="Get help with Userology"):
        """Get the common header HTML for all pages"""
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Userology Help Center</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" type="image/png" href="logo.png">
    <meta name="description" content="{description}">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-branding">
                <img src="logo.png" alt="Userology Logo" class="header-logo">
                <div class="header-text">
                    <h1>Userology Help Center</h1>
                    <p>Your complete guide to using Userology</p>
                </div>
            </div>
            <button class="mobile-menu-btn" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>

    <nav class="nav">
        <div class="container">
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="categories.html">Browse Topics</a></li>
                <li><a href="articles.html">All Articles</a></li>
                <li><a href="videos.html">Videos</a></li>
            </ul>
        </div>
    </nav>"""

    def get_footer_html(self):
        """Get the common footer HTML for all pages"""
        return f"""
    <footer class="footer">
        <div class="container">
            <p>© 2025 Userology. All rights reserved.</p>
        </div>
    </footer>
    
    <script src="js/main.js"></script>
</body>
</html>"""

    def create_homepage(self):
        """Create the main homepage"""
        html_content = self.get_header_html("Home", "Get help with Userology")
        
        html_content += """
    <div class="container">
        <main class="main">
            <aside class="sidebar">
                <h3>Categories</h3>
                <ul>
"""
        
        for category in self.categories:
            html_content += f'                    <li><a href="category_{category["id"]}.html">{category["name"]}</a></li>\n'
        
        html_content += """
                </ul>
            </aside>

            <div class="content">
                <h1>Welcome to Userology Help Center</h1>
                <p>Find comprehensive guides, tutorials, and answers to help you get the most out of Userology.</p>
                
                <h2>Popular Articles</h2>
                <div class="article-grid">
"""
        
        # Show recent articles (last 6)
        recent_articles = sorted(self.articles, key=lambda x: x['updated_at'], reverse=True)[:6]
        for article in recent_articles:
            section = next((s for s in self.sections if s['id'] == article['section_id']), None)
            category = next((c for c in self.categories if c['id'] == section['category_id']), None) if section else None
            
            html_content += f"""
                    <a href="article_{article['id']}.html" class="article-card">
                        <h3>{article['title']}</h3>
                        <div class="article-meta">
                            {category['name'] if category else 'Unknown'} → {section['name'] if section else 'Unknown'}
                        </div>
                    </a>
"""
        
        html_content += """
                </div>
            </div>
        </main>
    </div>
"""
        
        html_content += self.get_footer_html()
        
        with open(f"{self.output_dir}/index.html", 'w', encoding='utf-8') as f:
            f.write(html_content)

    def create_category_page(self, category):
        """Create a category page"""
        sections = self.sections_by_category.get(category['id'], [])
        
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{category['name']} - Userology Help Center</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" type="image/png" href="logo.png">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-branding">
                <img src="logo.png" alt="Userology Logo" class="header-logo">
                <div class="header-text">
                    <h1>Userology Help Center</h1>
                    <p>Your complete guide to using Userology</p>
                </div>
            </div>
        </div>
    </header>

    <nav class="nav">
        <div class="container">
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="categories.html">Browse Topics</a></li>
                <li><a href="articles.html">All Articles</a></li>
                <li><a href="videos.html">Videos</a></li>
            </ul>
        </div>
    </nav>

    <div class="container">
        <main class="main">
            <aside class="sidebar">
                <h3>Sections in {category['name']}</h3>
                <ul>
"""
        
        for section in sections:
            html_content += f'                    <li><a href="section_{section["id"]}.html">{section["name"]}</a></li>\n'
        
        html_content += f"""
                </ul>
            </aside>

            <div class="content">
                <div class="breadcrumbs">
                    <a href="index.html">Home</a>
                    <span>/</span>
                    <span>{category['name']}</span>
                </div>

                <h1>{category['name']}</h1>
                <p class="section-description">{category.get('description', '')}</p>

                <h2>Sections ({len(sections)})</h2>
                <div class="topic-grid">
"""

        for section in sections:
            articles = self.articles_by_section.get(section['id'], [])
            html_content += f"""
                    <a href="section_{section['id']}.html" class="topic-card">
                        <h3>{section['name']}</h3>
                        <p class="topic-meta">{len(articles)} articles</p>
                    </a>
"""

        html_content += """
                </div>
            </div>
        </main>
    </div>

    <footer class="footer">
        <div class="container">
            <p>© 2025 Userology. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
"""
        
        with open(f"{self.output_dir}/category_{category['id']}.html", 'w', encoding='utf-8') as f:
            f.write(html_content)

    def create_section_page(self, section):
        """Create a section page"""
        articles = self.articles_by_section.get(section['id'], [])
        category = next((c for c in self.categories if c['id'] == section['category_id']), None)
        
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{section['name']} - Userology Help Center</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" type="image/png" href="logo.png">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-branding">
                <img src="logo.png" alt="Userology Logo" class="header-logo">
                <div class="header-text">
                    <h1>Userology Help Center</h1>
                    <p>Your complete guide to using Userology</p>
                </div>
            </div>
        </div>
    </header>

    <nav class="nav">
        <div class="container">
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="categories.html">Browse Topics</a></li>
                <li><a href="articles.html">All Articles</a></li>
                <li><a href="videos.html">Videos</a></li>
            </ul>
        </div>
    </nav>

    <div class="container">
        <main class="main">
            <aside class="sidebar">
                <h3>Articles in {section['name']}</h3>
                <ul>
"""
        
        for article in articles:
            html_content += f'                    <li><a href="article_{article["id"]}.html">{article["title"]}</a></li>\n'
        
        category_name = category['name'] if category else 'Unknown'
        category_id = category['id'] if category else ''

        html_content += f"""
                </ul>
            </aside>

            <div class="content">
                <div class="breadcrumbs">
                    <a href="index.html">Home</a>
                    <span>/</span>
                    <a href="category_{category_id}.html">{category_name}</a>
                    <span>/</span>
                    <span>{section['name']}</span>
                </div>

                <h1>{section['name']}</h1>
                <p class="section-description">{section.get('description', '')}</p>

                <h2>Articles ({len(articles)})</h2>
                <ul class="article-list">
"""
        
        for article in articles:
            html_content += f"""
                    <li class="article-item">
                        <a href="article_{article['id']}.html">{article['title']}</a>
                    </li>
"""

        html_content += """
                </ul>
            </div>
        </main>
    </div>

    <footer class="footer">
        <div class="container">
            <p>© 2025 Userology. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
"""

        with open(f"{self.output_dir}/section_{section['id']}.html", 'w', encoding='utf-8') as f:
            f.write(html_content)

    def get_related_articles_html(self, current_article, section):
        """Get HTML for related articles in the same section"""
        if not section:
            return '<li>No related articles</li>'

        section_articles = [a for a in self.articles if a['section_id'] == section['id'] and a['id'] != current_article['id']]

        if not section_articles:
            return '<li>No related articles</li>'

        # Limit to 3 related articles
        related = section_articles[:3]

        html_parts = []
        for article in related:
            html_parts.append(f'<li><a href="article_{article["id"]}.html">{article["title"]}</a></li>')

        return '\n                        '.join(html_parts)

    def get_article_navigation_html(self, current_article, section):
        """Get HTML for prev/next article navigation"""
        if not section:
            return ''

        section_articles = [a for a in self.articles if a['section_id'] == section['id']]

        if len(section_articles) <= 1:
            return ''

        current_index = next((i for i, a in enumerate(section_articles) if a['id'] == current_article['id']), -1)

        if current_index == -1:
            return ''

        prev_article = section_articles[current_index - 1] if current_index > 0 else None
        next_article = section_articles[current_index + 1] if current_index < len(section_articles) - 1 else None

        html = '<div class="article-nav">'

        if prev_article:
            html += f'''
                <a href="article_{prev_article['id']}.html" class="article-nav-prev">
                    <span class="article-nav-label">← Previous</span>
                    <span class="article-nav-title">{prev_article['title']}</span>
                </a>'''
        else:
            html += '<div class="article-nav-prev"></div>'

        if next_article:
            html += f'''
                <a href="article_{next_article['id']}.html" class="article-nav-next">
                    <span class="article-nav-label">Next →</span>
                    <span class="article-nav-title">{next_article['title']}</span>
                </a>'''
        else:
            html += '<div class="article-nav-next"></div>'

        html += '</div>'
        return html

    def create_article_page(self, article):
        """Create an article page"""
        section = next((s for s in self.sections if s['id'] == article['section_id']), None)
        category = next((c for c in self.categories if c['id'] == section['category_id']), None) if section else None
        
        # Extract and download any missing attachments from HTML content
        if article.get('body'):
            print(f"Processing attachments for article: {article['title']}")
            html_attachments = self.extract_attachments_from_html(article['body'], article['id'])
            if html_attachments:
                if 'downloaded_attachments' not in article:
                    article['downloaded_attachments'] = []
                article['downloaded_attachments'].extend(html_attachments)
        
        # Fix image URLs in content
        fixed_body = self.fix_image_urls(article['body'])
        
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{article['title']} - Userology Help Center</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" type="image/png" href="logo.png">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-branding">
                <img src="logo.png" alt="Userology Logo" class="header-logo">
                <div class="header-text">
                    <h1>Userology Help Center</h1>
                    <p>Your complete guide to using Userology</p>
                </div>
            </div>
        </div>
    </header>

    <nav class="nav">
        <div class="container">
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="categories.html">Browse Topics</a></li>
                <li><a href="articles.html">All Articles</a></li>
                <li><a href="videos.html">Videos</a></li>
            </ul>
        </div>
    </nav>

    <div class="container">
        <main class="main">
            <aside class="sidebar">
                <h3>Navigation</h3>
                <ul>
                    <li><a href="index.html">← Back to Home</a></li>
"""
        
        if category:
            html_content += f'                    <li><a href="category_{category["id"]}.html">← {category["name"]}</a></li>\n'
        if section:
            html_content += f'                    <li><a href="section_{section["id"]}.html">← {section["name"]}</a></li>\n'
        
        html_content += f"""
                </ul>
            </aside>

            <div class="content">
                <div class="breadcrumbs">
                    <a href="index.html">Home</a>
                    <span>/</span>
                    <a href="category_{category['id'] if category else ''}.html">{category['name'] if category else 'Unknown'}</a>
                    <span>/</span>
                    <a href="section_{section['id'] if section else ''}.html">{section['name'] if section else 'Unknown'}</a>
                    <span>/</span>
                    <span>{article['title']}</span>
                </div>

                <h1>{article['title']}</h1>
                <div class="article-meta">
                    Updated: {article['updated_at'][:10]}
                </div>

                <div class="toc">
                    <h4>On this page</h4>
                </div>

                <div class="article-content">
                    {fixed_body}
                </div>

                <div class="related-articles">
                    <h3>Related Articles</h3>
                    <ul>
                        {self.get_related_articles_html(article, section)}
                    </ul>
                </div>

                {self.get_article_navigation_html(article, section)}
            </div>
        </main>
    </div>

    <footer class="footer">
        <div class="container">
            <p>© 2025 Userology. All rights reserved.</p>
        </div>
    </footer>

    <script src="js/main.js"></script>
</body>
</html>
"""
        
        with open(f"{self.output_dir}/article_{article['id']}.html", 'w', encoding='utf-8') as f:
            f.write(html_content)

    def create_all_pages(self):
        """Create all pages"""
        print("Creating CSS...")
        self.create_css()
        
        print("Creating JavaScript...")
        self.create_javascript()
        
        print("Creating homepage...")
        self.create_homepage()
        
        print("Creating category pages...")
        for category in self.categories:
            self.create_category_page(category)
        
        print("Creating section pages...")
        for section in self.sections:
            self.create_section_page(section)
        
        print("Creating article pages...")
        for article in self.articles:
            self.create_article_page(article)
        
        print("Creating index pages...")
        self.create_categories_index()
        self.create_articles_index()

    def create_categories_index(self):
        """Create categories index page"""
        html_content = self.get_header_html("Categories", "Browse all help categories")
        
        html_content += """
    <div class="container">
        <main class="main">
            <div class="content">
                <h1>All Categories</h1>
                <div class="article-grid">
"""
        
        # Define icons for categories (simple mapping based on name keywords)
        icons = {
            'Study Setup': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>',
            'Interview Plan': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>',
            'Study Settings': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
            'Launch': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
            'Responses and Recordings': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>',
            'Settings and Admin': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
            'Results and Reports': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
        }
        default_icon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>'

        for category in self.categories:
            sections = self.sections_by_category.get(category['id'], [])
            total_articles = sum(len(self.articles_by_section.get(s['id'], [])) for s in sections)
            icon = icons.get(category['name'], default_icon)
            
            html_content += f"""
                    <a href="category_{category['id']}.html" class="topic-card">
                        <div class="topic-icon">{icon}</div>
                        <h3>{category['name']}</h3>
                        <p class="topic-description">{category.get('description', 'Browse articles in this category')}</p>
                        <div class="topic-meta">{len(sections)} sections, {total_articles} articles</div>
                    </a>
"""
        
        html_content += """
                </div>
            </div>
        </main>
    </div>

    <footer class="footer">
        <div class="container">
            <p>Offline Help Center - Generated on """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """</p>
        </div>
    </footer>
</body>
</html>
"""
        
        with open(f"{self.output_dir}/categories.html", 'w', encoding='utf-8') as f:
            f.write(html_content)

    def create_articles_index(self):
        """Create articles index page"""
        html_content = self.get_header_html("All Articles", "Browse all help articles")
        
        html_content += """
    <div class="container">
        <main class="main">
            <div class="content">
                <h1>All Articles</h1>
                <div class="article-grid">
"""
        
        for article in sorted(self.articles, key=lambda x: x['title']):
            section = next((s for s in self.sections if s['id'] == article['section_id']), None)
            category = next((c for c in self.categories if c['id'] == section['category_id']), None) if section else None
            
            html_content += f"""
                    <a href="article_{article['id']}.html" class="article-card">
                        <h3>{article['title']}</h3>
                        <div class="article-meta">
                            {category['name'] if category else 'Unknown'} → {section['name'] if section else 'Unknown'}
                        </div>
                    </a>
"""
        
        html_content += """
                </div>
            </div>
        </main>
    </div>

    <footer class="footer">
        <div class="container">
            <p>Offline Help Center - Generated on """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """</p>
        </div>
    </footer>
</body>
</html>
"""
        with open(f"{self.output_dir}/articles.html", 'w', encoding='utf-8') as f:
            f.write(html_content)

def main():
    print("Generating offline help center website...")
    generator = OfflineWebsiteGenerator()
    generator.create_all_pages()
    print(f"Website generated successfully!")
    print(f"Open {generator.output_dir}/index.html in your browser to view the offline help center")

if __name__ == "__main__":
    main()
