import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Disable automatic browser scroll restoration so previous scroll positions don't persist
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const resetScroll = () => {
      // 1. Reset standard window scroll position
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

      // 2. Reset html and body elements
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }

      // 3. Reset any scrollable main or nested containers
      const scrollableContainers = document.querySelectorAll(
        "main, [data-scroll-container], #root, .overflow-y-auto"
      );
      scrollableContainers.forEach((el) => {
        el.scrollTop = 0;
      });
    };

    // Execute immediately on route change
    resetScroll();

    // Execute on next animation frame to handle asynchronous rendering and paint cycles
    const frameId = requestAnimationFrame(() => {
      resetScroll();
    });

    return () => cancelAnimationFrame(frameId);
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
