-- ChessSudoku Puzzle App Database Schema (Clean Version)
-- PostgreSQL 12+ 호환
-- is_deleted 필드 제거 및 샘플 데이터 없이 스키마만 포함

-- ====================
-- 사용자 테이블
-- ====================
CREATE TABLE IF NOT EXISTS "user" (
    user_id VARCHAR(8) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    nickname VARCHAR(20) NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    CONSTRAINT idx_user_device_id UNIQUE (device_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_create_at ON "user" (create_at);


-- ====================
-- 퍼즐 테이블
-- ====================
CREATE TABLE IF NOT EXISTS "puzzle" (
    puzzle_id SERIAL PRIMARY KEY,
    puzzle_type VARCHAR(20) NOT NULL DEFAULT 'normal', -- Enum: normal, daily_challenge
    difficulty VARCHAR(10) NOT NULL DEFAULT 'easy', -- Enum: easy, medium, hard, expert
    puzzle_data JSONB NOT NULL, -- board [9][9], pieces [ {type, position} ]
    answer_data JSONB NOT NULL,
    daily_date DATE NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_puzzle_type ON "puzzle" (puzzle_type);
CREATE INDEX IF NOT EXISTS idx_puzzle_difficulty ON "puzzle" (difficulty);
CREATE INDEX IF NOT EXISTS idx_puzzle_daily_date ON "puzzle" (daily_date);
CREATE INDEX IF NOT EXISTS idx_puzzle_type_difficulty ON "puzzle" (puzzle_type, difficulty);

-- ====================
-- 퍼즐 기록 테이블
-- ====================
CREATE TABLE IF NOT EXISTS "puzzle_record" (
    record_id SERIAL,
    user_id VARCHAR(8) NOT NULL,
    puzzle_id INTEGER NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    solve_time INTEGER NOT NULL,
    hints_used INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (record_id, user_id, puzzle_id),
    CONSTRAINT FK_User_TO_PuzzleRecord_1 FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE,
    CONSTRAINT FK_Puzzle_TO_PuzzleRecord_1 FOREIGN KEY (puzzle_id) REFERENCES "puzzle" (puzzle_id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_puzzle_record_user_id ON "puzzle_record" (user_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_record_puzzle_id ON "puzzle_record" (puzzle_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_record_create_at ON "puzzle_record" (create_at);
CREATE INDEX IF NOT EXISTS idx_puzzle_record_solve_time ON "puzzle_record" (solve_time);
CREATE INDEX IF NOT EXISTS idx_puzzle_record_hints_used ON "puzzle_record" (hints_used);

-- ====================
-- 뷰: 사용자별 통계 (성능 최적화용)
-- ====================
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.user_id,
    u.device_id,
    u.nickname,
    u.create_at,
    COALESCE(stats.total_puzzles, 0) as total_puzzles,
    COALESCE(stats.total_time, 0) as total_time,
    COALESCE(stats.avg_time, 0) as avg_time,
    COALESCE(stats.best_time, 0) as best_time,
    COALESCE(stats.total_hints, 0) as total_hints,
    COALESCE(stats.avg_hints, 0) as avg_hints
FROM "user" u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_puzzles,
        SUM(solve_time) as total_time,
        AVG(solve_time) as avg_time,
        MIN(solve_time) as best_time,
        SUM(hints_used) as total_hints,
        AVG(hints_used) as avg_hints
    FROM "puzzle_record" 
    GROUP BY user_id
) stats ON u.user_id = stats.user_id;
