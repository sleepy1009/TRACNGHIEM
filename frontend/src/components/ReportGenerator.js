import { formatLatexForReport } from '../utils/mathUtils';
const generateTestReport = (subjectName, className, displayName, semester, setNumber, questions, timeSpent, score, totalQuestions) => {
    let answeredCount = 0;
    for (const question of questions) {
        if (question.userAnswer !== null && question.userAnswer !== undefined) {
            answeredCount++;
        }
    }

    let report = `Kết quả kiểm tra môn: ${subjectName} - ${className}\n`;
    report += `Họ tên: ${displayName}\n`;
    report += `Học kỳ: ${semester}, Bộ đề số: ${setNumber}\n`;
    report += `Ngày: ${new Date().toLocaleString()}\n`;
    report += `Số câu trả lời: ${answeredCount} / ${questions.length}\n`;
    report += `Thời gian làm bài: ${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}\n`;
    report += `Số câu đúng: ${score} / ${totalQuestions}\n\n`;
    report += `Đáp án và câu hỏi:\n\n`;

    questions.forEach((question, index) => {
        const formattedQuestionText = formatLatexForReport(question.questionText);

        report += `Câu ${index + 1}: ${formattedQuestionText}\n`;
    
        question.options.forEach((option, optionIndex) => {
            const formattedOption = formatLatexForReport(option);

            const isSelected = question.userAnswer === optionIndex;
            const isCorrect = question.correctAnswer === optionIndex;
            const prefix = isSelected ? '[X]' : '[ ]';
            const suffix = isCorrect ? ' [Đáp án đúng]' : '';
            report += `${prefix} ${String.fromCharCode(65 + optionIndex)}. ${formattedOption}${suffix}\n`;
        });
        report += '\n';
    });

    return report;
};

export default generateTestReport;