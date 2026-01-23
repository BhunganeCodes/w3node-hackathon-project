from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import tender

app = FastAPI(title="TenderChain API")

# CORS FIX (THIS IS REQUIRED)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tender.router, prefix="/api")

@app.get("/")
def health():
    return {"status": "API running"}