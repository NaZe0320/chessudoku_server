import { Request, Response, NextFunction } from 'express';

export interface ApiSuccessResponse<T = any> {
    message: string;
    data: T;
    timestamp: string;
    meta?: any;
}

export interface ApiErrorResponse {
    message: string;
    timestamp: string;
    code?: string;
    error?: any;
}

export interface PaginationMeta {
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        nextPage: number | null;
        prevPage: number | null;
    };
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

export interface ValidationErrorResponse {
    success: false;
    message: string;
    errors: ValidationError[] | Record<string, string>;
    timestamp: string;
}

// Express Response 확장 인터페이스
declare global {
    namespace Express {
        interface Response {
            success<T>(data: T, message?: string, statusCode?: number): void;
            error(message: string, statusCode?: number, error?: any): void;
            list<T>(items: T[], page: number, limit: number, total: number, message?: string, statusCode?: number): void;
            created<T>(data: T, message?: string): void;
            updated<T>(data: T, message?: string): void;
            deleted(message?: string): void;
            validationError(errors: ValidationError[] | Record<string, string>, message?: string): void;
            unauthorized(message?: string): void;
            forbidden(message?: string): void;
            notFound(message?: string): void;
            conflict(message?: string): void;
            serverError(message?: string, error?: any): void;
        }
    }
}

/**
 * 성공 응답 포맷
 */
export const successResponse = <T>(data: T, message: string = '성공', meta?: any): ApiSuccessResponse<T> => {
    const response: ApiSuccessResponse<T> = {
        message,
        data,
        timestamp: new Date().toISOString()
    };
    
    if (meta) {
        response.meta = meta;
    }
    
    return response;
};

/**
 * 에러 응답 포맷
 */
export const errorResponse = (message: string, error?: any, code?: string): ApiErrorResponse => {
    const response: ApiErrorResponse = {
        message,
        timestamp: new Date().toISOString()
    };
    
    if (code) {
        response.code = code;
    }
    
    if (error && process.env.NODE_ENV === 'development') {
        response.error = error;
    }
    
    return response;
};

/**
 * 페이지네이션 메타데이터 생성
 */
export const createPaginationMeta = (page: number, limit: number, total: number): PaginationMeta => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null
        }
    };
};

/**
 * 리스트 응답 포맷 (페이지네이션 포함)
 */
export const listResponse = <T>(
    items: T[], 
    page: number, 
    limit: number, 
    total: number, 
    message: string = '목록 조회 성공'
): ApiSuccessResponse<T[]> => {
    const meta = createPaginationMeta(page, limit, total);
    return successResponse(items, message, meta);
};

/**
 * 생성 응답 포맷
 */
export const createdResponse = <T>(data: T, message: string = '생성 성공'): ApiSuccessResponse<T> => {
    return successResponse(data, message);
};

/**
 * 업데이트 응답 포맷
 */
export const updatedResponse = <T>(data: T, message: string = '업데이트 성공'): ApiSuccessResponse<T> => {
    return successResponse(data, message);
};

/**
 * 삭제 응답 포맷
 */
export const deletedResponse = (message: string = '삭제 성공'): ApiSuccessResponse<null> => {
    return successResponse(null, message);
};

/**
 * 검증 실패 응답 포맷
 */
export const validationErrorResponse = (
    errors: ValidationError[] | Record<string, string>, 
    message: string = '입력 데이터가 유효하지 않습니다'
): ValidationErrorResponse => {
    return {
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
    };
};

/**
 * 인증 실패 응답 포맷
 */
export const unauthorizedResponse = (message: string = '인증이 필요합니다'): ApiErrorResponse => {
    return errorResponse(message, null, 'UNAUTHORIZED');
};

/**
 * 권한 없음 응답 포맷
 */
export const forbiddenResponse = (message: string = '권한이 없습니다'): ApiErrorResponse => {
    return errorResponse(message, null, 'FORBIDDEN');
};

/**
 * 찾을 수 없음 응답 포맷
 */
export const notFoundResponse = (message: string = '요청한 리소스를 찾을 수 없습니다'): ApiErrorResponse => {
    return errorResponse(message, null, 'NOT_FOUND');
};

/**
 * 충돌 응답 포맷
 */
export const conflictResponse = (message: string = '데이터 충돌이 발생했습니다'): ApiErrorResponse => {
    return errorResponse(message, null, 'CONFLICT');
};

/**
 * 서버 에러 응답 포맷
 */
export const serverErrorResponse = (message: string = '서버 내부 오류가 발생했습니다', error?: any): ApiErrorResponse => {
    return errorResponse(message, error, 'INTERNAL_SERVER_ERROR');
};

/**
 * Express 응답 헬퍼 미들웨어
 * 응답 객체에 헬퍼 메서드들을 추가
 */
export const responseHelpers = (req: Request, res: Response, next: NextFunction): void => {
    // 성공 응답
    res.success = <T>(data: T, message: string = '성공', statusCode: number = 200): void => {
        res.status(statusCode).json(successResponse(data, message));
    };
    
    // 에러 응답
    res.error = (message: string, statusCode: number = 500, error?: any): void => {
        res.status(statusCode).json(errorResponse(message, error));
    };
    
    // 리스트 응답
    res.list = <T>(
        items: T[], 
        page: number, 
        limit: number, 
        total: number, 
        message: string = '목록 조회 성공', 
        statusCode: number = 200
    ): void => {
        res.status(statusCode).json(listResponse(items, page, limit, total, message));
    };
    
    // 생성 응답
    res.created = <T>(data: T, message: string = '생성 성공'): void => {
        res.status(201).json(createdResponse(data, message));
    };
    
    // 업데이트 응답
    res.updated = <T>(data: T, message: string = '업데이트 성공'): void => {
        res.status(200).json(updatedResponse(data, message));
    };
    
    // 삭제 응답
    res.deleted = (message: string = '삭제 성공'): void => {
        res.status(200).json(deletedResponse(message));
    };
    
    // 검증 실패 응답
    res.validationError = (
        errors: ValidationError[] | Record<string, string>, 
        message: string = '입력 데이터가 유효하지 않습니다'
    ): void => {
        res.status(400).json(validationErrorResponse(errors, message));
    };
    
    // 인증 실패 응답
    res.unauthorized = (message: string = '인증이 필요합니다'): void => {
        res.status(401).json(unauthorizedResponse(message));
    };
    
    // 권한 없음 응답
    res.forbidden = (message: string = '권한이 없습니다'): void => {
        res.status(403).json(forbiddenResponse(message));
    };
    
    // 찾을 수 없음 응답
    res.notFound = (message: string = '요청한 리소스를 찾을 수 없습니다'): void => {
        res.status(404).json(notFoundResponse(message));
    };
    
    // 충돌 응답
    res.conflict = (message: string = '데이터 충돌이 발생했습니다'): void => {
        res.status(409).json(conflictResponse(message));
    };
    
    // 서버 에러 응답
    res.serverError = (message: string = '서버 내부 오류가 발생했습니다', error?: any): void => {
        res.status(500).json(serverErrorResponse(message, error));
    };
    
    next();
};

export default {
    successResponse,
    errorResponse,
    createPaginationMeta,
    listResponse,
    createdResponse,
    updatedResponse,
    deletedResponse,
    validationErrorResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    conflictResponse,
    serverErrorResponse,
    responseHelpers
};
