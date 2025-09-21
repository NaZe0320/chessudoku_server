import { Pool, QueryResult } from 'pg';
import { pool } from '../config/database';

export interface DatabaseRecord {
    id: number | string;
    created_at?: Date;
    updated_at?: Date;
}

export interface QueryConditions {
    [key: string]: any;
}

export interface CreateData {
    [key: string]: any;
}

export interface UpdateData {
    [key: string]: any;
}

/**
 * 모든 Repository가 상속받는 기본 Repository 클래스
 */
export abstract class BaseRepository<T extends DatabaseRecord = DatabaseRecord> {
    protected tableName: string;
    protected pool: Pool;

    constructor(tableName: string) {
        this.tableName = tableName;
        this.pool = pool;
    }

    /**
     * 데이터베이스 쿼리 실행
     */
    protected async execute(query: string, params: any[] = []): Promise<QueryResult<T>> {
        const client = await this.pool.connect();
        try {
            const result = await client.query<T>(query, params);
            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * 모든 레코드 조회
     */
    async findAll(): Promise<T[]> {
        const query = `SELECT * FROM ${this.tableName}`;
        const result = await this.execute(query);
        return result.rows;
    }

    /**
     * ID로 레코드 조회
     */
    async findById(id: number | string): Promise<T | null> {
        const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
        const result = await this.execute(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * 조건으로 레코드 조회
     */
    async findBy(conditions: QueryConditions): Promise<T[]> {
        const keys = Object.keys(conditions);
        const values = Object.values(conditions);
        
        if (keys.length === 0) {
            return this.findAll();
        }
        
        const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
        
        const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
        const result = await this.execute(query, values);
        return result.rows;
    }

    /**
     * 첫 번째 레코드 조회
     */
    async findOne(conditions: QueryConditions): Promise<T | null> {
        const results = await this.findBy(conditions);
        return results[0] || null;
    }

    /**
     * 새 레코드 생성
     */
    async create(data: CreateData): Promise<T> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        const columns = keys.join(', ');

        const query = `
            INSERT INTO ${this.tableName} (${columns}) 
            VALUES (${placeholders}) 
            RETURNING *
        `;
        
        const result = await this.execute(query, values);
        return result.rows[0];
    }

    /**
     * 여러 레코드 생성
     */
    async createMany(dataArray: CreateData[]): Promise<T[]> {
        if (dataArray.length === 0) return [];

        const keys = Object.keys(dataArray[0]);
        const columns = keys.join(', ');
        
        const placeholders = dataArray.map((_, rowIndex) => {
            const rowPlaceholders = keys.map((_, colIndex) => 
                `$${rowIndex * keys.length + colIndex + 1}`
            ).join(', ');
            return `(${rowPlaceholders})`;
        }).join(', ');

        const values = dataArray.flatMap(row => Object.values(row));

        const query = `
            INSERT INTO ${this.tableName} (${columns}) 
            VALUES ${placeholders} 
            RETURNING *
        `;
        
        const result = await this.execute(query, values);
        return result.rows;
    }

    /**
     * 레코드 업데이트
     */
    async update(id: number | string, data: UpdateData): Promise<T | null> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

        const query = `
            UPDATE ${this.tableName} 
            SET ${setClause}
            WHERE id = $1 
            RETURNING *
        `;
        
        const result = await this.execute(query, [id, ...values]);
        return result.rows[0] || null;
    }

    /**
     * 조건으로 레코드 업데이트
     */
    async updateBy(conditions: QueryConditions, data: UpdateData): Promise<T[]> {
        const conditionKeys = Object.keys(conditions);
        const conditionValues = Object.values(conditions);
        const dataKeys = Object.keys(data);
        const dataValues = Object.values(data);

        const whereClause = conditionKeys.map((key, index) => 
            `${key} = $${dataKeys.length + index + 1}`
        ).join(' AND ');
        
        const setClause = dataKeys.map((key, index) => 
            `${key} = $${index + 1}`
        ).join(', ');

        const query = `
            UPDATE ${this.tableName} 
            SET ${setClause}
            WHERE ${whereClause} 
            RETURNING *
        `;
        
        const result = await this.execute(query, [...dataValues, ...conditionValues]);
        return result.rows;
    }

    /**
     * 레코드 삭제
     */
    async delete(id: number | string): Promise<boolean> {
        const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
        const result = await this.execute(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    /**
     * 조건으로 레코드 삭제
     */
    async deleteBy(conditions: QueryConditions): Promise<number> {
        const keys = Object.keys(conditions);
        const values = Object.values(conditions);
        const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

        const query = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
        const result = await this.execute(query, values);
        return result.rowCount || 0;
    }

    /**
     * 레코드 개수 조회
     */
    async count(conditions: QueryConditions = {}): Promise<number> {
        let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
        let params: any[] = [];

        if (Object.keys(conditions).length > 0) {
            const keys = Object.keys(conditions);
            const values = Object.values(conditions);
            const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
            query += ` WHERE ${whereClause}`;
            params = values;
        }

        const result = await this.execute(query, params);
        return parseInt((result.rows[0] as any).count);
    }

    /**
     * 레코드 존재 여부 확인
     */
    async exists(conditions: QueryConditions): Promise<boolean> {
        const count = await this.count(conditions);
        return count > 0;
    }

    /**
     * 페이지네이션을 위한 레코드 조회
     */
    async findWithPagination(
        page: number = 1, 
        limit: number = 10, 
        conditions: QueryConditions = {},
        orderBy: string = 'id',
        orderDirection: 'ASC' | 'DESC' = 'ASC'
    ): Promise<{ items: T[], total: number, page: number, limit: number }> {
        const offset = (page - 1) * limit;
        
        let whereClause = '';
        let params: any[] = [];
        
        if (Object.keys(conditions).length > 0) {
            const keys = Object.keys(conditions);
            const values = Object.values(conditions);
            whereClause = 'WHERE ' + keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
            params = values;
        }

        // 전체 개수 조회
        const countQuery = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
        const countResult = await this.execute(countQuery, params);
        const total = parseInt((countResult.rows[0] as any).count);

        // 페이지 데이터 조회
        const dataQuery = `
            SELECT * FROM ${this.tableName} 
            ${whereClause} 
            ORDER BY ${orderBy} ${orderDirection} 
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        const dataResult = await this.execute(dataQuery, [...params, limit, offset]);

        return {
            items: dataResult.rows,
            total,
            page,
            limit
        };
    }

    /**
     * 트랜잭션 실행
     */
    async transaction<R>(callback: (client: any) => Promise<R>): Promise<R> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
