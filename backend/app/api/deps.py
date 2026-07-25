import os
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")

# Create SQLAlchemy Engine and Session
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Provides a transactional database session for API endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Bearer Token security scheme for OpenAPI docs
security = HTTPBearer()

# Cache for JWKS keys so we don't fetch from Supabase on every single API request
JWKS_CACHE = None

def get_jwks():
    """Fetches and caches the JSON Web Key Set (JWKS) from Supabase."""
    global JWKS_CACHE
    if JWKS_CACHE is None:
        if not SUPABASE_URL:
            raise HTTPException(
                status_code=500, 
                detail="SUPABASE_URL is missing from environment variables."
            )
        jwks_url = f"{SUPABASE_URL}/auth/v1/jwks"
        try:
            with httpx.Client() as client:
                response = client.get(jwks_url)
                response.raise_for_status()
                JWKS_CACHE = response.json()
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to fetch JWKS from Supabase: {str(e)}"
            )
    return JWKS_CACHE

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verifies the Supabase JWT token using the JWKS public keys.
    Supports Supabase's new asymmetric JWT Signing Keys (ES256/RS256).
    """
    token = credentials.credentials
    jwks = get_jwks()
    
    try:
        # Decode the unverified header to get the Key ID (kid) and algorithm
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key["kid"] == unverified_header.get("kid"):
                rsa_key = key
                break
                
        if not rsa_key:
            # If key ID wasn't found, clear cache and retry once in case keys rotated
            global JWKS_CACHE
            JWKS_CACHE = None
            raise JWTError("Public key not found in JWKS.")

        # Verify the token against the matching public key
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=[unverified_header.get("alg", "ES256")],
            options={"verify_aud": False}  # Set True and aud="authenticated" in strict production
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload: missing subject.")
            
        return payload

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials. Token may be expired or invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )