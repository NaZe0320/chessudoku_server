import { BaseRepository, DatabaseRecord, QueryConditions, CreateData, UpdateData } from '../repositories/BaseRepository';

// Re-export types for use in other modules
export type { DatabaseRecord, QueryConditions, CreateData, UpdateData };

export interface ServiceValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * 모든 Service가 상속받는 기본 Service 클래스
 */
export abstract class BaseService<T extends DatabaseRecord = DatabaseRecord> {
    protected repository: BaseRepository<T>;

    constructor(repository: BaseRepository<T>) {
        this.repository = repository;
    }

    /**
     * 모든 레코드 조회
     */
    async getAll(): Promise<T[]> {
        try {
            return await this.repository.findAll();
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.getAll:`, error);
            throw new Error('데이터 조회 중 오류가 발생했습니다');
        }
    }

    /**
     * ID로 레코드 조회
     */
    async getById(id: number | string): Promise<T> {
        try {
            if (!id) {
                throw new Error('ID는 필수입니다');
            }

            const result = await this.repository.findById(id);
            if (!result) {
                throw new Error('데이터를 찾을 수 없습니다');
            }

            return result;
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.getById:`, error);
            throw error;
        }
    }

    /**
     * 조건으로 레코드 조회
     */
    async getBy(conditions: QueryConditions): Promise<T[]> {
        try {
            if (!conditions || Object.keys(conditions).length === 0) {
                throw new Error('조회 조건이 필요합니다');
            }

            return await this.repository.findBy(conditions);
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.getBy:`, error);
            throw error;
        }
    }

    /**
     * 첫 번째 레코드 조회
     */
    async getOne(conditions: QueryConditions): Promise<T | null> {
        try {
            if (!conditions || Object.keys(conditions).length === 0) {
                throw new Error('조회 조건이 필요합니다');
            }

            return await this.repository.findOne(conditions);
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.getOne:`, error);
            throw error;
        }
    }

    /**
     * 페이지네이션을 위한 레코드 조회
     */
    async getPaginated(
        options: PaginationOptions = {},
        conditions: QueryConditions = {}
    ): Promise<PaginatedResult<T>> {
        try {
            const {
                page = 1,
                limit = 10,
                orderBy = 'created_at',
                orderDirection = 'DESC'
            } = options;

            const result = await this.repository.findWithPagination(
                page,
                limit,
                conditions,
                orderBy,
                orderDirection
            );

            const totalPages = Math.ceil(result.total / result.limit);

            return {
                ...result,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            };
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.getPaginated:`, error);
            throw new Error('페이지네이션 조회 중 오류가 발생했습니다');
        }
    }

    /**
     * 새 레코드 생성
     */
    async create(data: CreateData): Promise<T> {
        try {
            // 데이터 검증
            await this.validateData(data);

            // 생성 전 처리
            const processedData = await this.beforeCreate(data);

            // 데이터 생성
            const result = await this.repository.create(processedData);

            // 생성 후 처리
            return await this.afterCreate(result);
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.create:`, error);
            throw error;
        }
    }

    /**
     * 여러 레코드 생성
     */
    async createMany(dataArray: CreateData[]): Promise<T[]> {
        try {
            if (!Array.isArray(dataArray) || dataArray.length === 0) {
                throw new Error('생성할 데이터 배열이 필요합니다');
            }

            // 각 데이터 검증
            for (const data of dataArray) {
                await this.validateData(data);
            }

            // 생성 전 처리
            const processedDataArray = await Promise.all(
                dataArray.map(data => this.beforeCreate(data))
            );

            // 데이터 생성
            const results = await this.repository.createMany(processedDataArray);

            // 생성 후 처리
            return await Promise.all(
                results.map(result => this.afterCreate(result))
            );
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.createMany:`, error);
            throw error;
        }
    }

    /**
     * 레코드 업데이트
     */
    async update(id: number | string, data: UpdateData): Promise<T> {
        try {
            if (!id) {
                throw new Error('ID는 필수입니다');
            }

            // 기존 데이터 확인
            const existing = await this.repository.findById(id);
            if (!existing) {
                throw new Error('데이터를 찾을 수 없습니다');
            }

            // 데이터 검증
            await this.validateData(data, true);

            // 업데이트 전 처리
            const processedData = await this.beforeUpdate(data, existing);

            // 데이터 업데이트
            const result = await this.repository.update(id, processedData);
            if (!result) {
                throw new Error('업데이트 실패');
            }

            // 업데이트 후 처리
            return await this.afterUpdate(result);
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.update:`, error);
            throw error;
        }
    }

    /**
     * 조건으로 레코드 업데이트
     */
    async updateBy(conditions: QueryConditions, data: UpdateData): Promise<T[]> {
        try {
            if (!conditions || Object.keys(conditions).length === 0) {
                throw new Error('업데이트 조건이 필요합니다');
            }

            // 데이터 검증
            await this.validateData(data, true);

            // 업데이트할 레코드들 조회
            const existingRecords = await this.repository.findBy(conditions);
            if (existingRecords.length === 0) {
                throw new Error('업데이트할 데이터를 찾을 수 없습니다');
            }

            // 업데이트 전 처리
            const processedData = await this.beforeBulkUpdate(data, existingRecords);

            // 데이터 업데이트
            const results = await this.repository.updateBy(conditions, processedData);

            // 업데이트 후 처리
            return await Promise.all(
                results.map(result => this.afterUpdate(result))
            );
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.updateBy:`, error);
            throw error;
        }
    }

    /**
     * 레코드 삭제
     */
    async delete(id: number | string): Promise<boolean> {
        try {
            if (!id) {
                throw new Error('ID는 필수입니다');
            }

            // 기존 데이터 확인
            const existing = await this.repository.findById(id);
            if (!existing) {
                throw new Error('데이터를 찾을 수 없습니다');
            }

            // 삭제 전 처리
            await this.beforeDelete(existing);

            // 데이터 삭제
            const result = await this.repository.delete(id);

            // 삭제 후 처리
            await this.afterDelete(existing);

            return result;
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.delete:`, error);
            throw error;
        }
    }

    /**
     * 조건으로 레코드 삭제
     */
    async deleteBy(conditions: QueryConditions): Promise<number> {
        try {
            if (!conditions || Object.keys(conditions).length === 0) {
                throw new Error('삭제 조건이 필요합니다');
            }

            // 삭제할 레코드들 조회
            const existingRecords = await this.repository.findBy(conditions);
            if (existingRecords.length === 0) {
                return 0;
            }

            // 삭제 전 처리
            await this.beforeBulkDelete(existingRecords);

            // 데이터 삭제
            const deletedCount = await this.repository.deleteBy(conditions);

            // 삭제 후 처리
            await this.afterBulkDelete(existingRecords);

            return deletedCount;
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.deleteBy:`, error);
            throw error;
        }
    }

    /**
     * 레코드 개수 조회
     */
    async count(conditions: QueryConditions = {}): Promise<number> {
        try {
            return await this.repository.count(conditions);
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.count:`, error);
            throw new Error('데이터 개수 조회 중 오류가 발생했습니다');
        }
    }

    /**
     * 레코드 존재 여부 확인
     */
    async exists(conditions: QueryConditions): Promise<boolean> {
        try {
            return await this.repository.exists(conditions);
        } catch (error) {
            console.error(`Error in ${this.constructor.name}.exists:`, error);
            throw new Error('데이터 존재 여부 확인 중 오류가 발생했습니다');
        }
    }

    // Hook 메서드들 - 하위 클래스에서 오버라이드
    protected async validateData(data: CreateData | UpdateData, isUpdate: boolean = false): Promise<void> {
        // 기본 데이터 검증 로직
        if (!data || typeof data !== 'object') {
            throw new Error('유효하지 않은 데이터입니다');
        }
    }

    protected async beforeCreate(data: CreateData): Promise<CreateData> {
        // 생성 전 처리 로직
        return {
            ...data,
            created_at: new Date(),
            updated_at: new Date()
        };
    }

    protected async afterCreate(result: T): Promise<T> {
        // 생성 후 처리 로직
        return result;
    }

    protected async beforeUpdate(data: UpdateData, existing: T): Promise<UpdateData> {
        // 업데이트 전 처리 로직
        return {
            ...data,
            updated_at: new Date()
        };
    }

    protected async afterUpdate(result: T): Promise<T> {
        // 업데이트 후 처리 로직
        return result;
    }

    protected async beforeBulkUpdate(data: UpdateData, existingRecords: T[]): Promise<UpdateData> {
        // 대량 업데이트 전 처리 로직
        return {
            ...data,
            updated_at: new Date()
        };
    }

    protected async beforeDelete(existing: T): Promise<void> {
        // 삭제 전 처리 로직
    }

    protected async afterDelete(deleted: T): Promise<void> {
        // 삭제 후 처리 로직
    }

    protected async beforeBulkDelete(existingRecords: T[]): Promise<void> {
        // 대량 삭제 전 처리 로직
    }

    protected async afterBulkDelete(deletedRecords: T[]): Promise<void> {
        // 대량 삭제 후 처리 로직
    }

    /**
     * 트랜잭션 실행
     */
    async transaction<R>(callback: (client: any) => Promise<R>): Promise<R> {
        return this.repository.transaction(callback);
    }
}
