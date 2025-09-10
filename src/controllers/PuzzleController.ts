import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { PuzzleService } from '../services/PuzzleService';
import { Puzzle } from '../models/Puzzle';

/**
 * 퍼즐 관리 컨트롤러
 */
export class PuzzleController extends BaseController<Puzzle> {
    private puzzleService: PuzzleService;

    constructor(puzzleService: PuzzleService) {
        super(puzzleService);
        this.puzzleService = puzzleService;

        // 메서드 바인딩
        this.getRandomPuzzle = this.getRandomPuzzle.bind(this);
        this.getDailyPuzzle = this.getDailyPuzzle.bind(this);
    }

    /**
     * 조건에 맞는 랜덤 퍼즐 조회
     * GET /api/puzzle/random
     */
    async getRandomPuzzle(req: Request, res: Response): Promise<void> {
        try {
            const { puzzle_type, difficulty } = req.query;

            const puzzle = await this.puzzleService.getRandomPuzzle(
                puzzle_type as string, 
                difficulty as string
            );

            if (!puzzle) {
                res.status(404).json({
                    success: false,
                    message: '조건에 맞는 퍼즐을 찾을 수 없습니다'
                });
                return;
            }

            res.json({
                success: true,
                message: '퍼즐 조회 성공',
                data: puzzle
            });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 데일리 퍼즐 조회
     * GET /api/puzzle/daily
     */
    async getDailyPuzzle(req: Request, res: Response): Promise<void> {
        try {
            const { date } = req.query;
            
            const targetDate = date ? new Date(date as string) : new Date();
            if (isNaN(targetDate.getTime())) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 날짜 형식입니다'
                });
                return;
            }

            const puzzle = await this.puzzleService.getDailyPuzzle(targetDate);

            if (!puzzle) {
                res.status(404).json({
                    success: false,
                    message: '해당 날짜의 데일리 퍼즐이 없습니다'
                });
                return;
            }

            res.json({
                success: true,
                message: '데일리 퍼즐 조회 성공',
                data: puzzle
            });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 퍼즐 생성 (관리자용)
     * POST /api/puzzle
     */
    async createPuzzle(req: Request, res: Response): Promise<void> {
        try {
            const { puzzle_type, difficulty, puzzle_data, answer_data, daily_date } = req.body;

            if (!puzzle_type || !difficulty || !puzzle_data || !answer_data) {
                res.status(400).json({
                    success: false,
                    message: '퍼즐 타입, 난이도, 퍼즐 데이터, 답안 데이터는 필수입니다'
                });
                return;
            }

            const puzzleData = {
                puzzle_type,
                difficulty,
                puzzle_data,
                answer_data,
                daily_date: daily_date ? new Date(daily_date) : null
            };

            const puzzle = await this.puzzleService.createPuzzle(puzzleData);

            res.status(201).json({
                success: true,
                message: '퍼즐이 성공적으로 생성되었습니다',
                data: puzzle
            });
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 퍼즐 삭제 (관리자용)
     * DELETE /api/puzzle/:puzzle_id
     */
    async deletePuzzle(req: Request, res: Response): Promise<void> {
        try {
            const { puzzle_id } = req.params;

            const puzzleIdNum = parseInt(puzzle_id);
            if (isNaN(puzzleIdNum)) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 퍼즐 ID입니다'
                });
                return;
            }

            const deleted = await this.puzzleService.deletePuzzle(puzzleIdNum);

            if (deleted) {
                res.json({
                    success: true,
                    message: '퍼즐이 성공적으로 삭제되었습니다'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: '퍼즐을 찾을 수 없습니다'
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * BaseController 메서드 오버라이드
     */
    override async getAll(req: Request, res: Response): Promise<void> {
        res.status(403).json({
            success: false,
            message: '퍼즐 목록 조회는 지원하지 않습니다. /api/puzzle/random을 사용하세요'
        });
    }

    override async getById(req: Request, res: Response): Promise<void> {
        res.status(403).json({
            success: false,
            message: '퍼즐 ID로 조회는 지원하지 않습니다. /api/puzzle/random을 사용하세요'
        });
    }

    override async create(req: Request, res: Response): Promise<void> {
        // createPuzzle으로 대체
        await this.createPuzzle(req, res);
    }

    override async delete(req: Request, res: Response): Promise<void> {
        // deletePuzzle으로 대체
        await this.deletePuzzle(req, res);
    }
}

export default PuzzleController;