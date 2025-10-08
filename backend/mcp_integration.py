"""
Model Context Protocol (MCP) Integration for ARGO Ocean Data
Implements MCP for structured LLM communication
"""

import json
import asyncio
from typing import Dict, List, Optional, Any, Union
import logging
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum

# Configure logging
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

@dataclass
class MCPMessage:
    """Base MCP Message Structure"""
    id: str
    type: MessageType
    timestamp: str
    content: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'MCPMessage':
        return cls(
            id=data['id'],
            type=MessageType(data['type']),
            timestamp=data['timestamp'],
            content=data['content']
        )

@dataclass
class MCPRequest(MCPMessage):
    """MCP Request Message"""
    tool: ToolType
    parameters: Dict[str, Any]
    
    def __post_init__(self):
        self.type = MessageType.REQUEST
        self.content = {
            'tool': self.tool.value,
            'parameters': self.parameters
        }

@dataclass
class MCPResponse(MCPMessage):
    """MCP Response Message"""
    success: bool
    result: Any
    error: Optional[str] = None
    
    def __post_init__(self):
        self.type = MessageType.RESPONSE
        self.content = {
            'success': self.success,
            'result': self.result,
            'error': self.error
        }

@dataclass
class MCPNotification(MCPMessage):
    """MCP Notification Message"""
    event: str
    data: Dict[str, Any]
    
    def __post_init__(self):
        self.type = MessageType.NOTIFICATION
        self.content = {
            'event': self.event,
            'data': self.data
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
                    'data': {'type': 'object', 'required': True},
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
                    'data': {'type': 'object', 'required': True},
                    'format': {'type': 'string', 'required': True},
                    'filename': {'type': 'string', 'required': False}
                }
            },
            ToolType.ANALYZE_PATTERNS: {
                'name': 'analyze_patterns',
                'description': 'Analyze oceanographic patterns and trends',
                'parameters': {
                    'data': {'type': 'object', 'required': True},
                    'analysis_type': {'type': 'string', 'required': True},
                    'parameters': {'type': 'object', 'required': False}
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

class MCPHandler:
    """Main MCP Handler for ARGO Ocean Data"""
    
    def __init__(self, 
                 query_engine=None,
                 vector_store=None,
                 visualization_engine=None):
        """
        Initialize MCP Handler
        
        Args:
            query_engine: Database query engine
            vector_store: Vector store instance
            visualization_engine: Visualization engine
        """
        self.query_engine = query_engine
        self.vector_store = vector_store
        self.visualization_engine = visualization_engine
        self.tool_registry = MCPToolRegistry()
        self.message_history = []
        
        logger.info("MCP Handler initialized")
    
    def generate_message_id(self) -> str:
        """Generate unique message ID"""
        return f"mcp_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
    
    async def handle_request(self, request: MCPRequest) -> MCPResponse:
        """
        Handle MCP request
        
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
            logger.error(f"Error handling MCP request: {e}")
            
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
        """Handle database query requests"""
        if not self.query_engine:
            raise ValueError("Query engine not available")
        
        query_type = parameters.get('query_type')
        filters = parameters.get('filters', {})
        limit = parameters.get('limit', 100)
        
        # Execute query based on type
        if query_type == 'by_region':
            region = filters.get('region', 'Indian Ocean')
            result = self.query_engine.query_by_region(
                self.query_engine.get_db_engine(), 
                region, 
                limit
            )
        elif query_type == 'by_month':
            month = filters.get('month', 'January')
            result = self.query_engine.query_by_month(
                self.query_engine.get_db_engine(), 
                month, 
                limit
            )
        elif query_type == 'custom':
            result = self.query_engine.query_custom(
                self.query_engine.get_db_engine(), 
                filters, 
                limit
            )
        else:
            raise ValueError(f"Unknown query type: {query_type}")
        
        return {
            'query_type': query_type,
            'filters': filters,
            'result_count': len(result) if hasattr(result, '__len__') else 0,
            'data': result.to_dict('records') if hasattr(result, 'to_dict') else result
        }
    
    async def _handle_visualization(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle visualization requests"""
        if not self.visualization_engine:
            raise ValueError("Visualization engine not available")
        
        chart_type = parameters.get('chart_type')
        data = parameters.get('data')
        options = parameters.get('options', {})
        
        # Generate visualization based on type
        if chart_type == 'profiler_distribution':
            fig = self.visualization_engine.create_profiler_distribution_plot(
                data, 
                options.get('region_name')
            )
        elif chart_type == 'geographic_scatter':
            fig = self.visualization_engine.create_geographic_scatter_plot(
                data, 
                options.get('region_name')
            )
        elif chart_type == 'monthly_distribution':
            fig = self.visualization_engine.create_monthly_distribution_plot(
                data, 
                options.get('region_name')
            )
        else:
            raise ValueError(f"Unknown chart type: {chart_type}")
        
        return {
            'chart_type': chart_type,
            'figure': fig.to_dict() if fig else None,
            'options': options
        }
    
    async def _handle_vector_search(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle vector store search requests"""
        if not self.vector_store:
            raise ValueError("Vector store not available")
        
        query = parameters.get('query')
        k = parameters.get('k', 10)
        filters = parameters.get('filters', {})
        
        results = self.vector_store.search(query, k, filters=filters)
        
        return {
            'query': query,
            'result_count': len(results),
            'results': results
        }
    
    async def _handle_data_export(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle data export requests"""
        data = parameters.get('data')
        format_type = parameters.get('format')
        filename = parameters.get('filename')
        
        # Convert data to requested format
        if format_type == 'csv':
            if hasattr(data, 'to_csv'):
                output_path = f"{filename or 'export'}.csv"
                data.to_csv(output_path, index=False)
                return {'format': format_type, 'file_path': output_path}
            else:
                raise ValueError("Data must be a DataFrame for CSV export")
        
        elif format_type == 'json':
            output_path = f"{filename or 'export'}.json"
            with open(output_path, 'w') as f:
                json.dump(data, f, indent=2)
            return {'format': format_type, 'file_path': output_path}
        
        else:
            raise ValueError(f"Unsupported export format: {format_type}")
    
    async def _handle_pattern_analysis(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle pattern analysis requests"""
        data = parameters.get('data')
        analysis_type = parameters.get('analysis_type')
        analysis_params = parameters.get('parameters', {})
        
        # Perform analysis based on type
        if analysis_type == 'temperature_trends':
            # Analyze temperature trends
            if 'temperature' in data.columns:
                temp_data = data['temperature'].dropna()
                trend = temp_data.diff().mean() if len(temp_data) > 1 else 0
                return {
                    'analysis_type': analysis_type,
                    'trend': float(trend),
                    'mean_temperature': float(temp_data.mean()),
                    'temperature_range': [float(temp_data.min()), float(temp_data.max())]
                }
            else:
                raise ValueError("Temperature data not found")
        
        elif analysis_type == 'geographic_distribution':
            # Analyze geographic distribution
            if 'latitude' in data.columns and 'longitude' in data.columns:
                lat_range = [float(data['latitude'].min()), float(data['latitude'].max())]
                lon_range = [float(data['longitude'].min()), float(data['longitude'].max())]
                return {
                    'analysis_type': analysis_type,
                    'latitude_range': lat_range,
                    'longitude_range': lon_range,
                    'center_latitude': float(data['latitude'].mean()),
                    'center_longitude': float(data['longitude'].mean())
                }
            else:
                raise ValueError("Geographic data not found")
        
        else:
            raise ValueError(f"Unknown analysis type: {analysis_type}")
    
    def create_request(self, 
                       tool: ToolType, 
                       parameters: Dict[str, Any]) -> MCPRequest:
        """Create an MCP request"""
        return MCPRequest(
            id=self.generate_message_id(),
            timestamp=datetime.now().isoformat(),
            tool=tool,
            parameters=parameters
        )
    
    def create_notification(self, 
                            event: str, 
                            data: Dict[str, Any]) -> MCPNotification:
        """Create an MCP notification"""
        return MCPNotification(
            id=self.generate_message_id(),
            timestamp=datetime.now().isoformat(),
            event=event,
            data=data
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
    
    def __init__(self, handler: MCPHandler):
        self.handler = handler
    
    async def send_request(self, 
                           tool: ToolType, 
                           parameters: Dict[str, Any]) -> MCPResponse:
        """Send a request to the MCP handler"""
        request = self.handler.create_request(tool, parameters)
        return await self.handler.handle_request(request)
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get list of available tools"""
        return self.handler.tool_registry.list_tools()

def main():
    """Example usage of MCP integration"""
    # Initialize MCP handler
    handler = MCPHandler()
    
    # Create client
    client = MCPClient(handler)
    
    # Example: Send a database query request
    async def example_usage():
        response = await client.send_request(
            ToolType.QUERY_DATABASE,
            {
                'query_type': 'by_region',
                'filters': {'region': 'Indian Ocean'},
                'limit': 50
            }
        )
        
        print(f"Request successful: {response.success}")
        if response.success:
            print(f"Result: {response.result}")
        else:
            print(f"Error: {response.error}")
    
    # Run example
    asyncio.run(example_usage())
    
    print("🌊 MCP Integration initialized")
    print("🔧 Available tools:", len(handler.tool_registry.list_tools()))

if __name__ == "__main__":
    main()