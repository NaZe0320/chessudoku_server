import { Request, Response } from 'express';
import { BaseService, DatabaseRecord } from '../services/BaseService';
import { BaseResponse } from '../types/responses/BaseResponse';

/**
 * 모든 Controller가 상속받는 기본 Controller 클래스
 * Java 패턴 기반 응답 시스템 사용
 */
export abstract class BaseController<T extends DatabaseRecord = DatabaseRecord> {
    protected service: BaseService<T>;

    constructor(service: BaseService<T>) {
        this.service = service;
    }

    /**
     * ID로 레코드 조회 (하위 클래스에서 오버라이드 가능)
     * GET /api/resource/:id
     */
    async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.json(new BaseResponse.BadRequest('ID가 필요합니다'));
            }

            const data = await this.service.getById(id);
            return res.json(new BaseResponse.OK(data, '데이터 조회 성공'));
        } catch (error) {
            const message = (error as Error).message;
            if (message === '데이터를 찾을 수 없습니다') {
                return res.json(new BaseResponse.NotFound(message));
            }
            return res.json(new BaseResponse.InternalServerError(message));
        }
    }

    /**
     * 새 레코드 생성 (하위 클래스에서 오버라이드 필요)
     * POST /api/resource
     */
    abstract create(req: Request, res: Response): Promise<Response>;

    /**
     * 레코드 업데이트 (하위 클래스에서 오버라이드 필요)
     * PUT /api/resource/:id
     */
    abstract update(req: Request, res: Response): Promise<Response>;

    /**
     * 레코드 삭제 (하위 클래스에서 오버라이드 필요)
     * DELETE /api/resource/:id
     */
    abstract delete(req: Request, res: Response): Promise<Response>;
}
