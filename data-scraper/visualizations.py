import json
import pandas as pd
import plotly.express as px
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
from keywords import BUZZWORDS_TECH, JOBS
from collections import Counter

load_dotenv(".env.development")

DOMAINS = ["Web", "Mobile", "DevOps", "Data", "QA & Security", "Design", "Management"]

def load_master_jobs():
    with open("data-scraper/jobs_master.json", 'r', encoding='utf-8') as f:
        return json.load(f)

def load_jobs_analysis():
    with open("data-scraper/jobs_analysis.json", 'r', encoding='utf-8') as f:
        return json.load(f)

def get_job_types_data():
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
    jobs = load_master_jobs()
    
    from collections import Counter
    
    city_counter = Counter()
    for job in jobs:
        location = job.get('location', '').strip()
        if location:
            city_counter[location] += 1
    
    top_5 = city_counter.most_common(5)
    
    data = []
    for city, count in top_5:
        data.append({
            "city": city,
            "count": count
        })
    
    return {
        "data": data,
        "total_cities": len(city_counter)
    }
    
def get_top_10_languages():
    analysis = load_jobs_analysis()
    
    languages = {b["term"] for b in BUZZWORDS_TECH if b["category"] == "Programming Language"}
    
    language_counter = Counter()
    
    for result in analysis:
        buzzwords = result.get("buzzwords_found", {})
        for buzzword in buzzwords:
            if buzzword in languages:
                language_counter[buzzword] += 1
    
    top_10 = language_counter.most_common(10)
    
    data = []
    for language, count in top_10:
        data.append({
            "language": language,
            "mentions": count
        })
    
    return {
        "data": data,
        "total_mentions": sum(language_counter.values())
    }

def get_top_5_technologies_by_domain(domain=None):
    analysis = load_jobs_analysis()
    
    from keywords import BUZZWORDS_TECH, JOBS
    from collections import Counter
    
    job_domain_map = {}
    for job in JOBS:
        job_domain_map[job["title"]] = job["category"]
    
    filtered_analysis = []
    for result in analysis:
        search_keyword = result.get("search_keyword", "")
        
        job_domain = job_domain_map.get(search_keyword)
        
        if domain is None or job_domain == domain:
            filtered_analysis.append(result)
    
    # All skills except soft skills
    tech_counter = Counter()
    buzzword_lookup = {b["term"]: b for b in BUZZWORDS_TECH}
    
    for result in filtered_analysis:
        buzzwords = result.get("buzzwords_found", {})
        for buzzword in buzzwords:
            info = buzzword_lookup.get(buzzword, {})
            bw_type = info.get("type", "")
            
            if bw_type == "Hard Skill":
                tech_counter[buzzword] += 1
    
    top_5 = tech_counter.most_common(5)
    
    data = []
    for tech, count in top_5:
        info = buzzword_lookup.get(tech, {})
        data.append({
            "technology": tech,
            "mentions": count,
            "category": info.get("category", "Unknown")
        })
    
    return {
        "data": data,
        "domain": domain or "All",
        "total_jobs": len(filtered_analysis),
        "total_mentions": sum(tech_counter.values())
    }

# VISUALIZATIONS
def create_job_type_pie():
    result = get_job_types_data()
    
    df_types = pd.DataFrame(result["data"])
    df_types.columns = ['Type', 'Count', 'Percentage']
    
    fig = px.pie(
        df_types,
        names='Type',
        values='Count',
        title="Job Types Distribution",
        hole=0.3,
        color_discrete_sequence=['#006989', "#3889B8", "#7BBEE6", '#BEE9E8']
    )
    
    fig.update_traces(
        textposition='auto',
        textinfo='label+percent',
        hovertemplate='<b>%{label}</b><br>Jobs: %{value}<br>Percentage: %{percent}<extra></extra>'
    )
    
    fig.update_layout(
        height=500,
        template='plotly_white',
        title_x=0.5,
        title_font_size=20
    )
    
    return fig

def create_top_5_cities():
    result = get_top_cities_data()
    
    df_cities = pd.DataFrame(result["data"])
    
    fig = px.bar(
        df_cities,
        x='count',
        y='city',
        orientation='h',
        labels={'count': "Number of job offers", 'city': ''},
        title="Top 5 Cities with the Most Job Offers",
        color='count',
        color_continuous_scale='Teal',
        text='count'
    )
    
    fig.update_traces(textposition='outside', textfont_size=14)
    fig.update_layout(
        height=400,
        yaxis={'categoryorder':'total ascending'},
        template='plotly_white',
        showlegend=False,
        coloraxis_showscale=False,
        title_x=0.5,
        title_font_size=20
    )
    
    return fig

