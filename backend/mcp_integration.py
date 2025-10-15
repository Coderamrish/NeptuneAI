"""
Enhanced MCP Integration with Real Ocean Data
Connects MCP to actual database, vector store, and visualization engines
"""

import json
import asyncio
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum
import pandas as pd

# Import your existing modules
from query_engine import (
    get_db_engine,
    query_by_region,
    query_by_month,
    query_custom,
    get_profiler_stats,
    get_monthly_distribution,
    get_geographic_coverage,
    get_data_for_plotting,
    get_unique_regions,
    get_unique_months
)

from vector_store import ARGOVectorStore

from plots import (
    create_profiler_distribution_plot,
    create_monthly_distribution_plot,
    create_geographic_scatter_plot,
    create_profiler_dashboard
)

from geospatial_viz import ARGOGeospatialVisualizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MessageType(Enum):
    """MCP Message Types"""
    REQUEST = "request"
    RESPONSE = "response"
    NOTIFICATION = "notification"
    ERROR = "error"

class ToolType(Enum):
    """Available Tool Types"""
    QUERY_DATABASE = "query_database"
    GENERATE_VISUALIZATION = "generate_visualization"
    SEARCH_VECTOR_STORE = "search_vector_store"
    EXPORT_DATA = "export_data"
    ANALYZE_PATTERNS = "analyze_patterns"
    GET_STATISTICS = "get_statistics"
    CREATE_GEOSPATIAL_MAP = "create_geospatial_map"

@dataclass
class MCPMessage:
    """Base MCP Message Structure"""
    id: str
    type: MessageType
    timestamp: str
    content: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'type': self.type.value,
            'timestamp': self.timestamp,
            'content': self.content
        }

@dataclass
class MCPRequest:
    """MCP Request Message"""
    id: str
    timestamp: str
    tool: ToolType
    parameters: Dict[str, Any]
    type: MessageType = field(default=MessageType.REQUEST, init=False)
    content: Dict[str, Any] = field(init=False)
    
    def __post_init__(self):
        self.content = {
            'tool': self.tool.value,
            'parameters': self.parameters
        }
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'type': self.type.value,
            'timestamp': self.timestamp,
            'content': self.content
        }

@dataclass
class MCPResponse:
    """MCP Response Message"""
    id: str
    timestamp: str
    success: bool
    result: Any
    error: Optional[str] = None
    type: MessageType = field(default=MessageType.RESPONSE, init=False)
    content: Dict[str, Any] = field(init=False)
    
    def __post_init__(self):
        self.content = {
            'success': self.success,
            'result': self.result,
            'error': self.error
        }
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'type': self.type.value,
            'timestamp': self.timestamp,
            'content': self.content
        }

