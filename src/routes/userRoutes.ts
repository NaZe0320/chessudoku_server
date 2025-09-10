import express, { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { validateRequiredFields, validateIdParam } from '../middlewares/validator';

// 의존성 주입
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router: Router = express.Router();

/**
 * 사용자 등록
 * POST /api/user/register
 */
router.post('/register',
    validateRequiredFields(['device_id']),
    userController.register
);

/**
 * 디바이스 ID로 사용자 조회
 * GET /api/user/device/:device_id
 */
router.get('/device/:device_id',
    userController.getByDeviceId
);

/**
 * 사용자 ID로 조회
 * GET /api/user/:user_id
 */
router.get('/:user_id',
    userController.getById
);

/**
 * 사용자 삭제
 * DELETE /api/user/:user_id
 */
router.delete('/:user_id',
    userController.deleteUser
);

export default router;
