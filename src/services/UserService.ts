import { BaseService } from './BaseService';
import { UserRepository } from '../repositories/UserRepository';
import { User, UserData } from '../models/User';

/**
 * 사용자 관리 서비스
 */
export class UserService extends BaseService<User> {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        super(userRepository);
        this.userRepository = userRepository;
    }

    /**
     * 새 사용자 등록
     */
    async registerUser(userData: { device_id: string }): Promise<User> {
        try {
            // 디바이스 ID 검증
            if (!userData.device_id || userData.device_id.trim() === '') {
                throw new Error('디바이스 ID는 필수입니다');
            }

            // 기존 디바이스 ID 확인 (삭제되지 않은 사용자만)
            const existingUser = await this.userRepository.findByDeviceId(userData.device_id);
            if (existingUser && !existingUser.is_deleted) {
                throw new Error('이미 등록된 디바이스입니다');
            }

            // 닉네임 자동 생성
            const nickname = `사용자${Date.now()}`;
            
            // user_id 자동 생성 (8자리 랜덤 문자열)
            const userId = this.generateUserId();

            // 새 사용자 생성
            const newUser = new User({
                user_id: userId,
                device_id: userData.device_id,
                nickname: nickname,
                create_at: new Date(),
                is_deleted: false
            });

            // 사용자 저장
            const savedUser = await this.userRepository.create(newUser.toDatabaseJSON());
            return User.fromDatabaseRow(savedUser);
        } catch (error) {
            console.error('Error in registerUser:', error);
            throw error;
        }
    }

    /**
     * 사용자 ID로 조회 (삭제되지 않은 사용자만)
     */
    async getUserById(userId: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user || user.is_deleted) {
                return null;
            }
            return User.fromDatabaseRow(user);
        } catch (error) {
            console.error('Error in getUserById:', error);
            throw error;
        }
    }

    /**
     * 디바이스 ID로 사용자 조회 (없으면 null 반환)
     */
    async getUserByDeviceId(deviceId: string): Promise<User | null> {
        try {
            // 디바이스 ID 검증
            if (!deviceId || deviceId.trim() === '') {
                throw new Error('디바이스 ID는 필수입니다');
            }

            const user = await this.userRepository.findByDeviceId(deviceId);
            
            // 사용자가 존재하고 삭제되지 않은 경우
            if (user && !user.is_deleted) {
                return User.fromDatabaseRow(user);
            }

            // 사용자가 없거나 삭제된 경우 null 반환
            return null;
        } catch (error) {
            console.error('Error in getUserByDeviceId:', error);
            throw error;
        }
    }

    /**
     * 디바이스 ID로 사용자 조회 (없으면 자동 등록)
     */
    async getUserByDeviceIdOrCreate(deviceId: string): Promise<User> {
        try {
            // 디바이스 ID 검증
            if (!deviceId || deviceId.trim() === '') {
                throw new Error('디바이스 ID는 필수입니다');
            }

            const user = await this.userRepository.findByDeviceId(deviceId);
            
            // 사용자가 존재하고 삭제되지 않은 경우
            if (user && !user.is_deleted) {
                return User.fromDatabaseRow(user);
            }

            // 사용자가 없거나 삭제된 경우 새로 등록
            console.log(`사용자가 없어서 자동 등록: ${deviceId}`);
            return await this.registerUser({ device_id: deviceId });
        } catch (error) {
            console.error('Error in getUserByDeviceIdOrCreate:', error);
            throw error;
        }
    }

    /**
     * 사용자 삭제 (isDeleted로 처리)
     */
    async deleteUser(userId: string): Promise<boolean> {
        try {
            // 사용자 존재 확인
            const user = await this.userRepository.findById(userId);
            if (!user || user.is_deleted) {
                return false;
            }

            // isDeleted를 true로 업데이트
            const updatedUser = await this.userRepository.update(userId, { is_deleted: true });
            return updatedUser !== null;
        } catch (error) {
            console.error('Error in deleteUser:', error);
            throw error;
        }
    }

    /**
     * 8자리 랜덤 user_id 생성
     */
    private generateUserId(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
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
        return {
            ...data,
            create_at: new Date()
        };
    }

    protected override async afterCreate(result: User): Promise<User> {
        console.log(`새 사용자 생성됨: ${result.user_id} (${result.device_id})`);
        return result;
    }
}

export default UserService;
