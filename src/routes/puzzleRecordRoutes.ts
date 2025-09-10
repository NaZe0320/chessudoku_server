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
 * @swagger
 * /api/puzzle-record:
 *   post:
 *     summary: 퍼즐 기록 추가
 *     description: 사용자가 퍼즐을 해결한 기록을 추가합니다.
 *     tags: [PuzzleRecords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - puzzle_id
 *               - puzzle_type
 *               - solve_time
 *               - hints_used
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: 사용자 ID
 *                 example: "ABC12345"
 *               puzzle_id:
 *                 type: integer
 *                 description: 퍼즐 ID
 *                 example: 1
 *               puzzle_type:
 *                 type: string
 *                 enum: [normal, daily_challenge]
 *                 description: 퍼즐 타입
 *                 example: "normal"
 *               solve_time:
 *                 type: integer
 *                 description: 해결 시간 (초)
 *                 example: 120
 *               hints_used:
 *                 type: integer
 *                 description: 사용한 힌트 수
 *                 example: 0
 *                 default: 0
 *     responses:
 *       201:
 *         description: 퍼즐 기록 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "퍼즐 기록이 성공적으로 추가되었습니다"
 *               data:
 *                 record_id: 1
 *                 user_id: "ABC12345"
 *                 puzzle_id: 1
 *                 create_at: "2024-01-01T00:00:00.000Z"
 *                 solve_time: 120
 *                 hints_used: 0
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 사용자 또는 퍼즐을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * 퍼즐 기록 추가
 * POST /api/puzzle-record
 */
router.post('/',
    validateRequiredFields(['user_id', 'puzzle_id', 'puzzle_type', 'solve_time', 'hints_used']),
    puzzleRecordController.addRecord
);

export default router;
