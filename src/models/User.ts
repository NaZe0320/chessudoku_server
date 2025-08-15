import { DatabaseRecord } from '../repositories/BaseRepository';

export interface UserData {
    id?: number | string;
    username?: string;
    email?: string;
    password_hash?: string;
    passwordHash?: string;
    first_name?: string;
    firstName?: string;
    last_name?: string;
    lastName?: string;
    profile_image?: string | null;
    profileImage?: string | null;
    is_active?: boolean;
    isActive?: boolean;
    is_email_verified?: boolean;
    isEmailVerified?: boolean;
    last_login_at?: Date | null;
    lastLoginAt?: Date | null;
    created_at?: Date;
    createdAt?: Date;
    updated_at?: Date;
    updatedAt?: Date;
}

export interface UserValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface PublicUserInfo {
    id: number | string;
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    displayName: string;
    profileImage: string | null;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
}

export interface DatabaseUserData {
    id: number | string;
    username: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    profile_image: string | null;
    is_active: boolean;
    is_email_verified: boolean;
    last_login_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

/**
 * User 모델 클래스
 * 사용자 데이터 구조와 관련 메서드들을 정의
 */
export class User implements DatabaseRecord {
    public id: number | string;
    public username: string;
    public email: string;
    public passwordHash: string;
    public firstName: string;
    public lastName: string;
    public profileImage: string | null;
    public isActive: boolean;
    public isEmailVerified: boolean;
    public lastLoginAt: Date | null;
    public created_at: Date;
    public updated_at: Date;

    constructor(data: UserData = {}) {
        this.id = data.id || 0;
        this.username = data.username || '';
        this.email = data.email || '';
        this.passwordHash = data.password_hash || data.passwordHash || '';
        this.firstName = data.first_name || data.firstName || '';
        this.lastName = data.last_name || data.lastName || '';
        this.profileImage = data.profile_image !== undefined ? data.profile_image : data.profileImage || null;
        this.isActive = data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true);
        this.isEmailVerified = data.is_email_verified !== undefined ? data.is_email_verified : (data.isEmailVerified !== undefined ? data.isEmailVerified : false);
        this.lastLoginAt = data.last_login_at !== undefined ? data.last_login_at : data.lastLoginAt || null;
        this.created_at = data.created_at || data.createdAt || new Date();
        this.updated_at = data.updated_at || data.updatedAt || new Date();
    }

