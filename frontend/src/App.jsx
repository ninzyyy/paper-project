import { useState, useEffect } from 'react';

function App() {

  // State variables
  const[paper, setPaper] = useState(null); // Stores the current paper object
  const[likedIds, setLikedIds] = useState([]);
  const[dislikedIds, setDislikedIds] = useState([]);
  const[loading, setLoading] = useState(true); // Is the app currently fetching data?
  const[error, setError] = useState(""); // Stores error messages to display
  const[showHistory, setShowHistory] = useState(false); //History of the liked/disliked papers

  // Initial mounting of the app
  useEffect(() => {
    fetchFallbackBatch();
  }, []);

  // Function to get the initial paper from the '/feed' endpoint
  function fetchFallbackBatch(){
    setLoading(true); // Display loading indicator
    fetch("http://127.0.0.1:8000/feed") // Send HTTP GET request
      .then((response) => response.json()) // Convert the response to JSON
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPaper(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        // If fetch fails (e.g. network error), set error message
        setError("Network error: " + err.message);
        setLoading(false);
      });
  }

  // Function to fetch a personalized paper from Semantic Scholar
  async function fetchNextPaper() {
    setLoading(true);
    setError("");

    const body = {
      positivePaperIds: likedIds,
      negativePaperIds: dislikedIds,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/smart-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      console.log("Smart-next response:", data);

      if (data?.title && data?.paperId) {
        setPaper(data);
      } else {
        console.warn("Falling back to /feed");
        const fallbackRes = await fetch("http://127.0.0.1:8000/feed");
        const fallbackData = await fallbackRes.json();
        setPaper(fallbackData);
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }

    setLoading(false);
  }

  async function fetchRecommendationBatch() {

    const body = {
      positivePaperIds: likedIds,
      negativePaperIds: dislikedIds,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const papers = await response.json();
      if (Array.isArray(papers)) {
        setRecommendationQueue(papers);
      } else {
        console.warn("Unexpected format in /smart-batch:", papers);
      }
    } catch (err) {
      console.error("❌ Recommendation batch fetch failed:", err.message);
    }
  }

  function handleNext() {
    fetchNextPaper();
  }

  function handleLike() {
    if (!paper?.paperId) return;
    setLikedIds(prev => [...prev, paper.paperId]);
    fetchNextPaper();
  }

  function handleDislike() {
    if (!paper?.paperId) return;
    setDislikedIds(prev => [...prev, paper.paperId]);
    fetchNextPaper();
  }

  function handleResetSession() {
    fetch("http://127.0.0.1:8000/reset-fallback", { method: "POST" })
      .then(() => {
        setPaper(null);
        setLikedIds([]);
        setDislikedIds([]);
        fetchInitialPaper();
      });
  }

  return (
    <div>
      <h1>Paper Feed</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && paper && !error && (
        <div style={{
          maxWidth: "600px",
          margin: "2rem auto",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: "#ffffff"
        }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>{paper.title}</h2>
          <p style={{ lineHeight: 1.6, fontSize: "1rem" }}>
            {paper.abstract || "No abstract available."}
          </p>

          <div style={{ marginTop: "1rem" }}>
            <a href={paper.url} target="_blank" rel="noreferrer" style={{ color: "#007bff" }}>
              🔗 View Source
            </a>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <button onClick={handleDislike}>👎 Dislike</button>
            <button onClick={handleLike}>👍 Like</button>
            <button onClick={handleNext}>⏭️ Next</button>
            <button onClick={() => setShowHistory(prev => !prev)}>📋 {showHistory ? "Hide" : "Show"} Liked/Disliked </button>
            <button onClick={handleResetSession}>🧹 Reset Feed</button>
          </div>
        </div>
      )}

      {!loading && showHistory && (
      <div style={{ marginTop: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "8px" }}>
        <h3>Liked Paper IDs</h3>
        <ul>
          {likedIds.map(id => <li key={`like-${id}`}>{id}</li>)}
        </ul>
        <h3>Disliked Paper IDs</h3>
        <ul>
          {dislikedIds.map(id => <li key={`dislike-${id}`}>{id}</li>)}
        </ul>
      </div>
    )}

    </div>
  );
}

export default App;