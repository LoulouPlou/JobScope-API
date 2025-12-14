"""
Chart generation functions using Plotly.
Each function returns a Plotly figure.
"""
import pandas as pd
import plotly.express as px
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

def create_job_type_pie():
    """Creates job types pie chart."""
    result = get_job_types()
    
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

def create_top_5_cities(domain=None):
    """Creates top 5 cities bar chart."""
    result = get_top_cities(domain)
    
    df = pd.DataFrame(result["data"])
    
    if not result["data"]:
        print(f"No data found for domain: {domain}")
        return None
    
    fig = px.bar(
        df,
        x='count',
        y='location',
        orientation='h',
        labels={'count': "Number of job offers", 'location': ''},
        title=f"Top 5 Cities  - {result['domain']}",
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
        print(f"No top 5 technologies found for domain: {domain}")
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

def create_top_soft_skills_chart(top_n=10):
    """Creates top 10 soft skill bar chart for any domain."""
    result = get_top_soft_skills(top_n)

    if not result["data"]:
        print("No soft skills data found")
        return None

    df = pd.DataFrame(result["data"])

    fig = px.bar(
        df,
        x='mentions',
        y='skill',
        orientation='h',
        labels={'mentions': "Number of mentions", 'skill': ''},
        title=f"Top {top_n} Soft Skills (Interpersonal)",
        color='category',
        text='mentions',
        hover_data={
            'mentions': True,
            'category': True,
            'skill': False
        }
    )

    fig.update_traces(
        textposition='outside',
        textfont_size=13,
        hovertemplate='<b>%{y}</b><br>Mentions: %{x}<br>Category: %{customdata[0]}<extra></extra>'
    )

    fig.update_layout(
        height=500,
        yaxis={'categoryorder': 'total ascending'},
        template='plotly_white',
        title_x=0.5,
        title_font_size=20,
        xaxis_title="Number of mentions",
        yaxis_title="",
        legend=dict(
            title="Category",
            orientation="v",
            yanchor="middle",
            y=0.5,
            xanchor="left",
            x=1.02
        ),
        margin=dict(r=200)
    )

    return fig


def create_top_hard_skills_no_languages_chart(top_n=10):
    """Creates top 10 hard skills (excluding programming languages) bar chart for any domain."""
    result = get_top_hard_skills_no_languages(top_n)

    if not result["data"]:
        print("No hard skills data found")
        return None

    df = pd.DataFrame(result["data"])

    fig = px.bar(
        df,
        x='mentions',
        y='skill',
        orientation='h',
        labels={'mentions': "Number of mentions", 'skill': ''},
        title=f"Top {top_n} Hard Skills (Excluding Languages)",
        color='category',
        text='mentions',
        hover_data={
            'mentions': True,
            'category': True,
            'skill': False
        }
    )

    fig.update_traces(
        textposition='outside',
        textfont_size=13,
        hovertemplate='<b>%{y}</b><br>Mentions: %{x}<br>Category: %{customdata[0]}<extra></extra>'
    )

    fig.update_layout(
        height=500,
        yaxis={'categoryorder': 'total ascending'},
        template='plotly_white',
        title_x=0.5,
        title_font_size=20,
        xaxis_title="Number of mentions",
        yaxis_title="",
        legend=dict(
            title="Category",
            orientation="v",
            yanchor="middle",
            y=0.5,
            xanchor="left",
            x=1.02
        ),
        margin=dict(r=200)
    )

    return fig

def create_skills_radar_by_domain(domain=None):
    result = get_skills_by_category_for_domain(domain)
    
    if not result["data"]:
        print(f"No category data found for domain: {domain}")
        return None
    
    df = pd.DataFrame(result["data"])
    
    fig = px.line_polar(
        df,
        r='mentions',
        theta='category',
        line_close=True,
        title=f"Skills Distribution - {domain} Domain"
    )
    
    fig.update_traces(
        fill='toself',
        fillcolor='rgba(0, 105, 137, 0.3)',
        line=dict(color='#006989', width=3),
        marker=dict(size=10, color='#006989'),
        hovertemplate='<b>%{theta}</b><br>Jobs mentioning: %{r}<br>Percentage: %{customdata[0]}%<br>Type: %{customdata[1]}<extra></extra>',
        customdata=df[['percentage', 'type']]
    )
    
    fig.update_layout(
        height=600,
        template='plotly_white',
        title_x=0.5,
        title_font_size=20,
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, max(df['mentions']) * 1.1] if len(df) > 0 else [0, 10],
                showline=True,
                linecolor='#E0E0E0',
                gridcolor='#E0E0E0',
                tickformat=','
            ),
            angularaxis=dict(
                showline=True,
                linecolor='#E0E0E0',
                gridcolor='#E0E0E0'
            )
        ),
        font=dict(size=12),
        showlegend=False
    )
    
    return fig

def create_seniority_donut_by_domain(domain):
    """
    Creates a donut chart showing seniority distribution for a specific domain.
    Uses the 'experience_level' field from jobs_analysis.json.
    """
    
    result = get_seniority_distribution_by_domain(domain)
    
    if not result["data"]:
        print(f"No seniority data found for domain: {domain}")
        return None
    
    df = pd.DataFrame(result["data"])
    
    colors = {
        "Junior": "#BEE9E8",
        "Mid": "#62B6CB",
        "Senior": "#1B4965",
        "Lead": "#006989",
    }
    
    df['color'] = df['level'].map(lambda x: colors.get(x, '#62B6CB'))
    
    fig = px.pie(
        df,
        names='level',
        values='count',
        title=f"Seniority Distribution for jobs offers in {domain}",
        hole=0.4,
        color='level',
        color_discrete_map=colors
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
        title_font_size=20,
        legend=dict(
            orientation="v",
            yanchor="middle",
            y=0.5,
            xanchor="left",
            x=1
        )
    )
    
    return fig