import { Pool, PoolConfig } from 'pg';

// 데이터베이스 연결 설정
const poolConfig: PoolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'chessudoku',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20, // 최대 연결 수
    idleTimeoutMillis: 30000, // 유휴 타임아웃
    connectionTimeoutMillis: 2000, // 연결 타임아웃
};

// 데이터베이스 연결 풀 생성
export const pool = new Pool(poolConfig);

/**
 * 연결 테스트
 */
export const testConnection = async (): Promise<boolean> => {
    try {
        const client = await pool.connect();
        console.log('✅ 데이터베이스 연결 성공');
        client.release();
        return true;
    } catch (err) {
        console.error('❌ 데이터베이스 연결 실패:', (err as Error).message);
        return false;
    }
};

/**
 * 데이터베이스 종료
 */
export const closeDatabase = async (): Promise<void> => {
    try {
        await pool.end();
        console.log('📊 데이터베이스 연결이 정상적으로 종료되었습니다');
    } catch (err) {
        console.error('데이터베이스 종료 중 오류:', (err as Error).message);
    }
};

// Pool 이벤트 리스너
pool.on('connect', () => {
    console.log('🔌 데이터베이스 클라이언트 연결됨');
});

pool.on('error', (err: Error) => {
    console.error('💥 데이터베이스 연결 풀 오류:', err);
});

// 기본 내보내기도 제공
export default {
    pool,
    testConnection,
    closeDatabase
};
