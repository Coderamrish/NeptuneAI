import pandas as pd
from sqlalchemy.engine import Engine
import os
import sys
from datetime import datetime

# Fixed import - remove the dot for direct execution
from query_engine import get_db_engine

# -----------------------------
# Configurations
# -----------------------------
# Updated to look for CSV files in multiple common locations
POSSIBLE_CSV_PATHS = [
    "../data/indian_ocean_index.csv",
    "data/indian_ocean_index.csv", 
    "./indian_ocean_index.csv",
    "../indian_ocean_index.csv"
]

TABLE_NAME = "oceanbench_data"
CHUNK_SIZE = 5000  # Number of rows per chunk

# -----------------------------
# Helper Functions
# -----------------------------
def find_csv_file():
    """
    Find the CSV file in possible locations.
    """
    for path in POSSIBLE_CSV_PATHS:
        if os.path.exists(path):
            return path
    return None

def validate_csv_structure(df: pd.DataFrame):
    """
    Validate and show the structure of the CSV file.
    """
    print(f"\n📋 CSV File Analysis:")
    print(f"   📊 Shape: {df.shape}")
    print(f"   📋 Columns: {list(df.columns)}")
    print(f"   🔍 Data Types:")
    for col, dtype in df.dtypes.items():
        print(f"      {col}: {dtype}")
    
    print(f"\n📝 First 3 rows:")
    print(df.head(3).to_string())
    
    return True

