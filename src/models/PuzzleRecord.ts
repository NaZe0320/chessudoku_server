import { DatabaseRecord } from '../repositories/BaseRepository';

/**
 * 퍼즐 기록 데이터 인터페이스
 */
export interface PuzzleRecordData {
    record_id?: number;
    account_id?: string;
    puzzle_type?: string;
    difficulty?: string;
    time_taken?: number;
    hint_count?: number;
    completed_at?: Date;
}

/**
 * 데이터베이스 퍼즐 기록 데이터
 */
export interface DatabasePuzzleRecordData {
    record_id: number;
    account_id: string;
    puzzle_type: string;
    difficulty: string;
    time_taken: number;
    hint_count: number;
    completed_at: Date;
}

/**
 * 퍼즐 완성 요청 데이터
 */
export interface PuzzleCompletionRequest {
    puzzle_type: string;
    difficulty: string;
    time_taken: number;
    hint_count: number;
    completed_at?: Date; // 클라이언트에서 보내거나 서버에서 현재 시간 사용
}

/**
 * 퍼즐 기록 조회 옵션
 */
export interface PuzzleRecordQueryOptions {
    puzzle_type?: string;
    difficulty?: string;
    limit?: number;
    offset?: number;
    sort_by?: 'completed_at' | 'hint_count' | 'time_taken';
    sort_order?: 'ASC' | 'DESC';
    date_from?: Date;
    date_to?: Date;
}

/**
 * 퍼즐 통계 데이터
 */
export interface PuzzleStats {
    total_puzzles: number;
    total_time: number;
    average_time: number;
    best_time: number;
    total_hints: number;
    average_hints: number;
    by_difficulty: {
        [difficulty: string]: {
            count: number;
            best_time: number;
            total_hints: number;
        };
    };
    by_type: {
        [type: string]: {
            count: number;
            best_time: number;
            total_hints: number;
        };
    };
}

/**
 * PuzzleRecord 모델 클래스
 */
export class PuzzleRecord implements DatabaseRecord {
    public record_id: number;
    public account_id: string;
    public puzzle_type: string;
    public difficulty: string;
    public time_taken: number;
    public hint_count: number;
    public completed_at: Date;
    
    // DatabaseRecord 호환성을 위한 id
    public get id(): number {
        return this.record_id;
    }
    
    public created_at?: Date;
    public updated_at?: Date;

    constructor(data: PuzzleRecordData = {}) {
        this.record_id = data.record_id || 0;
        this.account_id = data.account_id || '';
        this.puzzle_type = data.puzzle_type || '';
        this.difficulty = data.difficulty || '';
        this.time_taken = data.time_taken || 0;
        this.hint_count = data.hint_count || 0;
        this.completed_at = data.completed_at || new Date();
        
        // DatabaseRecord 호환성
        this.created_at = this.completed_at;
        this.updated_at = this.completed_at;
    }

