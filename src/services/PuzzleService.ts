import { BaseService } from './BaseService';
import { PuzzleRepository } from '../repositories/PuzzleRepository';
import { AccountRepository } from '../repositories/AccountRepository';
import { 
    PuzzleRecord, 
    PuzzleCompletionRequest, 
    PuzzleRecordQueryOptions,
    PuzzleStats,
    DatabasePuzzleRecordData 
} from '../models/PuzzleRecord';

/**
 * 퍼즐 기록 관리 서비스
 */
export class PuzzleService extends BaseService<PuzzleRecord> {
    private puzzleRepository: PuzzleRepository;
    private accountRepository: AccountRepository;

    constructor(puzzleRepository: PuzzleRepository, accountRepository: AccountRepository) {
        super(puzzleRepository);
        this.puzzleRepository = puzzleRepository;
        this.accountRepository = accountRepository;
    }

    /**
     * 퍼즐 완성 기록 추가
     */
    async addPuzzleCompletion(
        accountId: string, 
        completionData: PuzzleCompletionRequest
    ): Promise<DatabasePuzzleRecordData> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 계정 존재 확인
            const account = await this.accountRepository.findByAccountId(accountId);
            if (!account) {
                throw new Error('계정을 찾을 수 없습니다');
            }

            // 퍼즐 기록 생성
            const puzzleRecord = PuzzleRecord.fromCompletionRequest(accountId, completionData);

            // 데이터 검증
            const validation = puzzleRecord.validate();
            if (!validation.isValid) {
                throw new Error(`퍼즐 기록 검증 실패: ${validation.errors.join(', ')}`);
            }

            // 기록 저장
            const savedRecord = await this.puzzleRepository.addPuzzleRecord(puzzleRecord);

