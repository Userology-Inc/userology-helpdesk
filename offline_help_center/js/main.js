
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
