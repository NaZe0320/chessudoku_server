const { Pool } = require('pg');
require('dotenv').config();

// 데이터베이스 연결 설정
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'chessudoku',
    user: process.env.DB_USER || 'chessudoku_user',
    password: process.env.DB_PASSWORD || '',
});

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('데이터베이스 마이그레이션 시작...');
        
        // 1. is_deleted 컬럼 추가
        console.log('1. is_deleted 컬럼 추가 중...');
        await client.query(`
            ALTER TABLE "user" 
            ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE
        `);
        console.log('✓ is_deleted 컬럼 추가 완료');
        
        // 2. 기존 데이터의 is_deleted를 FALSE로 설정
        console.log('2. 기존 데이터 업데이트 중...');
        await client.query(`
            UPDATE "user" 
            SET is_deleted = FALSE 
            WHERE is_deleted IS NULL
        `);
        console.log('✓ 기존 데이터 업데이트 완료');
        
        // 3. 인덱스 추가
        console.log('3. 인덱스 추가 중...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_is_deleted ON "user" (is_deleted)
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_device_id_not_deleted ON "user" (device_id) WHERE is_deleted = FALSE
        `);
        console.log('✓ 인덱스 추가 완료');
        
        // 4. 테이블 구조 확인
        console.log('4. 테이블 구조 확인 중...');
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'user' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n현재 user 테이블 구조:');
        result.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
        });
        
        console.log('\n✅ 데이터베이스 마이그레이션 완료!');
        
    } catch (error) {
        console.error('❌ 마이그레이션 실패:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// 마이그레이션 실행
runMigration()
    .then(() => {
        console.log('마이그레이션이 성공적으로 완료되었습니다.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('마이그레이션 중 오류 발생:', error);
        process.exit(1);
    });
