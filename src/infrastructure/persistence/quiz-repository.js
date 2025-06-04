export async function fetchConfig() {
    const configResponse = await fetch('config.json');
    if (!configResponse.ok) {
        throw new Error(`HTTP error! status: ${configResponse.status}`);
    }
    return await configResponse.json();
}

export async function fetchQuestions() {
    const questionsResponse = await fetch('cuestionario.json');
    if (!questionsResponse.ok) {
        throw new Error(`HTTP error! status: ${questionsResponse.status}`);
    }
    return await questionsResponse.json();
}