import { quizContainer, infoGeneralContainer, resultsContainer } from './dom-elements.js';

export function displayQuestions(questionsArray) {
    let mainQuizLayout = document.getElementById('main-quiz-layout');
    if (!mainQuizLayout) {
        mainQuizLayout = document.createElement('div');
        mainQuizLayout.id = 'main-quiz-layout';
        mainQuizLayout.classList.add('main-quiz-layout');
        quizContainer.appendChild(mainQuizLayout);
    }

    let quizSidebar = document.getElementById('quiz-sidebar');
    if (!quizSidebar) {
        quizSidebar = document.createElement('div');
        quizSidebar.id = 'quiz-sidebar';
        quizSidebar.classList.add('quiz-sidebar');
        mainQuizLayout.appendChild(quizSidebar);
    }

    // Bloque de Progreso
    let progressLegend = document.getElementById('progress-legend');
    if (!progressLegend) {
        progressLegend = document.createElement('div');
        progressLegend.id = 'progress-legend';
        progressLegend.className = 'progress-legend legend-block';
        quizSidebar.appendChild(progressLegend);
    }
    progressLegend.innerHTML = `
        <div class="legend-title">Progreso</div>
        <div class="legend-items">
            <span class="legend-row" style="color:#007bff;">
                <svg width='16' height='16' style='vertical-align:middle'><circle cx='8' cy='8' r='7' fill='#007bff' stroke='#0056b3' stroke-width='2'/></svg>
                <span class="legend-label">Pregunta actual</span>
            </span>
            <span class="legend-row" style="color:#28a745;">
                <svg width='16' height='16' style='vertical-align:middle'><circle cx='8' cy='8' r='7' fill='#28a745' stroke='#1a7937' stroke-width='2'/></svg>
                <span class="legend-label">Pregunta respondida</span>
            </span>
            <span class="legend-row legend-desc">Círculos: avance de preguntas</span>
        </div>
        <div id="progress-indicator" class="progress-indicator"></div>
    `;

    // Bloque de Temporizador
    let timerLegend = document.getElementById('timer-legend');
    if (!timerLegend) {
        timerLegend = document.createElement('div');
        timerLegend.id = 'timer-legend';
        timerLegend.className = 'timer-legend legend-block';
        quizSidebar.appendChild(timerLegend);
    }
    timerLegend.innerHTML = `
        <div class="legend-title">Temporizador</div>
        <div class="legend-items">
            <span class="legend-row" style="color:#28a745;">
                <svg width='16' height='16' style='vertical-align:middle'><rect x='2' y='4' width='12' height='8' rx='3' fill='#2ecc71' stroke='#1a7937' stroke-width='2'/></svg>
                <span class="legend-label">Tiempo suficiente</span>
            </span>
            <span class="legend-row" style="color:#f1c40f;">
                <svg width='16' height='16' style='vertical-align:middle'><rect x='2' y='4' width='12' height='8' rx='3' fill='#f1c40f' stroke='#996b00' stroke-width='2'/></svg>
                <span class="legend-label">Advertencia</span>
            </span>
            <span class="legend-row" style="color:#e74c3c;">
                <svg width='16' height='16' style='vertical-align:middle'><rect x='2' y='4' width='12' height='8' rx='3' fill='#e74c3c' stroke='#b32424' stroke-width='2'/></svg>
                <span class="legend-label">Últimos segundos</span>
            </span>
            <span class="legend-row legend-desc">Barra: tiempo restante por pregunta</span>
        </div>
        <div id="timer-container" class="timer-container">
            <div id="timer-bar" class="timer-bar"></div>
            <span id="time-left" class="time-left"></span>
        </div>
    `;

    let questionsContentContainer = document.getElementById('questions-content-container');
    if (!questionsContentContainer) {
        questionsContentContainer = document.createElement('div');
        questionsContentContainer.id = 'questions-content-container';
        questionsContentContainer.classList.add('quiz-main-content');
        mainQuizLayout.appendChild(questionsContentContainer);
    }
    questionsContentContainer.innerHTML = '';

    let displayedThemes = new Set();
    if (questionsArray) {
        questionsArray.forEach(question => {
            displayedThemes.add(question.tema);
        });

        for (const theme of displayedThemes) {
            const themeSection = document.createElement('div');
            themeSection.classList.add('theme-section');
            themeSection.innerHTML = `<h2>${theme}</h2>`;
            questionsContentContainer.appendChild(themeSection);
            
            const themeQuestions = questionsArray.filter(question => question.tema === theme);
            themeQuestions.forEach((question) => {
                const questionDiv = document.createElement('div');
                questionDiv.classList.add('question');
                questionDiv.innerHTML = `
                    <h3>${question.id}: ${question.pregunta}</h3>
                    ${isSimpleChoiceWithOption(question) ? displaySimpleChoice(question) : question.tipo === 'multiple' ? displayMultipleChoice(question) : displayTrueFalse(question)}
                `;
                themeSection.appendChild(questionDiv);
            });
        }
    }
    quizContainer.style.display = 'block';
    renderSidebarLegends();
}

