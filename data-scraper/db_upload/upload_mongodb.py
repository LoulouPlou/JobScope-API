import os
import json
from datetime import datetime, timedelta
import re
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
from visualizations.data_processors import (
    get_job_types,
    get_top_cities,
    get_top_10_languages,
    get_top_5_technologies_by_domain,
    get_top_soft_skills,
    get_top_hard_skills_no_languages,
    get_skills_by_category_for_domain,
    get_seniority_distribution_by_domain
)

load_dotenv(".env.development")

DOMAINS = ["Web", "Mobile", "DevOps", "Data", "QA & Security", "Design", "Management"]

def get_mongodb_connection():
    """Returns MongoDB client and database."""
    mongo_uri = os.getenv("MONGO_URI")
    
    if not mongo_uri:
        raise ValueError("MONGO_URI not found in environment variables")
    
    client = MongoClient(mongo_uri)
    db = client.get_default_database()
    
    return client, db

# JOBS SYNC
def extract_job_type(extensions):
    """
    Extract job type from extensions.
    
    Args:
        extensions: List of strings like ["Full-time", "2 days ago", "$80K a year"]
    
    Returns:
        Job type string: "Full-time", "Contract", "Part-time", or "Internship"
    """
    if not extensions:
        return "Full-time"  # Default
    
    # Check in priority order
    if any(term in extensions for term in ["Contractor", "Contract"]):
        return "Contract"
    elif "Part-time" in extensions:
        return "Part-time"
    elif "Internship" in extensions:
        return "Internship"
    elif "Full-time" in extensions:
        return "Full-time"
    
    return "Full-time"

def extract_salary_from_extensions(extensions):
    """
    Extract salary information from extensions. Just looks for $ sign...
        Args:
        extensions: List of strings
    
    Returns:
        String like "$45K–$55K a year" or None
    """
    if not extensions:
        return None
    
    for ext in extensions:
        ext_str = str(ext)
        if '$' in ext_str:
            return ext_str.strip()
    
    return None

def extract_posted_time(extensions):
    """
    Extract posted time string from extensions.
    
    Args:
        extensions: List of strings
    
    Returns:
        String like "2 days ago" or None
    """
    if not extensions:
        return None
    
    for ext in extensions:
        ext_str = str(ext).lower()
        if any(word in ext_str for word in ["ago", "day", "hour", "week", "month"]):
            return str(ext)
    
    return None


def parse_posted_time(time_str):
    if not time_str:
        return None
    
    time_str_lower = time_str.lower() 
    
    try:
        number_match = re.search(r'(\d+)', time_str_lower)
        if not number_match:
            return None
        
        value = int(number_match.group(1))
        now = datetime.now()
        
        if 'hour' in time_str_lower:
            date = now - timedelta(hours=value)
        elif 'day' in time_str_lower:
            date = now - timedelta(days=value)
        elif 'week' in time_str_lower:
            date = now - timedelta(weeks=value)
        elif 'month' in time_str_lower:
            date = now - timedelta(days=value * 30)
        elif 'year' in time_str_lower:
            date = now - timedelta(days=value * 365)
        else:
            return None
        
        return date.isoformat()
    
    except Exception as e:
        print(f"Error parsing time '{time_str}': {e}")
        return None


def transform_job_for_mongo(job, analysis_result=None):
    """
    Transform scraped job to MongoDB schema.
    Only includes non-empty fields.
    """
    extensions = job.get('extensions', [])
    
    job_type = extract_job_type(extensions)
    salary = extract_salary_from_extensions(extensions)
    
    posted_time_raw = extract_posted_time(extensions)
    
    if posted_time_raw:
        posted_date = parse_posted_time(posted_time_raw)  
    else:
        posted_date = None
    
    # scrape_date if no posted_date
    if not posted_date:
        scrape_date = job.get("scrape_date")
        if scrape_date:
            posted_date = scrape_date
        else:
            posted_date = datetime.now().isoformat()
    
    skills = []
    tags = []
    experience = ""
    
    if analysis_result:
        buzzwords = analysis_result.get("buzzwords_found", {})
        sorted_buzzwords = sorted(buzzwords.items(), key=lambda x: x[1], reverse=True)
        
        skills = [bw for bw, count in sorted_buzzwords]
        tags = [bw for bw, count in sorted_buzzwords[:3]]
        experience = analysis_result.get("experience_level", "")
    
    mongo_job = {
        "jobId": job.get("job_id", ""),
        "title": job.get("title", ""),
        "company": job.get("company_name", ""),
        "location": job.get("location", ""),
        "description": job.get("description", ""),
        "jobType": job_type,
        "publishedTime": posted_date,
    }
    
    # optional fields only if not empty
    if experience:
        mongo_job["experience"] = experience
    
    if skills:
        mongo_job["skills"] = skills
    
    if tags:
        mongo_job["tags"] = tags
    
    if salary:
        mongo_job["salary"] = salary
    
    if job.get("via"):
        mongo_job["postedOn"] = job.get("via")
    
    return mongo_job

