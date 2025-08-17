import { BaseService } from './BaseService';
import { AccountRepository } from '../repositories/AccountRepository';
import { 
    Account, 
    AccountRegisterRequest, 
    DeviceChangeRequest, 
    SettingsUpdateRequest,
    PublicAccountInfo 
} from '../models/Account';

/**
 * 계정 관리 서비스
 */
export class AccountService extends BaseService<Account> {
    private accountRepository: AccountRepository;

    constructor(accountRepository: AccountRepository) {
        super(accountRepository);
        this.accountRepository = accountRepository;
    }

    /**
     * 새 계정 등록
     */
    async registerAccount(registerData: AccountRegisterRequest): Promise<{
        account: PublicAccountInfo;
        account_id: string;
    }> {
        try {
            // 디바이스 ID 검증
            if (!registerData.device_id || registerData.device_id.trim() === '') {
                throw new Error('디바이스 ID는 필수입니다');
            }

            // 기존 디바이스 ID 확인
            const existingAccount = await this.accountRepository.findByDeviceId(registerData.device_id);
            if (existingAccount) {
                throw new Error('이미 등록된 디바이스입니다');
            }

            // 새 계정 생성
            const newAccount = Account.createNew(registerData.device_id);
            
            // 데이터 검증
            const validation = newAccount.validate();
            if (!validation.isValid) {
                throw new Error(`계정 데이터 검증 실패: ${validation.errors.join(', ')}`);
            }

            // 계정 저장
            const savedAccount = await this.accountRepository.createAccount(newAccount);

            return {
                account: savedAccount.toPublicJSON(),
                account_id: savedAccount.id
            };
        } catch (error) {
            console.error('Error in registerAccount:', error);
            throw error;
        }
    }

    /**
     * 계정 ID로 계정 복구 (디바이스 변경)
     */
    async recoverAccount(accountId: string, deviceChangeData: DeviceChangeRequest): Promise<PublicAccountInfo> {
        try {
            // 계정 ID 형식 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 새 디바이스 ID 검증
            if (!deviceChangeData.device_id || deviceChangeData.device_id.trim() === '') {
                throw new Error('새 디바이스 ID는 필수입니다');
            }

            // 계정 존재 확인
            const account = await this.accountRepository.findByAccountId(accountId);
            if (!account) {
                throw new Error('계정 ID에 해당하는 계정을 찾을 수 없습니다');
            }

            // 새 디바이스 ID가 다른 계정에서 사용 중인지 확인
            const deviceAlreadyUsed = await this.accountRepository.findByDeviceId(deviceChangeData.device_id);
            if (deviceAlreadyUsed && deviceAlreadyUsed.id !== accountId) {
                throw new Error('해당 디바이스는 이미 다른 계정에서 사용 중입니다');
            }

            // 디바이스 ID 변경
            const updatedAccount = await this.accountRepository.updateDeviceId(
                accountId, 
                deviceChangeData.device_id
            );

            if (!updatedAccount) {
                throw new Error('계정 복구에 실패했습니다');
            }

            return updatedAccount.toPublicJSON();
        } catch (error) {
            console.error('Error in recoverAccount:', error);
            throw error;
        }
    }

    /**
     * 계정 정보 조회
     */
    async getAccountInfo(accountId: string): Promise<PublicAccountInfo> {
        try {
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            const account = await this.accountRepository.findByAccountId(accountId);
            if (!account) {
                throw new Error('계정을 찾을 수 없습니다');
            }

            return account.toPublicJSON();
        } catch (error) {
            console.error('Error in getAccountInfo:', error);
            throw error;
        }
    }

    /**
     * 디바이스 ID로 계정 조회 (내부 사용)
     */
    async getAccountByDeviceId(deviceId: string): Promise<PublicAccountInfo | null> {
        try {
            const account = await this.accountRepository.findByDeviceId(deviceId);
            return account ? account.toPublicJSON() : null;
        } catch (error) {
            console.error('Error in getAccountByDeviceId:', error);
            throw error;
        }
    }

    /**
     * 설정 업데이트
     */
    async updateSettings(accountId: string, settingsData: SettingsUpdateRequest): Promise<PublicAccountInfo> {
        try {
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 계정 존재 확인
            const account = await this.accountRepository.findByAccountId(accountId);
            if (!account) {
                throw new Error('계정을 찾을 수 없습니다');
            }

            // 업데이트할 데이터 준비
            const updateData: any = {};

            if (settingsData.settings !== undefined) {
                // 기존 설정과 병합
                updateData.settings = { ...account.settings, ...settingsData.settings };
            }

            if (settingsData.is_premium !== undefined) {
                updateData.is_premium = settingsData.is_premium;
            }

            if (settingsData.premium_until !== undefined) {
                updateData.premium_until = settingsData.premium_until;
            }

            // 업데이트 실행
            const updatedAccount = await this.accountRepository.updateAccount(accountId, updateData);
            if (!updatedAccount) {
                throw new Error('설정 업데이트에 실패했습니다');
            }

            return updatedAccount.toPublicJSON();
        } catch (error) {
            console.error('Error in updateSettings:', error);
            throw error;
        }
    }

