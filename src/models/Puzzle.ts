import { DatabaseRecord } from '../repositories/BaseRepository';

/**
 * 퍼즐 데이터 인터페이스
 */
export interface PuzzleData {
    puzzle_id?: number;
    puzzle_type?: string;
    difficulty?: string;
    puzzle_data?: object;
    answer_data?: object;
    daily_date?: Date | null;
}

/**
 * 데이터베이스 퍼즐 데이터
 */
export interface DatabasePuzzleData {
    puzzle_id: number;
    puzzle_type: string;
    difficulty: string;
    puzzle_data: object;
    answer_data: object;
    daily_date: Date | null;
}

/**
 * Puzzle 모델 클래스
 */
export class Puzzle implements DatabaseRecord {
    public puzzle_id: number;
    public puzzle_type: string;
    public difficulty: string;
    public puzzle_data: object;
    public answer_data: object;
    public daily_date: Date | null;
    
    // DatabaseRecord 호환성을 위한 id
    public get id(): number {
        return this.puzzle_id;
    }
    
    public created_at?: Date;
    public updated_at?: Date;

    constructor(data: PuzzleData = {}) {
        this.puzzle_id = data.puzzle_id || 0;
        this.puzzle_type = data.puzzle_type || 'normal';
        this.difficulty = data.difficulty || 'Easy';
        this.puzzle_data = data.puzzle_data || {};
        this.answer_data = data.answer_data || {};
        this.daily_date = data.daily_date || null;
        
        this.created_at = new Date();
        this.updated_at = new Date();
    }

    /**
     * 데이터베이스 저장용 객체 반환
     */
    toDatabaseJSON(): Omit<DatabasePuzzleData, 'puzzle_id'> {
        return {
            puzzle_type: this.puzzle_type,
            difficulty: this.difficulty,
            puzzle_data: this.puzzle_data,
            answer_data: this.answer_data,
            daily_date: this.daily_date
        };
    }

    /**
     * 데이터베이스 로우에서 Puzzle 인스턴스 생성
     */
    static fromDatabaseRow(row: PuzzleData): Puzzle {
        return new Puzzle(row);
    }

    /**
     * 데이터베이스 로우들에서 Puzzle 인스턴스들 생성
     */
    static fromDatabaseRows(rows: PuzzleData[]): Puzzle[] {
        return rows.map(row => Puzzle.fromDatabaseRow(row));
    }
}

export default Puzzle;