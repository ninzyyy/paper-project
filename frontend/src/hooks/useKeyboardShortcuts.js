import { useEffect } from "react";


export default function useKeyboardShortcuts({
  paper,
  lockedRef,
  onLike,
  onDislike,
  onSkip,
  setKeyboardSwipeDirection
 }) {

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!paper || lockedRef.current) return;

      switch (event.key) {

        case "ArrowRight":
          setKeyboardSwipeDirection("right");
          setTimeout(() => {
            onLike();
            setKeyboardSwipeDirection(null);
          }, 300);
          break;

        case "ArrowLeft":
          setKeyboardSwipeDirection("left");
          setTimeout(() => {
            onDislike();
            setKeyboardSwipeDirection(null);
          }, 300);
          break;

        case "ArrowUp":
          setKeyboardSwipeDirection("up");
          setTimeout(() => {
            onSkip();
            setKeyboardSwipeDirection(null);
          }, 300);
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [paper, onLike, onDislike, onSkip, lockedRef, setKeyboardSwipeDirection]);
}
