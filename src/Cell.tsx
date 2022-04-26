import { css } from "@emotion/css";
import React, { useEffect, useState } from "react";
import { CellState } from "./index";

interface Pattern {
  icon: string;
  regex: RegExp;
  actionId: keyof typeof Actions;
  priority: number;
}

const Patterns: Record<string, Pattern> = {
  timer1: {
    icon: "⏲",
    regex:
      /^(?<phrasing1>set (a )?timer for )(?<minutes>\d+)(?<phrasing2> ?(m|mini?n?u?t?e?s?))$/,
    actionId: "timer",
    priority: 5,
  },
  shop1: {
    icon: "🛒",
    regex: /^add (?<item>.*) to (my )?shopping list$/,
    actionId: "shop",
    priority: 5,
  },
  google1: {
    icon: "🔎",
    regex: /^google (?<query>.*)$/,
    actionId: "google",
    priority: 5,
  },
  note1: {
    icon: "📝",
    regex: /^(note )?(?<input>.*)$/,
    actionId: "note",
    priority: 1,
  },
  leave1: {
    icon: "🚫",
    regex: /^(?<input>.*)$/,
    actionId: "leave",
    priority: 2,
  },

  // > add vegetables to my shopping list
  // > set a timer for 5 minutes for
  // > update sprint planning sheet for next week
  // > google what happened last night
};

type Action = React.FC<{
  fields: Record<string, string>;
  setState: (state: Partial<CellState>) => void;
  status: CellState["status"];
}>;

const Actions: Record<string, Action> = {
  leave: ({ fields: { input } }) => {
    return (
      <>
        <div>leave this text as is:</div>
        <div>{input}</div>
      </>
    );
  },
  note: ({ fields: { input } }) => {
    return (
      <>
        <div>add to notes:</div>
        <div>{input}</div>
      </>
    );
  },
  shop: ({ fields: { item } }) => {
    return (
      <>
        <div>add to shopping list:</div>
        <div>add {item} to shopping list</div>
      </>
    );
  },
  google: ({ fields: { query } }) => {
    return (
      <>
        <div>Google:</div>
        <div>google “{query}”</div>
      </>
    );
  },
  timer: ({ fields: { minutes, phrasing1, phrasing2 }, setState, status }) => {
    return (
      <>
        <div>
          <div>set a timer:</div>
          {phrasing1}
          {minutes} minutes{" "}
          <button
            type="button"
            disabled={status === "executed"}
            onClick={() =>
              setState({
                status: "executed",
              })
            }
          >
            {status === "executed" ? "started" : "start"}
          </button>
        </div>
      </>
    );
  },
};

export const Cell: React.FC<
  CellState & {
    setState: (state: Partial<CellState>) => void;
  }
> = (props) => {
  const [patternIds, setPatternIds] = useState<string[]>([]);

  const patternId =
    props.status !== "candidate" || patternIds.includes(props.patternId)
      ? props.patternId
      : patternIds[0];
  const pattern = Patterns[patternId];
  const Action = Actions[pattern?.actionId];
  const fields = pattern?.regex.exec(props.freeform)?.groups ?? {};

  const patterns = patternIds.map((id) => ({ ...Patterns[id], id }));

  function updatePatterns() {
    setPatternIds(
      Object.entries(Patterns)
        .filter(([, pattern]) => pattern.regex.test(props.freeform))
        .sort(
          ([, pattern1], [, pattern2]) => pattern2.priority - pattern1.priority,
        )
        .map(([id]) => id),
    );
  }

  useEffect(() => {
    if (props.status === "candidate") {
      updatePatterns();
    }
  }, [props.status, props.freeform]);

  return (
    <div>
      <textarea
        rows={1}
        className={css`
          display: block;
          font: inherit;
          resize: none;
          width: 100%;
        `}
        ref={(el) => {
          if (el) {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }
        }}
        onInput={(e) => {
          let el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = el.scrollHeight + "px";
          props.setState({ freeform: el.value });
        }}
        value={props.freeform}
      />
      <button
        type="button"
        onClick={() => {
          props.setState({ status: "candidate" });
        }}
      >
        Run
      </button>
      <button
        type="button"
        onClick={() => {
          props.setState({ status: "freeform" });
        }}
      >
        Close
      </button>

      {props.status === "candidate" && (
        <div>
          <div
            className={css`
              display: flex;
              flex-direction: row;
            `}
          >
            <div>
              {patterns.map((pattern) => (
                <div key={pattern.id}>
                  <button
                    type="button"
                    onClick={() => {
                      props.setState({ patternId: pattern.id });
                    }}
                  >
                    {pattern.icon}
                  </button>
                </div>
              ))}
            </div>
            <div>
              {Action && (
                <Action
                  fields={fields}
                  setState={props.setState}
                  status={props.status}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {props.status === "executed" && (
        <div>
          {Action && (
            <Action
              fields={fields}
              setState={props.setState}
              status={props.status}
            />
          )}
        </div>
      )}
    </div>
  );
};
