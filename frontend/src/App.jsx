import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from "framer-motion";

import PaperCard from './components/PaperCard'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import usePaperQueue from './hooks/usePaperQueue';

function App() {

  // State variables
  const[showHistory, setShowHistory] = useState(false); //History of the liked/disliked papers
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const [locked, setLocked] = useState(false);
  const LOCK_DURATION_MS = 500;


  const {
    paper,
    likedIds,
    dislikedIds,
    fallbackQueue,
    recommendationQueue,
    loading,
    error,
    lockedRef,
    handleFeedback,
    handleSkip,
    handleResetSession,
  } = usePaperQueue({ setLocked, LOCK_DURATION_MS });


  useKeyboardShortcuts({
    paper,
    lockedRef,
    onLike: () => handleFeedback(true),
    onDislike: () => handleFeedback(false),
    onSkip: handleSkip,
  });


  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>📚 Paper Feed</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <AnimatePresence mode="wait">
        {!loading && paper && !error && (
          <PaperCard
            paper={paper}
            locked={locked}
            showFullAbstract={showFullAbstract}
            setShowFullAbstract={setShowFullAbstract}
            onLike={() => handleFeedback(true)}
            onDislike={() => handleFeedback(false)}
            onSkip={handleSkip}
            onReset={handleResetSession}
            onToggleHistory={() => setShowHistory((prev) => !prev)}
            showHistory={showHistory}
          />
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
  history: {
    marginTop: "2rem",
    background: "#f9f9f9",
    padding: "1rem",
    borderRadius: "8px",
  },
};

export default App;