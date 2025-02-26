from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import PyPDF2
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
from openai import OpenAI
import databutton as db
import json
import re
from datetime import datetime

router = APIRouter()

class Quiz(BaseModel):
    question: str
    options: List[str]
    correctAnswer: str

class ContentAnalysis(BaseModel):
    id: str
    type: str
    sourceUrl: Optional[str] = None
    fileName: Optional[str] = None
    summary: str
    keyPoints: List[str]
    quiz: List[Quiz]
    createdAt: str

class YouTubeAnalysisRequest(BaseModel):
    url: str

def extract_youtube_id(url: str) -> str:
    """Extract YouTube video ID from URL"""
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/)([\w-]+)',
        r'youtube\.com/embed/([\w-]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise HTTPException(status_code=400, detail="Invalid YouTube URL")

def get_youtube_transcript(video_id: str) -> str:
    """Get transcript from YouTube video"""
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        formatter = TextFormatter()
        return formatter.format_transcript(transcript)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get transcript: {str(e)}")

def analyze_content(content: str, content_type: str) -> ContentAnalysis:
    """Analyze content using OpenAI"""
    try:
        client = OpenAI(api_key=db.secrets.get("OPENAI_API_KEY"))
        
        # Generate summary
        summary_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates concise summaries of educational content."},
                {"role": "user", "content": f"Please provide a concise summary of the following content:\n\n{content}"}
            ]
        )
        summary = summary_response.choices[0].message.content
        
        # Extract key points
        keypoints_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts key points from educational content."},
                {"role": "user", "content": f"Please extract 5-7 key points from the following content. Return them as a JSON array of strings:\n\n{content}"}
            ]
        )
        keypoints_text = keypoints_response.choices[0].message.content
        # Extract JSON array from response
        keypoints = json.loads(keypoints_text) if '[' in keypoints_text else [keypoints_text]
        
        # Generate quiz
        quiz_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates multiple choice quiz questions."},
                {"role": "user", "content": f"Please create 3 multiple choice quiz questions based on the following content. Return them as a JSON array with 'question', 'options' (array), and 'correctAnswer' fields:\n\n{content}"}
            ]
        )
        quiz_text = quiz_response.choices[0].message.content
        # Extract JSON array from response
        quiz = json.loads(quiz_text) if '[' in quiz_text else []
        
        return ContentAnalysis(
            id=db.storage.binary.generate_id(),
            type=content_type,
            summary=summary,
            keyPoints=keypoints,
            quiz=quiz,
            createdAt=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def save_analysis(analysis: ContentAnalysis):
    """Save analysis results to storage"""
    try:
        # Save analysis results
        key = f"analysis_{analysis.id}"
        db.storage.json.put(key, analysis.dict())
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save analysis: {str(e)}")

@router.post("/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...)) -> ContentAnalysis:
    """Analyze PDF content"""
    try:
        # Read PDF content
        pdf_reader = PyPDF2.PdfReader(file.file)
        content = ""
        for page in pdf_reader.pages:
            content += page.extract_text()
        
        # Analyze content
        analysis = analyze_content(content, "pdf")
        analysis.fileName = file.filename
        
        # Save PDF file
        file.file.seek(0)  # Reset file pointer
        pdf_key = f"pdf_{analysis.id}"
        db.storage.binary.put(pdf_key, file.file.read())
        
        # Save and return analysis
        return save_analysis(analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF analysis failed: {str(e)}")

@router.post("/analyze-youtube")
async def analyze_youtube(request: YouTubeAnalysisRequest) -> ContentAnalysis:
    """Analyze YouTube video content"""
    try:
        # Extract video ID and get transcript
        video_id = extract_youtube_id(request.url)
        transcript = get_youtube_transcript(video_id)
        
        # Analyze content
        analysis = analyze_content(transcript, "youtube")
        analysis.sourceUrl = request.url
        
        # Save and return analysis
        return save_analysis(analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube analysis failed: {str(e)}")

@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str) -> ContentAnalysis:
    """Get analysis results by ID"""
    try:
        key = f"analysis_{analysis_id}"
        analysis_data = db.storage.json.get(key)
        return ContentAnalysis(**analysis_data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Analysis not found: {str(e)}")