def upload_jobs():
    """Upload master jobs to MongoDB."""
    import json
    
    print("\n[JOBS] Loading data...")
    
    # Load jobs
    with open("data-scraper/data/jobs_master.json", 'r', encoding='utf-8') as f:
        jobs = json.load(f)
    
    # Load analysis
    with open("data-scraper/data/jobs_analysis.json", 'r', encoding='utf-8') as f:
        analysis = json.load(f)
    
    analysis_lookup = {a.get("job_id"): a for a in analysis}
    
    client, db = get_mongodb_connection()
    jobs_collection = db["jobs"]
    
    # jobs_collection.create_index("jobId", unique=True)
    
    print(f"[JOBS] Syncing {len(jobs)} jobs to MongoDB...")
    
    new_jobs = 0
    updated_jobs = 0
    
    for job in jobs:
        job_id = job.get("job_id")
        if not job_id:
            continue
        
        analysis_result = analysis_lookup.get(job_id)
        mongo_job = transform_job_for_mongo(job, analysis_result)
        
        # Update or Insert (checks jobId)
        result = jobs_collection.update_one(
            {"jobId": job_id},
            {
                "$set": {
                    **mongo_job,
                    "updatedAt": datetime.now()
                },
                "$setOnInsert": {
                    "createdAt": datetime.now()
                }
            },
            upsert=True
        )
        
        if result.upserted_id:
            new_jobs += 1
        else:
            updated_jobs += 1
    
    client.close()
    
    print(f"Jobs synced!")
    print(f"- New jobs: {new_jobs}")
    print(f"- Updated jobs: {updated_jobs}")
    print(f"- Total: {len(jobs)}")
    
    return {
        "new_jobs": new_jobs,
        "updated_jobs": updated_jobs,
        "total_jobs": len(jobs)
    }


