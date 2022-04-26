import { css } from "@emotion/css";
import React, { useEffect, useState } from "react";
import { CellState } from "./index";

const Patterns = {
  test: {
    patternId: "test",
    regex: /test/,
    fieldNames: [],
    actionId: null,
    priority: 1,
  },
};

export const Cell: React.FC<
  CellState & {
    setState: (state: Partial<CellState>) => void;
  }
> = (props) => {
  const [patternIds, setPatternIds] = useState<string[]>([]);

  useEffect(() => {
    if (props.status === "candidate") {
      setPatternIds(
        Object.values(Patterns)
          .filter((pattern) => pattern.regex.test(props.freeform))
          .map((pattern) => pattern.patternId),
      );

      // setCandidates(props.patternId ? [props.patternId] : []);
    }
  }, [props.status]);

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
      {props.status === "candidate" && (
        <div>
          <div
            className={css`
              display: flex;
              flex-direction: row;
            `}
          >
            <div>
              {patternIds.map((patternId) => (
                <div key={patternId}>
                  <button
                    type="button"
                    onClick={() => {
                      props.setState({ patternId });
                    }}
                  >
                    {patternId}
                  </button>
                </div>
              ))}
            </div>
            <div>right</div>
          </div>
        </div>
      )}
    </div>
  );
};
