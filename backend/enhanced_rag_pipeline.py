"""
Enhanced RAG Pipeline for ARGO Ocean Data
Integrates NetCDF processing, vector store, MCP, and advanced visualizations
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
import logging
from pathlib import Path

# Import our custom modules
from netcdf_processor import ARGONetCDFProcessor
from vector_store import ARGOVectorStore
from mcp_integration import MCPHandler, MCPClient, ToolType
from geospatial_viz import ARGOGeospatialVisualizer
from data_export import ARGODataExporter
from query_engine import get_db_engine, get_unique_regions, query_by_region
from plots import create_profiler_dashboard

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnhancedRAGPipeline:
    """
    Enhanced RAG Pipeline integrating all ARGO ocean data components.
    """
    
    def __init__(self, 
                 vector_store_path: str = "vector_index",
                 netcdf_processor_path: str = "processed_data",
                 export_path: str = "exports"):
        """
        Initialize the enhanced RAG pipeline.
        
        Args:
            vector_store_path: Path for the vector store.
            netcdf_processor_path: Path for NetCDF processing outputs.
            export_path: Path for data exports.
        """
        # Initialize components
        self.netcdf_processor = ARGONetCDFProcessor(netcdf_processor_path)
        self.vector_store = ARGOVectorStore(vector_store_path)
        self.geospatial_viz = ARGOGeospatialVisualizer()
        self.data_exporter = ARGODataExporter(export_path)
        
        # Initialize MCP handler (query_engine can be set later if needed)
        self.mcp_handler = MCPHandler(
            query_engine=None,
            vector_store=self.vector_store,
            visualization_engine=self.geospatial_viz
        )
        self.mcp_client = MCPClient(self.mcp_handler)
        
        # Initialize conversation history and user profile
        self.conversation_history = []
        self.user_profile = {"name": None, "preferences": [], "previous_queries": []}
        
        logger.info("Enhanced RAG Pipeline initialized successfully.")
    
    def process_netcdf_files(self, 
                             netcdf_directory: str,
                             pattern: str = "*.nc") -> Dict[str, Any]:
        """
        Process NetCDF files and add their data to the vector store.
        
        Args:
            netcdf_directory: Directory containing NetCDF files.
            pattern: File pattern to match (e.g., "*.nc").
            
        Returns:
            A dictionary containing the processing summary.
        """
        try:
            logger.info(f"Starting NetCDF processing from directory: {netcdf_directory}")
            
            # Process all NetCDF files in the specified directory
            processed_files = self.netcdf_processor.process_directory(netcdf_directory, pattern)
            
            if not processed_files:
                logger.warning("No NetCDF files were found or processed.")
                return {"status": "no_files", "message": "No NetCDF files found in the specified directory."}
            
            # Add extracted profile data to the vector store
            total_profiles = 0
            for file_data in processed_files:
                if 'profile_data' in file_data and not file_data['profile_data'].empty:
                    doc_ids = self.vector_store.add_profile_data(file_data['profile_data'])
                    total_profiles += len(doc_ids)
            
            # Create a summary report of the processing task
            summary = self.netcdf_processor.create_summary_report(processed_files)
            summary['vector_store_entries_added'] = total_profiles
            
            # Save the updated vector store index to disk
            self.vector_store._save_index()
            
            logger.info(f"Processed {len(processed_files)} files, adding {total_profiles} profiles to the vector store.")
            return {"status": "success", "summary": summary}
            
        except Exception as e:
            logger.error(f"An error occurred during NetCDF processing: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}
    
    def process_query(self, 
                      user_input: str,
                      include_visualization: bool = True) -> Dict[str, Any]:
        """
        Process a user's query using the enhanced RAG pipeline.
        
        Args:
            user_input: The user's natural language query.
            include_visualization: Flag to generate visualizations.
            
        Returns:
            A dictionary containing the text response, data, and optional visualization.
        """
        try:
            logger.info(f"Processing user query: '{user_input}'")
            
            # 1. Analyze query to understand intent
            intent = self._analyze_query_intent(user_input)
            
            # 2. Retrieve relevant context from the vector store
            vector_results = self.vector_store.search(user_input, k=10)
            
            # 3. Query the structured database if needed
            db_data = None
            if intent['needs_database']:
                db_data = self._query_database(user_input, intent)
            
            # 4. Generate a natural language response
            response = self._generate_mcp_response(user_input, intent, vector_results, db_data)
            
            # 5. Generate a visualization if requested and data is available
            visualization = None
            if include_visualization and intent['needs_visualization'] and db_data is not None and not db_data.empty:
                visualization = self._generate_visualization(user_input, intent, db_data)
            
            # 6. Assemble the final result
            result = {
                'text_response': response.get('summary', 'I could not process your request.'),
                'data': db_data.to_dict(orient='records') if db_data is not None else None,
                'visualization': visualization,
                'intent': intent,
                'vector_context': vector_results[:5],  # Include top 5 contexts for review
                'timestamp': datetime.now().isoformat()
            }
            
            # Store the interaction in conversation history
            self.conversation_history.append({
                'user_input': user_input,
                'response': result,
                'timestamp': datetime.now().isoformat()
            })
            
            return result
            
        except Exception as e:
            logger.error(f"An error occurred while processing the query: {e}", exc_info=True)
            return {
                'text_response': f"I'm sorry, I encountered an error: {str(e)}",
                'data': None,
                'visualization': None,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _analyze_query_intent(self, user_input: str) -> Dict[str, Any]:
        """Analyze a user query to determine intent and required actions."""
        user_lower = user_input.lower()
        
        intent = {
            'needs_database': False,
            'needs_visualization': False,
            'needs_export': False,
            'query_type': 'general',
            'region': None,
            'variables': [],
            'time_range': None
        }
        
        # Check for keywords indicating a database query
        db_keywords = ['show', 'find', 'get', 'list', 'count', 'average', 'mean', 'max', 'min']
        if any(keyword in user_lower for keyword in db_keywords):
            intent['needs_database'] = True
        
        # Check for keywords indicating a visualization request
        viz_keywords = ['plot', 'chart', 'graph', 'map', 'visualize', 'show me', 'display']
        if any(keyword in user_lower for keyword in viz_keywords):
            intent['needs_visualization'] = True
        
        # Detect region from the query
        regions = ['indian ocean', 'pacific ocean', 'atlantic ocean', 'arctic ocean', 'southern ocean']
        for region in regions:
            if region in user_lower:
                intent['region'] = region.title()
                break
        
        return intent
    
    def _query_database(self, user_input: str, intent: Dict[str, Any]) -> Optional[pd.DataFrame]:
        """Query the database based on the detected intent."""
        try:
            engine = get_db_engine()
            
            # Prioritize region found in intent, otherwise default to a general query
            region_to_query = intent.get('region', "Indian Ocean")
            logger.info(f"Querying database for region: {region_to_query}")
            return query_by_region(engine, region_to_query, limit=1000)
                
        except Exception as e:
            logger.error(f"Database query failed: {e}", exc_info=True)
            return None
    
    def _generate_mcp_response(self, 
                              user_input: str, 
                              intent: Dict[str, Any],
                              vector_context: List[Dict],
                              db_data: Optional[pd.DataFrame]) -> Dict[str, Any]:
        """Generate a response using the available context (simplified for now)."""
        # Note: This is a placeholder for a true MCP/LLM call.
        # It synthesizes a response based on templates.
        try:
            response_text = self._generate_simple_response(user_input, intent, db_data)
            
            return {
                'summary': response_text,
                'context_used': len(vector_context),
                'data_points': len(db_data) if db_data is not None else 0
            }
            
        except Exception as e:
            logger.error(f"Error generating MCP response: {e}", exc_info=True)
            return {'summary': 'I encountered an error while generating a response.', 'error': str(e)}
    
    def _generate_simple_response(self, 
                                  user_input: str, 
                                  intent: Dict[str, Any],
                                  db_data: Optional[pd.DataFrame]) -> str:
        """Generate a simple, template-based response."""
        response_parts = []
        
        # Acknowledge the data finding
        if db_data is not None and not db_data.empty:
            response_parts.append(f"I found {len(db_data)} relevant oceanographic records")
            
            if intent['region']:
                response_parts.append(f"from the {intent['region']}.")
            else:
                response_parts.append(".")

            # Add a brief statistical summary
            if 'temperature' in db_data.columns:
                avg_temp = db_data['temperature'].mean()
                response_parts.append(f"The average temperature in this dataset is {avg_temp:.2f}°C.")
            
            if 'salinity' in db_data.columns:
                avg_sal = db_data['salinity'].mean()
                response_parts.append(f"The average salinity is {avg_sal:.2f} PSU.")
        
        elif intent['needs_database']:
            response_parts.append("I looked for the data you requested but couldn't find any matching records.")

        # Offer next steps
        if intent['needs_visualization'] and db_data is not None and not db_data.empty:
            response_parts.append("I've also generated a visualization for you to explore this data.")
        
        # Default response if no other parts were added
        if not response_parts:
            response_parts.append("Hello! I am NeptuneAI. 🌊 How can I help you explore global ocean data today?")
        
        return " ".join(response_parts)
    
    def _generate_visualization(self, 
                                user_input: str, 
                                intent: Dict[str, Any],
                                db_data: Optional[pd.DataFrame]) -> Optional[Any]:
        """Generate a visualization based on the query intent and available data."""
        try:
            if db_data is None or db_data.empty:
                logger.warning("Visualization generation skipped: No data available.")
                return None
            
            logger.info("Generating visualization...")
            # Default to a comprehensive dashboard, which is often the most useful.
            return self.geospatial_viz.create_comprehensive_dashboard(
                db_data, 
                region=intent.get('region')
            )
                
        except Exception as e:
            logger.error(f"Error generating visualization: {e}", exc_info=True)
            return None
    
    def export_data(self, 
                    data: pd.DataFrame, 
                    format_type: str = 'csv',
                    filename: str = None) -> Optional[str]:
        """Export data in a specified format."""
        try:
            logger.info(f"Exporting data to {format_type.upper()} format.")
            export_methods = {
                'csv': self.data_exporter.export_to_csv,
                'netcdf': self.data_exporter.export_to_netcdf,
                'json': self.data_exporter.export_to_json,
                'ascii': self.data_exporter.export_to_ascii,
            }
            
            if format_type in export_methods:
                return export_methods[format_type](data, filename)
            else:
                raise ValueError(f"Unsupported export format: {format_type}")
                
        except Exception as e:
            logger.error(f"Error exporting data: {e}", exc_info=True)
            return None
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get comprehensive statistics about the system's state."""
        try:
            return {
                'vector_store': self.vector_store.get_stats(),
                'exports': self.data_exporter.get_export_stats(),
                'conversation_history_length': len(self.conversation_history),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting system stats: {e}", exc_info=True)
            return {'error': str(e)}

def main():
    """Example usage of the EnhancedRAGPipeline."""
    print("🌊 Initializing Enhanced RAG Pipeline...")
    pipeline = EnhancedRAGPipeline()
    print("🔧 Components loaded: NetCDF, Vector Store, Geospatial Viz, Data Export.")
    
    # Example 1: Process a query
    print("\n--- Processing an example query ---")
    query = "Show me temperature data from the Indian Ocean and create a map"
    result = pipeline.process_query(query)
    
    print(f"\nQuery: '{query}'")
    print(f"Response: {result['text_response']}")
    
    if result.get('data'):
        print(f"Data Points Found: {len(result['data'])}")
    if result.get('visualization'):
        print("Visualization Generated: Yes")
    else:
        print("Visualization Generated: No")

    # Example 2: Get system stats
    print("\n--- Fetching system statistics ---")
    stats = pipeline.get_system_stats()
    print(json.dumps(stats, indent=2))
    print("\n✅ Pipeline demonstration complete.")

if __name__ == "__main__":
    main()