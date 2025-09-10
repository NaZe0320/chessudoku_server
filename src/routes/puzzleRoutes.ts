import express, { Router } from 'express';
import { PuzzleController } from '../controllers/PuzzleController';
import { PuzzleService } from '../services/PuzzleService';
import { PuzzleRepository } from '../repositories/PuzzleRepository';
import { validateRequiredFields, validateInteger } from '../middlewares/validator';

// 의존성 주입
const puzzleRepository = new PuzzleRepository();
const puzzleService = new PuzzleService(puzzleRepository);
const puzzleController = new PuzzleController(puzzleService);

const router: Router = express.Router();

/**
 * 조건에 맞는 랜덤 퍼즐 조회
 * GET /api/puzzle/random
 * Query: puzzle_type, difficulty (optional)
 */
router.get('/random',
    puzzleController.getRandomPuzzle
);

/**
 * 데일리 퍼즐 조회
 * GET /api/puzzle/daily
 * Query: date (optional)
 */
router.get('/daily',
    puzzleController.getDailyPuzzle
);

/**
 * 퍼즐 생성 (관리자용)
 * POST /api/puzzle
 */
router.post('/',
    validateRequiredFields(['puzzle_type', 'difficulty', 'puzzle_data', 'answer_data']),
    puzzleController.createPuzzle
);

/**
 * 퍼즐 삭제 (관리자용)
 * DELETE /api/puzzle/:puzzle_id
 */
router.delete('/:puzzle_id',
    validateInteger('puzzle_id'),
    puzzleController.deletePuzzle
);

export default router;