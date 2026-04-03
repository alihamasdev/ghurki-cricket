# Player Rating System

Ratings are split across three departments: **Batting (40%)**, **Bowling (40%)**, **Fielding (20%)**.

Each department's raw score is scaled relative to the best performer in that department — so the best batter gets 400 batting points, everyone else is proportional. There is no upper limit on total rating; it grows as more stats are added.

Run this in Supabase SQL Editor to recalculate anytime after a CSV import:

```sql
SELECT recalculate_ratings();
```

---

## Batting

| Metric                                 | Points | Applied              |
| -------------------------------------- | ------ | -------------------- |
| Strike Rate > 200                      | +15    | flat, career overall |
| Strike Rate 160–200                    | +10    | flat, career overall |
| Strike Rate 140–160                    | +4     | flat, career overall |
| Strike Rate 100–140                    | +2     | flat, career overall |
| Strike Rate < 100                      | -15    | flat, career overall |
| Fifty (50+ runs)                       | +50    | × count              |
| Thirty (30+ runs)                      | +20    | × count              |
| Six                                    | +4     | × count              |
| Four                                   | +2     | × count              |
| Duck                                   | -10    | × count              |
| Ducks > 1 in a day                     | -8     | per day              |
| No boundary in a day (10+ balls faced) | -10    | per day              |
| 100+ runs in a day                     | +30    | per day              |

> SR is calculated on career totals (total runs / total balls × 100), applied as a single flat bonus/penalty.

---

## Bowling

| Metric                              | Points | Applied              |
| ----------------------------------- | ------ | -------------------- |
| Economy < 8                         | +15    | flat, career overall |
| Economy 8–10                        | +10    | flat, career overall |
| Economy 10–13                       | +4     | flat, career overall |
| Economy 13–16                       | +2     | flat, career overall |
| Economy > 16                        | -15    | flat, career overall |
| Wicket                              | +8     | × count              |
| 2-wicket haul (2fr)                 | +15    | × count              |
| 3-wicket haul (3fr)                 | +25    | × count              |
| Dot ball                            | +1     | × count              |
| Wide                                | -1     | × count              |
| No-ball                             | -5     | × count              |
| Wicketless spell (12+ balls bowled) | -10    | per day              |
| 2+ no-balls in a day                | -10    | per day              |
| 5+ wickets in a day                 | +30    | per day              |

> Economy is calculated on career totals (total runs / total balls × 6), applied as a single flat bonus/penalty.

---

## Fielding

| Metric  | Points | Applied |
| ------- | ------ | ------- |
| Catch   | +8     | × count |
| Run-out | +12    | × count |

---

## How Scaling Works

