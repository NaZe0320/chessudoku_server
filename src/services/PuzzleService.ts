import { BaseService } from './BaseService';
import { PuzzleRepository } from '../repositories/PuzzleRepository';
import { Puzzle, PuzzleData } from '../models/Puzzle';

/**
 * 퍼즐 관리 서비스
 */
export class PuzzleService extends BaseService<Puzzle> {
    private puzzleRepository: PuzzleRepository;

    constructor(puzzleRepository: PuzzleRepository) {
        super(puzzleRepository);
        this.puzzleRepository = puzzleRepository;
    }

    /**
     * 조건에 맞는 랜덤 퍼즐 조회
     */
    async getRandomPuzzle(puzzleType?: string, difficulty?: string): Promise<Puzzle | null> {
        try {
            const conditions: any = {};
            if (puzzleType) {
                conditions.puzzle_type = puzzleType;
            }
            if (difficulty) {
                // 난이도를 소문자로 정규화
                conditions.difficulty = difficulty.toLowerCase();
            }

            const puzzles = await this.puzzleRepository.findBy(conditions);
            
            if (puzzles.length === 0) {
                return null;
            }

            // 랜덤하게 하나 선택
            const randomIndex = Math.floor(Math.random() * puzzles.length);
            return Puzzle.fromDatabaseRow(puzzles[randomIndex]);
        } catch (error) {
            console.error('Error in getRandomPuzzle:', error);
            throw error;
        }
    }

    /**
     * 데일리 퍼즐 조회
     */
    async getDailyPuzzle(date: Date): Promise<Puzzle | null> {
        try {
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
            
            const puzzles = await this.puzzleRepository.findBy({
                puzzle_type: 'daily_challenge',
                daily_date: dateStr
            });

            return puzzles.length > 0 ? Puzzle.fromDatabaseRow(puzzles[0]) : null;
        } catch (error) {
            console.error('Error in getDailyPuzzle:', error);
            throw error;
        }
    }

    /**
     * 퍼즐 생성
     */
    async createPuzzle(puzzleData: {
        puzzle_type: string;
        difficulty: string;
        puzzle_data: object;
        answer_data: object;
        daily_date?: Date | null;
    }): Promise<Puzzle> {
        try {
            // 데이터 검증
            if (!puzzleData.puzzle_type || !puzzleData.difficulty) {
                throw new Error('퍼즐 타입과 난이도는 필수입니다');
            }

            if (!puzzleData.puzzle_data || !puzzleData.answer_data) {
                throw new Error('퍼즐 데이터와 답안 데이터는 필수입니다');
            }

            const puzzle = new Puzzle({
                puzzle_type: puzzleData.puzzle_type,
                difficulty: puzzleData.difficulty,
                puzzle_data: puzzleData.puzzle_data,
                answer_data: puzzleData.answer_data,
                daily_date: puzzleData.daily_date || null
            });

            const savedPuzzle = await this.puzzleRepository.create(puzzle.toDatabaseJSON());
            return Puzzle.fromDatabaseRow(savedPuzzle);
        } catch (error) {
            console.error('Error in createPuzzle:', error);
            throw error;
        }
    }

    /**
     * 퍼즐 삭제
     */
    async deletePuzzle(puzzleId: number): Promise<boolean> {
        try {
            // 퍼즐 존재 확인
            const puzzle = await this.puzzleRepository.findById(puzzleId);
            if (!puzzle) {
                return false;
            }

            // 퍼즐 삭제
            return await this.puzzleRepository.delete(puzzleId);
        } catch (error) {
            console.error('Error in deletePuzzle:', error);
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

        const required = ['puzzle_type', 'difficulty', 'puzzle_data', 'answer_data'];
        for (const field of required) {
            if (!isUpdate && data[field] === undefined) {
                throw new Error(`${field}는 필수 필드입니다`);
            }
        }
    }

    protected override async beforeCreate(data: any): Promise<any> {
        return {
            ...data,
            daily_date: data.daily_date || null
        };
    }

    protected override async afterCreate(result: Puzzle): Promise<Puzzle> {
        console.log(`새 퍼즐 생성됨: ${result.puzzle_id} - ${result.puzzle_type} (${result.difficulty})`);
        return result;
    }
}

export default PuzzleService;