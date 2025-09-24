#!/usr/bin/env node

/**
 * ngrok 설정 및 실행 스크립트
 * ChessSudoku 서버를 외부에서 접근할 수 있도록 터널링
 * 
 * 사용법:
 * 1. ngrok 계정 생성: https://ngrok.com/signup
 * 2. authtoken 설정: ngrok authtoken YOUR_TOKEN
 * 3. 서버와 함께 실행: npm run dev:tunnel
 * 4. 또는 별도 실행: npm run tunnel
 */

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

console.log('🌐 ChessSudoku 서버용 ngrok 터널링 시작...');
console.log('');

// ngrok이 설치되어 있는지 확인
function checkNgrokInstalled() {
    return new Promise((resolve) => {
        const ngrok = spawn('ngrok', ['--version'], { stdio: 'pipe' });
        ngrok.on('close', (code) => {
            resolve(code === 0);
        });
        ngrok.on('error', () => {
            resolve(false);
        });
    });
}

// ngrok 실행
function startNgrok(port = 3000) {
    console.log(`🚀 포트 ${port}에서 ngrok 터널 시작...`);
    console.log('📱 모바일이나 다른 네트워크에서 접근할 수 있습니다!');
    console.log('');
    
    const ngrok = spawn('ngrok', ['http', port.toString(), '--log=stdout'], {
        stdio: ['inherit', 'pipe', 'inherit']
    });

    let tunnelUrl = '';
    
    // ngrok 출력에서 URL 추출
    ngrok.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        
        // 터널 URL 추출
        const urlMatch = output.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app/);
        if (urlMatch && !tunnelUrl) {
            tunnelUrl = urlMatch[0];
            console.log('\n🎉 ========================================');
            console.log('✅ ngrok 터널이 성공적으로 생성되었습니다!');
            console.log('🎉 ========================================');
            console.log(`🌐 외부 접근 URL: ${tunnelUrl}`);
            console.log(`📚 API 문서: ${tunnelUrl}/api-docs`);
            console.log(`🔍 서버 상태: ${tunnelUrl}/api/health`);
            console.log('');
            console.log('💡 이 URL을 다른 사람과 공유하세요!');
            console.log('📱 모바일, 다른 컴퓨터에서 접근 가능합니다');
            console.log('========================================\n');
        }
    });

    ngrok.on('close', (code) => {
        console.log(`\n⚠️  ngrok이 종료되었습니다 (코드: ${code})`);
        if (code !== 0) {
            console.log('💡 ngrok 계정 설정이 필요할 수 있습니다:');
            console.log('   1. https://dashboard.ngrok.com/get-started/your-authtoken');
            console.log('   2. ngrok authtoken YOUR_TOKEN_HERE');
        }
    });

    ngrok.on('error', (error) => {
        console.error('❌ ngrok 실행 오류:', error.message);
        console.log('💡 ngrok이 설치되지 않았을 수 있습니다.');
    });

    // Ctrl+C로 종료 처리
    process.on('SIGINT', () => {
        console.log('\n⚠️  ngrok 터널을 종료합니다...');
        ngrok.kill('SIGINT');
        setTimeout(() => process.exit(0), 1000);
    });
    
    process.on('SIGTERM', () => {
        ngrok.kill('SIGTERM');
        setTimeout(() => process.exit(0), 1000);
    });
}

// 메인 함수
async function main() {
    const isInstalled = await checkNgrokInstalled();
    
    if (!isInstalled) {
        console.log('❌ ngrok이 설치되지 않았습니다.');
        console.log('');
        console.log('📦 설치 방법:');
        console.log('');
        
        if (os.platform() === 'win32') {
            console.log('Windows:');
            console.log('1. https://ngrok.com/download 에서 다운로드');
            console.log('2. 또는 Chocolatey: choco install ngrok');
            console.log('3. 또는 Scoop: scoop install ngrok');
        } else if (os.platform() === 'darwin') {
            console.log('macOS:');
            console.log('brew install ngrok/ngrok/ngrok');
        } else {
            console.log('Linux:');
            console.log('curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null');
            console.log('echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list');
            console.log('sudo apt update && sudo apt install ngrok');
        }
        
        console.log('');
        console.log('🔑 설치 후 인증 토큰 설정:');
        console.log('1. https://dashboard.ngrok.com/get-started/your-authtoken 에서 토큰 복사');
        console.log('2. ngrok authtoken YOUR_TOKEN_HERE');
        console.log('');
        process.exit(1);
    }

    console.log('✅ ngrok이 설치되어 있습니다.');
    console.log('');
    console.log('💡 ChessSudoku 서버 터널링을 시작합니다...');
    console.log('🔗 서버가 실행 중이어야 합니다 (npm run dev)');
    console.log('');
    
    // 서버 포트 확인
    const port = process.env.PORT || 3000;
    
    // 잠시 대기 후 터널 시작 (서버 시작 시간 고려)
    setTimeout(() => {
        startNgrok(port);
    }, 2000);
    
    console.log('⏳ 2초 후 터널링을 시작합니다...');
    console.log('📡 서버가 준비될 때까지 대기 중...');
}

main().catch(console.error);
