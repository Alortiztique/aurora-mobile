import type { RejectionScenario, ResetScenario } from "./types";

export const RESET_SCENARIOS: readonly ResetScenario[] = [
  {
    id: "doomscrolling",
    label: { en: "I cannot stop scrolling", es: "No puedo dejar de deslizar" },
    validation: {
      en: "You noticed the loop. That is already a moment of choice.",
      es: "Notaste el ciclo. Eso ya abre un momento para elegir.",
    },
    reflection: {
      en: "What did you hope the next post would give you?",
      es: "¿Qué esperabas encontrar en la siguiente publicación?",
    },
    action: { en: "Put the phone down and look at one real object for ten breaths.", es: "Deja el celular y observa un objeto real durante diez respiraciones." },
  },
  {
    id: "sexual_content",
    label: { en: "Sexual content is pulling me in", es: "El contenido sexual me está atrapando" },
    validation: {
      en: "An urge is information, not an order and not a moral verdict.",
      es: "Un impulso es información, no una orden ni un juicio moral.",
    },
    reflection: { en: "What need is underneath this moment: stimulation, comfort, sleep, or connection?", es: "¿Qué necesidad hay debajo de este momento: estímulo, consuelo, sueño o conexión?" },
    action: { en: "Move to a different room or stand outside for two minutes.", es: "Cambia de habitación o sal durante dos minutos." },
  },
  {
    id: "body_comparison",
    label: { en: "I am comparing my body", es: "Estoy comparando mi cuerpo" },
    validation: {
      en: "A curated image can trigger a real feeling without becoming a fair measure of you.",
      es: "Una imagen cuidadosamente seleccionada puede provocar algo real sin convertirse en una medida justa de ti.",
    },
    reflection: { en: "What can your body do for you today that an image cannot show?", es: "¿Qué puede hacer tu cuerpo por ti hoy que una imagen no puede mostrar?" },
    action: { en: "Name one ability, sensation, or act of care that has nothing to do with appearance.", es: "Nombra una capacidad, sensación o cuidado que no tenga que ver con la apariencia." },
  },
  {
    id: "social_comparison",
    label: { en: "Everyone seems ahead of me", es: "Siento que todo el mundo va adelante" },
    validation: { en: "You are comparing your full life with fragments selected for display.", es: "Estás comparando tu vida completa con fragmentos elegidos para mostrarse." },
    reflection: { en: "Which part of your own path deserves attention today?", es: "¿Qué parte de tu propio camino merece atención hoy?" },
    action: { en: "Choose one ten-minute task that belongs to your life, not somebody else's timeline.", es: "Elige una tarea de diez minutos que pertenezca a tu vida, no a la cronología de otra persona." },
  },
  {
    id: "rejection",
    label: { en: "Rejection is hurting", es: "El rechazo me está doliendo" },
    validation: { en: "A boundary can hurt without defining your worth.", es: "Un límite puede doler sin definir tu valor." },
    reflection: { en: "What happened, and what are you assuming it says about you?", es: "¿Qué ocurrió y qué estás suponiendo que dice sobre ti?" },
    action: { en: "Write one factual sentence and one kinder interpretation.", es: "Escribe una frase con el hecho y otra con una interpretación más amable." },
  },
  {
    id: "loneliness",
    label: { en: "I feel lonely", es: "Me siento en soledad" },
    validation: { en: "Loneliness asks for connection; it does not prove you are unwanted.", es: "La soledad pide conexión; no demuestra que nadie te quiera." },
    reflection: { en: "Who is one safe person you could contact without performing?", es: "¿Con qué persona segura podrías hablar sin tener que aparentar?" },
    action: { en: "Send a simple message: “Do you have ten minutes to talk this week?”", es: "Envía un mensaje sencillo: “¿Tienes diez minutos para hablar esta semana?”" },
  },
  {
    id: "anger",
    label: { en: "I am angry online", es: "Estoy sintiendo rabia en internet" },
    validation: { en: "The feeling is real. Acting from its hottest minute is optional.", es: "La emoción es real. Actuar desde su minuto más intenso es opcional." },
    reflection: { en: "What value or boundary feels threatened?", es: "¿Qué valor o límite sientes amenazado?" },
    action: { en: "Do not post yet. Walk, drink water, and reread your draft in ten minutes.", es: "No publiques todavía. Camina, toma agua y relee tu borrador en diez minutos." },
  },
  {
    id: "gender_war",
    label: { en: "Gender-war content is pulling me in", es: "El contenido de guerra de géneros me está atrapando" },
    validation: { en: "Pain can make collective blame feel simple. Simple is not the same as true.", es: "El dolor puede hacer que culpar a un grupo parezca sencillo. Sencillo no significa verdadero." },
    reflection: { en: "Which specific event are you turning into a claim about millions of people?", es: "¿Qué hecho concreto estás convirtiendo en una afirmación sobre millones de personas?" },
    action: { en: "Replace the group claim with the exact behavior and boundary involved.", es: "Reemplaza la afirmación sobre el grupo por la conducta y el límite concretos." },
  },
] as const;

