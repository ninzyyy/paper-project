import { motion } from "framer-motion";

const SWIPE_CONFIDENCE = 100; // Number of pixels to complete "swipe"
const swipeVariants = {
  default: { x: 0, y: 0, opacity: 1, scale: 1 },
  left: { x: -500, opacity: 0 },
  right: { x: 500, opacity: 0 },
  up: { y: -500, opacity: 0 },
};


function PaperCard({
  paper,
  locked,
  showFullAbstract,
  setShowFullAbstract,
  onLike,
  onDislike,
  onSkip,
  onReset,
  onToggleHistory,
  showHistory,
  keyboardSwipeDirection,
}) {
  return (
    <motion.div
      key={paper.paperId}
      style={styles.card}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(event, info) => {
        const offsetX = info.offset.x;
        const offsetY = info.offset.y;

        if (offsetX > SWIPE_CONFIDENCE) onLike();
        else if (offsetX < -SWIPE_CONFIDENCE) onDislike();
        else if (offsetY < -SWIPE_CONFIDENCE) onSkip();
      }}
      variants={swipeVariants}
      animate={keyboardSwipeDirection || "default"} // ← animation trigger
      initial={{ opacity: 0, scale: 0.95 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
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
          style={styles.readMore}
        >
          {showFullAbstract ? "Show less" : "Read more"}
        </button>
      )}

      <div style={styles.buttons}>
        <button onClick={onDislike} disabled={locked}>👎 Dislike</button>
        <button onClick={onLike} disabled={locked}>👍 Like</button>
        <button onClick={onSkip} disabled={locked}>⏭️ Skip</button>
        <button onClick={onToggleHistory}>📋 {showHistory ? "Hide" : "Show"} History</button>
        <button onClick={onReset}>🧹 Reset</button>
      </div>
    </motion.div>
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
  readMore: {
    marginTop: "0.5rem",
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
};

export default PaperCard;
