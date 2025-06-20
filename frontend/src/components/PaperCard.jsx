import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faXmark, faArrowLeft, faArrowRight, faThumbsDown, faClock, faRotateLeft, faEllipsisH} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const SWIPE_CONFIDENCE = 100;
const swipeVariants = {
  default: { x: 0, y: 0, opacity: 1, scale: 1 },
  left: { x: -500, opacity: 0 },
  right: { x: 500, opacity: 0 },
  up: { y: -500, opacity: 0 },
};

// Insert a space between lowercase-uppercase text (i.e. JournalArticle -> Journal Article)
function formatType(type) {
  return type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

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
  actionType
}) {

  const [showAllAuthors, setShowAllAuthors] = useState(false);

  return (
    <>
      <AnimatePresence>
        {actionType === "like" && (
          <motion.div
            key="like"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: "50%",
              right: "2rem",
              transform: "translateY(-50%)",
              fontSize: "2rem",
              zIndex: 1000,
              pointerEvents: "none",
              color: "red"
            }}
          >
            <FontAwesomeIcon icon={faHeart} />
          </motion.div>
        )}
        {actionType === "dislike" && (
          <motion.div
            key="dislike"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "2rem",
              transform: "translateY(-50%)",
              fontSize: "2rem",
              zIndex: 1000,
              pointerEvents: "none",
              color: "#007bff"
            }}
          >
            <FontAwesomeIcon icon={faThumbsDown} />
          </motion.div>
        )}
      </AnimatePresence>

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
        animate={keyboardSwipeDirection || "default"}
        initial={{ opacity: 0, scale: 0.95 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >

        {(paper.journal?.name || paper.publicationTypes?.length) && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
            fontSize: "0.85rem",
            color: "#666"
          }}>
            {/* Journal name */}
            <span>{paper.journal?.name}</span>

            {/* Article type (e.g., Journal Article, Review, etc.) */}
            <span>
              {paper.publicationTypes?.map(formatType).join(", ")}
            </span>
          </div>
        )}

        <h2 style={styles.title}>
          <a
            href={paper.url}
            target="_blank"
            rel="noreferrer"
            style={{ color: "inherit", textDecoration: "none" }}
            onMouseEnter={(e) => (e.target.style.color = "#007bff")}
            onMouseLeave={(e) => (e.target.style.color = "inherit")}
          >
            {paper.title}
          </a>
        </h2>

        <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0", marginBottom: "1rem" }}>
          {(() => {
            const authors = paper.authors || [];
            const first = authors[0]?.name;
            const second = authors[1]?.name;
            const last = authors.at(-1)?.name;

            if (showAllAuthors || authors.length <= 3) {
              return (
                <>
                  {authors.map((a, i) => (
                    <span key={i}>
                      {a.name}
                      {i < authors.length - 1 ? ", " : ""}
                    </span>
                  ))}
                  {authors.length > 3 && (
                    <span
                      onClick={() => setShowAllAuthors(false)}
                      style={{
                        marginLeft: "0.5rem",
                        cursor: "pointer",
                        fontSize: "0.8rem",         // Smaller text
                        color: "#007bff",
                        opacity: 0.8,               // Slightly lighter
                      }}
                    >
                      [collapse]
                    </span>
                  )}
                </>
              );
            } else {
              return (
                <>
                  <span>{first}, {second}, </span>
                  <span
                    onClick={() => setShowAllAuthors(true)}
                    style={{ cursor: "pointer",
                             color: "#007bff",
                             fontSize: "0.8rem",
                             marginRight: "0",
                             marginLeft: "0.25rem" }}
                    title="Show all authors"
                  >[...]</span>, <span>{last}</span>
                </>
              );
            }
          })()}
        </p>

        {paper.publicationDate && (
          <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "-0.75rem", marginBottom: "1rem" }}>
            {new Date(paper.publicationDate).toLocaleDateString("en-US", {year:"numeric", month:"short", day:"numeric"})}
          </p>
        )}

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
          <button onClick={onDislike} disabled={locked}>
            <FontAwesomeIcon icon={faThumbsDown} color="#007bff" /> Dislike
          </button>
          <button onClick={onLike} disabled={locked}>
            <FontAwesomeIcon icon={faHeart} color="red"/> Like
          </button>
          <button onClick={onSkip} disabled={locked}>
            <FontAwesomeIcon icon={faArrowRight} color="#007bff"/> Skip
          </button>
          <button onClick={onToggleHistory}>
            <FontAwesomeIcon icon={faClock} color="#007bff" /> {showHistory ? "Hide" : "Show"} History
          </button>
          <button onClick={onReset}>
            <FontAwesomeIcon icon={faRotateLeft} color="#007bff" /> Reset
          </button>
        </div>
      </motion.div>
    </>
  );
}

const styles = {
  card: {
    position: "relative",
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