class MCPToolRegistry:
    """Registry for MCP Tools"""
    
    def __init__(self):
        self.tools = {}
        self._register_default_tools()
    
    def _register_default_tools(self):
        """Register default ARGO ocean data tools"""
        self.tools = {
            ToolType.QUERY_DATABASE: {
                'name': 'query_database',
                'description': 'Query the ARGO oceanographic database',
                'parameters': {
                    'query_type': {'type': 'string', 'required': True},
                    'filters': {'type': 'object', 'required': False},
                    'limit': {'type': 'integer', 'required': False, 'default': 100}
                }
            },
            ToolType.GENERATE_VISUALIZATION: {
                'name': 'generate_visualization',
                'description': 'Generate oceanographic visualizations',
                'parameters': {
                    'chart_type': {'type': 'string', 'required': True},
                    'data': {'type': 'object', 'required': False},
                    'region': {'type': 'string', 'required': False},
                    'options': {'type': 'object', 'required': False}
                }
            },
            ToolType.SEARCH_VECTOR_STORE: {
                'name': 'search_vector_store',
                'description': 'Search the vector store for similar content',
                'parameters': {
                    'query': {'type': 'string', 'required': True},
                    'k': {'type': 'integer', 'required': False, 'default': 10},
                    'filters': {'type': 'object', 'required': False}
                }
            },
            ToolType.EXPORT_DATA: {
                'name': 'export_data',
                'description': 'Export data in various formats',
                'parameters': {
                    'query_params': {'type': 'object', 'required': True},
                    'format': {'type': 'string', 'required': True},
                    'filename': {'type': 'string', 'required': False}
                }
            },
            ToolType.ANALYZE_PATTERNS: {
                'name': 'analyze_patterns',
                'description': 'Analyze oceanographic patterns and trends',
                'parameters': {
                    'region': {'type': 'string', 'required': False},
                    'analysis_type': {'type': 'string', 'required': True},
                    'parameters': {'type': 'object', 'required': False}
                }
            },
            ToolType.GET_STATISTICS: {
                'name': 'get_statistics',
                'description': 'Get statistical summaries of ocean data',
                'parameters': {
                    'region': {'type': 'string', 'required': False},
                    'stat_type': {'type': 'string', 'required': True}
                }
            },
            ToolType.CREATE_GEOSPATIAL_MAP: {
                'name': 'create_geospatial_map',
                'description': 'Create advanced geospatial maps',
                'parameters': {
                    'map_type': {'type': 'string', 'required': True},
                    'region': {'type': 'string', 'required': False},
                    'options': {'type': 'object', 'required': False}
                }
            }
        }
    
    def get_tool_schema(self, tool_type: ToolType) -> Dict[str, Any]:
        """Get tool schema"""
        return self.tools.get(tool_type, {})
    
    def list_tools(self) -> List[Dict[str, Any]]:
        """List all available tools"""
        return [
            {
                'type': tool_type.value,
                'schema': schema
            }
            for tool_type, schema in self.tools.items()
        ]

