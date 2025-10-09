import pandas as pd
from sqlalchemy import create_engine, text, pool
import os
from dotenv import load_dotenv
from functools import lru_cache
from typing import Optional, Dict, List

load_dotenv()

# Constants
TABLE_NAME = "oceanbench_data"
ALLOWED_TABLES = ["oceanbench_data"]

# Validation lists
VALID_MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

# Cache engine instance
_engine_instance = None

def get_db_engine():
    """
    Creates and returns a SQLAlchemy engine with connection pooling.
    Singleton pattern to reuse engine across calls.
    """
    global _engine_instance
    
    if _engine_instance is not None:
        return _engine_instance
    
    try:
        db_user = os.getenv("DB_USER")
        db_pass = os.getenv("DB_PASS")
        db_host = os.getenv("DB_HOST")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME")
        
        missing_vars = []
        if not db_user: missing_vars.append("DB_USER")
        if not db_pass: missing_vars.append("DB_PASS")
        if not db_host: missing_vars.append("DB_HOST")
        if not db_name: missing_vars.append("DB_NAME")
        
        if missing_vars:
            raise ValueError(f"Missing environment variables: {', '.join(missing_vars)}")
        
        connection_string = (
            f'postgresql+psycopg2://{db_user}:{db_pass}'
            f'@{db_host}:{db_port}/{db_name}'
        )

        _engine_instance = create_engine(
            connection_string,
            poolclass=pool.QueuePool,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False  # Set to True for SQL debugging 
        )
        
        # Test connection
        with _engine_instance.connect() as connection:
            connection.execute(text("SELECT 1"))
            print(" Successfully connected to PostgreSQL!")
        
        return _engine_instance
        
    except Exception as e:
        print(f" Failed to connect to PostgreSQL: {e}")
        raise


def run_query(engine, query: str, params: dict = None) -> pd.DataFrame:
    """
    Execute SQL query safely and return result as a DataFrame.
    
    Args:
        engine: SQLAlchemy engine
        query: SQL query string with named parameters
        params: Dictionary of parameter values
        
    Returns:
        DataFrame with query results, empty DataFrame on error
    """
    try:
        with engine.connect() as connection:
            df = pd.read_sql(text(query), connection, params=params or {})
            return df
    except Exception as e:
        print(f" Query failed: {e}")
        print(f"Query: {query}")
        print(f"Params: {params}")
        return pd.DataFrame()


@lru_cache(maxsize=1)
def get_unique_regions(engine) -> List[str]:
    """Fetches unique region names. Caching handled by streamlit."""
    query = f'SELECT DISTINCT "Region" FROM {TABLE_NAME} WHERE "Region" IS NOT NULL ORDER BY "Region";'
    df = run_query(engine, query)
    return df.iloc[:, 0].tolist() if not df.empty else []


@lru_cache(maxsize=1)
def get_unique_months(engine) -> List[str]:
    """Fetches unique month names from the table. Cached for performance."""
    query = f'SELECT DISTINCT "Month" FROM {TABLE_NAME} WHERE "Month" IS NOT NULL ORDER BY "Month";'
    df = run_query(engine, query)
    return df.iloc[:, 0].tolist() if not df.empty else []


@lru_cache(maxsize=1)
def get_unique_institutions(engine) -> List[str]:
    """Fetches unique institutions from the table. Cached for performance."""
    query = f'SELECT DISTINCT "institution" FROM {TABLE_NAME} WHERE "institution" IS NOT NULL ORDER BY "institution";'
    df = run_query(engine, query)
    return df.iloc[:, 0].tolist() if not df.empty else []


def query_by_month(engine, month_name: str, limit: int = 100) -> pd.DataFrame:
    """
    Query data by month with validation.
    
    Args:
        engine: SQLAlchemy engine
        month_name: Name of the month (e.g., "January")
        limit: Maximum number of records to return
        
    Returns:
        DataFrame with filtered results
    """
    if month_name not in VALID_MONTHS:
        print(f" Invalid month: {month_name}. Must be one of: {', '.join(VALID_MONTHS)}")
        return pd.DataFrame()
    
    query = f'SELECT * FROM {TABLE_NAME} WHERE "Month" = :month LIMIT :limit;'
    return run_query(engine, query, params={"month": month_name, "limit": limit})


