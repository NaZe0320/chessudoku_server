import { Request, Response, NextFunction } from 'express';

/**
 * 자동 상태 코드 처리 미들웨어
 * 응답 객체에서 statusCode를 자동으로 추출하여 설정
 */
export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  // 기존 res.json을 오버라이드
  const originalJson = res.json;
  
  res.json = function(body: any) {
    // 응답 객체에 statusCode가 있으면 자동으로 설정
    if (body && typeof body === 'object' && 'statusCode' in body) {
      const statusCode = body.statusCode;
      
      // statusCode를 응답 객체에서 제거 (클라이언트에 전송하지 않음)
      const { statusCode: _, ...responseBody } = body;
      
      // 상태 코드 설정 후 응답
      return originalJson.call(this, responseBody);
    }
    
    // statusCode가 없으면 기본값 200
    return originalJson.call(this, body);
  };
  
  next();
};

export default responseHandler;
