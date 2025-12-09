import os
import json
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
from visualizations.data_processors import (
    get_job_types_data,
    get_top_cities_data,
    get_top_10_languages,
    get_top_5_technologies_by_domain,
    get_top_soft_skills,
    get_top_hard_skills_no_languages,
    get_skills_by_category_for_domain
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
def transform_job_for_mongo(job, analysis_result=None):
    """
    Transform scraped job to MongoDB schema.
    
    Args:
        job: Raw job from jobs_master.json
        analysis_result: Corresponding analysis from jobs_analysis.json
    """
    # Extract job type from extensions
    job_type = "Full-time"  # Default
    extensions = job.get('extensions', [])
    if "Contractor" in extensions or "Contract" in extensions:
        job_type = "Contract"
    elif "Part-time" in extensions:
        job_type = "Part-time"
    elif "Internship" in extensions:
        job_type = "Internship"
    
    # Extract posted time
    posted_time = None
    for ext in extensions:
        if "ago" in ext.lower() or "day" in ext.lower() or "hour" in ext.lower():
            posted_time = ext
            break
    
    # Get skills and tags from analysis
    skills = []
    tags = []
    if analysis_result:
        buzzwords = analysis_result.get("buzzwords_found", {})
        sorted_buzzwords = sorted(buzzwords.items(), key=lambda x: x[1], reverse=True)
        
        skills = [bw for bw, count in sorted_buzzwords]
        
        tags = [bw for bw, count in sorted_buzzwords[:3]]
    
    # Build MongoDB document
    mongo_job = {
        "jobId": job.get("job_id", ""),
        "title": job.get("title", ""),
        "company": job.get("company_name", ""),
        "location": job.get("location", ""),
        "jobType": job_type,
        "experience": analysis_result.get("experience_level", "") if analysis_result else "",
        "description": job.get("description", ""),
        "skills": skills,
        "tags": tags,
        "postedOn": job.get("via", ""),
        "publishedTime": posted_time
    }
    
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
    
    jobs_collection.create_index("jobId", unique=True)
    
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
    print("  [1/?] Job types distribution...")
    job_types_result = get_job_types_data()
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
    
    # Top Cities
    print("  [2/?] Top cities...")
    cities_result = get_top_cities_data()
    analytics_collection.update_one(
        {"type": "top_cities"},
        {"$set": {
            "type": "top_cities",
            "title": "Top 5 Cities",
            "chart_type": "horizontal_bar",
            "data": cities_result["data"],
            "metadata": {
                "total_cities": cities_result["total_cities"],
                "last_updated": datetime.now()
            }
        }},
        upsert=True
    )
    
    # Top Languages
    print("  [3/?] Top programming languages...")
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
    
    print("  [4/?] Top soft skills...")
    softskills_result = get_top_soft_skills()
    analytics_collection.update_one(
        {"type": "top_soft_skills"},
        {"$set": {
            "type": "top_programming_languages",
            "title": "Top 10 Soft Skills",
            "chart_type": "horizontal_bar",
            "data": softskills_result["data"],
            "metadata": {
                "total_mentions": softskills_result["total_mentions"],
                "last_updated": datetime.now()
            }
        }},
        upsert=True
    )
    
    print("  [5/?] Top hard skills no languages...")
    hardskills_result = get_top_hard_skills_no_languages()
    analytics_collection.update_one(
        {"type": "top_hard_skills_no_lang"},
        {"$set": {
            "type": "top_programming_languages",
            "title": "Top 10 Hard Skills (Excluding Languages)",
            "chart_type": "horizontal_bar",
            "data": hardskills_result["data"],
            "metadata": {
                "total_mentions": hardskills_result["total_mentions"],
                "last_updated": datetime.now()
            }
        }},
        upsert=True
    )
    
    # Top Technologies by IT Domain
    print("  [6/?] Top technologies by domain...")
    for domain in DOMAINS:
        result = get_top_5_technologies_by_domain(domain)
        analytics_collection.update_one(
            {"type": "top_technologies_by_domain", "domain": domain},
            {"$set": {
                "type": "top_technologies_by_domain",
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
        
    print("  [7/?] Skills Radar by domain...")
    for domain in DOMAINS:
        result = get_skills_by_category_for_domain(domain)
        
        domain_key = domain.lower().replace(' ', '_').replace('&', 'and')
        
        analytics_collection.update_one(
            {"type": f"radar_domain_{domain_key}"},
            {"$set": {
                "type": f"radar_domain_{domain_key}",
                "domain": domain,
                "data": result["data"],
                "metadata": {
                    "total_categories": result["total_categories"],
                    "total_mentions": result["total_mentions"],
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