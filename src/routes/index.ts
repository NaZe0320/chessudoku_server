import express, { Router, Request, Response } from 'express';
import accountRoutes from './accountRoutes';
import puzzleRoutes from './puzzleRoutes';

const router: Router = express.Router();

// API 버전 정보
router.get('/', (req: Request, res: Response) => {
    (res as any).success({
        message: 'ChessSudoku Puzzle API',
        version: '1.0.0',
        typescript: true,
        endpoints: {
            health: '/api/health',
            account: {
                register: 'POST /api/account/register',
                info: 'GET /api/account/:account_id',
                recover: 'PUT /api/account/:account_id/device',
                update: 'PUT /api/account/:account_id',
                premium: 'PUT /api/account/:account_id/premium',
                delete: 'DELETE /api/account/:account_id',
                validate: 'GET /api/account/:account_id/validate'
            },
            puzzle: {
                add_completion: 'POST /api/puzzle/:account_id',
                get_records: 'GET /api/puzzle/:account_id',
                get_stats: 'GET /api/puzzle/:account_id/stats',
                get_best: 'GET /api/puzzle/:account_id/best',
                get_recent: 'GET /api/puzzle/:account_id/recent',
                low_hints: 'GET /api/puzzle/:account_id/low-hints',
                global_ranking: 'GET /api/puzzle/ranking/:puzzle_type',
                personal_ranking: 'GET /api/puzzle/:account_id/ranking/:puzzle_type'
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
        database: 'connected', // 실제로는 DB 연결 체크 로직 추가 가능
        features: {
            account_management: true,
            puzzle_records: true,
            statistics: true,
            rankings: true
        }
    }, 'API 서버가 정상 상태입니다');
});

// 라우트 연결
router.use('/account', accountRoutes);
router.use('/puzzle', puzzleRoutes);

export default router;
