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
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedRAGPipeline:
    """
    Enhanced RAG Pipeline integrating all ARGO ocean data components
    """
    
    def __init__(self, 
                 vector_store_path: str = "vector_index",
                 netcdf_processor_path: str = "processed_data",
                 export_path: str = "exports"):
        """
        Initialize the enhanced RAG pipeline
        
        Args:
            vector_store_path: Path for vector store
            netcdf_processor_path: Path for NetCDF processing
            export_path: Path for data exports
        """
        # Initialize components
        self.netcdf_processor = ARGONetCDFProcessor(netcdf_processor_path)
        self.vector_store = ARGOVectorStore(vector_store_path)
        self.geospatial_viz = ARGOGeospatialVisualizer()
        self.data_exporter = ARGODataExporter(export_path)
        
        # Initialize MCP handler
        self.mcp_handler = MCPHandler(
            query_engine=None,  # Will be set later
            vector_store=self.vector_store,
            visualization_engine=self.geospatial_viz
        )
        self.mcp_client = MCPClient(self.mcp_handler)
        
        # Initialize conversation history
        self.conversation_history = []
        self.user_profile = {"name": None, "preferences": [], "previous_queries": []}
        
        logger.info("Enhanced RAG Pipeline initialized")
    
    def process_netcdf_files(self, 
                           netcdf_directory: str,
                           pattern: str = "*.nc") -> Dict[str, Any]:
        """
        Process NetCDF files and add to vector store
        
        Args:
            netcdf_directory: Directory containing NetCDF files
            pattern: File pattern to match
            
        Returns:
            Processing summary
        """
        try:
            logger.info(f"Processing NetCDF files from {netcdf_directory}")
            
            # Process NetCDF files
            processed_files = self.netcdf_processor.process_directory(netcdf_directory, pattern)
            
            if not processed_files:
                logger.warning("No NetCDF files found or processed")
                return {"status": "no_files", "message": "No NetCDF files found"}
            
            # Add to vector store
            total_profiles = 0
            for file_data in processed_files:
                if 'profile_data' in file_data and not file_data['profile_data'].empty:
                    doc_ids = self.vector_store.add_profile_data(file_data['profile_data'])
                    total_profiles += len(doc_ids)
            
            # Create summary
            summary = self.netcdf_processor.create_summary_report(processed_files)
            summary['vector_store_entries'] = total_profiles
            
            # Save vector store
            self.vector_store._save_index()
            
            logger.info(f"Processed {len(processed_files)} files, added {total_profiles} profiles to vector store")
            return {"status": "success", "summary": summary}
            
        except Exception as e:
            logger.error(f"Error processing NetCDF files: {e}")
            return {"status": "error", "message": str(e)}
    
    def process_query(self, 
                     user_input: str,
                     include_visualization: bool = True) -> Dict[str, Any]:
        """
        Process user query using enhanced RAG pipeline
        
        Args:
            user_input: User's natural language query
            include_visualization: Whether to generate visualizations
            
        Returns:
            Response with text, data, and optional visualization
        """
        try:
            logger.info(f"Processing query: {user_input}")
            
            # Analyze query intent
            intent = self._analyze_query_intent(user_input)
            
            # Search vector store for relevant context
            vector_results = self.vector_store.search(user_input, k=10)
            
            # Query database if needed
            db_data = None
            if intent['needs_database']:
                db_data = self._query_database(user_input, intent)
            
            # Generate response using MCP
            response = self._generate_mcp_response(user_input, intent, vector_results, db_data)
            
            # Generate visualization if requested
            visualization = None
            if include_visualization and intent['needs_visualization']:
                visualization = self._generate_visualization(user_input, intent, db_data)
            
            # Create comprehensive response
            result = {
                'text_response': response.get('summary', 'I could not process your request.'),
                'data': db_data,
                'visualization': visualization,
                'intent': intent,
                'vector_context': vector_results[:5],  # Top 5 relevant contexts
                'timestamp': datetime.now().isoformat()
            }
            
            # Store in conversation history
            self.conversation_history.append({
                'user_input': user_input,
                'response': result,
                'timestamp': datetime.now().isoformat()
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return {
                'text_response': f"I encountered an error: {str(e)}",
                'data': None,
                'visualization': None,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _analyze_query_intent(self, user_input: str) -> Dict[str, Any]:
        """Analyze user query to determine intent and required actions"""
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
        
        # Check for database queries
        db_keywords = ['show', 'find', 'get', 'list', 'count', 'average', 'mean', 'max', 'min']
        if any(keyword in user_lower for keyword in db_keywords):
            intent['needs_database'] = True
        
        # Check for visualization requests
        viz_keywords = ['plot', 'chart', 'graph', 'map', 'visualize', 'show me', 'display']
        if any(keyword in user_lower for keyword in viz_keywords):
            intent['needs_visualization'] = True
        
        # Check for export requests
        export_keywords = ['export', 'download', 'save', 'csv', 'netcdf', 'json']
        if any(keyword in user_lower for keyword in export_keywords):
            intent['needs_export'] = True
        
        # Detect region
        regions = ['indian ocean', 'pacific ocean', 'atlantic ocean', 'arctic ocean', 'southern ocean']
        for region in regions:
            if region in user_lower:
                intent['region'] = region.title()
                break
        
        # Detect variables
        variables = ['temperature', 'salinity', 'pressure', 'depth', 'density']
        for var in variables:
            if var in user_lower:
                intent['variables'].append(var)
        
        # Detect time references
        time_keywords = ['january', 'february', 'march', 'april', 'may', 'june',
                        'july', 'august', 'september', 'october', 'november', 'december',
                        '2023', '2024', 'last year', 'this year', 'recent']
        for keyword in time_keywords:
            if keyword in user_lower:
                intent['time_range'] = keyword
                break
        
        return intent
    
    def _query_database(self, user_input: str, intent: Dict[str, Any]) -> Optional[pd.DataFrame]:
        """Query the database based on intent"""
        try:
            engine = get_db_engine()
            
            if intent['region']:
                return query_by_region(engine, intent['region'], limit=1000)
            else:
                # Default query
                return query_by_region(engine, "Indian Ocean", limit=1000)
                
        except Exception as e:
            logger.error(f"Database query failed: {e}")
            return None
    
    def _generate_mcp_response(self, 
                              user_input: str, 
                              intent: Dict[str, Any],
                              vector_context: List[Dict],
                              db_data: Optional[pd.DataFrame]) -> Dict[str, Any]:
        """Generate response using MCP"""
        try:
            # Prepare context
            context_parts = []
            
            # Add vector context
            if vector_context:
                context_parts.append("Relevant ocean data context:")
                for ctx in vector_context[:3]:
                    if 'content' in ctx:
                        context_parts.append(f"- {ctx['content'][:200]}...")
            
            # Add database context
            if db_data is not None and not db_data.empty:
                context_parts.append(f"Database query returned {len(db_data)} records")
                if intent.get('region'):
                    context_parts.append(f"Data from {intent['region']}")
            
            context = "\n".join(context_parts)
            
            # For now, create a simple response
            # In a full implementation, this would use the MCP handler
            response_text = self._generate_simple_response(user_input, intent, db_data)
            
            return {
                'summary': response_text,
                'context_used': len(vector_context),
                'data_points': len(db_data) if db_data is not None else 0
            }
            
        except Exception as e:
            logger.error(f"Error generating MCP response: {e}")
            return {'summary': 'I encountered an error generating a response.', 'error': str(e)}
    
    def _generate_simple_response(self, 
                                 user_input: str, 
                                 intent: Dict[str, Any],
                                 db_data: Optional[pd.DataFrame]) -> str:
        """Generate a simple response without full MCP integration"""
        response_parts = []
        
        # Greeting
        if any(word in user_input.lower() for word in ['hello', 'hi', 'hey']):
            response_parts.append("Hello! I'm NeptuneAI, your ocean data assistant. 🌊")
        
        # Data summary
        if db_data is not None and not db_data.empty:
            response_parts.append(f"I found {len(db_data)} oceanographic records")
            
            if intent['region']:
                response_parts.append(f"focused on the {intent['region']}")
            
            # Add some statistics
            if 'temperature' in db_data.columns:
                avg_temp = db_data['temperature'].mean()
                response_parts.append(f"Average temperature: {avg_temp:.2f}°C")
            
            if 'salinity' in db_data.columns:
                avg_sal = db_data['salinity'].mean()
                response_parts.append(f"Average salinity: {avg_sal:.2f} PSU")
        
        # Offer visualization
        if intent['needs_visualization']:
            response_parts.append("I can create visualizations to help you explore this data further.")
        
        # Default response
        if not response_parts:
            response_parts.append("I'm here to help you explore oceanographic data. What would you like to know?")
        
        return " ".join(response_parts)
    
    def _generate_visualization(self, 
                               user_input: str, 
                               intent: Dict[str, Any],
                               db_data: Optional[pd.DataFrame]) -> Optional[Any]:
        """Generate visualization based on intent and data"""
        try:
            if db_data is None or db_data.empty:
                return None
            
            # Determine visualization type
            if 'map' in user_input.lower() or 'geographic' in user_input.lower():
                return self.geospatial_viz.create_interactive_world_map(
                    db_data, 
                    region=intent.get('region')
                )
            elif 'trajectory' in user_input.lower() or 'path' in user_input.lower():
                return self.geospatial_viz.create_trajectory_map(db_data)
            elif 'profile' in user_input.lower() or 'depth' in user_input.lower():
                return self.geospatial_viz.create_depth_profile_plot(db_data)
            elif 'heatmap' in user_input.lower():
                return self.geospatial_viz.create_heatmap_plot(db_data)
            else:
                # Default to comprehensive dashboard
                return self.geospatial_viz.create_comprehensive_dashboard(
                    db_data, 
                    region=intent.get('region')
                )
                
        except Exception as e:
            logger.error(f"Error generating visualization: {e}")
            return None
    
    def export_data(self, 
                   data: pd.DataFrame, 
                   format_type: str = 'csv',
                   filename: str = None) -> str:
        """Export data in specified format"""
        try:
            if format_type == 'csv':
                return self.data_exporter.export_to_csv(data, filename)
            elif format_type == 'netcdf':
                return self.data_exporter.export_to_netcdf(data, filename)
            elif format_type == 'json':
                return self.data_exporter.export_to_json(data, filename)
            elif format_type == 'ascii':
                return self.data_exporter.export_to_ascii(data, filename)
            else:
                raise ValueError(f"Unsupported format: {format_type}")
                
        except Exception as e:
            logger.error(f"Error exporting data: {e}")
            return None
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get comprehensive system statistics"""
        try:
            vector_stats = self.vector_store.get_stats()
            export_stats = self.data_exporter.get_export_stats()
            
            return {
                'vector_store': vector_stats,
                'exports': export_stats,
                'conversation_history_length': len(self.conversation_history),
                'user_profile': self.user_profile,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting system stats: {e}")
            return {'error': str(e)}
    
    def clear_conversation_history(self):
        """Clear conversation history"""
        self.conversation_history = []
        logger.info("Conversation history cleared")
    
    def save_conversation_history(self, filename: str = None) -> str:
        """Save conversation history to file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"conversation_history_{timestamp}.json"
        
        try:
            output_path = Path(self.data_exporter.output_dir) / filename
            
            with open(output_path, 'w') as f:
                json.dump(self.conversation_history, f, indent=2, default=str)
            
            logger.info(f"Conversation history saved to {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error saving conversation history: {e}")
            return None

def main():
    """Example usage of the enhanced RAG pipeline"""
    # Initialize pipeline
    pipeline = EnhancedRAGPipeline()
    
    # Example: Process a query
    query = "Show me temperature data from the Indian Ocean"
    result = pipeline.process_query(query)
    
    print(f"Query: {query}")
    print(f"Response: {result['text_response']}")
    print(f"Data points: {result.get('data_points', 0)}")
    print(f"Visualization generated: {result['visualization'] is not None}")
    
    # Get system stats
    stats = pipeline.get_system_stats()
    print(f"System stats: {stats}")
    
    print("🌊 Enhanced RAG Pipeline initialized")
    print("🔧 Components: NetCDF, Vector Store, MCP, Geospatial Viz, Data Export")

if __name__ == "__main__":
    main()