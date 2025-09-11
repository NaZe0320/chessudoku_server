import { Request, Response, NextFunction } from 'express';
import { BaseService, DatabaseRecord, PaginationOptions } from '../services/BaseService';
import { QueryConditions } from '../repositories/BaseRepository';
import { BaseResponse } from '../types/responses/BaseResponse';

export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}

export interface SortParams {
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
}

export interface SearchParams {
    search: string;
    searchFields: string[];
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    meta?: any;
    timestamp: string;
}

export interface ApiError {
    success: false;
    message: string;
    timestamp: string;
    error?: any;
}

/**
 * 모든 Controller가 상속받는 기본 Controller 클래스
 * Java 패턴 기반 응답 시스템 사용
 */
export abstract class BaseController<T extends DatabaseRecord = DatabaseRecord> {
    protected service: BaseService<T>;

    constructor(service: BaseService<T>) {
        this.service = service;
        
        // 메서드 바인딩
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.getPaginated = this.getPaginated.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.deleteBy = this.deleteBy.bind(this);
        this.count = this.count.bind(this);
        this.exists = this.exists.bind(this);
    }

    /**
     * 성공 응답 전송
     */
    protected sendSuccess<D = any>(
        res: Response, 
        data: D, 
        message: string = '성공', 
        statusCode: number = 200,
        meta?: any
    ): void {
        const response: ApiResponse<D> = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };

        if (meta) {
            response.meta = meta;
        }

