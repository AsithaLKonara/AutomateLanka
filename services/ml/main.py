#!/usr/bin/env python3
"""
Autolanka ML Service
FastAPI service for AI-powered content generation and media processing.
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

# Pydantic models
class TranscribeRequest(BaseModel):
    s3_key: str = Field(..., description="S3 key of the audio/video file")
    language: Optional[str] = Field("en", description="Language code for transcription")
    model: Optional[str] = Field("whisper-1", description="Whisper model to use")

class TranscribeResponse(BaseModel):
    transcript: str
    language: str
    duration: float
    confidence: float
    tags: List[str]

class GenerateContentRequest(BaseModel):
    topic: str = Field(..., description="Topic for content generation")
    brand_voice: str = Field(..., description="Brand voice style")
    content_type: str = Field(..., description="Type of content to generate")
    target_audience: Optional[str] = Field(None, description="Target audience")
    length: Optional[str] = Field("medium", description="Content length")

class GenerateContentResponse(BaseModel):
    content: str
    hashtags: List[str]
    suggestions: List[str]
    metadata: Dict[str, Any]

class ProcessMediaRequest(BaseModel):
    s3_key: str = Field(..., description="S3 key of the media file")
    operation: str = Field(..., description="Operation to perform")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Operation parameters")

class ProcessMediaResponse(BaseModel):
    success: bool
    output_s3_key: Optional[str] = None
    metadata: Dict[str, Any]
    message: str

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("🚀 Starting Autolanka ML Service")
    
    # Initialize services
    try:
        # Initialize OpenAI client
        from services.ml.services.openai_service import OpenAIService
        app.state.openai_service = OpenAIService()
        logger.info("✅ OpenAI service initialized")
        
        # Initialize media processor
        from services.ml.services.media_processor import MediaProcessor
        app.state.media_processor = MediaProcessor()
        logger.info("✅ Media processor initialized")
        
        # Initialize content generator
        from services.ml.services.content_generator import ContentGenerator
        app.state.content_generator = ContentGenerator()
        logger.info("✅ Content generator initialized")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise
    
    yield
    
    logger.info("👋 Shutting down Autolanka ML Service")

# Create FastAPI app
app = FastAPI(
    title="Autolanka ML Service",
    description="AI-powered content generation and media processing",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ENVIRONMENT") == "development" else ["https://autolanka.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "autolanka-ml-service",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Transcription endpoint
@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(request: TranscribeRequest):
    """Transcribe audio/video file using OpenAI Whisper."""
    try:
        openai_service = app.state.openai_service
        
        # Transcribe the audio
        result = await openai_service.transcribe(
            s3_key=request.s3_key,
            language=request.language,
            model=request.model
        )
        
        # Extract tags from transcript
        tags = await openai_service.extract_tags(result["transcript"])
        
        return TranscribeResponse(
            transcript=result["transcript"],
            language=result["language"],
            duration=result["duration"],
            confidence=result["confidence"],
            tags=tags
        )
        
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Content generation endpoint
@app.post("/generate-content", response_model=GenerateContentResponse)
async def generate_content(request: GenerateContentRequest):
    """Generate content using AI based on topic and brand voice."""
    try:
        content_generator = app.state.content_generator
        
        result = await content_generator.generate(
            topic=request.topic,
            brand_voice=request.brand_voice,
            content_type=request.content_type,
            target_audience=request.target_audience,
            length=request.length
        )
        
        return GenerateContentResponse(
            content=result["content"],
            hashtags=result["hashtags"],
            suggestions=result["suggestions"],
            metadata=result["metadata"]
        )
        
    except Exception as e:
        logger.error(f"Content generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Media processing endpoint
@app.post("/process-media", response_model=ProcessMediaResponse)
async def process_media(request: ProcessMediaRequest, background_tasks: BackgroundTasks):
    """Process media files (video, audio, images) with various operations."""
    try:
        media_processor = app.state.media_processor
        
        result = await media_processor.process(
            s3_key=request.s3_key,
            operation=request.operation,
            parameters=request.parameters or {}
        )
        
        return ProcessMediaResponse(
            success=result["success"],
            output_s3_key=result.get("output_s3_key"),
            metadata=result["metadata"],
            message=result["message"]
        )
        
    except Exception as e:
        logger.error(f"Media processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Microclip generation endpoint
@app.post("/generate-microclips")
async def generate_microclips(
    s3_key: str,
    count: int = 3,
    min_duration: float = 15.0,
    max_duration: float = 60.0
):
    """Generate microclips from a video file."""
    try:
        media_processor = app.state.media_processor
        
        result = await media_processor.generate_microclips(
            s3_key=s3_key,
            count=count,
            min_duration=min_duration,
            max_duration=max_duration
        )
        
        return {
            "success": True,
            "microclips": result["microclips"],
            "metadata": result["metadata"]
        }
        
    except Exception as e:
        logger.error(f"Microclip generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Thumbnail generation endpoint
@app.post("/generate-thumbnails")
async def generate_thumbnails(
    s3_key: str,
    count: int = 3,
    style: str = "modern"
):
    """Generate thumbnails from a video file."""
    try:
        media_processor = app.state.media_processor
        
        result = await media_processor.generate_thumbnails(
            s3_key=s3_key,
            count=count,
            style=style
        )
        
        return {
            "success": True,
            "thumbnails": result["thumbnails"],
            "metadata": result["metadata"]
        }
        
    except Exception as e:
        logger.error(f"Thumbnail generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Sentiment analysis endpoint
@app.post("/analyze-sentiment")
async def analyze_sentiment(text: str):
    """Analyze sentiment of text content."""
    try:
        openai_service = app.state.openai_service
        
        result = await openai_service.analyze_sentiment(text)
        
        return {
            "sentiment": result["sentiment"],
            "confidence": result["confidence"],
            "suggestions": result.get("suggestions", [])
        }
        
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Generate summary endpoint
@app.post("/generate-summary")
async def generate_summary(text: str, max_length: int = 200):
    """Generate a summary of the transcript."""
    try:
        openai_service = app.state.openai_service
        
        summary = await openai_service.generate_summary(text, max_length)
        
        return {
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary)
        }
        
    except Exception as e:
        logger.error(f"Summary generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Generate hashtags endpoint
@app.post("/generate-hashtags")
async def generate_hashtags(text: str, count: int = 10):
    """Generate relevant hashtags for social media."""
    try:
        openai_service = app.state.openai_service
        
        hashtags = await openai_service.generate_hashtags(text, count)
        
        return {
            "hashtags": hashtags,
            "count": len(hashtags)
        }
        
    except Exception as e:
        logger.error(f"Hashtag generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Content generation endpoints
@app.post("/generate-content")
async def generate_content(
    content_type: str,
    source_text: str,
    brand_voice: str,
    platform: Optional[str] = None,
    custom_prompt: Optional[str] = None,
    max_length: Optional[int] = None,
    additional_context: Optional[dict] = None
):
    """Generate AI-powered content."""
    try:
        from services.content_generator import ContentGenerator, ContentType, BrandVoice, Platform
        
        content_generator = ContentGenerator()
        
        # Convert string enums
        content_type_enum = ContentType(content_type)
        brand_voice_enum = BrandVoice(brand_voice)
        platform_enum = Platform(platform) if platform else None
        
        result = await content_generator.generate_content(
            content_type=content_type_enum,
            source_text=source_text,
            brand_voice=brand_voice_enum,
            platform=platform_enum,
            custom_prompt=custom_prompt,
            max_length=max_length,
            additional_context=additional_context
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Content generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-content-variations")
async def generate_content_variations(
    content_type: str,
    source_text: str,
    brand_voice: str,
    platform: Optional[str] = None,
    variations: int = 3
):
    """Generate multiple content variations."""
    try:
        from services.content_generator import ContentGenerator, ContentType, BrandVoice, Platform
        
        content_generator = ContentGenerator()
        
        # Convert string enums
        content_type_enum = ContentType(content_type)
        brand_voice_enum = BrandVoice(brand_voice)
        platform_enum = Platform(platform) if platform else None
        
        variations_list = await content_generator.generate_multiple_variations(
            content_type=content_type_enum,
            source_text=source_text,
            brand_voice=brand_voice_enum,
            platform=platform_enum,
            variations=variations
        )
        
        return {
            "variations": variations_list,
            "count": len(variations_list)
        }
        
    except Exception as e:
        logger.error(f"Content variations generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize-content")
async def optimize_content(
    content: str,
    platform: str,
    brand_voice: str
):
    """Optimize content for a specific platform."""
    try:
        from services.content_generator import ContentGenerator, Platform, BrandVoice
        
        content_generator = ContentGenerator()
        
        # Convert string enums
        platform_enum = Platform(platform)
        brand_voice_enum = BrandVoice(brand_voice)
        
        result = await content_generator.optimize_for_platform(
            content=content,
            platform=platform_enum,
            brand_voice=brand_voice_enum
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Content optimization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-platform-hashtags")
async def generate_platform_hashtags(
    content: str,
    platform: str,
    count: int = 10
):
    """Generate platform-optimized hashtags."""
    try:
        from services.content_generator import ContentGenerator, Platform
        
        content_generator = ContentGenerator()
        
        # Convert string enum
        platform_enum = Platform(platform)
        
        hashtags = await content_generator.generate_hashtags(
            content=content,
            platform=platform_enum,
            count=count
        )
        
        return {
            "hashtags": hashtags,
            "platform": platform,
            "count": len(hashtags)
        }
        
    except Exception as e:
        logger.error(f"Platform hashtag generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Advanced Analytics endpoints
@app.post("/analyze-performance-trends")
async def analyze_performance_trends(
    performance_data: List[dict],
    platform: str,
    days: int = 30
):
    """Analyze performance trends and patterns."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.analyze_performance_trends(
            performance_data=performance_data,
            platform=platform,
            days=days
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Performance trend analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-content-performance")
async def analyze_content_performance(
    content_data: List[dict],
    performance_data: List[dict]
):
    """Analyze content performance and identify patterns."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.analyze_content_performance(
            content_data=content_data,
            performance_data=performance_data
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Content performance analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-optimal-posting-times")
async def predict_optimal_posting_times(
    performance_data: List[dict],
    platform: str
):
    """Predict optimal posting times based on historical data."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.predict_optimal_posting_times(
            performance_data=performance_data,
            platform=platform
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Optimal posting time prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-audience-engagement")
async def analyze_audience_engagement(
    engagement_data: List[dict],
    content_data: List[dict]
):
    """Analyze audience engagement patterns and preferences."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.analyze_audience_engagement(
            engagement_data=engagement_data,
            content_data=content_data
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Audience engagement analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/calculate-roi-metrics")
async def calculate_roi_metrics(
    performance_data: List[dict],
    cost_data: List[dict]
):
    """Calculate ROI and business impact metrics."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.calculate_roi_metrics(
            performance_data=performance_data,
            cost_data=cost_data
        )
        
        return result
        
    except Exception as e:
        logger.error(f"ROI calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-ai-insights")
