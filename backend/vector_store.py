"""
Vector Store for ARGO Ocean Data
Implements FAISS-based vector storage for metadata and summaries
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple
import logging
from pathlib import Path
from datetime import datetime
import faiss
from sentence_transformers import SentenceTransformer
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ARGOVectorStore:
    """
    Vector store for ARGO ocean data using FAISS
    Stores metadata and summaries for semantic search
    """
    
    def __init__(self, 
                 index_path: str = "vector_index",
                 model_name: str = "all-MiniLM-L6-v2",
                 dimension: int = 384):
        """
        Initialize the vector store
        
        Args:
            index_path: Path to store the FAISS index
            model_name: Sentence transformer model name
            dimension: Embedding dimension
        """
        self.index_path = Path(index_path)
        self.index_path.mkdir(exist_ok=True)
        
        self.dimension = dimension
        self.model_name = model_name
        
        # Initialize sentence transformer
        try:
            self.encoder = SentenceTransformer(model_name)
            logger.info(f"Loaded sentence transformer: {model_name}")
        except Exception as e:
            logger.error(f"Failed to load sentence transformer: {e}")
            raise
        
        # Initialize FAISS index
        self.index = faiss.IndexFlatIP(dimension) # Inner product for cosine similarity
        self.metadata = []
        self.id_to_metadata = {}
        
        # Load existing index if available
        self._load_index()
    
    def _load_index(self):
        """Load existing FAISS index and metadata"""
        index_file = self.index_path / "faiss_index.bin"
        metadata_file = self.index_path / "metadata.json"
        
        if index_file.exists() and metadata_file.exists():
            try:
                # Load FAISS index
                self.index = faiss.read_index(str(index_file))
                logger.info(f"Loaded existing FAISS index with {self.index.ntotal} vectors")
                
                # Load metadata
                with open(metadata_file, 'r') as f:
                    self.metadata = json.load(f)
                
                # Rebuild ID mapping
                for i, meta in enumerate(self.metadata):
                    if 'id' in meta:
                        self.id_to_metadata[meta['id']] = i
                
                logger.info(f"Loaded {len(self.metadata)} metadata entries")
                
            except Exception as e:
                logger.error(f"Failed to load existing index: {e}")
                self.index = faiss.IndexFlatIP(self.dimension)
                self.metadata = []
                self.id_to_metadata = {}
    
    def _save_index(self):
        """Save FAISS index and metadata"""
        try:
            # Save FAISS index
            index_file = self.index_path / "faiss_index.bin"
            faiss.write_index(self.index, str(index_file))
            
            # Save metadata
            metadata_file = self.index_path / "metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(self.metadata, f, indent=2)
            
            logger.info(f"Saved index with {self.index.ntotal} vectors")
            
        except Exception as e:
            logger.error(f"Failed to save index: {e}")
    
    def _generate_id(self, content: str) -> str:
        """Generate unique ID for content"""
        return hashlib.md5(content.encode()).hexdigest()
    
    def add_document(self, 
                     content: str, 
                     metadata: Dict,
                     doc_type: str = "profile") -> str:
        """
        Add a document to the vector store
        
        Args:
            content: Text content to embed
            metadata: Associated metadata
            doc_type: Type of document (profile, summary, etc.)
            
        Returns:
            Document ID
        """
        try:
            # Generate embedding
            embedding = self.encoder.encode([content])[0]
            
            # Normalize for cosine similarity
            embedding = embedding / np.linalg.norm(embedding)
            
            # Generate document ID
            doc_id = self._generate_id(content)
            
            # Check if document already exists
            if doc_id in self.id_to_metadata:
                logger.info(f"Document {doc_id} already exists, updating...")
                idx = self.id_to_metadata[doc_id]
                self.metadata[idx] = {
                    'id': doc_id,
                    'content': content,
                    'metadata': metadata,
                    'doc_type': doc_type,
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                }
                # Update vector
                self.index.remove_ids(np.array([idx]))
                self.index.add_with_ids(np.array([embedding]), np.array([idx]))
            else:
                # Add new document
                doc_meta = {
                    'id': doc_id,
                    'content': content,
                    'metadata': metadata,
                    'doc_type': doc_type,
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                }
                
                self.metadata.append(doc_meta)
                self.id_to_metadata[doc_id] = len(self.metadata) - 1
                
                # Add to FAISS index
                self.index.add(np.array([embedding]))
            
            logger.info(f"Added document {doc_id} to vector store")
            return doc_id
            
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
            return None
    
    def add_profile_data(self, df: pd.DataFrame) -> List[str]:
        """
        Add ARGO profile data to vector store
        
        Args:
            df: DataFrame containing profile data
            
        Returns:
            List of document IDs
        """
        doc_ids = []       
        for idx, row in df.iterrows():
            # Create content for embedding
            content_parts = []
                       # Basic location info
            if 'latitude' in row and 'longitude' in row:
                content_parts.append(f"Location: {row['latitude']:.2f}°N, {row['longitude']:.2f}°E")            
            # Date info
            if 'date' in row and pd.notna(row['date']):
                content_parts.append(f"Date: {row['date']}")           
            # Platform info
            if 'platform_number' in row and pd.notna(row['platform_number']):
                content_parts.append(f"Platform: {row['platform_number']}")           
            # Oceanographic data
            ocean_vars = ['temperature', 'salinity', 'pressure']
            for var in ocean_vars:
                if var in row and pd.notna(row[var]):
                    content_parts.append(f"{var.title()}: {row[var]:.2f}")           
            # Quality info
            qc_vars = [col for col in row.index if col.endswith('_qc')]
            qc_info = []
            for qc_var in qc_vars:
                if pd.notna(row[qc_var]):
                    qc_info.append(f"{qc_var}: {row[qc_var]}")            
            if qc_info:
                content_parts.append(f"Quality: {', '.join(qc_info)}")           
            content = " | ".join(content_parts)            
            # Create metadata
            metadata = {
                'profile_index': idx,
                'latitude': float(row.get('latitude', 0)) if pd.notna(row.get('latitude')) else None,
                'longitude': float(row.get('longitude', 0)) if pd.notna(row.get('longitude')) else None,
                'date': str(row.get('date', '')) if pd.notna(row.get('date')) else None,
                'platform_number': str(row.get('platform_number', '')) if pd.notna(row.get('platform_number')) else None,
                'cycle_number': int(row.get('cycle_number', 0)) if pd.notna(row.get('cycle_number')) else None
            }
            
            # Add oceanographic measurements
            for var in ocean_vars:
                if var in row and pd.notna(row[var]):
                    metadata[var] = float(row[var])
            
            doc_id = self.add_document(content, metadata, "profile")
            if doc_id:
                doc_ids.append(doc_id)
        
        logger.info(f"Added {len(doc_ids)} profiles to vector store")
        return doc_ids
    
    def add_summary(self, 
                    region: str, 
                    summary_text: str, 
                    additional_metadata: Dict = None) -> str:
        """
        Add a regional summary to the vector store
        
        Args:
            region: Ocean region name
            summary_text: Summary content
            additional_metadata: Additional metadata
            
        Returns:
            Document ID
        """
        metadata = {
            'region': region,
            'type': 'summary'
        }
        
        if additional_metadata:
            metadata.update(additional_metadata)
        
        content = f"Region: {region} | Summary: {summary_text}"
        
        return self.add_document(content, metadata, "summary")
    
    def search(self, 
               query: str, 
               k: int = 10, 
               doc_types: List[str] = None,
               filters: Dict = None) -> List[Dict]:
        """
        Search the vector store
        
        Args:
            query: Search query
            k: Number of results to return
            doc_types: Filter by document types
            filters: Additional metadata filters
            
        Returns:
            List of search results with metadata
        """
        try:
            # Generate query embedding
            query_embedding = self.encoder.encode([query])[0]
            query_embedding = query_embedding / np.linalg.norm(query_embedding)          
            # Search FAISS index
            scores, indices = self.index.search(np.array([query_embedding]), k)           
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx < len(self.metadata):
                    doc = self.metadata[idx].copy()
                    doc['similarity_score'] = float(score)                   
                    # Apply filters
                    if self._matches_filters(doc, doc_types, filters):
                        results.append(doc)           
            logger.info(f"Found {len(results)} results for query: {query[:50]}...")
            return results           
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []    
    def _matches_filters(self, doc: Dict, doc_types: List[str], filters: Dict) -> bool:
        """Check if document matches the given filters"""
        # Check document type filter
        if doc_types and doc.get('doc_type') not in doc_types:
            return False        
        # Check metadata filters
        if filters:
            for key, value in filters.items():
                if key in doc.get('metadata', {}):
                    if isinstance(value, list):
                        if doc['metadata'][key] not in value:
                            return False
                    else:
                        if doc['metadata'][key] != value:
                            return False
                else:
                    return False        
        return True    
    def get_document(self, doc_id: str) -> Optional[Dict]:
        """Get a specific document by ID"""
        if doc_id in self.id_to_metadata:
            idx = self.id_to_metadata[doc_id]
            return self.metadata[idx]
        return None
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document by ID"""
        if doc_id not in self.id_to_metadata:
            return False
        
        try:
            idx = self.id_to_metadata[doc_id]           
            # Remove from FAISS index
            self.index.remove_ids(np.array([idx]))            
            # Remove from metadata
            del self.metadata[idx]
            del self.id_to_metadata[doc_id]            
            # Rebuild ID mapping
            self.id_to_metadata = {doc['id']: i for i, doc in enumerate(self.metadata)}            
            logger.info(f"Deleted document {doc_id}")
            return True           
        except Exception as e:
            logger.error(f"Failed to delete document {doc_id}: {e}")
            return False   
    def get_stats(self) -> Dict:
        """Get vector store statistics"""
        return {
            'total_documents': len(self.metadata),
            'index_size': self.index.ntotal,
            'dimension': self.dimension,
            'model_name': self.model_name,
            'doc_types': list(set(doc.get('doc_type', 'unknown') for doc in self.metadata)),
            'last_updated': datetime.now().isoformat()
        }   
    def clear(self):
        """Clear all data from the vector store"""
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata = []
        self.id_to_metadata = {}
        logger.info("Cleared vector store")   
    def export_metadata(self, output_file: str = None) -> str:
        """Export metadata to JSON file"""
        if output_file is None:
            output_file = self.index_path / f"metadata_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"       
        try:
            with open(output_file, 'w') as f:
                json.dump(self.metadata, f, indent=2)
            
            logger.info(f"Exported metadata to {output_file}")
            return str(output_file)          
        except Exception as e:
            logger.error(f"Failed to export metadata: {e}")
            return None
def main():
    """Example usage of the vector store"""
    # Initialize vector store
    vector_store = ARGOVectorStore()  
    # Example: Add some sample data
    sample_data = {
        'latitude': [10.5, 20.3, 30.1],
        'longitude': [60.2, 70.8, 80.5],
        'temperature': [25.5, 22.1, 18.7],
        'salinity': [35.2, 34.8, 35.1],
        'date': ['2023-01-15', '2023-02-20', '2023-03-10']
    }  
    df = pd.DataFrame(sample_data)
    doc_ids = vector_store.add_profile_data(df)  
    # Example: Search
    results = vector_store.search("temperature in Indian Ocean", k=5)
    print(f"Found {len(results)} results")  
    # Get statistics
    stats = vector_store.get_stats()
    print(f"Vector store stats: {stats}") 
    # Save index
    vector_store._save_index() 
    print(" ARGO Vector Store initialized")
    print(" Index path:", vector_store.index_path)
    print(" Ready for semantic search")

if __name__ == "__main__":
    main()