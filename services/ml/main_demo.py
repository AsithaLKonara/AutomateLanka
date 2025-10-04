"""
Autolanka ML Service - Demo Version
FastAPI service for AI-powered content generation and media processing.
This is a demo version that works without external API keys.
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for demo
class TranscriptionRequest(BaseModel):
    file_url: str
    language: Optional[str] = "en"

class TranscriptionResponse(BaseModel):
    transcript: str
    confidence: float
    duration: float
    language: str

class ContentGenerationRequest(BaseModel):
    topic: str
    platform: str
    brand_voice: Optional[str] = "professional"
    length: Optional[str] = "medium"

class ContentResponse(BaseModel):
    content: str
    hashtags: List[str]
    platform: str
    word_count: int

class HealthResponse(BaseModel):
    status: str
    message: str
    version: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("🚀 Starting Autolanka ML Service (Demo Mode)")
    
    # Demo mode - no external service initialization needed
    app.state.demo_mode = True
    logger.info("✅ Demo mode enabled - no external APIs required")
    
    yield
    
    logger.info("🛑 Shutting down Autolanka ML Service")

# Create FastAPI app
app = FastAPI(
    title="Autolanka ML Service",
    description="AI-powered content generation and media processing (Demo Version)",
    version="1.0.0-demo",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Demo data
DEMO_TRANSCRIPTS = {
    "video1": {
        "transcript": "Welcome to our demo video! This is a sample transcript for demonstration purposes. In a real implementation, this would be generated using OpenAI's Whisper API.",
        "confidence": 0.95,
        "duration": 120.5,
        "language": "en"
    },
    "audio1": {
        "transcript": "This is a sample audio transcript. The content would be extracted from uploaded audio files using AI transcription services.",
        "confidence": 0.92,
        "duration": 85.3,
        "language": "en"
    }
}

DEMO_CONTENT = {
    "instagram": {
        "content": "🚀 Exciting news! We're launching our new AI-powered automation platform! \n\n✨ Transform your content creation workflow with intelligent automation\n📊 Get real-time analytics and insights\n🎯 Optimize for maximum engagement\n\n#AI #Automation #ContentCreation #Innovation #Tech #Productivity #DigitalMarketing",
        "hashtags": ["#AI", "#Automation", "#ContentCreation", "#Innovation", "#Tech", "#Productivity", "#DigitalMarketing"],
        "word_count": 45
    },
    "twitter": {
        "content": "🚀 Just launched our AI-powered automation platform! Transform your content workflow with intelligent automation, real-time analytics, and engagement optimization. #AI #Automation #Tech",
        "hashtags": ["#AI", "#Automation", "#Tech"],
        "word_count": 28
    },
    "linkedin": {
        "content": "We're excited to announce the launch of our AI-powered automation platform! This innovative solution transforms content creation workflows through intelligent automation, providing real-time analytics and engagement optimization for maximum impact.\n\nKey features:\n• Intelligent content generation\n• Real-time performance analytics\n• Engagement optimization\n• Cross-platform publishing\n\n#Innovation #AI #Automation #ContentMarketing #DigitalTransformation",
        "hashtags": ["#Innovation", "#AI", "#Automation", "#ContentMarketing", "#DigitalTransformation"],
        "word_count": 65
    }
}

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        message="Autolanka ML Service is running in demo mode",
        version="1.0.0-demo"
    )

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(request: TranscriptionRequest):
    """Transcribe audio/video file using demo data."""
    logger.info(f"Demo transcription request for: {request.file_url}")
    
    # Return demo data based on file type
    if "video" in request.file_url.lower():
        demo_data = DEMO_TRANSCRIPTS["video1"]
    else:
        demo_data = DEMO_TRANSCRIPTS["audio1"]
    
    return TranscriptionResponse(
        transcript=demo_data["transcript"],
        confidence=demo_data["confidence"],
        duration=demo_data["duration"],
        language=request.language or demo_data["language"]
    )

@app.post("/generate-content", response_model=ContentResponse)
async def generate_content(request: ContentGenerationRequest):
    """Generate content using demo data."""
    logger.info(f"Demo content generation for: {request.topic} on {request.platform}")
    
    # Return demo content based on platform
    platform = request.platform.lower()
    if platform not in DEMO_CONTENT:
        platform = "instagram"  # Default fallback
    
    demo_data = DEMO_CONTENT[platform]
    
    return ContentResponse(
        content=demo_data["content"],
        hashtags=demo_data["hashtags"],
        platform=request.platform,
        word_count=demo_data["word_count"]
    )

@app.post("/analyze-sentiment")
async def analyze_sentiment(text: str):
    """Analyze sentiment of text content (demo)."""
    logger.info("Demo sentiment analysis")
    
    # Simple demo sentiment analysis
    positive_words = ["good", "great", "excellent", "amazing", "fantastic", "wonderful", "love", "like"]
    negative_words = ["bad", "terrible", "awful", "hate", "dislike", "poor", "worst"]
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        sentiment = "positive"
        score = 0.7 + (positive_count * 0.1)
    elif negative_count > positive_count:
        sentiment = "negative"
        score = 0.3 - (negative_count * 0.1)
    else:
        sentiment = "neutral"
        score = 0.5
    
    return {
        "sentiment": sentiment,
        "score": min(max(score, 0.0), 1.0),
        "confidence": 0.85
    }

@app.post("/generate-hashtags")
async def generate_hashtags(topic: str, platform: str = "instagram"):
    """Generate relevant hashtags for social media (demo)."""
    logger.info(f"Demo hashtag generation for: {topic}")
    
    # Demo hashtags based on topic
    hashtag_sets = {
        "ai": ["#AI", "#ArtificialIntelligence", "#MachineLearning", "#Tech", "#Innovation"],
        "automation": ["#Automation", "#Productivity", "#Efficiency", "#Tech", "#Innovation"],
        "content": ["#ContentCreation", "#ContentMarketing", "#DigitalMarketing", "#SocialMedia"],
        "business": ["#Business", "#Entrepreneur", "#Startup", "#Growth", "#Success"],
        "tech": ["#Tech", "#Technology", "#Innovation", "#Digital", "#Future"]
    }
    
    topic_lower = topic.lower()
    hashtags = []
    
    for key, tags in hashtag_sets.items():
        if key in topic_lower:
            hashtags.extend(tags)
    
    if not hashtags:
        hashtags = ["#Demo", "#Content", "#SocialMedia", "#Tech"]
    
    return {
        "hashtags": hashtags[:10],  # Limit to 10 hashtags
        "platform": platform,
        "topic": topic
    }

@app.get("/demo-data")
async def get_demo_data():
    """Get available demo data for testing."""
    return {
        "transcripts": list(DEMO_TRANSCRIPTS.keys()),
        "content_templates": list(DEMO_CONTENT.keys()),
        "demo_mode": True,
        "message": "This is a demo version of the ML service"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main_demo:app",
        host="0.0.0.0",
        port=8001,
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level="info"
    )
