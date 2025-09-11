import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { UserService } from '../services/UserService';
import { User } from '../models/User';
import { UserResponse } from '../types/responses/UserResponse';

/**
 * 사용자 관리 컨트롤러
 * Java 패턴 기반 응답 시스템 사용
 */
export class UserController extends BaseController<User> {
    private userService: UserService;

    constructor(userService: UserService) {
        super(userService);
        this.userService = userService;

        // 메서드 바인딩
        this.register = this.register.bind(this);
        this.getByDeviceId = this.getByDeviceId.bind(this);
        this.getById = this.getById.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
    }

    /**
     * 사용자 등록
     * POST /api/user/register
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { device_id } = req.body;

            if (!device_id) {
                res.status(400).json(new UserResponse.DeviceIdRequired());
                return;
            }

            const result = await this.userService.registerUser({ device_id });
            res.status(201).json(new UserResponse.RegisterUserCreated(result));
        } catch (error) {
            this.handleError(res, error as Error);
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
                res.status(404).json(new UserResponse.UserNotFound());
                return;
            }

            res.status(200).json(new UserResponse.GetUserByDeviceIdOK(user));
        } catch (error) {
            this.handleError(res, error as Error);
        }
    }

    /**
     * 사용자 ID로 조회
     * GET /api/user/:id
     */
    override async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);

            if (!user) {
                res.status(404).json(new UserResponse.UserNotFound());
                return;
            }

            res.status(200).json(new UserResponse.GetUserByIdOK(user));
        } catch (error) {
            this.handleError(res, error as Error);
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
                res.status(200).json(new UserResponse.DeleteUserOK());
            } else {
                res.status(404).json(new UserResponse.UserNotFound());
            }
        } catch (error) {
            this.handleError(res, error as Error);
        }
    }

    /**
     * create 메서드 (register로 대체)
     */
    override async create(req: Request, res: Response): Promise<void> {
        await this.register(req, res);
    }

    /**
     * update 메서드 (금지됨)
     */
    override async update(req: Request, res: Response): Promise<void> {
        res.status(403).json(new UserResponse.UserUpdateForbidden());
    }

    /**
     * delete 메서드 (deleteUser로 대체)
     */
    override async delete(req: Request, res: Response): Promise<void> {
        await this.deleteUser(req, res);
    }
}

export default UserController;
