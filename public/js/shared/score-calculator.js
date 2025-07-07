// Shared score calculation utility
class ScoreCalculator {
    static calculateScore(result) {
        if (!result.examQuestions || !result.answers) {
            return 0;
        }
        
        let correct = 0;
        const total = result.examQuestions.length;
        
        result.examQuestions.forEach((question, index) => {
            // Try different ways to match question with answer
            let userAnswer = null;
            
            // Method 1: Direct match by question.id (string or number)
            if (result.answers.hasOwnProperty(question.id)) {
                userAnswer = result.answers[question.id];
            }
            // Method 2: Match by index as string (for newer exams)
            else if (result.answers.hasOwnProperty(index.toString())) {
                userAnswer = result.answers[index.toString()];
            }
            // Method 3: Match by index number
            else if (result.answers.hasOwnProperty(index)) {
                userAnswer = result.answers[index];
            }
            // Method 4: Try question.id as string if it's currently number
            else if (result.answers.hasOwnProperty(question.id.toString())) {
                userAnswer = result.answers[question.id.toString()];
            }
            
            const isCorrect = ScoreCalculator.isAnswerCorrect(question, userAnswer);
            
            if (isCorrect) {
                correct++;
            }
        });
        
        const score = Math.round((correct / total) * 100);
        return score;
    }
    
    static isAnswerCorrect(question, userAnswer) {
        if (userAnswer === null || userAnswer === undefined) {
            return false;
        }
        
        switch (question.type) {
            case 'multiple-choice':
                return userAnswer === question.correctAnswer;
            case 'multiple-select':
                if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) {
                    return false;
                }
                const sortedUserAnswer = [...userAnswer].sort();
                const sortedCorrectAnswer = [...question.correctAnswer].sort();
                return JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
            case 'text':
                return userAnswer.toString().toLowerCase().trim() === question.correctAnswer.toString().toLowerCase().trim();
            default:
                // Default to multiple choice for questions without type
                return userAnswer === question.correctAnswer;
        }
    }
    
    static calculateCorrectAnswers(result) {
        if (!result.examQuestions || !result.answers) {
            return { correct: 0, total: 0 };
        }
        
        let correct = 0;
        const total = result.examQuestions.length;
        
        result.examQuestions.forEach((question, index) => {
            // Try different ways to match question with answer
            let userAnswer = null;
            
            if (result.answers.hasOwnProperty(question.id)) {
                userAnswer = result.answers[question.id];
            } else if (result.answers.hasOwnProperty(index.toString())) {
                userAnswer = result.answers[index.toString()];
            } else if (result.answers.hasOwnProperty(index)) {
                userAnswer = result.answers[index];
            } else if (result.answers.hasOwnProperty(question.id.toString())) {
                userAnswer = result.answers[question.id.toString()];
            }
            
            if (ScoreCalculator.isAnswerCorrect(question, userAnswer)) {
                correct++;
            }
        });
        
        return { correct, total };
    }
}

// Make it available globally
window.ScoreCalculator = ScoreCalculator;
