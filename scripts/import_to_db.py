import os
import logging
import pandas as pd
from sqlalchemy import create_engine
from urllib.parse import quote_plus
from dotenv import load_dotenv

# --- 1. Setup Logging and Configuration ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Read database configuration from environment variables
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_DATABASE = os.getenv("DB_DATABASE")
DB_PORT = os.getenv("DB_PORT", "3306")

# CORRECTED: Point to the new 'data' directory
CSV_FILE_PATH = "datasets/MASTER_DATASET.csv"
TABLE_NAME = "compressor_data"


def load_data_to_db():
    """
    Reads data from a CSV file in chunks and loads it into the specified MySQL table.
    """
    if not all([DB_USER, DB_PASSWORD, DB_HOST, DB_DATABASE]):
        logger.critical(
            "❌ Database credentials are not fully set in the .env file. Exiting."
        )
        return

    try:
        logger.info(f"Reading data from '{CSV_FILE_PATH}'...")
        chunk_iter = pd.read_csv(CSV_FILE_PATH, chunksize=10000)
        logger.info("Successfully started reading CSV data.")

        encoded_password = quote_plus(DB_PASSWORD)
        connection_str = (
            f"mysql+pymysql://{DB_USER}:{encoded_password}"
            f"@{DB_HOST}:{DB_PORT}/{DB_DATABASE}"
        )
        engine = create_engine(connection_str)

        logger.info(f"Loading data into table '{TABLE_NAME}'... This may take a while.")

        is_first_chunk = True
        for chunk in chunk_iter:
            if_exists_strategy = "replace" if is_first_chunk else "append"
            chunk.to_sql(
                TABLE_NAME, con=engine, if_exists=if_exists_strategy, index=False
            )
            is_first_chunk = False
            logger.info(f"Loaded a chunk of {len(chunk)} rows.")

        logger.info("\n✅ Data loaded successfully into the database!")

    except FileNotFoundError:
        logger.error(f"❌ ERROR: The file '{CSV_FILE_PATH}' was not found.")
    except Exception as e:
        logger.error(f"❌ An error occurred: {e}")


if __name__ == "__main__":
    load_data_to_db()
