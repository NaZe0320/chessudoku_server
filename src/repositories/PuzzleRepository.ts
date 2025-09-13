import { BaseRepository } from './BaseRepository';
import { Puzzle } from '../models/Puzzle';

/**
 * Puzzle 전용 Repository 클래스
 */
export class PuzzleRepository extends BaseRepository<Puzzle> {
    constructor() {
        super('Puzzle');
    }

    /**
     * ID로 레코드 조회 (puzzle_id 사용)
     */
    override async findById(id: number | string): Promise<Puzzle | null> {
        const query = `SELECT * FROM "${this.tableName}" WHERE puzzle_id = $1`;
        const result = await this.execute(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * 모든 레코드 조회 (puzzle_id로 정렬)
     */
    override async findAll(): Promise<Puzzle[]> {
        const query = `SELECT * FROM "${this.tableName}" ORDER BY puzzle_id DESC`;
        const result = await this.execute(query);
        return result.rows;
    }

    /**
     * 새 퍼즐 생성 (puzzle_id 제외)
     */
    override async create(data: any): Promise<Puzzle> {
        // puzzle_id를 제외한 데이터만 사용
        const { puzzle_id, ...createData } = data;
        
        const keys = Object.keys(createData);
        const values = Object.values(createData);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        const columns = keys.join(', ');

        const query = `
            INSERT INTO "${this.tableName}" (${columns}) 
            VALUES (${placeholders}) 
            RETURNING *
        `;
        
        const result = await this.execute(query, values);
        return result.rows[0];
    }

    /**
     * 레코드 삭제 (puzzle_id 사용)
     */
    override async delete(id: number | string): Promise<boolean> {
        const query = `DELETE FROM "${this.tableName}" WHERE puzzle_id = $1`;
        const result = await this.execute(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
}

export default PuzzleRepository;