export function updateTimerDisplay(timeLeft, totalTime) {
    const timerBar = document.getElementById('timer-bar');
    const timeLeftSpan = document.getElementById('time-left');

    if (timerBar && timeLeftSpan) {
        const percentage = (timeLeft / totalTime) * 100;
        timerBar.style.width = `${percentage}%`;
        timeLeftSpan.textContent = `${timeLeft}s`;

        if (percentage > 50) {
            timerBar.style.backgroundColor = '#2ecc71'; // Verde
        } else if (percentage > 20) {
            timerBar.style.backgroundColor = '#f1c40f'; // Amarillo
        } else {
            timerBar.style.backgroundColor = '#e74c3c'; // Rojo
        }
    }
}

export function updateProgressDisplay(currentQuestionIndex, totalQuestions) {
    const progressIndicator = document.getElementById('progress-indicator');
    if (progressIndicator) {
        progressIndicator.innerHTML = ''; // Limpiar indicadores anteriores
        for (let i = 0; i < totalQuestions; i++) {
            const dot = document.createElement('span');
            dot.classList.add('progress-dot');
            if (i < currentQuestionIndex) {
                dot.classList.add('completed');
            } else if (i === currentQuestionIndex) {
                dot.classList.add('current');
            }
            progressIndicator.appendChild(dot);
        }
    }
}

export function disableQuestionInputs(questionId) {
    const inputs = document.querySelectorAll(`input[name="question${questionId}"]`);
    inputs.forEach(input => {
        input.disabled = true;
    });
}

export function displayGeneralQuizInfo(questions) {
    let quizSidebar = document.getElementById('quiz-sidebar');
    if (quizSidebar) {
        const infoGeneralDiv = document.createElement('div');
        infoGeneralDiv.id = 'info-general-container';
        infoGeneralDiv.classList.add('info-general-card'); // Añadir una clase para estilos
        infoGeneralDiv.innerHTML = getSummary(questions);
        quizSidebar.appendChild(infoGeneralDiv);
    }
}

export function displayResultsSummary(numQuestionsConfig, themeScores, percentage, questions) {
    let summaryHTML = getSummaryHTML(numQuestionsConfig, themeScores, percentage, questions);
    const summaryDiv = document.createElement('div');
    summaryDiv.classList.add('summary-section');
    summaryDiv.innerHTML = `${summaryHTML}`;
    resultsContainer.parentNode.insertBefore(summaryDiv, resultsContainer);
}

