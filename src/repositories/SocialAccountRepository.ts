import { BaseRepository } from './BaseRepository';
import { SocialAccount } from '../models/SocialAccount';

/**
 * SocialAccount 전용 Repository 클래스
 */
export class SocialAccountRepository extends BaseRepository<SocialAccount> {
    constructor() {
        super('SocialAccount');
    }
}

export default SocialAccountRepository;