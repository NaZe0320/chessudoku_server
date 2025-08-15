// 환경변수 설정 예시
// .env 파일을 프로젝트 루트에 생성하고 다음 내용을 참고하여 설정하세요

/*
PORT=3000
NODE_ENV=development

# 데이터베이스 설정 (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chessudoku
DB_USER=your_username
DB_PASSWORD=your_password

# JWT 설정 (향후 인증 기능용)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# CORS 설정
CORS_ORIGIN=http://localhost:3000

# 로그 레벨
LOG_LEVEL=debug
*/

module.exports = {
    development: {
        port: process.env.PORT || 3000,
        database: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            name: process.env.DB_NAME || 'chessudoku',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || ''
        },
        jwt: {
            secret: process.env.JWT_SECRET || 'default_secret',
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
    }
};
