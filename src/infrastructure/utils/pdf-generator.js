export async function generatePDF(questionsArray, correctAnswers, nombre, identificacion, percentage, numQuestionsConfig, themeScores) {
    const { jsPDF } = window.jspdf;
    // Leer configuración de colores desde config.json
    let scoreColors = {
        green: { min: 80, color: [39, 174, 96] },
        yellow: { min: 50, color: [241, 196, 15] },
        red: { min: 0, color: [231, 76, 60] }
    };
    try {
        const configResp = await fetch('config.json');
        if (configResp.ok) {
            const config = await configResp.json();
            if (config.scoreColors) scoreColors = config.scoreColors;
        }
    } catch (e) { /* Si falla, usar valores por defecto */ }

    const doc = new jsPDF();
    const margin = 30; // Aumentar el margen general para más espacio
    const lineHeight = 8; // Aumentar el espaciado entre líneas
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - 2 * margin; // Se recalculará con el nuevo margen
    let y = 0; // Menor para dejar espacio para el header
    let logoImgData = null;

    // Cargar logo una vez
    try {
        const logoUrl = 'img/logo/logo.png';
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        logoImgData = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) { logoImgData = null; }

    // Banner compacto y profesional en todas las páginas
    function drawBanner(doc) {
        const bannerHeight = 28;
        // Fondo banner
        doc.setFillColor(235, 245, 255); // Azul muy claro
        doc.rect(0, 0, pageWidth, bannerHeight, 'F');
        // Logo a la izquierda
        if (logoImgData) {
            doc.addImage(logoImgData, 'PNG', margin, 2, 22, 22);
        }
        // Título y subtítulo alineados horizontalmente
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(0, 123, 255);
        doc.text('Kuiz', pageWidth / 2 + 10, 13, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(44, 62, 80);
        doc.text('Resultados', pageWidth / 2 + 10, 21, { align: 'center' });
        // Línea divisoria sutil
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.5);
        doc.line(margin, bannerHeight, pageWidth - margin, bannerHeight);
    }

    // Dibujar banner en la primera página
    drawBanner(doc);
    y = 34; // Actualizar valor de y tras el banner

    // Configuración de fuente y tamaño
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Añadir metadatos al documento
    doc.setProperties({
        title: `Resultados Quiz - ${nombre}`,
        subject: `Resultados del Quiz para ${nombre} (${identificacion})`,
        author: 'Kuiz',
        keywords: `quiz, kuiz, ${nombre}, ${identificacion}, resultados`,
        creator: 'Kuiz'
    });

    // Bloque de datos personales compacto
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(44, 62, 80);
    doc.text(`Nombre: ${nombre}`, margin, y);
    y += 6;
    doc.text(`Identificación: ${identificacion}`, margin, y);
    y += 10;

    // Resumen del cuestionario destacado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('Resumen del Cuestionario', margin, y);
    y += 7;

    // Puntaje total con diseño semáforo configurable
    let colorSemaforo;
    if (percentage >= scoreColors.green.min) {
        colorSemaforo = scoreColors.green.color;
    } else if (percentage >= scoreColors.yellow.min) {
        colorSemaforo = scoreColors.yellow.color;
    } else {
        colorSemaforo = scoreColors.red.color;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...colorSemaforo);
    doc.text(`Puntaje total: ${percentage.toFixed(2)}%`, margin, y);
    y += 10;
    doc.setTextColor(44, 62, 80); // Resetear color texto

    // Título de la tabla
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text('Puntaje por tema:', margin, y);
    y += 8;

    // Definir colores modernos
    const headerBgColor = [41, 128, 185]; // Azul moderno
    const headerTextColor = [255, 255, 255]; // Blanco
    const evenRowColor = [236, 240, 241]; // Gris claro
    const oddRowColor = [255, 255, 255]; // Blanco
    const correctColor = [39, 174, 96]; // Verde
    const incorrectColor = [231, 76, 60]; // Rojo
    const averageColor = [241, 196, 15]; // Amarillo

    const themes = Object.keys(themeScores);
    const colWidth = contentWidth / 5;
    const rowHeight = lineHeight * 1.5;

    // Encabezados de la tabla
    doc.setFillColor(...headerBgColor);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setTextColor(...headerTextColor);
    doc.setFontSize(11);
    doc.text("Tema", margin + colWidth * 0 + colWidth / 2, y + rowHeight / 2 + 2, { align: 'center' });
    doc.text("# Preguntas", margin + colWidth * 1 + colWidth / 2, y + rowHeight / 2 + 2, { align: 'center' });
    doc.text("Correctas", margin + colWidth * 2 + colWidth / 2, y + rowHeight / 2 + 2, { align: 'center' });
    doc.text("Incorrectas", margin + colWidth * 3 + colWidth / 2, y + rowHeight / 2 + 2, { align: 'center' });
    doc.text("Promedio", margin + colWidth * 4 + colWidth / 2, y + rowHeight / 2 + 2, { align: 'center' });
    y += rowHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    themes.forEach((theme, idx) => {
        const correct = themeScores[theme] ? themeScores[theme].correct : 0;
        const incorrect = themeScores[theme] ? themeScores[theme].incorrect : 0;
        const numQuestionsInTheme = correct + incorrect;
        const average = numQuestionsInTheme > 0 ? (correct / numQuestionsInTheme * 100).toFixed(2) : '0.00';
        // Alternar color de fila
        if ((idx % 2) === 0) {
            doc.setFillColor(...evenRowColor);
        } else {
            doc.setFillColor(...oddRowColor);
        }
        doc.rect(margin, y, contentWidth, rowHeight, 'F');
        doc.setTextColor(44, 62, 80); // Gris oscuro para texto
        // Tema
        doc.text(theme, margin + colWidth * 0 + colWidth / 2, y + rowHeight / 2 + 2, { align: 'center' });
        // # Preguntas
        doc.text(numQuestionsInTheme.toString(), margin + colWidth * 1 + colWidth / 2, y + rowHeight / 2 + 2, { align: 'center' });
        // Correctas
        doc.setTextColor(...correctColor);
        doc.text(correct.toString(), margin + colWidth * 2 + colWidth / 2, y + rowHeight / 2 + 2, { align: 'center' });
        // Incorrectas
        doc.setTextColor(...incorrectColor);
        doc.text(incorrect.toString(), margin + colWidth * 3 + colWidth / 2, y + rowHeight / 2 + 2, { align: 'center' });
        // Promedio con color semáforo configurable
        let avgNum = parseFloat(average);
        let avgColor;
        if (avgNum >= scoreColors.green.min) {
            avgColor = scoreColors.green.color; // Verde
        } else if (avgNum >= scoreColors.yellow.min) {
            avgColor = scoreColors.yellow.color; // Amarillo
        } else {
            avgColor = scoreColors.red.color; // Rojo
        }
        doc.setTextColor(...avgColor);
        doc.text(`${average}%`, margin + colWidth * 4 + colWidth / 2, y + rowHeight / 2 + 2, { align: 'center' });
        y += rowHeight;
        doc.setTextColor(44, 62, 80); // Resetear color para la siguiente fila
    });
    y += lineHeight * 2; // Espacio después de la tabla

    // Iterar sobre cada pregunta
    questionsArray.forEach((question, index) => {
        // Contenido de la pregunta
        let questionText = `${question.id}: ${decodeURIComponent(question.pregunta)}`;
        let questionLines = doc.splitTextToSize(questionText, contentWidth - 10); // Reducir el ancho para la pregunta
        let questionHeight = questionLines.length * lineHeight;

        // Contenido de las opciones
        let optionsContent = [];
        let optionsHeight = 0;

        // Helper function to get option text and color
        const getOptionDisplay = (option, isSelected, isCorrectOption) => {
            let prefix = '( )';
            let optionColor = [0, 0, 0]; // Negro por defecto

            if (isSelected && isCorrectOption) {
                prefix = '(x)'; // Marcador para respuesta correcta seleccionada
                optionColor = [40, 167, 69]; // Verde
            } else if (isSelected && !isCorrectOption) {
                prefix = '(x)'; // Marcador para respuesta incorrecta seleccionada
                optionColor = [220, 53, 69]; // Rojo
            } else if (!isSelected && isCorrectOption) {
                prefix = '( )'; // Marcador para respuesta correcta no seleccionada
                optionColor = [40, 167, 69]; // Verde
            }
            let optionLine = `${prefix} ${decodeURIComponent(option.texto)}`;
            let lines = doc.splitTextToSize(optionLine, contentWidth - 40); // Reducir aún más el ancho para las opciones
            return { text: lines, color: optionColor };
        };

        if (question.tipo === 'simple' || question.tipo === 'multiple') {
            if (question.opciones && Array.isArray(question.opciones)) {
                question.opciones.forEach(option => {
                    const isSelected = question.userAnswer && (Array.isArray(question.userAnswer) ? question.userAnswer.includes(option.id) : question.userAnswer === option.id);
                    const isCorrectOption = question.respuesta && (Array.isArray(question.respuesta) ? question.respuesta.includes(option.id) : question.respuesta === option.id);
                    
                    const optionDisplay = getOptionDisplay(option, isSelected, isCorrectOption);
                    optionsContent.push(optionDisplay);
                    optionsHeight += optionDisplay.text.length * lineHeight;
                });
            }
        } else if (question.tipo === 'verdadero_falso') {
            const trueOption = { id: 'true', texto: 'Verdadero' };
            const falseOption = { id: 'false', texto: 'Falso' };

            const isTrueSelected = question.userAnswer === 'true';
            const isFalseSelected = question.userAnswer === 'false';
            const isTrueCorrect = question.respuesta && question.respuesta[0] == 'verdadero';
            const isFalseCorrect = question.respuesta && question.respuesta[0] == 'falso';

            const trueDisplay = getOptionDisplay(trueOption, isTrueSelected, isTrueCorrect);
            const falseDisplay = getOptionDisplay(falseOption, isFalseSelected, isFalseCorrect);

            optionsContent.push(trueDisplay);
            optionsContent.push(falseDisplay);
            optionsHeight += (trueDisplay.text.length + falseDisplay.text.length) * lineHeight;
        }

        // Contenido de la justificación
        let rawJustification = '';
        const respuestaKey = question.respuesta && question.respuesta[0];
        if (question.justificaciones && question.justificaciones[respuestaKey]) {
            rawJustification = question.justificaciones[respuestaKey];
        }
        // Decode URI component just in case, and remove any remaining HTML tags
        let cleanJustification = decodeURIComponent(rawJustification).replace(/<[^>]*>?/gm, '');
        let justificationText = `Justificación: ${cleanJustification || 'No disponible'}`;
        let justificationLines = doc.splitTextToSize(justificationText, contentWidth - 10); // Reducir el ancho para la justificación
        let justificationHeight = justificationLines.length * lineHeight;

        let totalHeight = questionHeight + optionsHeight + justificationHeight + lineHeight * 3; // Espacio extra

        // Si no hay suficiente espacio, añadir una nueva página
        if (y + totalHeight > pageHeight - margin) {
            doc.addPage();
            drawBanner(doc);
            y = 34; // Resetear Y para la nueva página
        }

        // Añadir la pregunta
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(questionLines, margin, y);
        y += questionHeight;

        // Añadir las opciones
        doc.setFont("helvetica", "normal");
        optionsContent.forEach(option => {
            doc.setTextColor(option.color[0], option.color[1], option.color[2]);
            doc.text(option.text, margin + 15, y); // Ajustar la indentación para que coincida con el nuevo ancho
            y += option.text.length * lineHeight;
        });
        doc.setTextColor(0, 0, 0); // Resetear color a negro

        // Añadir justificación
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(justificationLines, margin, y);
        y += justificationHeight;
        y += lineHeight * 2; // Espacio extra entre preguntas
    });

    // Añadir la información de firma, nombre e identificación al final
    // Si el contenido final excede la página actual, añadir una nueva página
    let finalInfoHeight = lineHeight * 4; // Estimación para firma, nombre, identificación
    if (y + finalInfoHeight > pageHeight - margin) {
        doc.addPage();
        drawBanner(doc);
        y = 34;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Firma: _____________________________", margin, y);
    y += lineHeight;
    doc.text(`Nombre: ${nombre}`, margin, y);
    y += lineHeight;
    doc.text(`Identificación: ${identificacion}`, margin, y);
    y += lineHeight * 2;

    // Añadir pie de página en todas las páginas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawBanner(doc);
        // Pie de página (opcional):
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`${nombre} (${identificacion}) - Página ${i} de ${totalPages}`, margin, pageHeight - 10);
    }

    // Guardar el PDF
    doc.save(`Resultados_${nombre}.pdf`);
}