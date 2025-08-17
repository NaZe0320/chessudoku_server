import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { PuzzleService } from '../services/PuzzleService';
import { PuzzleRecord } from '../models/PuzzleRecord';

/**
 * 퍼즐 기록 관리 컨트롤러
 */
export class PuzzleController extends BaseController<PuzzleRecord> {
    private puzzleService: PuzzleService;

    constructor(puzzleService: PuzzleService) {
        super(puzzleService);
        this.puzzleService = puzzleService;

        // 메서드 바인딩
        this.addCompletion = this.addCompletion.bind(this);
        this.getRecords = this.getRecords.bind(this);
        this.getStats = this.getStats.bind(this);
        this.getBestRecords = this.getBestRecords.bind(this);
        this.getRecentRecords = this.getRecentRecords.bind(this);
        this.getRecordsByDateRange = this.getRecordsByDateRange.bind(this);
        this.getDailyStats = this.getDailyStats.bind(this);
        this.getLowHintRecords = this.getLowHintRecords.bind(this);
        this.getFastRecords = this.getFastRecords.bind(this);
        this.getGlobalRanking = this.getGlobalRanking.bind(this);
        this.getPersonalRanking = this.getPersonalRanking.bind(this);
        this.deleteRecord = this.deleteRecord.bind(this);
        this.deleteAllRecords = this.deleteAllRecords.bind(this);
    }

