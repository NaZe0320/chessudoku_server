import { BaseRepository } from './BaseRepository';
import { Account, AccountData, DatabaseAccountData } from '../models/Account';

/**
 * Account 전용 Repository 클래스
 */
export class AccountRepository extends BaseRepository<Account> {
    constructor() {
        super('accounts');
    }

    /**
     * ID로 계정 조회
     */
    async findByAccountId(accountId: string): Promise<Account | null> {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
            const result = await this.execute(query, [accountId]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            return Account.fromDatabaseRow(result.rows[0]);
        } catch (error) {
            console.error('Error in findByAccountId:', error);
            throw error;
        }
    }

    /**
     * 디바이스 ID로 계정 조회
     */
    async findByDeviceId(deviceId: string): Promise<Account | null> {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE device_id = $1`;
            const result = await this.execute(query, [deviceId]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            return Account.fromDatabaseRow(result.rows[0]);
        } catch (error) {
            console.error('Error in findByDeviceId:', error);
            throw error;
        }
    }

    /**
     * 계정 ID 존재 여부 확인
     */
    async checkAccountIdExists(accountId: string): Promise<boolean> {
        try {
            const query = `SELECT 1 FROM ${this.tableName} WHERE id = $1 LIMIT 1`;
            const result = await this.execute(query, [accountId]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error in checkAccountIdExists:', error);
            throw error;
        }
    }

    /**
     * 디바이스 ID 존재 여부 확인
     */
    async checkDeviceIdExists(deviceId: string): Promise<boolean> {
        try {
            const query = `SELECT 1 FROM ${this.tableName} WHERE device_id = $1 LIMIT 1`;
            const result = await this.execute(query, [deviceId]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error in checkDeviceIdExists:', error);
            throw error;
        }
    }

    /**
     * 계정 생성 (중복 ID 체크 포함)
     */
    async createAccount(account: Account): Promise<Account> {
        try {
            // ID 중복 체크
            let attempts = 0;
            const maxAttempts = 10;
            
            while (attempts < maxAttempts) {
                const keyExists = await this.checkAccountIdExists(account.id);
                if (!keyExists) {
                    break;
                }
                
                // 중복되면 새 ID 생성
                account.id = Account.generateAccountId();
                attempts++;
            }
            
            if (attempts >= maxAttempts) {
                throw new Error('계정 ID 생성에 실패했습니다. 다시 시도해주세요.');
            }

            const data = account.toDatabaseJSON();
            const query = `
                INSERT INTO ${this.tableName} 
                (id, device_id, created_at, updated_at, settings, is_premium, premium_until) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *
            `;
            
            const values = [
                data.id,
                data.device_id,
                data.created_at,
                data.updated_at,
                JSON.stringify(data.settings),
                data.is_premium,
                data.premium_until
            ];
            
            const result = await this.execute(query, values);
            const createdData = result.rows[0];
            
            // JSON 필드 파싱
            if (typeof createdData.settings === 'string') {
                createdData.settings = JSON.parse(createdData.settings);
            }
            
            return Account.fromDatabaseRow(createdData);
        } catch (error) {
            console.error('Error in createAccount:', error);
            throw error;
        }
    }

    /**
     * 디바이스 ID 업데이트
     */
    async updateDeviceId(accountId: string, newDeviceId: string): Promise<Account | null> {
        try {
            const query = `
                UPDATE ${this.tableName} 
                SET device_id = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2 
                RETURNING *
            `;
            
            const result = await this.execute(query, [newDeviceId, accountId]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            const updatedData = result.rows[0];
            if (typeof updatedData.settings === 'string') {
                updatedData.settings = JSON.parse(updatedData.settings);
            }
            
            return Account.fromDatabaseRow(updatedData);
        } catch (error) {
            console.error('Error in updateDeviceId:', error);
            throw error;
        }
    }

    /**
     * 설정 업데이트
     */
    async updateSettings(accountId: string, settings: object): Promise<Account | null> {
        try {
            const query = `
                UPDATE ${this.tableName} 
                SET settings = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2 
                RETURNING *
            `;
            
            const result = await this.execute(query, [JSON.stringify(settings), accountId]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            const updatedData = result.rows[0];
            if (typeof updatedData.settings === 'string') {
                updatedData.settings = JSON.parse(updatedData.settings);
            }
            
            return Account.fromDatabaseRow(updatedData);
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
    ): Promise<Account | null> {
        try {
            const query = `
                UPDATE ${this.tableName} 
                SET is_premium = $1, premium_until = $2, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $3 
                RETURNING *
            `;
            
            const result = await this.execute(query, [isPremium, premiumUntil, accountId]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            const updatedData = result.rows[0];
            if (typeof updatedData.settings === 'string') {
                updatedData.settings = JSON.parse(updatedData.settings);
            }
            
            return Account.fromDatabaseRow(updatedData);
        } catch (error) {
            console.error('Error in updatePremiumStatus:', error);
            throw error;
        }
    }

    /**
     * 계정 정보 전체 업데이트
     */
    async updateAccount(accountId: string, updateData: Partial<AccountData>): Promise<Account | null> {
        try {
            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (updateData.device_id !== undefined) {
                updateFields.push(`device_id = $${paramIndex++}`);
                values.push(updateData.device_id);
            }

            if (updateData.settings !== undefined) {
                updateFields.push(`settings = $${paramIndex++}`);
                values.push(JSON.stringify(updateData.settings));
            }

            if (updateData.is_premium !== undefined) {
                updateFields.push(`is_premium = $${paramIndex++}`);
                values.push(updateData.is_premium);
            }

            if (updateData.premium_until !== undefined) {
                updateFields.push(`premium_until = $${paramIndex++}`);
                values.push(updateData.premium_until);
            }

            if (updateFields.length === 0) {
                // 업데이트할 필드가 없으면 기존 데이터 반환
                return await this.findByAccountId(accountId);
            }

            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(accountId);

            const query = `
                UPDATE ${this.tableName} 
                SET ${updateFields.join(', ')} 
                WHERE id = $${paramIndex} 
                RETURNING *
            `;

            const result = await this.execute(query, values);
            
            if (result.rows.length === 0) {
                return null;
            }

            const updatedData = result.rows[0];
            if (typeof updatedData.settings === 'string') {
                updatedData.settings = JSON.parse(updatedData.settings);
            }
            
            return Account.fromDatabaseRow(updatedData);
        } catch (error) {
            console.error('Error in updateAccount:', error);
            throw error;
        }
    }

    /**
     * 만료된 프리미엄 계정들 조회
     */
    async findExpiredPremiumAccounts(): Promise<Account[]> {
        try {
            const query = `
                SELECT * FROM ${this.tableName} 
                WHERE is_premium = true 
                AND premium_until IS NOT NULL 
                AND premium_until < CURRENT_TIMESTAMP
            `;
            
            const result = await this.execute(query);
            return result.rows.map((row: any) => {
                if (typeof row.settings === 'string') {
                    row.settings = JSON.parse(row.settings);
                }
                return Account.fromDatabaseRow(row);
            });
        } catch (error) {
            console.error('Error in findExpiredPremiumAccounts:', error);
            throw error;
        }
    }

    /**
     * 활성 프리미엄 계정 수 조회
     */
    async countActivePremiumAccounts(): Promise<number> {
        try {
            const query = `
                SELECT COUNT(*) as count FROM ${this.tableName} 
                WHERE is_premium = true 
                AND (premium_until IS NULL OR premium_until > CURRENT_TIMESTAMP)
            `;
            
            const result = await this.execute(query);
            return parseInt((result.rows[0] as any).count);
        } catch (error) {
            console.error('Error in countActivePremiumAccounts:', error);
            throw error;
        }
    }

    /**
     * 특정 기간 내 생성된 계정 수 조회
     */
    async countAccountsCreatedBetween(startDate: Date, endDate: Date): Promise<number> {
        try {
            const query = `
                SELECT COUNT(*) as count FROM ${this.tableName} 
                WHERE created_at >= $1 AND created_at <= $2
            `;
            
            const result = await this.execute(query, [startDate, endDate]);
            return parseInt((result.rows[0] as any).count);
        } catch (error) {
            console.error('Error in countAccountsCreatedBetween:', error);
            throw error;
        }
    }

    /**
     * BaseRepository의 create 메서드 오버라이드
     */
    override async create(data: any): Promise<Account> {
        const account = new Account(data);
        return await this.createAccount(account);
    }

    /**
     * BaseRepository의 findById 메서드 오버라이드 (account_id로 조회)
     */
    override async findById(accountId: string | number): Promise<Account | null> {
        return await this.findByAccountId(String(accountId));
    }

    /**
     * BaseRepository의 update 메서드 오버라이드
     */
    override async update(accountId: string | number, data: any): Promise<Account | null> {
        return await this.updateAccount(String(accountId), data);
    }

    /**
     * BaseRepository의 delete 메서드 오버라이드
     */
    override async delete(accountId: string | number): Promise<boolean> {
        try {
            const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
            const result = await this.execute(query, [String(accountId)]);
            return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    }
}

export default AccountRepository;