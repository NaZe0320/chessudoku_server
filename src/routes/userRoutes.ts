import express, { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { validateRequiredFields } from '../middlewares/validator';

// 의존성 주입
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router: Router = express.Router();


/**
 * @swagger
 * /api/user/device/{device_id}:
 *   get:
 *     summary: 디바이스 ID로 사용자 조회 또는 자동 등록
 *     description: 디바이스 ID를 사용하여 사용자 정보를 조회합니다. 사용자가 없으면 자동으로 등록합니다.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: device_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 디바이스 고유 ID
 *         example: "test-device-001"
 *     responses:
 *       200:
 *         description: 사용자 조회 성공 (기존 사용자) 또는 자동 등록 성공 (신규 사용자)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "사용자 정보를 조회했습니다"
 *               data:
 *                 user_id: "ABC12345"
 *                 device_id: "test-device-001"
 *                 nickname: "사용자1703123456789"
 *                 create_at: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: 잘못된 요청 (디바이스 ID 누락 등)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * 디바이스 ID로 사용자 조회 (없으면 404)
 * GET /api/user/device/:device_id
 */
router.get('/device/:device_id',
    userController.getByDeviceId
);

/**
 * 디바이스 ID로 사용자 조회 (없으면 자동 등록)
 * GET /api/user/device/:device_id/create
 */
router.get('/device/:device_id/create',
    userController.getByDeviceIdOrCreate
);

/**
 * @swagger
 * /api/user/{user_id}:
 *   get:
 *     summary: 사용자 ID로 조회
 *     description: 사용자 ID를 사용하여 사용자 정보를 조회합니다.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 고유 ID
 *         example: "ABC12345"
 *     responses:
 *       200:
 *         description: 사용자 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: 사용자 삭제
 *     description: 사용자 ID를 사용하여 사용자를 삭제합니다.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 고유 ID
 *         example: "ABC12345"
 *     responses:
 *       200:
 *         description: 사용자 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