export function displayResultsQuestions(questions, correctAnswers) {
    const groupedQuestions = {};
    questions.forEach((question, index) => {
        const isCorrect = correctAnswers[index];
        const theme = question.tema;
        if (!groupedQuestions[theme]) {
            groupedQuestions[theme] = [];
        }
        groupedQuestions[theme].push({ question, isCorrect });
    });

    for (const theme in groupedQuestions) {
        const themeSection = document.createElement('div');
        themeSection.classList.add('theme-section');
        resultsContainer.appendChild(themeSection);

        const themeHeader = document.createElement('h2');
        themeHeader.textContent = theme;
        themeSection.appendChild(themeHeader);

        groupedQuestions[theme].forEach(({ question, isCorrect }) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question');

            questionDiv.innerHTML = `
                <h3>${question.pregunta}</h3>
                ${getQuestionHTMLResults(question)}
                <p>Justificación: <div class="justification-text">${getJustification(question)}</div></p>
            `;

            themeSection.appendChild(questionDiv);
        });
    }
}
export function getSummary(questions) {
    let themeCounts = {};
    questions.forEach(question => {
        const theme = question.tema;
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    });

    let themeInfo = Object.entries(themeCounts)
        .map(([theme, count]) => `<li style="color: #3498db;">${theme}: ${count}</li>`)
        .join('');

    return `
            <h3 class="info-general-title">Información General</h3>
            <p class="info-general-text">Total de preguntas: <span class="info-general-value">${questions.length}</span></p>
            <p class="info-general-text">Preguntas por tema:</p>
            <ul class="info-general-list">${themeInfo}</ul>
        `;
}

export function isSimpleChoiceWithOption(question) {
    return question.tipo === 'simple' && question.opciones;
}

export function getUserAnswer(question) {
    if (question.tipo === 'multiple') {
        let selectedOptions = [];
        question.opciones.forEach(option => {
            if (Array.isArray(question.userAnswer) && question.userAnswer.includes(option.id)) {
                selectedOptions.push(option.texto);
            }
        });
        return selectedOptions.join(', ');
    } else {
        const selectedAnswer = question.userAnswer && question.userAnswer[0];
        if (question.tipo === 'verdadero_falso') {
            return selectedAnswer === 'true' ? 'Verdadero' : 'Falso';
        } else if (question.tipo === 'simple') {
            const option = question.opciones.find(opt => opt.id === selectedAnswer);
            return option ? option.texto : '';
        }
        return '';
    }
}

export function getCorrectAnswer(question) {
    if (question.tipo === 'multiple') {
        let correctOptions = [];
        question.opciones.forEach(option => {
            if (question.respuesta.includes(option.id)) {
                correctOptions.push(option.texto);
            }
        });
        return correctOptions.join(', ');
    } else {
        const correctAnswerId = question.respuesta && question.respuesta[0];
        if (question.tipo === 'verdadero_falso') {
            return correctAnswerId === 'verdadero' ? 'Verdadero' : 'Falso';
        } else if (question.tipo === 'simple') {
            const option = question.opciones.find(opt => opt.id === correctAnswerId);
            return option ? option.texto : '';
        }
        return '';
    }
}

export function getJustification(question) {
    if (question.tipo === 'multiple') {
        return getMultipleJustifications(question);
    } else {
        let justification = '';
        let justifications = [];
        const respuestaKey = question.respuesta && question.respuesta[0];
        if (question.justificaciones && question.justificaciones[respuestaKey]) {
            justifications.push(question.justificaciones[respuestaKey]);
        }

        justification = justifications.join(', ');
        const maxLength = 200;
        if (justification && justification.length > maxLength) {
            const shortJustification = justification.substring(0, maxLength) + '...';
            return `
                <span class="short-text">${shortJustification}</span>
                <button class="ver-mas" data-fulltext="${encodeURIComponent(justification)}">Ver más</button>
            `;
        } else {
            return `<span class="justification-text-content">${justification}</span>`;
        }
    }
}

