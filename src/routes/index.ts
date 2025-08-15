import express, { Router, Request, Response } from 'express';

const router: Router = express.Router();

// API 버전 정보
router.get('/', (req: Request, res: Response) => {
    (res as any).success({
        message: 'ChessSudoku API',
        version: '1.0.0',
        typescript: true,
        endpoints: {
            health: '/api/health',
            // 추후 API 엔드포인트들이 여기에 추가됩니다
            // users: '/api/users',
            // games: '/api/games',
            // puzzles: '/api/puzzles'
        }
    }, 'ChessSudoku TypeScript API가 정상적으로 작동 중입니다');
});

// 헬스 체크
router.get('/health', (req: Request, res: Response) => {
    (res as any).success({
        status: 'healthy',
        service: 'ChessSudoku TypeScript API',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    }, 'API 서버가 정상 상태입니다');
});

// 여기에 다른 라우트들을 추가할 예정
// router.use('/users', require('./userRoutes'));
// router.use('/games', require('./gameRoutes'));
// router.use('/puzzles', require('./puzzleRoutes'));

export default router;
