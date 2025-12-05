import requests
import json
import time
from datetime import datetime
import pandas as pd
import random
import re
import os
from collections import Counter
from dotenv import load_dotenv
from keywords import JOB_TITLES, BUZZWORDS_TECH

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
            
            print(f"\t[{i}/{len(tasks)}] {keyword} - page [{current_page}/{max_pages}]")
            
            if i > 1:
                time.sleep(random.uniform(5, 14))
            
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
            highlights_text = ""
            highlights = job.get("job_highlights", [])
            for section in highlights:
                if isinstance(section, dict):
                    highlights_text += " ".join(section.get("items", []))
            
            cleaned = {
                "job_id": job.get("job_id", ""),
                "title": clean_text(job.get("title", "")),
                "company_name": clean_text(job.get("company_name", "")),
                "location": clean_text(job.get("location", "")),
                "description": clean_text(job.get("description", "")),
                "via": job.get("via", ""),
                "share_link": job.get("share_link", ""),
                "extensions": job.get("extensions", []),
                "highlights": clean_text(highlights_text),
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

def append_new_jobs_to_master(new_jobs, output_dir="data-scraper"):
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

def normalize_text(text):
    if not text:
        return ""
    return text.lower()

def find_buzzwords_in_text(text, buzzwords):
    text_normalized = normalize_text(text)
    found_buzzwords = []
    
    for buzzword in buzzwords:
        term = buzzword["term"].lower()
        pattern = r'\b' + re.escape(term) + r'\b'
        matches = re.findall(pattern, text_normalized)
        
        if matches:
            found_buzzwords.extend([buzzword["term"]] * len(matches))
    
    return Counter(found_buzzwords)

def extract_experience_level(job):
    title = job.get("title", "").lower()
    highlights = job.get("highlights", "").lower()
    description = job.get("description", "").lower()
    
    full_text = f"{title} {highlights} {description}"
    
    year_patterns = [
        r'(\d+)\+\s*(?:years?|yrs?)',       # 5+ years
        r'(\d+)-(\d+)\s*(?:years?|yrs?)',   # 3-5 years
    ]
    
    years_found = []
    
    for pattern in year_patterns:
        matches = re.findall(pattern, full_text)
        for match in matches:
            if isinstance(match, tuple):
                years_found.extend([int(y) for y in match if y])
            else:
                years_found.append(int(match))
    
    if "junior" in title:
        return "Junior"
    
    if "senior" in title:
        return "Senior"
    
    if years_found:
        max_years = max(years_found)
        
        if max_years >= 10:
            return "Lead"
        elif max_years >= 5:
            return "Senior"
        elif max_years >= 2:
            return "Mid"
        else:
            return "Junior"
    
    if "junior" in full_text:
        return "Junior"
    
    if "senior" in full_text:
        return "Senior"
    
    return "Mid"

def analyze_job(job, buzzwords):
    full_text = f"{job.get('title', '')} {job.get('description', '')} {job.get('highlights', '')}"
    
    buzzwords_found = find_buzzwords_in_text(full_text, buzzwords)
    experience_level = extract_experience_level(job)
    
    return {
        "job_id": job.get("job_id", ""),
        "title": job.get("title", ""),
        "company_name": job.get("company_name", ""),
        "location": job.get("location", ""),
        "search_keyword": job.get("search_keyword", ""),
        "experience_level": experience_level,
        "buzzwords_found": dict(buzzwords_found),
        "total_buzzwords": sum(buzzwords_found.values()),
        "unique_buzzwords": len(buzzwords_found)
    }
    
def save_analysis(analysis_results, output_dir="data-scraper"):
    filename = f"{output_dir}/jobs_analysis.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(analysis_results, f, ensure_ascii=False, indent=2)
    
    return filename


def analyze_all_jobs(jobs, buzzwords):
    results = []
    for job in jobs:
        result = analyze_job(job, buzzwords)
        results.append(result)
    return results


def main():
    api_key = os.getenv("SCRAPING_API_KEY")

    print("STARTING JOB SCRAPER...")
    
    try:
        # STEP 1 - Scrape
        print("\n[1/4] Scraping jobs...")
        raw_jobs = scrape_jobs(api_key, JOB_TITLES, MAX_PAGES)
        raw_filename = save_jobs(raw_jobs, prefix="jobs_raw")
        print(f"See raw data in file {raw_filename}")
        
        # STEP 2 - Clean
        print("\n[2/4] Cleaning jobs...")
        cleaned_jobs = clean_jobs(raw_jobs)
        cleaned_filename = save_jobs(cleaned_jobs, prefix="jobs_cleaned")
        print(f"See today's cleaned data in file {cleaned_filename}")
        
        # STEP 3 - Update master
        print("\n[3/4] Updating master database...")
        master_file, new_count, updated_count, total_count = append_new_jobs_to_master(cleaned_jobs)
        print(f"Master file: {master_file}")
        print(f"New jobs: {new_count}")
        print(f"Updated jobs: {updated_count}")
        print(f"Total in database: {total_count}")
    
        # STEP 4: Analyze buzzwords
        # master_file = 'data-scraper/jobs_master.json' # for re-running step 4 purposes
        print("\n[4/4] Analyzing buzzwords...")
        with open(master_file, 'r', encoding='utf-8') as f:
            all_jobs = json.load(f)
        
        analysis_results = analyze_all_jobs(all_jobs, BUZZWORDS_TECH)
        analysis_file = save_analysis(analysis_results)
        print(f"See updated buzzwords analysis {analysis_file}")
        
        print(f"\nJOB SCRAPER COMPLETE!")
        
    except Exception as e:
        print(f"Fatal error in main: {e}")
        if 'raw_jobs' in locals() and raw_jobs:
            emergency_filename = save_jobs(raw_jobs, prefix="jobs_emergency")
            print(f"Emergency save: {emergency_filename}")

if __name__ == "__main__":
    main()