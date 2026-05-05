import { useState, useEffect, useCallback } from "react";
import "./App.css";

const USER_ID = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

// --- 1. กำหนด Interfaces สำหรับ TypeScript ---
interface Movie {
  id: string;
  title: string;
  rows: number;
  seats_per_row: number;
}

interface Seat {
  seat_id: string;
  status: string;
  user_id?: string;
  session_id?: string;
  booked?: boolean;
  confirmed?: boolean;
}

interface ActiveSession {
  sessionID: string;
  movieID: string;
  seatID: string;
  expiresAt: string;
}

interface Status {
  msg: string;
  type: "success" | "error" | "";
}

function App() {
  // --- 2. ระบุ Types ให้กับ State ---
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );
  const [seats, setSeats] = useState<Seat[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<Status>({ msg: "", type: "" });

  const holdSeat = async (seatID: string) => {
    if (activeSession || !selectedMovie) return;

    try {
      const data = await api(
        "POST",

        `/movies/${selectedMovie.id}/seats/${seatID}/hold`,

        { user_id: USER_ID },
      );

      console.log("hold success:", data);

      // 1. set session

      setActiveSession({
        sessionID: data.session_id,

        movieID: data.movie_id,

        seatID: data.seat_id,

        expiresAt: data.expires_at,
      });

      // 2. 🔥 IMPORTANT: update seats immediately (UI change now)

      setSeats((prev) =>
        prev.map((s) =>
          s.seat_id === seatID
            ? {
                ...s,

                booked: true,

                user_id: USER_ID,

                session_id: data.session_id,

                confirmed: false,
              }
            : s,
        ),
      );
    } catch (err: any) {
      setStatus({ msg: err.message, type: "error" });
    }
  };

  const holdSeat = async (seatID: string) => {
    if (activeSession || !selectedMovie) return;

    try {
      const data = await api(
        "POST",

        `/movies/${selectedMovie.id}/seats/${seatID}/hold`,

        { user_id: USER_ID },
      );

      console.log("hold success:", data);

      // 1. set session

      setActiveSession({
        sessionID: data.session_id,

        movieID: data.movie_id,

        seatID: data.seat_id,

        expiresAt: data.expires_at,
      });

      // 2. 🔥 IMPORTANT: update seats immediately (UI change now)

      setSeats((prev) =>
        prev.map((s) =>
          s.seat_id === seatID
            ? {
                ...s,

                booked: true,

                user_id: USER_ID,

                session_id: data.session_id,

                confirmed: false,
              }
            : s,
        ),
      );
    } catch (err: any) {
      setStatus({ msg: err.message, type: "error" });
    }
  };
  // --- 3. API Wrapper (แก้ไข Syntax และเพิ่ม Types) ---
  const api = async (method: string, path: string, body?: any) => {
    const opts: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const r = await fetch(path, opts);
    if (r.status === 204) return null;
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  // --- Initial Load ---
  useEffect(() => {
    api("GET", "/movies")
      .then((data) => setMovies(data))
      .catch((err) => console.error(err));
  }, []);

  // --- Seat Polling ---
  const fetchSeats = useCallback(() => {
    if (!selectedMovie) return;
    api("GET", `/movies/${selectedMovie.id}/seats`).then((data: Seat[]) => {
      const normalized = data.map((s) => ({
        ...s,
        booked: !!s.session_id,
        confirmed: s.status === "confirmed",
      }));
      setSeats(normalized);
    });
  }, [selectedMovie]);

  useEffect(() => {
    fetchSeats();
    const interval = setInterval(fetchSeats, 2000);
    return () => clearInterval(interval);
  }, [fetchSeats]);

  // --- Timer Logic ---
  useEffect(() => {
    let timer: number | undefined;
    if (activeSession) {
      const updateTimer = () => {
        const remaining = Math.max(
          0,
          Math.floor(
            (new Date(activeSession.expiresAt).getTime() - Date.now()) / 1000,
          ),
        );
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setActiveSession(null);
          fetchSeats();
          setStatus({ msg: "Hold expired", type: "error" });
        }
      };
      updateTimer();
      timer = window.setInterval(updateTimer, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession, fetchSeats]);

  // --- Handlers ---
  const handleSelectMovie = async (movie: Movie) => {
    if (activeSession) {
      await api("DELETE", `/sessions/${activeSession.sessionID}`, {
        user_id: USER_ID,
      }).catch(() => {});
    }
    setSelectedMovie(movie);
    setActiveSession(null);
    setStatus({ msg: "", type: "" });
  };

  const holdSeat = async (seatID: string) => {
    if (activeSession || !selectedMovie) return;
    try {
      const data = await api(
        "POST",
        `/movies/${selectedMovie.id}/seats/${seatID}/hold`,
        { user_id: USER_ID },
      );
      setActiveSession({
        sessionID: data.session_id,
        movieID: data.movie_id,
        seatID: data.seat_id,
        expiresAt: data.expires_at,
      });
      fetchSeats();
    } catch (err: any) {
      setStatus({ msg: err.message, type: "error" });
    }
  };

  const confirmSeat = async () => {
    if (!activeSession) return;
    try {
      await api("PUT", `/sessions/${activeSession.sessionID}/confirm`, {
        user_id: USER_ID,
      });
      setActiveSession(null);
      fetchSeats();
      setStatus({ msg: "Confirmed!", type: "success" });
    } catch (err: any) {
      setStatus({ msg: err.message, type: "error" });
    }
  };

  const releaseSeat = async () => {
    if (!activeSession) return;
    try {
      await api("DELETE", `/sessions/${activeSession.sessionID}`, {
        user_id: USER_ID,
      });
      setActiveSession(null);
      fetchSeats();
    } catch (err: any) {
      setStatus({ msg: err.message, type: "error" });
    }
  };

  // --- Render Helpers ---
  const renderGrid = () => {
    if (!selectedMovie) return null;
    const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const grid = [];
    const statusMap = Object.fromEntries(seats.map((s) => [s.seat_id, s]));

    for (let r = 0; r < selectedMovie.rows; r++) {
      const rowSeats = [];
      const rowLabel = rows[r];
      for (let s = 1; s <= selectedMovie.seats_per_row; s++) {
        const seatID = `${rowLabel}${s}`;
        const info = statusMap[seatID];
        let className = "seat";
        if (info?.confirmed) className += " seat--confirmed";
        else if (info?.booked && info.user_id === USER_ID)
          className += " seat--held-mine";
        else if (info?.booked) className += " seat--held-other";

        rowSeats.push(
          <button
            key={seatID}
            className={className}
            onClick={() => holdSeat(seatID)}
          >
            {s}
          </button>,
        );
      }
      grid.push(
        <div key={rowLabel} className="seat-row">
          <div className="row-label">{rowLabel}</div>
          {rowSeats}
          <div className="row-label">{rowLabel}</div>
        </div>,
      );
    }
    return grid;
  };

  return (
    <div className="app">
      <header>
        <h1>Cinema Booking</h1>
        <div className="user-id">user: {USER_ID}</div>
      </header>

      <div className="movies">
        {movies.map((m) => (
          <div
            key={m.id}
            className={`movie-card ${selectedMovie?.id === m.id ? "selected" : ""}`}
            onClick={() => handleSelectMovie(m)}
          >
            <h3>{m.title}</h3>
            <p>
              {m.rows} rows × {m.seats_per_row} seats
            </p>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <div className="content">
          <div className="screen-area">
            <div className="screen-label" style={{ textAlign: "center" }}>
              Screen
            </div>
            <div className="screen-bar"></div>
            <div className="seat-grid">{renderGrid()}</div>

            <div className="legend">
              <LegendItem color="var(--available)" label="Available" />
              <LegendItem color="var(--held-mine)" label="Your hold" />
              <LegendItem color="var(--held-other)" label="Other hold" />
              <LegendItem color="var(--confirmed)" label="Confirmed" />
            </div>
          </div>

          <div className="checkout-area">
            {activeSession ? (
              <div className="checkout">
                <h3>Checkout</h3>
                <div className="checkout-info">
                  <span>Seat:</span> {activeSession.seatID}
                </div>
                <div className="checkout-info">
                  <span>Movie:</span> {activeSession.movieID}
                </div>
                <div className={`timer ${timeLeft < 60 ? "urgent" : ""}`}>
                  {Math.floor(timeLeft / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(timeLeft % 60).toString().padStart(2, "0")}
                </div>
                <button className="btn btn--confirm" onClick={confirmSeat}>
                  Confirm
                </button>
                <button className="btn btn--release" onClick={releaseSeat}>
                  Release
                </button>
              </div>
            ) : status.msg ? (
              <div className="checkout">
                <div className={`status-msg ${status.type}`}>{status.msg}</div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// --- 4. เพิ่ม Types ให้ Props ของ LegendItem ---
interface LegendItemProps {
  color: string;
  label: string;
}

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className="legend-item">
      <div className="legend-swatch" style={{ background: color }}></div>
      {label}
    </div>
  );
}

export default App;
