import { useState, useEffect, useMemo, useRef } from "react";
import type { Movie } from "./types/movie.type";
import { SelectMovie } from "./components/SelectMovie";
import { useCinema } from "./hooks/useCineMa";
import { RenderGrid } from "./components/GridSeat";

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const {
    api,
    holdSeat,
    selectedMovie,
    activeSession,
    setActiveSession,
    status,
    setStatus,
    handleSelectMovie,
    seats,
    confirmBooking,
    releaseSeat,
    fetchSeats,
    confirmSession,
  } = useCinema();

  useEffect(() => {
    api("GET", "/movies")
      .then((data) => {
        setMovies(data);
      })

      .catch(console.error);
  }, []);

  console.log("movies ", movies);
  useEffect(() => {
    if (!activeSession) return;
    const update = () => {
      const remaining = Math.max(
        0,
        Math.floor(
          (new Date(activeSession.expiresAt).getTime() - Date.now()) / 1000,
        ),
      );

      setTimeLeft(remaining);

      if (remaining <= 0) {
        setActiveSession(null);

        setStatus({ msg: "Hold expired", type: "error" });
      }
    };

    update();

    const timer = window.setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  const USER_ID = useMemo(
    () => crypto.randomUUID().replace(/-/g, "").slice(0, 12),
    [],
  );
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!selectedMovie) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      fetchSeats();
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedMovie]);

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 flex flex-col ">
      <header className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-md font-bold">Cinema Booking</h1>
        <div className="font-mono bg-neutral-800 px-3 py-1 rounded">
          user: {USER_ID}
        </div>
      </header>

      {/* CENTER WRAPPER */}
      <div className=" flex items-center justify-center   ">
        <div className="flex flex-col border rounded-xl border-gray-700 bg-neutral-800/50 w-full max-w-5xl p-4">
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {movies.map((m) => (
              <div
                key={m.id}
                onClick={() => handleSelectMovie(m, USER_ID)}
                className={`p-4 rounded border cursor-pointer transition bg-neutral-800 hover:bg-neutral-700 ${
                  selectedMovie?.id === m.id
                    ? "border-blue-500"
                    : "border-neutral-700"
                }`}
              >
                <p className="font-semibold text-sm">{m.title}</p>
                <p className="text-sm text-gray-400">
                  {m.rows} rows × {m.seats_per_row} seats
                </p>
              </div>
            ))}
          </div>

          {selectedMovie && (
            <SelectMovie
              confirmSession={confirmSession}
              renderGrid={() => (
                <RenderGrid
                  selectedMovie={selectedMovie}
                  seats={seats}
                  activeSession={activeSession}
                  confirmSession={confirmSession}
                  holdSeat={(seatID) => holdSeat(seatID, USER_ID)}
                  USER_ID={USER_ID}
                />
              )}
              activeSession={activeSession}
              timeLeft={timeLeft}
              confirmSeat={() => confirmBooking(USER_ID)}
              releaseSeat={() => releaseSeat(USER_ID)}
              status={status}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
