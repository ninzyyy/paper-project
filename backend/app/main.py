from fastapi  import FastAPI
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
def fetch_paper(query:str="Small Cell Lung Cancer"):
    return SemanticScholar.search_paper(query)


@app.get("/recommendations")
def fetch_recommendation(paperId:str):
    return SemanticScholar.get_recommended_paper(paper_id=paperId)