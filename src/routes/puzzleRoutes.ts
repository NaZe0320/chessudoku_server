import express, { Router } from 'express';
import { PuzzleController } from '../controllers/PuzzleController';
import { PuzzleService } from '../services/PuzzleService';
import { PuzzleRepository } from '../repositories/PuzzleRepository';
import { AccountRepository } from '../repositories/AccountRepository';
import { validateRequiredFields, validateInteger, validateNumberRange } from '../middlewares/validator';

// 의존성 주입
const puzzleRepository = new PuzzleRepository();
const accountRepository = new AccountRepository();
const puzzleService = new PuzzleService(puzzleRepository, accountRepository);
const puzzleController = new PuzzleController(puzzleService);

const router: Router = express.Router();

/**
 * 퍼즐 완성 기록 추가
 * POST /api/puzzle/:account_id
 */
router.post('/:account_id',
    validateRequiredFields(['puzzle_type', 'difficulty', 'time_taken', 'hint_count']),
    validateNumberRange('time_taken', 0, 86400), // 0초 ~ 24시간
    validateNumberRange('hint_count', 0, 100),   // 0회 ~ 100회
    puzzleController.addCompletion
);

/**
 * 퍼즐 기록 조회 (페이지네이션 포함)
 * GET /api/puzzle/:account_id
 * Query: puzzle_type, difficulty, page, limit, sort_by, sort_order, date_from, date_to
 */
router.get('/:account_id',
    puzzleController.getRecords
);

/**
 * 퍼즐 통계 조회
 * GET /api/puzzle/:account_id/stats
 */
router.get('/:account_id/stats',
    puzzleController.getStats
);

/**
 * 최고 기록들 조회
 * GET /api/puzzle/:account_id/best
 */
router.get('/:account_id/best',
    puzzleController.getBestRecords
);

/**
 * 최근 기록 조회
 * GET /api/puzzle/:account_id/recent
 * Query: limit (default: 10, max: 100)
 */
router.get('/:account_id/recent',
    puzzleController.getRecentRecords
);

/**
 * 특정 기간 내 기록 조회
 * GET /api/puzzle/:account_id/date-range
 * Query: start_date, end_date (required)
 */
router.get('/:account_id/date-range',
    puzzleController.getRecordsByDateRange
);

/**
 * 일별 플레이 통계 조회
 * GET /api/puzzle/:account_id/daily-stats
 * Query: days (default: 30, max: 365)
 */
router.get('/:account_id/daily-stats',
    puzzleController.getDailyStats
);

/**
 * 낮은 힌트 기록 조회
 * GET /api/puzzle/:account_id/low-hints
 * Query: max_hints (required), puzzle_type (optional)
 */
router.get('/:account_id/low-hints',
    puzzleController.getLowHintRecords
);

/**
 * 빠른 기록 조회
 * GET /api/puzzle/:account_id/fast-records
 * Query: max_time (required), puzzle_type (optional)
 */
router.get('/:account_id/fast-records',
    puzzleController.getFastRecords
);

/**
 * 개인 순위 조회
 * GET /api/puzzle/:account_id/ranking/:puzzle_type
 * Query: difficulty (optional)
 */
router.get('/:account_id/ranking/:puzzle_type',
    puzzleController.getPersonalRanking
);

/**
 * 특정 퍼즐 기록 삭제
 * DELETE /api/puzzle/:account_id/:record_id
 */
router.delete('/:account_id/:record_id',
    validateInteger('record_id'),
    puzzleController.deleteRecord
);

/**
 * 모든 퍼즐 기록 삭제
 * DELETE /api/puzzle/:account_id/all
 */
router.delete('/:account_id/all',
    puzzleController.deleteAllRecords
);

// === 글로벌 엔드포인트 (특정 계정에 속하지 않음) ===

/**
 * 글로벌 순위 조회
 * GET /api/puzzle/ranking/:puzzle_type
 * Query: difficulty (optional), limit (default: 100, max: 1000)
 */
router.get('/ranking/:puzzle_type',
    puzzleController.getGlobalRanking
);

export default router;