# -----------------------------
# Main Data Ingestion Logic
# -----------------------------
def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepares the DataFrame for ingestion by adding required columns and cleaning data.
    """
    print("\n🔧 Preprocessing data...")
    df_processed = df.copy()
    
    # 1. Create 'Month' column from 'date' if it exists
    if 'date' in df_processed.columns:
        try:
            df_processed['date'] = pd.to_datetime(df_processed['date'], errors='coerce')
            df_processed['Month'] = df_processed['date'].dt.month_name()
            print("  ✅ 'Month' column created from 'date'.")
            
            # Convert date back to string for database storage
            df_processed['date'] = df_processed['date'].astype(str)
        except Exception as e:
            print(f"  ⚠️  Failed to process 'date' column: {e}")
    else:
        print("  ⚠️  'date' column not found. Cannot create 'Month'.")

    # 2. Create 'regions' column 
    if 'regions' not in df_processed.columns:
        # Try to infer region from existing data or use default
        if 'ocean' in df_processed.columns:
            # Map ocean codes to regions
            ocean_mapping = {
                'I': 'Indian Ocean',
                'A': 'Atlantic Ocean', 
                'P': 'Pacific Ocean',
                'S': 'Southern Ocean',
                'M': 'Mediterranean Sea'
            }
            df_processed['Region'] = df_processed['ocean'].map(ocean_mapping).fillna('Indian Ocean')
            print("  ✅ 'Region' column created from 'ocean' column.")
        else:
            df_processed['Region'] = 'Indian Ocean'
            print("  ✅ 'Region' column created with default 'Indian Ocean'.")
    else:
        print("  ✅ 'Region' column already exists.")

    # 3. Handle missing values
    numeric_columns = df_processed.select_dtypes(include=['number']).columns
    for col in numeric_columns:
        if df_processed[col].isna().any():
            df_processed[col] = df_processed[col].fillna(0)
            print(f"  🔧 Filled missing values in '{col}' with 0")
    
    # 4. Handle text columns
    text_columns = df_processed.select_dtypes(include=['object']).columns
    for col in text_columns:
        if df_processed[col].isna().any():
            df_processed[col] = df_processed[col].fillna('Unknown')
            print(f"  🔧 Filled missing values in '{col}' with 'Unknown'")
    
    print(f"  📊 Processed data shape: {df_processed.shape}")
    return df_processed

def load_data(engine: Engine, df: pd.DataFrame, replace_table: bool = True):
    """
    Loads a DataFrame into the database in chunks.
    
    Args:
        engine: Database engine
        df: DataFrame to load
        replace_table: If True, replace existing table. If False, append to existing table.
    """
    total_rows = len(df)
    action = "replace" if replace_table else "append"
    print(f"\n📤 Loading {total_rows:,} rows into PostgreSQL table '{TABLE_NAME}' (action: {action})...")

    try:
        # Determine the if_exists parameter
        if_exists_param = 'replace' if replace_table else 'append'
        
        # Load first chunk
        first_chunk_size = min(CHUNK_SIZE, total_rows)
        df.iloc[:first_chunk_size].to_sql(TABLE_NAME, engine, if_exists=if_exists_param, index=False)
        print(f"✅ Loaded rows 1 to {first_chunk_size:,}")

        # Load remaining chunks (always append after first chunk)
        for start in range(CHUNK_SIZE, total_rows, CHUNK_SIZE):
            end = min(start + CHUNK_SIZE, total_rows)
            chunk = df.iloc[start:end]
            chunk.to_sql(TABLE_NAME, engine, if_exists='append', index=False)
            print(f"✅ Loaded rows {start+1:,} to {end:,}")

        print(f"\n🎉 Successfully loaded {total_rows:,} rows into '{TABLE_NAME}'!")
        return True

    except Exception as e:
        print(f"❌ Failed to load data: {e}")
        import traceback
        traceback.print_exc()
        return False

def show_table_summary(engine: Engine):
    """
    Show a summary of the loaded data.
    """
    try:
        from sqlalchemy import text
        
        with engine.connect() as connection:
            # Get row count
            result = connection.execute(text(f'SELECT COUNT(*) FROM "{TABLE_NAME}"'))
            total_rows = result.fetchone()[0]
            
            # Get sample data
            result = connection.execute(text(f'SELECT * FROM "{TABLE_NAME}" LIMIT 3'))
            sample_rows = result.fetchall()
            column_names = result.keys()
            
            print(f"\n📊 Table Summary:")
            print(f"   📈 Total Rows: {total_rows:,}")
            print(f"   📋 Columns: {len(column_names)}")
            print(f"   📝 Sample Data:")
            
            for i, row in enumerate(sample_rows, 1):
                print(f"\n   Row {i}:")
                for col_name, value in zip(column_names, row):
                    # Truncate long values for display
                    display_value = str(value)[:50] + "..." if len(str(value)) > 50 else str(value)
                    print(f"     {col_name}: {display_value}")
                    
    except Exception as e:
        print(f"❌ Failed to show table summary: {e}")

# -----------------------------
# Execution Block
# -----------------------------
def main():
    print("=" * 60)
    print("📊 OCEANOGRAPHIC DATA INGESTION TOOL")
    print("=" * 60)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # 1. Find the CSV file
        print("\n🔍 Step 1: Looking for CSV file...")
        csv_file = find_csv_file()
        
        if not csv_file:
            print("❌ CSV file not found in any of these locations:")
            for path in POSSIBLE_CSV_PATHS:
                print(f"   • {path}")
            print("\n💡 Please ensure your CSV file is in one of these locations.")
            return

        print(f"✅ Found CSV file: {csv_file}")

        # 2. Load and validate CSV data
        print(f"\n📂 Step 2: Loading data from {csv_file}...")
        try:
            raw_df = pd.read_csv(csv_file)
            print(f"✅ Successfully loaded CSV with {len(raw_df):,} rows")
        except Exception as e:
            print(f"❌ Failed to load CSV: {e}")
            return
            
        # 3. Validate CSV structure
        print("\n🔍 Step 3: Validating CSV structure...")
        validate_csv_structure(raw_df)

        # 4. Ask user confirmation
        print(f"\n❓ Do you want to proceed with loading this data into the database?")
        print(f"   This will REPLACE the existing '{TABLE_NAME}' table.")
        response = input("   Continue? (y/N): ").strip().lower()
        
        if response not in ['y', 'yes']:
            print("❌ Operation cancelled by user.")
            return

        # 5. Preprocess the data
        print(f"\n🔧 Step 4: Preprocessing data...")
        processed_df = preprocess_data(raw_df)

        # 6. Get database engine
        print(f"\n🔌 Step 5: Connecting to database...")
        db_engine = get_db_engine()

        # 7. Load data into database
        print(f"\n📤 Step 6: Loading data into database...")
        success = load_data(db_engine, processed_df, replace_table=True)
        
        if success:
            # 8. Show summary
            print(f"\n📊 Step 7: Showing table summary...")
            show_table_summary(db_engine)
            
            print("\n" + "=" * 60)
            print("🎉 DATA INGESTION COMPLETED SUCCESSFULLY!")
            print("✅ Your oceanographic data is now available in PostgreSQL")
            print("🚀 You can now run your RAG pipeline to analyze the data")
            print("=" * 60)
        else:
            print("\n❌ Data ingestion failed. Please check the error messages above.")

    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
