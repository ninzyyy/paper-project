import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from "framer-motion";

function App() {

  // State variables
  const[paper, setPaper] = useState(null); // Stores the current paper object
  const[likedIds, setLikedIds] = useState([]);
  const[dislikedIds, setDislikedIds] = useState([]);
  const[loading, setLoading] = useState(true); // Is the app currently fetching data?
  const[error, setError] = useState(""); // Stores error messages to display
  const[showHistory, setShowHistory] = useState(false); //History of the liked/disliked papers
  const [fallbackQueue, setFallbackQueue] = useState([]);
  const [recommendationQueue, setRecommendationQueue] = useState([]);
  const [actionCount, setActionCount] = useState(0);
  const [showFullAbstract, setShowFullAbstract] = useState(false);

  // Load the first batch of fallback papers on mount
  useEffect(() => {
    fetchFallbackBatch();
  }, []);


  // Fetch a new batch of fallback papers
  function fetchFallbackBatch() {
    setLoading(true);
    fetch("http://127.0.0.1:8000/feed?limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setFallbackQueue(data);
          setPaper(data[0]);
        }
      })
      .catch((err) => {
        setError("Network error: " + err.message);
      })
      .finally(() => setLoading(false));
  }

  // Fetch a batch of recommendations based on liked/disliked papers
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


  function handleFeedback(isLiked) {
    if (!paper?.paperId) return;

    if (isLiked) {
      setLikedIds((prev) => [...prev, paper.paperId]);
    } else {
      setDislikedIds((prev) => [...prev, paper.paperId]);
    }

    advanceQueue();
  }


  // Handle skip action
  function handleSkip() {
    advanceQueue();
  }


  // Move to the next paper in the queue
  function advanceQueue() {

    setActionCount((count) => {
      const newCount = count + 1;

      // Fetch recommendations every 5 actions
      if (newCount % 5 === 0) {
        fetchRecommendationBatch();
      }

      return newCount;
    });

    const nextQueue = fallbackQueue.slice(1);
    // If recommendationQueue is ready, use it as fallback
    if (nextQueue.length === 1 && recommendationQueue.length > 0) {
      setFallbackQueue(recommendationQueue);
      setRecommendationQueue([]);
      setPaper(recommendationQueue[0]);
    }

    // If fallbackQueue is empty and no recommendations, refetch
    else if (nextQueue.length === 0 && recommendationQueue.length === 0) {
      fetchFallbackBatch();  // Trigger re-fill
    }

    // Normal case
    else {
      setFallbackQueue(nextQueue);
      setPaper(nextQueue[0] || null);
    }
  }


  // Reset state and fallback session
  function handleResetSession() {
    fetch("http://127.0.0.1:8000/reset-fallback", { method: "POST" })
      .then(() => {
        setPaper(null);
        setLikedIds([]);
        setDislikedIds([]);
        setFallbackQueue([]);
        setRecommendationQueue([]);
        setActionCount(0);
        setShowHistory(false);
        fetchFallbackBatch();
      });
  }


  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>📚 Paper Feed</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <AnimatePresence mode="wait">
        {!loading && paper && !error && (
          <motion.div
            key={paper.paperId}
            style={styles.card}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(event, info) => {
              const offsetX = info.offset.x;
              const offsetY = info.offset.y;

              const swipeConfidence = 100; // Threshold in pixels

              if (offsetX > swipeConfidence) {
                handleFeedback(true); // 👉 right = like
              } else if (offsetX < -swipeConfidence) {
                handleFeedback(false); // 👈 left = dislike
              } else if (offsetY < -swipeConfidence) {
                handleSkip(); // ☝️ up = skip (optional)
              }
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
          >
            <h2 style={styles.title}>
              <a
                href={paper.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "inherit",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#007bff")}
                onMouseLeave={(e) => (e.target.style.color = "inherit")}
              >
                {paper.title}
              </a>
            </h2>

            <div
              style={{
                maxHeight: showFullAbstract ? "none" : "30vh",
                overflow: "hidden",
                position: "relative",
                transition: "max-height 0.3s ease",
              }}
            >
              <p style={{ lineHeight: 1.6 }}>
                {paper.abstract || "No abstract available."}
              </p>

              {!showFullAbstract && paper.abstract && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "3rem",
                    background: "linear-gradient(to bottom, transparent, #fff)",
                  }}
                />
              )}
            </div>

            {paper.abstract && paper.abstract.length > 300 && (
              <button
                onClick={() => setShowFullAbstract(!showFullAbstract)}
                style={{
                  marginTop: "0.5rem",
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {showFullAbstract ? "Show less" : "Read more"}
              </button>
            )}

            {/* Floating buttons will replace this */}
            <div style={styles.buttons}>
              <button onClick={() => handleFeedback(false)}>👎 Dislike</button>
              <button onClick={() => handleFeedback(true)}>👍 Like</button>
              <button onClick={handleSkip}>⏭️ Skip</button>
              <button onClick={() => setShowHistory((prev) => !prev)}>
                📋 {showHistory ? "Hide" : "Show"} History
              </button>
              <button onClick={handleResetSession}>🧹 Reset</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && showHistory && (
        <div style={styles.history}>
          <h3>👍 Liked</h3>
          <ul>{likedIds.map((id) => <li key={`like-${id}`}>{id}</li>)}</ul>
          <h3>👎 Disliked</h3>
          <ul>{dislikedIds.map((id) => <li key={`dislike-${id}`}>{id}</li>)}</ul>
        </div>
      )}
    </div>
  );

}

const styles = {
  card: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
  },
  title: {
    marginBottom: "1rem",
    fontSize: "1.5rem",
  },
  buttons: {
    marginTop: "1rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  history: {
    marginTop: "2rem",
    background: "#f9f9f9",
    padding: "1rem",
    borderRadius: "8px",
  },
};

export default App;