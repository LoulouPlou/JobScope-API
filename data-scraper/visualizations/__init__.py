"""
Visualizations package.
Generates charts and processes analytics data.
"""
import os

# Ensure output directories exist
os.makedirs("data-scraper/db1", exist_ok=True)
os.makedirs("data-scraper/db2", exist_ok=True)

from .data_processors import (
    get_job_types_data,
    get_top_cities_data,
    get_top_10_languages,
    get_top_5_technologies_by_domain
)

from .charts import (
    create_job_type_pie,
    create_top_5_cities,
    create_top_10_languages,
    create_top_5_technologies_by_domain
)

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
    
    # Dashboard 2
    print("\nDashboard 2:")
    
    fig = create_top_5_technologies_by_domain(None)
    if fig:
        fig.write_html("data-scraper/db2/top_tech_all.html")
        print("\tTop 5 Technologies (All)")
        charts_created += 1
    
    return {"charts_created": charts_created}

__all__ = [
    'get_job_types_data',
    'get_top_cities_data',
    'get_top_10_languages',
    'get_top_5_technologies_by_domain',
    'create_job_type_pie',
    'create_top_5_cities',
    'create_top_10_languages',
    'create_top_5_technologies_by_domain',
    'generate_all_charts'
]