const commonExit = {
  en: "Roleplay ended. Orion is speaking as your coach again.",
  es: "Terminó la simulación. Orion vuelve a hablar como tu acompañante.",
} as const;

export const REJECTION_SCENARIOS: readonly RejectionScenario[] = [
  {
    id: "romantic_rejection",
    label: { en: "Romantic rejection", es: "Rechazo romántico" },
    roleplay: { en: "Roleplay: “Thank you, but I do not want to date you.”", es: "Simulación: “Gracias, pero no quiero salir contigo.”" },
    exitRole: commonExit,
    coach: {
      en: ["Their no is a boundary, not a ranking of your humanity.", "Fact: one person declined. Assumption: nobody will choose you.", "Respect the boundary and do one thing that reconnects you with your own life."],
      es: ["Su no es un límite, no una clasificación de tu humanidad.", "Hecho: una persona no quiso. Suposición: nadie te elegirá.", "Respeta el límite y haz algo que te reconecte con tu propia vida."],
    },
  },
  {
    id: "left_on_read",
    label: { en: "Left on read", es: "Me dejaron en visto" },
    roleplay: { en: "Roleplay: The message remains unanswered.", es: "Simulación: el mensaje sigue sin respuesta." },
    exitRole: commonExit,
    coach: {
      en: ["Uncertainty is uncomfortable; it is not proof of rejection.", "You know the message is unanswered. You do not know why.", "Choose a time when you will stop checking and return to one concrete task."],
      es: ["La incertidumbre incomoda; no demuestra rechazo.", "Sabes que el mensaje no tiene respuesta. No sabes por qué.", "Elige una hora para dejar de revisar y vuelve a una tarea concreta."],
    },
  },
  {
    id: "friend_exclusion",
    label: { en: "Excluded by friends", es: "Exclusión de amistades" },
    roleplay: { en: "Roleplay: “We made plans without inviting you.”", es: "Simulación: “Hicimos planes sin invitarte.”" },
    exitRole: commonExit,
    coach: {
      en: ["Exclusion can hurt without proving every friendship is false.", "Ask what happened before deciding what everyone intended.", "Choose one calm question or one supportive person to contact."],
      es: ["La exclusión puede doler sin demostrar que toda amistad es falsa.", "Pregunta qué ocurrió antes de decidir qué pretendían los demás.", "Elige una pregunta tranquila o una persona de apoyo a quien contactar."],
    },
  },
  {
    id: "job_rejection",
    label: { en: "Job rejection", es: "Rechazo laboral" },
    roleplay: { en: "Roleplay: “We chose another candidate.”", es: "Simulación: “Elegimos a otra persona.”" },
    exitRole: commonExit,
    coach: {
      en: ["This decision affects an opportunity, not your total ability.", "Separate what you can learn from what you cannot know.", "Write one follow-up, one lesson, and one next application."],
      es: ["Esta decisión afecta una oportunidad, no toda tu capacidad.", "Separa lo que puedes aprender de lo que no puedes saber.", "Escribe un seguimiento, un aprendizaje y una próxima postulación."],
    },
  },
  {
    id: "criticism",
    label: { en: "Criticism", es: "Crítica" },
    roleplay: { en: "Roleplay: “This work is not good enough yet.”", es: "Simulación: “Este trabajo todavía no es suficientemente bueno.”" },
    exitRole: commonExit,
    coach: {
      en: ["Feedback about work is not a verdict about your worth.", "Find the specific, useful claim and leave the rest.", "Choose one revision small enough to complete today."],
      es: ["La retroalimentación sobre un trabajo no es un veredicto sobre tu valor.", "Encuentra la afirmación concreta y útil, y deja el resto.", "Elige una mejora suficientemente pequeña para terminar hoy."],
    },
  },
  {
    id: "low_engagement",
    label: { en: "Low social engagement", es: "Poca interacción en redes" },
    roleplay: { en: "Roleplay: The post receives almost no response.", es: "Simulación: la publicación casi no recibe respuesta." },
    exitRole: commonExit,
    coach: {
      en: ["A metric measures platform response, not human value.", "Algorithms and timing are hidden variables.", "Define success by what you wanted to express or learn."],
      es: ["Una métrica mide la respuesta de una plataforma, no el valor humano.", "El algoritmo y el momento son variables ocultas.", "Define el éxito por lo que querías expresar o aprender."],
    },
  },
  {
    id: "body_comparison",
    label: { en: "Body comparison", es: "Comparación corporal" },
    roleplay: { en: "Roleplay: “You should look more like the people in this feed.”", es: "Simulación: “Deberías parecerte más a la gente de este feed.”" },
    exitRole: commonExit,
    coach: {
      en: ["That was a simulated comparison voice, not a fact.", "The feed is selected, edited, and incomplete.", "Name one way your body supports your life beyond appearance."],
      es: ["Esa fue una voz simulada de comparación, no un hecho.", "El feed está seleccionado, editado e incompleto.", "Nombra una forma en que tu cuerpo sostiene tu vida más allá de la apariencia."],
    },
  },
  {
    id: "sexual_inadequacy",
    label: { en: "Sexual inadequacy", es: "Inseguridad sexual" },
    roleplay: { en: "Roleplay: “Everyone else is more desirable and experienced than you.”", es: "Simulación: “Todo el mundo es más deseable y tiene más experiencia que tú.”" },
    exitRole: commonExit,
    coach: {
      en: ["That comparison voice is designed to create urgency, not truth.", "Intimacy is not a public ranking.", "Choose care, consent, and honest connection over performance."],
      es: ["Esa voz comparativa busca crear urgencia, no verdad.", "La intimidad no es una clasificación pública.", "Elige cuidado, consentimiento y conexión honesta en lugar de rendimiento."],
    },
  },
  {
    id: "hostile_narrative",
    label: { en: "Hostile gender narrative", es: "Narrativa hostil sobre género" },
    roleplay: { en: "Roleplay: “An entire gender is the enemy, so retaliation is justified.”", es: "Simulación: “Todo un género es el enemigo, así que vengarse está justificado.”" },
    exitRole: commonExit,
    coach: {
      en: ["Pain does not make collective blame accurate or retaliation acceptable.", "Name the specific behavior, person, and boundary involved.", "Step away from content that rewards escalation and choose a non-harmful next action."],
      es: ["El dolor no vuelve precisa la culpa colectiva ni aceptable la venganza.", "Nombra la conducta, la persona y el límite concretos.", "Aléjate del contenido que premia la escalada y elige una acción que no haga daño."],
    },
  },
] as const;

export function getResetScenario(id: ResetScenario["id"]): ResetScenario {
  const scenario = RESET_SCENARIOS.find((candidate) => candidate.id === id);
  if (!scenario) throw new Error(`Unknown Reset scenario: ${id}`);
  return scenario;
}

export function getRejectionScenario(id: RejectionScenario["id"]): RejectionScenario {
  const scenario = REJECTION_SCENARIOS.find((candidate) => candidate.id === id);
  if (!scenario) throw new Error(`Unknown Rejection Gym scenario: ${id}`);
  return scenario;
}
