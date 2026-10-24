import {
  SearchState,
  SearchNode,
  SearchResult,
  SearchTraceStep,
  SavingsPlanStep,
  SearchComparison,
} from '../types/finance';
import { formatINR } from '../utils/formatters';

export interface SearchProblemInput {
  initialSavings: number;
  targetSavings: number;
  planningHorizonMonths: number;
  monthlySavingChoices: number[]; // e.g. [1000, 2000, 3000]
  maxIterations?: number;
}

/**
 * State key for visited set: "month_savings"
 */
function getStateKey(state: SearchState): string {
  return `${state.month}_${state.currentSavings}`;
}

/**
 * Reconstructs the solution path from goal node back to root.
 */
function reconstructPlan(goalNode: SearchNode): SavingsPlanStep[] {
  const plan: SavingsPlanStep[] = [];
  let curr: SearchNode | null = goalNode;

  while (curr && curr.parent && curr.action) {
    plan.unshift({
      month: curr.action.month,
      saveAmount: curr.action.saveAmount,
      resultingSavings: curr.state.currentSavings,
    });
    curr = curr.parent;
  }

  return plan;
}

/**
 * Heuristic Function h(n) for Informed Search:
 * Estimates the remaining monetary deficit to reach the target savings.
 * h(n) = max(0, targetSavings - currentSavings)
 * (Admissible and consistent proxy for remaining goal distance).
 */
export function calculateHeuristic(currentSavings: number, targetSavings: number): number {
  return Math.max(0, targetSavings - currentSavings);
}

/**
 * Step-based Heuristic h_steps(n):
 * Estimates the minimum number of additional planning months required
 * assuming the maximum available monthly saving choice is selected.
 * h_steps(n) = ceil(max(0, targetSavings - currentSavings) / maxChoice)
 */
export function calculateStepHeuristic(
  currentSavings: number,
  targetSavings: number,
  maxChoice: number
): number {
  if (maxChoice <= 0) return 0;
  const remaining = Math.max(0, targetSavings - currentSavings);
  return Math.ceil(remaining / maxChoice);
}

/**
 * UNINFORMED SEARCH: Breadth-First Search (BFS)
 * Uses a standard First-In, First-Out (FIFO) queue.
 * Explores nodes layer-by-layer across monthly planning steps.
 * Time Complexity: O(b^d), where b = |choices|, d = horizon
 * Space Complexity: O(b^d) for queue and visited set.
 */
export function runBreadthFirstSearch(input: SearchProblemInput): SearchResult {
  const startTime = performance.now();
  const {
    initialSavings,
    targetSavings,
    planningHorizonMonths,
    monthlySavingChoices,
    maxIterations = 5000,
  } = input;

  const validChoices = [...monthlySavingChoices].filter(c => c > 0).sort((a, b) => a - b);
  const queue: SearchNode[] = [];
  const visited = new Set<string>();
  const trace: SearchTraceStep[] = [];

  let statesExplored = 0;
  let maxFrontierSize = 0;

  // Root node
  const rootNode: SearchNode = {
    state: { month: 0, currentSavings: initialSavings },
    parent: null,
    action: null,
    g: 0,
    h: calculateHeuristic(initialSavings, targetSavings),
    f: calculateHeuristic(initialSavings, targetSavings),
    depth: 0,
  };

  // Immediate check if root is already goal
  if (rootNode.state.currentSavings >= targetSavings) {
    const elapsed = Number((performance.now() - startTime).toFixed(2));
    return {
      algorithm: 'BFS',
      success: true,
      plan: [],
      totalSaved: rootNode.state.currentSavings,
      targetSavings,
      planningHorizonMonths,
      statesExplored: 1,
      maxFrontierSize: 1,
      executionTimeMs: elapsed,
      trace: [
        {
          stepNumber: 1,
          state: rootNode.state,
          heuristic: 0,
          evaluationScore: 0,
          frontierSize: 0,
          visitedCount: 1,
          isGoal: true,
          notes: 'Initial savings already satisfy target goal.',
        },
      ],
      message: `Goal already reached at start with ${formatINR(initialSavings)}.`,
    };
  }

  queue.push(rootNode);
  visited.add(getStateKey(rootNode.state));

  while (queue.length > 0) {
    if (statesExplored >= maxIterations) {
      break;
    }

    maxFrontierSize = Math.max(maxFrontierSize, queue.length);
    const currentNode = queue.shift()!;
    statesExplored++;

    const isGoal = currentNode.state.currentSavings >= targetSavings;

    // Log trace
    trace.push({
      stepNumber: statesExplored,
      state: currentNode.state,
      actionTaken: currentNode.action || undefined,
      heuristic: currentNode.h,
      evaluationScore: currentNode.f,
      frontierSize: queue.length,
      visitedCount: visited.size,
      isGoal,
      notes: isGoal
        ? `Goal reached! Accumulated ${formatINR(currentNode.state.currentSavings)}.`
        : `Explored Month ${currentNode.state.month} with ${formatINR(currentNode.state.currentSavings)}.`,
    });

    if (isGoal) {
      const plan = reconstructPlan(currentNode);
      const elapsed = Number((performance.now() - startTime).toFixed(2));
      return {
        algorithm: 'BFS',
        success: true,
        plan,
        totalSaved: currentNode.state.currentSavings,
        targetSavings,
        planningHorizonMonths,
        statesExplored,
        maxFrontierSize,
        executionTimeMs: elapsed,
        trace,
        message: `BFS found a valid plan in ${plan.length} month(s) after exploring ${statesExplored} states.`,
      };
    }

    // Generate successors if within planning horizon
    if (currentNode.state.month < planningHorizonMonths) {
      const nextMonth = currentNode.state.month + 1;

      for (const choice of validChoices) {
        const nextSavings = currentNode.state.currentSavings + choice;
        const nextState: SearchState = { month: nextMonth, currentSavings: nextSavings };
        const key = getStateKey(nextState);

        if (!visited.has(key)) {
          visited.add(key);
          const childNode: SearchNode = {
            state: nextState,
            parent: currentNode,
            action: { month: nextMonth, saveAmount: choice },
            g: currentNode.g + 1,
            h: calculateHeuristic(nextSavings, targetSavings),
            f: calculateHeuristic(nextSavings, targetSavings),
            depth: currentNode.depth + 1,
          };
          queue.push(childNode);
        }
      }
    }
  }

  const elapsed = Number((performance.now() - startTime).toFixed(2));
  return {
    algorithm: 'BFS',
    success: false,
    plan: [],
    totalSaved: initialSavings,
    targetSavings,
    planningHorizonMonths,
    statesExplored,
    maxFrontierSize,
    executionTimeMs: elapsed,
    trace,
    message: `Target of ${formatINR(targetSavings)} unreachable within ${planningHorizonMonths} month(s) with available savings options.`,
  };
}

