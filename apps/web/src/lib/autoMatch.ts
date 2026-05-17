import { matchWorkers } from "./matchingEngine";
import { workers } from "./workers";

export type JobInput = {
  title: string;
  requiredSkills: string[];
  budget: number;
};

export function autoSelectWorker(job: JobInput) {
  const ranked = matchWorkers(job, workers);

  if (!ranked.length) {
    throw new Error("No available workers found");
  }

  // pick best match
  const best = ranked[0];

  return {
    worker: best.worker,
    score: best.score,
  };
}