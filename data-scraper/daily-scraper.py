import requests
import json
import time
from datetime import datetime
import pandas as pd
import random
import re
import os
from dotenv import load_dotenv

load_dotenv(".env.development")

# KEYWORDS_TEST = ["Web developer", "DevOps Engineer", "Cloud Engineer",]
KEYWORDS_TEST = ["Mobile Developer"]

# KEYWORDS_50 = [
#     # Web (12)
#     "Web developer", "Full Stack Developer", "Frontend Developer",
#     "Backend Developer", "React Developer", "Node.js Developer",
#     "Python Developer", "JavaScript Developer", "PHP Developer",
#     "Java Developer", "WordPress Developer", ".NET Developer",
    
#     # Mobile (4)
#     "Mobile Developer", "iOS Developer", "Android Developer",
#     "React Native Developer",
    
#     # DevOps (8)
#     "DevOps Engineer", "Cloud Engineer", "System Administrator",
#     "Site Reliability Engineer", "AWS Engineer", "Kubernetes Engineer",
#     "Infrastructure Engineer", "Network Engineer",
    
#     # Data (8)
#     "Data Analyst", "Data Scientist", "Data Engineer",
#     "Machine Learning Engineer", "Business Intelligence Analyst",
#     "SQL Developer", "AI Engineer", "Analytics Engineer",
    
#     # QA & Security (5)
#     "QA Engineer", "Test Automation Engineer", "Cybersecurity Analyst",
#     "Security Engineer", "Software Tester",
    
#     # Design (4)
#     "UI/UX Designer", "Product Designer", "Web Designer", "UX Designer",
    
#     # Management (5)
#     "Product Manager", "Project Manager", "Scrum Master",
#     "Technical Lead", "Engineering Manager",
    
#     # Entry Level (4)
#     "Junior Developer", "Entry Level Developer",
#     "IT Support Specialist", "Technical Support"
# ]

# Step 1 : Job Scraper
api_key = api_key= os.getenv("SCRAPING_API_KEY")
url = "https://api.scrapingdog.com/google_jobs"
MAX_PAGES = 2

todays_jobs = []

for keyword in KEYWORDS_TEST:
    print(f"Searching for: {keyword}")
    next_token = None
    
    for page in range(MAX_PAGES):
        # pause time between queries to avoid problems
        if len(todays_jobs) > 0:
            time.sleep(random.uniform(2, 5))
        
        params = {
            "api_key": api_key,
            "query": keyword,
            "country": "ca"
        }
        if next_token:
            params["next_page_token"] = next_token
        
        response = requests.get("https://api.scrapingdog.com/google_jobs", params=params)
        
        if response.status_code == 200:
            data = response.json()
            jobs = data.get("jobs_results", [])
            
            todays_jobs.extend(jobs)
            print(f"  Page {page+1}: {len(jobs)} jobs")
            
            # next page token
            next_token = data.get("scrapingdog_pagination", {}).get("next_page_token")
            if not next_token:
                break
        else:
            print(f"  Error: {response.status_code}")
            break
    
    time.sleep(3)

# Step 2 : Clean Data
def clean_text(text):
    if not text:
        return ""
    text = text.replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

cleaned_jobs = []

for job in todays_jobs:
    cleaned = {
        "job_id": job.get("job_id", ""),
        "title": clean_text(job.get("title", "")),
        "company_name": clean_text(job.get("company_name", "")),
        "location": clean_text(job.get("location", "")),
        "description": clean_text(job.get("description", "")),
        "via": job.get("via", ""),
        "share_link": job.get("share_link", ""),
        "extensions": job.get("extensions", []),
    }
    cleaned_jobs.append(cleaned)

# Step 3 : Save Data
date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"data-scraper/jobs_{date_str}.json"

with open(filename, 'w', encoding='utf-8') as f:
    json.dump(cleaned_jobs, f, ensure_ascii=False, indent=2)

print(f"Job Scraper Daily Job Done! See file {filename}")