import { Request, Response, NextFunction } from 'express';

export interface DatabaseError extends Error {
    code?: string;
    detail?: string;
    constraint?: string;
}

export interface ErrorResponse {
    success: false;
    message: string;
    timestamp: string;
    error?: any;
    stack?: string;
}

/**
 * 전역 에러 핸들링 미들웨어
 */
const errorHandler = (err: DatabaseError, req: Request, res: Response, next: NextFunction): void => {
    console.error('Global Error Handler:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // 기본 에러 응답
    let statusCode = 500;
    let message = '서버 내부 오류가 발생했습니다';

    // PostgreSQL 에러 처리
    if (err.code) {
        switch (err.code) {
            case '23505': // unique_violation
                statusCode = 409;
                message = '중복된 데이터입니다';
                break;
            case '23503': // foreign_key_violation
                statusCode = 400;
                message = '참조 무결성 위반입니다';
                break;
            case '23502': // not_null_violation
                statusCode = 400;
                message = '필수 필드가 누락되었습니다';
                break;
            case '22001': // string_data_right_truncation
                statusCode = 400;
                message = '데이터가 너무 깁니다';
                break;
            case '22P02': // invalid_text_representation
                statusCode = 400;
                message = '잘못된 데이터 형식입니다';
                break;
            case '42P01': // undefined_table
                statusCode = 500;
                message = '테이블을 찾을 수 없습니다';
                break;
            case '42703': // undefined_column
                statusCode = 500;
                message = '컬럼을 찾을 수 없습니다';
                break;
            case '08006': // connection_failure
                statusCode = 503;
                message = '데이터베이스 연결 실패';
                break;
            default:
                statusCode = 500;
                message = '데이터베이스 오류가 발생했습니다';
        }
    }

    // Validation 에러
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }

    // JWT 에러
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = '유효하지 않은 토큰입니다';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = '토큰이 만료되었습니다';
    }

    // Cast 에러 (잘못된 ID 형식)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = '잘못된 ID 형식입니다';
    }

    // Syntax 에러
    if (err.name === 'SyntaxError') {
        statusCode = 400;
        message = '잘못된 JSON 형식입니다';
    }

    // 타입 에러
    if (err.name === 'TypeError') {
        statusCode = 400;
        message = '잘못된 데이터 타입입니다';
    }

    const errorResponse: ErrorResponse = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    // 개발 환경에서는 상세 에러 정보 포함
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error = {
            name: err.name,
            message: err.message,
            code: err.code,
            detail: err.detail,
            constraint: err.constraint
        };
        errorResponse.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
};

export default errorHandler;
