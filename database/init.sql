-- ChessSudoku Puzzle App Database Schema
-- MySQL 8.0+ 호환

-- 데이터베이스 생성 (이미 존재하면 무시)
-- CREATE DATABASE chessudoku;

-- 연결할 데이터베이스 선택
-- USE chessudoku;

-- ====================
-- 사용자 테이블
-- ====================
CREATE TABLE IF NOT EXISTS `User` (
    `user_id` VARCHAR(8) NOT NULL,
    `device_id` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(20) NOT NULL,
    `create_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `idx_user_device_id` (`device_id`),
    KEY `idx_user_create_at` (`create_at`)
);


-- ====================
-- 퍼즐 테이블
-- ====================
CREATE TABLE IF NOT EXISTS `Puzzle` (
    `puzzle_id` INT NOT NULL AUTO_INCREMENT,
    `puzzle_type` VARCHAR(20) NOT NULL DEFAULT 'normal' COMMENT 'Enum: normal, daily_challenge',
    `difficulty` VARCHAR(10) NOT NULL DEFAULT 'Easy' COMMENT 'Enum: Easy, Medium, Hard, Expert',
    `puzzle_data` JSON NOT NULL COMMENT 'board [9][9], pieces [ {type, position} ]',
    `answer_data` JSON NOT NULL,
    `daily_date` DATE NULL,
    PRIMARY KEY (`puzzle_id`),
    KEY `idx_puzzle_type` (`puzzle_type`),
    KEY `idx_puzzle_difficulty` (`difficulty`),
    KEY `idx_puzzle_daily_date` (`daily_date`),
    KEY `idx_puzzle_type_difficulty` (`puzzle_type`, `difficulty`)
);

-- ====================
-- 퍼즐 기록 테이블
-- ====================
CREATE TABLE IF NOT EXISTS `PuzzleRecord` (
    `record_id` INT NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(8) NOT NULL,
    `puzzle_id` INT NOT NULL,
    `create_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `solve_time` INT NOT NULL,
    `hints_used` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`record_id`, `user_id`, `puzzle_id`),
    KEY `idx_puzzle_record_user_id` (`user_id`),
    KEY `idx_puzzle_record_puzzle_id` (`puzzle_id`),
    KEY `idx_puzzle_record_create_at` (`create_at`),
    KEY `idx_puzzle_record_solve_time` (`solve_time`),
    KEY `idx_puzzle_record_hints_used` (`hints_used`),
    CONSTRAINT `FK_User_TO_PuzzleRecord_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Puzzle_TO_PuzzleRecord_1` FOREIGN KEY (`puzzle_id`) REFERENCES `Puzzle` (`puzzle_id`) ON DELETE CASCADE
);

-- ====================
-- 샘플 데이터 (테스트용)
-- ====================

-- 테스트 사용자 1
INSERT INTO `User` (`user_id`, `device_id`, `nickname`, `create_at`) 
VALUES (
    'ABC12345', 
    'test-device-001', 
    '테스트유저1',
    NOW()
) ON DUPLICATE KEY UPDATE `nickname` = VALUES(`nickname`);

-- 테스트 사용자 2
INSERT INTO `User` (`user_id`, `device_id`, `nickname`, `create_at`) 
VALUES (
    'XYZ67890', 
    'test-device-002', 
    '테스트유저2',
    NOW()
) ON DUPLICATE KEY UPDATE `nickname` = VALUES(`nickname`);


-- 테스트 퍼즐들
INSERT INTO `Puzzle` (`puzzle_id`, `puzzle_type`, `difficulty`, `puzzle_data`, `answer_data`, `daily_date`) 
VALUES 
    (1, 'daily_challenge', 'Easy', '{"board": [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]], "pieces": [{"type": "king", "position": [4,4]}]}', '{"board": [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]]}', CURDATE()),
    (2, 'normal', 'Medium', '{"board": [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]], "pieces": [{"type": "queen", "position": [3,3]}]}', '{"board": [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]]}', NULL),
    (3, 'normal', 'Hard', '{"board": [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]], "pieces": [{"type": "rook", "position": [0,0]}]}', '{"board": [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]]}', NULL)
ON DUPLICATE KEY UPDATE `puzzle_data` = VALUES(`puzzle_data`);

-- 테스트 퍼즐 기록들
INSERT INTO `PuzzleRecord` (`user_id`, `puzzle_id`, `create_at`, `solve_time`, `hints_used`) 
VALUES 
    ('ABC12345', 1, DATE_SUB(NOW(), INTERVAL 2 HOUR), 120, 0),
    ('ABC12345', 2, DATE_SUB(NOW(), INTERVAL 1 HOUR), 180, 2),
    ('XYZ67890', 1, DATE_SUB(NOW(), INTERVAL 3 HOUR), 95, 1),
    ('XYZ67890', 2, DATE_SUB(NOW(), INTERVAL 1.5 HOUR), 210, 3)
ON DUPLICATE KEY UPDATE `solve_time` = VALUES(`solve_time`);

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
FROM `User` u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_puzzles,
        SUM(solve_time) as total_time,
        AVG(solve_time) as avg_time,
        MIN(solve_time) as best_time,
        SUM(hints_used) as total_hints,
        AVG(hints_used) as avg_hints
    FROM `PuzzleRecord` 
    GROUP BY user_id
) stats ON u.user_id = stats.user_id;
