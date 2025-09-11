#!/usr/bin/env python3
"""
Zendesk Help Center Data Exporter
Downloads all articles, sections, categories, and attachments from Zendesk Help Center
"""

import requests
import json
import os
import time
from urllib.parse import urlparse
import base64
import re

class ZendeskExporter:
    def __init__(self, subdomain, email, api_token):
        self.subdomain = subdomain
        self.email = email
        self.api_token = api_token
        self.base_url = f"https://{subdomain}.zendesk.com/api/v2"
        self.hc_base_url = f"https://{subdomain}.zendesk.com/api/v2/help_center"
        self.session = requests.Session()
        
        # Set up authentication
        credentials = f"{email}/token:{api_token}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        self.session.headers.update({
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/json'
        })
        
        # Create export directory
        self.export_dir = f"zendesk_export_{subdomain}"
        os.makedirs(self.export_dir, exist_ok=True)
        os.makedirs(f"{self.export_dir}/attachments", exist_ok=True)

    def make_request(self, url, params=None):
        """Make API request with rate limiting"""
        try:
            response = self.session.get(url, params=params)
            
            # Handle rate limiting
            if response.status_code == 429:
                retry_after = int(response.headers.get('Retry-After', 60))
                print(f"Rate limited. Waiting {retry_after} seconds...")
                time.sleep(retry_after)
                return self.make_request(url, params)
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error making request to {url}: {e}")
            return None

    def get_all_paginated(self, endpoint, key):
        """Get all results from a paginated endpoint"""
        url = f"{self.hc_base_url}/{endpoint}"
        all_items = []
        
        while url:
            print(f"Fetching: {url}")
            data = self.make_request(url)
            if not data:
                break
                
            all_items.extend(data.get(key, []))
            url = data.get('next_page')
            
            # Small delay to be nice to the API
            time.sleep(0.1)
        
        return all_items

    def download_attachment(self, attachment_url, filename):
        """Download and save an attachment"""
        try:
            response = self.session.get(attachment_url)
            response.raise_for_status()
            
            filepath = os.path.join(self.export_dir, "attachments", filename)
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            return filepath
        except Exception as e:
            print(f"Error downloading attachment {filename}: {e}")
            return None

    def extract_attachments_from_html(self, html_content, article_id):
        """Extract attachment URLs from HTML content"""
        # Pattern to match Zendesk article attachment URLs
        pattern = r'https://support\.userology\.co/hc/article_attachments/(\d+)'
        matches = re.findall(pattern, html_content)
        
        attachments = []
        for i, attachment_id in enumerate(matches):
            attachment_url = f"https://support.userology.co/hc/article_attachments/{attachment_id}"
            # Try to get the original filename from the HTML
            img_pattern = rf'<img[^>]*src="{re.escape(attachment_url)}"[^>]*alt="([^"]*)"'
            img_match = re.search(img_pattern, html_content)
            if img_match:
                original_filename = img_match.group(1)
            else:
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
        
        return attachments

    def export_categories(self):
        """Export all categories"""
        print("Exporting categories...")
        categories = self.get_all_paginated("categories", "categories")
        
        with open(f"{self.export_dir}/categories.json", 'w', encoding='utf-8') as f:
            json.dump(categories, f, indent=2, ensure_ascii=False)
        
        print(f"Exported {len(categories)} categories")
        return categories

    def export_sections(self):
        """Export all sections"""
        print("Exporting sections...")
        sections = self.get_all_paginated("sections", "sections")
        
        with open(f"{self.export_dir}/sections.json", 'w', encoding='utf-8') as f:
            json.dump(sections, f, indent=2, ensure_ascii=False)
        
        print(f"Exported {len(sections)} sections")
        return sections

    def export_articles(self):
        """Export all articles with their attachments"""
        print("Exporting articles...")
        articles = self.get_all_paginated("articles", "articles")
        
        # Download article attachments
        total_attachments = 0
        for article in articles:
            article['downloaded_attachments'] = []
            
            # Check for traditional attachments (if any)
            if article.get('attachments'):
                for attachment in article['attachments']:
                    filename = f"{article['id']}_{attachment['file_name']}"
                    filepath = self.download_attachment(attachment['content_url'], filename)
                    if filepath:
                        article['downloaded_attachments'].append({
                            'original_url': attachment['content_url'],
                            'local_path': filepath,
                            'filename': filename
                        })
                        total_attachments += 1
            
            # Extract and download attachments from HTML content
            if article.get('body'):
                html_attachments = self.extract_attachments_from_html(article['body'], article['id'])
                article['downloaded_attachments'].extend(html_attachments)
                total_attachments += len(html_attachments)
        
        with open(f"{self.export_dir}/articles.json", 'w', encoding='utf-8') as f:
            json.dump(articles, f, indent=2, ensure_ascii=False)
        
        print(f"Exported {len(articles)} articles")
        print(f"Downloaded {total_attachments} attachments")
        return articles

    def export_themes(self):
        """Export theme information"""
        print("Exporting theme data...")
        try:
            # Get theme info
            theme_data = self.make_request(f"{self.hc_base_url}/themes")
            
            if theme_data:
                with open(f"{self.export_dir}/themes.json", 'w', encoding='utf-8') as f:
                    json.dump(theme_data, f, indent=2, ensure_ascii=False)
                print("Theme data exported")
        except Exception as e:
            print(f"Could not export theme data: {e}")

    def export_all(self):
        """Export all Help Center data"""
        print(f"Starting export for {self.subdomain}...")
        
        # Create manifest
        manifest = {
            'export_date': time.strftime('%Y-%m-%d %H:%M:%S'),
            'subdomain': self.subdomain,
            'base_url': f"https://{self.subdomain}.zendesk.com"
        }
        
        categories = self.export_categories()
        sections = self.export_sections()
        articles = self.export_articles()
        self.export_themes()
        
        # Update manifest
        manifest.update({
            'total_categories': len(categories),
            'total_sections': len(sections),
            'total_articles': len(articles)
        })
        
        with open(f"{self.export_dir}/manifest.json", 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Export completed!")
        print(f"📁 Data saved to: {self.export_dir}/")
        print(f"📊 Summary:")
        print(f"   - Categories: {len(categories)}")
        print(f"   - Sections: {len(sections)}")
        print(f"   - Articles: {len(articles)}")

def main():
    # Configuration
    SUBDOMAIN = "userology"  # Your Zendesk subdomain
    EMAIL = input("Enter your Zendesk admin email: ")
    API_TOKEN = "xYKvKq5zKg9a0V6rL28prhZZmyks8FnR5AQE3Phu"  # Your API token
    
    # Create exporter and run
    exporter = ZendeskExporter(SUBDOMAIN, EMAIL, API_TOKEN)
    exporter.export_all()

if __name__ == "__main__":
    main()