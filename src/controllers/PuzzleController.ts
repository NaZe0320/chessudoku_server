import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { PuzzleService } from '../services/PuzzleService';
import { Puzzle } from '../models/Puzzle';
import { PuzzleResponse } from '../types/responses/PuzzleResponse';

/**
 * 퍼즐 관리 컨트롤러
 * Java 패턴 기반 응답 시스템 사용
 */
export class PuzzleController extends BaseController<Puzzle> {
    private puzzleService: PuzzleService;

    constructor(puzzleService: PuzzleService) {
        super(puzzleService);
        this.puzzleService = puzzleService;

        // 메서드 바인딩
        this.getRandomPuzzle = this.getRandomPuzzle.bind(this);
        this.getDailyPuzzle = this.getDailyPuzzle.bind(this);
        this.createPuzzle = this.createPuzzle.bind(this);
        this.deletePuzzle = this.deletePuzzle.bind(this);
    }

    /**
     * 조건에 맞는 랜덤 퍼즐 조회
     * GET /api/puzzle/random
     */
    async getRandomPuzzle(req: Request, res: Response): Promise<Response> {
        try {
            const { puzzle_type, difficulty } = req.query;

            const puzzle = await this.puzzleService.getRandomPuzzle(
                puzzle_type as string, 
                difficulty as string
            );

            if (!puzzle) {
                return res.json(new PuzzleResponse.PuzzleNotFound());
            }

            return res.json(new PuzzleResponse.GetRandomPuzzleOK(puzzle));
        } catch (error) {
            return this.handleError(res, error as Error);
        }
    }

    /**
     * 데일리 퍼즐 조회
     * GET /api/puzzle/daily
     */
    async getDailyPuzzle(req: Request, res: Response): Promise<Response> {
        try {
            const { date } = req.query;
            
            const targetDate = date ? new Date(date as string) : new Date();
            if (isNaN(targetDate.getTime())) {
                return res.json(new PuzzleResponse.InvalidDateFormat());
            }

            const puzzle = await this.puzzleService.getDailyPuzzle(targetDate);

            if (!puzzle) {
                return res.json(new PuzzleResponse.DailyPuzzleNotFound());
            }

            return res.json(new PuzzleResponse.GetDailyPuzzleOK(puzzle));
        } catch (error) {
            return this.handleError(res, error as Error);
        }
    }

    /**
     * 퍼즐 생성 (관리자용)
     * POST /api/puzzle
     */
    async createPuzzle(req: Request, res: Response): Promise<Response> {
        try {
            const { puzzle_type, difficulty, puzzle_data, answer_data, daily_date } = req.body;

            if (!puzzle_type || !difficulty || !puzzle_data || !answer_data) {
                return res.json(new PuzzleResponse.PuzzleDataRequired());
            }

            const puzzleData = {
                puzzle_type,
                difficulty,
                puzzle_data,
                answer_data,
                daily_date: daily_date ? new Date(daily_date) : null
            };

            const puzzle = await this.puzzleService.createPuzzle(puzzleData);
            return res.json(new PuzzleResponse.CreatePuzzleCreated(puzzle));
        } catch (error) {
            return this.handleError(res, error as Error);
        }
    }

    /**
     * 퍼즐 삭제 (관리자용)
     * DELETE /api/puzzle/:puzzle_id
     */
    async deletePuzzle(req: Request, res: Response): Promise<Response> {
        try {
            const { puzzle_id } = req.params;

            const puzzleIdNum = parseInt(puzzle_id);
            if (isNaN(puzzleIdNum)) {
                return res.json(new PuzzleResponse.InvalidPuzzleId());
            }

            const deleted = await this.puzzleService.deletePuzzle(puzzleIdNum);

            if (deleted) {
                return res.json(new PuzzleResponse.DeletePuzzleOK());
            } else {
                return res.json(new PuzzleResponse.PuzzleNotFound());
            }
        } catch (error) {
            return this.handleError(res, error as Error);
        }
    }

    /**
     * 퍼즐 목록 조회 (금지됨)
     * GET /api/puzzle
     */
    override async getAll(req: Request, res: Response): Promise<Response> {
        return res.json(new PuzzleResponse.GetAllPuzzlesForbidden());
    }

    /**
     * 퍼즐 ID로 조회 (금지됨)
     * GET /api/puzzle/:id
     */
    override async getById(req: Request, res: Response): Promise<Response> {
        return res.json(new PuzzleResponse.GetPuzzleByIdForbidden());
    }

    /**
     * create 메서드 (createPuzzle으로 대체)
     */
    override async create(req: Request, res: Response): Promise<Response> {
        return await this.createPuzzle(req, res);
    }

    /**
     * delete 메서드 (deletePuzzle으로 대체)
     */
    override async delete(req: Request, res: Response): Promise<Response> {
        return await this.deletePuzzle(req, res);
    }
}

export default PuzzleController;