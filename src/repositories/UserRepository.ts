import { BaseRepository } from './BaseRepository';
import { User } from '../models/User';

/**
 * User 전용 Repository 클래스
 */
export class UserRepository extends BaseRepository<User> {
    constructor() {
        super('"user"'); // PostgreSQL에서 테이블 이름을 따옴표로 감싸기
    }

    /**
     * User ID로 사용자 조회 (user_id 컬럼 사용)
     */
    override async findById(userId: string): Promise<User | null> {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE user_id = $1`;
            const result = await this.execute(query, [userId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    /**
     * User ID로 사용자 업데이트 (user_id 컬럼 사용)
     */
    override async update(userId: string, data: any): Promise<User | null> {
        try {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

            const query = `
                UPDATE ${this.tableName} 
                SET ${setClause}
                WHERE user_id = $1 
                RETURNING *
            `;
            
            const result = await this.execute(query, [userId, ...values]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    }

    /**
     * User ID로 사용자 삭제 (user_id 컬럼 사용)
     */
    override async delete(userId: string): Promise<boolean> {
        try {
            const query = `DELETE FROM ${this.tableName} WHERE user_id = $1`;
            const result = await this.execute(query, [userId]);
            return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    }

    /**
     * 디바이스 ID로 사용자 조회
     */
    async findByDeviceId(deviceId: string): Promise<User | null> {
        try {
            const users = await this.findBy({ device_id: deviceId });
            return users.length > 0 ? User.fromDatabaseRow(users[0]) : null;
        } catch (error) {
            console.error('Error in findByDeviceId:', error);
            throw error;
        }
    }

    /**
     * 디바이스 ID 존재 여부 확인
     */
    async checkDeviceIdExists(deviceId: string): Promise<boolean> {
        try {
            return await this.exists({ device_id: deviceId });
        } catch (error) {
            console.error('Error in checkDeviceIdExists:', error);
            throw error;
        }
    }

    /**
     * 사용자 ID 존재 여부 확인
     */
    async checkUserIdExists(userId: string): Promise<boolean> {
        try {
            return await this.exists({ user_id: userId });
        } catch (error) {
            console.error('Error in checkUserIdExists:', error);
            throw error;
        }
    }
}

export default UserRepository;