        res.status(statusCode).json(response);
    }

    /**
     * 에러 응답 전송
     */
    protected sendError(
        res: Response, 
        error: Error | string, 
        statusCode: number = 500
    ): void {
        const message = error instanceof Error ? error.message : error;
        
        console.error(`Controller Error [${statusCode}]:`, message);
        
        const response: ApiError = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        if (process.env.NODE_ENV === 'development' && error instanceof Error) {
            response.error = {
                stack: error.stack,
                name: error.name
            };
        }

        res.status(statusCode).json(response);
    }

    /**
     * 에러 상태 코드를 자동으로 결정하여 에러 응답 전송
     */
    protected sendErrorAuto(
        res: Response, 
        error: Error | string
    ): void {
        const message = error instanceof Error ? error.message : error;
        const statusCode = this.getErrorStatusCode(message);
        this.sendError(res, error, statusCode);
    }

    /**
     * Java 패턴 기반 에러 처리 헬퍼
     */
    protected handleError(res: Response, error: Error): void {
        console.error('Controller Error:', error);
        
        // 에러 메시지에 따른 응답 결정
        if (error.message.includes('찾을 수 없습니다') || error.message.includes('존재하지')) {
            res.status(404).json(new BaseResponse.NotFound(error.message));
        } else if (error.message.includes('필수') || 
                   error.message.includes('유효하지 않은') || 
                   error.message.includes('형식') ||
                   error.message.includes('조건')) {
            res.status(400).json(new BaseResponse.BadRequest(error.message));
        } else if (error.message.includes('인증') || error.message.includes('권한')) {
            res.status(401).json(new BaseResponse.Unauthorized(error.message));
        } else if (error.message.includes('접근') || error.message.includes('금지')) {
            res.status(403).json(new BaseResponse.Forbidden(error.message));
        } else if (error.message.includes('이미') || error.message.includes('중복')) {
            res.status(409).json(new BaseResponse.Conflict(error.message));
        } else {
            res.status(500).json(new BaseResponse.InternalServerError(error.message));
        }
    }

    /**
     * 에러 메시지 기반 상태 코드 결정
     */
    private getErrorStatusCode(message: string): number {
        const lowerMessage = message.toLowerCase();
        
        // 400 Bad Request
        if (lowerMessage.includes('필수') || 
            lowerMessage.includes('유효하지 않은') || 
            lowerMessage.includes('형식') || 
            lowerMessage.includes('조건') ||
            lowerMessage.includes('검증') ||
            lowerMessage.includes('잘못된')) {
            return 400;
        }
        
        // 401 Unauthorized
        if (lowerMessage.includes('인증') || 
            lowerMessage.includes('권한') ||
            lowerMessage.includes('토큰')) {
            return 401;
        }
        
        // 403 Forbidden
        if (lowerMessage.includes('접근') || 
            lowerMessage.includes('금지') ||
            lowerMessage.includes('수정할 수 없습니다')) {
            return 403;
        }
        
        // 404 Not Found
        if (lowerMessage.includes('찾을 수 없습니다') || 
            lowerMessage.includes('존재하지') ||
            lowerMessage.includes('없습니다')) {
            return 404;
        }
        
        // 409 Conflict
        if (lowerMessage.includes('이미') || 
            lowerMessage.includes('중복') ||
            lowerMessage.includes('충돌')) {
            return 409;
        }
        
        // 422 Unprocessable Entity
        if (lowerMessage.includes('처리할 수 없는') || 
            lowerMessage.includes('유효성 검사')) {
            return 422;
        }
        
        // 기본값: 500 Internal Server Error
        return 500;
    }

    /**
     * 모든 레코드 조회
     * GET /api/resource
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.service.getAll();
            this.sendSuccess(res, data, '데이터 조회 성공');
        } catch (error) {
            this.sendErrorAuto(res, error as Error);
        }
    }

    /**
     * 페이지네이션을 포함한 레코드 조회
     * GET /api/resource/paginated
     */
    async getPaginated(req: Request, res: Response): Promise<void> {
        try {
            const paginationParams = this.getPaginationParams(req);
            const sortParams = this.getSortParams(req);
            const searchParams = this.getSearchParams(req);

            const options: PaginationOptions = {
                page: paginationParams.page,
                limit: paginationParams.limit,
                orderBy: sortParams.sortBy,
                orderDirection: sortParams.sortOrder
            };

            // 검색 조건 구성 (하위 클래스에서 오버라이드 가능)
            const conditions = await this.buildSearchConditions(searchParams);

            const result = await this.service.getPaginated(options, conditions);
            
            this.sendSuccess(
                res, 
                result.items, 
                '페이지네이션 조회 성공',
                200,
                {
                    pagination: {
                        currentPage: result.page,
                        totalPages: result.totalPages,
                        totalItems: result.total,
                        itemsPerPage: result.limit,
                        hasNextPage: result.hasNextPage,
                        hasPrevPage: result.hasPrevPage
                    }
                }
            );
        } catch (error) {
            this.sendErrorAuto(res, error as Error);
        }
    }

    /**
     * ID로 레코드 조회
     * GET /api/resource/:id
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            if (!id) {
                return this.sendError(res, 'ID가 필요합니다', 400);
            }

            const data = await this.service.getById(id);
            this.sendSuccess(res, data, '데이터 조회 성공');
        } catch (error) {
            const statusCode = (error as Error).message === '데이터를 찾을 수 없습니다' ? 404 : 500;
            this.sendError(res, error as Error, statusCode);
        }
    }

    /**
     * 새 레코드 생성
     * POST /api/resource
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            
            if (!data || Object.keys(data).length === 0) {
                return this.sendError(res, '요청 데이터가 필요합니다', 400);
            }

            // 생성 전 데이터 처리 (하위 클래스에서 오버라이드 가능)
            const processedData = await this.beforeCreate(data, req);

            const result = await this.service.create(processedData);
            
            // 생성 후 데이터 처리 (하위 클래스에서 오버라이드 가능)
            const finalResult = await this.afterCreate(result, req);

            this.sendSuccess(res, finalResult, '데이터 생성 성공', 201);
        } catch (error) {
            const statusCode = this.getValidationErrorStatusCode(error as Error);
            this.sendError(res, error as Error, statusCode);
        }
    }

    /**
     * 레코드 업데이트
     * PUT /api/resource/:id
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const data = req.body;
            
            if (!id) {
                return this.sendError(res, 'ID가 필요합니다', 400);
            }

            if (!data || Object.keys(data).length === 0) {
                return this.sendError(res, '업데이트할 데이터가 필요합니다', 400);
            }

            // 업데이트 전 데이터 처리 (하위 클래스에서 오버라이드 가능)
            const processedData = await this.beforeUpdate(data, req);

            const result = await this.service.update(id, processedData);
            
            // 업데이트 후 데이터 처리 (하위 클래스에서 오버라이드 가능)
            const finalResult = await this.afterUpdate(result, req);

            this.sendSuccess(res, finalResult, '데이터 업데이트 성공');
        } catch (error) {
            let statusCode = 500;
            const message = (error as Error).message;
            
            if (message === '데이터를 찾을 수 없습니다') {
                statusCode = 404;
            } else if (this.isValidationError(error as Error)) {
                statusCode = 400;
            }
            
            this.sendError(res, error as Error, statusCode);
        }
    }

    /**
     * 레코드 삭제
     * DELETE /api/resource/:id
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            if (!id) {
                return this.sendError(res, 'ID가 필요합니다', 400);
            }

            // 삭제 전 처리 (하위 클래스에서 오버라이드 가능)
            await this.beforeDelete(id, req);

            const result = await this.service.delete(id);
            
            if (result) {
                // 삭제 후 처리 (하위 클래스에서 오버라이드 가능)
                await this.afterDelete(id, req);
                this.sendSuccess(res, null, '데이터 삭제 성공');
            } else {
                this.sendError(res, '삭제 실패', 500);
            }
        } catch (error) {
            const statusCode = (error as Error).message === '데이터를 찾을 수 없습니다' ? 404 : 500;
            this.sendError(res, error as Error, statusCode);
        }
    }

    /**
     * 조건으로 레코드 삭제
     * DELETE /api/resource
     */
    async deleteBy(req: Request, res: Response): Promise<void> {
        try {
            const conditions = req.body;
            
            if (!conditions || Object.keys(conditions).length === 0) {
                return this.sendError(res, '삭제 조건이 필요합니다', 400);
            }

            const deletedCount = await this.service.deleteBy(conditions);
            
            this.sendSuccess(res, { deletedCount }, `${deletedCount}개의 데이터가 삭제되었습니다`);
        } catch (error) {
            this.sendErrorAuto(res, error as Error);
        }
    }

    /**
     * 레코드 개수 조회
     * GET /api/resource/count
     */
    async count(req: Request, res: Response): Promise<void> {
        try {
            const conditions = req.query as QueryConditions;
            const count = await this.service.count(conditions);
            
            this.sendSuccess(res, { count }, '개수 조회 성공');
        } catch (error) {
            this.sendErrorAuto(res, error as Error);
        }
    }

    /**
     * 레코드 존재 여부 확인
     * GET /api/resource/exists
     */
    async exists(req: Request, res: Response): Promise<void> {
        try {
            const conditions = req.query as QueryConditions;
            
            if (!conditions || Object.keys(conditions).length === 0) {
                return this.sendError(res, '확인 조건이 필요합니다', 400);
            }

            const exists = await this.service.exists(conditions);
            
            this.sendSuccess(res, { exists }, '존재 여부 확인 성공');
        } catch (error) {
            this.sendErrorAuto(res, error as Error);
        }
    }

    /**
     * 페이지네이션을 위한 파라미터 추출
     */
    protected getPaginationParams(req: Request): PaginationParams {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
        const offset = (page - 1) * limit;

        return { page, limit, offset };
    }

    /**
     * 정렬을 위한 파라미터 추출
     */
    protected getSortParams(req: Request, defaultSort: string = 'created_at'): SortParams {
        const sortBy = (req.query.sortBy as string) || defaultSort;
        const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'ASC' : 'DESC';

        return { sortBy, sortOrder };
    }

    /**
     * 검색을 위한 파라미터 추출
     */
    protected getSearchParams(req: Request): SearchParams {
        const search = (req.query.search as string) || '';
        const searchFields = req.query.searchFields ? 
            (req.query.searchFields as string).split(',') : [];

        return { search, searchFields };
    }

    /**
     * 검색 조건 구성 (하위 클래스에서 오버라이드)
     */
    protected async buildSearchConditions(searchParams: SearchParams): Promise<QueryConditions> {
        return {};
    }

    /**
     * 생성 전 데이터 처리 (하위 클래스에서 오버라이드)
     */
    protected async beforeCreate(data: any, req: Request): Promise<any> {
        return data;
    }

    /**
     * 생성 후 데이터 처리 (하위 클래스에서 오버라이드)
     */
    protected async afterCreate(result: T, req: Request): Promise<T> {
        return result;
    }

    /**
     * 업데이트 전 데이터 처리 (하위 클래스에서 오버라이드)
     */
    protected async beforeUpdate(data: any, req: Request): Promise<any> {
        return data;
    }

    /**
     * 업데이트 후 데이터 처리 (하위 클래스에서 오버라이드)
     */
    protected async afterUpdate(result: T, req: Request): Promise<T> {
        return result;
    }

    /**
     * 삭제 전 처리 (하위 클래스에서 오버라이드)
     */
    protected async beforeDelete(id: string | number, req: Request): Promise<void> {
        // 기본적으로 아무것도 하지 않음
    }

    /**
     * 삭제 후 처리 (하위 클래스에서 오버라이드)
     */
    protected async afterDelete(id: string | number, req: Request): Promise<void> {
        // 기본적으로 아무것도 하지 않음
    }

    /**
     * 검증 에러인지 확인
     */
    private isValidationError(error: Error): boolean {
        const message = error.message;
        return message.includes('필수') || 
               message.includes('유효하지 않은') ||
               message.includes('형식') ||
               message.includes('조건');
    }

    /**
     * 검증 에러 상태 코드 반환
     */
    private getValidationErrorStatusCode(error: Error): number {
        if (this.isValidationError(error)) {
            return 400;
        }
        return 500;
    }
}
