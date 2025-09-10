import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

// 환경변수 로드
dotenv.config();

// Layered Architecture 모듈들 import
import { testConnection, closeDatabase } from './config/database';
import errorHandler from './middlewares/errorHandler';
import { responseHelpers } from './utils/response';
import apiRoutes from './routes';
import { swaggerSpec } from './config/swagger';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000');

// 기본 미들웨어 설정
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS 설정
app.use((req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',') 
        : ['http://localhost:3000', 'http://localhost:3001'];
    
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// 요청 로깅 미들웨어
app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
    
    if (process.env.LOG_LEVEL === 'debug' && Object.keys(req.body).length > 0) {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    
    next();
});

// 응답 헬퍼 미들웨어 추가
app.use(responseHelpers);

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ChessSudoku API Documentation'
}));

// Swagger JSON 엔드포인트
app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// 기본 라우트
app.get('/', (req: Request, res: Response) => {
    (res as any).success({
        service: 'ChessSudoku Server',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        typescript: true
    }, 'ChessSudoku TypeScript Server가 정상적으로 실행 중입니다');
});

// API 라우트 연결
app.use('/api', apiRoutes);

// 404 핸들러
app.use('*', (req: Request, res: Response) => {
    (res as any).notFound(`요청한 엔드포인트를 찾을 수 없습니다: ${req.originalUrl}`);
});

// 전역 에러 핸들러
app.use(errorHandler);

// 서버 시작 함수
const startServer = async (): Promise<void> => {
    try {
        // 데이터베이스 연결 테스트 (선택적)
        console.log('🔌 데이터베이스 연결을 테스트합니다...');
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.log('⚠️  데이터베이스 연결 실패 - API 문서화 모드로 실행됩니다');
            console.log('💡 PostgreSQL을 설치하고 설정하면 전체 기능을 사용할 수 있습니다');
        }
        
        // 서버 시작
        const server = app.listen(PORT, () => {
            console.log('\n🎉 ========================================');
            console.log('🚀 ChessSudoku TypeScript Server 시작 완료!');
            console.log('🎉 ========================================');
            console.log(`📍 서버 주소: http://localhost:${PORT}`);
            console.log(`🔍 API 상태: http://localhost:${PORT}/api/health`);
            console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
            console.log(`📄 Swagger JSON: http://localhost:${PORT}/api-docs.json`);
            console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📝 TypeScript: ✅ 활성화`);
            console.log(`🕐 시작 시간: ${new Date().toISOString()}`);
            console.log('========================================\n');
        });
        
        // Graceful shutdown 처리
        const gracefulShutdown = async (signal: string): Promise<void> => {
            console.log(`\n⚠️  ${signal} 신호를 받았습니다. 서버를 안전하게 종료합니다...`);
            
            server.close(async () => {
                console.log('📡 HTTP 서버가 종료되었습니다');
                
                try {
                    await closeDatabase();
                    console.log('✅ 모든 리소스가 정상적으로 정리되었습니다');
                    process.exit(0);
                } catch (error) {
                    console.error('❌ 종료 중 오류 발생:', error);
                    process.exit(1);
                }
            });
            
            // 강제 종료 타임아웃 (30초)
            setTimeout(() => {
                console.error('⏰ 강제 종료 타임아웃');
                process.exit(1);
            }, 30000);
        };
        
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        // 처리되지 않은 예외 처리
        process.on('uncaughtException', (error: Error) => {
            console.error('💥 처리되지 않은 예외:', error);
            gracefulShutdown('uncaughtException');
        });
        
        process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
            console.error('💥 처리되지 않은 Promise 거부:', reason);
            gracefulShutdown('unhandledRejection');
        });
        
    } catch (error) {
        console.error('❌ 서버 시작 실패:', (error as Error).message);
        console.error('💡 데이터베이스 설정을 확인하세요. config.example.js 파일을 참고하여 .env 파일을 생성하세요.');
        process.exit(1);
    }
};

// 서버 시작
startServer();

export default app;