    /**
     * 시간을 읽기 쉬운 형태로 포맷 (초 -> 분:초)
     */
    getFormattedTime(): string {
        const minutes = Math.floor(this.time_taken / 60);
        const seconds = this.time_taken % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 난이도별 힌트 점수 계산 (힌트 적을수록 좋음)
     */
    getHintScore(): number {
        const difficultyMultiplier: { [key: string]: number } = {
            'easy': 1.0,
            'medium': 1.5,
            'hard': 2.0,
            'expert': 3.0
        };
        
        const multiplier = difficultyMultiplier[this.difficulty.toLowerCase()] || 1.0;
        // 힌트를 적게 쓸수록 높은 점수 (최대 100점에서 힌트당 감점)
        const baseScore = 100;
        const penalty = this.hint_count * 5; // 힌트당 5점 감점
        return Math.max(0, Math.round((baseScore - penalty) * multiplier));
    }

    /**
     * 시간 기반 점수 계산 (빠를수록 높은 점수)
     */
    getTimeScore(baseTime: number = 300): number {
        if (this.time_taken >= baseTime) return 0;
        const timeBonus = baseTime - this.time_taken;
        return Math.round(timeBonus * 0.1); // 1초당 0.1점
    }

    /**
     * 종합 점수 계산
     */
    getTotalScore(baseTime: number = 300): number {
        return this.getHintScore() + this.getTimeScore(baseTime);
    }

    /**
     * 퍼즐 타입이 체스인지 확인
     */
    isChessPuzzle(): boolean {
        return this.puzzle_type.toLowerCase().includes('chess');
    }

    /**
     * 퍼즐 타입이 스도쿠인지 확인
     */
    isSudokuPuzzle(): boolean {
        return this.puzzle_type.toLowerCase().includes('sudoku');
    }

    /**
     * 힌트 사용 등급 반환
     */
    getHintUsageGrade(): string {
        if (this.hint_count === 0) return 'Perfect';
        if (this.hint_count <= 2) return 'Excellent';
        if (this.hint_count <= 5) return 'Good';
        if (this.hint_count <= 10) return 'Fair';
        return 'Needs Practice';
    }

    /**
     * 최고 기록인지 확인 (비교 대상 필요)
     */
    isPersonalBest(previousRecords: PuzzleRecord[]): {
        bestTime: boolean;
        fewestHints: boolean;
    } {
        const sameTypeRecords = previousRecords.filter(
            record => record.puzzle_type === this.puzzle_type && 
                     record.difficulty === this.difficulty
        );

        const bestTime = sameTypeRecords.length === 0 || 
                        this.time_taken < Math.min(...sameTypeRecords.map(r => r.time_taken));
        
        const fewestHints = sameTypeRecords.length === 0 || 
                           this.hint_count < Math.min(...sameTypeRecords.map(r => r.hint_count));

        return { bestTime, fewestHints };
    }

    /**
     * 데이터베이스 저장용 객체 반환
     */
    toDatabaseJSON(): Omit<DatabasePuzzleRecordData, 'record_id'> {
        return {
            account_id: this.account_id,
            puzzle_type: this.puzzle_type,
            difficulty: this.difficulty,
            time_taken: this.time_taken,
            hint_count: this.hint_count,
            completed_at: this.completed_at
        };
    }

    /**
     * JSON 직렬화 (클라이언트 응답용)
     */
    toJSON(): DatabasePuzzleRecordData {
        return {
            record_id: this.record_id,
            account_id: this.account_id,
            puzzle_type: this.puzzle_type,
            difficulty: this.difficulty,
            time_taken: this.time_taken,
            hint_count: this.hint_count,
            completed_at: this.completed_at
        };
    }

    /**
     * 데이터 검증
     */
    validate(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.account_id) {
            errors.push('계정 ID는 필수입니다');
        } else if (!/^[A-Z0-9]{12}$/.test(this.account_id)) {
            errors.push('유효하지 않은 계정 ID 형식입니다');
        }

        if (!this.puzzle_type) {
            errors.push('퍼즐 타입은 필수입니다');
        } else if (this.puzzle_type.length > 50) {
            errors.push('퍼즐 타입은 50자 이하여야 합니다');
        }

        if (!this.difficulty) {
            errors.push('난이도는 필수입니다');
        } else if (this.difficulty.length > 20) {
            errors.push('난이도는 20자 이하여야 합니다');
        }

        if (this.time_taken < 0) {
            errors.push('소요 시간은 0 이상이어야 합니다');
        } else if (this.time_taken > 86400) { // 24시간
            errors.push('소요 시간이 너무 깁니다 (최대 24시간)');
        }

        if (this.hint_count < 0) {
            errors.push('힌트 사용 횟수는 0 이상이어야 합니다');
        } else if (this.hint_count > 100) {
            errors.push('힌트 사용 횟수가 너무 많습니다 (최대 100회)');
        }

        if (this.completed_at > new Date()) {
            errors.push('완성 시간은 미래일 수 없습니다');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 데이터베이스 로우에서 PuzzleRecord 인스턴스 생성
     */
    static fromDatabaseRow(row: PuzzleRecordData): PuzzleRecord {
        return new PuzzleRecord(row);
    }

    /**
     * 여러 데이터베이스 로우에서 PuzzleRecord 인스턴스 배열 생성
     */
    static fromDatabaseRows(rows: PuzzleRecordData[]): PuzzleRecord[] {
        return rows.map(row => PuzzleRecord.fromDatabaseRow(row));
    }

    /**
     * 퍼즐 완성 요청에서 PuzzleRecord 생성
     */
    static fromCompletionRequest(
        accountId: string, 
        request: PuzzleCompletionRequest
    ): PuzzleRecord {
        return new PuzzleRecord({
            account_id: accountId,
            puzzle_type: request.puzzle_type,
            difficulty: request.difficulty,
            time_taken: request.time_taken,
            hint_count: request.hint_count,
            completed_at: request.completed_at || new Date()
        });
    }

    /**
     * 퍼즐 기록들에서 통계 계산
     */
    static calculateStats(records: PuzzleRecord[]): PuzzleStats {
        if (records.length === 0) {
            return {
                total_puzzles: 0,
                total_time: 0,
                average_time: 0,
                best_time: 0,
                total_hints: 0,
                average_hints: 0,
                by_difficulty: {},
                by_type: {}
            };
        }

        const total_puzzles = records.length;
        const total_time = records.reduce((sum, r) => sum + r.time_taken, 0);
        const total_hints = records.reduce((sum, r) => sum + r.hint_count, 0);
        const best_time = Math.min(...records.map(r => r.time_taken));

        // 난이도별 통계
        const by_difficulty: { [key: string]: any } = {};
        records.forEach(record => {
            if (!by_difficulty[record.difficulty]) {
                by_difficulty[record.difficulty] = {
                    count: 0,
                    best_time: Infinity,
                    total_hints: 0
                };
            }
            by_difficulty[record.difficulty].count++;
            by_difficulty[record.difficulty].best_time = Math.min(
                by_difficulty[record.difficulty].best_time,
                record.time_taken
            );
            by_difficulty[record.difficulty].total_hints += record.hint_count;
        });

        // 타입별 통계
        const by_type: { [key: string]: any } = {};
        records.forEach(record => {
            if (!by_type[record.puzzle_type]) {
                by_type[record.puzzle_type] = {
                    count: 0,
                    best_time: Infinity,
                    total_hints: 0
                };
            }
            by_type[record.puzzle_type].count++;
            by_type[record.puzzle_type].best_time = Math.min(
                by_type[record.puzzle_type].best_time,
                record.time_taken
            );
            by_type[record.puzzle_type].total_hints += record.hint_count;
        });

        return {
            total_puzzles,
            total_time,
            average_time: Math.round(total_time / total_puzzles),
            best_time,
            total_hints,
            average_hints: Math.round(total_hints / total_puzzles),
            by_difficulty,
            by_type
        };
    }
}

export default PuzzleRecord;