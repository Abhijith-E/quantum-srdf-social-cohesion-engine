import { create } from 'zustand';

interface SCEStoreState {
  network: any;
  solverResult: any;
  isSolving: boolean;
  solveProgress: number;
  solveStage: string;
  selectedSolver: string;
  setNetwork: (network: any) => void;
  setSolverResult: (result: any) => void;
  setIsSolving: (isSolving: boolean) => void;
  setSolveProgress: (progress: number, stage: string) => void;
  setSelectedSolver: (solver: string) => void;
  reset: () => void;
}

const useSCEStore = create<SCEStoreState>((set) => ({
  network: null,
  solverResult: null,
  isSolving: false,
  solveProgress: 0,
  solveStage: '',
  selectedSolver: 'auto',

  setNetwork: (network) => set({ network, solverResult: null }),
  setSolverResult: (result) => set({ solverResult: result }),
  setIsSolving: (isSolving) => set({ isSolving }),
  setSolveProgress: (progress, stage) => set({ solveProgress: progress, solveStage: stage }),
  setSelectedSolver: (solver) => set({ selectedSolver: solver }),
  reset: () => set({ network: null, solverResult: null, isSolving: false, solveProgress: 0, solveStage: '' })
}));

export default useSCEStore;
