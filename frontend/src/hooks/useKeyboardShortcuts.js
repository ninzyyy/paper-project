import { useEffect } from "react";


export default function useKeyboardShortcuts({ paper, lockedRef, onLike, onDislike, onSkip }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!paper || lockedRef.current) return;

      switch (event.key) {
        case "ArrowRight":
          onLike();
          break;
        case "ArrowLeft":
          onDislike();
          break;
        // case "ArrowUp":
        //   onSkip();
        //   break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [paper, onLike, onDislike, onSkip, lockedRef]);
}
