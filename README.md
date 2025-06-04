# Proyecto Quiz - Sistema de Cuestionarios Interactivo

Este proyecto implementa un sistema de cuestionarios interactivo, diseñado bajo los principios de la Arquitectura Hexagonal (también conocida como Puertos y Adaptadores). Este diseño busca mejorar la mantenibilidad, la escalabilidad y la testabilidad del código, desacoplando la lógica de negocio central de las preocupaciones de infraestructura y presentación.

## 🚀 Arquitectura del Proyecto: Hexagonal (Puertos y Adaptadores)

El proyecto está diseñado siguiendo los principios de la Arquitectura Hexagonal, que se enfoca en aislar la lógica de negocio central de las dependencias externas (como la interfaz de usuario, bases de datos o servicios externos). Esto se logra mediante la definición de "puertos" (interfaces) que la aplicación expone para interactuar con el exterior, y "adaptadores" que implementan estos puertos para tecnologías específicas.

Las capas principales de esta arquitectura son:

1. **Dominio (Core de la Aplicación):** Contiene la lógica de negocio pura y las entidades del quiz. Es el "interior" del hexágono y es completamente agnóstico a la tecnología.

   **Ejemplo (`src/domain/quiz-state.js`):**

   ```javascript
   export const quizState = {
       questionsArray: [],
       correctAnswers: [],
       numQuestionsConfig: 0,
       themeScores: {},
       currentQuestionIndex: 0,
       currentQuestionTimeLeft: 0,
       timerIntervalId: null,
       questionTimeLimit: 0,
       timerDisplayType: '',
       timeExpiredBehavior: ''
   };

   export function setQuestionsArray(questions) {
       quizState.questionsArray = questions;
   }
   ```

   Esta capa define el estado fundamental del quiz y las operaciones básicas sobre él, sin preocuparse de cómo se obtienen los datos o cómo se muestran.

2. **Aplicación (Casos de Uso):** Define los casos de uso de la aplicación, orquestando las interacciones con el dominio y los adaptadores.

   **Ejemplo (`src/application/quiz-service.js`):**

   ```javascript
   import { quizState, setQuestionsArray, setCorrectAnswers, setNumQuestionsConfig, setThemeScores, setCurrentQuestionTimeLeft, setTimerIntervalId, setQuestionTimeLimit, setTimerDisplayType, setTimeExpiredBehavior, setCurrentQuestionIndex } from '../domain/quiz-state.js';
   import { fetchConfig, fetchQuestions } from '../infrastructure/persistence/quiz-repository.js';
   import { saveQuizProgress, loadQuizProgress, saveResultsData } from '../infrastructure/persistence/session-storage.js';
   import { displayQuestions, displayGeneralQuizInfo, updateTimerDisplay, updateProgressDisplay, disableQuestionInputs } from '../infrastructure/ui/quiz-renderer.js';
   import { selectRandomQuestions, calculateThemeScores } from '../domain/quiz-utils.js';
   import { submitButton } from '../infrastructure/ui/dom-elements.js';

   export async function initializeQuiz() {
       // ... lógica de inicialización que usa el dominio y adaptadores ...
       const config = await fetchConfig(); // Usa un adaptador de persistencia
       setNumQuestionsConfig(config.numQuestions); // Usa una función del dominio
       // ...
   }
   ```

   Esta capa coordina las acciones, como inicializar el quiz, manejar las respuestas y calcular los resultados, utilizando las funciones del dominio y los adaptadores de infraestructura.

