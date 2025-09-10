import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { PuzzleRecordService } from '../services/PuzzleRecordService';
import { PuzzleRecord } from '../models/PuzzleRecord';

/**
 * 퍼즐 기록 관리 컨트롤러
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
                return this.sendError(res, '사용자 ID, 퍼즐 ID, 퍼즐 타입, 해결 시간, 힌트 사용 횟수는 필수입니다', 400);
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
            this.sendSuccess(res, record, '퍼즐 기록이 성공적으로 추가되었습니다', 201);
        } catch (error) {
            this.sendErrorAuto(res, error as Error);
        }
    }


    /**
     * BaseController 메서드 오버라이드
     */
    override async getAll(req: Request, res: Response): Promise<void> {
        this.sendError(res, '퍼즐 기록 조회는 지원하지 않습니다', 403);
    }

    override async getById(req: Request, res: Response): Promise<void> {
        this.sendError(res, '퍼즐 기록 조회는 지원하지 않습니다', 403);
    }

    override async create(req: Request, res: Response): Promise<void> {
        // addRecord로 대체
        await this.addRecord(req, res);
    }

    override async update(req: Request, res: Response): Promise<void> {
        this.sendError(res, '퍼즐 기록은 수정할 수 없습니다', 403);
    }

    override async delete(req: Request, res: Response): Promise<void> {
        this.sendError(res, '퍼즐 기록은 삭제할 수 없습니다', 403);
    }
}

export default PuzzleRecordController;
