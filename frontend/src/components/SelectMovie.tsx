import type { JSX } from "react";
import type { ActiveSession, ConfirmSession } from "../types/movie.type";
import { LegendItem } from "./LegendItem";

type SelectMovieProps = {
  renderGrid: () => JSX.Element;
  activeSession: ActiveSession | null;
  timeLeft: number;
  confirmSeat: () => void;
  releaseSeat: () => void;
  status: { msg: string; type: string };
  confirmSession: ConfirmSession | null;
};

export const SelectMovie = ({
  renderGrid,
  activeSession,
  timeLeft,
  confirmSeat,
  releaseSeat,
  status,
  confirmSession,
}: SelectMovieProps) => {
  return (
    <div className="flex flex-wrap gap-8 justify-center    ">
      {/* Screen Area */}
      <div className="flex-1 min-w-[300px]">
        <div className="text-center text-sm text-gray-300 mb-2">Screen</div>
        <div className="flex justify-center">
          <div className="h-2 bg-gray-600 rounded-full my-5 shadow max-w-[70%] w-full" />
        </div>

        <div className="flex flex-col gap-2 items-center">{renderGrid()}</div>

        <div className="flex gap-4 justify-center mt-6 flex-wrap">
          <LegendItem color="#323232" label="Available" />
          <LegendItem color="#F6762A" label="Your hold" />
          <LegendItem color="#ef4444" label="Other hold" />
          <LegendItem color="#10b981" label="Confirmed" />
        </div>
      </div>

      {/* Checkout */}
      <div className=" ">
        {activeSession && confirmSession?.status !== "confirmed" ? (
          <div className="bg-neutral-800 p-6 rounded-lg flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Checkout</h3>

            <div className="text-sm text-gray-300">
              <span className="font-semibold">Seat:</span>{" "}
              {activeSession.seatId}
            </div>

            <div className="text-sm text-gray-300">
              <span className="font-semibold">Movie:</span>{" "}
              {activeSession.movieId}
            </div>

            <div
              className={`text-2xl font-bold text-center ${
                timeLeft < 60 ? "text-red-500" : "text-white"
              }`}
            >
              {Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, "0")}
              :{(timeLeft % 60).toString().padStart(2, "0")}
            </div>

            <button
              onClick={() => {
                console.log("confirm click state:", {
                  activeSession,

                  sessionId: activeSession?.sessionId,
                });

                confirmSeat();
              }}
              className="w-full py-2 rounded bg-emerald-500 font-semibold hover:bg-emerald-600 transition"
            >
              Confirm
            </button>

            <button
              onClick={releaseSeat}
              className="w-full py-2 rounded bg-neutral-600 font-semibold hover:bg-neutral-700 transition"
            >
              Release
            </button>
          </div>
        ) : status.msg ? (
          <div
            className={`p-4 rounded text-center text-sm font-medium ${
              status.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {status.msg}
          </div>
        ) : null}
      </div>
    </div>
  );
};
