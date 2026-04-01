package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /movies", listMovies)
	mux.Handle("/", http.FileServer(http.Dir("static")))
	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))
	srv := &http.Server{
		Addr:    ":8000",
		Handler: mux,
	}

	go func() {
		log.Println("server running on :8000")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()
	// 👇 handle shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	log.Println("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	srv.Shutdown(ctx)
}

var movies = []movieResponse{
	{ID: "inception", Title: "Inception", Rows: 5, SeatsPerRow: 8},
	{ID: "dune", Title: "Dune: Part Two", Rows: 4, SeatsPerRow: 6},
}

func listMovies(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, movies)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(v); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

type movieResponse struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Rows        int    `json:"rows"`
	SeatsPerRow int    `json:"seats_per_row"`
}
