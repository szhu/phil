import React, { Fragment, useState } from "react";
import { Cell } from "./Cell";
import { CellState } from "./index";

export function App() {
  const [cellStates, setCellStates] = useState<CellState[]>([
    {
      id: "1",
      status: "freeform",
      freeform: "",
    },
  ]);

  function setCellStateById(id: string, state: CellState) {
    setCellStates((prev) =>
      prev.map((cell) => (cell.id === id ? { ...cell, ...state } : cell)),
    );
  }

  return (
    <>
      {cellStates.map((cellState) => {
        return (
          <Fragment key={cellState.id}>
            <Cell
              {...cellState}
              setState={(state) => {
                setCellStateById(cellState.id, {
                  ...cellState,
                  ...state,
                });
              }}
            />
            <hr />
          </Fragment>
        );
      })}
      <button
        type="button"
        onClick={() => {
          setCellStates([
            ...cellStates,
            {
              id: `${cellStates.length + 1}`,
              status: "freeform",
              freeform: "",
            },
          ]);
        }}
      >
        Add cell
      </button>
    </>
  );
}
