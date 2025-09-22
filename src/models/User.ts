import { DatabaseRecord } from '../repositories/BaseRepository';

/**
 * 사용자 데이터 인터페이스
 */
export interface UserData {
    user_id?: string;
    device_id?: string;
    nickname?: string;
    create_at?: Date;
    is_deleted?: boolean;
}

/**
 * 데이터베이스 사용자 데이터
 */
export interface DatabaseUserData {
    user_id: string;
    device_id: string;
    nickname: string;
    create_at: Date;
    is_deleted: boolean;
}

/**
 * User 모델 클래스
 */
export class User implements DatabaseRecord {
    public user_id: string;
    public device_id: string;
    public nickname: string;
    public create_at: Date;
    public is_deleted: boolean;
    
    // DatabaseRecord 호환성을 위한 id
    public get id(): string {
        return this.user_id;
    }
    
    public created_at?: Date;
    public updated_at?: Date;

    constructor(data: UserData = {}) {
        this.user_id = data.user_id || '';
        this.device_id = data.device_id || '';
        this.nickname = data.nickname || '';
        this.create_at = data.create_at || new Date();
        this.is_deleted = data.is_deleted || false;
        
        this.created_at = this.create_at;
        this.updated_at = this.create_at;
    }

    /**
     * 데이터베이스 저장용 객체 반환
     */
    toDatabaseJSON(): DatabaseUserData {
        return {
            user_id: this.user_id,
            device_id: this.device_id,
            nickname: this.nickname,
            create_at: this.create_at,
            is_deleted: this.is_deleted
        };
    }

    /**
     * 공개용 객체 반환 (is_deleted 필드 제외)
     */
    toPublicJSON(): Omit<UserData, 'is_deleted'> {
        return {
            user_id: this.user_id,
            device_id: this.device_id,
            nickname: this.nickname,
            create_at: this.create_at
        };
    }

    /**
     * 데이터베이스 로우에서 User 인스턴스 생성
     */
    static fromDatabaseRow(row: UserData): User {
        return new User(row);
    }

    /**
     * 데이터베이스 로우들에서 User 인스턴스들 생성
     */
    static fromDatabaseRows(rows: UserData[]): User[] {
        return rows.map(row => User.fromDatabaseRow(row));
    }
}

export default User;
