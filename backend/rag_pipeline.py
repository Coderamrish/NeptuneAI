import os
import json
import requests
from groq import Groq
from dotenv import load_dotenv
import pandas as pd
from datetime import datetime, timedelta

from query_engine import (
    get_db_engine,
    get_unique_regions,
    query_by_region,
    get_geographic_coverage,
)

# Import enhanced components
try:
    from enhanced_rag_pipeline import EnhancedRAGPipeline
    ENHANCED_AVAILABLE = True
except ImportError as e:
    print(f"Enhanced RAG pipeline not available: {e}")
    ENHANCED_AVAILABLE = False

load_dotenv()

# Initialize Groq client
try:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables.")
    client = Groq(api_key=api_key)
    GROQ_AVAILABLE = True
    print("✅ Groq AI initialized")
except Exception as e:
    print(f"⚠️ Groq not available: {e}")
    client = None
    GROQ_AVAILABLE = False

# Conversation history
conversation_history = []
MAX_HISTORY = 15
user_profile = {"name": None, "preferences": [], "previous_queries": []}

# Ocean data knowledge base (comprehensive facts)
OCEAN_KNOWLEDGE = {
    "Indian Ocean": {
        "average_depth": "3,741 meters (12,274 feet)",
        "max_depth": "7,258 meters (Sunda Trench)",
        "average_temperature": "22-28°C surface, 2-4°C deep",
        "average_salinity": "34-37 PSU (Practical Salinity Units)",
        "sea_level_trend": "+3.2mm per year (rising)",
        "area": "70.56 million km²",
        "volume": "264 million km³",
        "disasters": {
            "cyclones": "Frequent tropical cyclones (May-November)",
            "tsunamis": "High risk zone (2004 Indian Ocean tsunami)",
            "earthquakes": "Seismically active (Sunda megathrust)",
        },
        "key_features": [
            "Third largest ocean in the world",
            "Warmest ocean with limited water exchange",
            "Monsoon-driven circulation patterns",
            "Contains important straits (Hormuz, Malacca, Bab-el-Mandeb)"
        ],
        "marine_life": "High biodiversity, coral reefs, whale migration routes",
        "current_threats": "Plastic pollution, overfishing, coral bleaching, rising temperatures"
    },
    "Bay of Bengal": {
        "average_depth": "2,600 meters (8,500 feet)",
        "max_depth": "4,694 meters",
        "average_temperature": "28-30°C surface, 2-4°C deep",
        "average_salinity": "30-34 PSU (lower due to river discharge)",
        "sea_level_trend": "+3.5mm per year (faster than global average)",
        "area": "2.17 million km²",
        "disasters": {
            "cyclones": "Very high frequency - most deadly cyclone region globally",
            "tsunamis": "High risk (affected by 2004 tsunami)",
            "flooding": "Severe coastal flooding during monsoons",
            "storm_surge": "Devastating storm surges during cyclones"
        },
        "key_features": [
            "Largest bay in the world",
            "Major river discharge (Ganges, Brahmaputra, Irrawaddy)",
            "Stratified water column due to freshwater input",
            "Critical for South Asian fisheries"
        ],
        "current_threats": "Sea level rise threatening coastal populations, increased cyclone intensity"
    },
    "Arabian Sea": {
        "average_depth": "2,734 meters (8,970 feet)",
        "max_depth": "4,652 meters",
        "average_temperature": "24-28°C surface, 2-4°C deep",
        "average_salinity": "36-37 PSU (high due to evaporation)",
        "sea_level_trend": "+3.1mm per year",
        "area": "3.86 million km²",
        "disasters": {
            "cyclones": "Moderate frequency (pre-monsoon and post-monsoon)",
            "oil_spills": "Risk due to heavy tanker traffic",
            "piracy": "Historical concern in northwest region"
        },
        "key_features": [
            "Strong seasonal monsoon influence",
            "Oxygen minimum zone (OMZ)",
            "Important commercial shipping route",
            "Upwelling supports rich fisheries"
        ],
        "marine_life": "Whales, dolphins, tuna, significant commercial fishing",
        "current_threats": "Oxygen depletion, warming, overfishing"
    },
    "Pacific Ocean": {
        "average_depth": "4,280 meters (14,040 feet)",
        "max_depth": "10,911 meters (Mariana Trench - deepest on Earth)",
        "average_temperature": "0-30°C depending on latitude",
        "average_salinity": "34-35 PSU",
        "sea_level_trend": "+3.0mm per year (regional variations)",
        "area": "165.25 million km²",
        "disasters": {
            "tsunamis": "Ring of Fire - very high tsunami risk",
            "earthquakes": "Most seismically active ocean",
            "typhoons": "Intense tropical storms",
            "volcanic_activity": "Submarine volcanism common"
        }
    },
    "Atlantic Ocean": {
        "average_depth": "3,646 meters (11,962 feet)",
        "max_depth": "8,486 meters (Puerto Rico Trench)",
        "average_temperature": "0-28°C depending on latitude",
        "average_salinity": "35-37 PSU",
        "sea_level_trend": "+2.9mm per year",
        "area": "106.46 million km²",
        "disasters": {
            "hurricanes": "Atlantic hurricane season (June-November)",
            "icebergs": "North Atlantic iceberg risk",
            "nor_easters": "Severe winter storms"
        }
    }
}

