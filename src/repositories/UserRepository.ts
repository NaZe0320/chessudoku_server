import { BaseRepository } from './BaseRepository';
import { User } from '../models/User';

/**
 * User 전용 Repository 클래스
 */
export class UserRepository extends BaseRepository<User> {
    constructor() {
        super('User');
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
