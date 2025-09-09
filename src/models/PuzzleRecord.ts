import { DatabaseRecord } from '../repositories/BaseRepository';

/**
 * 퍼즐 기록 데이터 인터페이스
 */
export interface PuzzleRecordData {
    record_id?: number;
    user_id?: string;
    puzzle_id?: number;
    puzzle_type?: string;
    create_at?: Date;
    solve_time?: number;
    hints_used?: number;
}

/**
 * 데이터베이스 퍼즐 기록 데이터
 */
export interface DatabasePuzzleRecordData {
    record_id: number;
    user_id: string;
    puzzle_id: number;
    puzzle_type: string;
    create_at: Date;
    solve_time: number;
    hints_used: number;
}

/**
 * PuzzleRecord 모델 클래스
 */
export class PuzzleRecord implements DatabaseRecord {
    public record_id: number;
    public user_id: string;
    public puzzle_id: number;
    public puzzle_type: string;
    public create_at: Date;
    public solve_time: number;
    public hints_used: number;
    
    // DatabaseRecord 호환성을 위한 id
    public get id(): number {
        return this.record_id;
    }
    
    public created_at?: Date;
    public updated_at?: Date;

    constructor(data: PuzzleRecordData = {}) {
        this.record_id = data.record_id || 0;
        this.user_id = data.user_id || '';
        this.puzzle_id = data.puzzle_id || 0;
        this.puzzle_type = data.puzzle_type || 'normal';
        this.create_at = data.create_at || new Date();
        this.solve_time = data.solve_time || 0;
        this.hints_used = data.hints_used || 0;
        
        this.created_at = this.create_at;
        this.updated_at = this.create_at;
    }

    /**
     * 데이터베이스 저장용 객체 반환
     */
    toDatabaseJSON(): Omit<DatabasePuzzleRecordData, 'record_id'> {
        return {
            user_id: this.user_id,
            puzzle_id: this.puzzle_id,
            puzzle_type: this.puzzle_type,
            create_at: this.create_at,
            solve_time: this.solve_time,
            hints_used: this.hints_used
        };
    }

    /**
     * 데이터베이스 로우에서 PuzzleRecord 인스턴스 생성
     */
    static fromDatabaseRow(row: PuzzleRecordData): PuzzleRecord {
        return new PuzzleRecord(row);
    }

    /**
     * 데이터베이스 로우들에서 PuzzleRecord 인스턴스들 생성
     */
    static fromDatabaseRows(rows: PuzzleRecordData[]): PuzzleRecord[] {
        return rows.map(row => PuzzleRecord.fromDatabaseRow(row));
    }
}

export default PuzzleRecord;