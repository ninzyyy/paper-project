import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from "framer-motion";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faBookmark } from "@fortawesome/free-solid-svg-icons";

import PaperCard from './components/PaperCard'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import usePaperQueue from './hooks/usePaperQueue';

function App() {

  // State variables
  const[showHistory, setShowHistory] = useState(false); //History of the liked/disliked papers
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const [locked, setLocked] = useState(false);
  const LOCK_DURATION_MS = 500;
  const [keyboardSwipeDirection, setKeyboardSwipeDirection] = useState(null);
  const [actionType, setActionType] = useState(null);
  const {
    paper,
    likedIds,
    dislikedIds,
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
    onLike: () => {
      handleFeedback(true);
      setActionType("like");
      setTimeout(() => setActionType(null), 400);
    },
    onDislike: () => {
      handleFeedback(false);
      setActionType("dislike");
      setTimeout(() => setActionType(null), 400);
    },
    onSkip: () => {
      handleSkip();
      setActionType("skip");
      setTimeout(() => setActionType(null), 400);
    },
    onToggleAbstract: () => {
      if (paper?.abstract) {
        setShowFullAbstract(prev => !prev)
      }
    },
    setKeyboardSwipeDirection
  });


  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>

        <h1 style={{ marginLeft: 0 }}>
          <FontAwesomeIcon icon={faBookmark} color="#007bff"/>
          &nbsp;Paper Project
        </h1>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <AnimatePresence mode="wait">
          {!loading && paper && !error && (
            <PaperCard
              paper={paper}
              locked={locked}
              showFullAbstract={showFullAbstract}
              setShowFullAbstract={setShowFullAbstract}
              onLike={() => {
                handleFeedback(true);
                setActionType("like");
                setTimeout(() => setActionType(null), 400);
              }}
              onDislike={() => {
                handleFeedback(false);
                setActionType("dislike");
                setTimeout(() => setActionType(null), 400);
              }}
              onSkip={() => {
                handleSkip();
                setActionType("skip");
                setTimeout(() => setActionType(null), 400);
              }}
              onReset={handleResetSession}
              onToggleHistory={() => setShowHistory((prev) => !prev)}
              showHistory={showHistory}
              keyboardSwipeDirection={keyboardSwipeDirection}
              actionType={actionType}
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