import { DatabaseRecord } from '../repositories/BaseRepository';

/**
 * 계정 데이터 인터페이스
 */
export interface AccountData {
    id?: string;
    device_id?: string;
    created_at?: Date;
    updated_at?: Date;
    settings?: object;
    is_premium?: boolean;
    premium_until?: Date | null;
}

/**
 * 데이터베이스 계정 데이터
 */
export interface DatabaseAccountData {
    id: string;
    device_id: string;
    created_at: Date;
    updated_at: Date;
    settings: object;
    is_premium: boolean;
    premium_until: Date | null;
}

/**
 * 공개 계정 정보 (클라이언트 응답용)
 */
export interface PublicAccountInfo {
    id: string;
    device_id: string;
    created_at: Date;
    settings: object;
    is_premium: boolean;
    premium_until: Date | null;
}

/**
 * 계정 등록 요청 데이터
 */
export interface AccountRegisterRequest {
    device_id: string;
}

/**
 * 디바이스 변경 요청 데이터
 */
export interface DeviceChangeRequest {
    device_id: string;
}

/**
 * 설정 업데이트 요청 데이터
 */
export interface SettingsUpdateRequest {
    settings?: object;
    is_premium?: boolean;
    premium_until?: Date | null;
}

/**
 * Account 모델 클래스
 */
export class Account implements DatabaseRecord {
    public id: string;
    public device_id: string;
    public created_at: Date;
    public updated_at: Date;
    public settings: object;
    public is_premium: boolean;
    public premium_until: Date | null;

    constructor(data: AccountData = {}) {
        this.id = data.id || '';
        this.device_id = data.device_id || '';
        this.created_at = data.created_at || new Date();
        this.updated_at = data.updated_at || new Date();
        this.settings = data.settings || {};
        this.is_premium = data.is_premium || false;
        this.premium_until = data.premium_until || null;
    }

    /**
     * 계정 ID 생성 (12자리 영문대문자+숫자)
     */
    static generateAccountId(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * 프리미엄 상태 확인
     */
    isPremiumActive(): boolean {
        if (!this.is_premium) return false;
        if (!this.premium_until) return true; // 무제한
        return new Date() < this.premium_until;
    }

    /**
     * 프리미엄 만료까지 남은 일수
     */
    getDaysUntilPremiumExpiry(): number | null {
        if (!this.is_premium || !this.premium_until) return null;
        
        const now = new Date();
        const expiry = this.premium_until;
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    }

    /**
     * 설정 업데이트
     */
    updateSettings(newSettings: object): void {
        this.settings = { ...this.settings, ...newSettings };
        this.updated_at = new Date();
    }

    /**
     * 프리미엄 상태 업데이트
     */
    updatePremium(isPremium: boolean, until?: Date | null): void {
        this.is_premium = isPremium;
        this.premium_until = until || null;
        this.updated_at = new Date();
    }

    /**
     * 디바이스 ID 변경
     */
    changeDevice(newDeviceId: string): void {
        this.device_id = newDeviceId;
        this.updated_at = new Date();
    }

    /**
     * 공개 정보 반환 (민감한 정보 제외)
     */
    toPublicJSON(): PublicAccountInfo {
        return {
            id: this.id,
            device_id: this.device_id,
            created_at: this.created_at,
            settings: this.settings,
            is_premium: this.is_premium,
            premium_until: this.premium_until
        };
    }

    /**
     * 데이터베이스 저장용 객체 반환
     */
    toDatabaseJSON(): DatabaseAccountData {
        return {
            id: this.id,
            device_id: this.device_id,
            created_at: this.created_at,
            updated_at: this.updated_at,
            settings: this.settings,
            is_premium: this.is_premium,
            premium_until: this.premium_until
        };
    }

    /**
     * 데이터 검증
     */
    validate(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.id) {
            errors.push('계정 ID는 필수입니다');
        } else if (!/^[A-Z0-9]{12}$/.test(this.id)) {
            errors.push('계정 ID는 12자리 영문대문자+숫자 조합이어야 합니다');
        }

        if (!this.device_id) {
            errors.push('디바이스 ID는 필수입니다');
        } else if (this.device_id.length < 1 || this.device_id.length > 255) {
            errors.push('디바이스 ID는 1-255자 사이여야 합니다');
        }

        if (this.premium_until && this.premium_until <= new Date()) {
            // 경고만, 에러는 아님 (만료된 프리미엄은 허용)
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 데이터베이스 로우에서 Account 인스턴스 생성
     */
    static fromDatabaseRow(row: AccountData): Account {
        return new Account(row);
    }

    /**
     * 여러 데이터베이스 로우에서 Account 인스턴스 배열 생성
     */
    static fromDatabaseRows(rows: AccountData[]): Account[] {
        return rows.map(row => Account.fromDatabaseRow(row));
    }

    /**
     * 새 계정 생성을 위한 팩토리 메서드
     */
    static createNew(deviceId: string): Account {
        return new Account({
            id: Account.generateAccountId(),
            device_id: deviceId,
            created_at: new Date(),
            updated_at: new Date(),
            settings: {},
            is_premium: false,
            premium_until: null
        });
    }
}

export default Account;