    /**
     * 사용자 전체 이름 반환
     */
    getFullName(): string {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    /**
     * 사용자 표시 이름 반환 (전체 이름 또는 사용자명)
     */
    getDisplayName(): string {
        const fullName = this.getFullName();
        return fullName || this.username;
    }

    /**
     * 마스킹된 이메일 반환
     */
    getMaskedEmail(): string {
        if (!this.email) return '';
        
        const [username, domain] = this.email.split('@');
        if (!username || !domain) return this.email;
        
        const maskedUsername = username.length > 2 
            ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
            : username[0] + '*';
        
        return `${maskedUsername}@${domain}`;
    }

    /**
     * 사용자가 활성 상태인지 확인
     */
    isActiveUser(): boolean {
        return this.isActive === true;
    }

    /**
     * 이메일이 인증되었는지 확인
     */
    isEmailVerifiedUser(): boolean {
        return this.isEmailVerified === true;
    }

    /**
     * 사용자가 최근에 로그인했는지 확인 (24시간 이내)
     */
    isRecentlyLoggedIn(): boolean {
        if (!this.lastLoginAt) return false;
        
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        return this.lastLoginAt > oneDayAgo;
    }

    /**
     * 사용자 나이 계산 (생성일 기준)
     */
    getAccountAge(): { days: number; months: number; years: number } {
        const now = new Date();
        const diff = now.getTime() - this.created_at.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        
        return { days, months, years };
    }

    /**
     * 공개용 사용자 정보 반환 (민감한 정보 제외)
     */
    toPublicJSON(): PublicUserInfo {
        return {
            id: this.id,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.getFullName(),
            displayName: this.getDisplayName(),
            profileImage: this.profileImage,
            isActive: this.isActive,
            isEmailVerified: this.isEmailVerified,
            createdAt: this.created_at
        };
    }

    /**
     * 데이터베이스 저장용 객체 반환 (snake_case 키)
     */
    toDatabaseJSON(): DatabaseUserData {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            password_hash: this.passwordHash,
            first_name: this.firstName,
            last_name: this.lastName,
            profile_image: this.profileImage,
            is_active: this.isActive,
            is_email_verified: this.isEmailVerified,
            last_login_at: this.lastLoginAt,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    /**
     * JSON 직렬화 시 사용 (비밀번호 제외)
     */
    toJSON(): Omit<DatabaseUserData, 'password_hash'> {
        const data = this.toDatabaseJSON();
        const { password_hash, ...safeData } = data;
        return safeData;
    }

    /**
     * 사용자 프로필 업데이트
     */
    updateProfile(data: Partial<Pick<UserData, 'firstName' | 'lastName' | 'profileImage'>>): void {
        if (data.firstName !== undefined) this.firstName = data.firstName;
        if (data.lastName !== undefined) this.lastName = data.lastName;
        if (data.profileImage !== undefined) this.profileImage = data.profileImage;
        
        this.updated_at = new Date();
    }

    /**
     * 이메일 업데이트
     */
    updateEmail(email: string): void {
        this.email = email;
        this.isEmailVerified = false; // 새 이메일은 재인증 필요
        this.updated_at = new Date();
    }

    /**
     * 비밀번호 해시 업데이트
     */
    updatePasswordHash(passwordHash: string): void {
        this.passwordHash = passwordHash;
        this.updated_at = new Date();
    }

    /**
     * 이메일 인증 상태 변경
     */
    setEmailVerified(verified: boolean = true): void {
        this.isEmailVerified = verified;
        this.updated_at = new Date();
    }

    /**
     * 사용자 활성 상태 변경
     */
    setActive(active: boolean = true): void {
        this.isActive = active;
        this.updated_at = new Date();
    }

    /**
     * 마지막 로그인 시간 업데이트
     */
    updateLastLogin(): void {
        this.lastLoginAt = new Date();
        this.updated_at = new Date();
    }

    /**
     * 데이터 검증
     */
    validate(): UserValidationResult {
        const errors: string[] = [];

        // 사용자명 검증
        if (!this.username) {
            errors.push('사용자명은 필수입니다');
        } else if (this.username.length < 3) {
            errors.push('사용자명은 3자 이상이어야 합니다');
        } else if (this.username.length > 50) {
            errors.push('사용자명은 50자 이하여야 합니다');
        } else if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
            errors.push('사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다');
        }

        // 이메일 검증
        if (!this.email) {
            errors.push('이메일은 필수입니다');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            errors.push('유효하지 않은 이메일 형식입니다');
        } else if (this.email.length > 255) {
            errors.push('이메일은 255자 이하여야 합니다');
        }

        // 이름 검증
        if (this.firstName && this.firstName.length > 50) {
            errors.push('이름은 50자 이하여야 합니다');
        }
        
        if (this.lastName && this.lastName.length > 50) {
            errors.push('성은 50자 이하여야 합니다');
        }

        // 비밀번호 해시 검증 (존재만 확인)
        if (!this.passwordHash) {
            errors.push('비밀번호 해시는 필수입니다');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 이메일 검증만 수행
     */
    validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
    }

    /**
     * 사용자명 검증만 수행
     */
    validateUsername(username: string): boolean {
        return username.length >= 3 && 
               username.length <= 50 && 
               /^[a-zA-Z0-9_]+$/.test(username);
    }

    /**
     * 데이터베이스 로우에서 User 인스턴스 생성
     */
    static fromDatabaseRow(row: UserData): User {
        return new User(row);
    }

    /**
     * 여러 데이터베이스 로우에서 User 인스턴스 배열 생성
     */
    static fromDatabaseRows(rows: UserData[]): User[] {
        return rows.map(row => User.fromDatabaseRow(row));
    }

    /**
     * 공개 정보만으로 User 인스턴스 생성 (제한된 정보)
     */
    static fromPublicData(data: PublicUserInfo): User {
        return new User({
            id: data.id,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            profileImage: data.profileImage,
            isActive: data.isActive,
            isEmailVerified: data.isEmailVerified,
            createdAt: data.createdAt
        });
    }

    /**
     * 새 사용자 생성을 위한 팩토리 메서드
     */
    static create(userData: {
        username: string;
        email: string;
        passwordHash: string;
        firstName?: string;
        lastName?: string;
    }): User {
        return new User({
            username: userData.username,
            email: userData.email,
            passwordHash: userData.passwordHash,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            isActive: true,
            isEmailVerified: false,
            created_at: new Date(),
            updated_at: new Date()
        });
    }
}

export default User;