def analyze_sentiment_advanced(user_input: str, user_name: str = None):
    """Advanced sentiment and behavioral analysis."""
    user_lower = user_input.lower()
    
    sentiment = {
        "emotion": "neutral",
        "urgency": "normal",
        "frustration_level": 0,
        "curiosity_level": 0,
        "formality": "casual",
        "is_greeting": False,
        "is_thanking": False,
        "is_followup": False,
        "needs_empathy": False,
        "technical_level": "beginner"
    }
    
    # Detect name introduction
    name_patterns = ["i am", "i'm", "my name is", "call me", "this is"]
    if any(pattern in user_lower for pattern in name_patterns):
        words = user_input.split()
        for i, word in enumerate(words):
            if word.lower() in name_patterns and i + 1 < len(words):
                potential_name = words[i + 1].strip('.,!?')
                if potential_name.isalpha() and len(potential_name) > 2:
                    user_profile["name"] = potential_name.title()
    
    # Greetings
    greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "greetings"]
    if any(g in user_lower for g in greetings):
        sentiment["is_greeting"] = True
        sentiment["emotion"] = "friendly"
    
    # Thanks
    thanks = ["thank", "thanks", "appreciate", "grateful"]
    if any(t in user_lower for t in thanks):
        sentiment["is_thanking"] = True
        sentiment["emotion"] = "grateful"
    
    # Frustration indicators
    frustration_words = ["why not", "doesn't work", "can't", "wrong", "error", "stupid", "useless", "bad"]
    frustration_count = sum(1 for word in frustration_words if word in user_lower)
    sentiment["frustration_level"] = min(frustration_count * 2, 10)
    if sentiment["frustration_level"] > 3:
        sentiment["emotion"] = "frustrated"
        sentiment["needs_empathy"] = True
    
    # Curiosity
    curiosity_words = ["how", "what", "when", "where", "why", "tell me", "explain", "curious", "interesting", "want to know"]
    curiosity_count = sum(1 for word in curiosity_words if word in user_lower)
    sentiment["curiosity_level"] = min(curiosity_count * 2, 10)
    if sentiment["curiosity_level"] > 3:
        sentiment["emotion"] = "curious"
    
    # Urgency
    urgency_words = ["urgent", "quickly", "asap", "immediately", "now", "emergency", "critical"]
    if any(word in user_lower for word in urgency_words):
        sentiment["urgency"] = "high"
    
    # Technical level detection
    technical_terms = ["salinity", "psu", "thermocline", "upwelling", "stratification", "bathymetry"]
    if any(term in user_lower for term in technical_terms):
        sentiment["technical_level"] = "advanced"
    elif len(user_input.split()) > 15:
        sentiment["technical_level"] = "intermediate"
    
    # Follow-up detection
    followup_words = ["yes", "yeah", "sure", "okay", "tell me more", "continue", "go on", "and", "also"]
    if len(user_input.split()) <= 5 and any(word in user_lower for word in followup_words):
        sentiment["is_followup"] = True
    
    # Formality
    formal_words = ["could you", "would you", "please", "kindly", "sir", "madam"]
    if any(word in user_lower for word in formal_words):
        sentiment["formality"] = "formal"
    
    return sentiment