export function getMultipleJustifications(question) {
    let justificationsHTML = '';
    const userOptions = question.userAnswer || [];
    const correctOptions = question.respuesta || [];

    // Justificaciones para las opciones seleccionadas por el usuario
    userOptions.forEach(optionId => {
        const option = question.opciones.find(opcion => opcion.id === optionId);
        if (option && question.justificaciones && question.justificaciones[optionId]) {
            const justification = question.justificaciones[optionId];
            const maxLength = 200;
            if (justification && justification.length > maxLength) {
                const shortJustification = justification.substring(0, maxLength) + '...';
                justificationsHTML += `<p><b>${option.texto}:</b> <span class="short-text">${shortJustification}</span><button class="ver-mas" data-fulltext="${encodeURIComponent(justification)}">Ver más</button></p>`;
            } else {
                justificationsHTML += `<p><b>${option.texto}:</b> <span class="justification-text-content">${justification}</span></p>`;
            }
        } else {
            justificationsHTML += `<p>No se encontró justificación para ${option ? option.texto : optionId}</p>`;
        }
    });

    // Justificación para las respuestas correctas no seleccionadas
    correctOptions.forEach(optionId => {
        if (!userOptions.includes(optionId)) {
            const option = question.opciones.find(opcion => opcion.id === optionId);
            if (option && question.justificaciones && question.justificaciones[optionId]) {
                const justification = question.justificaciones[optionId];
                const maxLength = 200;
                if (justification && justification.length > maxLength) {
                    const shortJustification = justification.substring(0, maxLength) + '...';
                    justificationsHTML += `<p><b>${option.texto} (Correcta):</b> <span class="short-text">${shortJustification}</span><button class="ver-mas" data-fulltext="${encodeURIComponent(justification)}">Ver más</button></p>`;
                } else {
                    justificationsHTML += `<p><b>${option.texto} (Correcta):</b> <span class="justification-text-content">${justification}</span></p>`;
                }
            }
        }
    });

    return justificationsHTML;
}

export function getSummaryHTML(numQuestionsConfig, themeScores, percentage, questions) {
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let themeRows = '';

    const themes = [...new Set(questions.map(question => question.tema))];
    for (const theme of themes) {
        const correct = themeScores[theme] ? themeScores[theme].correct : 0;
        const incorrect = themeScores[theme] ? themeScores[theme].incorrect : 0;
        const numQuestionsInTheme = correct + incorrect;
        const average = numQuestionsInTheme > 0 ? correct / numQuestionsInTheme : 0;

        totalCorrect += correct;
        totalIncorrect += incorrect;

        themeRows +=
            '<tr>' +
            '<td>' + theme + '</td>' +
            '<td>' + numQuestionsInTheme + '</td>' +
            '<td>' + correct + '</td>' +
            '<td>' + incorrect + '</td>' +
            '<td>' + average.toFixed(2) + '</td>' +
            '</tr>';
    }

    return `
        <h3>Resumen del Cuestionario</h3>
        <p>Puntaje total: <span class="score-percentage ${getScoreClass(percentage)}">${percentage.toFixed(2)}%</span></p>
        <p>Puntaje por tema:</p>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Tema</th>
                    <th># Preguntas</th>
                    <th>Correctas</th>
                    <th>Incorrectas</th>
                    <th>Promedio</th>
                </tr>
            </thead>
            <tbody>
                ${themeRows}
            </tbody>
        </table>
    `;
}

export function displayMultipleChoice(question) {
    let optionsHTML = '';
    question.opciones.forEach(option => {
        optionsHTML += `
            <label>
                <input type="checkbox" name="question${question.id}" value="${option.id}">
                ${option.texto}
            </label><br>
        `;
    });
    return optionsHTML + `
        <div class="question-navigation">
            <button id="next-question-button-${question.id}" class="next-question-button">Siguiente</button>
        </div>
    `;
}

export function displaySimpleChoice(question) {
    let optionsHTML = '';
    if (question.opciones) {
        question.opciones.forEach(option => {
            optionsHTML += `
                <label>
                    <input type="radio" name="question${question.id}" value="${option.id}">
                    ${option.texto}
                </label><br>
            `;
        });
    } else {
        optionsHTML += `
            <label>
                <input type="radio" name="question${question.id}" value="true">
                Verdadero
            </label><br>
            <label>
                <input type="radio" name="question${question.id}" value="false">
                Falso
            </label><br>
        `;
    }
    return optionsHTML;
}

