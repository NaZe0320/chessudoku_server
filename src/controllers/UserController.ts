import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { UserService } from '../services/UserService';
import { User } from '../models/User';
import { UserResponse } from '../types/responses/UserResponse';
import { BaseResponse } from '../types/responses/BaseResponse';

/**
 * 사용자 관리 컨트롤러
 * Java 패턴 기반 응답 시스템 사용
 */
export class UserController extends BaseController<User> {
    private userService: UserService;

    constructor(userService: UserService) {
        super(userService);
        this.userService = userService;
    }

    /**
     * 사용자 등록
     * POST /api/user/register
     */
    async register(req: Request, res: Response): Promise<Response> {
        try {
            const { device_id } = req.body;

            if (!device_id) {
                return res.json(new UserResponse.DeviceIdRequired());
            }

            const result = await this.userService.registerUser({ device_id });
            return res.json(new UserResponse.RegisterUserCreated(result));
        } catch (error) {
            return res.json(new BaseResponse.InternalServerError((error as Error).message));
        }
    }

    /**
     * 디바이스 ID로 사용자 조회
     * GET /api/user/device/:device_id
     */
    async getByDeviceId(req: Request, res: Response): Promise<Response> {
        try {
            const { device_id } = req.params;

            const user = await this.userService.getUserByDeviceId(device_id);

            if (!user) {
                return res.json(new UserResponse.UserNotFound());
            }

            return res.json(new UserResponse.GetUserByDeviceIdOK(user));
        } catch (error) {
            return res.json(new BaseResponse.InternalServerError((error as Error).message));
        }
    }

    /**
     * 사용자 ID로 조회
     * GET /api/user/:id
     */
    override async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);

            if (!user) {
                return res.json(new UserResponse.UserNotFound());
            }

            return res.json(new UserResponse.GetUserByIdOK(user));
        } catch (error) {
            return res.json(new BaseResponse.InternalServerError((error as Error).message));
        }
    }

    /**
     * 사용자 삭제
     * DELETE /api/user/:user_id
     */
    async deleteUser(req: Request, res: Response): Promise<Response> {
        try {
            const { user_id } = req.params;

            const deleted = await this.userService.deleteUser(user_id);

            if (deleted) {
                return res.json(new UserResponse.DeleteUserOK());
            } else {
                return res.json(new UserResponse.UserNotFound());
            }
        } catch (error) {
            return res.json(new BaseResponse.InternalServerError((error as Error).message));
        }
    }

    /**
     * create 메서드 (register로 대체)
     */
    async create(req: Request, res: Response): Promise<Response> {
        return await this.register(req, res);
    }

    /**
     * update 메서드 (금지됨)
     */
    async update(req: Request, res: Response): Promise<Response> {
        return res.json(new UserResponse.UserUpdateForbidden());
    }

    /**
     * delete 메서드 (deleteUser로 대체)
     */
    async delete(req: Request, res: Response): Promise<Response> {
        return await this.deleteUser(req, res);
    }
}

export default UserController;
