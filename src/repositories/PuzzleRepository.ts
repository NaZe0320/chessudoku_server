import { BaseRepository } from './BaseRepository';
import { Puzzle } from '../models/Puzzle';

/**
 * Puzzle 전용 Repository 클래스
 */
export class PuzzleRepository extends BaseRepository<Puzzle> {
    constructor() {
        super('Puzzle');
    }
}

export default PuzzleRepository;