def query_by_region(engine, region_name: str, limit: int = 100) -> pd.DataFrame:
    """
    Query data by region.
    
    Args:
        engine: SQLAlchemy engine
        region_name: Name of the region (e.g., "Indian Ocean")
        limit: Maximum number of records to return
        
    Returns:
        DataFrame with filtered results
    """
    if not region_name or not isinstance(region_name, str):
        print(f" Invalid region name: {region_name}")
        return pd.DataFrame()
    
    query = f'SELECT * FROM {TABLE_NAME} WHERE "Region" = :region LIMIT :limit;'
    return run_query(engine, query, params={"region": region_name, "limit": limit})


def query_by_institution(engine, institution_name: str, limit: int = 100) -> pd.DataFrame:
    """Query data by institution name."""
    if not institution_name or not isinstance(institution_name, str):
        print(f" Invalid institution name: {institution_name}")
        return pd.DataFrame()
    
    query = f'SELECT * FROM {TABLE_NAME} WHERE "institution" = :institution LIMIT :limit;'
    return run_query(engine, query, params={"institution": institution_name, "limit": limit})


def query_custom(engine, filters: Dict[str, str], limit: int = 100) -> pd.DataFrame:
    """
    Query using multiple filters with validation.
    
    Args:
        engine: SQLAlchemy engine
        filters: Dictionary of column:value pairs (e.g., {"Month": "January", "Region": "Indian Ocean"})
        limit: Maximum number of records to return
        
    Returns:
        DataFrame with filtered results
    """
    if not filters:
        print(" No filters provided")
        return pd.DataFrame()
    
    # Validate filter keys (column names)
    allowed_columns = ["Month", "Region", "institution", "profiler", "ocean"]
    invalid_cols = [k for k in filters.keys() if k not in allowed_columns]
    if invalid_cols:
        print(f" Invalid filter columns: {invalid_cols}")
        return pd.DataFrame()
    
    # Build query safely
    conditions = [f'"{k}" = :{k}' for k in filters.keys()]
    query = f'SELECT * FROM {TABLE_NAME} WHERE {" AND ".join(conditions)} LIMIT :limit;'

    params = {**filters, "limit": limit}
    return run_query(engine, query, params=params)

def get_data_for_plotting(
    engine,
    region: Optional[str] = None,
    month: Optional[str] = None,
    limit: int = 1000
) -> pd.DataFrame:
    """
    Fetches data for plotting, optionally filtered by region and/or month.
    
    Args:
        engine: SQLAlchemy engine
        region: Optional region filter
        month: Optional month filter
        limit: Maximum number of records
        
    Returns:
        DataFrame with relevant columns for oceanographic analysis
    """
    query = f'''SELECT "Month", "Region", "latitude", "longitude", 
                "institution", "profiler", "date", "ocean" 
                FROM {TABLE_NAME}'''
    conditions = []
    params = {"limit": limit}
    if region:
        conditions.append('"Region" = :region')
        params['region'] = region
    if month:
        if month not in VALID_MONTHS:
            print(f" Invalid month: {month}")
            return pd.DataFrame()
        conditions.append('"Month" = :month')
        params['month'] = month
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    query += " LIMIT :limit;"   
    return run_query(engine, query, params=params)


def get_profiler_stats(engine, region: Optional[str] = None, limit: int = 20) -> pd.DataFrame:
    """
    Get statistics about profilers in a region.
    
    Args:
        engine: SQLAlchemy engine
        region: Optional region filter
        limit: Maximum number of profiler types to return
        
    Returns:
        DataFrame with profiler statistics
    """
    query = f'''SELECT "profiler", COUNT(*) as count, 
                MIN("date") as first_measurement, 
                MAX("date") as last_measurement
                FROM {TABLE_NAME}'''
    
    params = {"limit": limit}
    if region:
        query += ' WHERE "Region" = :region'
        params['region'] = region     
    query += ' GROUP BY "profiler" ORDER BY count DESC LIMIT :limit;' 
    return run_query(engine, query, params=params)
