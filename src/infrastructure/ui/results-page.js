import { resultsContainer } from './dom-elements.js';
import { loadResultsData } from '../../infrastructure/persistence/session-storage.js';
import { displayResultsSummary, displayResultsQuestions } from './quiz-renderer.js';
import { generatePDF } from '../utils/pdf-generator.js'; // Importar generatePDF

document.addEventListener('DOMContentLoaded', () => {
    const resultsData = loadResultsData();

    if (resultsData) {
        const { questionsArray, correctAnswers, numQuestionsConfig, themeScores } = resultsData;

        if (questionsArray && correctAnswers && numQuestionsConfig && themeScores) {
            const correctCount = correctAnswers.filter(answer => answer === true).length;
            const percentage = (correctCount / questionsArray.length) * 100;

            displayResultsSummary(numQuestionsConfig, themeScores, percentage, questionsArray);
            displayResultsQuestions(questionsArray, correctAnswers);
        } else {
            resultsContainer.innerHTML = '<p>No se encontraron resultados.</p>';
        }
    } else {
        resultsContainer.innerHTML = '<p>No se encontraron resultados.</p>';
    }

    const downloadPdfButton = document.getElementById('download-pdf-button');
    if (downloadPdfButton) {
        downloadPdfButton.addEventListener('click', () => {
            const { questionsArray, correctAnswers, numQuestionsConfig, themeScores } = resultsData;
            const nombre = sessionStorage.getItem('nombre');
            const identificacion = sessionStorage.getItem('identificacion');
            const correctCount = correctAnswers.filter(answer => answer === true).length;
            const percentage = (correctCount / questionsArray.length) * 100;
            generatePDF(questionsArray, correctAnswers, nombre, identificacion, percentage, numQuestionsConfig, themeScores);
        });
    }

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('ver-mas')) {
            const button = event.target;
            const fullText = decodeURIComponent(button.dataset.fulltext);
            const shortTextElement = button.parentNode.querySelector('.short-text');
            if (shortTextElement) {
                shortTextElement.textContent = fullText;
            }
            button.style.display = 'none';
        }
    });
});