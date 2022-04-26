import { css } from "@emotion/css";
import React, { useRef, useState } from "react";
import useLocalStorage from "./useLocalStorage";

export function Timer() {
  const [visible, setVisible] = useState<boolean>(false);

  const [, forceRender] = useState<number>();
  const endDateRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useLocalStorage("timerEndDate", endDateRef.current, (endDate) => {
    console.log(endDate);
    endDateRef.current = endDate;

    if (timerRunning()) {
      console.log(endDate);
      setVisible(true);
      startTick();
    }
  });

  function timerRunning() {
    return endDateRef.current && endDateRef.current > Date.now();
  }

  function msLeft() {
    if (!endDateRef.current) {
      return 0;
    }

    return Math.max(0, endDateRef.current - new Date().getTime());
  }

  function partsLeft() {
    const ms = msLeft();
    const s = Math.round(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);

    return [h, m % 60, s % 60];
  }
  const [h, m, s] = partsLeft();

  function startTimer(seconds: number) {
    endDateRef.current = Date.now() + seconds * 1000;
    startTick();
    setVisible(true);
  }
  function startTick() {
    stopTimer();
    forceRender(Math.random());
    timerRef.current = setInterval(() => {
      forceRender(Math.random());
      if (!timerRunning()) {
        setVisible(false);
        stopTimer();
      }
    }, 1000);
  }
  (window as any).startTimer = startTimer;

  function stopTimer() {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
  (window as any).stopTimer = stopTimer;

  return (
    <div
      className={css`
        position: absolute;
        top: 2px;
        right: 2px;
        font: 24px monospace;
        border: 3px solid black;
        border-radius: 10px;
        padding: 2px 5px;
        visibility: ${visible ? "visible" : "hidden"};
      `}
    >
      <>{("" + h).padStart(2, "0")}</>:<>{("" + m).padStart(2, "0")}</>:
      <>{("" + s).padStart(2, "0")}</>
    </div>
  );
}