def create_top_10_languages():
    result = get_top_10_languages()
    
    df_languages = pd.DataFrame(result["data"])
    
    fig = px.bar(
        df_languages,
        x='mentions',
        y='language',
        orientation='h',
        labels={'mentions': "Number of mentions", 'language': ''},
        title="Top 10 Programming Languages",
        color='mentions',
        color_continuous_scale='Teal',
        text='mentions'
    )
    
    fig.update_traces(textposition='outside', textfont_size=14)
    fig.update_layout(
        height=500,
        yaxis={'categoryorder':'total ascending'},
        template='plotly_white',
        showlegend=False,
        coloraxis_showscale=False,
        title_x=0.5,
        title_font_size=20
    )
    
    return fig

def create_top_5_technologies_by_domain(domain=None):
    result = get_top_5_technologies_by_domain(domain)
    
    if not result["data"]:
        print(f"No data found for domain: {domain}")
        return None
    
    df_tech = pd.DataFrame(result["data"])
    
    domain_title = result["domain"]
    
    fig = px.bar(
        df_tech,
        x='mentions',
        y='technology',
        orientation='h',
        labels={'mentions': "Number of mentions", 'technology': ''},
        title=f"Top 5 Technologies - {domain_title}",
        color='mentions',
        color_continuous_scale='Teal',
        text='mentions',
        hover_data=['category']
    )
    
    fig.update_traces(textposition='outside', textfont_size=14)
    fig.update_layout(
        height=400,
        yaxis={'categoryorder':'total ascending'},
        template='plotly_white',
        showlegend=False,
        coloraxis_showscale=False,
        title_x=0.5,
        title_font_size=20
    )
    
    return fig


# MONGODB UPLOAD
def upload_to_mongodb():
    mongo_uri = os.getenv("MONGO_URI")
    
    if not mongo_uri:
        print("Error: MONGO_URI not found in environment variables")
        return
    
    client = MongoClient(mongo_uri)
    db = client.get_default_database()
    analytics_collection = db["analytics"]
    
    job_types_result = get_job_types_data()
    
    analytics_collection.update_one(
        {"type": "job_type_distribution"},
        {
            "$set": {
                "type": "job_type_distribution",
                "title": "Job Types Distribution",
                "chart_type": "pie",
                "data": job_types_result["data"],
                "metadata": {
                    "total_jobs": job_types_result["total_jobs"],
                    "last_updated": datetime.now()
                }
            }
        },
        upsert=True
    )
    cities_result = get_top_cities_data()
    
    analytics_collection.update_one(
        {"type": "top_cities"},
        {
            "$set": {
                "type": "top_cities",
                "title": "Top 5 Cities with Most Job Offers",
                "chart_type": "horizontal_bar",
                "data": cities_result["data"],
                "metadata": {
                    "total_cities": cities_result["total_cities"],
                    "last_updated": datetime.now()
                }
            }
        },
        upsert=True
    )
    
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
    
    client.close()
    print("\nAll analytics uploaded to MongoDB!")

def main():
    print("GENERATING VISUALIZATIONS")
    print("Generating dashboard 1...")
    db1_cities_fig = create_top_5_cities()
    output_file = "data-scraper/db1/jop_cities.html"
    db1_cities_fig.write_html(output_file)
    print(f"\t- See Top 5 Cities for jobs in file: {output_file}")
    
    db1_pie_fig = create_job_type_pie()
    output_file = "data-scraper/db1/job_type.html"
    db1_pie_fig.write_html(output_file)
    print(f"\t- See Job Type Pie Chart in file: {output_file}")
    
    db1_languages_fig = create_top_10_languages()
    output_file = "data-scraper/db1/top_languages.html"
    db1_languages_fig.write_html(output_file)
    print(f"\t- See Top 10 Programming Languages mentionned in file: {output_file}")
    
    print("\nGenerating dashboard 2...")
    db2_all_tech_fig = create_top_5_technologies_by_domain(None)
    output_file = "data-scraper/db2/top_tech_all.html"
    db2_all_tech_fig.write_html(output_file)
    print(f"\t- See Overall Top 5 technologies by domain in file: {output_file}")
    
    print("\nUPLOADING ANALYTICS TO MONGODB")
    
    upload_to_mongodb()

if __name__ == "__main__":
    main()