import { Pool, PoolConfig } from 'pg';
import fs from 'fs';
import path from 'path';

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
 * 데이터베이스 스키마 초기화
 */
export const initializeDatabase = async (): Promise<boolean> => {
    try {
        console.log('📁 init.sql 파일 경로 확인 중...');
        const initSqlPath = path.join(process.cwd(), 'database', 'init.sql');
        console.log('📁 파일 경로:', initSqlPath);
        
        // 파일 존재 확인
        if (!fs.existsSync(initSqlPath)) {
            console.error('❌ init.sql 파일을 찾을 수 없습니다:', initSqlPath);
            return false;
        }
        
        const client = await pool.connect();
        console.log('🔌 데이터베이스 클라이언트 연결됨');
        
        // init.sql 파일 읽기
        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        console.log('📄 init.sql 파일 읽기 완료, 크기:', initSql.length, 'bytes');
        
        // SQL 실행
        console.log('🚀 SQL 스크립트 실행 중...');
        await client.query(initSql);
        console.log('✅ 데이터베이스 스키마 초기화 완료');
        
        // 테이블 존재 확인
        const tableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('User', 'Puzzle', 'PuzzleRecord')
            ORDER BY table_name
        `);
        console.log('📊 생성된 테이블들:', tableCheck.rows.map(row => row.table_name));
        
        client.release();
        return true;
    } catch (err) {
        console.error('❌ 데이터베이스 스키마 초기화 실패:', (err as Error).message);
        console.error('❌ 상세 오류:', err);
        return false;
    }
};

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
    initializeDatabase,
    testConnection,
    closeDatabase
};
