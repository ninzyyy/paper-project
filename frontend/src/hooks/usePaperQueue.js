import { useEffect, useState, useRef } from "react";


export default function usePaperQueue({ setLocked, LOCK_DURATION_MS }) {
  const [paper, setPaper] = useState(null);

  const [likedPapers, setLikedPapers] = useState([]);
  const [likedIds, setLikedIds] = useState([]);

  const [dislikedIds, setDislikedIds] = useState([]);
  const [dislikedPapers, setDislikedPapers] = useState([]);

  const [skippedIds, setSkippedIds] = useState([]);

  const [fallbackQueue, setFallbackQueue] = useState([]);
  const [recommendationQueue, setRecommendationQueue] = useState([]);

  const [actionCount, setActionCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const lockedRef = useRef(false);


  useEffect(() => {
    fetchFallbackBatch();
  }, []);


  function getSeenSet() {
    return new Set([
      ...likedPapers.map(p => p.paperId),
      ...dislikedPapers.map(p => p.paperId),
      ...skippedIds,
    ]);
  }


  function fetchFallbackBatch() {
    setLoading(true);
    fetch("http://127.0.0.1:8000/feed?limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          const seen = getSeenSet();
          const filtered = data.filter(p => !seen.has(p.paperId));
          setFallbackQueue(filtered);
          setPaper(filtered[0]);
        }
      })
      .catch((err) => setError("Network error: " + err.message))
      .finally(() => setLoading(false));
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
        const seen = getSeenSet();
        const filtered = papers.filter(p => !seen.has(p.paperId));
        setRecommendationQueue(filtered);
      } else {
        console.warn("Unexpected format in /smart-batch:", papers);
      }
    } catch (err) {
      console.error("❌ Recommendation batch fetch failed:", err.message);
    }
  }


  function lockForDuration() {
    setLocked(true);
    lockedRef.current = true;
    setTimeout(() => {
      setLocked(false);
      lockedRef.current = false;
    }, LOCK_DURATION_MS);
  }


  function handleFeedback(isLiked) {
    if (lockedRef.current || !paper?.paperId) return;

    lockForDuration();

    if (isLiked) {
      setLikedIds((prev) => [...prev, paper.paperId]);
      setLikedPapers((prev) => [...prev, paper]);
    } else {
      setDislikedIds((prev) => [...prev, paper.paperId]);
      setDislikedPapers((prev) => [...prev, paper]);
    }

    advanceQueue();
  }


  function handleSkip() {
    if (lockedRef.current || !paper?.paperId) return;
    setSkippedIds((prev) => [...prev, paper.paperId]);
    lockForDuration();
    advanceQueue();
  }


  function advanceQueue() {
    setActionCount((count) => {
      const newCount = count + 1;
      if (newCount % 5 === 0) fetchRecommendationBatch();
      return newCount;
    });

    const nextQueue = fallbackQueue.slice(1);

    if (nextQueue.length > 0) {
      setFallbackQueue(nextQueue);
      setPaper(nextQueue[0]);
    } else if (recommendationQueue.length > 0) {
      setFallbackQueue(recommendationQueue);
      setRecommendationQueue([]);
      setPaper(recommendationQueue[0]);
    } else {
      fetchFallbackBatch();
    }
  }


  function handleResetSession() {
    fetch("http://127.0.0.1:8000/reset-fallback", { method: "POST" })
      .then(() => {
        setPaper(null);
        setLikedIds([]);
        setLikedPapers([]);
        setDislikedIds([]);
        setDislikedPapers([]);
        setFallbackQueue([]);
        setRecommendationQueue([]);
        setActionCount(0);
        fetchFallbackBatch();
        setSkippedIds([]);
      });
  }


  return {
    paper,
    likedIds,
    likedPapers,
    dislikedIds,
    dislikedPapers,
    fallbackQueue,
    recommendationQueue,
    loading,
    error,
    lockedRef,
    handleFeedback,
    handleSkip,
    handleResetSession,
  };
}
