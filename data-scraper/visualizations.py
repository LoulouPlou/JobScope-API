import json
import pandas as pd
import plotly.express as px

def load_master_jobs():
    with open("data-scraper/jobs_master.json", 'r', encoding='utf-8') as f:
        jobs = json.load(f)
    return pd.DataFrame(jobs)

def create_job_type_pie():
    df = load_master_jobs()
    
    job_types = {
        "Full-time": 0,
        "Contractor": 0,
        "Part-time": 0,
        "Internship": 0
    }
    
    for extensions in df['extensions']:
        if not isinstance(extensions, list):
            continue
        
        if "Full-time" in extensions:
            job_types["Full-time"] += 1
        if "Contractor" in extensions:
            job_types["Contractor"] += 1
        if "Part-time" in extensions:
            job_types["Part-time"] += 1
        if "Internship" in extensions:
            job_types["Internship"] += 1
    
    job_types = {k: v for k, v in job_types.items() if v > 0}
    
    df_types = pd.DataFrame({
        'Type': list(job_types.keys()),
        'Count': list(job_types.values())
    })
    
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

# https://plotly.com/python/builtin-colorscales/
def create_top_5_cities():
    df = load_master_jobs()
    
    df = df[df['location'].notna()]
    
    city_counts = df['location'].value_counts().head(5)
    
    fig = px.bar(
        x=city_counts.values,
        y=city_counts.index,
        orientation='h',
        labels={'x': "Number of job offers", 'y': ''},
        title="Top 5 Cities with the Most Job Offers",
        color=city_counts.values,
        color_continuous_scale='Teal',
        text=city_counts.values
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

def main():
    db1_chart_fig = create_top_5_cities()
    
    output_file = "data-scraper/db1_top_cities.html"
    db1_chart_fig.write_html(output_file)
    
    db1_pie_fig = create_job_type_pie()
    
    output_file = "data-scraper/db1_job_type.html"
    db1_pie_fig.write_html(output_file)
    
    print(f"Visualizations done")

if __name__ == "__main__":
    main()