import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrollt naar boven bij elke route-wisseling. */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};