def get_monthly_distribution(engine, region: Optional[str] = None) -> pd.DataFrame:
    """
    Get monthly distribution of measurements.
    
    Args:
        engine: SQLAlchemy engine
        region: Optional region filter
        
    Returns:
        DataFrame with monthly statistics
    """
    query = f'''SELECT "Month", COUNT(*) as measurement_count,
                COUNT(DISTINCT "profiler") as unique_profilers
                FROM {TABLE_NAME}''' 
    params = {}
    if region:
        query += ' WHERE "Region" = :region'
        params['region'] = region     
    query += ' GROUP BY "Month" ORDER BY measurement_count DESC;'  
    return run_query(engine, query, params=params)
def get_geographic_coverage(engine, region: Optional[str] = None) -> pd.DataFrame:
    """
    Get geographic coverage statistics.
    
    Args:
        engine: SQLAlchemy engine
        region: Optional region filter
        
    Returns:
        DataFrame with geographic coverage stats
    """
    query = f'''SELECT MIN("latitude") as min_lat, MAX("latitude") as max_lat,
                MIN("longitude") as min_lon, MAX("longitude") as max_lon,
                COUNT(*) as total_measurements,
                COUNT(DISTINCT "profiler") as unique_profilers
                FROM {TABLE_NAME}'''
    
    params = {}
    if region:
        query += ' WHERE "Region" = :region'
        params['region'] = region
    
    query += ';'   
    return run_query(engine, query, params=params)
def get_table_info(engine) -> Dict:
    """
    Get metadata about the oceanbench_data table.
    Useful for debugging and validation.
    
    Returns:
        Dictionary with table statistics
    """
    queries = {
        "total_records": f'SELECT COUNT(*) as count FROM {TABLE_NAME};',
        "columns": f"SELECT column_name FROM information_schema.columns WHERE table_name = '{TABLE_NAME}';",
        "date_range": f'SELECT MIN("date") as min_date, MAX("date") as max_date FROM {TABLE_NAME};'
    }  
    info = {}
    for key, query in queries.items():
        df = run_query(engine, query)
        if not df.empty:
            if key == "columns":
                info[key] = df['column_name'].tolist()
            else:
                info[key] = df.to_dict('records')[0]   
    return info
if __name__ == "__main__":
    try:
        db_engine = get_db_engine()
        print("\n Database Information:")
        table_info = get_table_info(db_engine)
        for key, value in table_info.items():
            print(f"{key}: {value}")
        print("\n Available regions:")
        regions = get_unique_regions(db_engine)
        print(f"Found {len(regions)} regions: {regions[:5]}...")        
        print("\n Available Months:")
        months = get_unique_months(db_engine)
        print(f"Found {len(months)} months: {months}")
        print("\n Example: Data for month 'January':")
        jan_data = query_by_month(db_engine, "January")
        print(f"Found {len(jan_data)} records")
        if not jan_data.empty:
            print(jan_data.head(3))
        print("\n Example: Data for region 'Indian Ocean':")
        indian_ocean_data = query_by_region(db_engine, "Indian Ocean")
        print(f"Found {len(indian_ocean_data)} records")
        if not indian_ocean_data.empty:
            print(indian_ocean_data.head(3))

        print("\n Example: Custom query: Month='January', Region='Indian Ocean'")
        custom_data = query_custom(db_engine, {"Month": "January", "Region": "Indian Ocean"})
        print(f"Found {len(custom_data)} records")
        if not custom_data.empty:
            print(custom_data.head(3))

        print("\n Example: Profiler statistics for Indian Ocean:")
        profiler_stats = get_profiler_stats(db_engine, region="Indian Ocean")
        if not profiler_stats.empty:
            print(profiler_stats.head())
        
        print("\n Example: Monthly distribution for Indian Ocean:")
        monthly_dist = get_monthly_distribution(db_engine, region="Indian Ocean")
        if not monthly_dist.empty:
            print(monthly_dist.head())      
        print("\n Example: Geographic coverage for Indian Ocean:")
        geo_coverage = get_geographic_coverage(db_engine, region="Indian Ocean")
        if not geo_coverage.empty:
            print(geo_coverage)          
    except Exception as e:
        print(f"\n Error running examples: {e}")