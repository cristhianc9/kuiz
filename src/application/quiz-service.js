import { quizState, setQuestionsArray, setCorrectAnswers, setNumQuestionsConfig, setThemeScores, setCurrentQuestionTimeLeft, setTimerIntervalId, setQuestionTimeLimit, setTimerDisplayType, setTimeExpiredBehavior, setCurrentQuestionIndex, setAnsweredQuestionIds } from '../domain/quiz-state.js';
import { fetchConfig, fetchQuestions } from '../infrastructure/persistence/quiz-repository.js';
import { saveQuizProgress, loadQuizProgress, saveResultsData } from '../infrastructure/persistence/session-storage.js';
import { displayQuestions, displayGeneralQuizInfo, updateTimerDisplay, updateProgressDisplay, disableQuestionInputs, showQuiz, hideQuiz } from '../infrastructure/ui/quiz-renderer.js';
import { selectRandomQuestions, calculateThemeScores } from '../domain/quiz-utils.js';
import { submitButton } from '../infrastructure/ui/dom-elements.js';

// Nueva función para configurar los event listeners
function setupQuestionEventListeners(questionId) {
    const inputs = document.querySelectorAll(`input[name="question${questionId}"]`);
    inputs.forEach(input => {
        input.addEventListener('change', (event) => {
            const question = quizState.questionsArray.find(q => q.id === questionId);
            if (question) {
                if (question.tipo === 'multiple') {
                    const selectedAnswers = Array.from(document.querySelectorAll(`input[name="question${questionId}"]:checked`)).map(el => el.value);
                    question.userAnswer = selectedAnswers;
                } else { // simple o verdadero_falso
                    question.userAnswer = event.target.value;
                    showAnswerFeedback(questionId);
                    setTimeout(() => {
                        stopQuestionTimer();
                        goToNextQuestion();
                    }, 700); // Esperar a mostrar feedback antes de avanzar
                    return;
                }
            }
        });
    });

    // Añadir event listener para el botón "Siguiente" si la pregunta es de tipo "multiple"
    const question = quizState.questionsArray.find(q => q.id === questionId);
    if (question && question.tipo === 'multiple') {
        const nextButton = document.getElementById(`next-question-button-${questionId}`);
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                stopQuestionTimer(); // Detener el temporizador al avanzar
                goToNextQuestion();
            });
        }
    }
}

function startQuestionTimer(questionId) {
    stopQuestionTimer(); // Limpiar cualquier temporizador existente
    setCurrentQuestionTimeLeft(quizState.questionTimeLimit);
    updateTimerDisplay(quizState.currentQuestionTimeLeft, quizState.questionTimeLimit);

    const intervalId = setInterval(() => {
        setCurrentQuestionTimeLeft(quizState.currentQuestionTimeLeft - 1);
        updateTimerDisplay(quizState.currentQuestionTimeLeft, quizState.questionTimeLimit);

        if (quizState.currentQuestionTimeLeft <= 0) {
            clearInterval(quizState.timerIntervalId);
            handleTimeExpired(questionId);
        }
    }, 1000);
    setTimerIntervalId(intervalId);
}

function stopQuestionTimer() {
    if (quizState.timerIntervalId) {
        clearInterval(quizState.timerIntervalId);
        setTimerIntervalId(null);
    }
}

function handleTimeExpired(questionId) {
    const questionIndex = quizState.questionsArray.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        const question = quizState.questionsArray[questionIndex];
        // Marcar como incorrecta si no ha sido respondida
        if (!question.userAnswer || (Array.isArray(question.userAnswer) && question.userAnswer.length === 0)) {
            question.userAnswer = null; // Marcar como no respondida
            // No se marca como incorrecta aquí, se manejará en handleSubmitQuiz
        }
        disableQuestionInputs(questionId);
        alert(`¡Tiempo agotado para la pregunta ${question.id}!`);
        goToNextQuestion(); // Avanzar a la siguiente pregunta
    }
}

function goToNextQuestion() {
    stopQuestionTimer(); // Detener el temporizador de la pregunta actual
    const nextQuestionIndex = quizState.currentQuestionIndex + 1;

    if (nextQuestionIndex < quizState.questionsArray.length) {
        setCurrentQuestionIndex(nextQuestionIndex);
        displayCurrentQuestion();
    } else {
        // Si no hay más preguntas, finalizar el quiz
        handleSubmitQuiz();
    }
}

function displayCurrentQuestion() {
    const currentQuestion = quizState.questionsArray[quizState.currentQuestionIndex];
    displayQuestions([currentQuestion]); // Mostrar solo la pregunta actual
    setupQuestionEventListeners(currentQuestion.id);
    startQuestionTimer(currentQuestion.id);
    updateProgressDisplay(quizState.currentQuestionIndex, quizState.questionsArray.length);
}

