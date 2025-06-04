export function groupQuestionsByTheme(questions) {
    const groupedQuestions = {};
    questions.forEach(question => {
        if (!groupedQuestions[question.tema]) {
            groupedQuestions[question.tema] = [];
        }
        groupedQuestions[question.tema].push(question);
    });
    return groupedQuestions;
}

export function selectRandomQuestions(questions, numQuestionsConfig) {
    // Agrupar preguntas por tema
    const grouped = groupQuestionsByTheme(questions);
    const temas = Object.keys(grouped);
    let seleccionadas = [];
    let restantes = [];

    // 1. Seleccionar al menos una pregunta al azar de cada tema (si hay suficientes preguntas)
    temas.forEach(tema => {
        if (grouped[tema].length > 0) {
            const idx = Math.floor(Math.random() * grouped[tema].length);
            seleccionadas.push(grouped[tema][idx]);
            // Quitar la seleccionada del grupo para evitar duplicados
            restantes = restantes.concat(grouped[tema].filter((_, i) => i !== idx));
        }
    });

    // 2. Si aún faltan preguntas, completar de forma aleatoria con el resto
    if (seleccionadas.length < numQuestionsConfig) {
        // Mezclar las restantes
        for (let i = restantes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [restantes[i], restantes[j]] = [restantes[j], restantes[i]];
        }
        seleccionadas = seleccionadas.concat(restantes.slice(0, numQuestionsConfig - seleccionadas.length));
    }

    // 3. Si hay más de las necesarias (más temas que preguntas), recortar
    return seleccionadas.slice(0, numQuestionsConfig);
}

export function calculateThemeScores(questions, correctAnswers) {
    let themeScores = {};

    questions.forEach((question, index) => {
        const theme = question.tema;
        if (!themeScores[theme]) {
            themeScores[theme] = {
                correct: 0,
                incorrect: 0
            };
        }
        if (correctAnswers[index]) {
            themeScores[theme].correct++;
        } else {
            themeScores[theme].incorrect++;
        }
    });

    return themeScores;
}