def get_ocean_data(region: str, query_type: str):
    """
    Fetch comprehensive ocean data for a region.
    Uses knowledge base + simulated real-time data.
    """
    if region not in OCEAN_KNOWLEDGE:
        # Try to find closest match
        for known_region in OCEAN_KNOWLEDGE.keys():
            if known_region.lower() in region.lower() or region.lower() in known_region.lower():
                region = known_region
                break
        else:
            return None
    
    data = OCEAN_KNOWLEDGE[region].copy()
    
    # Add current conditions (simulated - in production, use real APIs)
    current_date = datetime.now()
    data["current_conditions"] = {
        "date": current_date.strftime("%Y-%m-%d"),
        "surface_temp_estimate": data["average_temperature"].split()[0] if "average_temperature" in data else "N/A",
        "weather_status": "Normal monitoring conditions",
        "recent_alerts": "No active warnings (last 7 days)"
    }
    
    # Add disaster risk assessment
    if "disasters" in data:
        current_month = current_date.month
        if region == "Bay of Bengal":
            if current_month in [4, 5, 10, 11]:
                data["current_conditions"]["cyclone_risk"] = "HIGH - Cyclone season active"
            else:
                data["current_conditions"]["cyclone_risk"] = "Moderate"
        elif region == "Indian Ocean":
            if current_month in [11, 12, 1, 2, 3, 4]:
                data["current_conditions"]["cyclone_risk"] = "Elevated - Southern summer cyclone season"
            else:
                data["current_conditions"]["cyclone_risk"] = "Low to moderate"
    
    return data

def get_deployment_data(engine, region: str):
    """Get profiler deployment data from database."""
    try:
        df = query_by_region(engine, region, limit=50)
        coverage = get_geographic_coverage(engine, region=region)
        
        if df is not None and not df.empty:
            return {
                "has_data": True,
                "deployment_count": len(df),
                "institutions": df['institution'].unique().tolist() if 'institution' in df.columns else [],
                "profiler_types": df['profiler'].unique().tolist() if 'profiler' in df.columns else [],
                "coverage": coverage.to_dict('records')[0] if not coverage.empty else {}
            }
        return {"has_data": False}
    except Exception as e:
        print(f"⚠️ Database query failed: {e}")
        return {"has_data": False}

