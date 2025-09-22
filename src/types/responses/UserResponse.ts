import { BaseResponse } from './BaseResponse';
import { User, UserData } from '../../models/User';

/**
 * 사용자 관련 응답 클래스들
 */
export namespace UserResponse {
  /**
   * 사용자 목록 조회 성공 응답
   * GET /api/users
   */
  export class GetAllUsersOK extends BaseResponse.OK<Omit<UserData, 'is_deleted'>[]> {
    constructor(data: User[]) {
      super(data.map(user => user.toPublicJSON()), "사용자 목록을 조회했습니다");
    }
  }

  /**
   * 사용자 정보 조회 성공 응답
   * GET /api/users/:id
   */
  export class GetUserByIdOK extends BaseResponse.OK<Omit<UserData, 'is_deleted'>> {
    constructor(data: User) {
      super(data.toPublicJSON(), "사용자 정보를 조회했습니다");
    }
  }

  /**
   * 디바이스 ID로 사용자 조회 성공 응답
   * GET /api/users/device/:device_id
   */
  export class GetUserByDeviceIdOK extends BaseResponse.OK<Omit<UserData, 'is_deleted'>> {
    constructor(data: User) {
      super(data.toPublicJSON(), "사용자 정보를 조회했습니다");
    }
  }

  /**
   * 사용자 등록 성공 응답
   * POST /api/users/register
   */
  export class RegisterUserCreated extends BaseResponse.Created<Omit<UserData, 'is_deleted'>> {
    constructor(data: User) {
      super(data.toPublicJSON(), "사용자가 성공적으로 등록되었습니다");
    }
  }

  /**
   * 사용자 삭제 성공 응답
   * DELETE /api/users/:id
   */
  export class DeleteUserOK extends BaseResponse.OK<null> {
    constructor() {
      super(null, "사용자가 성공적으로 삭제되었습니다");
    }
  }

  /**
   * 사용자를 찾을 수 없음 응답
   */
  export class UserNotFound extends BaseResponse.NotFound {
    constructor() {
      super("해당 사용자를 찾을 수 없습니다");
    }
  }

  /**
   * 디바이스 ID 중복 응답
   */
  export class DeviceIdConflict extends BaseResponse.Conflict {
    constructor() {
      super("이미 등록된 디바이스 ID입니다");
    }
  }

  /**
   * 디바이스 ID 필수 응답
   */
  export class DeviceIdRequired extends BaseResponse.BadRequest {
    constructor() {
      super("디바이스 ID는 필수입니다");
    }
  }

  /**
   * 사용자 정보 수정 금지 응답
   */
  export class UserUpdateForbidden extends BaseResponse.Forbidden {
    constructor() {
      super("사용자 정보는 수정할 수 없습니다");
    }
  }
}

export default UserResponse;