# ANALYTICS SYNC
def upload_analytics():
    """Upload all analytics to MongoDB."""
    print("\n[ANALYTICS] Uploading analytics to MongoDB...")
    
    client, db = get_mongodb_connection()
    analytics_collection = db["analytics"]
    
    # Job Types
    print("  [1/9] Job types distribution...")
    job_types_result = get_job_types()
    analytics_collection.update_one(
        {"type": "job_type_distribution"},
        {"$set": {
            "type": "job_type_distribution",
            "title": "Job Types Distribution",
            "chart_type": "pie",
            "data": job_types_result["data"],
            "metadata": {
                "total_jobs": job_types_result["total_jobs"],
                "last_updated": datetime.now()
            }
        }},
        upsert=True
    )
    
    # Top Cities (Global)
    print("  [2/9] Top cities...")
    cities_result = get_top_cities()
    analytics_collection.update_one(
        {"type": "top_cities"},
        {"$set": {
            "type": "top_cities",
            "title": "Top 5 Cities",
            "chart_type": "horizontal_bar",
            "data": cities_result["data"],
            "metadata": {
                "total_location": cities_result["total_locations"],
                "total_jobs": cities_result["total_jobs"],
                "last_updated": datetime.now()
            }
        }},
        upsert=True
    )
    
    # Top Languages
    print("  [3/9] Top programming languages...")
    languages_result = get_top_10_languages()
    analytics_collection.update_one(
        {"type": "top_programming_languages"},
        {"$set": {
            "type": "top_programming_languages",
            "title": "Top 10 Programming Languages",
            "chart_type": "horizontal_bar",
            "data": languages_result["data"],
            "metadata": {
                "total_mentions": languages_result["total_mentions"],
                "last_updated": datetime.now()
            }
        }},
        upsert=True
    )
    
    # Top Soft Skills
    print("  [4/9] Top soft skills...")
    softskills_result = get_top_soft_skills()
    analytics_collection.update_one(
        {"type": "top_soft_skills"},
        {"$set": {
            "type": "top_soft_skills",
            "title": "Top 10 Soft Skills",
            "chart_type": "bar",
            "data": softskills_result["data"],
            "metadata": {
                "total_mentions": softskills_result["total_mentions"],
                "last_updated": datetime.now()
            }
        }},
        upsert=True
    )
    
    # Top Hard Skills
    print("  [5/9] Top hard skills no languages...")
    hardskills_result = get_top_hard_skills_no_languages()
    analytics_collection.update_one(
        {"type": "top_hard_skills_no_lang"},
        {"$set": {
            "type": "top_hard_skills_no_lang",
            "title": "Top 10 Hard Skills (Excluding Languages)",
            "chart_type": "bar",
            "data": hardskills_result["data"],
            "metadata": {
                "total_mentions": hardskills_result["total_mentions"],
                "last_updated": datetime.now()
            }
        }},
        upsert=True
    )
    
    # Top Technologies by IT Domain
    print("  [6/9] Top technologies by domain...")
    for domain in DOMAINS:
        result = get_top_5_technologies_by_domain(domain)
        
        domain_key = domain.lower().replace(' ', '_').replace('&', 'and')
        
        analytics_collection.update_one(
            {"type": f"top_technologies_{domain_key}"},
            {"$set": {
                "type": f"top_technologies_{domain_key}",
                "title": f"Top 5 Technologies - {domain}",
                "chart_type": "horizontal_bar",
                "domain": domain,
                "data": result["data"],
                "metadata": {
                    "total_jobs": result["total_jobs"],
                    "total_mentions": result["total_mentions"],
                    "last_updated": datetime.now()
                }
            }},
            upsert=True
        )
        
    print("  [7/9] Skills Radar by domain...")
    for domain in DOMAINS:
        result = get_skills_by_category_for_domain(domain)
        
        domain_key = domain.lower().replace(' ', '_').replace('&', 'and')
        
        analytics_collection.update_one(
            {"type": f"radar_domain_{domain_key}"},
            {"$set": {
                "type": f"radar_domain_{domain_key}",
                "title": f"Skills Distribution - {domain} Domain",
                "domain": domain,
                "chart_type": "radar",
                "data": result["data"],
                "metadata": {
                    "total_categories": result["total_categories"],
                    "total_mentions": result["total_mentions"],
                    "last_updated": datetime.now()
                }
            }},
            upsert=True
        )
        
    print("  [8/9] Top cities by domain...")
    for domain in DOMAINS:
        cities_result = get_top_cities(domain)
        
        domain_key = domain.lower().replace(' ', '_').replace('&', 'and')
        
        analytics_collection.update_one(
            {"type": f"top_cities_{domain_key}"},
            {"$set": {
                "type": f"top_cities_{domain_key}",
                "title": f"Top 5 Cities - {domain}",
                "chart_type": "horizontal_bar",
                "domain": domain,
                "data": cities_result["data"],
                "metadata": {
                    "total_locations": cities_result["total_locations"],
                    "last_updated": datetime.now()
                }
            }},
            upsert=True
        )
        
    print("  [9/9] Senority distribution by domain...")
    for domain in DOMAINS:
        seniority_result = get_seniority_distribution_by_domain(domain)
        
        domain_key = domain.lower().replace(' ', '_').replace('&', 'and')
        
        analytics_collection.update_one(
            {"type": f"seniority_distribution_{domain_key}"},
            {"$set": {
                "type": f"seniority_distribution_{domain_key}",
                "title": f"Seniority distribution for jobs offers in {domain}",
                "chart_type": "donut",
                "domain": domain,
                "data": seniority_result["data"],
                "metadata": {
                    "total_jobs": seniority_result["total_jobs"],
                    "last_updated": datetime.now()
                }
            }},
            upsert=True
        )
    
    client.close()
    
    print("Analytics uploaded!")
    
    return {
        "analytics_uploaded": 4 + len(DOMAINS)
    }


# MAIN SYNC FUNCTION
def sync_all_to_mongodb():
    
    jobs_stats = upload_jobs()
    analytics_stats = upload_analytics()
    
    return {
        **jobs_stats,
        **analytics_stats
    }