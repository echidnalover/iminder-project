from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime
import databutton as db
from supabase import create_client, Client
import markdown
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
import json
import uuid

router = APIRouter()

# Initialize Supabase client
supabase: Client = create_client(
    db.secrets.get("SUPABASE_URL"),
    db.secrets.get("SUPABASE_ANON_KEY")
)

class ShareRequest(BaseModel):
    content_type: Literal['plan', 'study_material']
    content_id: str
    access_type: Literal['public', 'private'] = 'private'
    expiration_date: Optional[datetime] = None

class ShareResponse(BaseModel):
    share_id: str
    share_link: str
    access_type: str
    expiration_date: Optional[datetime]

class ExportRequest(BaseModel):
    content_type: Literal['plan', 'study_material']
    content_id: str
    format: Literal['pdf', 'markdown', 'html']

class UpdateShareRequest(BaseModel):
    access_type: Optional[Literal['public', 'private']] = None
    expiration_date: Optional[datetime] = None

def generate_share_link() -> str:
    """Generate a unique share link"""
    return str(uuid.uuid4())

def get_content_by_id(content_type: str, content_id: str) -> dict:
    """Retrieve content from appropriate table based on type"""
    table_name = 'study_materials' if content_type == 'study_material' else 'plans'
    response = supabase.table(table_name).select("*").eq('id', content_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return response.data[0]

def convert_to_markdown(content: dict) -> str:
    """Convert content to markdown format"""
    if isinstance(content, str):
        content = json.loads(content)
    
    md = f"# {content.get('title', 'Untitled')}\n\n"
    
    if content.get('description'):
        md += f"{content['description']}\n\n"
    
    # Add more content based on the structure
    if content.get('sections'):
        for section in content['sections']:
            md += f"## {section.get('title', 'Section')}\n"
            md += f"{section.get('content', '')}\n\n"
    
    return md

def convert_to_html(content: dict) -> str:
    """Convert content to HTML format"""
    md_content = convert_to_markdown(content)
    return markdown.markdown(md_content)

def create_pdf(content: dict) -> bytes:
    """Create PDF from content"""
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Add content to PDF
    y = 750  # Starting y position
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y, content.get('title', 'Untitled'))
    
    y -= 30
    p.setFont("Helvetica", 12)
    if content.get('description'):
        p.drawString(50, y, content['description'])
        y -= 20
    
    if content.get('sections'):
        for section in content['sections']:
            y -= 20
            p.setFont("Helvetica-Bold", 14)
            p.drawString(50, y, section.get('title', 'Section'))
            y -= 15
            p.setFont("Helvetica", 12)
            # Split content into lines
            text = section.get('content', '')
            for line in text.split('\n'):
                if y < 50:  # Start new page if near bottom
                    p.showPage()
                    y = 750
                p.drawString(50, y, line)
                y -= 15
    
    p.save()
    return buffer.getvalue()

@router.post("/share", response_model=ShareResponse)
async def create_share(request: ShareRequest) -> ShareResponse:
    """Create a new share link for content"""
    # Verify content exists
    content = get_content_by_id(request.content_type, request.content_id)
    
    # Generate unique share link
    share_link = generate_share_link()
    
    # Store in Supabase
    share_data = {
        "content_type": request.content_type,
        "content_id": request.content_id,
        "share_link": share_link,
        "access_type": request.access_type,
        "expiration_date": request.expiration_date.isoformat() if request.expiration_date else None
    }
    
    response = supabase.table("shared_content").insert(share_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create share link")
    
    created_share = response.data[0]
    
    return ShareResponse(
        share_id=created_share["id"],
        share_link=share_link,
        access_type=created_share["access_type"],
        expiration_date=created_share["expiration_date"]
    )

@router.get("/share/{share_link}")
async def get_shared_content(share_link: str):
    """Get shared content by share link"""
    # Get share details
    response = supabase.table("shared_content").select("*").eq("share_link", share_link).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Share link not found")
    
    share = response.data[0]
    
    # Check expiration
    if share["expiration_date"] and datetime.fromisoformat(share["expiration_date"]) < datetime.now():
        raise HTTPException(status_code=410, detail="Share link has expired")
    
    # Get actual content
    content = get_content_by_id(share["content_type"], share["content_id"])
    
    return {
        "content": content,
        "share_info": share
    }

@router.put("/share/{share_id}")
async def update_share_settings(share_id: str, request: UpdateShareRequest):
    """Update sharing settings"""
    update_data = {}
    if request.access_type is not None:
        update_data["access_type"] = request.access_type
    if request.expiration_date is not None:
        update_data["expiration_date"] = request.expiration_date.isoformat()
    
    response = supabase.table("shared_content").update(update_data).eq("id", share_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Share not found")
    
    return response.data[0]

@router.delete("/share/{share_id}")
async def delete_share(share_id: str):
    """Delete a share link"""
    response = supabase.table("shared_content").delete().eq("id", share_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Share not found")
    
    return {"message": "Share deleted successfully"}

@router.post("/export")
async def export_content(request: ExportRequest, background_tasks: BackgroundTasks):
    """Export content in requested format"""
    content = get_content_by_id(request.content_type, request.content_id)
    
    if request.format == "pdf":
        pdf_bytes = create_pdf(content)
        filename = f"{content.get('title', 'export')}.pdf"
        
        # Store in storage
        storage_key = f"exports/{filename}"
        db.storage.binary.put(storage_key, pdf_bytes)
        
        return {"download_url": f"/api/download/{storage_key}"}
    
    elif request.format == "markdown":
        md_content = convert_to_markdown(content)
        return {"content": md_content, "format": "markdown"}
    
    elif request.format == "html":
        html_content = convert_to_html(content)
        return {"content": html_content, "format": "html"}
    
    raise HTTPException(status_code=400, detail="Unsupported format")
