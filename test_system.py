#!/usr/bin/env python3
"""
Test script for NeptuneAI ARGO Ocean Data Platform
Tests all major components for bugs and errors
"""

import sys
import os
import traceback
from pathlib import Path

# Add backend to path
sys.path.append('backend')

def test_imports():
    """Test all module imports"""
    print("🔍 Testing module imports...")
    
    try:
        from netcdf_processor import ARGONetCDFProcessor
        print("✅ NetCDF Processor: OK")
    except Exception as e:
        print(f"❌ NetCDF Processor: {e}")
        return False
    
    try:
        from vector_store import ARGOVectorStore
        print("✅ Vector Store: OK")
    except Exception as e:
        print(f"❌ Vector Store: {e}")
        return False
    
    try:
        from mcp_integration import MCPHandler, MCPClient, ToolType
        print("✅ MCP Integration: OK")
    except Exception as e:
        print(f"❌ MCP Integration: {e}")
        return False
    
    try:
        from geospatial_viz import ARGOGeospatialVisualizer
        print("✅ Geospatial Visualizer: OK")
    except Exception as e:
        print(f"❌ Geospatial Visualizer: {e}")
        return False
    
    try:
        from data_export import ARGODataExporter
        print("✅ Data Exporter: OK")
    except Exception as e:
        print(f"❌ Data Exporter: {e}")
        return False
    
    try:
        from enhanced_rag_pipeline import EnhancedRAGPipeline
        print("✅ Enhanced RAG Pipeline: OK")
    except Exception as e:
        print(f"❌ Enhanced RAG Pipeline: {e}")
        return False
    
    try:
        from query_engine import get_db_engine, get_unique_regions
        print("✅ Query Engine: OK")
    except Exception as e:
        print(f"❌ Query Engine: {e}")
        return False
    
    try:
        from plots import create_profiler_dashboard
        print("✅ Plots Module: OK")
    except Exception as e:
        print(f"❌ Plots Module: {e}")
        return False
    
    return True

def test_basic_functionality():
    """Test basic functionality of components"""
    print("\n🔧 Testing basic functionality...")
    
    try:
        # Test NetCDF Processor
        from netcdf_processor import ARGONetCDFProcessor
        processor = ARGONetCDFProcessor("test_processed")
        print("✅ NetCDF Processor initialization: OK")
    except Exception as e:
        print(f"❌ NetCDF Processor initialization: {e}")
        return False
    
    try:
        # Test Vector Store
        from vector_store import ARGOVectorStore
        vector_store = ARGOVectorStore("test_vector_index")
        print("✅ Vector Store initialization: OK")
    except Exception as e:
        print(f"❌ Vector Store initialization: {e}")
        return False
    
    try:
        # Test Geospatial Visualizer
        from geospatial_viz import ARGOGeospatialVisualizer
        viz = ARGOGeospatialVisualizer()
        print("✅ Geospatial Visualizer initialization: OK")
    except Exception as e:
        print(f"❌ Geospatial Visualizer initialization: {e}")
        return False
    
    try:
        # Test Data Exporter
        from data_export import ARGODataExporter
        exporter = ARGODataExporter("test_exports")
        print("✅ Data Exporter initialization: OK")
    except Exception as e:
        print(f"❌ Data Exporter initialization: {e}")
        return False
    
    try:
        # Test MCP Integration
        from mcp_integration import MCPHandler, ToolType
        handler = MCPHandler()
        print("✅ MCP Handler initialization: OK")
    except Exception as e:
        print(f"❌ MCP Handler initialization: {e}")
        return False
    
    return True

