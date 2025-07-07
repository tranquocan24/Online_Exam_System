// server.js - Server Node.js thuần túy cho ứng dụng thi online

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

class ExamServer {
    constructor() {
        this.port = 3000;
        this.publicDir = path.join(__dirname, 'public');
        this.dataDir = path.join(__dirname, 'data');
        this.server = null;
        
        // Đảm bảo thư mục data tồn tại
        this.ensureDataDirectory();
        
        // Khởi tạo dữ liệu mẫu
        this.initializeSampleData();
    }

    // Đảm bảo thư mục data tồn tại
    ensureDataDirectory() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    // Khởi tạo dữ liệu mẫu
    initializeSampleData() {
        const usersFile = path.join(this.dataDir, 'users.json');
        const questionsFile = path.join(this.dataDir, 'questions.json');
        const resultsFile = path.join(this.dataDir, 'results.json');

        // Tạo file users.json nếu chưa có
        if (!fs.existsSync(usersFile)) {
            const users = {
                students: [
                    {
                        id: "SV001",
                        username: "sv001",
                        password: "123456",
                        name: "Nguyễn Văn A",
                        class: "CNTT01",
                        role: "student"
                    },
                    {
                        id: "SV002",
                        username: "sv002",
                        password: "123456",
                        name: "Trần Thị B",
                        class: "CNTT01",
                        role: "student"
                    }
                ],
                teachers: [
                    {
                        id: "GV001",
                        username: "gv001",
                        password: "123456",
                        name: "PGS.TS Nguyễn Văn C",
                        subject: "Lập trình Web",
                        role: "teacher"
                    }
                ]
            };
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        }

        // Tạo file questions.json nếu chưa có
        if (!fs.existsSync(questionsFile)) {
            const questions = {
                exams: [
                    {
                        id: "exam_001",
                        title: "Kiểm tra Lập trình Web - Cơ bản",
                        subject: "Lập trình Web",
                        description: "Bài kiểm tra kiến thức cơ bản về HTML, CSS và JavaScript",
                        duration: 45,
                        createdBy: "GV001",
                        createdAt: "2025-01-01T00:00:00Z",
                        questions: [
                            {
                                id: 1,
                                type: "multiple-choice",
                                question: "HTML là viết tắt của gì?",
                                options: [
                                    "HyperText Markup Language",
                                    "High Tech Modern Language", 
                                    "Home Tool Markup Language",
                                    "Hyperlink and Text Markup Language"
                                ],
                                correctAnswer: 0
                            },
                            {
                                id: 2,
                                type: "multiple-choice",
                                question: "CSS được sử dụng để làm gì?",
                                options: [
                                    "Tạo cấu trúc trang web",
                                    "Định dạng và trang trí trang web",
                                    "Xử lý logic trang web",
                                    "Kết nối cơ sở dữ liệu"
                                ],
                                correctAnswer: 1
                            },
                            {
                                id: 3,
                                type: "multiple-choice",
                                question: "Thẻ nào được sử dụng để tạo liên kết trong HTML?",
                                options: [
                                    "<link>",
                                    "<a>",
                                    "<href>",
                                    "<url>"
                                ],
                                correctAnswer: 1
                            },
                            {
                                id: 4,
                                type: "multiple-select",
                                question: "Những ngôn ngữ nào sau đây được sử dụng trong front-end development?",
                                options: [
                                    "HTML",
                                    "CSS", 
                                    "JavaScript",
                                    "Python",
                                    "Java"
                                ],
                                correctAnswer: [0, 1, 2]
                            },
                            {
                                id: 5,
                                type: "text",
                                question: "Viết cú pháp để khai báo một biến trong JavaScript:",
                                correctAnswer: "var x; hoặc let x; hoặc const x;"
                            }
                        ]
                    },
                    {
                        id: "exam_002", 
                        title: "Kiểm tra JavaScript - Nâng cao",
                        subject: "Lập trình Web",
                        description: "Bài kiểm tra kiến thức nâng cao về JavaScript ES6+",
                        duration: 60,
                        createdBy: "GV001",
                        createdAt: "2025-01-01T00:00:00Z",
                        questions: [
                            {
                                id: 1,
                                type: "multiple-choice",
                                question: "Arrow function được giới thiệu trong phiên bản nào của JavaScript?",
                                options: [
                                    "ES5",
                                    "ES6",
                                    "ES7",
                                    "ES8"
                                ],
                                correctAnswer: 1
                            },
                            {
                                id: 2,
                                type: "multiple-choice",
                                question: "Từ khóa nào được sử dụng để khai báo hằng số trong JavaScript?",
                                options: [
                                    "var",
                                    "let",
                                    "const",
                                    "final"
                                ],
                                correctAnswer: 2
                            },
                            {
                                id: 3,
                                type: "multiple-select",
                                question: "Những tính năng nào sau đây là mới trong ES6?",
                                options: [
                                    "Arrow functions",
                                    "Template literals",
                                    "Destructuring",
                                    "Classes",
                                    "Promises"
                                ],
                                correctAnswer: [0, 1, 2, 3]
                            }
                        ]
                    },
                    {
                        id: "exam_003",
                        title: "Kiểm tra Cơ sở dữ liệu",
                        subject: "Cơ sở dữ liệu",
                        description: "Bài kiểm tra về SQL và thiết kế cơ sở dữ liệu",
                        duration: 75,
                        createdBy: "GV002", 
                        createdAt: "2025-01-01T00:00:00Z",
                        questions: [
                            {
                                id: 1,
                                type: "multiple-choice",
                                question: "SQL là viết tắt của gì?",
                                options: [
                                    "Structured Query Language",
                                    "Simple Query Language",
                                    "Standard Query Language", 
                                    "Sequential Query Language"
                                ],
                                correctAnswer: 0
                            },
                            {
                                id: 2,
                                type: "multiple-choice",
                                question: "Lệnh nào được sử dụng để tạo bảng mới trong SQL?",
                                options: [
                                    "NEW TABLE",
                                    "CREATE TABLE",
                                    "MAKE TABLE",
                                    "ADD TABLE"
                                ],
                                correctAnswer: 1
                            },
                            {
                                id: 3,
                                type: "text",
                                question: "Viết câu lệnh SQL để lấy tất cả dữ liệu từ bảng 'users':",
                                correctAnswer: "SELECT * FROM users;"
                            }
                        ]
                    }
                ]
            };
            fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2));
        }

        // Tạo file results.json nếu chưa có
        if (!fs.existsSync(resultsFile)) {
            const results = {
                submissions: []
            };
            fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        }
    }

    // Lấy MIME type từ file extension
    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };
        return mimeTypes[ext] || 'text/plain';
    }

    // Serve static files
    serveStaticFile(res, filePath) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                return;
            }

            const mimeType = this.getMimeType(filePath);
            res.writeHead(200, { 
                'Content-Type': mimeType,
                'Cache-Control': 'no-cache'
            });
            res.end(data);
        });
    }

    // Handle API requests
    async handleApiRequest(req, res, pathname) {
        const method = req.method;
        
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        try {
            if (pathname.startsWith('/api/exam/')) {
                await this.handleExamApi(req, res, pathname);
            } else if (pathname.startsWith('/api/result/')) {
                await this.handleResultApi(req, res, pathname);
            } else {
                switch (pathname) {
                    case '/api/users':
                        await this.handleUsers(req, res);
                        break;
                    case '/api/questions':
                        await this.handleQuestions(req, res);
                        break;
                    case '/api/results':
                        await this.handleResults(req, res);
                        break;
                    case '/api/exams':
                        await this.handleExamsList(req, res);
                        break;
                    default:
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'API endpoint not found' }));
                }
            }
        } catch (error) {
            console.error('API Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }

    // Handle exams list API
    async handleExamsList(req, res) {
        const questionsFile = path.join(this.dataDir, 'questions.json');
        
        if (req.method === 'GET') {
            try {
                const data = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
                // Only return exam metadata, not questions
                const examsList = data.exams.map(exam => ({
                    id: exam.id,
                    title: exam.title,
                    subject: exam.subject,
                    description: exam.description,
                    duration: exam.duration,
                    questionCount: exam.questions.length,
                    createdBy: exam.createdBy,
                    createdAt: exam.createdAt
                }));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(examsList));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to load exams' }));
            }
        }
    }

    // Handle specific exam API
    async handleExamApi(req, res, pathname) {
        const parts = pathname.split('/');
        
        // Handle specific endpoints first
        if (parts[2] === 'exam' && parts[3] === 'submit') {
            await this.handleExamSubmission(req, res);
        } else if (parts[2] === 'exam' && parts[3] === 'save-progress') {
            await this.handleSaveProgress(req, res);
        } else if (parts[2] === 'exam' && parts[3]) {
            // Handle single exam retrieval (this should be last)
            const examId = parts[3];
            await this.handleSingleExam(req, res, examId);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Exam endpoint not found' }));
        }
    }

    // Handle single exam retrieval
    async handleSingleExam(req, res, examId) {
        if (req.method !== 'GET') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }

        try {
            const questionsFile = path.join(this.dataDir, 'questions.json');
            const data = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
            const exam = data.exams.find(e => e.id === examId);
            
            if (!exam) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Exam not found' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(exam));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to load exam' }));
        }
    }

    // Handle exam submission
    async handleExamSubmission(req, res) {
        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const submission = JSON.parse(body);
                const resultsFile = path.join(this.dataDir, 'results.json');
                const questionsFile = path.join(this.dataDir, 'questions.json');
                
                // Get exam data for scoring
                const questionsData = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
                const exam = questionsData.exams.find(e => e.id === submission.examId);
                
                if (!exam) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Exam not found' }));
                    return;
                }
                
                // Create result record
                const result = {
                    id: `result_${Date.now()}_${submission.userId}`,
                    examId: submission.examId,
                    examTitle: exam.title,
                    examQuestions: exam.questions,
                    userId: submission.userId,
                    userName: submission.userName,
                    answers: submission.answers,
                    timeSpent: submission.timeSpent,
                    submittedAt: submission.submittedAt,
                    isTimeUp: submission.isTimeUp || false
                };
                
                // Save to results file
                const resultsData = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
                resultsData.submissions.push(result);
                fs.writeFileSync(resultsFile, JSON.stringify(resultsData, null, 2));
                
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    resultId: result.id,
                    message: 'Exam submitted successfully' 
                }));
            } catch (error) {
                console.error('Submission error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid submission data' }));
            }
        });
    }

    // Handle save progress
    async handleSaveProgress(req, res) {
        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }

        // For now, just acknowledge the save without storing
        // In a real app, you might want to store progress in a separate file
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Progress saved' }));
    }

    // Handle result API
    async handleResultApi(req, res, pathname) {
        const parts = pathname.split('/');
        
        if (parts[2] === 'result' && parts[3]) {
            const resultId = parts[3];
            await this.handleSingleResult(req, res, resultId);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Result endpoint not found' }));
        }
    }

    // Handle single result retrieval
    async handleSingleResult(req, res, resultId) {
        if (req.method !== 'GET') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }

        try {
            const url = require('url');
            const query = url.parse(req.url, true).query;
            const userId = query.userId;
            
            const resultsFile = path.join(this.dataDir, 'results.json');
            const questionsFile = path.join(this.dataDir, 'questions.json');
            
            const resultsData = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
            const questionsData = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
            
            const result = resultsData.submissions.find(r => r.id === resultId);
            
            if (!result) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Result not found' }));
                return;
            }
            
            // Check if user has permission to view this result
            if (result.userId !== userId) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Access denied' }));
                return;
            }
            
            // Get exam data
            const exam = questionsData.exams.find(e => e.id === result.examId);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                result: result,
                exam: exam
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to load result' }));
        }
    }

    // Handle users API
    async handleUsers(req, res) {
        const usersFile = path.join(this.dataDir, 'users.json');
        
        if (req.method === 'GET') {
            const data = fs.readFileSync(usersFile, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        }
    }

    // Handle questions API
    async handleQuestions(req, res) {
        const questionsFile = path.join(this.dataDir, 'questions.json');
        
        if (req.method === 'GET') {
            const data = fs.readFileSync(questionsFile, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const newExam = JSON.parse(body);
                    const data = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
                    
                    // Generate new ID
                    newExam.id = `exam_${Date.now()}`;
                    newExam.createdAt = new Date().toISOString();
                    
                    data.exams.push(newExam);
                    fs.writeFileSync(questionsFile, JSON.stringify(data, null, 2));
                    
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(newExam));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
        }
    }

    // Handle results API
    async handleResults(req, res) {
        const resultsFile = path.join(this.dataDir, 'results.json');
        
        if (req.method === 'GET') {
            try {
                const url = require('url');
                const query = url.parse(req.url, true).query;
                const userId = query.userId;
                
                const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
                
                let results = data.submissions;
                
                // Filter by user if specified
                if (userId) {
                    results = results.filter(result => result.userId === userId);
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to load results' }));
            }
        } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const submission = JSON.parse(body);
                    const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
                    
                    submission.id = `result_${Date.now()}`;
                    submission.submittedAt = new Date().toISOString();
                    
                    data.submissions.push(submission);
                    fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2));
                    
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(submission));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
        }
    }

    // Main request handler
    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;

        console.log(`${req.method} ${pathname}`);

        // Handle API requests
        if (pathname.startsWith('/api/')) {
            this.handleApiRequest(req, res, pathname);
            return;
        }

        // Handle static files
        let filePath = path.join(this.publicDir, pathname === '/' ? 'index.html' : pathname);

        // Security: prevent directory traversal
        if (!filePath.startsWith(this.publicDir)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden');
            return;
        }

        // Check if file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // If file doesn't exist, serve index.html (for SPA routing)
                if (pathname !== '/') {
                    filePath = path.join(this.publicDir, 'index.html');
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Page not found');
                    return;
                }
            }
            
            this.serveStaticFile(res, filePath);
        });
    }

    // Start server
    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, () => {
            console.log(`\n🚀 Server đang chạy tại:`);
            console.log(`   http://localhost:${this.port}`);
            console.log(`\n📁 Serving files from: ${this.publicDir}`);
            console.log(`💾 Data directory: ${this.dataDir}`);
            console.log(`\n📝 Tài khoản demo:`);
            console.log(`   Sinh viên: sv001 / 123456`);
            console.log(`   Giáo viên: gv001 / 123456`);
            console.log(`\n⏹️  Nhấn Ctrl+C để dừng server\n`);
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Đang dừng server...');
            this.server.close(() => {
                console.log('✅ Server đã dừng hoàn toàn.');
                process.exit(0);
            });
        });
    }
}

// Khởi tạo và chạy server
const server = new ExamServer();
server.start();
