## advanced Redis (ระดับ production แล้ว)

SetArgs.Mode ใน Go (redis v9) = กำหนดเงื่อนไขก่อนจะ SET ค่า

```txt
ชื่อ       ความหมาย              ใช้สำหรับ
NX       ไม่มี key เท่านั้น         lock / booking
XX       ต้องมี key              update
IFEQ     ค่าเท่ากัน               ค่าเท่ากัน
IFNE     ค่าไม่เท่ากัน             conditional update
IFDEQ    deep equal            advanced
IFDNE    deep not equal        advanced

```

TTL = Time To Live (อายุของ key ใน Redis)

```go
const defaultHoldTTL = 2 * time.Minute

func (s *RedisStore) hold(b Booking) (Booking, error) {
	id := uuid.New().String()
	now := time.Now()
	ctx := context.Background()
	key := fmt.Sprintf("seat:%s:%s", b.MovieID, b.SeatID)
	b.ID = id
	val, _ := json.Marshal(b)

 res := 	s.rdb.SetArgs(ctx, key, val, redis.SetArgs{
		Mode: "NX", // set if not exists
		TTL:  defaultHoldTTL,
	}).Result()

	if err != nil {
		return Booking{}, err
	}
	if res != "OK" {
		return Booking{}, errors.New("seat already held")
	}


	return Booking{
		ID:        id,
		MovieID:   b.MovieID,
		SeatID:    b.SeatID,
		UserID:    b.UserID,
		Status:    "held",
		ExpiresAt: now.Add(defaultHoldTTL),
	}, nil
}
```