def test_data_processing():
    """Test data processing with sample data"""
    print("\n📊 Testing data processing...")
    
    try:
        import pandas as pd
        import numpy as np
        
        # Create sample data
        sample_data = {
            'latitude': np.random.uniform(-40, 25, 100),
            'longitude': np.random.uniform(40, 120, 100),
            'temperature': np.random.uniform(15, 30, 100),
            'salinity': np.random.uniform(33, 37, 100),
            'platform_number': [f'ARGO_{i:06d}' for i in range(100)],
            'date': pd.date_range('2023-01-01', periods=100, freq='D').strftime('%Y-%m-%d')
        }
        
        df = pd.DataFrame(sample_data)
        
        # Test vector store
        from vector_store import ARGOVectorStore
        vector_store = ARGOVectorStore("test_vector_index")
        doc_ids = vector_store.add_profile_data(df)
        print(f"✅ Vector Store data addition: {len(doc_ids)} documents added")
        
        # Test search
        results = vector_store.search("temperature in Indian Ocean", k=5)
        print(f"✅ Vector Store search: {len(results)} results found")
        
        # Test data export
        from data_export import ARGODataExporter
        exporter = ARGODataExporter("test_exports")
        csv_path = exporter.export_to_csv(df)
        print(f"✅ Data export to CSV: {csv_path}")
        
        # Test visualization
        from geospatial_viz import ARGOGeospatialVisualizer
        viz = ARGOGeospatialVisualizer()
        fig = viz.create_interactive_world_map(df)
        print("✅ Geospatial visualization: OK")
        
        return True
        
    except Exception as e:
        print(f"❌ Data processing test failed: {e}")
        traceback.print_exc()
        return False

def test_enhanced_pipeline():
    """Test the enhanced RAG pipeline"""
    print("\n🤖 Testing Enhanced RAG Pipeline...")
    
    try:
        from enhanced_rag_pipeline import EnhancedRAGPipeline
        
        # Initialize pipeline
        pipeline = EnhancedRAGPipeline(
            vector_store_path="test_vector_index",
            netcdf_processor_path="test_processed",
            export_path="test_exports"
        )
        print("✅ Enhanced RAG Pipeline initialization: OK")
        
        # Test query processing
        result = pipeline.process_query("Show me temperature data from the Indian Ocean")
        print(f"✅ Query processing: {result.get('text_response', 'No response')[:100]}...")
        
        # Test system stats
        stats = pipeline.get_system_stats()
        print(f"✅ System stats: {len(stats)} metrics retrieved")
        
        return True
        
    except Exception as e:
        print(f"❌ Enhanced RAG Pipeline test failed: {e}")
        traceback.print_exc()
        return False

def cleanup_test_files():
    """Clean up test files"""
    print("\n🧹 Cleaning up test files...")
    
    test_dirs = ["test_processed", "test_vector_index", "test_exports"]
    
    for dir_name in test_dirs:
        try:
            import shutil
            if os.path.exists(dir_name):
                shutil.rmtree(dir_name)
                print(f"✅ Cleaned up {dir_name}")
        except Exception as e:
            print(f"⚠️  Could not clean up {dir_name}: {e}")

def main():
    """Main test function"""
    print("🌊 NeptuneAI ARGO Ocean Data Platform - System Test")
    print("=" * 60)
    
    all_tests_passed = True
    
    # Test imports
    if not test_imports():
        all_tests_passed = False
    
    # Test basic functionality
    if not test_basic_functionality():
        all_tests_passed = False
    
    # Test data processing
    if not test_data_processing():
        all_tests_passed = False
    
    # Test enhanced pipeline
    if not test_enhanced_pipeline():
        all_tests_passed = False
    
    # Cleanup
    cleanup_test_files()
    
    print("\n" + "=" * 60)
    if all_tests_passed:
        print("🎉 ALL TESTS PASSED! System is ready for use.")
        print("\n📋 Next steps:")
        print("1. Set up your .env file with API keys and database credentials")
        print("2. Run: streamlit run frontend/app.py")
        print("3. Access the application at http://localhost:8501")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        print("💡 Most issues are likely due to missing API keys or database connections.")
        print("   The core functionality should still work for testing purposes.")
    
    return all_tests_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)