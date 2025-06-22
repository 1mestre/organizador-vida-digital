
// Firebase Configuration - IMPORTANT: Replace with your actual Firebase config details
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA61k7ZCvUSVWb6lFJUyO57cE08a3JsSe4", // NEW from user image
  authDomain: "organizador-vida-digital.firebaseapp.com", // NEW from user image
  projectId: "organizador-vida-digital", // NEW from user image
  storageBucket: "organizador-vida-digital.firebasestorage.app", // NEW from user image
  messagingSenderId: "80696081894", // NEW from user image
  appId: "1:80696081894:web:e38b6ba1807f024e2daa27", // NEW from user image
  measurementId: "G-G7QRG2BWJR" // NEW from user image
};

export const FIRESTORE_COLLECTION_PATH = 'organizador-publico';
export const FIRESTORE_DOC_PATH = 'datos-compartidos';

export const DEFAULT_OVERALL_TARGET_COP = 3500000;
export const EXCHANGE_RATE_API_URL_ERAPI = 'https://open.er-api.com/v6/latest/USD';
export const FALLBACK_EXCHANGE_RATE = 4000; // Fallback COP per USD
export const FIXED_FEE_USD = 3; // Fixed transaction fee in USD
export const PERCENTAGE_FEE = 0.03; // 3% percentage fee
export const MIN_USD_INPUT_FOR_NET_CALC = FIXED_FEE_USD + 0.01;

export const TIMETABLE_START_HOUR = 5; // 5 AM
export const TIMETABLE_END_HOUR = 23;  // 11 PM
export const TIMETABLE_DAYS = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];

export const PRESET_EVENT_COLORS = [
    { name: "Rosa Suave", value: "#FFB6C1" }, { name: "Melocotón", value: "#FFDAB9" },
    { name: "Amarillo Claro", value: "#FFFFE0" }, { name: "Menta", value: "#98FB98" },
    { name: "Cielo", value: "#ADD8E6" }, { name: "Lavanda", value: "#E6E6FA" },
    { name: "Gris Perla", value: "#D3D3D3" }, { name: "Beige Arenoso", value: "#F5F5DC" },
    { name: "Verde Mar", value: "#AFEEEE" },   
    { name: "Salmón Claro", value: "#FFA07A" }
];
export const DEFAULT_EVENT_COLOR = PRESET_EVENT_COLORS[0].value;


export const FLOATING_EMOJIS_LIST = ["💰", "🎓", "📅", "✨", "🚀", "🏆", "📈", "🎯", "💡", "📚"];

// Productivity Page Content - Derived from the provided JSON
export const PRODUCTIVITY_CONTENT = {
  primaryObjective: "Consolidar mi presencia como productor freelancer, avanzar en mis estudios de Administración, y dedicar tiempo a mis proyectos artísticos y de IA musical.",
  keyInsight: "Mi principio rector es la búsqueda de la autonomía y la eficiencia creativa. Priorizo generar ingresos a través de proyectos y en entornos que me brinden tranquilidad y control, evitando situaciones de alta fricción. Valoro la creatividad por encima de todo y reconozco que mi mejor versión emerge de la práctica constante, por lo que aspiro a recuperar el hábito diario de crear música.",
  initialTasks: [
    { id: 'task1', text: "Mejorar perfil/gigs en Fiverr.", time: "1.5h", result: "Perfil actualizado o 1 nuevo gig borrador." },
    { id: 'task2', text: "Estudiar material de Administración de Empresas (Cap. X).", time: "1h", result: "Resumen de conceptos clave." },
    { id: 'task3', text: "Trabajar en proyecto musical personal (composición/producción).", time: "1h", result: "Avance en una canción/idea." },
    { id: 'task4', text: "Investigar/Desarrollar herramienta IA para música.", time: "1h", result: "Documentar 1 nueva técnica o prototipo simple." },
    { id: 'task5', text: "Aplicar enfoque sistemático a la gestión de clientes (revisar plantillas Notion).", time: "30min", result: "Plantillas de comunicación optimizadas." }
  ],
  antiProcrastinationTactic: "Utiliza la técnica Pomodoro (integrada abajo) y enfócate en una sola tarea durante cada bloque de trabajo. ¡Empieza por la más desafiante!",
  // whatToAvoid: "Evita la multitarea excesiva y las distracciones de redes sociales durante tus bloques de enfoque. No te desanimes por la perfección, busca el progreso.", // Replaced by DAILY_AVOIDANCE_TIPS
};

export const DAILY_AVOIDANCE_TIPS = [
  "No cedas a la tentación de revisar redes sociales o emails fuera de los descansos programados. Mantén el enfoque en tu producción musical o estudio.",
  "Evita empezar el día sin un plan claro. Define tus 2-3 tareas más importantes de freelance o estudio y atácalas primero.",
  "No te estanques en la perfección al inicio de un proyecto creativo musical. Prioriza el flujo y la generación de ideas; pule después.",
  "Evita el 'research rabbit hole' con IA. Fija un tiempo límite para investigar y luego pasa a la aplicación o desarrollo.",
  "No ignores la importancia de las plantillas y sistemas en Notion para clientes. La eficiencia hoy te da más tiempo creativo mañana.",
  "Evita saltarte los descansos del Pomodoro. Tu cerebro necesita reinicios para mantener la calidad en la mezcla o el aprendizaje de administración.",
  "No dejes que el miedo a no saber cómo hacer algo en producción o IA te paralice. Divide el problema y busca soluciones específicas y pragmáticas."
];

export const AMBIANCE_SOUNDS = {
  binaural: 'Beats Binaurales',
  white: 'Ruido Blanco',
  brown: 'Ruido Marrón',
  rain: 'Lluvia',
  ocean: 'Océano',
};

export const AMBIANCE_AUDIO_URLS = {
    rain: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    ocean: 'https://actions.google.com/sounds/v1/weather/ocean_waves.ogg',
    alarm: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
};
