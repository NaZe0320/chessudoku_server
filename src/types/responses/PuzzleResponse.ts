import { BaseResponse } from './BaseResponse';
import { Puzzle } from '../../models/Puzzle';

/**
 * 퍼즐 관련 응답 클래스들
 */
export namespace PuzzleResponse {
  /**
   * 랜덤 퍼즐 조회 성공 응답
   * GET /api/puzzles/random
   */
  export class GetRandomPuzzleOK extends BaseResponse.OK<Puzzle> {
    constructor(data: Puzzle) {
      super(data, "랜덤 퍼즐을 조회했습니다");
    }
  }

  /**
   * 데일리 퍼즐 조회 성공 응답
   * GET /api/puzzles/daily
   */
  export class GetDailyPuzzleOK extends BaseResponse.OK<Puzzle> {
    constructor(data: Puzzle) {
      super(data, "데일리 퍼즐을 조회했습니다");
    }
  }

  /**
   * 퍼즐 생성 성공 응답
   * POST /api/puzzles
   */
  export class CreatePuzzleCreated extends BaseResponse.Created<Puzzle> {
    constructor(data: Puzzle) {
      super(data, "퍼즐이 성공적으로 생성되었습니다");
    }
  }

  /**
   * 퍼즐 삭제 성공 응답
   * DELETE /api/puzzles/:id
   */
  export class DeletePuzzleOK extends BaseResponse.OK<null> {
    constructor() {
      super(null, "퍼즐이 성공적으로 삭제되었습니다");
    }
  }

  /**
   * 퍼즐을 찾을 수 없음 응답
   */
  export class PuzzleNotFound extends BaseResponse.NotFound {
    constructor() {
      super("조건에 맞는 퍼즐을 찾을 수 없습니다");
    }
  }

  /**
   * 데일리 퍼즐 없음 응답
   */
  export class DailyPuzzleNotFound extends BaseResponse.NotFound {
    constructor() {
      super("해당 날짜의 데일리 퍼즐이 없습니다");
    }
  }

  /**
   * 퍼즐 데이터 필수 응답
   */
  export class PuzzleDataRequired extends BaseResponse.BadRequest {
    constructor() {
      super("퍼즐 타입, 난이도, 퍼즐 데이터, 답안 데이터는 필수입니다");
    }
  }

  /**
   * 잘못된 퍼즐 ID 응답
   */
  export class InvalidPuzzleId extends BaseResponse.BadRequest {
    constructor() {
      super("유효하지 않은 퍼즐 ID입니다");
    }
  }

  /**
   * 잘못된 날짜 형식 응답
   */
  export class InvalidDateFormat extends BaseResponse.BadRequest {
    constructor() {
      super("유효하지 않은 날짜 형식입니다");
    }
  }

  /**
   * 퍼즐 목록 조회 금지 응답
   */
  export class GetAllPuzzlesForbidden extends BaseResponse.Forbidden {
    constructor() {
      super("퍼즐 목록 조회는 지원하지 않습니다. /api/puzzles/random을 사용하세요");
    }
  }

  /**
   * 퍼즐 ID로 조회 금지 응답
   */
  export class GetPuzzleByIdForbidden extends BaseResponse.Forbidden {
    constructor() {
      super("퍼즐 ID로 조회는 지원하지 않습니다. /api/puzzles/random을 사용하세요");
    }
  }
}

export default PuzzleResponse;
