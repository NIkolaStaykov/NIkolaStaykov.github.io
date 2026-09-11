/** Education and experience, mirroring ~/Projects/cv/main.tex. */

export interface Entry {
  org: string;
  orgUrl?: string;
  title: string;
  location: string;
  start: string; // YYYY-MM
  end: string;   // YYYY-MM or 'present'
  points?: string[];
}

export const education: Entry[] = [
  {
    org: 'ETH Zürich',
    orgUrl: 'https://ethz.ch',
    title: 'M.Sc. Robotics, Systems and Control',
    location: 'Zurich, Switzerland',
    start: '2024-09',
    end: '2027-02',
    points: ['Robot Dynamics', 'Probabilistic AI', 'Machine Perception'],
  },
  {
    org: 'Technical University of Munich',
    orgUrl: 'https://www.tum.de',
    title: 'B.Sc. Engineering Science',
    location: 'Munich, Germany',
    start: '2021-10',
    end: '2024-09',
    points: ['Control Theory', 'Modelling and Simulation', 'Introduction to AI'],
  },
];

export const experience: Entry[] = [
  {
    org: 'Sevensense at ABB',
    orgUrl: 'https://www.sevensense.ai',
    title: 'Robotics Test Engineering Intern',
    location: 'Zurich, Switzerland',
    start: '2025-07',
    end: '2026-03',
    points: [
      'Built out an in-house test automation framework, improving coverage and cutting manual testing effort.',
      'Integrated the framework into a CI/CD workflow.',
      'Streamlined deployment of the SLAM system across wheeled testing platforms.',
      'Led release testing for a client.',
    ],
  },
  {
    org: 'Data Machine Intelligence',
    title: 'Simulation Engineer',
    location: 'Munich, Germany',
    start: '2023-05',
    end: '2024-09',
    points: [
      'Developed a flight simulation pipeline with a parallelized architecture enabling machine learning applications.',
      'Trained a PPO reinforcement learning agent for autonomous flight.',
      'Presented the simulation pipeline to investors and clients.',
    ],
  },
];

export const awards = [
  { name: 'ETH Robotics Summer School', url: 'https://robotx.ethz.ch/education/summer-school.html' },
  { name: 'TUMJA Scholarship', url: 'https://www.ja.tum.de/ja/start/' },
  { name: "Deutschlandstipendium '22/23/24", url: 'https://www.tum.de/studium/studienfinanzierung/stipendien/stipendien-der-tum/deutschlandstipendium' },
  { name: "Research Science Institute '20", url: 'https://www.cee.org/programs/research-science-institute' },
];
