import requests
import json
import time
from datetime import datetime
import pandas as pd

KEYWORDS_TEST = ["Web developer", "DevOps Engineer", "Cloud Engineer",]

KEYWORDS_50 = [
    # Web (12)
    "Web developer", "Full Stack Developer", "Frontend Developer",
    "Backend Developer", "React Developer", "Node.js Developer",
    "Python Developer", "JavaScript Developer", "PHP Developer",
    "Java Developer", "WordPress Developer", ".NET Developer",
    
    # Mobile (4)
    "Mobile Developer", "iOS Developer", "Android Developer",
    "React Native Developer",
    
    # DevOps (8)
    "DevOps Engineer", "Cloud Engineer", "System Administrator",
    "Site Reliability Engineer", "AWS Engineer", "Kubernetes Engineer",
    "Infrastructure Engineer", "Network Engineer",
    
    # Data (8)
    "Data Analyst", "Data Scientist", "Data Engineer",
    "Machine Learning Engineer", "Business Intelligence Analyst",
    "SQL Developer", "AI Engineer", "Analytics Engineer",
    
    # QA & Security (5)
    "QA Engineer", "Test Automation Engineer", "Cybersecurity Analyst",
    "Security Engineer", "Software Tester",
    
    # Design (4)
    "UI/UX Designer", "Product Designer", "Web Designer", "UX Designer",
    
    # Management (5)
    "Product Manager", "Project Manager", "Scrum Master",
    "Technical Lead", "Engineering Manager",
    
    # Entry Level (4)
    "Junior Developer", "Entry Level Developer",
    "IT Support Specialist", "Technical Support"
]

# Step 1 : Job Scraper
api_key = "MY_API_KEY"
url = "https://api.scrapingdog.com/google_jobs"

todays_jobs = []

params = {
    "api_key": "",
    "query": "",
    "country": "ca"
}

response = requests.get(url, params=params)

if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f"Request failed with status code: {response.status_code}")

# Step 2 : Clean Data

# Step 3 : Save Data
date_str = datetime.now().strftime("%Y%m%d")
filename = f"jobs_{date_str}.json"

with open(filename, 'w', encoding='utf-8') as f:
    json.dump(todays_jobs, f, ensure_ascii=False, indent=2)