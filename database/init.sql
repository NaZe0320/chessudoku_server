-- ChessSudoku Puzzle App Database Schema
-- PostgreSQL 14+ 호환

-- 데이터베이스 생성 (이미 존재하면 무시)
-- CREATE DATABASE chessudoku;

-- 연결할 데이터베이스 선택
-- \c chessudoku;

-- 확장 설치 (UUID 생성용, 필요시)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================
-- 계정 테이블
-- ====================
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(12) PRIMARY KEY CHECK (id ~ '^[A-Z0-9]{12}$'),
    device_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    settings JSONB DEFAULT '{}' NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    premium_until TIMESTAMP NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_accounts_device_id ON accounts(device_id);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON accounts(created_at);
CREATE INDEX IF NOT EXISTS idx_accounts_is_premium ON accounts(is_premium);
CREATE INDEX IF NOT EXISTS idx_accounts_premium_until ON accounts(premium_until);

-- ====================
-- 퍼즐 기록 테이블
-- ====================
CREATE TABLE IF NOT EXISTS puzzle_records (
    record_id SERIAL PRIMARY KEY,
    account_id VARCHAR(12) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    puzzle_type VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    time_taken INTEGER NOT NULL CHECK (time_taken >= 0 AND time_taken <= 86400),
    hint_count INTEGER NOT NULL DEFAULT 0 CHECK (hint_count >= 0 AND hint_count <= 100),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_puzzle_records_account_id ON puzzle_records(account_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_records_puzzle_type ON puzzle_records(puzzle_type);
CREATE INDEX IF NOT EXISTS idx_puzzle_records_difficulty ON puzzle_records(difficulty);
CREATE INDEX IF NOT EXISTS idx_puzzle_records_completed_at ON puzzle_records(completed_at);
CREATE INDEX IF NOT EXISTS idx_puzzle_records_hint_count ON puzzle_records(hint_count);
CREATE INDEX IF NOT EXISTS idx_puzzle_records_time_taken ON puzzle_records(time_taken);

-- 복합 인덱스 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_puzzle_records_type_difficulty ON puzzle_records(puzzle_type, difficulty);
CREATE INDEX IF NOT EXISTS idx_puzzle_records_account_type ON puzzle_records(account_id, puzzle_type);
CREATE INDEX IF NOT EXISTS idx_puzzle_records_account_completed ON puzzle_records(account_id, completed_at DESC);

-- ====================
-- 트리거: updated_at 자동 업데이트
-- ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- accounts 테이블에 트리거 적용
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================
-- 샘플 데이터 (테스트용)
-- ====================

-- 테스트 계정 1
INSERT INTO accounts (id, device_id, settings, is_premium, premium_until) 
VALUES (
    'ABC123DEF456', 
    'test-device-001', 
    '{"theme": "dark", "sound": true, "language": "ko"}',
    true,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- 테스트 계정 2
INSERT INTO accounts (id, device_id, settings, is_premium) 
VALUES (
    'XYZ789GHI012', 
    'test-device-002', 
    '{"theme": "light", "sound": false, "language": "en"}',
    false
) ON CONFLICT (id) DO NOTHING;

-- 테스트 퍼즐 기록들
INSERT INTO puzzle_records (account_id, puzzle_type, difficulty, time_taken, hint_count, completed_at) 
VALUES 
    ('ABC123DEF456', 'chess_puzzle', 'easy', 120, 0, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    ('ABC123DEF456', 'chess_puzzle', 'medium', 180, 2, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('ABC123DEF456', 'sudoku', 'hard', 240, 5, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
    ('XYZ789GHI012', 'chess_puzzle', 'easy', 95, 1, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
    ('XYZ789GHI012', 'sudoku', 'medium', 210, 3, CURRENT_TIMESTAMP - INTERVAL '1.5 hours')
ON CONFLICT DO NOTHING;

-- ====================
-- 뷰: 계정별 통계 (성능 최적화용)
-- ====================
CREATE OR REPLACE VIEW account_stats AS
SELECT 
    a.id,
    a.device_id,
    a.created_at,
    a.is_premium,
    a.premium_until,
    COALESCE(stats.total_puzzles, 0) as total_puzzles,
    COALESCE(stats.total_time, 0) as total_time,
    COALESCE(stats.avg_time, 0) as avg_time,
    COALESCE(stats.best_time, 0) as best_time,
    COALESCE(stats.total_hints, 0) as total_hints,
    COALESCE(stats.avg_hints, 0) as avg_hints
FROM accounts a
LEFT JOIN (
    SELECT 
        account_id,
        COUNT(*) as total_puzzles,
        SUM(time_taken) as total_time,
        AVG(time_taken) as avg_time,
        MIN(time_taken) as best_time,
        SUM(hint_count) as total_hints,
        AVG(hint_count) as avg_hints
    FROM puzzle_records 
    GROUP BY account_id
) stats ON a.id = stats.account_id;

-- ====================
-- 함수: 계정 ID 생성 (서버에서 사용)
-- ====================
CREATE OR REPLACE FUNCTION generate_account_id()
RETURNS VARCHAR(12) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(12) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 권한 설정 (필요시)
-- ====================
-- GRANT ALL PRIVILEGES ON DATABASE chessudoku TO postgres;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
