export type Movie = {
  id: string;
  title: string;
  rows: number;
  seats_per_row: number;
};

export type Seat = {
  seatId: string;
  status: string;
  userId?: string;
  sessionId?: string;
  booked?: boolean;
  confirmed?: boolean;
};

export type ActiveSession = {
  sessionId: string;
  movieId: string;
  seatId: string;
  expiresAt: string;
};

export type Status = {
  msg: string;
  type: "success" | "error" | "";
};

export type LegendItemProps = {
  color: string;
  label: string;
};

export type ConfirmSession = {
  sessionId?: string;
  movieId: string;
  seatId: string;
  userId: string;
  status: string;
};
