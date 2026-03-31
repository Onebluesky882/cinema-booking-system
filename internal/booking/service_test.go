package booking

import (
	"sync"
	"sync/atomic"
	"testing"

	"github.com/google/uuid"
)

func TestConcurentBooking_ExactlyOneWins(t *testing.T) {
	store := NewMemoryStore()
	svc := NewService(store)

	const numGoroutines = 100_000

	var (
		wg        sync.WaitGroup
		successes atomic.Int64
		failures  atomic.Int64
	)

	wg.Add(numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func() {
			defer wg.Done()

			_, err := svc.Book(Booking{
				MovieID: "screen-1",
				SeatID:  "a1",
				UserID:  uuid.New().String(),
			})

			if err == nil {
				successes.Add(1)
			} else {
				failures.Add(1)
			}
		}()
	}

	wg.Wait()

	if successes.Load() != 1 {
		t.Fatalf("expected 1 success, got %d", successes.Load())
	}

	if failures.Load() != numGoroutines-1 {
		t.Fatalf("expected %d failures, got %d",
			numGoroutines-1,
			failures.Load())
	}
}
