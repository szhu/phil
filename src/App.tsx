import React, { Fragment, useEffect, useRef, useState } from "react";
import { Cell } from "./Cell";
import { CellState } from "./index";

function normalizeCellStates(cellStates: CellState[]): CellState[] {
  let i: number;
  for (i = cellStates.length - 1; i >= 0; i--) {
    if (cellStates[i].freeform.length > 0) {
      break;
    }
  }
  let indexOfLastCellWithContent = i;
  let targetLength = indexOfLastCellWithContent + 2;

  if (cellStates.length > targetLength) {
    return cellStates.slice(0, targetLength);
  } else if (cellStates.length < targetLength) {
    return [
      ...cellStates,
      {
        id: `${Math.random()}`,
        freeform: "",
        status: "freeform",
      },
    ];
  }
  return cellStates;
}

export function App() {
  const firstRun = useRef(true);
  const [cellStates, setCellStates] = useState<CellState[]>([
    {
      id: "1",
      status: "freeform",
      freeform: "",
    },
  ]);

  useEffect(() => {
    if (firstRun.current) {
      let savedState = localStorage.getItem("cellStates");
      if (savedState) {
        setCellStates(JSON.parse(savedState));
      }
      firstRun.current = false;
    } else {
      localStorage.setItem("cellStates", JSON.stringify(cellStates));
    }
  }, [cellStates]);

  function setCellStateById(id: string, state: CellState) {
    setCellStates((prev) =>
      normalizeCellStates(
        prev.map((cell) => (cell.id === id ? { ...cell, ...state } : cell)),
      ),
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
      {false && (
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
      )}
    </>
  );
}
