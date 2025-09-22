-- Migration: Add is_deleted column to user table
-- 실행 날짜: 2025-01-22

-- is_deleted 컬럼 추가 (기본값 FALSE)
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- 기존 데이터의 is_deleted를 FALSE로 설정 (이미 기본값이지만 명시적으로 설정)
UPDATE "user" 
SET is_deleted = FALSE 
WHERE is_deleted IS NULL;

-- 인덱스 추가 (삭제되지 않은 사용자 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_user_is_deleted ON "user" (is_deleted);
CREATE INDEX IF NOT EXISTS idx_user_device_id_not_deleted ON "user" (device_id) WHERE is_deleted = FALSE;
