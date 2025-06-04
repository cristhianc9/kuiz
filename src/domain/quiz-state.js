export const quizState = {
    questionsArray: [],
    correctAnswers: [],
    numQuestionsConfig: 0,
    themeScores: {},
    currentQuestionIndex: 0, // Nuevo: índice de la pregunta actual
    answeredQuestionIds: [], // Nuevo: IDs de preguntas ya respondidas
    currentQuestionTimeLeft: 0,
    timerIntervalId: null,
    questionTimeLimit: 0,
    timerDisplayType: '',
    timeExpiredBehavior: ''
};

export function setQuestionsArray(questions) {
    quizState.questionsArray = questions;
}

export function setCorrectAnswers(answers) {
    quizState.correctAnswers = answers;
}

export function setNumQuestionsConfig(numConfig) {
    quizState.numQuestionsConfig = numConfig;
}

export function setThemeScores(scores) {
    quizState.themeScores = scores;
}

export function setCurrentQuestionTimeLeft(timeLeft) {
    quizState.currentQuestionTimeLeft = timeLeft;
}

export function setTimerIntervalId(intervalId) {
    quizState.timerIntervalId = intervalId;
}

export function setQuestionTimeLimit(timeLimit) {
    quizState.questionTimeLimit = timeLimit;
}

export function setTimerDisplayType(displayType) {
    quizState.timerDisplayType = displayType;
}

export function setTimeExpiredBehavior(behavior) {
    quizState.timeExpiredBehavior = behavior;
}

export function setCurrentQuestionIndex(index) {
    quizState.currentQuestionIndex = index;
}

export function setAnsweredQuestionIds(ids) {
    quizState.answeredQuestionIds = ids;
}
