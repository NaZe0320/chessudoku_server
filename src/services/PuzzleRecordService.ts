import { BaseService } from './BaseService';
import { PuzzleRecordRepository } from '../repositories/PuzzleRecordRepository';
import { PuzzleRecord, PuzzleRecordData } from '../models/PuzzleRecord';

/**
 * 퍼즐 기록 관리 서비스
 */
export class PuzzleRecordService extends BaseService<PuzzleRecord> {
    private puzzleRecordRepository: PuzzleRecordRepository;

    constructor(puzzleRecordRepository: PuzzleRecordRepository) {
        super(puzzleRecordRepository);
        this.puzzleRecordRepository = puzzleRecordRepository;
    }

    /**
     * 퍼즐 기록 추가
     */
    async addRecord(recordData: {
        user_id: string;
        puzzle_id: number;
        puzzle_type: string;
        solve_time: number;
        hints_used: number;
        create_at: Date;
    }): Promise<PuzzleRecord> {
        try {
            // 데이터 검증
            if (!recordData.user_id || !recordData.puzzle_id || !recordData.puzzle_type) {
                throw new Error('사용자 ID, 퍼즐 ID, 퍼즐 타입은 필수입니다');
            }

            if (recordData.solve_time < 0 || recordData.hints_used < 0) {
                throw new Error('해결 시간과 힌트 사용 횟수는 0 이상이어야 합니다');
            }

            const record = new PuzzleRecord({
                user_id: recordData.user_id,
                puzzle_id: recordData.puzzle_id,
                puzzle_type: recordData.puzzle_type,
                solve_time: recordData.solve_time,
                hints_used: recordData.hints_used,
                create_at: recordData.create_at
            });

            const savedRecord = await this.puzzleRecordRepository.create(record.toDatabaseJSON());
            return PuzzleRecord.fromDatabaseRow(savedRecord);
        } catch (error) {
            console.error('Error in addRecord:', error);
            throw error;
        }
    }



    /**
     * BaseService 메서드 오버라이드
     */
    protected override async validateData(data: any, isUpdate: boolean = false): Promise<void> {
        if (!data) {
            throw new Error('데이터가 필요합니다');
        }

        const required = ['user_id', 'puzzle_id', 'puzzle_type', 'solve_time', 'hints_used'];
        for (const field of required) {
            if (!isUpdate && data[field] === undefined) {
                throw new Error(`${field}는 필수 필드입니다`);
            }
        }
    }

    protected override async beforeCreate(data: any): Promise<any> {
        return {
            ...data,
            create_at: data.create_at || new Date()
        };
    }

    protected override async afterCreate(result: PuzzleRecord): Promise<PuzzleRecord> {
        console.log(`새 퍼즐 기록 추가됨: ${result.user_id} - 퍼즐 ${result.puzzle_id} (${result.solve_time}초)`);
        return result;
    }
}

export default PuzzleRecordService;
