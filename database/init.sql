-- ChessSudoku Puzzle App Database Schema
-- PostgreSQL 12+ 호환

-- 데이터베이스 생성 (이미 존재하면 무시)
-- CREATE DATABASE chessudoku;

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
    difficulty VARCHAR(10) NOT NULL DEFAULT 'Easy', -- Enum: Easy, Medium, Hard, Expert
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
-- 샘플 데이터 (테스트용)
-- ====================

-- 테스트 사용자 1
INSERT INTO "user" (user_id, device_id, nickname, create_at) 
VALUES (
    'ABC12345', 
    'test-device-001', 
    '테스트유저1',
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET nickname = EXCLUDED.nickname;

-- 테스트 사용자 2
INSERT INTO "user" (user_id, device_id, nickname, create_at) 
VALUES (
    'XYZ67890', 
    'test-device-002', 
    '테스트유저2',
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET nickname = EXCLUDED.nickname;


-- 테스트 퍼즐들
INSERT INTO "puzzle" (puzzle_type, difficulty, puzzle_data, answer_data, daily_date) 
VALUES 
    ('daily_challenge', 'Easy', '{"board": [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]], "pieces": [{"type": "king", "position": [4,4]}]}', '{"board": [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]]}', CURRENT_DATE),
    ('normal', 'Medium', '{"board": [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]], "pieces": [{"type": "queen", "position": [3,3]}]}', '{"board": [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]]}', NULL),
    ('normal', 'Hard', '{"board": [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]], "pieces": [{"type": "rook", "position": [0,0]}]}', '{"board": [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]]}', NULL);

-- 테스트 퍼즐 기록들
INSERT INTO "puzzle_record" (user_id, puzzle_id, create_at, solve_time, hints_used) 
VALUES 
    ('ABC12345', 1, NOW() - INTERVAL '2 hours', 120, 0),
    ('ABC12345', 2, NOW() - INTERVAL '1 hour', 180, 2),
    ('XYZ67890', 1, NOW() - INTERVAL '3 hours', 95, 1),
    ('XYZ67890', 2, NOW() - INTERVAL '1.5 hours', 210, 3)
ON CONFLICT (record_id, user_id, puzzle_id) DO UPDATE SET solve_time = EXCLUDED.solve_time;

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
