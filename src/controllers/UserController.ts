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
                res.status(400).json({
                    success: false,
                    message: '디바이스 ID는 필수입니다'
                });
                return;
            }

            const result = await this.userService.registerUser({ device_id });

            res.status(201).json({
                success: true,
                message: '사용자가 성공적으로 등록되었습니다',
                data: result
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('이미 등록된') || err.message.includes('중복')) {
                statusCode = 409;
            } else if (err.message.includes('필수') || err.message.includes('검증')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
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
                res.status(404).json({
                    success: false,
                    message: '사용자를 찾을 수 없습니다'
                });
                return;
            }

            res.json({
                success: true,
                message: '사용자 정보 조회 성공',
                data: user
            });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                success: false,
                message: err.message
            });
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
                res.json({
                    success: true,
                    message: '사용자가 성공적으로 삭제되었습니다'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: '사용자를 찾을 수 없습니다'
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                success: false,
                message: err.message
            });
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
                res.status(404).json({
                    success: false,
                    message: '사용자를 찾을 수 없습니다'
                });
                return;
            }

            res.json({
                success: true,
                message: '사용자 정보 조회 성공',
                data: user
            });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }

    override async create(req: Request, res: Response): Promise<void> {
        // register로 대체
        await this.register(req, res);
    }

    override async update(req: Request, res: Response): Promise<void> {
        res.status(403).json({
            success: false,
            message: '사용자 정보는 수정할 수 없습니다'
        });
    }

    override async delete(req: Request, res: Response): Promise<void> {
        // deleteUser로 대체
        await this.deleteUser(req, res);
    }
}

export default UserController;