export function displayTrueFalse(question) {
    return `
        <label>
            <input type="radio" name="question${question.id}" value="true">
            Verdadero
        </label><br>
        <label>
            <input type="radio" name="question${question.id}" value="false">
            Falso
        </label><br>
    `;
}

export function getQuestionHTML(question) {
    if (question.tipo === 'multiple') {
        return displayMultipleChoice(question);
    } else if (question.tipo === 'simple' && question.opciones) {
        return displaySimpleChoice(question);
    } else {
        return displayTrueFalse(question);
    }
}

export function displayMultipleChoiceResults(question) {
    let optionsHTML = '';
    question.opciones.forEach(option => {
        const isSelected = question.userAnswer && question.userAnswer.includes(option.id);
        const isCorrect = question.respuesta && question.respuesta.includes(option.id);
        let labelClass = '';
        if (isSelected && isCorrect) {
            labelClass = 'correct-answer';
        } else if (isSelected && !isCorrect) {
            labelClass = 'incorrect-answer';
        } else if (!isSelected && isCorrect) {
            labelClass = 'correct-answer';
        }
        optionsHTML += `
            <label class="${labelClass}">
                <input type="checkbox" name="question${question.id}" value="${option.id}" ${isSelected ? 'checked' : ''} disabled>
                ${option.texto} ${isSelected ? ' (Seleccionado)' : ''}
            </label><br>
        `;
    });
    return optionsHTML;
}

export function displaySimpleChoiceResults(question) {
    let optionsHTML = '';
    question.opciones.forEach(option => {
        const isSelected = question.userAnswer === option.id;
        const isCorrect = question.respuesta && question.respuesta[0] === option.id;
        let labelClass = '';
        if (isSelected && isCorrect) {
           labelClass = 'correct-answer';
       } else if (isSelected && !isCorrect) {
           labelClass = 'incorrect-answer';
       } else if (!isSelected && isCorrect) {
           labelClass = 'correct-answer';
       }
       optionsHTML += `
           <label class="${labelClass}">
               <input type="radio" name="question${question.id}" value="${option.id}" ${isSelected ? 'checked' : ''} disabled>
               ${option.texto} ${isSelected ? ' (Seleccionado)' : ''}
           </label><br>`;
   });
   return optionsHTML;
}

export function displayTrueFalseResults(question) {
    const isTrueSelected = question.userAnswer === 'true';
    const isFalseSelected = question.userAnswer === 'false';
    const isTrueCorrect = question.respuesta && question.respuesta[0] == 'verdadero';
    const isFalseCorrect = question.respuesta && question.respuesta[0] == 'falso';

    let trueLabelClass = isTrueSelected && isTrueCorrect ? 'correct-answer' : (isTrueSelected && !isTrueCorrect) ? 'incorrect-answer' : (!isTrueSelected && isTrueCorrect) ? 'correct-answer' : '';
    let falseLabelClass = isFalseSelected && isFalseCorrect ? 'correct-answer' : (isFalseSelected && !isFalseCorrect) ? 'incorrect-answer' : (!isFalseSelected && isFalseCorrect) ? 'correct-answer' : '';

    return `
        <label class="${trueLabelClass}">
            <input type="radio" name="question${question.id}" value="true" ${isTrueSelected ? 'checked' : ''} disabled>
            Verdadero ${isTrueSelected ? ' (Seleccionado)' : ''}
        </label><br>
        <label class="${falseLabelClass}">
            <input type="radio" name="question${question.id}" value="false" ${isFalseSelected ? 'checked' : ''} disabled>
            Falso ${isFalseSelected ? ' (Seleccionado)' : ''}
        </label><br>
    `;
}

