import pandas as pd
from sqlalchemy import create_engine, text
import os
import sys


PARQUET_FILE = "../data/indian_ocean_index.parquet"
TABLE_NAME = "oceanbench_data"
DB_USER = "postgres"
DB_PASS = "1234"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "ocean_db"

CHUNK_SIZE = 5000  
IF_EXISTS_MODE = "replace" 


if not os.path.exists(PARQUET_FILE):
    raise FileNotFoundError(f"{PARQUET_FILE} not found!")

try:
    df = pd.read_parquet(PARQUET_FILE)
    total_rows = len(df)
    print(f"✅ Loaded Parquet with {total_rows} rows.")
except Exception as e:
    print(f"❌ Failed to load Parquet: {e}")
    sys.exit(1)


try:
    engine = create_engine(f'postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}')
    connection = engine.connect()
    print("✅ Successfully connected to PostgreSQL!")
except Exception as e:
    print(f"❌ Failed to connect to PostgreSQL: {e}")
    sys.exit(1)

try:
    print(f"ℹ️ Loading {total_rows} rows into table '{TABLE_NAME}' (mode={IF_EXISTS_MODE})...")
    if IF_EXISTS_MODE == "replace":
        df.iloc[:CHUNK_SIZE].to_sql(TABLE_NAME, engine, if_exists="replace", index=False)
        start = CHUNK_SIZE
    else:
        start = 0

    for end in range(start + CHUNK_SIZE, total_rows + CHUNK_SIZE, CHUNK_SIZE):
        chunk = df.iloc[start:end]
        if len(chunk) == 0:
            break
        chunk.to_sql(TABLE_NAME, engine, if_exists="append", index=False)
        print(f"✅ Loaded rows {start+1} to {min(end, total_rows)}")
        start = end

    print(f"🎉 Data successfully loaded into PostgreSQL table '{TABLE_NAME}'!")
except Exception as e:
    print(f"❌ Failed to load data: {e}")
finally:
    connection.close()
    print("✅ Connection closed")