3. **Infraestructura (Adaptadores):** Contiene las implementaciones de los puertos, adaptando las tecnologías externas al dominio. Esto incluye la UI, la persistencia de datos y utilidades externas.

   **Ejemplo de Adaptador de Persistencia (`src/infrastructure/persistence/quiz-repository.js`):**

   ```javascript
   export async function fetchConfig() {
       const configResponse = await fetch('config.json');
       if (!configResponse.ok) {
           throw new Error(`HTTP error! status: ${configResponse.status}`);
       }
       return await configResponse.json();
   }
   ```

   **Ejemplo de Adaptador de UI (`src/infrastructure/ui/dom-elements.js`):**

   ```javascript
   export const quizContainer = document.getElementById('quiz-container');
   export const submitButton = document.getElementById('submit-button');
   ```

   Estos adaptadores se encargan de la interacción con el DOM, la obtención de datos de archivos JSON, o cualquier otra interacción con el "mundo exterior" de la aplicación.

## 📁 Estructura del Proyecto

La organización del código sigue la estructura de directorios que refleja las capas de la arquitectura hexagonal:

```
.
├── index.html
├── results.html
├── style.css
├── config.json
├── cuestionario.json
├── components/
│   ├── footer.html
│   ├── header.html
│   └── input-form.html
└── src/
    ├── application/
    │   └── quiz-service.js             # Lógica de negocio principal (casos de uso)
    ├── domain/
    │   ├── quiz-state.js               # Estado central del quiz y sus mutadores
    │   └── quiz-utils.js               # Utilidades de dominio (agnósticas a la UI/infraestructura)
    └── infrastructure/
        ├── persistence/
        │   ├── quiz-repository.js      # Adaptador para la obtención de configuración y preguntas (fetch API)
        │   └── session-storage.js      # Adaptador para la persistencia de datos en sessionStorage
        ├── ui/
        │   ├── dom-elements.js         # Adaptador para la interacción directa con el DOM
        │   ├── quiz-renderer.js        # Adaptador para la presentación de la UI del quiz y utilidades de renderizado
        │   └── results-page.js         # Lógica específica de la página de resultados (adaptador UI)
        └── utils/
            └── pdf-generator.js        # Adaptador para la generación de documentos PDF
    └── main.js                         # Punto de entrada y orquestación de la aplicación
```

## ⚙️ Configuración del sistema (`config.json`)

El comportamiento del sistema de cuestionarios se controla mediante el archivo `config.json` ubicado en la raíz del proyecto. Este archivo permite personalizar aspectos clave del funcionamiento del quiz sin modificar el código fuente. A continuación se describen los parámetros disponibles:

```json
{
  "numQuestions": 20,
  "questionTimeLimit": 30,
  "timerDisplayType": "horizontal",
  "timeExpiredBehavior": "markIncorrectAndAllowContinue",
  "scoreColors": {
    "green": { "min": 70, "color": [39, 174, 96] },
    "yellow": { "min": 50, "color": [241, 196, 15] },
    "red": { "min": 0, "color": [231, 76, 60] }
  }
}
```

- **numQuestions**: Número de preguntas que se mostrarán en cada intento de cuestionario.
- **questionTimeLimit**: Tiempo límite (en segundos) para responder cada pregunta. Si se agota, se aplica el comportamiento definido en `timeExpiredBehavior`.
- **timerDisplayType**: Forma de mostrar el temporizador. Por ejemplo, `horizontal` para barra de progreso.
- **timeExpiredBehavior**: Qué ocurre al expirar el tiempo de una pregunta. Valor recomendado: `markIncorrectAndAllowContinue` (marca la pregunta como incorrecta pero permite seguir respondiendo).
- **scoreColors**: Define los colores asociados a los rangos de calificación en los resultados. Cada color tiene un valor mínimo (`min`) y un color RGB.

Puedes modificar estos valores para adaptar la experiencia del quiz a tus necesidades. Los cambios se aplican automáticamente al recargar la página.

## 🛠️ Tecnologías Utilizadas

* **HTML5:** Estructura de las páginas web.
* **CSS3:** Estilos y presentación.
* **JavaScript (ES Modules):** Lógica del lado del cliente y la implementación de la arquitectura hexagonal.
* **Fetch API:** Para la carga asíncrona de datos (configuración y preguntas).
* **jsPDF (via CDN):** Para la generación de documentos PDF.

