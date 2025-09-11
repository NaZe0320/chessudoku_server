import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { PuzzleRecordService } from '../services/PuzzleRecordService';
import { PuzzleRecord } from '../models/PuzzleRecord';
import { PuzzleRecordResponse } from '../types/responses/PuzzleRecordResponse';

/**
 * 퍼즐 기록 관리 컨트롤러
 * Java 패턴 기반 응답 시스템 사용
 */
export class PuzzleRecordController extends BaseController<PuzzleRecord> {
    private puzzleRecordService: PuzzleRecordService;

    constructor(puzzleRecordService: PuzzleRecordService) {
        super(puzzleRecordService);
        this.puzzleRecordService = puzzleRecordService;

        // 메서드 바인딩
        this.addRecord = this.addRecord.bind(this);
    }

    /**
     * 퍼즐 기록 추가
     * POST /api/puzzle-record
     */
    async addRecord(req: Request, res: Response): Promise<void> {
        try {
            const { user_id, puzzle_id, puzzle_type, solve_time, hints_used } = req.body;

            if (!user_id || !puzzle_id || !puzzle_type || solve_time === undefined || hints_used === undefined) {
                res.status(400).json(new PuzzleRecordResponse.PuzzleRecordDataRequired());
                return;
            }

            if (solve_time <= 0) {
                res.status(400).json(new PuzzleRecordResponse.InvalidSolveTime());
                return;
            }

            const recordData = {
                user_id,
                puzzle_id: Number(puzzle_id),
                puzzle_type,
                solve_time: Number(solve_time),
                hints_used: Number(hints_used),
                create_at: new Date()
            };

            const record = await this.puzzleRecordService.addRecord(recordData);
            res.status(201).json(new PuzzleRecordResponse.CreatePuzzleRecordCreated(record));
        } catch (error) {
            this.handleError(res, error as Error);
        }
    }

    /**
     * 퍼즐 기록 목록 조회 (금지됨)
     * GET /api/puzzle-record
     */
    override async getAll(req: Request, res: Response): Promise<void> {
        res.status(403).json(new PuzzleRecordResponse.PuzzleRecordGetAllForbidden());
    }

    /**
     * 퍼즐 기록 ID로 조회 (금지됨)
     * GET /api/puzzle-record/:id
     */
    override async getById(req: Request, res: Response): Promise<void> {
        res.status(403).json(new PuzzleRecordResponse.PuzzleRecordGetByIdForbidden());
    }

    /**
     * create 메서드 (addRecord로 대체)
     */
    override async create(req: Request, res: Response): Promise<void> {
        await this.addRecord(req, res);
    }

    /**
     * update 메서드 (금지됨)
     */
    override async update(req: Request, res: Response): Promise<void> {
        res.status(403).json(new PuzzleRecordResponse.PuzzleRecordUpdateForbidden());
    }

    /**
     * delete 메서드 (금지됨)
     */
    override async delete(req: Request, res: Response): Promise<void> {
        res.status(403).json(new PuzzleRecordResponse.PuzzleRecordDeleteForbidden());
    }
}

export default PuzzleRecordController;
