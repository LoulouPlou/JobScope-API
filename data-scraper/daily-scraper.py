import requests
import json
import time
from datetime import datetime
import pandas as pd
import random
import re
import os
from dotenv import load_dotenv
# from keywords import JOB_TITLES

load_dotenv(".env.development")

MAX_PAGES = 1
JOB_TITLES = ["Web developer"]

def create_scraping_tasks(keywords, max_pages):
    tasks = []
    for keyword in keywords:
        for page in range(max_pages):
            tasks.append({
                "keyword": keyword,
                "page": page
            })
    random.shuffle(tasks)
    return tasks

def fetch_jobs_page(api_key, keyword, next_token=None):
    url = "https://api.scrapingdog.com/google_jobs"
    
    params = {
        "api_key": api_key,
        "query": keyword,
        "country": "ca"
    }
    if next_token:
        params["next_page_token"] = next_token
    
    try:
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error: {response.status_code} with keyword: {keyword}")
            return None
    except Exception as e:
        print(f"Exception occurred for keyword {keyword}: {e}")
        return None

def add_metadata(jobs, keyword):
    scrape_date = datetime.now().isoformat()
    for job in jobs:
        job["search_keyword"] = keyword
        job["scrape_date"] = scrape_date
    return jobs

def scrape_jobs(api_key, keywords, max_pages):
    tasks = create_scraping_tasks(keywords, max_pages)
    
    all_jobs = []
    tokens = {}
    keyword_counters = {}
    
    for i, task in enumerate(tasks, 1):
        keyword = task["keyword"]
        
        if keyword not in keyword_counters:
            keyword_counters[keyword] = 0
        keyword_counters[keyword] += 1
        current_page = keyword_counters[keyword]
        
        print(f"[{i}/{len(tasks)}] {keyword} - page [{current_page}/{max_pages}]")
        
        if i > 1:
            time.sleep(random.uniform(3, 7))
        
        next_token = tokens.get(keyword)
        data = fetch_jobs_page(api_key, keyword, next_token)
        
        if data:
            jobs = data.get("jobs_results", [])
            enriched_jobs = add_metadata(jobs, keyword)
            all_jobs.extend(enriched_jobs)
            
            new_token = data.get("scrapingdog_pagination", {}).get("next_page_token")
            if new_token:
                tokens[keyword] = new_token
    
    return all_jobs

def clean_text(text):
    if not text:
        return ""
    text = text.replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def clean_jobs(raw_jobs):
    cleaned_jobs = []
    
    for job in raw_jobs:
        cleaned = {
            "job_id": job.get("job_id", ""),
            "title": clean_text(job.get("title", "")),
            "company_name": clean_text(job.get("company_name", "")),
            "location": clean_text(job.get("location", "")),
            "description": clean_text(job.get("description", "")),
            "via": job.get("via", ""),
            "share_link": job.get("share_link", ""),
            "extensions": job.get("extensions", []),
            "search_keyword": job.get("search_keyword"),
            "scrape_date": job.get("scrape_date")
        }
        cleaned_jobs.append(cleaned)
    
    return cleaned_jobs

def save_jobs(jobs, output_dir="data-scraper", prefix="jobs"):
    os.makedirs(output_dir, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{output_dir}/{prefix}_{date_str}.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)
    
    return filename

def main():
    api_key = os.getenv("SCRAPING_API_KEY")
    
    raw_jobs = scrape_jobs(api_key, JOB_TITLES, MAX_PAGES)
    
    raw_filename = save_jobs(raw_jobs, prefix="jobs_raw")
    print(f"See raw data in file {raw_filename}")
    
    cleaned_jobs = clean_jobs(raw_jobs)
    
    cleaned_filename = save_jobs(cleaned_jobs, prefix="jobs_cleaned")
    print(f"See cleaned data in file {cleaned_filename}")
    
    print(f"Job Scraper Job Complete! ({len(cleaned_jobs)} jobs saved)")

if __name__ == "__main__":
    main()