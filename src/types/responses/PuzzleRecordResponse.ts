import { BaseResponse } from './BaseResponse';
import { PuzzleRecord } from '../../models/PuzzleRecord';

/**
 * 퍼즐 기록 관련 응답 클래스들
 */
export namespace PuzzleRecordResponse {
  /**
   * 퍼즐 기록 목록 조회 성공 응답
   * GET /api/puzzle-records
   */
  export class GetAllPuzzleRecordsOK extends BaseResponse.OK<PuzzleRecord[]> {
    constructor(data: PuzzleRecord[]) {
      super(data, "퍼즐 기록 목록을 조회했습니다");
    }
  }

  /**
   * 퍼즐 기록 조회 성공 응답
   * GET /api/puzzle-records/:id
   */
  export class GetPuzzleRecordByIdOK extends BaseResponse.OK<PuzzleRecord> {
    constructor(data: PuzzleRecord) {
      super(data, "퍼즐 기록을 조회했습니다");
    }
  }

  /**
   * 사용자별 퍼즐 기록 조회 성공 응답
   * GET /api/puzzle-records/user/:user_id
   */
  export class GetPuzzleRecordsByUserOK extends BaseResponse.OK<PuzzleRecord[]> {
    constructor(data: PuzzleRecord[]) {
      super(data, "사용자의 퍼즐 기록을 조회했습니다");
    }
  }

  /**
   * 퍼즐 기록 생성 성공 응답
   * POST /api/puzzle-records
   */
  export class CreatePuzzleRecordCreated extends BaseResponse.Created<PuzzleRecord> {
    constructor(data: PuzzleRecord) {
      super(data, "퍼즐 기록이 성공적으로 생성되었습니다");
    }
  }

  /**
   * 퍼즐 기록 삭제 성공 응답
   * DELETE /api/puzzle-records/:id
   */
  export class DeletePuzzleRecordOK extends BaseResponse.OK<null> {
    constructor() {
      super(null, "퍼즐 기록이 성공적으로 삭제되었습니다");
    }
  }

  /**
   * 퍼즐 기록을 찾을 수 없음 응답
   */
  export class PuzzleRecordNotFound extends BaseResponse.NotFound {
    constructor() {
      super("해당 퍼즐 기록을 찾을 수 없습니다");
    }
  }

  /**
   * 퍼즐 기록 데이터 필수 응답
   */
  export class PuzzleRecordDataRequired extends BaseResponse.BadRequest {
    constructor() {
      super("사용자 ID, 퍼즐 ID, 해결 시간은 필수입니다");
    }
  }

  /**
   * 잘못된 퍼즐 기록 ID 응답
   */
  export class InvalidPuzzleRecordId extends BaseResponse.BadRequest {
    constructor() {
      super("유효하지 않은 퍼즐 기록 ID입니다");
    }
  }

  /**
   * 잘못된 해결 시간 응답
   */
  export class InvalidSolveTime extends BaseResponse.BadRequest {
    constructor() {
      super("해결 시간은 0보다 큰 값이어야 합니다");
    }
  }

  /**
   * 퍼즐 기록 목록 조회 금지 응답
   */
  export class PuzzleRecordGetAllForbidden extends BaseResponse.Forbidden {
    constructor() {
      super("퍼즐 기록 조회는 지원하지 않습니다");
    }
  }

  /**
   * 퍼즐 기록 ID로 조회 금지 응답
   */
  export class PuzzleRecordGetByIdForbidden extends BaseResponse.Forbidden {
    constructor() {
      super("퍼즐 기록 조회는 지원하지 않습니다");
    }
  }

  /**
   * 퍼즐 기록 수정 금지 응답
   */
  export class PuzzleRecordUpdateForbidden extends BaseResponse.Forbidden {
    constructor() {
      super("퍼즐 기록은 수정할 수 없습니다");
    }
  }

  /**
   * 퍼즐 기록 삭제 금지 응답
   */
  export class PuzzleRecordDeleteForbidden extends BaseResponse.Forbidden {
    constructor() {
      super("퍼즐 기록은 삭제할 수 없습니다");
    }
  }
}

export default PuzzleRecordResponse;
