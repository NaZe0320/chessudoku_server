import { BaseRepository } from './BaseRepository';
import { PuzzleRecord, PuzzleRecordData, PuzzleRecordQueryOptions, PuzzleStats } from '../models/PuzzleRecord';

/**
 * PuzzleRecord 전용 Repository 클래스
 */
export class PuzzleRepository extends BaseRepository<PuzzleRecord> {
    constructor() {
        super('puzzle_records');
    }

    /**
     * 특정 계정의 모든 퍼즐 기록 조회
     */
    async findByAccountId(
        accountId: string, 
        options: PuzzleRecordQueryOptions = {}
    ): Promise<PuzzleRecord[]> {
        try {
            let query = `SELECT * FROM ${this.tableName} WHERE account_id = $1`;
            const params: any[] = [accountId];
            let paramIndex = 2;

            // 필터 조건 추가
            if (options.puzzle_type) {
                query += ` AND puzzle_type = $${paramIndex++}`;
                params.push(options.puzzle_type);   
            }

            if (options.difficulty) {
                query += ` AND difficulty = $${paramIndex++}`;
                params.push(options.difficulty);
            }

            if (options.date_from) {
                query += ` AND completed_at >= $${paramIndex++}`;
                params.push(options.date_from);
            }

            if (options.date_to) {
                query += ` AND completed_at <= $${paramIndex++}`;
                params.push(options.date_to);
            }

            // 정렬
            const sortBy = options.sort_by || 'completed_at';
            const sortOrder = options.sort_order || 'DESC';
            query += ` ORDER BY ${sortBy} ${sortOrder}`;

            // 페이지네이션
            if (options.limit) {
                query += ` LIMIT $${paramIndex++}`;
                params.push(options.limit);

                if (options.offset) {
                    query += ` OFFSET $${paramIndex++}`;
                    params.push(options.offset);
                }
            }

            const result = await this.execute(query, params);
            return PuzzleRecord.fromDatabaseRows(result.rows);
        } catch (error) {
            console.error('Error in findByAccountId:', error);
            throw error;
        }
    }