/**
 * INFORMED SEARCH: Best-First Search (Greedy Best-First)
 * Uses a priority frontier sorted ascending by heuristic evaluation function:
 * f(n) = h(n) = max(0, targetSavings - currentSavings)
 * Prioritizes nodes that minimize estimated distance to the target savings goal.
 */
export function runBestFirstSearch(input: SearchProblemInput): SearchResult {
  const startTime = performance.now();
  const {
    initialSavings,
    targetSavings,
    planningHorizonMonths,
    monthlySavingChoices,
    maxIterations = 5000,
  } = input;

  const validChoices = [...monthlySavingChoices].filter(c => c > 0).sort((a, b) => b - a); // Higher choices first
  const frontier: SearchNode[] = [];
  const visited = new Set<string>();
  const trace: SearchTraceStep[] = [];

  let statesExplored = 0;
  let maxFrontierSize = 0;

  // Root node
  const rootNode: SearchNode = {
    state: { month: 0, currentSavings: initialSavings },
    parent: null,
    action: null,
    g: 0,
    h: calculateHeuristic(initialSavings, targetSavings),
    f: calculateHeuristic(initialSavings, targetSavings),
    depth: 0,
  };

  if (rootNode.state.currentSavings >= targetSavings) {
    const elapsed = Number((performance.now() - startTime).toFixed(2));
    return {
      algorithm: 'BestFirst',
      success: true,
      plan: [],
      totalSaved: rootNode.state.currentSavings,
      targetSavings,
      planningHorizonMonths,
      statesExplored: 1,
      maxFrontierSize: 1,
      executionTimeMs: elapsed,
      trace: [
        {
          stepNumber: 1,
          state: rootNode.state,
          heuristic: 0,
          evaluationScore: 0,
          frontierSize: 0,
          visitedCount: 1,
          isGoal: true,
          notes: 'Initial savings already satisfy target goal.',
        },
      ],
      message: `Goal already reached at start with ${formatINR(initialSavings)}.`,
    };
  }

  frontier.push(rootNode);

  while (frontier.length > 0) {
    if (statesExplored >= maxIterations) {
      break;
    }

    maxFrontierSize = Math.max(maxFrontierSize, frontier.length);

    // Frontier is sorted: pop the lowest f(n) (closest to target)
    // If ties occur, prefer higher depth (further along the plan)
    frontier.sort((a, b) => {
      if (a.f !== b.f) return a.f - b.f;
      return b.depth - a.depth;
    });

    const currentNode = frontier.shift()!;
    const key = getStateKey(currentNode.state);

    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    statesExplored++;
    const isGoal = currentNode.state.currentSavings >= targetSavings;

    // Log trace
    trace.push({
      stepNumber: statesExplored,
      state: currentNode.state,
      actionTaken: currentNode.action || undefined,
      heuristic: currentNode.h,
      evaluationScore: currentNode.f,
      frontierSize: frontier.length,
      visitedCount: visited.size,
      isGoal,
      notes: isGoal
        ? `Goal reached! Heuristic score 0, total ${formatINR(currentNode.state.currentSavings)}.`
        : `Heuristic: ${formatINR(currentNode.h)} remaining deficit. Prioritized in frontier.`,
    });

    if (isGoal) {
      const plan = reconstructPlan(currentNode);
      const elapsed = Number((performance.now() - startTime).toFixed(2));
      return {
        algorithm: 'BestFirst',
        success: true,
        plan,
        totalSaved: currentNode.state.currentSavings,
        targetSavings,
        planningHorizonMonths,
        statesExplored,
        maxFrontierSize,
        executionTimeMs: elapsed,
        trace,
        message: `Best-First Search reached target in ${plan.length} month(s) exploring ${statesExplored} states.`,
      };
    }

    // Generate successors if within horizon
    if (currentNode.state.month < planningHorizonMonths) {
      const nextMonth = currentNode.state.month + 1;

      for (const choice of validChoices) {
        const nextSavings = currentNode.state.currentSavings + choice;
        const nextState: SearchState = { month: nextMonth, currentSavings: nextSavings };
        const childKey = getStateKey(nextState);

        if (!visited.has(childKey)) {
          const h = calculateHeuristic(nextSavings, targetSavings);
          const childNode: SearchNode = {
            state: nextState,
            parent: currentNode,
            action: { month: nextMonth, saveAmount: choice },
            g: currentNode.g + 1,
            h,
            f: h, // Greedy Best-First evaluation function f(n) = h(n)
            depth: currentNode.depth + 1,
          };
          frontier.push(childNode);
        }
      }
    }
  }

  const elapsed = Number((performance.now() - startTime).toFixed(2));
  return {
    algorithm: 'BestFirst',
    success: false,
    plan: [],
    totalSaved: initialSavings,
    targetSavings,
    planningHorizonMonths,
    statesExplored,
    maxFrontierSize,
    executionTimeMs: elapsed,
    trace,
    message: `Target of ${formatINR(targetSavings)} unreachable within ${planningHorizonMonths} month(s).`,
  };
}

