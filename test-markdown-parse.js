// Test markdown parsing
const fs = require('fs');
const path = require('path');

// Đọc file mẫu markdown
const markdownContent = fs.readFileSync('./sample_exam.md', 'utf8');

// Simulate parsing logic from create_exam.js
function parseMarkdownExam(content) {
    const lines = content.split('\n');
    const examInfo = {};
    const questions = [];
    let currentQuestion = null;
    let currentSection = null;

    console.log(`Total lines: ${lines.length}`);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Parse exam info from header
        if (line.startsWith('# ')) {
            examInfo.title = line.substring(2).trim();
            console.log(`Found title: ${examInfo.title}`);
        } else if (line.startsWith('**Môn học:**')) {
            examInfo.subject = line.replace('**Môn học:**', '').trim();
            console.log(`Found subject: ${examInfo.subject}`);
        } else if (line.startsWith('**Thời gian:**')) {
            const timeMatch = line.match(/(\d+)\s*phút/);
            if (timeMatch) {
                examInfo.duration = parseInt(timeMatch[1]);
                console.log(`Found duration: ${examInfo.duration}`);
            }
        } else if (line.startsWith('**Mô tả:**')) {
            examInfo.description = line.replace('**Mô tả:**', '').trim();
            console.log(`Found description: ${examInfo.description}`);
        }

        // Parse questions
        if (line.startsWith('## Câu ')) {
            if (currentQuestion) {
                console.log(`Pushing question: ${currentQuestion.text}`);
                questions.push(currentQuestion);
            }
            const questionText = line.substring(line.indexOf(':') + 1).trim();
            currentQuestion = {
                text: questionText,
                type: 'multiple-choice',
                options: [],
                score: 1
            };
            console.log(`Started new question: ${questionText}`);
        } else if (line.startsWith('**Loại:**')) {
            const type = line.replace('**Loại:**', '').trim();
            if (currentQuestion) {
                currentQuestion.type = type;
                console.log(`Set type: ${type}`);
            }
        } else if (line.startsWith('**Điểm:**')) {
            const score = parseInt(line.replace('**Điểm:**', '').trim());
            if (currentQuestion) {
                currentQuestion.score = score;
                console.log(`Set score: ${score}`);
            }
        } else if (line.startsWith('**Đáp án:**')) {
            const answer = line.replace('**Đáp án:**', '').trim();
            if (currentQuestion) {
                if (currentQuestion.type === 'multiple-choice') {
                    // Convert A,B,C,D to index
                    const answerIndex = answer.charCodeAt(0) - 65;
                    currentQuestion.correctAnswer = answerIndex;
                    console.log(`Set correct answer: ${answer} (index: ${answerIndex})`);
                } else if (currentQuestion.type === 'multiple-select') {
                    // Convert A,C,D to array of indices
                    const answers = answer.split(',').map(a => a.trim().charCodeAt(0) - 65);
                    currentQuestion.correctAnswers = answers;
                    console.log(`Set correct answers: ${answer} (indices: ${answers})`);
                } else {
                    currentQuestion.sampleAnswer = answer;
                    console.log(`Set sample answer: ${answer}`);
                }
            }
        } else if (line.startsWith('- ') && currentQuestion) {
            // Parse options
            const optionText = line.substring(2).trim();
            if (optionText.match(/^[A-E]\./)) {
                // Remove A. B. C. D. E. prefix
                const cleanOption = optionText.substring(2).trim();
                currentQuestion.options.push(cleanOption);
                console.log(`Added option: ${cleanOption}`);
            }
        } else if (line && !line.startsWith('---') && !line.startsWith('**') && currentQuestion && currentQuestion.type === 'text') {
            // Add text content for essay questions
            if (!currentQuestion.text.includes(line)) {
                currentQuestion.text += ' ' + line;
                console.log(`Added text to question: ${line}`);
            }
        }
    }

    // Add last question
    if (currentQuestion) {
        console.log(`Pushing last question: ${currentQuestion.text}`);
        questions.push(currentQuestion);
    }

    console.log(`\nFinal result: ${questions.length} questions found`);
    questions.forEach((q, i) => {
        console.log(`Question ${i+1}: ${q.text} (${q.type}) - Options: ${q.options.length}`);
    });

    return { examInfo, questions };
}

const result = parseMarkdownExam(markdownContent);
console.log('\n=== FINAL RESULT ===');
console.log('Exam info:', result.examInfo);
console.log(`Questions found: ${result.questions.length}`);