            return savedRecord.toJSON();
        } catch (error) {
            console.error('Error in addPuzzleCompletion:', error);
            throw error;
        }
    }

    /**
     * 특정 계정의 퍼즐 기록 조회
     */
    async getPuzzleRecords(
        accountId: string, 
        options: PuzzleRecordQueryOptions = {}
    ): Promise<{
        records: DatabasePuzzleRecordData[];
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 계정 존재 확인
            const accountExists = await this.accountRepository.checkAccountIdExists(accountId);
            if (!accountExists) {
                throw new Error('계정을 찾을 수 없습니다');
            }

            // 페이지네이션 설정
            const page = Math.max(1, Math.floor((options.offset || 0) / (options.limit || 10)) + 1);
            const limit = Math.min(100, Math.max(1, options.limit || 10));
            const offset = (page - 1) * limit;

            // 총 개수 조회
            const total = await this.puzzleRepository.countByAccountId(
                accountId, 
                options.puzzle_type, 
                options.difficulty
            );

            // 기록 조회
            const queryOptions = { ...options, limit, offset };
            const records = await this.puzzleRepository.findByAccountId(accountId, queryOptions);

            return {
                records: records.map(record => record.toJSON()),
                total,
                page,
                limit
            };
        } catch (error) {
            console.error('Error in getPuzzleRecords:', error);
            throw error;
        }
    }

    /**
     * 특정 계정의 최고 기록들 조회
     */
    async getBestRecords(accountId: string): Promise<{
        bestTime: DatabasePuzzleRecordData | null;
        fewestHints: DatabasePuzzleRecordData | null;
        bestByType: { [type: string]: DatabasePuzzleRecordData };
        bestByDifficulty: { [difficulty: string]: DatabasePuzzleRecordData };
    }> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            const bestRecords = await this.puzzleRepository.getBestRecords(accountId);

            return {
                bestTime: bestRecords.bestTime ? bestRecords.bestTime.toJSON() : null,
                fewestHints: bestRecords.fewestHints ? bestRecords.fewestHints.toJSON() : null,
                bestByType: Object.fromEntries(
                    Object.entries(bestRecords.bestByType).map(([type, record]) => [type, record.toJSON()])
                ),
                bestByDifficulty: Object.fromEntries(
                    Object.entries(bestRecords.bestByDifficulty).map(([difficulty, record]) => [difficulty, record.toJSON()])
                )
            };
        } catch (error) {
            console.error('Error in getBestRecords:', error);
            throw error;
        }
    }

    /**
     * 특정 계정의 통계 조회
     */
    async getPuzzleStats(accountId: string): Promise<PuzzleStats> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            return await this.puzzleRepository.calculateStatsByAccountId(accountId);
        } catch (error) {
            console.error('Error in getPuzzleStats:', error);
            throw error;
        }
    }

    /**
     * 최근 퍼즐 기록 조회
     */
    async getRecentRecords(accountId: string, limit: number = 10): Promise<DatabasePuzzleRecordData[]> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 제한 설정
            const safeLimit = Math.min(100, Math.max(1, limit));

            const records = await this.puzzleRepository.findRecentRecords(accountId, safeLimit);
            return records.map(record => record.toJSON());
        } catch (error) {
            console.error('Error in getRecentRecords:', error);
            throw error;
        }
    }

    /**
     * 특정 기간 내 퍼즐 기록 조회
     */
    async getRecordsByDateRange(
        accountId: string, 
        startDate: Date, 
        endDate: Date
    ): Promise<DatabasePuzzleRecordData[]> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 날짜 검증
            if (startDate > endDate) {
                throw new Error('시작 날짜는 종료 날짜보다 이전이어야 합니다');
            }

            // 최대 1년 제한
            const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
            if (endDate.getTime() - startDate.getTime() > oneYearInMs) {
                throw new Error('조회 기간은 최대 1년입니다');
            }

            const records = await this.puzzleRepository.findByDateRange(accountId, startDate, endDate);
            return records.map(record => record.toJSON());
        } catch (error) {
            console.error('Error in getRecordsByDateRange:', error);
            throw error;
        }
    }

    /**
     * 일별 플레이 통계 조회
     */
    async getDailyStats(
        accountId: string, 
        days: number = 30
    ): Promise<Array<{
        date: string;
        count: number;
        total_time: number;
        avg_hints: number;
    }>> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 일수 제한
            const safeDays = Math.min(365, Math.max(1, days));

            return await this.puzzleRepository.getDailyStats(accountId, safeDays);
        } catch (error) {
            console.error('Error in getDailyStats:', error);
            throw error;
        }
    }

    /**
     * 적은 힌트 기록들 조회
     */
    async getLowHintRecords(
        accountId: string, 
        maxHints: number, 
        puzzleType?: string
    ): Promise<DatabasePuzzleRecordData[]> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 힌트 수 검증
            if (maxHints < 0) {
                throw new Error('최대 힌트 수는 0 이상이어야 합니다');
            }

            const records = await this.puzzleRepository.findByMaxHints(accountId, maxHints, puzzleType);
            return records.map(record => record.toJSON());
        } catch (error) {
            console.error('Error in getLowHintRecords:', error);
            throw error;
        }
    }

    /**
     * 빠른 기록들 조회 (특정 시간 이하)
     */
    async getFastRecords(
        accountId: string, 
        maxTime: number, 
        puzzleType?: string
    ): Promise<DatabasePuzzleRecordData[]> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 시간 검증
            if (maxTime <= 0) {
                throw new Error('최대 시간은 0보다 커야 합니다');
            }

            const records = await this.puzzleRepository.findByMaxTime(accountId, maxTime, puzzleType);
            return records.map(record => record.toJSON());
        } catch (error) {
            console.error('Error in getFastRecords:', error);
            throw error;
        }
    }

    /**
     * 글로벌 순위 조회
     */
    async getGlobalRanking(
        puzzleType: string, 
        difficulty?: string, 
        limit: number = 100
    ): Promise<Array<{
        rank: number;
        account_id: string;
        hint_count: number;
        time_taken: number;
        completed_at: Date;
    }>> {
        try {
            // 파라미터 검증
            if (!puzzleType || puzzleType.trim() === '') {
                throw new Error('퍼즐 타입은 필수입니다');
            }

            const safeLimit = Math.min(1000, Math.max(1, limit));

            return await this.puzzleRepository.getGlobalRanking(puzzleType, difficulty, safeLimit);
        } catch (error) {
            console.error('Error in getGlobalRanking:', error);
            throw error;
        }
    }

    /**
     * 개인 순위 조회 (글로벌 순위에서의 위치)
     */
    async getPersonalRanking(
        accountId: string, 
        puzzleType: string, 
        difficulty?: string
    ): Promise<{
        rank: number | null;
        total_participants: number;
        personal_best: DatabasePuzzleRecordData | null;
    }> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 글로벌 순위 조회 (큰 범위로)
            const globalRanking = await this.puzzleRepository.getGlobalRanking(puzzleType, difficulty, 10000);
            
            // 개인 순위 찾기
            const personalRank = globalRanking.find(entry => entry.account_id === accountId);
            
            // 개인 최고 기록 조회
            const personalRecords = await this.puzzleRepository.findByAccountId(accountId, {
                puzzle_type: puzzleType,
                difficulty,
                sort_by: 'hint_count',
                sort_order: 'ASC',
                limit: 1
            });

            return {
                rank: personalRank ? personalRank.rank : null,
                total_participants: globalRanking.length,
                personal_best: personalRecords.length > 0 ? personalRecords[0].toJSON() : null
            };
        } catch (error) {
            console.error('Error in getPersonalRanking:', error);
            throw error;
        }
    }

    /**
     * 퍼즐 기록 삭제 (특정 기록)
     */
    async deletePuzzleRecord(accountId: string, recordId: number): Promise<boolean> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            // 기록 존재 확인 및 소유자 확인
            const record = await this.puzzleRepository.findById(recordId);
            if (!record) {
                throw new Error('퍼즐 기록을 찾을 수 없습니다');
            }

            if (record.account_id !== accountId) {
                throw new Error('해당 기록에 대한 권한이 없습니다');
            }

            // 기록 삭제
            return await this.puzzleRepository.delete(recordId);
        } catch (error) {
            console.error('Error in deletePuzzleRecord:', error);
            throw error;
        }
    }

    /**
     * 특정 계정의 모든 퍼즐 기록 삭제
     */
    async deleteAllRecords(accountId: string): Promise<number> {
        try {
            // 계정 ID 검증
            if (!accountId || !/^[A-Z0-9]{12}$/.test(accountId)) {
                throw new Error('유효하지 않은 계정 ID 형식입니다');
            }

            return await this.puzzleRepository.deleteBy({ account_id: accountId });
        } catch (error) {
            console.error('Error in deleteAllRecords:', error);
            throw error;
        }
    }

    /**
     * BaseService 메서드 오버라이드
     */
    protected override async validateData(data: any, isUpdate: boolean = false): Promise<void> {
        if (!data) {
            throw new Error('퍼즐 데이터가 필요합니다');
        }

        const required = ['account_id', 'puzzle_type', 'difficulty', 'time_taken', 'hint_count'];
        for (const field of required) {
            if (!isUpdate && data[field] === undefined) {
                throw new Error(`${field}는 필수 필드입니다`);
            }
        }
    }

    protected override async beforeCreate(data: any): Promise<any> {
        return {
            ...data,
            completed_at: data.completed_at || new Date()
        };
    }

    protected override async afterCreate(result: PuzzleRecord): Promise<PuzzleRecord> {
        console.log(`새 퍼즐 기록 추가됨: ${result.account_id} - ${result.puzzle_type} (힌트 ${result.hint_count}회)`);
        return result;
    }
}

export default PuzzleService;