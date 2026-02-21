import os
import json
import base64
import requests
import psycopg2
from io import BytesIO
from PIL import Image, ImageOps
from dotenv import load_dotenv

# Load environment variables from the root of the Next.js project
load_dotenv(".env.local")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"

CATEGORIES = ["Anime", "Music"]
TOPICS_PER_CATEGORY = 2

def fetch_trending_topics():
    print(f"🔍 Fetching {TOPICS_PER_CATEGORY} trends for categories: {', '.join(CATEGORIES)}...")
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = (
        f"Find exactly {TOPICS_PER_CATEGORY} trending topics from the previous month for each of the following categories: {', '.join(CATEGORIES)}. "
        "Return ONLY a valid JSON object where keys are the category names, and values are arrays of exactly 2 strings (the trending topics). "
        "Example format: {\"Anime\": [\"Topic 1\", \"Topic 2\"], \"Music\": [\"Topic 1\", \"Topic 2\"]}"
    )

    payload = {
        "model": "perplexity/sonar:online",
        "messages": [
            {
                "role": "system", 
                "content": "You are a highly accurate web-searching AI. You must return strictly valid JSON."
            },
            {
                "role": "user", 
                "content": prompt
            }
        ]
    }
    
    response = requests.post(OPENROUTER_CHAT_URL, headers=headers, json=payload)
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    
    if content.startswith("```json"):
        content = content.replace("```json\n", "").replace("\n```", "")
        
    return json.loads(content)

def generate_and_save_image(topic, category):
    print(f"🎨 Generating image for {category} - {topic}...")
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "google/gemini-2.5-flash-image",
        "messages": [
            {
                "role": "user",
                # Instructed the model to generate a 16:9 image to get as close to 780x439 as natively possible
                "content": f"High quality, cinematic, minimalist digital illustration representing the {category} topic: {topic}. No text, no words. Aspect ratio 16:9."
            }
        ],
        "modalities": ["image", "text"]
    }
    
    try:
        response = requests.post(OPENROUTER_CHAT_URL, headers=headers, json=payload)
        response.raise_for_status()
        res_json = response.json()
        
        message = res_json["choices"][0]["message"]
        images_data = message.get("images", [])
        
        if not images_data:
            print(f"❌ No images found in response for {topic}.")
            return None
            
        img_obj = images_data[0]
        url_obj = img_obj.get("image_url") or img_obj.get("imageUrl") 
        image_url = url_obj.get("url")

        filename = "".join(x for x in topic if x.isalnum() or x in " -_").replace(" ", "_").lower() + ".jpg"
        filepath = os.path.join("public", filename)
        
        if image_url.startswith("data:image"):
            header, encoded = image_url.split(",", 1)
            img_data = base64.b64decode(encoded)
        else:
            img_data = requests.get(image_url).content
            
        # --- LOCAL RESIZING LOGIC ---
        # Read the image data directly into Pillow
        img = Image.open(BytesIO(img_data))
        # Center-crop and resize to exactly 780x439
        img = ImageOps.fit(img, (780, 439), Image.Resampling.LANCZOS)
        
        # Ensure the color mode is correct for JPEG saving
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        # Save directly to the Next.js public folder
        img.save(filepath, "JPEG", quality=95)
            
        return f"/{filename}"
        
    except Exception as e:
        print(f"❌ Failed to generate or save image for {topic}: {str(e)}")
        return None

def update_database():
    try:
        topics_data = fetch_trending_topics()
    except Exception as e:
        print(f"❌ Failed to fetch trends: {e}")
        return

    print("✅ Trends fetched successfully. Connecting to Neon DB...")
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    for category in CATEGORIES:
        topics = topics_data.get(category, [])
        
        for topic in topics:
            image_path = generate_and_save_image(topic, category)
            
            if image_path:
                try:
                    # ⚠️ IMPORTANT: Change 'title' below to match the actual column name in your database
                    cursor.execute("""
                        INSERT INTO trends (title, category, image_url) 
                        VALUES (%s, %s, %s)
                        ON CONFLICT (title) 
                        DO UPDATE SET 
                            image_url = EXCLUDED.image_url,
                            category = EXCLUDED.category;
                    """, (topic, category, image_path))
                    print(f"💾 Saved {topic} to DB successfully.")
                except Exception as e:
                    print(f"❌ Failed to insert {topic} into DB: {e}")
                    conn.rollback()
                    continue
                
    conn.commit()
    cursor.close()
    conn.close()
    print("🎉 All database updates completed successfully.")

if __name__ == "__main__":
    os.makedirs("public", exist_ok=True)
    update_database()