async def generate_ai_insights(
    performance_data: List[dict],
    content_data: List[dict],
    platform: str
):
    """Generate AI-powered insights and recommendations."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.generate_ai_insights(
            performance_data=performance_data,
            content_data=content_data,
            platform=platform
        )
        
        return result
        
    except Exception as e:
        logger.error(f"AI insights generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": {
            "message": exc.detail,
            "status_code": exc.status_code
        }
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return {
        "error": {
            "message": "Internal server error",
            "status_code": 500
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level="info"
    )

"""
Autolanka ML Service
FastAPI service for AI-powered content generation and media processing.
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

# Pydantic models
class TranscribeRequest(BaseModel):
    s3_key: str = Field(..., description="S3 key of the audio/video file")
    language: Optional[str] = Field("en", description="Language code for transcription")
    model: Optional[str] = Field("whisper-1", description="Whisper model to use")

class TranscribeResponse(BaseModel):
    transcript: str
    language: str
    duration: float
    confidence: float
    tags: List[str]

class GenerateContentRequest(BaseModel):
    topic: str = Field(..., description="Topic for content generation")
    brand_voice: str = Field(..., description="Brand voice style")
    content_type: str = Field(..., description="Type of content to generate")
    target_audience: Optional[str] = Field(None, description="Target audience")
    length: Optional[str] = Field("medium", description="Content length")