export async function initializeQuiz() {
    // No limpiar sessionStorage al inicio para mantener el historial de preguntas respondidas
    // sessionStorage.clear();
    // Ocultar los botones al inicio, se mostrarán si el quiz se inicializa correctamente
    submitButton.style.display = 'none';

    try {
        const config = await fetchConfig();
        setNumQuestionsConfig(config.numQuestions);
        setQuestionTimeLimit(config.questionTimeLimit);
        setTimerDisplayType(config.timerDisplayType);
        setTimeExpiredBehavior(config.timeExpiredBehavior);

        if (loadQuizProgress()) {
            // Asegurarse de que el número de preguntas cargadas sea el configurado
            const currentQuestions = quizState.questionsArray.slice(0, quizState.numQuestionsConfig);
            setQuestionsArray(currentQuestions);
            // Si se cargó el progreso, determinar la pregunta actual
            // Esto requeriría almacenar el currentQuestionIndex en sessionStorage también
            // Por simplicidad, asumiremos que siempre se inicia desde la primera pregunta al cargar progreso
            setCurrentQuestionIndex(0);
            displayCurrentQuestion();
            submitButton.style.display = 'block'; // Mostrar el botón Finalizar Cuestionario
            showQuiz();
            return;
        }

        const allQuestions = await fetchQuestions();
        // Filtrar preguntas ya respondidas
        const availableQuestions = allQuestions.filter(q => !quizState.answeredQuestionIds.includes(q.id));
        const selectedQuestions = selectRandomQuestions(availableQuestions, quizState.numQuestionsConfig);

        setQuestionsArray(selectedQuestions);
        saveQuizProgress();
        displayGeneralQuizInfo(quizState.questionsArray);
        setCurrentQuestionIndex(0); // Iniciar siempre desde la primera pregunta
        displayCurrentQuestion();
        submitButton.style.display = 'block'; // Mostrar el botón Finalizar Cuestionario
        showQuiz();

    } catch (error) {
        console.error('Failed to load config or questions:', error);
        document.getElementById('quiz-container').innerHTML = '<p>Failed to load quiz. Please check the console for details.</p>';
    }
}

export async function handleSubmitQuiz() {
    let currentCorrectAnswers = [];
    let currentQuestionsArray = quizState.questionsArray;

    try {
        const config = await fetchConfig();
        const numQuestionsConfig = config.numQuestions;

        currentQuestionsArray.forEach(question => {
            let isCorrect = false; // Inicializar como falso por defecto
            const userAnswer = question.userAnswer; // Obtener la respuesta del usuario directamente del estado

            if (question.tipo === 'multiple') {
                if (userAnswer && userAnswer.length > 0) {
                    const correctOptionIds = question.respuesta;
                    isCorrect = userAnswer.length === correctOptionIds.length &&
                                userAnswer.every(ans => correctOptionIds.includes(ans));
                }
            } else if (question.tipo === 'simple') {
                if (userAnswer !== null && userAnswer !== undefined) {
                    isCorrect = question.respuesta[0] === userAnswer;
                }
            } else if (question.tipo === 'verdadero_falso') {
                if (userAnswer !== null && userAnswer !== undefined) {
                    isCorrect = (userAnswer === 'true') === (question.respuesta[0] === 'verdadero');
                }
            }
            currentCorrectAnswers.push(isCorrect);
        });
 
        // Actualizar answeredQuestionIds con las preguntas de esta sesión
        const newAnsweredQuestionIds = quizState.questionsArray.map(q => q.id);
        setAnsweredQuestionIds([...quizState.answeredQuestionIds, ...newAnsweredQuestionIds]);
 
        setCorrectAnswers(currentCorrectAnswers);
        setThemeScores(calculateThemeScores(currentQuestionsArray, quizState.correctAnswers));
        saveQuizProgress();

        const resultsData = {
            questionsArray: quizState.questionsArray,
            correctAnswers: quizState.correctAnswers,
            numQuestionsConfig: quizState.numQuestionsConfig,
            themeScores: quizState.themeScores
        };
        saveResultsData(resultsData);
        window.location.href = `results.html`;

    } catch (error) {
        console.error('Error loading config or questions:', error.message, error.stack);
        alert('Ocurrió un error al cargar la configuración o las preguntas. Revisa la consola para más detalles.');
    }
}

function showAnswerFeedback(questionId) {
    const questionDiv = document.querySelector(`.question`);
    if (questionDiv) {
        let feedback = document.createElement('div');
        feedback.className = 'answer-feedback';
        feedback.innerHTML = `<span class="feedback-check">&#8505;</span> Pregunta registrada`;
        questionDiv.appendChild(feedback);
        setTimeout(() => {
            feedback.remove();
        }, 700); // Mostrar feedback por 0.7 segundos
    }
}

// Cuando se muestra la pantalla de inicio (por ejemplo, al cargar la página o al volver), llamar a hideQuiz().