    /**
     * 프리미엄 상태 업데이트
     */
    async updatePremiumStatus(
        accountId: string, 
        isPremium: boolean, 
        premiumUntil?: Date | null
    ): Promise<PublicAccountInfo> {
        try {
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            const updatedAccount = await this.accountRepository.updatePremiumStatus(
                accountId, 
                isPremium, 
                premiumUntil
            );

            if (!updatedAccount) {
                throw new Error('계정을 찾을 수 없습니다');
            }

            return updatedAccount.toPublicJSON();
        } catch (error) {
            console.error('Error in updatePremiumStatus:', error);
            throw error;
        }
    }

    /**
     * 계정 삭제
     */
    async deleteAccount(accountId: string): Promise<boolean> {
        try {
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 계정 존재 확인
            const account = await this.accountRepository.findByAccountId(accountId);
            if (!account) {
                throw new Error('계정을 찾을 수 없습니다');
            }

            // 계정 삭제
            const deleted = await this.accountRepository.delete(accountId);
            return deleted;
        } catch (error) {
            console.error('Error in deleteAccount:', error);
            throw error;
        }
    }

    /**
     * 계정 ID 유효성 검사
     */
    async validateAccountId(accountId: string): Promise<boolean> {
        try {
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                return false;
            }

            const exists = await this.accountRepository.checkAccountIdExists(accountId);
            return exists;
        } catch (error) {
            console.error('Error in validateAccountId:', error);
            return false;
        }
    }

    /**
     * 디바이스 ID 유효성 검사
     */
    async validateDeviceId(deviceId: string): Promise<boolean> {
        try {
            if (!deviceId || deviceId.trim() === '') {
                return false;
            }

            const exists = await this.accountRepository.checkDeviceIdExists(deviceId);
            return exists;
        } catch (error) {
            console.error('Error in validateDeviceId:', error);
            return false;
        }
    }

    /**
     * 프리미엄 계정 통계 조회
     */
    async getPremiumStats(): Promise<{
        total_premium: number;
        active_premium: number;
    }> {
        try {
            const activePremium = await this.accountRepository.countActivePremiumAccounts();
            
            // 전체 프리미엄 계정 수 (만료된 것 포함)
            const totalPremiumQuery = await this.accountRepository.count({ is_premium: true });

            return {
                total_premium: totalPremiumQuery,
                active_premium: activePremium
            };
        } catch (error) {
            console.error('Error in getPremiumStats:', error);
            throw error;
        }
    }

    /**
     * 기간별 신규 계정 통계
     */
    async getRegistrationStats(startDate: Date, endDate: Date): Promise<number> {
        try {
            return await this.accountRepository.countAccountsCreatedBetween(startDate, endDate);
        } catch (error) {
            console.error('Error in getRegistrationStats:', error);
            throw error;
        }
    }

    /**
     * 만료된 프리미엄 계정들 처리 (배치 작업용)
     */
    async processExpiredPremiumAccounts(): Promise<number> {
        try {
            const expiredAccounts = await this.accountRepository.findExpiredPremiumAccounts();
            let processedCount = 0;

            for (const account of expiredAccounts) {
                try {
                    await this.accountRepository.updatePremiumStatus(
                        account.id, 
                        false, 
                        null
                    );
                    processedCount++;
                } catch (error) {
                    console.error(`Failed to process expired premium for ${account.id}:`, error);
                }
            }

            return processedCount;
        } catch (error) {
            console.error('Error in processExpiredPremiumAccounts:', error);
            throw error;
        }
    }

    /**
     * BaseService 메서드 오버라이드
     */
    protected override async validateData(data: any, isUpdate: boolean = false): Promise<void> {
        if (!data) {
            throw new Error('데이터가 필요합니다');
        }

        if (!isUpdate && !data.device_id) {
            throw new Error('디바이스 ID는 필수입니다');
        }
    }

    protected override async beforeCreate(data: any): Promise<any> {
        // 계정 생성 전 처리
        return {
            ...data,
            id: Account.generateAccountId(),
            created_at: new Date(),
            updated_at: new Date(),
            settings: data.settings || {},
            is_premium: data.is_premium || false,
            premium_until: data.premium_until || null
        };
    }

    protected override async afterCreate(result: Account): Promise<Account> {
        console.log(`새 계정 생성됨: ${result.id} (${result.device_id})`);
        return result;
    }
}

export default AccountService;