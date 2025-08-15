/**
 * 공통 유틸리티 함수들
 */

export type AnyObject = Record<string, any>;
export type KeyValue = { [key: string]: any };

/**
 * 객체에서 특정 키들만 추출
 */
export const pick = <T extends AnyObject, K extends keyof T>(
    obj: T, 
    keys: K[]
): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = obj[key];
        }
    });
    return result;
};

/**
 * 객체에서 특정 키들 제외
 */
export const omit = <T extends AnyObject, K extends keyof T>(
    obj: T, 
    keys: K[]
): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result as Omit<T, K>;
};

/**
 * 배열을 특정 크기로 분할
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

/**
 * 문자열을 캐멀케이스로 변환
 */
export const toCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * 문자열을 스네이크케이스로 변환
 */
export const toSnakeCase = (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * 객체의 키를 캐멀케이스로 변환
 */
export const keysToCamelCase = <T = any>(obj: any): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(keysToCamelCase) as T;
    }
    
    const result: AnyObject = {};
    Object.keys(obj).forEach(key => {
        const camelKey = toCamelCase(key);
        result[camelKey] = keysToCamelCase(obj[key]);
    });
    
    return result as T;
};

/**
 * 객체의 키를 스네이크케이스로 변환
 */
export const keysToSnakeCase = <T = any>(obj: any): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(keysToSnakeCase) as T;
    }
    
    const result: AnyObject = {};
    Object.keys(obj).forEach(key => {
        const snakeKey = toSnakeCase(key);
        result[snakeKey] = keysToSnakeCase(obj[key]);
    });
    
    return result as T;
};

/**
 * 깊은 복사
 */
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
    if (typeof obj === 'object') {
        const clonedObj: AnyObject = {};
        Object.keys(obj).forEach(key => {
            clonedObj[key] = deepClone((obj as AnyObject)[key]);
        });
        return clonedObj as T;
    }
    return obj;
};

/**
 * 랜덤 문자열 생성
 */
export const generateRandomString = (
    length: number = 10, 
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
};

/**
 * 안전한 랜덤 문자열 생성 (crypto 사용)
 */
export const generateSecureRandomString = (length: number = 32): string => {
    const crypto = require('crypto');
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

/**
 * 이메일 마스킹
 */
export const maskEmail = (email: string): string => {
    if (!email || typeof email !== 'string') return email;
    
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    
    const maskedUsername = username.length > 2 
        ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
        : username[0] + '*';
    
    return `${maskedUsername}@${domain}`;
};

/**
 * 전화번호 마스킹
 */
export const maskPhone = (phone: string): string => {
    if (!phone || typeof phone !== 'string') return phone;
    
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 8) return phone;
    
    const masked = cleaned.slice(0, 3) + '*'.repeat(cleaned.length - 6) + cleaned.slice(-3);
    return masked;
};

/**
 * 일반적인 문자열 마스킹
 */
export const maskString = (str: string, visibleStart: number = 2, visibleEnd: number = 2): string => {
    if (!str || typeof str !== 'string') return str;
    if (str.length <= visibleStart + visibleEnd) return str;
    
    const start = str.slice(0, visibleStart);
    const end = str.slice(-visibleEnd);
    const masked = '*'.repeat(str.length - visibleStart - visibleEnd);
    
    return start + masked + end;
};

/**
 * 배열에서 중복 제거
 */
export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
    if (!Array.isArray(array)) return array;
    
    if (key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }
    
    return [...new Set(array)];
};

/**
 * 배열을 특정 키로 그룹화
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {} as Record<string, T[]>);
};

/**
 * 배열에서 특정 키로 인덱스 맵 생성
 */
export const indexBy = <T>(array: T[], key: keyof T): Record<string, T> => {
    return array.reduce((index, item) => {
        const indexKey = String(item[key]);
        index[indexKey] = item;
        return index;
    }, {} as Record<string, T>);
};

/**
 * 지연 실행
 */
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 재시도 로직
 */
export const retry = async <T>(
    fn: () => Promise<T>, 
    retries: number = 3, 
    delayMs: number = 1000
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            await delay(delayMs);
            return retry(fn, retries - 1, delayMs);
        }
        throw error;
    }
};

/**
 * 디바운스 함수
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T, 
    wait: number
): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

/**
 * 스로틀 함수
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T, 
    limit: number
): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * 숫자를 범위 내로 제한
 */
export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

/**
 * 문자열이 빈 값인지 확인 (null, undefined, 빈 문자열, 공백만 있는 문자열)
 */
export const isEmpty = (str: any): boolean => {
    return str === null || str === undefined || (typeof str === 'string' && str.trim() === '');
};

/**
 * 문자열이 유효한 값인지 확인
 */
export const isNotEmpty = (str: any): boolean => {
    return !isEmpty(str);
};

/**
 * 바이트 크기를 읽기 쉬운 형태로 변환
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * 현재 타임스탬프 반환 (ISO 형식)
 */
export const getCurrentTimestamp = (): string => {
    return new Date().toISOString();
};

/**
 * URL 슬러그 생성
 */
export const createSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // 특수문자 제거
        .replace(/[\s_-]+/g, '-') // 공백, 언더스코어를 하이픈으로
        .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
};

// 기본 내보내기
export default {
    pick,
    omit,
    chunk,
    toCamelCase,
    toSnakeCase,
    keysToCamelCase,
    keysToSnakeCase,
    deepClone,
    generateRandomString,
    generateSecureRandomString,
    maskEmail,
    maskPhone,
    maskString,
    removeDuplicates,
    groupBy,
    indexBy,
    delay,
    retry,
    debounce,
    throttle,
    clamp,
    isEmpty,
    isNotEmpty,
    formatBytes,
    getCurrentTimestamp,
    createSlug
};
