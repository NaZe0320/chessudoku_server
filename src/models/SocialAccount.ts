import { DatabaseRecord } from '../repositories/BaseRepository';

/**
 * 소셜 계정 데이터 인터페이스
 */
export interface SocialAccountData {
    social_acount_id?: number;
    user_id?: string;
    provider?: string;
    provider_id?: string;
    create_at?: Date;
}

/**
 * 데이터베이스 소셜 계정 데이터
 */
export interface DatabaseSocialAccountData {
    social_acount_id: number;
    user_id: string;
    provider: string;
    provider_id: string;
    create_at: Date;
}

/**
 * SocialAccount 모델 클래스
 */
export class SocialAccount implements DatabaseRecord {
    public social_acount_id: number;
    public user_id: string;
    public provider: string;
    public provider_id: string;
    public create_at: Date;

    public get id(): number {
        return this.social_acount_id;
    }

    public created_at?: Date;
    public updated_at?: Date;

    constructor(data: SocialAccountData = {}) {
        this.social_acount_id = data.social_acount_id || 0;
        this.user_id = data.user_id || '';
        this.provider = data.provider || '';
        this.provider_id = data.provider_id || '';
        this.create_at = data.create_at || new Date();

        this.created_at = this.create_at;
        this.updated_at = this.create_at;
    }

    /**
     * 데이터베이스 저장용 객체 반환
     */
    toDatabaseJSON(): Omit<DatabaseSocialAccountData, 'social_acount_id'> {
        return {
            user_id: this.user_id,
            provider: this.provider,
            provider_id: this.provider_id,
            create_at: this.create_at
        };
    }

    /**
     * 데이터베이스 로우에서 SocialAccount 인스턴스 생성
     */
    static fromDatabaseRow(row: SocialAccountData): SocialAccount {
        return new SocialAccount(row);
    }

    /**
     * 데이터베이스 로우들에서 SocialAccount 인스턴스들 생성
     */
    static fromDatabaseRows(rows: SocialAccountData[]): SocialAccount[] {
        return rows.map(row => SocialAccount.fromDatabaseRow(row));
    }
}

export default SocialAccount;