    /**
     * 특정 계정의 퍼즐 기록 개수 조회
     */
    async countByAccountId(
        accountId: string, 
        puzzleType?: string, 
        difficulty?: string
    ): Promise<number> {
        try {
            let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE account_id = $1`;
            const params: any[] = [accountId];
            let paramIndex = 2;

            if (puzzleType) {
                query += ` AND puzzle_type = $${paramIndex++}`;
                params.push(puzzleType);
            }

            if (difficulty) {
                query += ` AND difficulty = $${paramIndex++}`;
                params.push(difficulty);
            }

            const result = await this.execute(query, params);
            return parseInt((result.rows[0] as any).count);
        } catch (error) {
            console.error('Error in countByAccountId:', error);
            throw error;
        }
    }

    /**
     * 특정 계정의 최고 기록들 조회
     */
    async getBestRecords(accountId: string): Promise<{
        bestTime: PuzzleRecord | null;
        fewestHints: PuzzleRecord | null;
        bestByType: { [type: string]: PuzzleRecord };
        bestByDifficulty: { [difficulty: string]: PuzzleRecord };
    }> {
        try {
            // 최단 시간 기록
            const bestTimeQuery = `
                SELECT * FROM ${this.tableName} 
                WHERE account_id = $1 
                ORDER BY time_taken ASC 
                LIMIT 1
            `;
            const bestTimeResult = await this.execute(bestTimeQuery, [accountId]);
            const bestTime = bestTimeResult.rows.length > 0 
                ? PuzzleRecord.fromDatabaseRow(bestTimeResult.rows[0]) 
                : null;

            // 최소 힌트 기록
            const fewestHintsQuery = `
                SELECT * FROM ${this.tableName} 
                WHERE account_id = $1 
                ORDER BY hint_count ASC, time_taken ASC 
                LIMIT 1
            `;
            const fewestHintsResult = await this.execute(fewestHintsQuery, [accountId]);
            const fewestHints = fewestHintsResult.rows.length > 0 
                ? PuzzleRecord.fromDatabaseRow(fewestHintsResult.rows[0]) 
                : null;

            // 타입별 최고 기록 (힌트 적게 쓴 순서)
            const bestByTypeQuery = `
                SELECT DISTINCT ON (puzzle_type) 
                    puzzle_type, * 
                FROM ${this.tableName} 
                WHERE account_id = $1 
                ORDER BY puzzle_type, hint_count ASC, time_taken ASC
            `;
            const bestByTypeResult = await this.execute(bestByTypeQuery, [accountId]);
            const bestByType: { [type: string]: PuzzleRecord } = {};
            bestByTypeResult.rows.forEach(row => {
                bestByType[row.puzzle_type] = PuzzleRecord.fromDatabaseRow(row);
            });

            // 난이도별 최고 기록 (힌트 적게 쓴 순서)
            const bestByDifficultyQuery = `
                SELECT DISTINCT ON (difficulty) 
                    difficulty, * 
                FROM ${this.tableName} 
                WHERE account_id = $1 
                ORDER BY difficulty, hint_count ASC, time_taken ASC
            `;
            const bestByDifficultyResult = await this.execute(bestByDifficultyQuery, [accountId]);
            const bestByDifficulty: { [difficulty: string]: PuzzleRecord } = {};
            bestByDifficultyResult.rows.forEach(row => {
                bestByDifficulty[row.difficulty] = PuzzleRecord.fromDatabaseRow(row);
            });

            return {
                bestTime,
                fewestHints,
                bestByType,
                bestByDifficulty
            };
        } catch (error) {
            console.error('Error in getBestRecords:', error);
            throw error;
        }
    }

    /**
     * 특정 계정의 통계 계산
     */
    async calculateStatsByAccountId(accountId: string): Promise<PuzzleStats> {
        try {
            const records = await this.findByAccountId(accountId);
            return PuzzleRecord.calculateStats(records);
        } catch (error) {
            console.error('Error in calculateStatsByAccountId:', error);
            throw error;
        }
    }

    /**
     * 퍼즐 기록 추가
     */
    async addPuzzleRecord(puzzleRecord: PuzzleRecord): Promise<PuzzleRecord> {
        try {
            const data = puzzleRecord.toDatabaseJSON();
            const query = `
                INSERT INTO ${this.tableName} 
                (account_id, puzzle_type, difficulty, time_taken, hint_count, completed_at) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *
            `;
            
            const values = [
                data.account_id,
                data.puzzle_type,
                data.difficulty,
                data.time_taken,
                data.hint_count,
                data.completed_at
            ];
            
            const result = await this.execute(query, values);
            return PuzzleRecord.fromDatabaseRow(result.rows[0]);
        } catch (error) {
            console.error('Error in addPuzzleRecord:', error);
            throw error;
        }
    }

    /**
     * 특정 기간 내 퍼즐 기록 조회
     */
    async findByDateRange(
        accountId: string, 
        startDate: Date, 
        endDate: Date
    ): Promise<PuzzleRecord[]> {
        try {
            const query = `
                SELECT * FROM ${this.tableName} 
                WHERE account_id = $1 
                AND completed_at >= $2 
                AND completed_at <= $3 
                ORDER BY completed_at DESC
            `;
            
            const result = await this.execute(query, [accountId, startDate, endDate]);
            return PuzzleRecord.fromDatabaseRows(result.rows);
        } catch (error) {
            console.error('Error in findByDateRange:', error);
            throw error;
        }
    }

    /**
     * 최근 N개의 퍼즐 기록 조회
     */
    async findRecentRecords(accountId: string, limit: number = 10): Promise<PuzzleRecord[]> {
        try {
            const query = `
                SELECT * FROM ${this.tableName} 
                WHERE account_id = $1 
                ORDER BY completed_at DESC 
                LIMIT $2
            `;
            
            const result = await this.execute(query, [accountId, limit]);
            return PuzzleRecord.fromDatabaseRows(result.rows);
        } catch (error) {
            console.error('Error in findRecentRecords:', error);
            throw error;
        }
    }

    /**
     * 특정 힌트 수 이하의 기록들 조회
     */
    async findByMaxHints(
        accountId: string, 
        maxHints: number, 
        puzzleType?: string
    ): Promise<PuzzleRecord[]> {
        try {
            let query = `
                SELECT * FROM ${this.tableName} 
                WHERE account_id = $1 AND hint_count <= $2
            `;
            const params: any[] = [accountId, maxHints];

            if (puzzleType) {
                query += ` AND puzzle_type = $3`;
                params.push(puzzleType);
            }

            query += ` ORDER BY hint_count ASC, time_taken ASC`;
            
            const result = await this.execute(query, params);
            return PuzzleRecord.fromDatabaseRows(result.rows);
        } catch (error) {
            console.error('Error in findByMaxHints:', error);
            throw error;
        }
    }

    /**
     * 특정 시간 이하의 기록들 조회 (빠른 기록들)
     */
    async findByMaxTime(
        accountId: string, 
        maxTime: number, 
        puzzleType?: string
    ): Promise<PuzzleRecord[]> {
        try {
            let query = `
                SELECT * FROM ${this.tableName} 
                WHERE account_id = $1 AND time_taken <= $2
            `;
            const params: any[] = [accountId, maxTime];

            if (puzzleType) {
                query += ` AND puzzle_type = $3`;
                params.push(puzzleType);
            }

            query += ` ORDER BY time_taken ASC`;
            
            const result = await this.execute(query, params);
            return PuzzleRecord.fromDatabaseRows(result.rows);
        } catch (error) {
            console.error('Error in findByMaxTime:', error);
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
            const query = `
                SELECT 
                    DATE(completed_at) as date,
                    COUNT(*) as count,
                    SUM(time_taken) as total_time,
                    AVG(hint_count) as avg_hints
                FROM ${this.tableName} 
                WHERE account_id = $1 
                AND completed_at >= CURRENT_DATE - INTERVAL '${days} days'
                GROUP BY DATE(completed_at)
                ORDER BY date DESC
            `;
            
            const result = await this.execute(query, [accountId]);
            return result.rows.map((row: any) => ({
                date: row.date,
                count: parseInt(row.count),
                total_time: parseInt(row.total_time),
                avg_hints: Math.round(parseFloat(row.avg_hints))
            }));
        } catch (error) {
            console.error('Error in getDailyStats:', error);
            throw error;
        }
    }

    /**
     * 글로벌 순위 조회 (최소 힌트 기준)
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
            let query = `
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY hint_count ASC, time_taken ASC) as rank,
                    account_id,
                    hint_count,
                    time_taken,
                    completed_at
                FROM ${this.tableName} 
                WHERE puzzle_type = $1
            `;
            const params: any[] = [puzzleType];

            if (difficulty) {
                query += ` AND difficulty = $2`;
                params.push(difficulty);
            }

            query += ` ORDER BY hint_count ASC, time_taken ASC LIMIT $${params.length + 1}`;
            params.push(limit);
            
            const result = await this.execute(query, params);
            return result.rows.map((row: any) => ({
                rank: row.rank,
                account_id: row.account_id,
                hint_count: row.hint_count,
                time_taken: row.time_taken,
                completed_at: row.completed_at
            }));
        } catch (error) {
            console.error('Error in getGlobalRanking:', error);
            throw error;
        }
    }

    /**
     * BaseRepository의 create 메서드 오버라이드
     */
    override async create(data: any): Promise<PuzzleRecord> {
        const puzzleRecord = new PuzzleRecord(data);
        return await this.addPuzzleRecord(puzzleRecord);
    }

    /**
     * BaseRepository의 findAll 메서드 오버라이드 (제한적으로 사용)
     */
    override async findAll(): Promise<PuzzleRecord[]> {
        const query = `SELECT * FROM ${this.tableName} ORDER BY completed_at DESC LIMIT 1000`;
        const result = await this.execute(query);
        return PuzzleRecord.fromDatabaseRows(result.rows);
    }
}

export default PuzzleRepository;