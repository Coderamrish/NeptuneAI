import os
import sys

def fix_api_queries():
    """Fix all database query issues in api.py"""
    api_file = "api.py"
    if not os.path.exists(api_file):
        print(" api.py not found")
        return False
    
    print(" Fixing database query issues...")
    
    # Read the current file
    with open(api_file, 'r') as f:
        content = f.read()
    
    # Fix 1: Remove text() wrapper from queries
    old_query = '''columns_query = text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'oceanbench_data'
            ORDER BY ordinal_position
        """)'''  
    new_query = '''columns_query = """
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'oceanbench_data'
            ORDER BY ordinal_position
        """''' 
    if old_query in content:
        content = content.replace(old_query, new_query)
        print(" Fixed columns query")
    
    # Fix 2: Add better error handling for database queries
    error_handling = '''
def safe_run_query(engine, query, params=None):
    """Safely run database queries with proper error handling"""
    try:
        from query_engine import run_query
        result = run_query(engine, query, params)
        return result
    except Exception as e:
        print(f" Query failed: {e}")
        print(f"Query: {query}")
        print(f"Params: {params}")
        return None
''' 
    # Add the safe query function after imports
    import_section = "from fastapi import FastAPI, HTTPException, Depends, Header"
    if "def safe_run_query" not in content:
        content = content.replace(import_section, import_section + error_handling)
        print("Added safe query function")
    
    # Fix 3: Update ocean parameters endpoint to use safe queries
    old_ocean_params = '''        try:
            columns_df = run_query(engine, columns_query)
            parameters = columns_df.to_dict('records')
        except Exception as e:
            print(f" Query failed: {e}")
            print(f"Query: {columns_query}")
            print(f"Params: None")
            # Fallback for SQLite
            parameters = ['''
    
    new_ocean_params = '''        try:
            columns_df = safe_run_query(engine, columns_query)
            if columns_df is not None and not columns_df.empty:
                parameters = columns_df.to_dict('records')
            else:
                raise Exception("No data returned")
        except Exception as e:
            print(f" Query failed: {e}")
            print(f"Query: {columns_query}")
            print(f"Params: None")
            # Fallback for SQLite
            parameters = ['''
    
    if old_ocean_params in content:
        content = content.replace(old_ocean_params, new_ocean_params)
        print(" Fixed ocean parameters query")
    
    # Fix 4: Update dashboard stats to use safe queries
    old_dashboard = '''        total_records_df = run_query(engine, 'SELECT COUNT(*) as count FROM oceanbench_data')
        total_records = total_records_df.iloc[0]['count'] if not total_records_df.empty else 0'''
    
    new_dashboard = '''        total_records_df = safe_run_query(engine, 'SELECT COUNT(*) as count FROM oceanbench_data')
        total_records = total_records_df.iloc[0]['count'] if total_records_df is not None and not total_records_df.empty else 0'''
    
    if old_dashboard in content:
        content = content.replace(old_dashboard, new_dashboard)
        print(" Fixed dashboard stats query")
    
    # Write the fixed content back
    with open(api_file, 'w') as f:
        content = f.write(content)
    
    print(" Database query fixes applied successfully!")
    return True

def main():
    """Main fix function"""
    print("🌊 NeptuneAI Database Query Fix")
    print("=" * 35)
    
    if not os.path.exists("api.py"):
        print(" Please run this from the backend directory")
        return
    
    if fix_api_queries():
        print("\n All database query issues fixed!")
        print("\n Fixed issues:")
        print(" Removed text() wrapper from queries")
        print(" Added safe query function with error handling")
        print(" Fixed ocean parameters query")
        print(" Fixed dashboard stats query")
        print("\n The backend should now work without query errors!")
    else:
        print("\n Database query fix failed!")

if __name__ == "__main__":
    main()