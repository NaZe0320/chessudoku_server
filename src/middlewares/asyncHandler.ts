import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../controllers/BaseController';

/**
 * 비동기 Controller 메서드를 자동으로 래핑하는 미들웨어
 * try-catch 로직을 자동화하고 일관된 에러 처리를 제공
 */
export function asyncHandler<T extends BaseController>(
    controller: T,
    methodName: keyof T
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const method = controller[methodName] as Function;
            await method.call(controller, req, res);
        } catch (error) {
            // 직접 에러 응답 생성 (BaseController의 protected 메서드 대신)
            const err = error as Error;
            const statusCode = getErrorStatusCode(err);
            
            res.status(statusCode).json({
                success: false,
                message: err.message,
                timestamp: new Date().toISOString()
            });
        }
    };
}

/**
 * 커스텀 에러 상태 코드와 함께 비동기 메서드를 래핑하는 미들웨어
 */
export function asyncHandlerWithStatus<T extends BaseController>(
    controller: T,
    methodName: keyof T,
    getStatusCode?: (error: Error) => number
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const method = controller[methodName] as Function;
            await method.call(controller, req, res);
        } catch (error) {
            const err = error as Error;
            const statusCode = getStatusCode ? getStatusCode(err) : getErrorStatusCode(err);
            
            res.status(statusCode).json({
                success: false,
                message: err.message,
                timestamp: new Date().toISOString()
            });
        }
    };
}

/**
 * 에러 상태 코드를 자동으로 결정하는 헬퍼 함수
 */
export function getErrorStatusCode(error: Error): number {
    const message = error.message.toLowerCase();
    
    // 400 Bad Request
    if (message.includes('필수') || 
        message.includes('유효하지 않은') || 
        message.includes('형식') || 
        message.includes('조건') ||
        message.includes('검증') ||
        message.includes('잘못된')) {
        return 400;
    }
    
    // 401 Unauthorized
    if (message.includes('인증') || 
        message.includes('권한') ||
        message.includes('토큰')) {
        return 401;
    }
    
    // 403 Forbidden
    if (message.includes('접근') || 
        message.includes('금지') ||
        message.includes('수정할 수 없습니다')) {
        return 403;
    }
    
    // 404 Not Found
    if (message.includes('찾을 수 없습니다') || 
        message.includes('존재하지') ||
        message.includes('없습니다')) {
        return 404;
    }
    
    // 409 Conflict
    if (message.includes('이미') || 
        message.includes('중복') ||
        message.includes('충돌')) {
        return 409;
    }
    
    // 422 Unprocessable Entity
    if (message.includes('처리할 수 없는') || 
        message.includes('유효성 검사')) {
        return 422;
    }
    
    // 기본값: 500 Internal Server Error
    return 500;
}
