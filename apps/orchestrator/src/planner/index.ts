export { enhancePrompt } from "./promptEnhancer.js";
export { generatePlan } from "./planGenerator.js";
export { getFileErrors, parseErrorFiles } from "./buildErrorParser.js";
export { generateFixes } from "./fixGenerator.js";
export { STEP_TYPES } from "./types.js";
export type { Plan, PlanStep, StepType } from "./types.js";
export type { FileError } from "./buildErrorParser.js";
export type { FileFix } from "./fixGenerator.js";
export {classifyError,classifyBuildErrors,groupErrorsByType,extractMissingPackages,requiresLLMFix,ErrorType} from "./errorClassifier.js";
export type { ClassifiedError, ErrorDetails } from "./errorClassifier.js";
export {autoInstallPackages,isPackageInstalled,getInstalledPackages} from "./dependencyInstaller.js";
export type { InstallResult } from "./dependencyInstaller.js";
export {routeAndHandleErrors,applyFixes,prioritizeErrors} from "./errorRouter.js";
export type { ErrorHandlingResult } from "./errorRouter.js";

