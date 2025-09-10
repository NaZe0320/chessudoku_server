import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ChessSudoku API',
    version: '1.0.0',
    description: '체스 수도쿠 퍼즐 게임을 위한 REST API 서버',
    contact: {
      name: 'ChessSudoku Team',
      email: 'support@chessudoku.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '개발 서버'
    },
    {
      url: 'https://api.chessudoku.com',
      description: '프로덕션 서버'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['user_id', 'device_id', 'nickname'],
        properties: {
          user_id: {
            type: 'string',
            description: '사용자 고유 ID (8자리)',
            example: 'ABC12345'
          },
          device_id: {
            type: 'string',
            description: '디바이스 고유 ID',
            example: 'test-device-001'
          },
          nickname: {
            type: 'string',
            description: '사용자 닉네임',
            maxLength: 20,
            example: '테스트유저1'
          },
          create_at: {
            type: 'string',
            format: 'date-time',
            description: '계정 생성 시간'
          }
        }
      },
      Puzzle: {
        type: 'object',
        required: ['puzzle_id', 'puzzle_type', 'difficulty', 'puzzle_data', 'answer_data'],
        properties: {
          puzzle_id: {
            type: 'integer',
            description: '퍼즐 고유 ID',
            example: 1
          },
          puzzle_type: {
            type: 'string',
            enum: ['normal', 'daily_challenge'],
            description: '퍼즐 타입',
            example: 'normal'
          },
          difficulty: {
            type: 'string',
            enum: ['Easy', 'Medium', 'Hard', 'Expert'],
            description: '퍼즐 난이도',
            example: 'Easy'
          },
          puzzle_data: {
            type: 'object',
            description: '퍼즐 데이터 (보드와 체스 말 위치)',
            properties: {
              board: {
                type: 'array',
                items: {
                  type: 'array',
                  items: { type: 'integer' }
                },
                description: '9x9 수도쿠 보드'
              },
              pieces: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    position: { type: 'array', items: { type: 'integer' } }
                  }
                },
                description: '체스 말 위치 정보'
              }
            }
          },
          answer_data: {
            type: 'object',
            description: '정답 데이터',
            properties: {
              board: {
                type: 'array',
                items: {
                  type: 'array',
                  items: { type: 'integer' }
                }
              }
            }
          },
          daily_date: {
            type: 'string',
            format: 'date',
            description: '데일리 챌린지 날짜 (일반 퍼즐은 null)',
            nullable: true
          }
        }
      },
      PuzzleRecord: {
        type: 'object',
        required: ['record_id', 'user_id', 'puzzle_id', 'solve_time'],
        properties: {
          record_id: {
            type: 'integer',
            description: '기록 고유 ID'
          },
          user_id: {
            type: 'string',
            description: '사용자 ID',
            example: 'ABC12345'
          },
          puzzle_id: {
            type: 'integer',
            description: '퍼즐 ID',
            example: 1
          },
          create_at: {
            type: 'string',
            format: 'date-time',
            description: '기록 생성 시간'
          },
          solve_time: {
            type: 'integer',
            description: '해결 시간 (초)',
            example: 120
          },
          hints_used: {
            type: 'integer',
            description: '사용한 힌트 수',
            example: 0,
            default: 0
          }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: '요청 성공 여부'
          },
          message: {
            type: 'string',
            description: '응답 메시지'
          },
          data: {
            type: 'object',
            description: '응답 데이터'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: '응답 시간'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            description: '에러 메시지'
          },
          error: {
            type: 'string',
            description: '에러 상세 정보'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Health',
      description: '서버 상태 확인'
    },
    {
      name: 'Users',
      description: '사용자 관리'
    },
    {
      name: 'Puzzles',
      description: '퍼즐 관리'
    },
    {
      name: 'PuzzleRecords',
      description: '퍼즐 기록 관리'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // API 문서가 있는 파일들
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
