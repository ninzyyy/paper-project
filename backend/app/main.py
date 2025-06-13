from fastapi  import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.scholar import SemanticScholarClient


app = FastAPI()
SemanticScholar = SemanticScholarClient()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    )


@app.get("/feed")
def fetch_paper():
    return SemanticScholar.get_fallback_paper()


@app.post("/smart-next")
async def smart_next(request: Request):
    payload = await request.json()
    positive_ids = payload.get("positivePaperIds", [])
    negative_ids = payload.get("negativePaperIds", [])

    if not positive_ids and not negative_ids:
        print("⚠️ main.py: No liked or disliked papers, using fallback paper.")
        return SemanticScholar.get_fallback_paper()

    rec = SemanticScholar.get_recommended_paper_from_list(
        positive_ids=positive_ids,
        negative_ids=negative_ids
    )

    if "error" not in rec:
        return rec

    print("⚠️ main.py: Recommendation failed, using fallback paper.")
    return SemanticScholar.get_fallback_paper()


@app.post("/reset-fallback")
def reset_fallback():
    SemanticScholar.reset_fallback_state()
    return {"status": "fallback state reset"}
