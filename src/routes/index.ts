import express, { Router, Request, Response } from 'express';
import userRoutes from './userRoutes';
import puzzleRoutes from './puzzleRoutes';
import puzzleRecordRoutes from './puzzleRecordRoutes';

const router: Router = express.Router();

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API 정보 조회
 *     description: ChessSudoku Puzzle API의 기본 정보와 사용 가능한 엔드포인트 목록을 반환합니다.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "ChessSudoku Puzzle API가 정상적으로 작동 중입니다"
 *               data:
 *                 message: "ChessSudoku Puzzle API"
 *                 version: "1.0.0"
 *                 typescript: true
 *                 endpoints:
 *                   health: "/api/health"
 *                   user:
 *                     register: "POST /api/user/register"
 *                     get_by_device: "GET /api/user/device/:device_id"
 *                     get_by_id: "GET /api/user/:user_id"
 *                     delete: "DELETE /api/user/:user_id"
 *                   puzzle:
 *                     get_random: "GET /api/puzzle/random"
 *                     get_daily: "GET /api/puzzle/daily"
 *                     create: "POST /api/puzzle"
 *                     delete: "DELETE /api/puzzle/:puzzle_id"
 *                   puzzle_record:
 *                     add: "POST /api/puzzle-record"
 */
// API 버전 정보
router.get('/', (req: Request, res: Response) => {
    (res as any).success({
        message: 'ChessSudoku Puzzle API',
        version: '1.0.0',
        typescript: true,
        endpoints: {
            health: '/api/health',
            user: {
                register: 'POST /api/user/register',
                get_by_device: 'GET /api/user/device/:device_id',
                get_by_id: 'GET /api/user/:user_id',
                delete: 'DELETE /api/user/:user_id'
            },
            puzzle: {
                get_random: 'GET /api/puzzle/random',
                get_daily: 'GET /api/puzzle/daily',
                create: 'POST /api/puzzle',
                delete: 'DELETE /api/puzzle/:puzzle_id'
            },
            puzzle_record: {
                add: 'POST /api/puzzle-record'
            }
        }
    }, 'ChessSudoku Puzzle API가 정상적으로 작동 중입니다');
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 서버 상태 확인
 *     description: API 서버의 현재 상태와 시스템 정보를 반환합니다.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 서버 상태 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "API 서버가 정상 상태입니다"
 *               data:
 *                 status: "healthy"
 *                 service: "ChessSudoku Puzzle API"
 *                 uptime: 123.456
 *                 memory:
 *                   rss: 12345678
 *                   heapTotal: 8765432
 *                   heapUsed: 4567890
 *                   external: 1234567
 *                 environment: "development"
 *                 database: "connected"
 *                 features:
 *                   user_management: true
 *                   puzzle_management: true
 *                   puzzle_records: true
 */
// 헬스 체크
router.get('/health', (req: Request, res: Response) => {
    (res as any).success({
        status: 'healthy',
        service: 'ChessSudoku Puzzle API',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        database: 'connected',
        features: {
            user_management: true,
            puzzle_management: true,
            puzzle_records: true
        }
    }, 'API 서버가 정상 상태입니다');
});

// 라우트 연결
router.use('/user', userRoutes);
router.use('/puzzle', puzzleRoutes);
router.use('/puzzle-record', puzzleRecordRoutes);

export default router;
