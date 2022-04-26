import { css } from "@emotion/css";
import React, { Fragment, useState } from "react";
import { Cell } from "./Cell";
import { Button } from "./DesignSystem";
import { CellState } from "./index";
import { Timer } from "./Timer";
import useLocalStorage from "./useLocalStorage";

// https://stackoverflow.com/a/1349426/782045
function makeId(length: number) {
  var result = "";
  var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

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
        id: makeId(5),
        freeform: "",
        status: "freeform",
      },
    ];
  }
  return cellStates;
}

export function App() {
  const [cellStates, setCellStates] = useState<CellState[]>(
    normalizeCellStates([]),
  );

  useLocalStorage("cellStates", cellStates, setCellStates);

  function setCellStateById(id: string, state: Partial<CellState>) {
    setCellStates((prev) =>
      normalizeCellStates(
        prev.map((cell) => {
          if (cell.id === id) {
            console.log(cell, state);
          }
          return cell.id === id ? { ...cell, ...state } : cell;
        }),
      ),
    );
  }

  return (
    <>
      <div
        className={css`
          display: flex;
          flex-direction: row;
          justify-content: center;
          padding: 0.3em;
          position: sticky;
          top: 0;
          background: #eee;
          gap: 1em;
        `}
      >
        <Button
          onClick={() => {
            // change the status of all cell states from "freeform" to "candidate"
            setCellStates((prev) =>
              prev.map((cell) => ({
                ...cell,
                status:
                  cell.status === "freeform" && cell.freeform.length > 0
                    ? "candidate"
                    : cell.status,
              })),
            );
          }}
        >
          Do
        </Button>

        <Button
          onClick={() => {
            if (!confirm("Are you sure you want to clear all cell states?"))
              return;

            // remove all cells
            setCellStates(normalizeCellStates([]));
          }}
        >
          Reset
        </Button>
      </div>
      {cellStates.map((cellState) => {
        return (
          <Fragment key={cellState.id}>
            <Cell
              {...cellState}
              setState={(state) => {
                console.log(state);

                setCellStateById(cellState.id, {
                  ...state,
                });
              }}
            />
            <br />
            {/* <hr /> */}
          </Fragment>
        );
      })}
      <Timer />
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
