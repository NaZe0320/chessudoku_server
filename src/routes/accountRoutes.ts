import express, { Router } from 'express';
import { AccountController } from '../controllers/AccountController';
import { AccountService } from '../services/AccountService';
import { AccountRepository } from '../repositories/AccountRepository';
import { validateRequiredFields, validateIdParam } from '../middlewares/validator';

// 의존성 주입
const accountRepository = new AccountRepository();
const accountService = new AccountService(accountRepository);
const accountController = new AccountController(accountService);

const router: Router = express.Router();

/**
 * 계정 등록
 * POST /api/account/register
 */
router.post('/register',
    validateRequiredFields(['device_id']),
    accountController.register
);

/**
 * 계정 복구 (디바이스 변경)
 * PUT /api/account/:account_id/device
 */
router.put('/:account_id/device',
    validateRequiredFields(['device_id']),
    accountController.recoverAccount
);

/**
 * 계정 정보 조회
 * GET /api/account/:account_id
 */
router.get('/:account_id',
    accountController.getAccountInfo
);

/**
 * 설정 업데이트
 * PUT /api/account/:account_id
 */
router.put('/:account_id',
    accountController.updateSettings
);

/**
 * 프리미엄 상태 업데이트
 * PUT /api/account/:account_id/premium
 */
router.put('/:account_id/premium',
    validateRequiredFields(['is_premium']),
    accountController.updatePremium
);

/**
 * 계정 삭제
 * DELETE /api/account/:account_id
 */
router.delete('/:account_id',
    accountController.deleteAccount
);

/**
 * 계정 ID 유효성 검사
 * GET /api/account/:account_id/validate
 */
router.get('/:account_id/validate',
    accountController.validateAccountId
);

// === 관리자 전용 엔드포인트 ===

/**
 * 프리미엄 계정 통계 조회 (관리자용)
 * GET /api/account/admin/stats
 */
router.get('/admin/stats',
    accountController.getStats
);

/**
 * 기간별 신규 가입 통계 (관리자용)
 * GET /api/account/admin/registration-stats
 * Query: start_date, end_date
 */
router.get('/admin/registration-stats',
    accountController.getRegistrationStats
);

/**
 * 만료된 프리미엄 계정 처리 (배치 작업용)
 * POST /api/account/admin/process-expired
 */
router.post('/admin/process-expired',
    accountController.processExpiredPremium
);

export default router;
