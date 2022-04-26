import { useEffect, useRef } from "react";

export default function useLocalStorage(key, value, load) {
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      let savedState = localStorage.getItem(key);
      if (savedState) {
        load(JSON.parse(savedState));
      }
      firstRun.current = false;
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [value]);
}
