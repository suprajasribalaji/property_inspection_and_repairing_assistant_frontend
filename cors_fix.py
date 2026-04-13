# Add this to your FastAPI backend

from fastapi.middleware.cors import CORSMiddleware

# Add this middleware to your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://property-inspection-and-repairing-a.vercel.app",
        "https://property-inspection-and-repairing-sc6m.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Or for production:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