class EnhancedMCPHandler:
    """Enhanced MCP Handler with Real Data Integration"""
    
    def __init__(self, 
                 vector_store_path: str = "vector_index",
                 enable_vector_store: bool = True):
        """
        Initialize Enhanced MCP Handler
        
        Args:
            vector_store_path: Path to vector store index
            enable_vector_store: Whether to enable vector store
        """
        # Initialize database engine
        try:
            self.db_engine = get_db_engine()
            logger.info("✅ Database engine initialized")
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            self.db_engine = None
        
        # Initialize vector store
        self.vector_store = None
        if enable_vector_store:
            try:
                self.vector_store = ARGOVectorStore(index_path=vector_store_path)
                logger.info("✅ Vector store initialized")
            except Exception as e:
                logger.warning(f"⚠️ Vector store initialization failed: {e}")
        
        # Initialize visualization engines
        try:
            self.geospatial_viz = ARGOGeospatialVisualizer()
            logger.info("✅ Geospatial visualizer initialized")
        except Exception as e:
            logger.warning(f"⚠️ Geospatial visualizer failed: {e}")
            self.geospatial_viz = None
        
        self.tool_registry = MCPToolRegistry()
        self.message_history = []
        
        logger.info("🌊 Enhanced MCP Handler initialized with real data connections")
    
    def generate_message_id(self) -> str:
        """Generate unique message ID"""
        return f"mcp_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
    
    async def handle_request(self, request: MCPRequest) -> MCPResponse:
        """
        Handle MCP request with real data
        
        Args:
            request: MCP request message
            
        Returns:
            MCP response message
        """
        try:
            logger.info(f"Handling MCP request: {request.tool.value}")
            
            # Add to message history
            self.message_history.append(request)
            
            # Route to appropriate handler
            if request.tool == ToolType.QUERY_DATABASE:
                result = await self._handle_database_query(request.parameters)
            elif request.tool == ToolType.GENERATE_VISUALIZATION:
                result = await self._handle_visualization(request.parameters)
            elif request.tool == ToolType.SEARCH_VECTOR_STORE:
                result = await self._handle_vector_search(request.parameters)
            elif request.tool == ToolType.EXPORT_DATA:
                result = await self._handle_data_export(request.parameters)
            elif request.tool == ToolType.ANALYZE_PATTERNS:
                result = await self._handle_pattern_analysis(request.parameters)
            elif request.tool == ToolType.GET_STATISTICS:
                result = await self._handle_statistics(request.parameters)
            elif request.tool == ToolType.CREATE_GEOSPATIAL_MAP:
                result = await self._handle_geospatial_map(request.parameters)
            else:
                raise ValueError(f"Unknown tool type: {request.tool}")
            
            response = MCPResponse(
                id=self.generate_message_id(),
                timestamp=datetime.now().isoformat(),
                success=True,
                result=result
            )
            
            self.message_history.append(response)
            return response
            
        except Exception as e:
            logger.error(f"Error handling MCP request: {e}", exc_info=True)
            
            error_response = MCPResponse(
                id=self.generate_message_id(),
                timestamp=datetime.now().isoformat(),
                success=False,
                result=None,
                error=str(e)
            )
            
            self.message_history.append(error_response)
            return error_response
    
    async def _handle_database_query(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle database query requests with real data"""
        if not self.db_engine:
            return {
                'error': 'Database engine not available',
                'result_count': 0,
                'data': []
            }
        
        query_type = parameters.get('query_type')
        filters = parameters.get('filters', {})
        limit = parameters.get('limit', 100)
        
        try:
            # Execute query based on type
            if query_type == 'by_region':
                region = filters.get('region', 'Indian Ocean')
                result_df = query_by_region(self.db_engine, region, limit)
                
            elif query_type == 'by_month':
                month = filters.get('month', 'January')
                result_df = query_by_month(self.db_engine, month, limit)
                
            elif query_type == 'custom':
                result_df = query_custom(self.db_engine, filters, limit)
                
            elif query_type == 'for_plotting':
                region = filters.get('region')
                month = filters.get('month')
                result_df = get_data_for_plotting(
                    self.db_engine, 
                    region=region, 
                    month=month, 
                    limit=limit
                )
            else:
                raise ValueError(f"Unknown query type: {query_type}")
            
            # Convert DataFrame to dict
            data = result_df.to_dict('records') if not result_df.empty else []
            
            return {
                'query_type': query_type,
                'filters': filters,
                'result_count': len(data),
                'data': data,
                'columns': list(result_df.columns) if not result_df.empty else [],
                'message': f'Successfully retrieved {len(data)} records'
            }
            
        except Exception as e:
            logger.error(f"Database query error: {e}")
            return {
                'error': str(e),
                'result_count': 0,
                'data': []
            }
    
    async def _handle_visualization(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle visualization requests with real data"""
        chart_type = parameters.get('chart_type')
        region = parameters.get('region')
        options = parameters.get('options', {})
        
        try:
            # Get data for visualization
            if not self.db_engine:
                return {'error': 'Database not available', 'figure': None}
            
            # Fetch appropriate data
            df = get_data_for_plotting(self.db_engine, region=region, limit=1000)
            
            if df.empty:
                return {
                    'error': 'No data available for visualization',
                    'figure': None
                }
            
            # Generate visualization based on type
            fig = None
            if chart_type == 'profiler_distribution':
                fig = create_profiler_distribution_plot(df, region)
                
            elif chart_type == 'monthly_distribution':
                fig = create_monthly_distribution_plot(df, region)
                
            elif chart_type == 'geographic_scatter':
                fig = create_geographic_scatter_plot(df, region)
                
            elif chart_type == 'dashboard':
                fig = create_profiler_dashboard(df, region)
                
            else:
                raise ValueError(f"Unknown chart type: {chart_type}")
            
            # Convert figure to JSON
            fig_json = json.loads(fig.to_json()) if fig else None
            
            return {
                'chart_type': chart_type,
                'region': region,
                'figure': fig_json,
                'data_points': len(df),
                'message': 'Visualization created successfully'
            }
            
        except Exception as e:
            logger.error(f"Visualization error: {e}")
            return {
                'error': str(e),
                'figure': None
            }
    
    async def _handle_vector_search(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle vector store search requests"""
        if not self.vector_store:
            return {
                'error': 'Vector store not available',
                'results': []
            }
        
        query = parameters.get('query')
        k = parameters.get('k', 10)
        filters = parameters.get('filters', {})
        
        try:
            results = self.vector_store.search(query, k, filters=filters)
            
            return {
                'query': query,
                'result_count': len(results),
                'results': results,
                'message': f'Found {len(results)} matching documents'
            }
            
        except Exception as e:
            logger.error(f"Vector search error: {e}")
            return {
                'error': str(e),
                'results': []
            }
    
    async def _handle_data_export(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle data export requests"""
        if not self.db_engine:
            return {'error': 'Database not available'}
        
        query_params = parameters.get('query_params', {})
        format_type = parameters.get('format', 'csv')
        filename = parameters.get('filename', f'export_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
        
        try:
            # Get data based on query parameters
            region = query_params.get('region')
            month = query_params.get('month')
            limit = query_params.get('limit', 10000)
            
            df = get_data_for_plotting(self.db_engine, region=region, month=month, limit=limit)
            
            if df.empty:
                return {'error': 'No data to export'}
            
            # Export to specified format
            output_path = f"{filename}.{format_type}"
            
            if format_type == 'csv':
                df.to_csv(output_path, index=False)
            elif format_type == 'json':
                df.to_json(output_path, orient='records', indent=2)
            elif format_type == 'excel':
                df.to_excel(output_path, index=False)
            else:
                raise ValueError(f"Unsupported format: {format_type}")
            
            return {
                'format': format_type,
                'file_path': output_path,
                'records_exported': len(df),
                'message': f'Successfully exported {len(df)} records to {output_path}'
            }
            
        except Exception as e:
            logger.error(f"Export error: {e}")
            return {'error': str(e)}
    
    async def _handle_pattern_analysis(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle pattern analysis requests"""
        if not self.db_engine:
            return {'error': 'Database not available'}
        
        region = parameters.get('region')
        analysis_type = parameters.get('analysis_type')
        
        try:
            results = {}
            
            if analysis_type == 'profiler_stats':
                stats_df = get_profiler_stats(self.db_engine, region)
                results['profiler_statistics'] = stats_df.to_dict('records')
                
            elif analysis_type == 'monthly_trends':
                monthly_df = get_monthly_distribution(self.db_engine, region)
                results['monthly_trends'] = monthly_df.to_dict('records')
                
            elif analysis_type == 'geographic_coverage':
                coverage_df = get_geographic_coverage(self.db_engine, region)
                results['geographic_coverage'] = coverage_df.to_dict('records')
                
            elif analysis_type == 'comprehensive':
                # Get all statistics
                results['profiler_statistics'] = get_profiler_stats(self.db_engine, region).to_dict('records')
                results['monthly_trends'] = get_monthly_distribution(self.db_engine, region).to_dict('records')
                results['geographic_coverage'] = get_geographic_coverage(self.db_engine, region).to_dict('records')
            
            else:
                raise ValueError(f"Unknown analysis type: {analysis_type}")
            
            return {
                'analysis_type': analysis_type,
                'region': region,
                'results': results,
                'message': 'Analysis completed successfully'
            }
            
        except Exception as e:
            logger.error(f"Pattern analysis error: {e}")
            return {'error': str(e)}
    
    async def _handle_statistics(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle statistics requests"""
        if not self.db_engine:
            return {'error': 'Database not available'}
        
        region = parameters.get('region')
        stat_type = parameters.get('stat_type')
        
        try:
            if stat_type == 'regions':
                regions = get_unique_regions(self.db_engine)
                return {
                    'stat_type': 'regions',
                    'count': len(regions),
                    'data': regions
                }
                
            elif stat_type == 'months':
                months = get_unique_months(self.db_engine)
                return {
                    'stat_type': 'months',
                    'count': len(months),
                    'data': months
                }
                
            elif stat_type == 'profiler_summary':
                stats = get_profiler_stats(self.db_engine, region)
                return {
                    'stat_type': 'profiler_summary',
                    'region': region,
                    'data': stats.to_dict('records')
                }
            
            else:
                raise ValueError(f"Unknown stat type: {stat_type}")
                
        except Exception as e:
            logger.error(f"Statistics error: {e}")
            return {'error': str(e)}
    
    async def _handle_geospatial_map(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle geospatial map creation"""
        if not self.db_engine or not self.geospatial_viz:
            return {'error': 'Geospatial visualization not available'}
        
        map_type = parameters.get('map_type')
        region = parameters.get('region')
        options = parameters.get('options', {})
        
        try:
            # Get data
            df = get_data_for_plotting(self.db_engine, region=region, limit=1000)
            
            if df.empty:
                return {'error': 'No data available for map'}
            
            # Create map based on type
            fig = None
            if map_type == 'world_map':
                fig = self.geospatial_viz.create_interactive_world_map(df, region=region)
            elif map_type == 'heatmap':
                fig = self.geospatial_viz.create_heatmap_plot(df, region=region)
            elif map_type == 'dashboard':
                fig = self.geospatial_viz.create_comprehensive_dashboard(df, region=region)
            else:
                raise ValueError(f"Unknown map type: {map_type}")
            
            fig_json = json.loads(fig.to_json()) if fig else None
            
            return {
                'map_type': map_type,
                'region': region,
                'figure': fig_json,
                'data_points': len(df),
                'message': 'Geospatial map created successfully'
            }
            
        except Exception as e:
            logger.error(f"Geospatial map error: {e}")
            return {'error': str(e)}
    
    def create_request(self, tool: ToolType, parameters: Dict[str, Any]) -> MCPRequest:
        """Create an MCP request"""
        return MCPRequest(
            id=self.generate_message_id(),
            timestamp=datetime.now().isoformat(),
            tool=tool,
            parameters=parameters
        )
    
    def get_message_history(self) -> List[Dict[str, Any]]:
        """Get message history"""
        return [msg.to_dict() for msg in self.message_history]
    
    def clear_history(self):
        """Clear message history"""
        self.message_history = []
        logger.info("Message history cleared")

class MCPClient:
    """MCP Client for external communication"""
    
    def __init__(self, handler: EnhancedMCPHandler):
        self.handler = handler
    
    async def send_request(self, tool: ToolType, parameters: Dict[str, Any]) -> MCPResponse:
        """Send a request to the MCP handler"""
        request = self.handler.create_request(tool, parameters)
        return await self.handler.handle_request(request)
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get list of available tools"""
        return self.handler.tool_registry.list_tools()

async def main():
    """Example usage with real data"""
    # Initialize handler
    handler = EnhancedMCPHandler()
    client = MCPClient(handler)
    
    print("\n🌊 Testing Enhanced MCP Integration with Real Data\n")
    
    # Test 1: Query database
    print("📊 Test 1: Querying Indian Ocean data...")
    response = await client.send_request(
        ToolType.QUERY_DATABASE,
        {
            'query_type': 'by_region',
            'filters': {'region': 'Indian Ocean'},
            'limit': 10
        }
    )
    print(f"✅ Success: {response.success}")
    if response.success:
        result = response.result
        print(f"   Found {result['result_count']} records")
        print(f"   Columns: {result.get('columns', [])}")
    
    # Test 2: Generate visualization
    print("\n📈 Test 2: Generating dashboard...")
    response = await client.send_request(
        ToolType.GENERATE_VISUALIZATION,
        {
            'chart_type': 'dashboard',
            'region': 'Indian Ocean'
        }
    )
    print(f"✅ Success: {response.success}")
    if response.success:
        print(f"   Data points: {response.result.get('data_points', 0)}")
    
    # Test 3: Get statistics
    print("\n📊 Test 3: Getting statistics...")
    response = await client.send_request(
        ToolType.GET_STATISTICS,
        {
            'stat_type': 'regions'
        }
    )
    print(f"✅ Success: {response.success}")
    if response.success:
        print(f"   Regions found: {response.result.get('count', 0)}")
    
    # Test 4: Pattern analysis
    print("\n🔍 Test 4: Analyzing patterns...")
    response = await client.send_request(
        ToolType.ANALYZE_PATTERNS,
        {
            'region': 'Indian Ocean',
            'analysis_type': 'comprehensive'
        }
    )
    print(f"✅ Success: {response.success}")
    
    print("\n✅ All tests completed!")
    print(f"📋 Available tools: {len(client.get_available_tools())}")
    print("\n🛠️ Available Tools:")
    for tool in client.get_available_tools():
        print(f"  - {tool['type']}: {tool['schema']['description']}")

if __name__ == "__main__":
    asyncio.run(main())