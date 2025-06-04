import { handleSubmitQuiz } from './application/quiz-service.js';
document.addEventListener('DOMContentLoaded', () => {
    // Asegurarse de que el input-container esté visible al cargar la página
    const inputContainer = document.getElementById('input-container');
    if (inputContainer) {
        inputContainer.style.display = 'block';
    }

    const submitButton = document.getElementById('submit-button');

    if (submitButton) {
        submitButton.addEventListener('click', handleSubmitQuiz);
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