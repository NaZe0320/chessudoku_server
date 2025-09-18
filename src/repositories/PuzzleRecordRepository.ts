import { BaseRepository } from './BaseRepository';
import { PuzzleRecord } from '../models/PuzzleRecord';

/**
 * PuzzleRecord 전용 Repository 클래스
 */
export class PuzzleRecordRepository extends BaseRepository<PuzzleRecord> {
    constructor() {
        super('puzzle_record');
    }
}

export default PuzzleRecordRepository;