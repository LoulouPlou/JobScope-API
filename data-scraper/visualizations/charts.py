"""
Chart generation functions using Plotly.
Each function returns a Plotly figure.
"""
import pandas as pd
import plotly.express as px
from .data_processors import (
    get_job_types_data,
    get_top_cities_data,
    get_top_10_languages,
    get_top_5_technologies_by_domain
)

def create_job_type_pie():
    """Creates job types pie chart."""
    result = get_job_types_data()
    
    df = pd.DataFrame(result["data"])
    df.columns = ['Type', 'Count', 'Percentage']
    
    fig = px.pie(
        df,
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
    """Creates top 5 cities bar chart."""
    result = get_top_cities_data()
    
    df = pd.DataFrame(result["data"])
    
    fig = px.bar(
        df,
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
    """Creates top 10 programming languages bar chart."""
    result = get_top_10_languages()
    
    df = pd.DataFrame(result["data"])
    
    fig = px.bar(
        df,
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
    """Creates top 5 technologies bar chart for a specific domain."""
    result = get_top_5_technologies_by_domain(domain)
    
    if not result["data"]:
        print(f"No data found for domain: {domain}")
        return None
    
    df = pd.DataFrame(result["data"])
    
    fig = px.bar(
        df,
        x='mentions',
        y='technology',
        orientation='h',
        labels={'mentions': "Number of mentions", 'technology': ''},
        title=f"Top 5 Technologies - {result['domain']}",
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