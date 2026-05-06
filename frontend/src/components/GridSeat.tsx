import React, { useMemo, useCallback } from "react";
import type { ActiveSession, ConfirmSession, Seat } from "../types/movie.type";

type Props = {
  selectedMovie: any;
  seats: Seat[];
  activeSession: ActiveSession | null;
  confirmSession: ConfirmSession | null;
  holdSeat: (seatId: string) => void;
  USER_ID: string;
};

export const RenderGrid = ({
  selectedMovie,
  seats,
  activeSession,
  confirmSession,
  holdSeat,
  USER_ID,
}: Props) => {
  if (!selectedMovie) return null;

  const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // ✅ memo ป้องกัน rebuild ทุก render
  const statusMap = useMemo(() => {
    return Object.fromEntries(seats.map((s) => [s.seatId, s]));
  }, [seats]);

  // ✅ กัน function เปลี่ยนทุก render
  const handleHoldSeat = useCallback(
    (seatId: string) => {
      console.log("seatId:", seatId);
      holdSeat(seatId);
    },
    [holdSeat],
  );

  return Array.from({ length: selectedMovie.rows }).map((_, r) => {
    const rowLabel = rows[r];

    return (
      <div
        key={rowLabel}
        className="flex items-center gap-1 max-sm:ml-6 justify-center"
      >
        {/* ซ้าย */}
        <div className="sm:w-8 max-sm:w-4 text-center text-xs text-gray-400">
          {rowLabel}
        </div>

        {/* seats */}
        {Array.from({ length: selectedMovie.seats_per_row }).map((_, i) => {
          const seatId = `${rowLabel}${i + 1}`;
          const info = statusMap[seatId];

          const normalize = (v?: string) => v?.trim().toUpperCase();

          const isMyHold =
            normalize(activeSession?.seatId) === normalize(seatId) &&
            activeSession?.movieId === selectedMovie.id;

          const confirmed =
            normalize(confirmSession?.seatId) === normalize(seatId) &&
            confirmSession?.status === "confirmed" &&
            confirmSession?.movieId === selectedMovie.id;

          return (
            <Seat
              key={seatId}
              seatId={seatId}
              info={info}
              isMyHold={isMyHold}
              confirmed={confirmed}
              USER_ID={USER_ID}
              onClick={() => handleHoldSeat(seatId)}
            />
          );
        })}

        {/* ขวา */}
        <div className="w-6 text-center text-xs text-gray-400">{rowLabel}</div>
      </div>
    );
  });
};

type SeatProps = {
  seatId: string;
  info: Seat | undefined;
  isMyHold: boolean;
  confirmed: boolean;
  onClick: () => void;
  USER_ID: string;
};

const Seat = React.memo(
  ({ seatId, info, isMyHold, confirmed, onClick, USER_ID }: SeatProps) => {
    let cls =
      "w-9 h-9 rounded text-xs flex items-center justify-center cursor-pointer bg-neutral-700";

    // ✅ priority ถูกต้อง

    if (confirmed) {
      cls = cls.replace("bg-neutral-700", "bg-emerald-500 cursor-not-allowed");
    } else if (isMyHold) {
      cls = cls.replace("bg-neutral-700", "bg-[#F6762A]");
    } else if (info?.booked && info.userId === USER_ID) {
      cls = cls.replace("bg-neutral-700", "bg-blue-500");
    }
    return (
      <button className={cls} onClick={onClick}>
        {seatId}
      </button>
    );
  },
);
