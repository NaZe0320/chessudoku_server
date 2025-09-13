import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { PuzzleRecordService } from '../services/PuzzleRecordService';
import { PuzzleRecord } from '../models/PuzzleRecord';
import { PuzzleRecordResponse } from '../types/responses/PuzzleRecordResponse';
import { BaseResponse } from '../types/responses/BaseResponse';

/**
 * 퍼즐 기록 관리 컨트롤러
 * Java 패턴 기반 응답 시스템 사용
 */
export class PuzzleRecordController extends BaseController<PuzzleRecord> {
    private puzzleRecordService: PuzzleRecordService;

    constructor(puzzleRecordService: PuzzleRecordService) {
        super(puzzleRecordService);
        this.puzzleRecordService = puzzleRecordService;
    }

    /**
     * 퍼즐 기록 추가
     * POST /api/puzzle-record
     */
    async addRecord(req: Request, res: Response): Promise<Response> {
        try {
            const { user_id, puzzle_id, puzzle_type, solve_time, hints_used } = req.body;

            if (!user_id || !puzzle_id || !puzzle_type || solve_time === undefined || hints_used === undefined) {
                return res.json(new PuzzleRecordResponse.PuzzleRecordDataRequired());
            }

            if (solve_time <= 0) {
                return res.json(new PuzzleRecordResponse.InvalidSolveTime());
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
            return res.json(new PuzzleRecordResponse.CreatePuzzleRecordCreated(record));
        } catch (error) {
            return res.json(new BaseResponse.InternalServerError((error as Error).message));
        }
    }

    /**
     * create 메서드 (addRecord로 대체)
     */
    async create(req: Request, res: Response): Promise<Response> {
        return await this.addRecord(req, res);
    }

    /**
     * update 메서드 (금지됨)
     */
    async update(req: Request, res: Response): Promise<Response> {
        return res.json(new PuzzleRecordResponse.PuzzleRecordUpdateForbidden());
    }

    /**
     * delete 메서드 (금지됨)
     */
    async delete(req: Request, res: Response): Promise<Response> {
        return res.json(new PuzzleRecordResponse.PuzzleRecordDeleteForbidden());
    }
}

export default PuzzleRecordController;
