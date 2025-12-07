#!/usr/bin/env python3
import os
import logging
from datetime import datetime
from dotenv import load_dotenv
from scraper import run_scraper, run_analysis
from db_upload import sync_all_to_mongodb
from visualizations import generate_all_charts

load_dotenv(".env.development")

def setup_logger():
    """Setup logger to append to a single log file."""
    os.makedirs("logs", exist_ok=True)
    log_file = "logs/daily_job.log"
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file, mode='a'),
            logging.StreamHandler()
        ]
    )
    
    return logging.getLogger(__name__)

def print_header(title, logger):
    """Print a formatted header."""
    separator = "="*70
    logger.info("")
    logger.info(separator)
    logger.info(f" {title}")
    logger.info(separator)

def main():
    logger = setup_logger()
    start_time = datetime.now()
    
    print_header(f"JOBSCOPE DAILY JOB - {start_time.strftime('%Y-%m-%d %H:%M:%S')}", logger)
    
    try:
        # STEP 1: SCRAPING
        print_header("STEP 1/4: SCRAPING JOBS", logger)
        
        scrape_stats = run_scraper()

        logger.info(f"Scraping complete!")
        logger.info(f"- New jobs: {scrape_stats['new_jobs']}")
        logger.info(f"- Updated jobs: {scrape_stats['updated_jobs']}")
        logger.info(f"- Total in database: {scrape_stats['total_jobs']}")
        
        # STEP 2: ANALYSIS
        print_header("STEP 2/4: ANALYZING BUZZWORDS & EXPERIENCE", logger)
        
        analysis_stats = run_analysis()
        
        logger.info(f"Analysis complete!")
        logger.info(f"- Jobs analyzed: {analysis_stats['jobs_analyzed']}")
        logger.info(f"- Total buzzword mentions: {analysis_stats['total_mentions']}")
        
        # STEP 3: VISUALIZATIONS
        print_header("STEP 3/4: GENERATING VISUALIZATIONS", logger)
        
        viz_stats = generate_all_charts()
        
        logger.info(f"Visualizations generated!")
        logger.info(f"- Charts created: {viz_stats['charts_created']}")
        
        # STEP 4: MONGODB SYNC
        print_header("STEP 4/4: SYNCING TO MONGODB", logger)
        
        sync_stats = sync_all_to_mongodb()
        
        logger.info(f"MongoDB sync complete!")
        logger.info(f"- Jobs synced: {sync_stats['total_jobs']}")
        logger.info(f"- Analytics uploaded: {sync_stats['analytics_uploaded']}")
        
        # SUMMARY
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print_header("JOB COMPLETE", logger)
        logger.info(f"All tasks completed successfully!")
        logger.info(f"Duration: {duration:.2f} seconds")
        logger.info(f"Finished at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        return 0
        
    except Exception as e:
        logger.error(f"FATAL ERROR: {e}")
        
        import traceback
        logger.error("Stack trace:")
        logger.error(traceback.format_exc())
        
        return 1

if __name__ == "__main__":
    main()