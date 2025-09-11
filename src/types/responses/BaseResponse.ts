/**
 * 기본 응답 클래스들
 * Java 패턴을 TypeScript로 구현한 응답 시스템
 */

export namespace BaseResponse {
  /**
   * 기본 응답 클래스
   */
  export abstract class Base {
    public readonly success: boolean;
    public readonly message: string;
    public readonly timestamp: string;
    
    constructor(message: string, success: boolean) {
      this.success = success;
      this.message = message;
      this.timestamp = new Date().toISOString();
    }
  }

  /**
   * 성공 응답 (200)
   */
  export class OK<T> extends Base {
    public readonly data: T;
    
    constructor(data: T, message: string = "성공") {
      super(message, true);
      this.data = data;
    }
  }

  /**
   * 생성 성공 응답 (201)
   */
  export class Created<T> extends Base {
    public readonly data: T;
    
    constructor(data: T, message: string = "생성 성공") {
      super(message, true);
      this.data = data;
    }
  }

  /**
   * 찾을 수 없음 응답 (404)
   */
  export class NotFound extends Base {
    constructor(message: string = "요청한 리소스를 찾을 수 없습니다") {
      super(message, false);
    }
  }

  /**
   * 잘못된 요청 응답 (400)
   */
  export class BadRequest extends Base {
    constructor(message: string = "잘못된 요청입니다") {
      super(message, false);
    }
  }

  /**
   * 인증 실패 응답 (401)
   */
  export class Unauthorized extends Base {
    constructor(message: string = "인증이 필요합니다") {
      super(message, false);
    }
  }

  /**
   * 권한 없음 응답 (403)
   */
  export class Forbidden extends Base {
    constructor(message: string = "권한이 없습니다") {
      super(message, false);
    }
  }

  /**
   * 충돌 응답 (409)
   */
  export class Conflict extends Base {
    constructor(message: string = "데이터 충돌이 발생했습니다") {
      super(message, false);
    }
  }

  /**
   * 서버 에러 응답 (500)
   */
  export class InternalServerError extends Base {
    constructor(message: string = "서버 내부 오류가 발생했습니다") {
      super(message, false);
    }
  }
}

export default BaseResponse;
