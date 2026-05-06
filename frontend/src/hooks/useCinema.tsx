import { useState } from "react";
import { toCamelCase } from "../utils/transformString";
import type {
  ActiveSession,
  ConfirmSession,
  Movie,
  Seat,
  Status,
} from "../types/movie.type";

export const useCinema = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [status, setStatus] = useState<Status>({ msg: "", type: "" });

  const [confirmSession, setConfirmSession] = useState<ConfirmSession | null>(
    null,
  );
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const api = async (method: string, path: string, body?: any) => {
    const r = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (r.status === 204) return null;
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  const holdSeat = async (seatID: string, userId: string) => {
    if (activeSession || !selectedMovie) return;

    try {
      const data = await api(
        "POST",
        `/movies/${selectedMovie.id}/seats/${seatID}/hold`,
        { user_id: userId },
      );
      const transformedSession = toCamelCase(data);
      setActiveSession({
        sessionId: transformedSession.sessionId,
        movieId: transformedSession.movieId,
        seatId: transformedSession.seatId,
        expiresAt: transformedSession.expiresAt,
      });
    } catch (err: any) {
      setStatus({ msg: err.message, type: "error" });
    }
  };

  const handleSelectMovie = async (movie: Movie, userId: string) => {
    if (activeSession) {
      await api("DELETE", `/sessions/${activeSession.sessionId}`, {
        user_id: userId,
      }).catch(() => {});
    }
    setSelectedMovie(movie);
    setActiveSession(null);
    setStatus({ msg: "", type: "" });
  };

  const confirmBooking = async (userId: string) => {
    if (!activeSession) {
      console.log("❌ no activeSession");

      return;
    }
    try {
      setStatus({ msg: "Confirming...", type: "success" });

      const data = await api(
        "PUT",

        `/sessions/${activeSession.sessionId}/confirm`,

        {
          user_id: userId,
        },
      );

      const transformed = toCamelCase(data);

      setConfirmSession(transformed);

      await fetchSeats();

      setStatus({ msg: "Confirmed!", type: "success" });
    } catch (err: any) {
      setStatus({ msg: err.message || "Confirm failed", type: "error" });
    }
  };

  const releaseSeat = async (userId: string) => {
    if (!activeSession) return;
    try {
      await api("DELETE", `/sessions/${activeSession.sessionId}`, {
        user_id: userId,
      });
      setActiveSession(null);
      fetchSeats();
    } catch (err: any) {
      setStatus({ msg: err.message, type: "error" });
    }
  };

  const fetchSeats = async () => {
    if (!selectedMovie) return;

    try {
      const res = await api("GET", `/movies/${selectedMovie.id}/seats`);

      const rawSeats = res?.data ?? res ?? [];

      const seatsArray = Array.isArray(rawSeats)
        ? rawSeats
        : (rawSeats?.seats ?? []);

      if (seatsArray.length === 0) {
        setSeats([]);
        return;
      }

      const transformed = seatsArray.map((s: any) => toCamelCase(s));

      setSeats(
        transformed.map((s: any) => ({
          ...s,
          booked: !!s.sessionId,
          confirmed: s.status === "confirmed",
        })),
      );
    } catch (error) {
      console.error("fetchSeats error:", error);
      setSeats([]); // fallback กัน UI ค้าง
    }
  };
  return {
    holdSeat,
    api,
    selectedMovie,
    setSelectedMovie,
    activeSession,
    setActiveSession,
    status,
    setStatus,
    handleSelectMovie,
    confirmBooking,
    releaseSeat,
    seats,
    setSeats,
    fetchSeats,
    confirmSession,
    setConfirmSession,
  };
};
