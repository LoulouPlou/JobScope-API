"""
Data processing functions for analytics.
Each function returns data in MongoDB-ready format.
"""
import json
from collections import Counter
from keywords import BUZZWORDS_TECH, JOBS

def load_master_jobs():
    """Load master jobs from JSON file."""
    with open("data-scraper/data/jobs_master.json", 'r', encoding='utf-8') as f:
        return json.load(f)

def load_jobs_analysis():
    """Load jobs analysis from JSON file."""
    with open("data-scraper/data/jobs_analysis.json", 'r', encoding='utf-8') as f:
        return json.load(f)

def get_job_types_data():
    """Returns job types distribution data."""
    jobs = load_master_jobs()
    
    job_types = {
        "Full-time": 0,
        "Contractor": 0,
        "Part-time": 0,
        "Internship": 0
    }
    
    for job in jobs:
        extensions = job.get('extensions', [])
        
        if "Full-time" in extensions:
            job_types["Full-time"] += 1
        if "Contractor" in extensions:
            job_types["Contractor"] += 1
        if "Part-time" in extensions:
            job_types["Part-time"] += 1
        if "Internship" in extensions:
            job_types["Internship"] += 1
    
    job_types = {k: v for k, v in job_types.items() if v > 0}
    total = sum(job_types.values())
    
    data = []
    for label, value in job_types.items():
        data.append({
            "label": label,
            "value": value,
            "percentage": round((value / total * 100), 1) if total > 0 else 0
        })
    
    return {
        "data": data,
        "total_jobs": len(jobs)
    }

def get_top_cities_data():
    """Returns top 5 cities data."""
    jobs = load_master_jobs()
    
    city_counter = Counter()
    for job in jobs:
        location = job.get('location', '').strip()
        if location:
            city_counter[location] += 1
    
    top_5 = city_counter.most_common(5)
    
    data = [{"city": city, "count": count} for city, count in top_5]
    
    return {
        "data": data,
        "total_cities": len(city_counter)
    }

def get_top_10_languages():
    """Returns top 10 programming languages."""
    analysis = load_jobs_analysis()
    
    languages = {b["term"] for b in BUZZWORDS_TECH if b["category"] == "Programming Language"}
    
    language_counter = Counter()
    
    for result in analysis:
        buzzwords = result.get("buzzwords_found", {})
        for buzzword, count in buzzwords.items():
            if buzzword in languages:
                language_counter[buzzword] += count
    
    top_10 = language_counter.most_common(10)
    
    data = [{"language": lang, "mentions": count} for lang, count in top_10]
    
    return {
        "data": data,
        "total_mentions": sum(language_counter.values())
    }

def get_top_5_technologies_by_domain(domain=None):
    """
    Returns top 5 technologies for a specific domain.
    
    Args:
        domain: "Web", "Data", "DevOps", "Mobile", etc. If None, returns all domains.
    """
    analysis = load_jobs_analysis()
    
    job_domain_map = {job["title"]: job["category"] for job in JOBS}
    
    filtered_analysis = [
        result for result in analysis
        if domain is None or job_domain_map.get(result.get("search_keyword", "")) == domain
    ]
    
    tech_counter = Counter()
    buzzword_lookup = {b["term"]: b for b in BUZZWORDS_TECH}
    
    for result in filtered_analysis:
        buzzwords = result.get("buzzwords_found", {})
        for buzzword, count in buzzwords.items():
            info = buzzword_lookup.get(buzzword, {})
            if info.get("type", "") == "Hard Skill":
                tech_counter[buzzword] += count
    
    top_5 = tech_counter.most_common(5)
    
    data = [
        {
            "technology": tech,
            "mentions": count,
            "category": buzzword_lookup.get(tech, {}).get("category", "Unknown")
        }
        for tech, count in top_5
    ]
    
    return {
        "data": data,
        "domain": domain or "All",
        "total_jobs": len(filtered_analysis),
        "total_mentions": sum(tech_counter.values())
    }