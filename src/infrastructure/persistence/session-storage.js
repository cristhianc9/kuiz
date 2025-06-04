import { quizState } from '../../domain/quiz-state.js';

export function saveQuizProgress() {
    sessionStorage.setItem('questionsArray', JSON.stringify(quizState.questionsArray));
    sessionStorage.setItem('correctAnswers', JSON.stringify(quizState.correctAnswers));
    sessionStorage.setItem('numQuestionsConfig', JSON.stringify(quizState.numQuestionsConfig));
    sessionStorage.setItem('themeScores', JSON.stringify(quizState.themeScores));
    sessionStorage.setItem('answeredQuestionIds', JSON.stringify(quizState.answeredQuestionIds));
}

export function loadQuizProgress() {
    const questions = sessionStorage.getItem('questionsArray');
    const answers = sessionStorage.getItem('correctAnswers');
    const numConfig = sessionStorage.getItem('numQuestionsConfig');
    const scores = sessionStorage.getItem('themeScores');
    const answeredIds = sessionStorage.getItem('answeredQuestionIds');

    if (questions && answers && numConfig && scores && answeredIds) {
        quizState.questionsArray = JSON.parse(questions);
        quizState.correctAnswers = JSON.parse(answers);
        quizState.numQuestionsConfig = parseInt(numConfig, 10); // Asegurar base 10
        quizState.themeScores = JSON.parse(scores);
        quizState.answeredQuestionIds = JSON.parse(answeredIds);
        return true;
    }
    return false;
}

export function saveResultsData(data) {
    sessionStorage.setItem('resultsData', JSON.stringify(data));
}

export function loadResultsData() {
    const resultsDataJSON = sessionStorage.getItem('resultsData');
    return resultsDataJSON ? JSON.parse(resultsDataJSON) : null;
}