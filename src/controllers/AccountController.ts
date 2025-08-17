import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { AccountService } from '../services/AccountService';
import { Account } from '../models/Account';

/**
 * 계정 관리 컨트롤러
 */
export class AccountController extends BaseController<Account> {
    private accountService: AccountService;

    constructor(accountService: AccountService) {
        super(accountService);
        this.accountService = accountService;

        // 메서드 바인딩
        this.register = this.register.bind(this);
        this.recoverAccount = this.recoverAccount.bind(this);
        this.getAccountInfo = this.getAccountInfo.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
        this.updatePremium = this.updatePremium.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
        this.validateAccountId = this.validateAccountId.bind(this);
        this.getStats = this.getStats.bind(this);
    }

    /**
     * 계정 등록
     * POST /api/account/register
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

            const result = await this.accountService.registerAccount({ device_id });

            res.status(201).json({
                success: true,
                message: '계정이 성공적으로 등록되었습니다',
                data: {
                    account: result.account,
                    account_id: result.account_id
                }
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
     * 계정 복구 (디바이스 변경)
     * PUT /api/account/:account_id/device
     */
    async recoverAccount(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;
            const { device_id } = req.body;

            if (!device_id) {
                res.status(400).json({
                    success: false,
                    message: '새 디바이스 ID는 필수입니다'
                });
                return;
            }

            const account = await this.accountService.recoverAccount(account_id, { device_id });

            res.json({
                success: true,
                message: '계정이 성공적으로 복구되었습니다',
                data: account
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('찾을 수 없습니다')) {
                statusCode = 404;
            } else if (err.message.includes('유효하지 않은') || err.message.includes('필수')) {
                statusCode = 400;
            } else if (err.message.includes('이미') || err.message.includes('사용 중')) {
                statusCode = 409;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 계정 정보 조회
     * GET /api/account/:account_id
     */
    async getAccountInfo(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;

            const account = await this.accountService.getAccountInfo(account_id);

            res.json({
                success: true,
                message: '계정 정보 조회 성공',
                data: account
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('찾을 수 없습니다')) {
                statusCode = 404;
            } else if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 설정 업데이트
     * PUT /api/account/:account_id
     */
    async updateSettings(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;
            const updateData = req.body;

            // 허용된 필드만 업데이트
            const allowedFields = ['settings', 'is_premium', 'premium_until'];
            const filteredData: any = {};
            
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }

            if (Object.keys(filteredData).length === 0) {
                res.status(400).json({
                    success: false,
                    message: '업데이트할 데이터가 없습니다'
                });
                return;
            }

            const account = await this.accountService.updateSettings(account_id, filteredData);

            res.json({
                success: true,
                message: '설정이 성공적으로 업데이트되었습니다',
                data: account
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('찾을 수 없습니다')) {
                statusCode = 404;
            } else if (err.message.includes('유효하지 않은') || err.message.includes('필수')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 프리미엄 상태 업데이트
     * PUT /api/account/:account_id/premium
     */
    async updatePremium(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;
            const { is_premium, premium_until } = req.body;

            if (is_premium === undefined) {
                res.status(400).json({
                    success: false,
                    message: '프리미엄 상태는 필수입니다'
                });
                return;
            }

            let premiumUntilDate: Date | null = null;
            if (premium_until) {
                premiumUntilDate = new Date(premium_until);
                if (isNaN(premiumUntilDate.getTime())) {
                    res.status(400).json({
                        success: false,
                        message: '유효하지 않은 날짜 형식입니다'
                    });
                    return;
                }
            }

            const account = await this.accountService.updatePremiumStatus(
                account_id, 
                is_premium, 
                premiumUntilDate
            );

            res.json({
                success: true,
                message: '프리미엄 상태가 업데이트되었습니다',
                data: account
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('찾을 수 없습니다')) {
                statusCode = 404;
            } else if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 계정 삭제
     * DELETE /api/account/:account_id
     */
    async deleteAccount(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;

            const deleted = await this.accountService.deleteAccount(account_id);

            if (deleted) {
                res.json({
                    success: true,
                    message: '계정이 성공적으로 삭제되었습니다'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: '계정 삭제에 실패했습니다'
                });
            }
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('찾을 수 없습니다')) {
                statusCode = 404;
            } else if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 계정 ID 유효성 검사
     * GET /api/account/:account_id/validate
     */
    async validateAccountId(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;

            const isValid = await this.accountService.validateAccountId(account_id);

            res.json({
                success: true,
                message: '계정 ID 검증 완료',
                data: {
                    is_valid: isValid,
                    account_id: account_id
                }
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
     * 프리미엄 계정 통계 조회 (관리자용)
     * GET /api/account/admin/stats
     */
    async getStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await this.accountService.getPremiumStats();

            res.json({
                success: true,
                message: '통계 조회 성공',
                data: stats
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
     * 기간별 신규 가입 통계 (관리자용)
     * GET /api/account/admin/registration-stats
     */
    async getRegistrationStats(req: Request, res: Response): Promise<void> {
        try {
            const { start_date, end_date } = req.query;

            if (!start_date || !end_date) {
                res.status(400).json({
                    success: false,
                    message: '시작 날짜와 종료 날짜는 필수입니다'
                });
                return;
            }

            const startDate = new Date(start_date as string);
            const endDate = new Date(end_date as string);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 날짜 형식입니다'
                });
                return;
            }

            const count = await this.accountService.getRegistrationStats(startDate, endDate);

            res.json({
                success: true,
                message: '가입 통계 조회 성공',
                data: {
                    start_date: startDate,
                    end_date: endDate,
                    new_accounts: count
                }
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
     * 만료된 프리미엄 계정 처리 (배치 작업용)
     * POST /api/account/admin/process-expired
     */
    async processExpiredPremium(req: Request, res: Response): Promise<void> {
        try {
            const processedCount = await this.accountService.processExpiredPremiumAccounts();

            res.json({
                success: true,
                message: `${processedCount}개의 만료된 프리미엄 계정을 처리했습니다`,
                data: {
                    processed_count: processedCount
                }
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
     * BaseController 메서드 오버라이드 - 사용하지 않는 기본 CRUD 비활성화
     */
    override async getAll(req: Request, res: Response): Promise<void> {
        res.status(403).json({
            success: false,
            message: '이 기능은 사용할 수 없습니다'
        });
    }

    override async getById(req: Request, res: Response): Promise<void> {
        // account_id로 조회하는 getAccountInfo로 대체
        await this.getAccountInfo(req, res);
    }

    override async create(req: Request, res: Response): Promise<void> {
        // register로 대체
        await this.register(req, res);
    }

    override async update(req: Request, res: Response): Promise<void> {
        // updateSettings로 대체
        await this.updateSettings(req, res);
    }

    override async delete(req: Request, res: Response): Promise<void> {
        // deleteAccount로 대체
        await this.deleteAccount(req, res);
    }
}

export default AccountController;