import { useState, useEffect } from 'react';

function App() {

  // Variables to be used
  const[paper, setPaper] = useState(null);
  const[loading, setLoading] = useState(true);
  const[error, setError] = useState("");
  const[hasFetched, setHasFetched] = useState(false);

  useEffect(() => {

    // Step 1: Fetch the data from the backend
    fetch("http://127.0.0.1:8000/feed")
    .then((response) => response.json())
    .then((data) => {
      // Step 2: If there is an error, then store it
      if (data.error) {
        setError(data.error);
      } else {
        setPaper(data);
      }
      setLoading(false);
    })
    .catch((err) => {
      // Step 3: Catch any network issues
      setError("Network error: " + err.message);
      setLoading(false);
    });
  }, []);


  useEffect(() => {
    function handleScroll() {
      if (
        !hasFetched &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 50
      ) {
        loadRecommendedPaper();
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [paper]); // this will reattach scroll when the paper changes

  function loadRecommendedPaper() {

    if (!paper?.paperId || hasFetched) return;
    console.log("Fetching recommendation for:", paper.paperId);
    setHasFetched(true);
    setLoading(true);

    fetch(`http://localhost:8000/recommendations?paperId=${paper.paperId}`)
    .then(response => response.json())
    .then(data => {

      console.log("Received response:", data);

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      setPaper(data);
      setHasFetched(false);
      window.scroll(0, 0);
      setLoading(false);
    })
    .catch(err => {
      setError("Network error: " + err.message);
      setLoading(false);
    });
  }

  return (
    <div>
      <h1>Feed</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {paper && !error && (
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
            <a
              href={paper.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#007bff" }}
            >
              🔗 View Source
            </a>
          </div>
          <button onClick={loadRecommendedPaper} style={{ marginTop: "1rem" }}>
            🔄 Get Recommendation
          </button>
        </div>
      )}
    </div>
  );

}

export default App;
