import { useEffect, useLayoutEffect, useRef } from "react";
import { type Location, useNavigationType } from "react-router-dom";

type RouteScrollManagerProps = {
  location: Location;
};

function getHistoryEntryKey(location: Location) {
  return location.key || `${location.pathname}${location.search}`;
}

export default function RouteScrollManager({
  location,
}: RouteScrollManagerProps) {
  const navigationType = useNavigationType();
  const currentEntryKey = getHistoryEntryKey(location);
  const previousEntryKeyRef = useRef(currentEntryKey);
  const scrollPositionsRef = useRef(new Map<string, number>());

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const previousEntryKey = previousEntryKeyRef.current;

    scrollPositionsRef.current.set(previousEntryKey, window.scrollY);

    const nextScrollTop =
      navigationType === "POP"
        ? scrollPositionsRef.current.get(currentEntryKey) ?? 0
        : 0;

    window.scrollTo({
      top: nextScrollTop,
      left: 0,
      behavior: "auto",
    });

    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = nextScrollTop;
    }
    document.documentElement.scrollTop = nextScrollTop;
    document.body.scrollTop = nextScrollTop;

    previousEntryKeyRef.current = currentEntryKey;
  }, [currentEntryKey, navigationType]);

  return null;
}
