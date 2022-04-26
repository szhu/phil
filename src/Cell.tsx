import { css } from "@emotion/css";
import React, { useEffect, useState } from "react";
import { ActionIcon, Button, Slot } from "./DesignSystem";
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
  timer2: {
    icon: "⏲",
    regex:
      /^(?<phrasing1>)(?<minutes>\d+)(?<phrasing2> ?(m|mini?n?u?t?e?s?) timer)$/,
    actionId: "timer",
    priority: 5,
  },
  shop1: {
    icon: "🛒",
    regex: /^add (?<item>[\s\S]*) to (my )?shopping list$/,
    actionId: "shop",
    priority: 5,
  },
  google1: {
    icon: "🔎",
    regex: /^google (?<query>[\s\S]*)$/,
    actionId: "google",
    priority: 5,
  },
  note1: {
    icon: "📝",
    regex: /^(note )?(?<input>[\s\S]*)$/,
    actionId: "note",
    priority: 1,
  },
  leave1: {
    icon: "✨",
    regex: /^(?<input>[\s\S]*)$/,
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
  freeform: CellState["freeform"];
}>;

const Actions: Record<string, Action> = {
  leave: ({ fields: { input }, status, setState }) => {
    return (
      <>
        <span>{input}</span> &nbsp;&nbsp;&nbsp;{" "}
        <Button
          // disabled={status === "executed"}
          onClick={() =>
            setState({
              status: status === "executed" ? "candidate" : "executed",
            })
          }
        >
          {status === "executed" ? "Completed" : "Mark done"}
        </Button>
      </>
    );
  },
  note: ({ fields: { input }, status, setState }) => {
    return (
      <>
        <div>
          add to notes: <Slot>{input}</Slot> &nbsp;&nbsp;&nbsp;{" "}
          <Button
            disabled={status === "executed"}
            onClick={() => setState({ status: "executed" })}
          >
            {status === "executed" ? "Added" : "Add"}
          </Button>
        </div>
      </>
    );
  },
  shop: ({ fields: { item }, status, setState }) => {
    return (
      <>
        <div>
          add <Slot>{item}</Slot> to shopping list? &nbsp;&nbsp;&nbsp;
          <Button
            disabled={status === "executed"}
            onClick={() => setState({ status: "executed" })}
          >
            {status === "executed" ? "Added" : "Add"}
          </Button>
        </div>
      </>
    );
  },
  google: ({ fields: { query } }) => {
    return (
      <>
        <div>
          google <Slot>{query}</Slot>
        </div>
        <div
          className={css`
            /* border: 2px solid blue; */
            display: block;
            height: 400px;
            width: 100%;
          `}
        >
          <iframe
            className={css`
              border: 1px dotted gray;
              /* border: 4px solid yellow; */
              display: block;
              transform-origin: 0 0;
              transform: scale(0.5);
              height: 200%;
              width: 200%;
              filter: grayscale(50%);
            `}
            src={
              "https://proxy-szhu.vercel.app/api/proxy?" +
              new URLSearchParams({
                url:
                  "https://www.google.com/search?" +
                  new URLSearchParams({ q: query }),
              })
            }
          ></iframe>
        </div>
      </>
    );
  },
  timer: ({ fields: { minutes, phrasing1, phrasing2 }, setState, status }) => {
    return (
      <>
        <div>
          {phrasing1}
          <Slot>{minutes}</Slot> {phrasing2} &nbsp;&nbsp;&nbsp;
          <Button
            disabled={status === "executed"}
            onClick={() => {
              (window as any).startTimer?.(+minutes * 60);
              setState({ status: "executed" });
            }}
          >
            {status === "executed" ? "Started" : "Start"}
          </Button>
          &nbsp;&nbsp;&nbsp;
          {status === "executed" && (
            <Button
              onClick={() => {
                (window as any).startTimer?.(0);
              }}
            >
              Stop timer
            </Button>
          )}
        </div>
      </>
    );
  },
};

