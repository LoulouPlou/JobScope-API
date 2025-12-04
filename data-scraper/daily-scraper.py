import requests
import json
import time
from datetime import datetime
import pandas as pd
import random
import re
import os
from dotenv import load_dotenv
from keywords import JOB_TITLES

load_dotenv(".env.development")

MAX_PAGES = 1
# JOB_TITLES = ["Web developer"]

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
    valid_jobs = []
    
    for job in jobs:
        if not isinstance(job, dict):
            print(f"Skipping invalid job entry (not a dict): {type(job)}")
            continue
           
        try:
            job["search_keyword"] = keyword
            job["scrape_date"] = scrape_date
            valid_jobs.append(job)
        except Exception as e:
            print(f"Error adding metadata to job: {e}")
            continue
    
    return valid_jobs

def scrape_jobs(api_key, keywords, max_pages):
    tasks = create_scraping_tasks(keywords, max_pages)
    
    all_jobs = []
    tokens = {}
    keyword_counters = {}
    errors = []
    
    for i, task in enumerate(tasks, 1):
        keyword = task["keyword"]
        
        try:
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
                
                # checks if job is a list
                if not isinstance(jobs, list):
                    print(f"Unexpected jobs_results format: {type(jobs)}")
                    errors.append({"keyword": keyword, "error": "Invalid jobs_results format"})
                    continue
                
                enriched_jobs = add_metadata(jobs, keyword)
                all_jobs.extend(enriched_jobs)
                
                new_token = data.get("scrapingdog_pagination", {}).get("next_page_token")
                if new_token:
                    tokens[keyword] = new_token
            else:
                errors.append({"keyword": keyword, "error": "No data returned"})
                
        except Exception as e:
            print(f"Error processing {keyword}: {e}")
            errors.append({"keyword": keyword, "error": str(e)})
            continue
    
    if errors:
        print(f"{len(errors)} keywords had errors:")
        for error in errors:
            print(f"Error for keyword {error['keyword']}: {error['error']}")
    
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
        try:
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
        except Exception as e:
            print(f"Error cleaning job: {e}")
            continue
    
    return cleaned_jobs

def save_jobs(jobs, output_dir="data-scraper", prefix="jobs"):
    os.makedirs(output_dir, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{output_dir}/{prefix}_{date_str}.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)
    
    return filename

def append_to_master(new_jobs, output_dir="data-scraper"):
    os.makedirs(output_dir, exist_ok=True)
    master_file = f"{output_dir}/jobs_master.json"
    
    if os.path.exists(master_file):
        try:
            with open(master_file, 'r', encoding='utf-8') as f:
                master_jobs = json.load(f)
        except json.JSONDecodeError:
            print(f"Warning: Could not load master file, starting new")
            master_jobs = []
    else:
        master_jobs = []
    
    master_dict = {job.get("job_id"): job for job in master_jobs if job.get("job_id")}
    
    new_count = 0
    updated_count = 0
    
    for job in new_jobs:
        job_id = job.get("job_id")
        if not job_id:
            continue
            
        # if exists -> update, else new
        if job_id in master_dict:
            master_dict[job_id] = job
            updated_count += 1
        else:
            master_dict[job_id] = job
            new_count += 1
    
    master_jobs = list(master_dict.values())
    
    with open(master_file, 'w', encoding='utf-8') as f:
        json.dump(master_jobs, f, ensure_ascii=False, indent=2)
    
    return master_file, new_count, updated_count, len(master_jobs)

def main():
    api_key = os.getenv("SCRAPING_API_KEY")
    
    try:
        raw_jobs = scrape_jobs(api_key, JOB_TITLES, MAX_PAGES)
        
        raw_filename = save_jobs(raw_jobs, prefix="jobs_raw")
        print(f"See raw data in file {raw_filename}")
        
        cleaned_jobs = clean_jobs(raw_jobs)
        master_file, new_count, updated_count, total_count = append_to_master(cleaned_jobs)
        print(f"Master file: {master_file}")
        print(f"New jobs: {new_count}")
        print(f"Updated jobs: {updated_count}")
        print(f"Total in database: {total_count}")
        
        cleaned_filename = save_jobs(cleaned_jobs, prefix="jobs_cleaned")
        print(f"See today's cleaned data in file {cleaned_filename}")
        
        print(f"Job Scraper Job Complete!")
        
    except Exception as e:
        print(f"Fatal error in main: {e}")
        if 'raw_jobs' in locals() and raw_jobs:
            emergency_filename = save_jobs(raw_jobs, prefix="jobs_emergency")
            print(f"Emergency save: {emergency_filename}")

if __name__ == "__main__":
    main()