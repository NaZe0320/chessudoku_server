import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { UserService } from '../services/UserService';
import { User } from '../models/User';

/**
 * 사용자 관리 컨트롤러
 */
export class UserController extends BaseController<User> {
    private userService: UserService;

    constructor(userService: UserService) {
        super(userService);
        this.userService = userService;

        // 메서드 바인딩
        this.register = this.register.bind(this);
        this.getByDeviceId = this.getByDeviceId.bind(this);
    }

    /**
     * 사용자 등록
     * POST /api/user/register
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { device_id } = req.body;

            if (!device_id) {
                return this.sendError(res, '디바이스 ID는 필수입니다', 400);
            }

            const result = await this.userService.registerUser({ device_id });
            this.sendSuccess(res, result, '사용자가 성공적으로 등록되었습니다', 201);
        } catch (error) {
            this.sendErrorAuto(res, error as Error);
        }
    }

    /**
     * 디바이스 ID로 사용자 조회
     * GET /api/user/device/:device_id
     */
    async getByDeviceId(req: Request, res: Response): Promise<void> {
        try {
            const { device_id } = req.params;

            const user = await this.userService.getUserByDeviceId(device_id);

            if (!user) {
                return this.sendError(res, '사용자를 찾을 수 없습니다', 404);
            }

            this.sendSuccess(res, user, '사용자 정보 조회 성공');
        } catch (error) {
            this.sendErrorAuto(res, error as Error);
        }
    }


    /**
     * 사용자 삭제
     * DELETE /api/user/:user_id
     */
    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { user_id } = req.params;

            const deleted = await this.userService.deleteUser(user_id);

            if (deleted) {
                this.sendSuccess(res, null, '사용자가 성공적으로 삭제되었습니다');
            } else {
                return this.sendError(res, '사용자를 찾을 수 없습니다', 404);
            }
        } catch (error) {
            this.sendErrorAuto(res, error as Error);
        }
    }

    /**
     * BaseController 메서드 오버라이드
     */
    override async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);

            if (!user) {
                return this.sendError(res, '사용자를 찾을 수 없습니다', 404);
            }

            this.sendSuccess(res, user, '사용자 정보 조회 성공');
        } catch (error) {
            this.sendErrorAuto(res, error as Error);
        }
    }

    override async create(req: Request, res: Response): Promise<void> {
        // register로 대체
        await this.register(req, res);
    }

    override async update(req: Request, res: Response): Promise<void> {
        this.sendError(res, '사용자 정보는 수정할 수 없습니다', 403);
    }

    override async delete(req: Request, res: Response): Promise<void> {
        // deleteUser로 대체
        await this.deleteUser(req, res);
    }
}

export default UserController;
