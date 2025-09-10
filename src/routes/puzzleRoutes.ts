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
 * @swagger
 * /api/puzzle/random:
 *   get:
 *     summary: 랜덤 퍼즐 조회
 *     description: 조건에 맞는 랜덤 퍼즐을 조회합니다.
 *     tags: [Puzzles]
 *     parameters:
 *       - in: query
 *         name: puzzle_type
 *         schema:
 *           type: string
 *           enum: [normal, daily_challenge]
 *         description: 퍼즐 타입
 *         example: "normal"
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Easy, Medium, Hard, Expert]
 *         description: 퍼즐 난이도
 *         example: "Easy"
 *     responses:
 *       200:
 *         description: 랜덤 퍼즐 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "랜덤 퍼즐을 성공적으로 조회했습니다"
 *               data:
 *                 puzzle_id: 1
 *                 puzzle_type: "normal"
 *                 difficulty: "Easy"
 *                 puzzle_data:
 *                   board: [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]]
 *                   pieces: [{"type": "king", "position": [4,4]}]
 *                 answer_data:
 *                   board: [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,4,5,6,7,8,9,1],[5,6,7,8,9,1,2,3,4],[8,9,1,2,3,4,5,6,7],[3,4,5,6,7,8,9,1,2],[6,7,8,9,1,2,3,4,5],[9,1,2,3,4,5,6,7,8]]
 *                 daily_date: null
 *       404:
 *         description: 조건에 맞는 퍼즐을 찾을 수 없음
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
 * 조건에 맞는 랜덤 퍼즐 조회
 * GET /api/puzzle/random
 * Query: puzzle_type, difficulty (optional)
 */
router.get('/random',
    puzzleController.getRandomPuzzle
);

/**
 * @swagger
 * /api/puzzle/daily:
 *   get:
 *     summary: 데일리 퍼즐 조회
 *     description: 특정 날짜의 데일리 퍼즐을 조회합니다. 날짜를 지정하지 않으면 오늘 날짜의 퍼즐을 조회합니다.
 *     tags: [Puzzles]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: 조회할 날짜 (YYYY-MM-DD 형식)
 *         example: "2024-01-01"
 *     responses:
 *       200:
 *         description: 데일리 퍼즐 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 해당 날짜의 데일리 퍼즐을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * 데일리 퍼즐 조회
 * GET /api/puzzle/daily
 * Query: date (optional)
 */
router.get('/daily',
    puzzleController.getDailyPuzzle
);

/**
 * @swagger
 * /api/puzzle:
 *   post:
 *     summary: 퍼즐 생성 (관리자용)
 *     description: 새로운 퍼즐을 생성합니다. 관리자만 사용할 수 있습니다.
 *     tags: [Puzzles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - puzzle_type
 *               - difficulty
 *               - puzzle_data
 *               - answer_data
 *             properties:
 *               puzzle_type:
 *                 type: string
 *                 enum: [normal, daily_challenge]
 *                 description: 퍼즐 타입
 *                 example: "normal"
 *               difficulty:
 *                 type: string
 *                 enum: [Easy, Medium, Hard, Expert]
 *                 description: 퍼즐 난이도
 *                 example: "Easy"
 *               puzzle_data:
 *                 type: object
 *                 description: 퍼즐 데이터
 *                 properties:
 *                   board:
 *                     type: array
 *                     items:
 *                       type: array
 *                       items:
 *                         type: integer
 *                   pieces:
 *                     type: array
 *                     items:
 *                       type: object
 *               answer_data:
 *                 type: object
 *                 description: 정답 데이터
 *               daily_date:
 *                 type: string
 *                 format: date
 *                 description: 데일리 퍼즐 날짜 (일반 퍼즐은 null)
 *                 nullable: true
 *     responses:
 *       201:
 *         description: 퍼즐 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * 퍼즐 생성 (관리자용)
 * POST /api/puzzle
 */
router.post('/',
    validateRequiredFields(['puzzle_type', 'difficulty', 'puzzle_data', 'answer_data']),
    puzzleController.createPuzzle
);

/**
 * @swagger
 * /api/puzzle/{puzzle_id}:
 *   delete:
 *     summary: 퍼즐 삭제 (관리자용)
 *     description: 특정 퍼즐을 삭제합니다. 관리자만 사용할 수 있습니다.
 *     tags: [Puzzles]
 *     parameters:
 *       - in: path
 *         name: puzzle_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 퍼즐 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 퍼즐 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 퍼즐을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * 퍼즐 삭제 (관리자용)
 * DELETE /api/puzzle/:puzzle_id
 */
router.delete('/:puzzle_id',
    validateInteger('puzzle_id'),
    puzzleController.deletePuzzle
);

export default router;