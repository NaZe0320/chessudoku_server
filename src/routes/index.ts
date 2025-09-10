import express, { Router, Request, Response } from 'express';
import userRoutes from './userRoutes';
import puzzleRoutes from './puzzleRoutes';
import puzzleRecordRoutes from './puzzleRecordRoutes';

const router: Router = express.Router();

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
