// The two or three decision blocks on each case study: a heading that states the problem or insight,
// two to three sentences, one large picture and a one-sentence caption. The text restates what the case
// study's own sections already say; nothing here adds a claim. SynCare's figures stay out on purpose:
// they are design targets, not results.

export type Decision = {
  heading: string;
  body: string;
  image: { src: string; alt: string };
  caption: string;
  fit?: "contain";
};

export const decisions: Record<string, Decision[]> = {
  woven: [
    {
      heading: "Voice timed to the moment",
      body: "I designed a voice-first coaching layer that gives real-time guidance without adding cognitive load, timed to a stop sign, an intersection or a lane change. Voice-frequency studies shaped the model, balancing how often the coach speaks against how much a new driver can absorb.",
      image: { src: "/work/woven/04.png", alt: "An in-car touchscreen showing the Experience Drive Connect screen" },
      caption: "The in-car screen from the voice-first coaching layer.",
    },
    {
      heading: "Tested in CARLA before a real car",
      body: "I connected the coaching designs to CARLA, Woven’s proprietary simulation platform, to pressure-test coaching behavior before it touched a real vehicle. Live signals from the Vehicle SDK and CAN bus kept guidance synced to real speed, position and steering input.",
      image: { src: "/work/woven/11.jpg", alt: "A racing simulator with a seat and three screens" },
      caption: "Coaching run against realistic driving scenarios in simulation.",
    },
    {
      heading: "Physical controls found what screens missed",
      body: "I kept prototypes moving as fast as the feedback: voice-enabled Figma flows, full simulator scenarios, then a physical rig with a real steering wheel and pedals. Testing with hands on the wheel surfaced timing and tone problems a screen-only prototype would not.",
      image: { src: "/work/woven/12.jpg", alt: "A simulator rig with a racing seat, two monitors and pedals" },
      caption: "A rig with a real steering wheel and pedals.",
    },
  ],
  "fleet-console": [
    {
      heading: "Test fleets outgrow their oversight",
      body: "Leads can’t see oversight debt, and escalation hangs on one phone call. Public reporting on AV test programs describes this; I used it as design pressure, not evidence.",
      image: { src: "/work/fleet-console/02.jpg", alt: "The Fleet Console Now screen with an active escalation and a coverage timeline" },
      caption: "Open escalations and coverage gaps sit on the first screen.",
    },
    {
      heading: "Organize around what needs me now",
      body: "Navigation is verbs and queues; objects sit one hop below. I rejected object-first and time-first.",
      image: { src: "/work/fleet-console/ia.svg", alt: "The information architecture: workflow-first navigation of verbs and queues" },
      caption: "The information architecture, workflow first.",
      fit: "contain",
    },
    {
      heading: "Each surface gets the job it fits",
      body: "The car asks one question with two answer keys, built to the 2-second glance. The iPhone acknowledges in one tap, and Resolve stays locked until the protocol is done. The desktop groups its Inbox by severity.",
      image: { src: "/work/fleet-console/06.png", alt: "The in-vehicle prompt: SEV1, Emergency services needed, with Yes call and No" },
      caption: "In the car: one question, two answer keys.",
    },
  ],
  how2to: [
    {
      heading: "Voice first, so hands stay on the task",
      body: "I designed a voice-first model that cuts cognitive overload by keeping only the most contextually relevant commands. On Vision Pro the voice layer acts as a tutorial assistant, creating steps with task-specific videos and images.",
      image: { src: "/work/how2to/03.png", alt: "A spatial tutorial step with an ingredients panel floating in a kitchen" },
      caption: "A step and its ingredients, placed in the room.",
    },
    {
      heading: "Check the tutorial before you start",
      body: "Once the AI generates a tutorial, the preview page lets people go over the results, sources and ingredients, and see whether they have what the task needs. If they don’t approve, they can browse others.",
      image: { src: "/work/how2to/04.png", alt: "The tutorial preview page for French toast, with ingredients and sources" },
      caption: "The preview lists ingredients and sources before the viewer opens.",
    },
    {
      heading: "Media controls with a small footprint",
      body: "How2To does a lot, so I redesigned the native media controls: steps, tutorials, a viewer-mode toggle, ingredients and information sources. The design keeps a small footprint without losing function.",
      image: { src: "/work/how2to/07.png", alt: "The redesigned media controls: Step 2, Next, close, tutorials, playback and viewer buttons" },
      caption: "Steps, playback and viewer controls in one small bar.",
    },
  ],
  omniabrowser: [
    {
      heading: "Read the web as summary cards",
      body: "Flipping through summary cards is efficient, spatial, and works alongside other apps. Only the text in view is bright and the rest is dimmed to avoid distraction. User research showed people read more content generated by AI summaries.",
      image: { src: "/work/omniabrowser/01.png", alt: "An AI summary card of a news article floating in a room" },
      caption: "An AI summary as a card, with the full page one step away.",
    },
    {
      heading: "Game controls that match the hardware",
      body: "WebXR games promise immersive play, but fragmentation across VR and AR devices has limited their reach. I designed an adaptable game UI so interfaces morph to match the hardware in real time.",
      image: { src: "/work/omniabrowser/03.png", alt: "A WebXR game start screen with keyboard, scroll and drag controls" },
      caption: "A game’s controls, adapted to the device in use.",
    },
    {
      heading: "A 3D viewer for one hand",
      body: "I designed zoom sliders and rotation controls so people can handle a 3D model with one hand instead of the OS’s two-handed gestures. Factory workers asked for this often, given the nature of their work.",
      image: { src: "/work/omniabrowser/05.png", alt: "A 3D model of a lathe with zoom and rotation controls" },
      caption: "Zoom and rotation controls for one hand.",
    },
  ],
  spatialshowroom: [
    {
      heading: "A showroom easy enough to demo in minutes",
      body: "Tesla of River North wanted an XR app for a showroom event on November 21st, 2024. We settled on a virtual car showroom with customization and a few quirky features, and it had to be easy enough to demo to about 100 people in a matter of minutes.",
      image: { src: "/work/spatialshowroom/01.png", alt: "The virtual showroom with a Tesla and a model picker" },
      caption: "The showroom home: pick a model, then make it yours.",
    },
    {
      heading: "Life-size, and yours to customize",
      body: "People can view the products life-size and interact with them as if they owned them. Colors, wheel designs and interior features can be customized before placing an order.",
      image: { src: "/work/spatialshowroom/06.png", alt: "A blue Tesla Model S with a customization panel" },
      caption: "Colors, wheels and interior, changed in place.",
    },
    {
      heading: "Live on the visionOS App Store",
      body: "The Omnia Virtual Showroom is live on the visionOS App Store.",
      image: { src: "/work/spatialshowroom/03.png", alt: "The Omnia Spatial Showroom listing, shown in a Vision Pro room" },
      caption: "The showroom, in the Omnia app on Vision Pro.",
    },
  ],
  "syncare-ai-health": [
    {
      heading: "Clarity first, from the welcome screen",
      body: "The welcome screen is designed to give instant clarity and trust: a clean layout, strong brand presence and action-driven calls to action. It avoids overwhelming the user and guides them toward value with minimal friction.",
      image: { src: "/work/syncare-ai-health/03.png", alt: "Twelve onboarding screens, from the welcome screen to profile questions" },
      caption: "The onboarding flow, from welcome to health sources.",
    },
    {
      heading: "Converse with all your health apps",
      body: "AI Chat turns static health data into natural, human-like dialogue. People can recall past appointments, track medication and ask follow-up questions without needing clinical literacy.",
      image: { src: "/work/syncare-ai-health/06.png", alt: "The AI Chat screen with a conversation about a doctor’s visit" },
      caption: "Chat recalls records and answers follow-up questions.",
    },
    {
      heading: "A dashboard that says why",
      body: "The dashboard surfaces vitals, medication reminders and AI insights in a personalized way. Microcopy explains why something is flagged, which reduces overwhelm and builds trust. The figures in the full notes are design targets, not measured results.",
      image: { src: "/work/syncare-ai-health/08.png", alt: "The home dashboard with a greeting, a vitals summary and a medication reminder" },
      caption: "Home: vitals, medication and a plain reason for each flag.",
    },
  ],
  sitelens: [
    {
      heading: "A phone app that mirrors the glasses",
      body: "The home screen puts utility first, with active apps, inactive apps and suggested extensions. It is designed to mirror the AR glasses UI, and the Omni-AI status builds confidence by surfacing system state.",
      image: { src: "/work/sitelens/05.png", alt: "The SiteLens home screen listing active, inactive and suggested apps" },
      caption: "Home: To-Do List and Map on, Translate and Camera off.",
    },
    {
      heading: "A familiar grid for shared media",
      body: "The media screen puts large thumbnails first, mirrors the social apps people already know, and scales to more media types. A prominent upload button signals that contributing comes first.",
      image: { src: "/work/sitelens/07.png", alt: "The Spatial Hub screen with an upload button and a grid of popular content" },
      caption: "Spatial Hub: upload first, popular content below.",
    },
  ],
  "just-fill-it": [
    {
      heading: "The writing was not the problem",
      body: "I already had an AI workflow that tailored my resume and cover letter to each posting. Everything around it was the problem: copying the link, switching to a terminal, finding the PDF, and picking the right file from several drafts. Designing for myself made the brief sharp: I should never have to leave the job page.",
      image: { src: "/work/just-fill-it/panel-m3-done-light.png", alt: "The Just Fill it! panel in Chrome, in Material 3, with a finished resume ready to attach" },
      caption: "The panel in Chrome, with a finished resume ready to attach.",
    },
    {
      heading: "Native in each browser",
      body: "One product, drawn in each browser’s own design language: Material 3 in Chrome and Liquid Glass in Safari. The panel never submits anything; it hands you a file you can attach.",
      image: { src: "/work/just-fill-it/panel-glass-done-light.png", alt: "The Just Fill it! panel in Safari, in Liquid Glass, with a finished resume ready to attach" },
      caption: "The same panel in Safari, in Liquid Glass.",
    },
  ],
  "design-crew": [
    {
      heading: "Agents pass files, not chat history",
      body: "Each agent reads a few small files and writes one. A shared ledger of decisions and metrics is the memory. Two gates are where only I decide.",
      image: { src: "/work/design-crew/pipeline.svg", alt: "The pipeline: each arrow is a file one agent hands the next, with two human gates." },
      caption: "Each arrow is a file one agent hands the next.",
      fit: "contain",
    },
    {
      heading: "What the critics caught",
      body: "The review agents caught real defects: the Resolve button was never passed disabled, a question offered only one answer key, and columns were clipped off-screen.",
      image: { src: "/work/fleet-console/08.png", alt: "The Fleet Console iPhone escalation screen" },
      caption: "One of the prototype screens the critics reviewed.",
    },
  ],
};
