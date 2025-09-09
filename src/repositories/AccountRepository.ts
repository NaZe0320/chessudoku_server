import { BaseRepository } from './BaseRepository';
import { User } from '../models/User';

/**
 * User 전용 Repository 클래스
 */
export class UserRepository extends BaseRepository<User> {
    constructor() {
        super('User');
    }
}

export default UserRepository;