    /**
     * 퍼즐 완성 기록 추가
     * POST /api/puzzle/:account_id
     */
    async addCompletion(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;
            const { puzzle_type, difficulty, time_taken, hint_count, completed_at } = req.body;

            // 필수 필드 검증
            if (!puzzle_type || !difficulty || time_taken === undefined || hint_count === undefined) {
                res.status(400).json({
                    success: false,
                    message: '퍼즐 타입, 난이도, 소요 시간, 힌트 사용 횟수는 필수입니다'
                });
                return;
            }

            const completionData = {
                puzzle_type,
                difficulty,
                time_taken: Number(time_taken),
                hint_count: Number(hint_count),
                completed_at: completed_at ? new Date(completed_at) : undefined
            };

            const record = await this.puzzleService.addPuzzleCompletion(account_id, completionData);

            res.status(201).json({
                success: true,
                message: '퍼즐 완성 기록이 추가되었습니다',
                data: record
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('찾을 수 없습니다')) {
                statusCode = 404;
            } else if (err.message.includes('유효하지 않은') || err.message.includes('검증') || err.message.includes('필수')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 퍼즐 기록 조회 (페이지네이션 포함)
     * GET /api/puzzle/:account_id
     */
    async getRecords(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;
            const { 
                puzzle_type, 
                difficulty, 
                page = '1', 
                limit = '10',
                sort_by = 'completed_at',
                sort_order = 'DESC',
                date_from,
                date_to
            } = req.query;

            const options: any = {
                puzzle_type: puzzle_type as string,
                difficulty: difficulty as string,
                limit: Math.min(100, Math.max(1, parseInt(limit as string))),
                offset: (Math.max(1, parseInt(page as string)) - 1) * Math.min(100, Math.max(1, parseInt(limit as string))),
                sort_by: sort_by as string,
                sort_order: (sort_order as string).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
            };

            if (date_from) {
                options.date_from = new Date(date_from as string);
                if (isNaN(options.date_from.getTime())) {
                    res.status(400).json({
                        success: false,
                        message: '유효하지 않은 시작 날짜 형식입니다'
                    });
                    return;
                }
            }

            if (date_to) {
                options.date_to = new Date(date_to as string);
                if (isNaN(options.date_to.getTime())) {
                    res.status(400).json({
                        success: false,
                        message: '유효하지 않은 종료 날짜 형식입니다'
                    });
                    return;
                }
            }

            const result = await this.puzzleService.getPuzzleRecords(account_id, options);

            res.json({
                success: true,
                message: '퍼즐 기록 조회 성공',
                data: result.records,
                meta: {
                    pagination: {
                        currentPage: result.page,
                        totalItems: result.total,
                        itemsPerPage: result.limit,
                        totalPages: Math.ceil(result.total / result.limit)
                    }
                }
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('찾을 수 없습니다')) {
                statusCode = 404;
            } else if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 퍼즐 통계 조회
     * GET /api/puzzle/:account_id/stats
     */
    async getStats(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;

            const stats = await this.puzzleService.getPuzzleStats(account_id);

            res.json({
                success: true,
                message: '퍼즐 통계 조회 성공',
                data: stats
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 최고 기록들 조회
     * GET /api/puzzle/:account_id/best
     */
    async getBestRecords(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;

            const bestRecords = await this.puzzleService.getBestRecords(account_id);

            res.json({
                success: true,
                message: '최고 기록 조회 성공',
                data: bestRecords
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 최근 기록 조회
     * GET /api/puzzle/:account_id/recent
     */
    async getRecentRecords(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;
            const { limit = '10' } = req.query;

            const safeLimit = Math.min(100, Math.max(1, parseInt(limit as string)));
            const records = await this.puzzleService.getRecentRecords(account_id, safeLimit);

            res.json({
                success: true,
                message: '최근 기록 조회 성공',
                data: records
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 특정 기간 내 기록 조회
     * GET /api/puzzle/:account_id/date-range
     */
    async getRecordsByDateRange(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;
            const { start_date, end_date } = req.query;

            if (!start_date || !end_date) {
                res.status(400).json({
                    success: false,
                    message: '시작 날짜와 종료 날짜는 필수입니다'
                });
                return;
            }

            const startDate = new Date(start_date as string);
            const endDate = new Date(end_date as string);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 날짜 형식입니다'
                });
                return;
            }

            const records = await this.puzzleService.getRecordsByDateRange(account_id, startDate, endDate);

            res.json({
                success: true,
                message: '기간별 기록 조회 성공',
                data: records
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('유효하지 않은') || err.message.includes('최대')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 일별 플레이 통계 조회
     * GET /api/puzzle/:account_id/daily-stats
     */
    async getDailyStats(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;
            const { days = '30' } = req.query;

            const safeDays = Math.min(365, Math.max(1, parseInt(days as string)));
            const stats = await this.puzzleService.getDailyStats(account_id, safeDays);

            res.json({
                success: true,
                message: '일별 통계 조회 성공',
                data: stats
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 낮은 힌트 사용 기록 조회
     * GET /api/puzzle/:account_id/low-hints
     */
    async getLowHintRecords(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;
            const { max_hints, puzzle_type } = req.query;

            if (!max_hints) {
                res.status(400).json({
                    success: false,
                    message: '최대 힌트 수는 필수입니다'
                });
                return;
            }

            const maxHintsNum = parseInt(max_hints as string);
            if (isNaN(maxHintsNum) || maxHintsNum < 0) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 힌트 수입니다'
                });
                return;
            }

            const records = await this.puzzleService.getLowHintRecords(
                account_id, 
                maxHintsNum, 
                puzzle_type as string
            );

            res.json({
                success: true,
                message: '낮은 힌트 기록 조회 성공',
                data: records
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 빠른 기록 조회
     * GET /api/puzzle/:account_id/fast-records
     */
    async getFastRecords(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;
            const { max_time, puzzle_type } = req.query;

            if (!max_time) {
                res.status(400).json({
                    success: false,
                    message: '최대 시간은 필수입니다'
                });
                return;
            }

            const maxTime = parseInt(max_time as string);
            if (isNaN(maxTime) || maxTime <= 0) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 시간입니다'
                });
                return;
            }

            const records = await this.puzzleService.getFastRecords(
                account_id, 
                maxTime, 
                puzzle_type as string
            );

            res.json({
                success: true,
                message: '빠른 기록 조회 성공',
                data: records
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 글로벌 순위 조회
     * GET /api/puzzle/ranking/:puzzle_type
     */
    async getGlobalRanking(req: Request, res: Response): Promise<void> {
        try {
            const { puzzle_type } = req.params;
            const { difficulty, limit = '100' } = req.query;

            const safeLimit = Math.min(1000, Math.max(1, parseInt(limit as string)));
            
            const ranking = await this.puzzleService.getGlobalRanking(
                puzzle_type,
                difficulty as string,
                safeLimit
            );

            res.json({
                success: true,
                message: '글로벌 순위 조회 성공',
                data: ranking
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('필수')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 개인 순위 조회
     * GET /api/puzzle/:account_id/ranking/:puzzle_type
     */
    async getPersonalRanking(req: Request, res: Response): Promise<void> {
        try {
            const { account_id, puzzle_type } = req.params;
            const { difficulty } = req.query;

            const ranking = await this.puzzleService.getPersonalRanking(
                account_id,
                puzzle_type,
                difficulty as string
            );

            res.json({
                success: true,
                message: '개인 순위 조회 성공',
                data: ranking
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 퍼즐 기록 삭제
     * DELETE /api/puzzle/:account_id/:record_id
     */
    async deleteRecord(req: Request, res: Response): Promise<void> {
        try {
            const { account_id, record_id } = req.params;

            const recordIdNum = parseInt(record_id);
            if (isNaN(recordIdNum)) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 기록 ID입니다'
                });
                return;
            }

            const deleted = await this.puzzleService.deletePuzzleRecord(account_id, recordIdNum);

            if (deleted) {
                res.json({
                    success: true,
                    message: '퍼즐 기록이 삭제되었습니다'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: '기록 삭제에 실패했습니다'
                });
            }
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('찾을 수 없습니다')) {
                statusCode = 404;
            } else if (err.message.includes('권한') || err.message.includes('유효하지 않은')) {
                statusCode = 403;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * 모든 퍼즐 기록 삭제
     * DELETE /api/puzzle/:account_id/all
     */
    async deleteAllRecords(req: Request, res: Response): Promise<void> {
        try {
            const { account_id } = req.params;

            const deletedCount = await this.puzzleService.deleteAllRecords(account_id);

            res.json({
                success: true,
                message: `${deletedCount}개의 퍼즐 기록이 삭제되었습니다`,
                data: {
                    deleted_count: deletedCount
                }
            });
        } catch (error) {
            const err = error as Error;
            let statusCode = 500;
            
            if (err.message.includes('유효하지 않은')) {
                statusCode = 400;
            }

            res.status(statusCode).json({
                success: false,
                message: err.message
            });
        }
    }

    /**
     * BaseController 메서드 오버라이드 - 사용하지 않는 기본 CRUD 비활성화
     */
    override async getAll(req: Request, res: Response): Promise<void> {
        res.status(403).json({
            success: false,
            message: '이 기능은 사용할 수 없습니다. 특정 계정의 기록만 조회 가능합니다.'
        });
    }

    override async getById(req: Request, res: Response): Promise<void> {
        res.status(403).json({
            success: false,
            message: '이 기능은 사용할 수 없습니다. account_id를 포함한 경로를 사용하세요.'
        });
    }

    override async create(req: Request, res: Response): Promise<void> {
        res.status(403).json({
            success: false,
            message: '이 기능은 사용할 수 없습니다. addCompletion을 사용하세요.'
        });
    }

    override async update(req: Request, res: Response): Promise<void> {
        res.status(403).json({
            success: false,
            message: '퍼즐 기록은 수정할 수 없습니다.'
        });
    }

    override async delete(req: Request, res: Response): Promise<void> {
        res.status(403).json({
            success: false,
            message: '이 기능은 사용할 수 없습니다. deleteRecord를 사용하세요.'
        });
    }
}

export default PuzzleController;