export function getQuestionHTMLResults(question) {
    if (question.tipo === 'multiple') {
        return displayMultipleChoiceResults(question);
    } else if (question.tipo === 'simple' && question.opciones) {
        return displaySimpleChoiceResults(question);
    } else {
        return displayTrueFalseResults(question);
    }
}

function getScoreClass(percentage) {
    if (percentage >= 70) {
        return 'score-high';
    } else if (percentage >= 40) {
        return 'score-medium';
    } else {
        return 'score-low';
    }
}

// Mejorar la UI/UX del quiz-sidebar: leyendas e íconos explicativos para progreso y temporizador
export function renderSidebarLegends() {
    const quizSidebar = document.getElementById('quiz-sidebar');
    if (quizSidebar) {
        // Leyenda para el progreso
        let progressLegend = document.getElementById('progress-legend');
        if (!progressLegend) {
            progressLegend = document.createElement('div');
            progressLegend.id = 'progress-legend';
            progressLegend.className = 'progress-legend legend-block';
            progressLegend.innerHTML = `
                <div class="legend-title">Progreso</div>
                <div class="legend-items">
                    <span class="legend-row" style="color:#007bff;">
                        <svg width='16' height='16' style='vertical-align:middle'><circle cx='8' cy='8' r='7' fill='#007bff' stroke='#0056b3' stroke-width='2'/></svg>
                        <span class="legend-label">Pregunta actual</span>
                    </span>
                    <span class="legend-row" style="color:#28a745;">
                        <svg width='16' height='16' style='vertical-align:middle'><circle cx='8' cy='8' r='7' fill='#28a745' stroke='#1a7937' stroke-width='2'/></svg>
                        <span class="legend-label">Pregunta respondida</span>
                    </span>
                    <span class="legend-row legend-desc">Círculos: avance de preguntas</span>
                </div>
            `;
            const progressIndicator = document.getElementById('progress-indicator');
            if (progressIndicator) {
                progressIndicator.parentNode.insertBefore(progressLegend, progressIndicator.nextSibling);
            } else {
                quizSidebar.appendChild(progressLegend);
            }
        }
        // Leyenda para el temporizador
        let timerLegend = document.getElementById('timer-legend');
        if (!timerLegend) {
            timerLegend = document.createElement('div');
            timerLegend.id = 'timer-legend';
            timerLegend.className = 'timer-legend legend-block';
            timerLegend.innerHTML = `
                <div class="legend-title">Temporizador</div>
                <div class="legend-items">
                    <span class="legend-row" style="color:#28a745;">
                        <svg width='16' height='16' style='vertical-align:middle'><rect x='2' y='4' width='12' height='8' rx='3' fill='#2ecc71' stroke='#1a7937' stroke-width='2'/></svg>
                        <span class="legend-label">Tiempo suficiente</span>
                    </span>
                    <span class="legend-row" style="color:#f1c40f;">
                        <svg width='16' height='16' style='vertical-align:middle'><rect x='2' y='4' width='12' height='8' rx='3' fill='#f1c40f' stroke='#996b00' stroke-width='2'/></svg>
                        <span class="legend-label">Advertencia</span>
                    </span>
                    <span class="legend-row" style="color:#e74c3c;">
                        <svg width='16' height='16' style='vertical-align:middle'><rect x='2' y='4' width='12' height='8' rx='3' fill='#e74c3c' stroke='#b32424' stroke-width='2'/></svg>
                        <span class="legend-label">Últimos segundos</span>
                    </span>
                    <span class="legend-row legend-desc">Barra: tiempo restante por pregunta</span>
                </div>
            `;
            const timerContainer = document.querySelector('.timer-container');
            if (timerContainer) {
                timerContainer.parentNode.insertBefore(timerLegend, timerContainer.nextSibling);
            } else {
                quizSidebar.appendChild(timerLegend);
            }
        }
    }
}

export function showQuiz() {
    document.body.classList.add('quiz-active');
}

export function hideQuiz() {
    document.body.classList.remove('quiz-active');
}