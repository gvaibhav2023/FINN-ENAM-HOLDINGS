import os
import hashlib
import json
from api.core.db import get_db_connection

FLASH_MODEL = os.getenv("GEMINI_FLASH_MODEL", "gemini-2.5-flash")
PRO_MODEL = os.getenv("GEMINI_PRO_MODEL", "gemini-2.5-pro")
EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL", "gemini-embedding-001")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_cache_key(model: str, prompt: str) -> str:
    return hashlib.sha256(f"{model}:{prompt}".encode("utf-8")).hexdigest()

def get_from_cache(key: str):
    conn = get_db_connection()
    if not conn:
        return None
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT response FROM llm_cache WHERE key = %s", (key,))
            row = cur.fetchone()
            if row:
                return row["response"]
    except Exception:
        pass
    finally:
        conn.close()
    return None

def set_in_cache(key: str, model: str, response: dict, tokens_in: int = 0, tokens_out: int = 0):
    conn = get_db_connection()
    if not conn:
        return
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO llm_cache (key, model, response, tokens_in, tokens_out)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (key) DO NOTHING
                """,
                (key, model, json.dumps(response), tokens_in, tokens_out)
            )
            conn.commit()
    except Exception:
        pass
    finally:
        conn.close()

def call_gemini(prompt: str, model_type: str = "flash", json_mode: bool = True) -> dict:
    """
    Execute Gemini API call with smart routing (Flash vs Pro) and SHA-256 caching.
    Gracefully handles missing keys or offline setups.
    """
    model_name = PRO_MODEL if model_type == "pro" else FLASH_MODEL
    cache_key = get_cache_key(model_name, prompt)
    
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    if not GEMINI_API_KEY:
        # Fallback when key is not yet set in environment
        return {"error": "GEMINI_API_KEY not configured"}

    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        text = response.text
        if json_mode:
            try:
                # Clean code blocks if present
                clean_text = text.strip()
                if clean_text.startswith("```json"):
                    clean_text = clean_text[7:]
                if clean_text.startswith("```"):
                    clean_text = clean_text[3:]
                if clean_text.endswith("```"):
                    clean_text = clean_text[:-3]
                parsed = json.loads(clean_text)
                set_in_cache(cache_key, model_name, parsed)
                return parsed
            except Exception:
                return {"text": text}
        return {"text": text}
    except Exception as e:
        return {"error": str(e)}

