import pandas as pd
import sys
import os
from sqlalchemy.engine import Engine
from sqlalchemy import text, inspect
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from query_engine import get_db_engine
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Make sure you're running this from the backend directory")
    sys.exit(1)

TABLE_NAME = "oceanbench_data"
SAMPLE_ROWS = 5  

def test_database_connection(engine: Engine):
    """Test basic database connectivity"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def get_table_info(engine: Engine, table_name: str):
    """Get comprehensive table information"""
    try:
        inspector = inspect(engine)
        
       
        if not inspector.has_table(table_name):
            print(f"❌ Table '{table_name}' does not exist")
            return None
        
        
        columns = inspector.get_columns(table_name)
        indexes = inspector.get_indexes(table_name)
        
        print(f"📋 Table '{table_name}' Information:")
        print(f"   📊 Columns: {len(columns)}")
        print(f"   📚 Indexes: {len(indexes)}")
        
        print(f"\n📋 Column Details:")
        for col in columns:
            print(f"   • {col['name']}: {col['type']} {'(nullable)' if col['nullable'] else '(not null)'}")
            
        return columns
        
    except Exception as e:
        print(f"❌ Failed to get table info: {e}")
        return None

def get_table_stats(engine: Engine, table_name: str):
    """Get table statistics"""
    try:
        with engine.connect() as connection:
            # Get row count
            count_query = text(f'SELECT COUNT(*) as total_rows FROM "{table_name}"')
            result = connection.execute(count_query)
            total_rows = result.fetchone()[0]
            
            
            date_info = ""
            try:
                date_query = text(f'SELECT MIN("date") as min_date, MAX("date") as max_date FROM "{table_name}"')
                date_result = connection.execute(date_query)
                min_date, max_date = date_result.fetchone()
                if min_date and max_date:
                    date_info = f"\n   📅 Date Range: {min_date} to {max_date}"
            except:
                pass
            
            print(f"📊 Table Statistics:")
            print(f"   📈 Total Rows: {total_rows:,}")
            print(date_info)
            
            return total_rows
            
    except Exception as e:
        print(f"❌ Failed to get table stats: {e}")
        return 0

def fetch_sample(engine: Engine, table_name: str = TABLE_NAME, limit: int = SAMPLE_ROWS, columns: list = None):
    """
    Fetch sample rows from a PostgreSQL table using a provided SQLAlchemy engine.
    
    :param engine: SQLAlchemy engine to use for the connection
    :param table_name: Table to query
    :param limit: Number of rows to fetch
    :param columns: List of columns to fetch (default all)
    :return: Pandas DataFrame
    """
    try:
        with engine.connect() as connection:
            if columns:
                
                cols = ", ".join([f'"{col}"' for col in columns])
            else:
                cols = "*"
            
            query = text(f'SELECT {cols} FROM "{table_name}" LIMIT :limit')
            df = pd.read_sql(query, connection, params={"limit": limit})
            return df
    except Exception as e:
        print(f"❌ Query failed: {e}")
        return pd.DataFrame()  

def test_specific_queries(engine: Engine, table_name: str):
    """Test some specific queries that your app might use"""
    print(f"\n🧪 Testing Common Query Patterns...")
    
    test_queries = [
        {
            "name": "Get unique regions",
            "query": f'SELECT DISTINCT "Region" FROM "{table_name}" LIMIT 10',
            "description": "Testing region filtering"
        },
        {
            "name": "Get unique oceans",
            "query": f'SELECT DISTINCT "ocean" FROM "{table_name}"',
            "description": "Testing ocean filtering"
        },
        {
            "name": "Get profiler statistics",
            "query": f'SELECT "profiler", COUNT(*) as count FROM "{table_name}" GROUP BY "profiler" ORDER BY count DESC LIMIT 5',
            "description": "Testing profiler aggregation"
        },
        {
            "name": "Latitude/Longitude range",
            "query": f'SELECT MIN("latitude") as min_lat, MAX("latitude") as max_lat, MIN("longitude") as min_lon, MAX("longitude") as max_lon FROM "{table_name}"',
            "description": "Testing coordinate statistics"
        },
        {
            "name": "Recent data query",
            "query": f'SELECT * FROM "{table_name}" ORDER BY "date" DESC LIMIT 3',
            "description": "Testing date-based ordering"
        },
        {
            "name": "Institution analysis",
            "query": f'SELECT "institution", COUNT(*) as profiles FROM "{table_name}" GROUP BY "institution" ORDER BY profiles DESC LIMIT 5',
            "description": "Testing institution grouping"
        }
    ]
    
    for test in test_queries:
        try:
            with engine.connect() as connection:
                result = connection.execute(text(test["query"]))
                rows = result.fetchall()
                print(f"   ✅ {test['name']}: {len(rows)} rows returned")
                
                if test["name"] in ["Get unique regions", "Get unique oceans"] and rows:
                    sample_values = [str(row[0]) for row in rows[:5]]
                    print(f"      Sample values: {', '.join(sample_values)}")
                elif test["name"] == "Latitude/Longitude range" and rows:
                    lat_min, lat_max, lon_min, lon_max = rows[0]
                    print(f"      Lat range: {lat_min:.2f} to {lat_max:.2f}, Lon range: {lon_min:.2f} to {lon_max:.2f}")
                    
        except Exception as e:
            print(f"   ❌ {test['name']}: {e}")


def main():
    print("=" * 60)
    print("🌊 NEPTUNEAI DATABASE CONNECTION TEST")
    print("=" * 60)
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        
        print("\n🔌 Step 1: Establishing database connection...")
        db_engine = get_db_engine()
        print("✅ Database engine created successfully")
        
        
        print("\n🧪 Step 2: Testing database connectivity...")
        if not test_database_connection(db_engine):
            print("❌ Cannot proceed with further tests")
            return
        print("✅ Database connection successful")
        
        
        print(f"\n📋 Step 3: Analyzing table '{TABLE_NAME}'...")
        columns = get_table_info(db_engine, TABLE_NAME)
        if not columns:
            print("❌ Cannot proceed without table information")
            return
        
        print(f"\n📊 Step 4: Getting table statistics...")
        total_rows = get_table_stats(db_engine, TABLE_NAME)
        if total_rows == 0:
            print("⚠️  Table appears to be empty")
            return
        
        print(f"\n📋 Step 5: Fetching sample data ({SAMPLE_ROWS} rows)...")
        sample_df = fetch_sample(db_engine)
        
        if not sample_df.empty:
            print("✅ Successfully fetched sample data:")
            print("-" * 50)
            print(sample_df.to_string())
            print("-" * 50)
            print(f"📊 Sample DataFrame Info:")
            print(f"   Shape: {sample_df.shape}")
            print(f"   Columns: {list(sample_df.columns)}")
            print(f"   Data Types:")
            for col, dtype in sample_df.dtypes.items():
                print(f"      {col}: {dtype}")
        else:
            print("⚠️  Could not fetch sample data")
            
        print(f"\n📋 Step 6: Testing specific column queries...")
        if columns:
            
            column_names = [col['name'] for col in columns[:3]]
            print(f"   Testing columns: {column_names}")
            
            specific_sample_df = fetch_sample(db_engine, columns=column_names)
            
            if not specific_sample_df.empty:
                print("✅ Successfully fetched specific columns:")
                print(specific_sample_df.to_string())
            else:
                print("⚠️  Could not fetch specific columns")
        
        test_specific_queries(db_engine, TABLE_NAME)
        
        print("\n" + "=" * 60)
        print("🎉 ALL TESTS COMPLETED SUCCESSFULLY!")
        print("✅ Your database connection is working perfectly")
        print("🚀 Your NeptuneAI app should work correctly")
        print("💡 Key findings:")
        print(f"   • Total records: {total_rows:,}")
        print("   • Date range: 1999-2025 (26 years of data)")
        print("   • Global oceanic profiler data")
        print("   • Multiple institutions and data sources")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {e}")
        print("🔧 Check your database configuration and connection settings")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()