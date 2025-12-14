"""
Visualizations package.
Generates charts and processes analytics data.
"""
import os

# Ensure output directories exist
os.makedirs("data-scraper/db1", exist_ok=True)
os.makedirs("data-scraper/db2", exist_ok=True)

from .data_processors import (
    get_job_types,
    get_top_cities,
    get_top_10_languages,
    get_top_5_technologies_by_domain,
    get_top_soft_skills,
    get_top_hard_skills_no_languages,
    get_skills_by_category_for_domain,
    get_seniority_distribution_by_domain
)

from .charts import (
    create_job_type_pie,
    create_top_5_cities,
    create_top_10_languages,
    create_top_5_technologies_by_domain,
    create_top_soft_skills_chart,
    create_top_hard_skills_no_languages_chart,
    create_skills_radar_by_domain,
    create_seniority_donut_by_domain
)

DOMAINS = ["Web", "Mobile", "DevOps", "Data", "QA & Security", "Design", "Management"]

def generate_all_charts():
    """Generate all visualization charts."""
    
    charts_created = 0
    
    # Dashboard 1
    print("\nDashboard 1:")
    
    fig = create_top_5_cities()
    fig.write_html("data-scraper/db1/top_cities.html")
    print("\tTop 5 Cities")
    charts_created += 1
    
    fig = create_job_type_pie()
    fig.write_html("data-scraper/db1/job_types.html")
    print("\tJob Types")
    charts_created += 1
    
    fig = create_top_10_languages()
    fig.write_html("data-scraper/db1/top_languages.html")
    print("\tTop 10 Languages")
    charts_created += 1
    
    fig = create_top_soft_skills_chart()
    fig.write_html("data-scraper/db1/top_soft-skills.html")
    print("\tTop 10 Soft Skills")
    charts_created += 1
    
    fig = create_top_hard_skills_no_languages_chart()
    fig.write_html("data-scraper/db1/top_hard-skills.html")
    print("\tTop 10 Hard Skills - No Languages")
    charts_created += 1
    
    # Dashboard 2
    print("\nDashboard 2:")
    
    for domain in DOMAINS:
        fig = create_top_5_technologies_by_domain(domain)
        if fig:
            filename = f"data-scraper/db2/top_tech_{domain.lower().replace(' ', '_').replace('&', 'and')}.html"
            fig.write_html(filename)
            print(f"\t Top 5 technologies for domain: {domain}")
            charts_created += 1
        
    for domain in DOMAINS:
        fig = create_skills_radar_by_domain(domain)
        if fig:
            filename = f"data-scraper/db2/radar_{domain.lower().replace(' ', '_').replace('&', 'and')}.html"
            fig.write_html(filename)
            print(f"\t Skills radar for domain: {domain}")
            charts_created += 1
            
    for domain in DOMAINS:
        fig = create_top_5_cities(domain)
        if fig:
            filename = f"data-scraper/db2/top_cities_{domain.lower().replace(' ', '_').replace('&', 'and')}.html"
            fig.write_html(filename)
            print(f"\t Top 5 cities for domain: {domain}")
            charts_created += 1
    
    for domain in DOMAINS:
        fig = create_seniority_donut_by_domain(domain)
        if fig:
            filename = f"data-scraper/db2/seniority_dist_{domain.lower().replace(' ', '_').replace('&', 'and')}.html"
            fig.write_html(filename)
            print(f"\t Seniority distribution for domain: {domain}")
            charts_created += 1
    
    return {"charts_created": charts_created}

__all__ = [
    'get_job_types',
    'get_top_cities',
    'get_top_10_languages',
    'get_top_5_technologies_by_domain',
    'get_top_soft_skills',
    'get_top_hard_skills_no_languages',
    'get_skills_by_category_for_domain',
    'get_seniority_distribution_by_domain',
    'create_job_type_pie',
    'create_top_5_cities',
    'create_top_10_languages',
    'create_top_5_technologies_by_domain',
    'create_top_soft_skills_chart',
    'create_top_hard_skills_no_languages_chart',
    'create_skils_radar_by_domain',
    'create_seniority_donut_by_domain'
    'generate_all_charts'
]