import { useState, useEffect } from 'react';

function App() {

  // State variables
  const[paper, setPaper] = useState(null); // Stores the current paper object
  const[likedIds, setLikedIds] = useState([]);
  const[dislikedIds, setDislikedIds] = useState([]);
  const[loading, setLoading] = useState(true); // Is the app currently fetching data?
  const[error, setError] = useState(""); // Stores error messages to display

  // Initial mounting of the app
  useEffect(() => {
    fetchInitialPaper(); // Load the first paper
  }, []); // The empty array means this runs only once

  // Function to get the initial paper from the '/feed' endpoint
  function fetchInitialPaper(){
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

  // Function to fetch the next recommended paper based on the current paper ID
  function loadNextPaper() {

    if (!paper?.paperId) return; // Guard clause to ensure valid paper ID

    setLoading(true); // Display loading indicator
    fetch(`http://127.0.0.1:8000/recommendations?paperId=${paper.paperId}`) // GET request with query parameter
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPaper(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        // Catch network-level errors
        setError("Network error: " + err.message);
        setLoading(false);
      });
  }

  return (
    <div>
      <h1>Paper Feed (Manual Mode)</h1>

      {/* Show loading message while fetching */}
      {loading && <p>Loading...</p>}

      {/* Show any error in red */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Show paper content once available and there's no error */}
      {paper && !error && (
        <div style={{
          maxWidth: "600px",
          margin: "2rem auto",
          padding: "1.5rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: "#ffffff"
        }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
            {paper.title}
          </h2>

          <p style={{ lineHeight: 1.6, fontSize: "1rem" }}>
            {paper.abstract || "No abstract available."}
          </p>

          {/* Link to original paper */}
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

          {/* Button to get the next recommendation */}
          <button onClick={loadNextPaper} style={{ marginTop: "1rem" }}>
            ▶️ Next
          </button>
        </div>
      )}
    </div>
  );
}

export default App;