1. Raw points are calculated for every player in each department.
2. The player with the highest raw score in a department sets the ceiling (400 / 400 / 200).
3. Every other player is scaled proportionally: `(player_raw / max_raw) × dept_cap`.
4. Negative raw scores are clamped to 0 before scaling (a player can't subtract from others).
5. Final rating = batting scaled + bowling scaled + fielding scaled.

---

## Database Functions & Triggers

### Attendance Trigger

Fires automatically after every INSERT into the `fielding` table. Increments `players.attendance` by 1 for the inserted player.

```sql
CREATE OR REPLACE FUNCTION increment_attendance_on_fielding()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE players
  SET attendance = attendance + 1
  WHERE name = NEW."playerId";

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_attendance ON fielding;

CREATE TRIGGER trg_increment_attendance
AFTER INSERT ON fielding
FOR EACH ROW
EXECUTE FUNCTION increment_attendance_on_fielding();
```

---

### Rating Recalculation Function

Run manually in Supabase SQL Editor after every CSV import:

```sql
SELECT recalculate_ratings();
```

Full function definition:

```sql
CREATE OR REPLACE FUNCTION recalculate_ratings()
RETURNS void AS $$
DECLARE
  max_bat   NUMERIC;
  max_bowl  NUMERIC;
  max_field NUMERIC;
BEGIN

  -- ── BATTING ──
  CREATE TEMP TABLE IF NOT EXISTS _bat_raw (player TEXT, raw NUMERIC) ON COMMIT DROP;
  TRUNCATE _bat_raw;

  INSERT INTO _bat_raw
  SELECT
    "playerId",
    -- Per-occurrence
    (SUM(fifties)  * 50)
    + (SUM(thirties) * 20)
    + (SUM(sixes)    * 4)
    + (SUM(fours)    * 2)
    - (SUM(ducks)    * 10)
    -- Per-day: ducks > 1 in a day → -8
    + (SELECT COUNT(*) * -8 FROM batting b2 WHERE b2."playerId" = batting."playerId" AND b2.ducks > 1)
    -- Per-day: no boundary (0 fours AND 0 sixes, 10+ balls) → -10
    + (SELECT COUNT(*) * -10 FROM batting b2 WHERE b2."playerId" = batting."playerId" AND b2.fours = 0 AND b2.sixes = 0 AND b2.balls >= 10)
    -- Per-day: 100+ runs in a day → +30
    + (SELECT COUNT(*) * 30 FROM batting b2 WHERE b2."playerId" = batting."playerId" AND b2.runs >= 100)
    -- Overall career SR (flat, once)
    + CASE
        WHEN SUM(balls) >= 10 AND (SUM(runs)::NUMERIC / SUM(balls)) * 100 > 200  THEN 15
        WHEN SUM(balls) >= 10 AND (SUM(runs)::NUMERIC / SUM(balls)) * 100 >= 160 THEN 10
        WHEN SUM(balls) >= 10 AND (SUM(runs)::NUMERIC / SUM(balls)) * 100 >= 140 THEN 4
        WHEN SUM(balls) >= 10 AND (SUM(runs)::NUMERIC / SUM(balls)) * 100 >= 100 THEN 2
        WHEN SUM(balls) >= 10                                                      THEN -15
        ELSE 0
      END
  FROM batting
  GROUP BY "playerId";

  -- ── BOWLING ──
  CREATE TEMP TABLE IF NOT EXISTS _bowl_raw (player TEXT, raw NUMERIC) ON COMMIT DROP;
  TRUNCATE _bowl_raw;

  INSERT INTO _bowl_raw
  SELECT
    "playerId",
    -- Per-occurrence
    (SUM(wickets)     * 8)
    + (SUM("2fr")     * 15)
    + (SUM("3fr")     * 25)
    + (SUM(dots)      * 1)
    - (SUM(wides)     * 1)
    - (SUM("noBalls") * 5)
    -- Per-day: wicketless spell (bowled but 0 wickets) → -10
    + (SELECT COUNT(*) * -10 FROM bowling bw2 WHERE bw2."playerId" = bowling."playerId" AND bw2.balls > 0 AND bw2.wickets = 0)
    -- Per-day: 2+ no-balls in a day → -10
    + (SELECT COUNT(*) * -10 FROM bowling bw2 WHERE bw2."playerId" = bowling."playerId" AND bw2."noBalls" >= 2)
    -- Per-day: 5+ wickets in a day → +30
    + (SELECT COUNT(*) * 30 FROM bowling bw2 WHERE bw2."playerId" = bowling."playerId" AND bw2.wickets >= 5)
    -- Overall career economy (flat, once)
    + CASE
        WHEN SUM(balls) >= 6 AND (SUM(runs)::NUMERIC / SUM(balls)) * 6 < 8   THEN 15
        WHEN SUM(balls) >= 6 AND (SUM(runs)::NUMERIC / SUM(balls)) * 6 < 10  THEN 10
        WHEN SUM(balls) >= 6 AND (SUM(runs)::NUMERIC / SUM(balls)) * 6 <= 13 THEN 4
        WHEN SUM(balls) >= 6 AND (SUM(runs)::NUMERIC / SUM(balls)) * 6 <= 16 THEN 2
        WHEN SUM(balls) >= 6                                                   THEN -15
        ELSE 0
      END
  FROM bowling
  GROUP BY "playerId";

  -- ── FIELDING ──
  CREATE TEMP TABLE IF NOT EXISTS _field_raw (player TEXT, raw NUMERIC) ON COMMIT DROP;
  TRUNCATE _field_raw;

  INSERT INTO _field_raw
  SELECT
    "playerId",
    (SUM(catches)     * 8)
    + (SUM("runOuts") * 12)
  FROM fielding
  GROUP BY "playerId";

  -- ── Max per department ──
  SELECT COALESCE(MAX(GREATEST(raw, 0)), 1) INTO max_bat   FROM _bat_raw;
  SELECT COALESCE(MAX(GREATEST(raw, 0)), 1) INTO max_bowl  FROM _bowl_raw;
  SELECT COALESCE(MAX(GREATEST(raw, 0)), 1) INTO max_field FROM _field_raw;

  -- ── Scale and update ──
  UPDATE players p
  SET rating = ROUND(
      COALESCE((SELECT GREATEST(b.raw, 0) / max_bat   * 400 FROM _bat_raw   b WHERE b.player = p.name), 0)
    + COALESCE((SELECT GREATEST(w.raw, 0) / max_bowl  * 400 FROM _bowl_raw  w WHERE w.player = p.name), 0)
    + COALESCE((SELECT GREATEST(f.raw, 0) / max_field * 200 FROM _field_raw f WHERE f.player = p.name), 0)
  );

END;
$$ LANGUAGE plpgsql;
```