/**
 * Compares BFS and Best-First Search on identical inputs.
 */
export function compareSearchAlgorithms(input: SearchProblemInput): SearchComparison {
  const bfsResult = runBreadthFirstSearch(input);
  const bestFirstResult = runBestFirstSearch(input);

  let fasterAlgorithm: SearchComparison['fasterAlgorithm'] = 'Equal';
  if (bfsResult.executionTimeMs < bestFirstResult.executionTimeMs) fasterAlgorithm = 'BFS';
  else if (bestFirstResult.executionTimeMs < bfsResult.executionTimeMs) fasterAlgorithm = 'BestFirst';

  let fewerStatesAlgorithm: SearchComparison['fewerStatesAlgorithm'] = 'Equal';
  if (bfsResult.statesExplored < bestFirstResult.statesExplored) fewerStatesAlgorithm = 'BFS';
  else if (bestFirstResult.statesExplored < bfsResult.statesExplored)
    fewerStatesAlgorithm = 'BestFirst';

  let analysis = '';
  if (bestFirstResult.success && bfsResult.success) {
    if (bestFirstResult.statesExplored < bfsResult.statesExplored) {
      analysis = `Best-First Search explored ${bfsResult.statesExplored - bestFirstResult.statesExplored} fewer states than BFS because the heuristic guide h(n) prioritized states that maximized monthly savings towards ${formatINR(input.targetSavings)}.`;
    } else if (bestFirstResult.statesExplored === bfsResult.statesExplored) {
      analysis = `Both algorithms explored an identical number of states (${bfsResult.statesExplored}) because the goal state was reached at the minimum tree depth.`;
    } else {
      analysis = `BFS explored fewer states than Best-First Search in this scenario. While Best-First Search greedily follows the heuristic gradient, BFS explores uniformly in breadth, which can find shallow solutions more directly when all branches have uniform branching.`;
    }
  } else if (!bfsResult.success && !bestFirstResult.success) {
    analysis = `Both algorithms verified that the target of ${formatINR(input.targetSavings)} cannot be reached within the ${input.planningHorizonMonths}-month planning horizon using the given action set.`;
  } else {
    analysis = `Search outcome differed due to horizon and heuristic boundary conditions.`;
  }

  return {
    bfsResult,
    bestFirstResult,
    fasterAlgorithm,
    fewerStatesAlgorithm,
    analysis,
  };
}