const CssRow = css`
  /* border: 1px solid blue; */
  display: flex;
  flex-direction: row;
  align-items: top;
  gap: 16px;
`;

const CssRowLeft = css`
  /* background: red; */
  font-size: 1.5em;
  line-height: 24px;
  width: 24px;
  text-align: center;
  cursor: pointer;
`;

const CssRowRight = css`
  /* background: yellow; */
  line-height: 24px;
  flex-grow: 1;
  white-space: pre-wrap;
`;

const RawCell: React.FC<
  CellState & {
    setState: (state: Partial<CellState>) => void;
  }
> = (props) => {
  // console.log("rerender!", props.id);

  const [patternIds, setPatternIds] = useState<string[]>([]);

  let patternId: string = props.patternId;
  if (props.status === "candidate" && !patternIds.includes(props.patternId)) {
    patternId = undefined;
  }
  if (patternId == null) {
    patternId = patternIds[0];
  }

  const pattern = Patterns[patternId];
  // console.log(patternId, pattern);
  const Action = Actions[pattern?.actionId];
  const fields = pattern?.regex.exec(props.freeform)?.groups ?? {};

  const patterns = patternIds
    .map((id) => ({ ...Patterns[id], id }))
    // Get only first one for now
    .slice(0, 1);

  function updatePatterns() {
    const patternIds = Object.entries(Patterns)
      .filter(([, pattern]) => pattern.regex.test(props.freeform))
      .sort(
        ([, pattern1], [, pattern2]) => pattern2.priority - pattern1.priority,
      )
      .map(([id]) => id);
    setPatternIds(patternIds);
    props.setState({ patternId: patternIds[0] });
  }

  useEffect(() => {
    if (props.status === "candidate") {
      updatePatterns();
    }
  }, [props.status, props.freeform]);

  return (
    <div id={"cell-" + props.id}>
      <div
        className={css`
          opacity: 0;
          font-size: 10px;
          display: flex;
          flex-direction: row;
          gap: 1em;

          html.key-Alt.key-Meta & {
            opacity: 1;
          }
        `}
      >
        <Button
          onClick={() => {
            props.setState({ status: "candidate" });
          }}
        >
          Run
        </Button>
        <Button
          onClick={() => {
            props.setState({ status: "freeform" });
          }}
        >
          Edit
        </Button>
        status: {props.status}
      </div>

      {props.status === "freeform" ? (
        <div className={CssRow}>
          <ActionIcon
            className={CssRowLeft}
            onClick={() => props.setState({ status: "candidate" })}
            // onClick={() => props.setState({ patternId: pattern.id })}
            emoji={"✏"}
          />

          <textarea
            rows={1}
            className={css`
              ${CssRowRight}
              display: block;
              font-family: inherit;
              font-size: inherit;
              padding: 0;
              resize: none;
              width: 100%;
              border: none;

              &:focus {
                outline: none;
              }
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
        </div>
      ) : props.status === "candidate" ? (
        <div>
          <div className={CssRow}>
            <div className={CssRowLeft}>
              {patterns.map((pattern) => (
                <div key={pattern.id}>
                  <ActionIcon
                    emoji={pattern.icon}
                    // onClick={() => props.setState({ patternId: pattern.id })}
                    onClick={() => props.setState({ status: "freeform" })}
                  />
                </div>
              ))}
            </div>
            <div className={CssRowRight}>
              {Action && <Action fields={fields} {...props} />}
            </div>
          </div>
        </div>
      ) : props.status === "executed" ? (
        <div className={CssRow}>
          <ActionIcon
            className={CssRowLeft}
            emoji={pattern?.icon}
            onClick={() => props.setState({ status: "candidate" })}
          />

          <div className={CssRowRight}>
            {Action && <Action fields={fields} {...props} />}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const Cell = React.memo(RawCell, (prev, next) => {
  return JSON.stringify(prev) === JSON.stringify(next);
});
