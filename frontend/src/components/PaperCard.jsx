import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faXmark, faSquareCaretUp, faSquareCaretDown, faSquareCaretLeft, faSquareCaretRight, faQuestionCircle, faLockOpen, faArrowLeft, faArrowRight, faThumbsDown, faClock, faRotateLeft, faEllipsisH} from "@fortawesome/free-solid-svg-icons";
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
  onLike,
  onDislike,
  onSkip,
  onReset,
  onToggleHistory,
  showHistory,
  keyboardSwipeDirection,
  actionType,
  showFullAbstract,
  setShowFullAbstract
}) {

  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

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
            alignItems: "center",
            marginBottom: "0.5rem",
            fontSize: "0.85rem",
            color: "#888"
          }}>
            <span>
              {paper.publicationTypes?.length > 0 && (
                <span>
                  {paper.publicationTypes.map(formatType).join(", ")}
                </span>
              )}
              {paper.publicationTypes?.length > 0 && paper.journal?.name && " | "}
              {paper.journal?.name}
            </span>
          </div>
        )}

        <h2 style={styles.title}>
          <a
            href={paper.openAccessPdf?.url || (paper.externalIds?.DOI && `https://doi.org/${paper.externalIds.DOI}`)}
            target="_blank"
            rel="noreferrer"
            style={{ color: "inherit", textDecoration: "none" }}
            onMouseEnter={(e) => (e.target.style.color = "#007bff")}
            onMouseLeave={(e) => (e.target.style.color = "inherit")}
          >
            {paper.title}
          </a>
          {/*
          {paper.openAccessPdf?.url && (
            <FontAwesomeIcon
              icon={faLockOpen}
              style={{ marginLeft: "0.5rem", color: "#007bff", fontSize: "0.8rem" }}
              title="Open Access PDF"
            />
          )}
          */}
        </h2>

        <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "0", marginBottom: "1rem" }}>
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
                        fontSize: "0.8rem",
                        color: "#007bff",
                        opacity: 0.8,
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
          <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "-0.75rem", marginBottom: "1rem" }}>
            {new Date(paper.publicationDate).toLocaleDateString("en-US", {year:"numeric", month:"short", day:"numeric"})}
          </p>
        )}

        {paper.abstract && (
          <div style={{ marginBottom: "1rem", fontSize: "0.95rem", lineHeight: "1.4" }}>
            {!showFullAbstract ? (
              <>
                <div style={styles.abstractPreview}>
                  <p>{paper.abstract}</p>
                  <div style={styles.fadeOut} />
                </div>
                <button
                  style={styles.readMore}
                  onClick={() => setShowFullAbstract(true)}
                >
                  Read more
                </button>
              </>
            ) : (
              <>
                <p>{paper.abstract}</p>
                <button
                  style={styles.readMore}
                  onClick={() => setShowFullAbstract(false)}
                >
                  Read less
                </button>
              </>
            )}
          </div>
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


          <div
            style={styles.shortcutIconContainer}
            onMouseEnter={() => setShowShortcuts(true)}
            onMouseLeave={() => setShowShortcuts(false)}
          >
            <button style={styles.shortcutIconButton} title="Keyboard Shortcuts">
              <FontAwesomeIcon icon={faQuestionCircle} />
            </button>

            {showShortcuts && (
              <div style={styles.shortcutPopup}>
                <div style={{ textAlign: "center", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Keyboard Shortcuts
                </div>

                <div style={styles.keyGrid}>
                  <div />
                  <div style={styles.keyIconBlock}>
                    <FontAwesomeIcon icon={faSquareCaretUp} size="lg" />
                    <div style={styles.label}>Skip</div>
                  </div>
                  <div />

                  <div style={styles.keyIconBlock}>
                    <FontAwesomeIcon icon={faSquareCaretLeft} size="lg" />
                    <div style={styles.label}>Dislike</div>
                  </div>
                  <div style={styles.keyIconBlock}>
                    <FontAwesomeIcon icon={faSquareCaretDown} size="lg" />
                    <div style={styles.label}>Abstract</div>
                  </div>
                  <div style={styles.keyIconBlock}>
                    <FontAwesomeIcon icon={faSquareCaretRight} size="lg" />
                    <div style={styles.label}>Like</div>
                  </div>
                </div>
              </div>
            )}

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

    abstractPreview: {
    maxHeight: "6rem",
    overflow: "hidden",
    position: "relative",
    marginBottom: "0.5rem"
  },

  fadeOut: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "2rem",
    background: "linear-gradient(to top, white, rgba(255,255,255,0))"
  },

  readMore: {
    marginTop: "0rem",
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "0.9rem",
  },

  shortcutIconContainer: {
    position: "absolute",
    bottom: "1rem",
    right: "1rem",
    zIndex: 10,
    display: "inline-block",
  },

  shortcutIconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#007bff",
    padding: 0,
  },

  shortcutPopup: {
    position: "absolute",
    bottom: "2.2rem",
    right: "0",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "0.5rem 0.75rem",
    fontSize: "0.85rem",
    lineHeight: "1.4",
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
    width: "180px",
    textAlign: "center",
    zIndex: 1000,
  },

  keyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.2rem",
    justifyItems: "center",
    alignItems: "center",
  },

  keyIconBlock: {
    textAlign: "center",
    color: "#e0e0e0",
    fontSize: "1.25rem",
    lineHeight: 1.1,
  },

  label: {
    fontSize: "0.65rem",
    marginTop: "0.2rem",
    color: "#007bff",
  },

};

export default PaperCard;
