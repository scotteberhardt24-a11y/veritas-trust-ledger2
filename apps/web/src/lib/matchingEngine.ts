import { Worker } from "./workers";

export type Job = {
  title: string;
  requiredSkills: string[];
  budget: number;
};

export function matchWorkers(job: Job, workers: Worker[]) {
  return workers
    .filter((w) => w.availability)
    .map((worker) => {
      const skillMatch =
        worker.skills.filter((s) =>
          job.requiredSkills.includes(s)
        ).length;

      const skillScore =
        skillMatch / job.requiredSkills.length;

      const priceScore =
        Math.max(
          0,
          1 - worker.hourlyRate / job.budget
        );

      const trustScore = worker.trustScore / 100;

      const experienceScore =
        Math.min(worker.completedJobs / 200, 1);

      const finalScore =
        skillScore * 0.4 +
        trustScore * 0.3 +
        priceScore * 0.2 +
        experienceScore * 0.1;

      return {
        worker,
        score: Number(finalScore.toFixed(3)),
      };
    })
    .sort((a, b) => b.score - a.score);
}