## 🚀 Cómo Ejecutar el Proyecto

Para ejecutar este proyecto localmente, se recomienda utilizar un servidor web simple debido a las restricciones de seguridad del navegador (CORS) al cargar archivos locales, especialmente cuando se utiliza `fetch` para obtener `config.json` y `cuestionario.json`.

Puedes usar el servidor HTTP incorporado de Python:

```bash
# Navega a la raíz del proyecto
cd c:/Users/cfcg070314/git/automatizacion/sri-quiz

# Inicia el servidor HTTP en el puerto 8000 (o cualquier otro puerto disponible)
python -m http.server 8000
```

Una vez que el servidor esté en ejecución, abre tu navegador y navega a `http://localhost:8000/index.html`.

## ⚙️ Scripts de Utilidad

Este proyecto incluye scripts para tareas de mantenimiento y desarrollo:

* **`scripts/eliminar_duplicados_preguntas.js`**: Este script se utiliza para limpiar los archivos de cuestionario, eliminando preguntas duplicadas basadas en su contenido. Es útil para mantener la integridad y calidad de los datos del cuestionario.

   Para ejecutarlo, usa Node.js:

   ```bash
   node scripts/eliminar_duplicados_preguntas.js
   ```

* **`scripts/encriptar_cuestionario.js`**: Este script encripta el archivo `cuestionario.json` para proteger la información sensible de las preguntas y respuestas.

   Para ejecutarlo, usa Node.js:

   ```bash
   node scripts/encriptar_cuestionario.js
   ```

## 🧠 Contribución y Mantenimiento

La arquitectura hexagonal facilita la contribución y el mantenimiento al:

* **Aislar la lógica de negocio:** Los cambios en la UI o la persistencia no afectan el dominio.
* **Facilitar las pruebas:** Las unidades de dominio y aplicación pueden ser probadas de forma aislada, sin dependencias de infraestructura.
* **Promover la intercambiabilidad:** Los adaptadores pueden ser reemplazados fácilmente (ej. cambiar `sessionStorage` por una base de datos real) sin modificar el core de la aplicación.

---

## ✨ Características Clave

El sistema de cuestionarios ofrece las siguientes funcionalidades y características:

* **Cuestionarios Dinámicos:** Presentación de preguntas de opción múltiple y verdadero/falso, con lógica para la captura y evaluación automática de respuestas.
* **Gestión de Progreso:** Permite a los usuarios guardar y retomar su progreso en el cuestionario durante la sesión, utilizando `SessionStorage`.
* **Generación de Informes PDF:** Capacidad de generar informes detallados de los resultados del cuestionario en formato PDF, incluyendo información del participante en cada página y en el nombre del archivo para una trazabilidad clara.
* **Temporizador por Pregunta:** Cada pregunta cuenta con un temporizador configurable (60 segundos por defecto) visualizado mediante una barra de progreso horizontal. Al agotarse el tiempo, la pregunta se marca como incorrecta, pero el usuario puede seguir interactuando.
* **Indicador de Progreso:** Un sistema visual de puntos/círculos muestra el avance del usuario a lo largo del cuestionario.
* **Interfaz de Usuario Optimizada (UX/UI):** Diseño responsivo y optimizado para asegurar que las preguntas sean visibles sin necesidad de scroll. La información general y los elementos de progreso/temporizador se presentan de forma lateral en pantallas de escritorio para maximizar el espacio de la pregunta, adaptándose a una disposición vertical en dispositivos móviles. Se han aplicado ajustes de estilo para una experiencia intuitiva, atractiva y accesible.
* **Seguridad de Datos:** Las preguntas y respuestas del cuestionario se almacenan de forma segura mediante encriptación (AES) para proteger la información sensible.

---

_Este proyecto fue generado inicialmente con RooCoder y ha sido mejorado, optimizado y ampliado posteriormente con la asistencia de GitHub Copilot para lograr una mayor calidad, mantenibilidad y experiencia de usuario._
