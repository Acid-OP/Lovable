// Build step messages shown during code generation
export const PRIMARY_STEPS = [
  "Initializing workspace",
  "Analyzing your prompt",
  "Planning project structure",
  "Setting up dependencies",
  "Configuring TypeScript",
  "Creating component architecture",
  "Generating UI components",
  "Setting up routing",
  "Wiring up state management",
  "Writing styles and layouts",
  "Creating page templates",
  "Connecting API layer",
  "Optimizing bundle size",
  "Running type checks",
  "Building for production",
  "Preparing deployment",
];

// Extended steps when build takes longer (errors/retries)
export const EXTENDED_STEPS = [
  "Refining code quality",
  "Resolving dependencies",
  "Optimizing component tree",
  "Running additional checks",
  "Validating build output",
  "Fine-tuning performance",
  "Polishing final output",
  "Almost there",
];

export const ALL_STEPS = [...PRIMARY_STEPS, ...EXTENDED_STEPS];
export const LAST_PRIMARY_INDEX = PRIMARY_STEPS.length - 1;

// Timing constants for the build loader
export const NORMAL_PACE_MS = 3500;
export const MIN_DISPLAY_TIME_MS = 50000;
export const MIN_STEPS_BEFORE_COMPLETE = 14;

// Transition loader messages
export const TRANSITION_MESSAGES = [
  "Setting up your workspace...",
  "Analyzing your prompt...",
  "Preparing the environment...",
  "Almost there...",
];

// Project showcase data
export interface ShowcaseProject {
  name: string;
  description: string;
  url: string;
  image: string | null;
}

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    name: "DrawDeck",
    description:
      "Draw together with built-in video calls and end-to-end encryption. Real-time collaborative canvas.",
    url: "https://drawdeck.xyz",
    image: "/showcase-drawdeck.png",
  },
  {
    name: "Vault",
    description:
      "Exchange platform built for speed and scale. Real-time order books, WebSocket feeds, and Redis-backed matching.",
    url: "https://github.com/Acid-OP/Vault",
    image: "/showcase-vault.png",
  },
  {
    name: "Second Brain",
    description:
      "Save, organize, and share all in one place. Store and access your links with intelligent embeddings.",
    url: "https://secondbrain-hazel.vercel.app/",
    image: "/showcase-secondbrain.png",
  },
  {
    name: "Promptly",
    description:
      "AI coding terminal that generates and runs code from natural language. Describe what you want, get working code.",
    url: "https://github.com/Acid-OP/Promptly",
    image: null,
  },
];

// Carousel timing
export const SHOWCASE_INTERVAL_MS = 4500;
export const TRANSITION_INTERVAL_MS = 2000;
