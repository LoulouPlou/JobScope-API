"""
Job scraping package.
Handles data collection from Google Jobs API.
"""
from .job_scraper import run_scraper, run_analysis

__all__ = ['run_scraper', 'run_analysis']