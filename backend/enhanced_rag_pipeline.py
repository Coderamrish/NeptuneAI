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
from plots import (
    create_profiler_dashboard,
    create_monthly_distribution_plot,
    create_geographic_scatter_plot,
    create_profiler_distribution_plot
)

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
                'data': db_data.to_dict(orient='records') if db_data is not None and not db_data.empty else None,
                'visualization': visualization,
                'intent': intent,
                'vector_context': vector_results[:5],  
                'timestamp': datetime.now().isoformat()
            }
            
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
        
        # Detect database query needs
        db_keywords = ['show', 'find', 'get', 'list', 'count', 'average', 'mean', 'max', 'min', 'data', 'records']
        if any(keyword in user_lower for keyword in db_keywords):
            intent['needs_database'] = True
        
        # Detect visualization needs
        viz_keywords = ['plot', 'chart', 'graph', 'map', 'visualize', 'show me', 'display', 'dashboard', 'pie', 'distribution']
        if any(keyword in user_lower for keyword in viz_keywords):
            intent['needs_visualization'] = True
            intent['needs_database'] = True  # Need data to visualize
        
        # Detect region from the query
        regions = ['indian ocean', 'pacific ocean', 'atlantic ocean', 'arctic ocean', 'southern ocean', 
                   'bay of bengal', 'arabian sea']
        for region in regions:
            if region in user_lower:
                intent['region'] = region.title()
                break
        
        return intent
    
    def _query_database(self, user_input: str, intent: Dict[str, Any]) -> Optional[pd.DataFrame]:
        """Query the database based on the detected intent."""
        try:
            engine = get_db_engine()
            
            region_to_query = intent.get('region')
            if not region_to_query:
                # Default to Indian Ocean
                region_to_query = "Indian Ocean"
            
            logger.info(f"Querying database for region: {region_to_query}")
            result = query_by_region(engine, region_to_query, limit=1000)
            
            if result is not None and not result.empty:
                logger.info(f"Retrieved {len(result)} records from database")
                return result
            else:
                logger.warning("No data retrieved from database")
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"Database query failed: {e}", exc_info=True)
            return pd.DataFrame()
    
    def _generate_mcp_response(self, 
                              user_input: str, 
                              intent: Dict[str, Any],
                              vector_context: List[Dict],
                              db_data: Optional[pd.DataFrame]) -> Dict[str, Any]:
        """Generate a response using the available context."""
        
        try:
            response_text = self._generate_simple_response(user_input, intent, db_data)
            
            return {
                'summary': response_text,
                'context_used': len(vector_context),
                'data_points': len(db_data) if db_data is not None and not db_data.empty else 0
            }
            
        except Exception as e:
            logger.error(f"Error generating MCP response: {e}", exc_info=True)
            return {'summary': 'I encountered an error while generating a response.', 'error': str(e)}
    
    def _generate_simple_response(self, 
                                  user_input: str, 
                                  intent: Dict[str, Any],
                                  db_data: Optional[pd.DataFrame]) -> str:
        """
        Generate intelligent, context-aware responses using Groq AI or fallback to templates.
        """
        user_lower = user_input.lower()
        
        # ✅ STEP 1: Handle Greetings
        greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "greetings"]
        if any(g in user_lower for g in greetings):
            name = None
            name_patterns = ["i am", "i'm", "my name is", "call me", "this is"]
            for pattern in name_patterns:
                if pattern in user_lower:
                    words = user_input.split()
                    for i, word in enumerate(words):
                        if word.lower() in pattern.split() and i + 1 < len(words):
                            potential_name = words[i + 1].strip('.,!?')
                            if potential_name.isalpha() and len(potential_name) > 2:
                                name = potential_name.title()
                                self.user_profile['name'] = name
                                break
            
            greeting_response = f"Hello{', ' + name if name else ''}! 👋 I'm NeptuneAI, your comprehensive ocean data assistant.\n\n"
            greeting_response += "🌊 I can help you with:\n"
            greeting_response += "• Ocean temperature, salinity, and pressure data\n"
            greeting_response += "• Geographic maps and visualizations\n"
            greeting_response += "• Profiler deployment information\n"
            greeting_response += "• Sea level trends and climate analysis\n"
            greeting_response += "• Regional ocean comparisons\n\n"
            greeting_response += "What would you like to explore today?"
            return greeting_response
        
        # ✅ STEP 2: Handle Thank You Messages
        thanks = ["thank", "thanks", "appreciate", "grateful"]
        if any(t in user_lower for t in thanks):
            return "You're very welcome! 😊 I'm always here to help you explore ocean science. Feel free to ask anything else!"
        
        # ✅ STEP 3: Try Groq AI for Intelligent Responses
        try:
            from groq import Groq
            
            groq_api_key = os.getenv("GROQ_API_KEY")
            if groq_api_key:
                client = Groq(api_key=groq_api_key)
                
                # Build context for Groq
                context_parts = []
                
                # Add database context
                if db_data is not None and not db_data.empty:
                    context_parts.append(f"Database Query Results: {len(db_data)} records found")
                    
                    if intent.get('region'):
                        context_parts.append(f"Region: {intent['region']}")
                    
                    # Add statistical summary
                    numeric_cols = db_data.select_dtypes(include=[np.number]).columns
                    for col in numeric_cols[:5]:  # Limit to 5 columns
                        if db_data[col].notna().any():
                            avg_val = db_data[col].mean()
                            min_val = db_data[col].min()
                            max_val = db_data[col].max()
                            context_parts.append(f"{col.title()} Stats: Avg={avg_val:.2f}, Range={min_val:.2f}-{max_val:.2f}")
                    
                    if 'latitude' in db_data.columns and 'longitude' in db_data.columns:
                        lat_range = f"{db_data['latitude'].min():.2f} to {db_data['latitude'].max():.2f}"
                        lon_range = f"{db_data['longitude'].min():.2f} to {db_data['longitude'].max():.2f}"
                        context_parts.append(f"Geographic Coverage: Lat {lat_range}, Lon {lon_range}")
                
                data_context = "\n".join(context_parts) if context_parts else "No database results available"
                
                # Create system prompt
                system_prompt = """You are NeptuneAI, an expert oceanographic AI assistant. 

PERSONALITY:
- Warm, enthusiastic, and knowledgeable about ocean science
- Use appropriate emojis naturally (🌊 🔬 📊 🌡️ 💧 🗺️)
- Be conversational and engaging, not robotic
- Show genuine interest in helping users understand ocean data

RESPONSE GUIDELINES:
1. Start with a direct answer to the user's question
2. Incorporate the database statistics naturally into your response
3. Provide context and interesting insights
4. Keep responses focused (150-250 words unless detailed explanation needed)
5. Suggest visualizations or follow-up questions when appropriate
6. Be educational but accessible

FORMATTING:
- Use clear paragraphs, not bullet points unless listing multiple items
- Include relevant emojis to make responses engaging
- Mention specific numbers from the data to show you're using real information"""

                user_prompt = f"""User Query: "{user_input}"

Available Data Context:
{data_context}

Query Intent:
- Region: {intent.get('region', 'Not specified')}
- Needs Visualization: {intent.get('needs_visualization', False)}
- Query Type: {intent.get('query_type', 'general')}

Generate a natural, informative response that answers the user's question using the available data."""

                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.7,
                    max_tokens=800
                )
                
                ai_response = response.choices[0].message.content
                
                # Add visualization note if applicable
                if intent.get('needs_visualization') and db_data is not None and not db_data.empty:
                    ai_response += "\n\n📊 I've also generated a visualization to help you explore this data visually!"
                
                return ai_response
                
        except Exception as e:
            logger.error(f"Groq AI generation failed: {e}")
            # Fall through to template-based response
        
        # ✅ STEP 4: Fallback to Template-Based Response
        response_parts = []
        
        # Acknowledge the data finding
        if db_data is not None and not db_data.empty:
            response_parts.append(f"🔍 I found {len(db_data)} relevant oceanographic records")
            
            if intent.get('region'):
                response_parts.append(f"from the {intent['region']}.")
            else:
                response_parts.append("from the database.")
            
            # Add statistical summary with emojis
            stats = []
            numeric_cols = db_data.select_dtypes(include=[np.number]).columns
            
            for col in numeric_cols[:3]:  # Limit to 3 stats
                if db_data[col].notna().any():
                    avg_val = db_data[col].mean()
                    min_val = db_data[col].min()
                    max_val = db_data[col].max()
                    stats.append(f"📊 **{col.title()}**: Average {avg_val:.2f} (range: {min_val:.2f} to {max_val:.2f})")
            
            if stats:
                response_parts.append("\n\n**Key Statistics:**")
                response_parts.append("\n".join(stats))
            
            # Add geographic info
            if 'latitude' in db_data.columns and 'longitude' in db_data.columns:
                lat_range = f"{db_data['latitude'].min():.2f}° to {db_data['latitude'].max():.2f}°"
                lon_range = f"{db_data['longitude'].min():.2f}° to {db_data['longitude'].max():.2f}°"
                response_parts.append(f"\n\n🗺️ **Geographic Coverage**: Latitude {lat_range}, Longitude {lon_range}")
        
        elif intent.get('needs_database'):
            response_parts.append("🔍 I searched the database but couldn't find any matching records for your query.")
            response_parts.append("\n\nTry:")
            response_parts.append("• Specifying a different ocean region (e.g., Indian Ocean, Pacific Ocean)")
            response_parts.append("• Asking about general ocean properties")
            response_parts.append("• Checking available regions with 'What regions do you have data for?'")
        
        # Offer visualization
        if intent.get('needs_visualization') and db_data is not None and not db_data.empty:
            response_parts.append("\n\n📊 I've also generated a visualization to help you explore this data!")
        
        # Default response if no other parts were added
        if not response_parts:
            response_parts.append("🌊 Hello! I'm NeptuneAI, your ocean data expert.")
            response_parts.append("\n\nI can help you with:")
            response_parts.append("• 🌡️ Ocean temperature and salinity analysis")
            response_parts.append("• 🗺️ Geographic distribution maps")
            response_parts.append("• 📊 Statistical trends and patterns")
            response_parts.append("• 🔬 Profiler deployment information")
            response_parts.append("\n\nWhat would you like to know about our oceans?")
        
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
            
            user_lower = user_input.lower()
            region = intent.get('region')
            
            # Determine which visualization to create based on keywords
            if any(word in user_lower for word in ['dashboard', 'overview', 'summary', 'all']):
                return create_profiler_dashboard(db_data, region_name=region)
            
            elif any(word in user_lower for word in ['map', 'geographic', 'location', 'where', 'scatter']):
                return create_geographic_scatter_plot(db_data, region_name=region)
            
            elif any(word in user_lower for word in ['monthly', 'month', 'time', 'trend', 'seasonal']):
                return create_monthly_distribution_plot(db_data, region_name=region)
            
            elif any(word in user_lower for word in ['profiler', 'instrument', 'deployment', 'type', 'distribution']):
                return create_profiler_distribution_plot(db_data, region_name=region)
            
            else:
                # Default to comprehensive dashboard
                return create_profiler_dashboard(db_data, region_name=region)
                
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
    print("✅ Components loaded: NetCDF, Vector Store, Geospatial Viz, Data Export.")
    
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