class GenerateContentResponse(BaseModel):
    content: str
    hashtags: List[str]
    suggestions: List[str]
    metadata: Dict[str, Any]

class ProcessMediaRequest(BaseModel):
    s3_key: str = Field(..., description="S3 key of the media file")
    operation: str = Field(..., description="Operation to perform")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Operation parameters")

class ProcessMediaResponse(BaseModel):
    success: bool
    output_s3_key: Optional[str] = None
    metadata: Dict[str, Any]
    message: str

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("🚀 Starting Autolanka ML Service")
    
    # Initialize services
    try:
        # Initialize OpenAI client
        from services.ml.services.openai_service import OpenAIService
        app.state.openai_service = OpenAIService()
        logger.info("✅ OpenAI service initialized")
        
        # Initialize media processor
        from services.ml.services.media_processor import MediaProcessor
        app.state.media_processor = MediaProcessor()
        logger.info("✅ Media processor initialized")
        
        # Initialize content generator
        from services.ml.services.content_generator import ContentGenerator
        app.state.content_generator = ContentGenerator()
        logger.info("✅ Content generator initialized")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise
    
    yield
    
    logger.info("👋 Shutting down Autolanka ML Service")

# Create FastAPI app
app = FastAPI(
    title="Autolanka ML Service",
    description="AI-powered content generation and media processing",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ENVIRONMENT") == "development" else ["https://autolanka.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "autolanka-ml-service",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Transcription endpoint
@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(request: TranscribeRequest):
    """Transcribe audio/video file using OpenAI Whisper."""
    try:
        openai_service = app.state.openai_service
        
        # Transcribe the audio
        result = await openai_service.transcribe(
            s3_key=request.s3_key,
            language=request.language,
            model=request.model
        )
        
        # Extract tags from transcript
        tags = await openai_service.extract_tags(result["transcript"])
        
        return TranscribeResponse(
            transcript=result["transcript"],
            language=result["language"],
            duration=result["duration"],
            confidence=result["confidence"],
            tags=tags
        )
        
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Content generation endpoint
@app.post("/generate-content", response_model=GenerateContentResponse)
async def generate_content(request: GenerateContentRequest):
    """Generate content using AI based on topic and brand voice."""
    try:
        content_generator = app.state.content_generator
        
        result = await content_generator.generate(
            topic=request.topic,
            brand_voice=request.brand_voice,
            content_type=request.content_type,
            target_audience=request.target_audience,
            length=request.length
        )
        
        return GenerateContentResponse(
            content=result["content"],
            hashtags=result["hashtags"],
            suggestions=result["suggestions"],
            metadata=result["metadata"]
        )
        
    except Exception as e:
        logger.error(f"Content generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Media processing endpoint
@app.post("/process-media", response_model=ProcessMediaResponse)
async def process_media(request: ProcessMediaRequest, background_tasks: BackgroundTasks):
    """Process media files (video, audio, images) with various operations."""
    try:
        media_processor = app.state.media_processor
        
        result = await media_processor.process(
            s3_key=request.s3_key,
            operation=request.operation,
            parameters=request.parameters or {}
        )
        
        return ProcessMediaResponse(
            success=result["success"],
            output_s3_key=result.get("output_s3_key"),
            metadata=result["metadata"],
            message=result["message"]
        )
        
    except Exception as e:
        logger.error(f"Media processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Microclip generation endpoint
@app.post("/generate-microclips")
async def generate_microclips(
    s3_key: str,
    count: int = 3,
    min_duration: float = 15.0,
    max_duration: float = 60.0
):
    """Generate microclips from a video file."""
    try:
        media_processor = app.state.media_processor
        
        result = await media_processor.generate_microclips(
            s3_key=s3_key,
            count=count,
            min_duration=min_duration,
            max_duration=max_duration
        )
        
        return {
            "success": True,
            "microclips": result["microclips"],
            "metadata": result["metadata"]
        }
        
    except Exception as e:
        logger.error(f"Microclip generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Thumbnail generation endpoint
@app.post("/generate-thumbnails")
async def generate_thumbnails(
    s3_key: str,
    count: int = 3,
    style: str = "modern"
):
    """Generate thumbnails from a video file."""
    try:
        media_processor = app.state.media_processor
        
        result = await media_processor.generate_thumbnails(
            s3_key=s3_key,
            count=count,
            style=style
        )
        
        return {
            "success": True,
            "thumbnails": result["thumbnails"],
            "metadata": result["metadata"]
        }
        
    except Exception as e:
        logger.error(f"Thumbnail generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Sentiment analysis endpoint
@app.post("/analyze-sentiment")
async def analyze_sentiment(text: str):
    """Analyze sentiment of text content."""
    try:
        openai_service = app.state.openai_service
        
        result = await openai_service.analyze_sentiment(text)
        
        return {
            "sentiment": result["sentiment"],
            "confidence": result["confidence"],
            "suggestions": result.get("suggestions", [])
        }
        
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Generate summary endpoint
@app.post("/generate-summary")
async def generate_summary(text: str, max_length: int = 200):
    """Generate a summary of the transcript."""
    try:
        openai_service = app.state.openai_service
        
        summary = await openai_service.generate_summary(text, max_length)
        
        return {
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary)
        }
        
    except Exception as e:
        logger.error(f"Summary generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Generate hashtags endpoint
@app.post("/generate-hashtags")
async def generate_hashtags(text: str, count: int = 10):
    """Generate relevant hashtags for social media."""
    try:
        openai_service = app.state.openai_service
        
        hashtags = await openai_service.generate_hashtags(text, count)
        
        return {
            "hashtags": hashtags,
            "count": len(hashtags)
        }
        
    except Exception as e:
        logger.error(f"Hashtag generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Content generation endpoints
@app.post("/generate-content")
async def generate_content(
    content_type: str,
    source_text: str,
    brand_voice: str,
    platform: Optional[str] = None,
    custom_prompt: Optional[str] = None,
    max_length: Optional[int] = None,
    additional_context: Optional[dict] = None
):
    """Generate AI-powered content."""
    try:
        from services.content_generator import ContentGenerator, ContentType, BrandVoice, Platform
        
        content_generator = ContentGenerator()
        
        # Convert string enums
        content_type_enum = ContentType(content_type)
        brand_voice_enum = BrandVoice(brand_voice)
        platform_enum = Platform(platform) if platform else None
        
        result = await content_generator.generate_content(
            content_type=content_type_enum,
            source_text=source_text,
            brand_voice=brand_voice_enum,
            platform=platform_enum,
            custom_prompt=custom_prompt,
            max_length=max_length,
            additional_context=additional_context
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Content generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-content-variations")
async def generate_content_variations(
    content_type: str,
    source_text: str,
    brand_voice: str,
    platform: Optional[str] = None,
    variations: int = 3
):
    """Generate multiple content variations."""
    try:
        from services.content_generator import ContentGenerator, ContentType, BrandVoice, Platform
        
        content_generator = ContentGenerator()
        
        # Convert string enums
        content_type_enum = ContentType(content_type)
        brand_voice_enum = BrandVoice(brand_voice)
        platform_enum = Platform(platform) if platform else None
        
        variations_list = await content_generator.generate_multiple_variations(
            content_type=content_type_enum,
            source_text=source_text,
            brand_voice=brand_voice_enum,
            platform=platform_enum,
            variations=variations
        )
        
        return {
            "variations": variations_list,
            "count": len(variations_list)
        }
        
    except Exception as e:
        logger.error(f"Content variations generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize-content")
async def optimize_content(
    content: str,
    platform: str,
    brand_voice: str
):
    """Optimize content for a specific platform."""
    try:
        from services.content_generator import ContentGenerator, Platform, BrandVoice
        
        content_generator = ContentGenerator()
        
        # Convert string enums
        platform_enum = Platform(platform)
        brand_voice_enum = BrandVoice(brand_voice)
        
        result = await content_generator.optimize_for_platform(
            content=content,
            platform=platform_enum,
            brand_voice=brand_voice_enum
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Content optimization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-platform-hashtags")
async def generate_platform_hashtags(
    content: str,
    platform: str,
    count: int = 10
):
    """Generate platform-optimized hashtags."""
    try:
        from services.content_generator import ContentGenerator, Platform
        
        content_generator = ContentGenerator()
        
        # Convert string enum
        platform_enum = Platform(platform)
        
        hashtags = await content_generator.generate_hashtags(
            content=content,
            platform=platform_enum,
            count=count
        )
        
        return {
            "hashtags": hashtags,
            "platform": platform,
            "count": len(hashtags)
        }
        
    except Exception as e:
        logger.error(f"Platform hashtag generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Advanced Analytics endpoints
@app.post("/analyze-performance-trends")
async def analyze_performance_trends(
    performance_data: List[dict],
    platform: str,
    days: int = 30
):
    """Analyze performance trends and patterns."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.analyze_performance_trends(
            performance_data=performance_data,
            platform=platform,
            days=days
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Performance trend analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-content-performance")
async def analyze_content_performance(
    content_data: List[dict],
    performance_data: List[dict]
):
    """Analyze content performance and identify patterns."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.analyze_content_performance(
            content_data=content_data,
            performance_data=performance_data
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Content performance analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-optimal-posting-times")
async def predict_optimal_posting_times(
    performance_data: List[dict],
    platform: str
):
    """Predict optimal posting times based on historical data."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.predict_optimal_posting_times(
            performance_data=performance_data,
            platform=platform
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Optimal posting time prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-audience-engagement")
async def analyze_audience_engagement(
    engagement_data: List[dict],
    content_data: List[dict]
):
    """Analyze audience engagement patterns and preferences."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.analyze_audience_engagement(
            engagement_data=engagement_data,
            content_data=content_data
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Audience engagement analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/calculate-roi-metrics")
async def calculate_roi_metrics(
    performance_data: List[dict],
    cost_data: List[dict]
):
    """Calculate ROI and business impact metrics."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.calculate_roi_metrics(
            performance_data=performance_data,
            cost_data=cost_data
        )
        
        return result
        
    except Exception as e:
        logger.error(f"ROI calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-ai-insights")
async def generate_ai_insights(
    performance_data: List[dict],
    content_data: List[dict],
    platform: str
):
    """Generate AI-powered insights and recommendations."""
    try:
        from services.analytics_service import AnalyticsService
        
        analytics_service = AnalyticsService()
        
        result = await analytics_service.generate_ai_insights(
            performance_data=performance_data,
            content_data=content_data,
            platform=platform
        )
        
        return result
        
    except Exception as e:
        logger.error(f"AI insights generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": {
            "message": exc.detail,
            "status_code": exc.status_code
        }
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return {
        "error": {
            "message": "Internal server error",
            "status_code": 500
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level="info"
    )