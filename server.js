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

        // Định kỳ đồng bộ lại mảng classes cho học sinh mỗi 1 phút
        setInterval(() => {
            try {
                this.syncAllStudentClassesToUsersJson();
                console.log('[AutoSync] Đồng bộ lại mảng classes cho học sinh thành công!');
            } catch (e) {
                console.error('[AutoSync] Lỗi khi đồng bộ mảng classes:', e);
            }
        }, 60 * 1000); // 1 phút
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
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), { encoding: 'utf8' });
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
            fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2), { encoding: 'utf8' });
        }

        // Tạo file results.json nếu chưa có
        if (!fs.existsSync(resultsFile)) {
            const results = {
                submissions: []
            };
            fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2), { encoding: 'utf8' });
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
            } else if (pathname.startsWith('/api/users/')) {
                await this.handleUserById(req, res, pathname);
            } else if (pathname.startsWith('/api/classes/')) {
                await this.handleClassById(req, res, pathname);
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
                    case '/api/classes':
                        await this.handleClasses(req, res);
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
        const usersFile = path.join(this.dataDir, 'users.json');
        const classesDir = path.join(this.dataDir, 'classes');

        if (req.method === 'GET') {
            try {
                const url = require('url');
                const query = url.parse(req.url, true).query;
                const userId = query.userId;
                let studentClasses = [];

                if (userId) {
                    // Lấy thông tin học sinh
                    const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
                    const student = (usersData.students || []).find(u => u.id === userId);
                    if (student && Array.isArray(student.classes) && student.classes.length > 0) {
                        studentClasses = student.classes;
                    } else {
                        // Nếu không tìm thấy học sinh hoặc không có classes, trả về rỗng
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify([]));
                        return;
                    }
                }

                const data = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
                let examsList = data.exams.map(exam => ({
                    id: exam.id,
                    title: exam.title,
                    subject: exam.subject,
                    description: exam.description,
                    duration: exam.duration,
                    questionCount: exam.questions.length,
                    createdBy: exam.createdBy,
                    createdAt: exam.createdAt,
                    allowedClasses: exam.allowedClasses || []
                }));

                // Nếu có userId, chỉ trả về bài thi phù hợp lớp học sinh
                if (userId && Array.isArray(studentClasses) && studentClasses.length > 0) {
                    examsList = examsList.filter(exam => Array.isArray(exam.allowedClasses) && studentClasses.some(cls => exam.allowedClasses.includes(cls)));
                }

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
                fs.writeFileSync(resultsFile, JSON.stringify(resultsData, null, 2), { encoding: 'utf8' });

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

            console.log('handleSingleResult called:', { resultId, userId });

            const resultsFile = path.join(this.dataDir, 'results.json');
            const questionsFile = path.join(this.dataDir, 'questions.json');

            const resultsData = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
            const questionsData = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

            const result = resultsData.submissions.find(r => r.id === resultId);

            console.log('Found result:', result ? 'Yes' : 'No');
            if (result) {
                console.log('Result belongs to user:', result.userId);
            }

            if (!result) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Result not found' }));
                return;
            }

            // Check if user has permission to view this result
            if (result.userId !== userId) {
                console.log('Access denied:', { resultUserId: result.userId, requestUserId: userId });
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
        } else if (req.method === 'POST') {
            // Add new user
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const newUser = JSON.parse(body);
                    const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

                    console.log('Adding new user:', newUser);

                    // Validate required fields
                    if (!newUser.username || !newUser.password || !newUser.name || !newUser.role) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Missing required fields' }));
                        return;
                    }

                    // Check if username already exists
                    const allUsers = [
                        ...(data.students || []),
                        ...(data.teachers || []),
                        ...(data.admins || [])
                    ];

                    if (allUsers.find(user => user.username === newUser.username)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Username already exists' }));
                        return;
                    }

                    // Add to appropriate role array
                    const roleKey = newUser.role + 's'; // student -> students, teacher -> teachers, admin -> admins
                    if (!data[roleKey]) {
                        data[roleKey] = [];
                    }

                    data[roleKey].push(newUser);

                    // Save to file
                    fs.writeFileSync(usersFile, JSON.stringify(data, null, 2), { encoding: 'utf8' });

                    console.log('User added successfully:', newUser.username);

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User created successfully', user: newUser }));

                } catch (error) {
                    console.error('Error adding user:', error);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON or server error' }));
                }
            });
        } else if (req.method === 'PUT') {
            // Update user - handled by handleUserById
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Use /api/users/{id} for updates' }));
        } else if (req.method === 'DELETE') {
            // Delete user - handled by handleUserById
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Use /api/users/{id} for deletion' }));
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
    }

    // Handle individual user operations (/api/users/{id})
    async handleUserById(req, res, pathname) {
        const usersFile = path.join(this.dataDir, 'users.json');
        const userId = pathname.split('/').pop(); // Get ID from URL

        console.log(`${req.method} request for user: ${userId}`);

        if (req.method === 'PUT') {
            // Update user
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const updatedUser = JSON.parse(body);
                    const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

                    console.log('Updating user:', updatedUser);

                    // Validate required fields
                    if (!updatedUser.username || !updatedUser.password || !updatedUser.name || !updatedUser.role) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Missing required fields' }));
                        return;
                    }

                    // Find and update user
                    let userFound = false;
                    const roleKey = updatedUser.role + 's'; // student -> students, etc.

                    if (data[roleKey]) {
                        const userIndex = data[roleKey].findIndex(user => user.id === userId);
                        if (userIndex !== -1) {
                            // Keep the original ID
                            updatedUser.id = userId;
                            data[roleKey][userIndex] = updatedUser;
                            userFound = true;
                        }
                    }

                    // If not found in expected role, search all roles
                    if (!userFound) {
                        const allRoles = ['students', 'teachers', 'admins'];
                        for (const role of allRoles) {
                            if (data[role]) {
                                const userIndex = data[role].findIndex(user => user.id === userId);
                                if (userIndex !== -1) {
                                    // Remove from old role
                                    data[role].splice(userIndex, 1);

                                    // Add to new role
                                    const newRoleKey = updatedUser.role + 's';
                                    if (!data[newRoleKey]) {
                                        data[newRoleKey] = [];
                                    }
                                    updatedUser.id = userId;
                                    data[newRoleKey].push(updatedUser);
                                    userFound = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (!userFound) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'User not found' }));
                        return;
                    }

                    // Save to file
                    fs.writeFileSync(usersFile, JSON.stringify(data, null, 2), { encoding: 'utf8' });

                    console.log('User updated successfully:', updatedUser.username);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User updated successfully', user: updatedUser }));

                } catch (error) {
                    console.error('Error updating user:', error);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON or server error' }));
                }
            });

        } else if (req.method === 'DELETE') {
            // Delete user
            try {
                const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

                console.log('Deleting user:', userId);

                // Protect main admin
                if (userId === 'AD001') {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Cannot delete main admin account' }));
                    return;
                }

                // Find and delete user
                let userFound = false;
                const allRoles = ['students', 'teachers', 'admins'];

                for (const role of allRoles) {
                    if (data[role]) {
                        const userIndex = data[role].findIndex(user => user.id === userId);
                        if (userIndex !== -1) {
                            data[role].splice(userIndex, 1);
                            userFound = true;
                            break;
                        }
                    }
                }

                if (!userFound) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                    return;
                }

                // Save to file
                fs.writeFileSync(usersFile, JSON.stringify(data, null, 2), { encoding: 'utf8' });

                console.log('User deleted successfully:', userId);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User deleted successfully' }));

            } catch (error) {
                console.error('Error deleting user:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
            }

        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
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
                    fs.writeFileSync(questionsFile, JSON.stringify(data, null, 2), { encoding: 'utf8' });

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(newExam));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
        } else if (req.method === 'DELETE') {
            // Handle exam deletion
            const url = require('url');
            const urlParts = url.parse(req.url, true);
            const examId = urlParts.query.id;

            if (!examId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Exam ID is required' }));
                return;
            }

            try {
                const data = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
                const examIndex = data.exams.findIndex(exam => exam.id === examId);

                if (examIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Exam not found' }));
                    return;
                }

                // Remove the exam
                const deletedExam = data.exams.splice(examIndex, 1)[0];
                fs.writeFileSync(questionsFile, JSON.stringify(data, null, 2), { encoding: 'utf8' });

                // Also delete related results
                const resultsFile = path.join(this.dataDir, 'results.json');
                if (fs.existsSync(resultsFile)) {
                    const resultsData = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
                    resultsData.submissions = resultsData.submissions.filter(result => result.examId !== examId);
                    fs.writeFileSync(resultsFile, JSON.stringify(resultsData, null, 2), { encoding: 'utf8' });
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, deletedExam }));
            } catch (error) {
                console.error('Error deleting exam:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to delete exam' }));
            }
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
                    fs.writeFileSync(resultsFile, JSON.stringify(data, null, 2), { encoding: 'utf8' });

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(submission));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
        }
    }

    // Thêm các hàm xử lý API cho lớp học
    async handleClasses(req, res) {
        const classesDir = path.join(this.dataDir, 'classes');
        if (!fs.existsSync(classesDir)) fs.mkdirSync(classesDir);
        if (req.method === 'GET') {
            // Lấy danh sách tất cả lớp học
            try {
                const files = fs.readdirSync(classesDir).filter(f => f.endsWith('.json'));
                const classes = files.map(f => {
                    const data = JSON.parse(fs.readFileSync(path.join(classesDir, f), 'utf8'));
                    return {
                        id: data.id,
                        name: data.name,
                        description: data.description,
                        teachers: data.teachers,
                        students: data.students,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                    };
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(classes));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to load classes' }));
            }
        } else if (req.method === 'POST') {
            // Tạo mới lớp học
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const newClass = JSON.parse(body);
                    if (!newClass.id || !newClass.name) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Missing id or name' }));
                        return;
                    }
                    newClass.createdAt = newClass.createdAt || new Date().toISOString();
                    newClass.updatedAt = new Date().toISOString();
                    const filePath = path.join(classesDir, `${newClass.id}.json`);
                    fs.writeFileSync(filePath, JSON.stringify(newClass, null, 2), { encoding: 'utf8' });

                    // --- TỰ ĐỘNG ĐỒNG BỘ LẠI CLASSES ---
                    this.syncAllStudentClassesToUsersJson();
                    // --- END ---

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(newClass));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
        } else if (req.method === 'PUT') {
            // Cập nhật lớp học
            if (!fs.existsSync(filePath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Class not found' }));
                return;
            }
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const updatedClass = JSON.parse(body);
                    updatedClass.updatedAt = new Date().toISOString();

                    // Đọc danh sách học sinh cũ
                    const oldClassData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    const oldStudentIds = (oldClassData.students || []).map(s => s.id);
                    const newStudentIds = (updatedClass.students || []).map(s => s.id);

                    fs.writeFileSync(filePath, JSON.stringify(updatedClass, null, 2), { encoding: 'utf8' });

                    // --- TỰ ĐỘNG ĐỒNG BỘ LẠI CLASSES ---
                    this.syncAllStudentClassesToUsersJson();
                    // --- END ---

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(updatedClass));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
        } else if (req.method === 'DELETE') {
            // Xóa lớp học
            if (!fs.existsSync(filePath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Class not found' }));
                return;
            }
            fs.unlinkSync(filePath);
            // --- TỰ ĐỘNG ĐỒNG BỘ LẠI CLASSES ---
            this.syncAllStudentClassesToUsersJson();
            // --- END ---
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Class deleted' }));
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
    }

    async handleClassById(req, res, pathname) {
        const classesDir = path.join(this.dataDir, 'classes');
        if (!fs.existsSync(classesDir)) fs.mkdirSync(classesDir);
        const classId = pathname.split('/').pop();
        const filePath = path.join(classesDir, `${classId}.json`);
        if (req.method === 'GET') {
            // Lấy thông tin 1 lớp học
            if (!fs.existsSync(filePath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Class not found' }));
                return;
            }
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } else if (req.method === 'PUT') {
            // Cập nhật lớp học
            if (!fs.existsSync(filePath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Class not found' }));
                return;
            }
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const updatedClass = JSON.parse(body);
                    updatedClass.updatedAt = new Date().toISOString();
                    fs.writeFileSync(filePath, JSON.stringify(updatedClass, null, 2), { encoding: 'utf8' });

                    // --- TỰ ĐỘNG CẬP NHẬT users.json ---
                    const usersFile = path.join(this.dataDir, 'users.json');
                    const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
                    if (Array.isArray(updatedClass.students)) {
                        for (const stu of updatedClass.students) {
                            const idx = (usersData.students || []).findIndex(u => u.id === stu.id);
                            if (idx !== -1) {
                                usersData.students[idx].class = updatedClass.id;
                            }
                        }
                        fs.writeFileSync(usersFile, JSON.stringify(usersData, null, 2), { encoding: 'utf8' });
                    }
                    // --- END ---

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(updatedClass));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            });
        } else if (req.method === 'DELETE') {
            // Xóa lớp học
            if (!fs.existsSync(filePath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Class not found' }));
                return;
            }
            fs.unlinkSync(filePath);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Class deleted' }));
        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
    }

    // Hàm đồng bộ lại mảng classes cho tất cả học sinh dựa trên các file lớp
    syncAllStudentClassesToUsersJson() {
        const usersFile = path.join(this.dataDir, 'users.json');
        const classesDir = path.join(this.dataDir, 'classes');
        if (!fs.existsSync(usersFile) || !fs.existsSync(classesDir)) return;
        const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        // Xây dựng map id học sinh -> mảng lớp
        const studentClassesMap = {};
        const classFiles = fs.readdirSync(classesDir).filter(f => f.endsWith('.json'));
        for (const file of classFiles) {
            const classData = JSON.parse(fs.readFileSync(path.join(classesDir, file), 'utf8'));
            const classId = classData.id;
            if (Array.isArray(classData.students)) {
                for (const stu of classData.students) {
                    if (!studentClassesMap[stu.id]) studentClassesMap[stu.id] = [];
                    if (!studentClassesMap[stu.id].includes(classId)) studentClassesMap[stu.id].push(classId);
                }
            }
        }
        // Gán lại mảng classes cho từng học sinh
        if (Array.isArray(usersData.students)) {
            for (const stu of usersData.students) {
                stu.classes = studentClassesMap[stu.id] || [];
            }
        }
        fs.writeFileSync(usersFile, JSON.stringify(usersData, null, 2), { encoding: 'utf8' });
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