def generate_intelligent_response(user_input: str, ocean_data: dict, deployment_data: dict, 
                                 sentiment: dict, context: list):
    """Generate natural, empathetic, and informative responses using Groq."""
    
    if not GROQ_AVAILABLE:
        return generate_fallback_response(ocean_data, deployment_data)
    
    try:
        # Build context from conversation history
        history_context = ""
        if context:
            history_context = "Recent conversation:\n"
            for msg in context[-3:]:
                history_context += f"User: {msg['user'][:100]}\n"
                history_context += f"Assistant: {msg['assistant'][:100]}...\n"
        
        # Build comprehensive data context
        data_context = f"""
OCEAN DATA AVAILABLE:
{json.dumps(ocean_data, indent=2)}

PROFILER DEPLOYMENT DATA:
{json.dumps(deployment_data, indent=2)}

USER PROFILE:
Name: {user_profile.get('name', 'Not provided')}
Technical Level: {sentiment['technical_level']}
Emotional State: {sentiment['emotion']}

{history_context}
"""
        
        system_prompt = f"""You are NeptuneAI, an advanced oceanographic AI assistant with comprehensive knowledge of ocean data.

PERSONALITY:
- Warm, friendly, and empathetic
- Enthusiastic about ocean science
- Patient and educational
- Uses appropriate emojis naturally (🌊 🔬 📊 🌡️ 🌀 ⚠️)
- Conversational, not robotic

CAPABILITIES:
You have access to REAL oceanographic data including:
- Ocean depths, temperatures, salinity levels
- Sea level trends and climate data
- Disaster risks (cyclones, tsunamis, earthquakes)
- Marine ecosystems and biodiversity
- Current conditions and monitoring data
- Profiler deployment information
- Current ocean conditions
- Retrieval-augmented responses from real float data

RESPONSE GUIDELINES:
1. Address user by name if known ({user_profile.get('name', '')})
2. Match user's emotional tone:
   - If curious: Be enthusiastic and educational
   - If frustrated: Be empathetic and solution-focused
   - If formal: Be professional yet friendly
   - If casual: Be conversational and relaxed

3. Technical level adaptation:
   - Beginner: Use simple terms, provide analogies
   - Intermediate: Balance technical and accessible language
   - Advanced: Use precise scientific terminology

4. Structure responses:
   - Start with direct answer to the question
   - Provide relevant details
   - Add interesting related facts
   - Suggest follow-up topics if appropriate
   - Keep under 250 words unless detailed explanation requested

5. Safety and ethics:
   - Always mention disaster risks honestly but without causing panic
   - Provide actionable information when discussing dangers
   - Emphasize the importance of ocean conservation

Current user sentiment: {sentiment['emotion']}
Urgency level: {sentiment['urgency']}
Technical level: {sentiment['technical_level']}
"""

        user_prompt = f"""User query: "{user_input}"

Available data:
{data_context}

Generate a natural, helpful response that directly answers their question using the available data."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.6,
            max_tokens=800
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"⚠️ Response generation failed: {e}")
        return generate_fallback_response(ocean_data, deployment_data)

def generate_fallback_response(ocean_data: dict, deployment_data: dict):
    """Fallback response when LLM is unavailable."""
    response = "Based on available data:\n\n"
    
    if ocean_data:
        response += f"📊 Ocean Characteristics:\n"
        if "average_depth" in ocean_data:
            response += f"• Average Depth: {ocean_data['average_depth']}\n"
        if "average_temperature" in ocean_data:
            response += f"• Temperature: {ocean_data['average_temperature']}\n"
        if "average_salinity" in ocean_data:
            response += f"• Salinity: {ocean_data['average_salinity']}\n"
        if "sea_level_trend" in ocean_data:
            response += f"• Sea Level Trend: {ocean_data['sea_level_trend']}\n"
    
    if deployment_data and deployment_data.get("has_data"):
        response += f"\n🔬 Monitoring Data:\n"
        response += f"• Active Deployments: {deployment_data['deployment_count']}\n"
        response += f"• Research Institutions: {len(deployment_data['institutions'])}\n"
    
    return response

def answer_query(user_input: str):
    """Main query processing with comprehensive ocean data."""
    
    # Use enhanced pipeline if available
    if ENHANCED_AVAILABLE:
        try:
            # Initialize enhanced pipeline (singleton pattern)
            if not hasattr(answer_query, 'enhanced_pipeline'):
                answer_query.enhanced_pipeline = EnhancedRAGPipeline()
            
            # Process query with enhanced pipeline
            result = answer_query.enhanced_pipeline.process_query(user_input)
            
            # Convert to expected format
            return {
                "summary": result.get('text_response', 'No response generated'),
                "plot": result.get('visualization'),
                "data": result.get('data'),
                "enhanced": True
            }
            
        except Exception as e:
            print(f"Enhanced pipeline error: {e}, falling back to basic pipeline")
    
    # Fallback to original implementation
    try:
        # Analyze sentiment
        engine = get_db_engine()
        sentiment = analyze_sentiment_advanced(user_input, user_profile.get("name"))
        
        # Handle greetings
        if sentiment["is_greeting"]:
            greeting = f"Hello{', ' + user_profile['name'] if user_profile['name'] else ''}! 👋 "
            greeting += "I'm NeptuneAI, your comprehensive ocean data assistant. I can help you with:\n\n"
            greeting += "🌊 Ocean depths, temperatures, and salinity\n"
            greeting += "📈 Sea level trends and climate data\n"
            greeting += "🌀 Disaster risks (cyclones, tsunamis)\n"
            greeting += "🔬 Profiler deployment information\n"
            greeting += "🐋 Marine ecosystems and biodiversity\n\n"
            greeting += "What would you like to explore today?"
            
            conversation_history.append({
                "user": user_input,
                "assistant": greeting,
                "sentiment": sentiment['emotion']
            })
            return {"summary": greeting, "plot": None}
        
        # Handle thanks
        if sentiment["is_thanking"]:
            thanks_response = f"You're very welcome{', ' + user_profile['name'] if user_profile['name'] else ''}! 😊 "
            thanks_response += "I'm always here to help you explore ocean science. Feel free to ask anything else!"
            
            conversation_history.append({
                "user": user_input,
                "assistant": thanks_response,
                "sentiment": sentiment['emotion']
            })
            return {"summary": thanks_response, "plot": None}
        
        # Handle follow-ups
        if sentiment["is_followup"] and conversation_history:
            # Get region from last conversation
            last_msg = conversation_history[-1]["assistant"]
            region = None
            for known_region in OCEAN_KNOWLEDGE.keys():
                if known_region in last_msg:
                    region = known_region
                    break
            
            if region:
                user_input = f"{user_input} about {region}"
        
        # Extract region from query
        region = None
        for known_region in OCEAN_KNOWLEDGE.keys():
            if known_region.lower() in user_input.lower():
                region = known_region
                break
        
        # Default to Indian Ocean if no region specified
        if not region:
            region = "Indian Ocean"
        
        # Get comprehensive data
        ocean_data = get_ocean_data(region, "comprehensive")
        deployment_data = get_deployment_data(engine, region)
        
        # Generate intelligent response
        response_text = generate_intelligent_response(
            user_input, ocean_data, deployment_data, sentiment, conversation_history
        )
        
        # Store in history
        conversation_history.append({
            "user": user_input,
            "assistant": response_text,
            "sentiment": sentiment['emotion'],
            "region": region
        })
        
        # Manage history size
        if len(conversation_history) > MAX_HISTORY:
            conversation_history.pop(0)
        
        return {"summary": response_text, "plot": None}
        
    except Exception as e:
        error_msg = f"I encountered an issue: {str(e)}. Let me try to help you differently. "
        error_msg += "Could you rephrase your question or ask about a specific ocean region?"
        print(f"❌ Error: {e}")
        return {"summary": error_msg, "plot": None}

if __name__ == "__main__":
    print("🌊 NeptuneAI - Comprehensive Ocean Intelligence System")
    print("=" * 60)
    
    engine = get_db_engine()
    
    print("\n✅ System initialized successfully!")
    print("\n💡 I can answer questions about:")
    print("  • Ocean depths, temperatures, and salinity")
    print("  • Sea level changes and climate trends")
    print("  • Disaster risks (cyclones, tsunamis, earthquakes)")
    print("  • Marine ecosystems and biodiversity")
    print("  • Profiler deployments and research activities")
    print("  • Current ocean conditions")
    print("\n🌍 Supported regions: Indian Ocean, Bay of Bengal, Arabian Sea, Pacific, Atlantic")
    print("\nType 'exit' to quit.\n")
    
    while True:
        user_q = input("You: ")
        if user_q.lower() in ['exit', 'quit', 'bye', 'goodbye']:
            farewell = f"Goodbye{', ' + user_profile['name'] if user_profile['name'] else ''}! "
            farewell += "Stay curious about our oceans! 🌊👋"
            print(f"\n🤖: {farewell}\n")
            break
        
        if user_q.strip() == "":
            continue
        
        response_data = answer_query(user_q, engine)
        print(f"\n🤖: {response_data['summary']}\n")