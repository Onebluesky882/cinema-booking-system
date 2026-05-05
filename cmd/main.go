package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/Onebluesky882/cinema-booking-system/internal/adapters/redis"
	"github.com/Onebluesky882/cinema-booking-system/internal/booking"
	"github.com/Onebluesky882/cinema-booking-system/internal/utils"
)

func main() {
	mux := http.NewServeMux()

	// -------------------------
	// API HANDLERS (FIRST)
	// -------------------------
	mux.HandleFunc("GET /movies", listMovies)

	store := booking.NewRedisStore(redis.NewClient("localhost:6379"))
	svc := booking.NewService(store)
	bookingHandler := booking.NewHandler(svc)

	mux.HandleFunc("GET /movies/{movieID}/seats", bookingHandler.HandleListBookings)
	mux.HandleFunc("POST /movies/{movieID}/seats/{seatID}/hold", bookingHandler.HandleHoldSeat)
	mux.HandleFunc("PUT /sessions/{sessionID}/confirm", bookingHandler.ConfirmSession)
	mux.HandleFunc("DELETE /sessions/{sessionID}", bookingHandler.ReleaseSession)

	// -------------------------
	// STATIC FILES (LAST)
	// -------------------------
	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))

	// optional: root serve index.html
	mux.Handle("/", http.FileServer(http.Dir("./static")))

	// -------------------------
	// SERVER
	// -------------------------
	srv := &http.Server{
		Addr:    ":8012",
		Handler: loggingMiddleware(mux),
	}

	go func() {
		log.Println("🚀 server running on :8012")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	// -------------------------
	// GRACEFUL SHUTDOWN
	// -------------------------
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	log.Println("🛑 shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_ = srv.Shutdown(ctx)
}

// -------------------------
// MOVIES HANDLER
// -------------------------
func listMovies(w http.ResponseWriter, r *http.Request) {
	utils.WriteJSON(w, http.StatusOK, booking.Movies)
}

// -------------------------
// DEBUG MIDDLEWARE (IMPORTANT)
// -------------------------
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("➡️ %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}
