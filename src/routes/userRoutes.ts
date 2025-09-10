import express, { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { validateRequiredFields, validateIdParam } from '../middlewares/validator';
import { asyncHandler, asyncHandlerWithStatus, getErrorStatusCode } from '../middlewares/asyncHandler';

// 의존성 주입
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router: Router = express.Router();

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: 사용자 등록
 *     description: 디바이스 ID를 기반으로 새로운 사용자를 등록합니다.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - device_id
 *             properties:
 *               device_id:
 *                 type: string
 *                 description: 디바이스 고유 ID
 *                 example: "test-device-001"
 *               nickname:
 *                 type: string
 *                 description: 사용자 닉네임 (선택사항)
 *                 maxLength: 20
 *                 example: "테스트유저1"
 *     responses:
 *       201:
 *         description: 사용자 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "사용자가 성공적으로 등록되었습니다"
 *               data:
 *                 user_id: "ABC12345"
 *                 device_id: "test-device-001"
 *                 nickname: "테스트유저1"
 *                 create_at: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: 잘못된 요청
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
 * 사용자 등록
 * POST /api/user/register
 */
router.post('/register',
    validateRequiredFields(['device_id']),
    // asyncHandler 사용 예시 (선택사항)
    // asyncHandler(userController, 'register')
    userController.register
);

/**
 * @swagger
 * /api/user/device/{device_id}:
 *   get:
 *     summary: 디바이스 ID로 사용자 조회
 *     description: 디바이스 ID를 사용하여 사용자 정보를 조회합니다.
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
 */
/**
 * 디바이스 ID로 사용자 조회
 * GET /api/user/device/:device_id
 */
router.get('/device/:device_id',
    userController.getByDeviceId
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
