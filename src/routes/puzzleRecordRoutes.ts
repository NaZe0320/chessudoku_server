import express, { Router } from 'express';
import { PuzzleRecordController } from '../controllers/PuzzleRecordController';
import { PuzzleRecordService } from '../services/PuzzleRecordService';
import { PuzzleRecordRepository } from '../repositories/PuzzleRecordRepository';
import { validateRequiredFields } from '../middlewares/validator';

// 의존성 주입
const puzzleRecordRepository = new PuzzleRecordRepository();
const puzzleRecordService = new PuzzleRecordService(puzzleRecordRepository);
const puzzleRecordController = new PuzzleRecordController(puzzleRecordService);

const router: Router = express.Router();

/**
 * 퍼즐 기록 추가
 * POST /api/puzzle-record
 */
router.post('/',
    validateRequiredFields(['user_id', 'puzzle_id', 'puzzle_type', 'solve_time', 'hints_used']),
    puzzleRecordController.addRecord
);

export default router;
