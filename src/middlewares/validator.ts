import { Request, Response, NextFunction } from 'express';

export interface ValidationOptions {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
}

export interface ValidationErrorResponse {
    success: false;
    message: string;
}

/**
 * 필수 필드 검증
 */
export const validateRequiredFields = (requiredFields: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const missingFields: string[] = [];
        
        for (const field of requiredFields) {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        }
        
        if (missingFields.length > 0) {
            res.status(400).json({
                success: false,
                message: `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`
            } as ValidationErrorResponse);
            return;
        }
        
        next();
    };
};

/**
 * 이메일 형식 검증
 */
export const validateEmail = (fieldName: string = 'email') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const email = req.body[fieldName];
        
        if (email && typeof email === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({
                    success: false,
                    message: `유효하지 않은 이메일 형식입니다: ${fieldName}`
                } as ValidationErrorResponse);
                return;
            }
        }
        
        next();
    };
};

/**
 * 비밀번호 강도 검증
 */
export const validatePassword = (fieldName: string = 'password', options: ValidationOptions = {}) => {
    const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSpecialChars = false
    } = options;
    
    return (req: Request, res: Response, next: NextFunction): void => {
        const password = req.body[fieldName];
        
        if (password && typeof password === 'string') {
            const errors: string[] = [];
            
            if (password.length < minLength) {
                errors.push(`최소 ${minLength}자 이상이어야 합니다`);
            }
            
            if (requireUppercase && !/[A-Z]/.test(password)) {
                errors.push('대문자를 포함해야 합니다');
            }
            
            if (requireLowercase && !/[a-z]/.test(password)) {
                errors.push('소문자를 포함해야 합니다');
            }
            
            if (requireNumbers && !/\d/.test(password)) {
                errors.push('숫자를 포함해야 합니다');
            }
            
            if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                errors.push('특수문자를 포함해야 합니다');
            }
            
            if (errors.length > 0) {
                res.status(400).json({
                    success: false,
                    message: `비밀번호 조건을 만족하지 않습니다: ${errors.join(', ')}`
                } as ValidationErrorResponse);
                return;
            }
        }
        
        next();
    };
};

/**
 * 숫자 범위 검증
 */
export const validateNumberRange = (fieldName: string, min: number, max: number) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const value = req.body[fieldName];
        
        if (value !== undefined && value !== null) {
            const num = Number(value);
            
            if (isNaN(num)) {
                res.status(400).json({
                    success: false,
                    message: `${fieldName}은(는) 숫자여야 합니다`
                } as ValidationErrorResponse);
                return;
            }
            
            if (num < min || num > max) {
                res.status(400).json({
                    success: false,
                    message: `${fieldName}은(는) ${min}과 ${max} 사이의 값이어야 합니다`
                } as ValidationErrorResponse);
                return;
            }
        }
        
        next();
    };
};

/**
 * 문자열 길이 검증
 */
export const validateStringLength = (fieldName: string, minLength: number, maxLength: number) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const value = req.body[fieldName];
        
        if (value && typeof value === 'string') {
            if (value.length < minLength || value.length > maxLength) {
                res.status(400).json({
                    success: false,
                    message: `${fieldName}의 길이는 ${minLength}자 이상 ${maxLength}자 이하여야 합니다`
                } as ValidationErrorResponse);
                return;
            }
        }
        
        next();
    };
};

/**
 * 배열 검증
 */
export const validateArray = (fieldName: string, minLength: number = 0, maxLength: number = Infinity) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const value = req.body[fieldName];
        
        if (value !== undefined && value !== null) {
            if (!Array.isArray(value)) {
                res.status(400).json({
                    success: false,
                    message: `${fieldName}은(는) 배열이어야 합니다`
                } as ValidationErrorResponse);
                return;
            }
            
            if (value.length < minLength || value.length > maxLength) {
                res.status(400).json({
                    success: false,
                    message: `${fieldName}의 길이는 ${minLength} 이상 ${maxLength} 이하여야 합니다`
                } as ValidationErrorResponse);
                return;
            }
        }
        
        next();
    };
};

/**
 * ID 파라미터 검증 (URL 파라미터)
 */
export const validateIdParam = (paramName: string = 'id') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const id = req.params[paramName];
        
        if (!id) {
            res.status(400).json({
                success: false,
                message: `${paramName}가 필요합니다`
            } as ValidationErrorResponse);
            return;
        }
        
        // 숫자 ID 검증
        if (!/^\d+$/.test(id)) {
            res.status(400).json({
                success: false,
                message: `유효하지 않은 ${paramName} 형식입니다`
            } as ValidationErrorResponse);
            return;
        }
        
        next();
    };
};

/**
 * UUID 검증
 */
export const validateUUID = (fieldName: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    return (req: Request, res: Response, next: NextFunction): void => {
        const value = req.body[fieldName] || req.params[fieldName];
        
        if (value && !uuidRegex.test(value)) {
            res.status(400).json({
                success: false,
                message: `${fieldName}은(는) 유효한 UUID 형식이어야 합니다`
            } as ValidationErrorResponse);
            return;
        }
        
        next();
    };
};

/**
 * 날짜 형식 검증 (ISO 8601)
 */
export const validateDateISO = (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const value = req.body[fieldName];
        
        if (value) {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                res.status(400).json({
                    success: false,
                    message: `${fieldName}은(는) 유효한 날짜 형식이어야 합니다 (ISO 8601)`
                } as ValidationErrorResponse);
                return;
            }
        }
        
        next();
    };
};

/**
 * 숫자 타입 검증 (정수)
 */
export const validateInteger = (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const value = req.body[fieldName];
        
        if (value !== undefined && value !== null) {
            const num = Number(value);
            if (isNaN(num) || !Number.isInteger(num)) {
                res.status(400).json({
                    success: false,
                    message: `${fieldName}은(는) 정수여야 합니다`
                } as ValidationErrorResponse);
                return;
            }
        }
        
        next();
    };
};

/**
 * 복합 검증 (여러 검증을 조합)
 */
export const validateComposite = (...validators: Array<(req: Request, res: Response, next: NextFunction) => void>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        for (const validator of validators) {
            const promise = new Promise<void>((resolve, reject) => {
                validator(req, res, (error?: any) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
            
            try {
                await promise;
            } catch (error) {
                return; // 검증 실패 시 중단
            }
        }
        
        next();
    };
};

// 기본 내보내기
export default {
    validateRequiredFields,
    validateEmail,
    validatePassword,
    validateNumberRange,
    validateStringLength,
    validateArray,
    validateIdParam,
    validateUUID,
    validateDateISO,
    validateInteger,
    validateComposite
};
