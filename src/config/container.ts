import { Application } from 'express';

// Repository imports
import { UserRepository } from '../repositories/UserRepository';
import { PuzzleRepository } from '../repositories/PuzzleRepository';
import { PuzzleRecordRepository } from '../repositories/PuzzleRecordRepository';

// Service imports
import { UserService } from '../services/UserService';
import { PuzzleService } from '../services/PuzzleService';
import { PuzzleRecordService } from '../services/PuzzleRecordService';

// Controller imports
import { UserController } from '../controllers/UserController';
import { PuzzleController } from '../controllers/PuzzleController';
import { PuzzleRecordController } from '../controllers/PuzzleRecordController';

/**
 * DI 컨테이너 클래스
 * 모든 의존성을 중앙에서 관리하고 app.locals에 등록
 */
export class DIContainer {
    private app: Application;
    
    // Repositories
    public userRepository!: UserRepository;
    public puzzleRepository!: PuzzleRepository;
    public puzzleRecordRepository!: PuzzleRecordRepository;
    
    // Services
    public userService!: UserService;
    public puzzleService!: PuzzleService;
    public puzzleRecordService!: PuzzleRecordService;
    
    // Controllers
    public userController!: UserController;
    public puzzleController!: PuzzleController;
    public puzzleRecordController! : PuzzleRecordController;

    constructor(app: Application) {
        this.app = app;
        this.initializeRepositories();
        this.initializeServices();
        this.initializeControllers();
        this.registerToAppLocals();
    }

    /**
     * Repository 인스턴스들 초기화
     */
    private initializeRepositories(): void {
        this.userRepository = new UserRepository();
        this.puzzleRepository = new PuzzleRepository();
        this.puzzleRecordRepository = new PuzzleRecordRepository();
    }

    /**
     * Service 인스턴스들 초기화
     */
    private initializeServices(): void {
        this.userService = new UserService(this.userRepository);
        this.puzzleService = new PuzzleService(this.puzzleRepository);
        this.puzzleRecordService = new PuzzleRecordService(this.puzzleRecordRepository);
    }

    /**
     * Controller 인스턴스들 초기화
     */
    private initializeControllers(): void {
        this.userController = new UserController(this.userService);
        this.puzzleController = new PuzzleController(this.puzzleService);
        this.puzzleRecordController = new PuzzleRecordController(this.puzzleRecordService);
    }

    /**
     * app.locals에 모든 인스턴스 등록
     */
    private registerToAppLocals(): void {
        // Repositories
        this.app.locals.userRepository = this.userRepository;
        this.app.locals.puzzleRepository = this.puzzleRepository;
        this.app.locals.puzzleRecordRepository = this.puzzleRecordRepository;

        // Services
        this.app.locals.userService = this.userService;
        this.app.locals.puzzleService = this.puzzleService;
        this.app.locals.puzzleRecordService = this.puzzleRecordService;

        // Controllers
        this.app.locals.userController = this.userController;
        this.app.locals.puzzleController = this.puzzleController;
        this.app.locals.puzzleRecordController = this.puzzleRecordController;
    }

    /**
     * app.locals에서 서비스 가져오기
     */
    public getService<T>(serviceName: string): T {
        return this.app.locals[serviceName] as T;
    }

    /**
     * app.locals에서 컨트롤러 가져오기
     */
    public getController<T>(controllerName: string): T {
        return this.app.locals[controllerName] as T;
    }
}

export default DIContainer;
