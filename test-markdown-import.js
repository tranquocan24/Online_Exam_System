const fs = require('fs');
const path = require('path');

// Test script for Markdown import feature
async function testMarkdownImport() {
    console.log('🧪 Testing Markdown import functionality...');
    
    // Test 1: Check if sample files exist
    const sampleExamPath = path.join(__dirname, 'sample_exam.md');
    const guidePath = path.join(__dirname, 'markdown_guide.md');
    
    if (fs.existsSync(sampleExamPath)) {
        console.log('✅ Sample exam file exists');
    } else {
        console.log('❌ Sample exam file missing');
    }
    
    if (fs.existsSync(guidePath)) {
        console.log('✅ Markdown guide file exists');
    } else {
        console.log('❌ Markdown guide file missing');
    }
    
    // Test 2: Parse sample exam
    try {
        const sampleContent = fs.readFileSync(sampleExamPath, 'utf8');
        const questions = parseMarkdownQuestions(sampleContent);
        console.log(`✅ Successfully parsed ${questions.length} questions from sample exam`);
        
        // Validate question types
        const multipleChoice = questions.filter(q => q.type === 'multiple-choice').length;
        const multipleSelect = questions.filter(q => q.type === 'multiple-select').length;
        const textQuestions = questions.filter(q => q.type === 'text').length;
        
        console.log(`   📊 Question types: ${multipleChoice} multiple-choice, ${multipleSelect} multiple-select, ${textQuestions} text`);
        
        // Test specific questions
        const firstQuestion = questions[0];
        if (firstQuestion && firstQuestion.options && firstQuestion.options.length > 0) {
            console.log('✅ First question has options');
        } else {
            console.log('❌ First question missing options');
        }
        
    } catch (error) {
        console.log('❌ Error parsing sample exam:', error.message);
    }
    
    console.log('🎉 Markdown import test completed!');
}

// Simple parser to test the logic
function parseMarkdownQuestions(content) {
    const lines = content.split('\n');
    const questions = [];
    let currentQuestion = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('## Câu ')) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                text: line.substring(line.indexOf(':') + 1).trim(),
                type: 'multiple-choice',
                options: [],
                score: 1
            };
        } else if (line.startsWith('**Loại:**')) {
            const type = line.replace('**Loại:**', '').trim();
            if (currentQuestion) {
                currentQuestion.type = type;
            }
        } else if (line.startsWith('**Điểm:**')) {
            const score = parseInt(line.replace('**Điểm:**', '').trim());
            if (currentQuestion) {
                currentQuestion.score = score;
            }
        } else if (line.startsWith('**Đáp án:**')) {
            const answer = line.replace('**Đáp án:**', '').trim();
            if (currentQuestion) {
                if (currentQuestion.type === 'multiple-choice') {
                    currentQuestion.correctAnswer = answer.charCodeAt(0) - 65;
                } else if (currentQuestion.type === 'multiple-select') {
                    currentQuestion.correctAnswers = answer.split(',').map(a => a.trim().charCodeAt(0) - 65);
                } else {
                    currentQuestion.sampleAnswer = answer;
                }
            }
        } else if (line.startsWith('- ') && currentQuestion) {
            const optionText = line.substring(2).trim();
            if (optionText.match(/^[A-E]\./)) {
                const cleanOption = optionText.substring(2).trim();
                currentQuestion.options.push(cleanOption);
            }
        }
    }
    
    if (currentQuestion) {
        questions.push(currentQuestion);
    }
    
    return questions;
}

// Run the test
testMarkdownImport();
