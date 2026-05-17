export type Worker = {
  id: string;
  name: string;
  skills: string[];
  hourlyRate: number;
  trustScore: number;
  completedJobs: number;
  location: string;
  availability: boolean;
};

export const workers: Worker[] = [
  {
    id: "1",
    name: "Alex Chen",
    skills: ["react", "node", "ui design"],
    hourlyRate: 45,
    trustScore: 92,
    completedJobs: 120,
    location: "SF",
    availability: true,
  },
  {
    id: "2",
    name: "Maria Lopez",
    skills: ["python", "data", "ai"],
    hourlyRate: 60,
    trustScore: 96,
    completedJobs: 210,
    location: "Remote",
    availability: true,
  },
  {
    id: "3",
    name: "James Carter",
    skills: ["solidity", "web3", "hardhat"],
    hourlyRate: 80,
    trustScore: 89,
    completedJobs: 75,
    location: "NYC",
    availability: false,
  },
];