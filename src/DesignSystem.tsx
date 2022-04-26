import { css } from "@emotion/css";
import React from "react";

// export function WritingSpace(props: )

export function Slot(props: { children: React.ReactNode }) {
  return (
    <span
      className={css`
        background: none;
        border-bottom: 1px solid black;
      `}
    >
      {props.children}
    </span>
  );
}

export function ActionIcon(
  props: React.HTMLAttributes<HTMLElement> & { emoji: string },
) {
  const { emoji, ...rest } = props;

  return <div {...rest}>{emoji}</div>;
}

// export function HelpText() {}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      tabIndex={-1}
      className={css`
        background: white;
        border: 1px solid black;
        border-radius: 1em;
        padding: 0em 0.8em;
        margin: -1px 0em;
        font: inherit;
        line-height: normal;
        /* text-transform: uppercase;
        font-size: 0.8em; */

        &:hover:not(:active) {
          filter: brightness(0.9);
        }

        &:active {
          filter: invert(100%);
        }
      `}
      type="button"
      {...props}
    >
      {props.children}
    </button>
  );
}
