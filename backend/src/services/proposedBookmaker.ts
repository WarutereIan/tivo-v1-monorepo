// Function to calculate the relative strength factor based on points
function calculateStrengthFactor(points: number) {
  return Math.sqrt(points) / 10;
}

// Function to calculate the probability of a team scoring a certain number of goals
function calculateTeamProbability(averageGoalsPerMatch: number) {
  const poissonDistribution = [];
  for (let goals = 0; goals <= 6; goals++) {
    const probability =
      (Math.pow(averageGoalsPerMatch, goals) *
        Math.exp(-averageGoalsPerMatch)) /
      factorial(goals);
    poissonDistribution.push(probability);
  }
  console.log('teams pd... \n', poissonDistribution, '\ns' )
  return poissonDistribution;
}

// Function to calculate the factorial of a number
function factorial(n: number): number {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

// Function to calculate the probability of a certain number of total goals being scored
function calculateTotalGoalsProbability(
  totalGoals: number,
  team1Probability: number[],
  team2Probability: number[]
) {
  let probability = 0;
  for (let team1Goals = 0; team1Goals <= totalGoals; team1Goals++) {
    const team2Goals = totalGoals - team1Goals;
    probability += team1Probability[team1Goals] * team2Probability[team2Goals];

  }
  return probability;
}

// Function to calculate the match odds based on goal differences and team points
function calculateMatchOdds(
  goalDifferenceTeam1: number,
  goalDifferenceTeam2: number,
  pointsTeam1: number,
  pointsTeam2: number,
  multiplierFactor: number
) {
  // Calculate the relative strength factor based on points
  const strengthFactorTeam1 = calculateStrengthFactor(pointsTeam1);
  const strengthFactorTeam2 = calculateStrengthFactor(pointsTeam2);

  // Calculate the average number of goals per match based on relative strength factors
  const averageGoalsPerMatchTeam1 =
    ((Math.abs(goalDifferenceTeam1) + Math.abs(goalDifferenceTeam2)) / 4) *
    strengthFactorTeam1;
  const averageGoalsPerMatchTeam2 =
    ((Math.abs(goalDifferenceTeam1) + Math.abs(goalDifferenceTeam2)) / 4) *
    strengthFactorTeam2;

  // Calculate the probability of each team scoring a certain number of goals
  const probabilityTeam1 = calculateTeamProbability(averageGoalsPerMatchTeam1);
  const probabilityTeam2 = calculateTeamProbability(averageGoalsPerMatchTeam2);

  // Calculate the probability of a certain number of total goals being scored
  const probability = [];
  for (let totalGoals = 0; totalGoals <= 6; totalGoals++) {
    probability[totalGoals] = calculateTotalGoalsProbability(
      totalGoals,
      probabilityTeam1,
      probabilityTeam2
    );

   
  }

  // Adjust the shape of the goal distribution using Beta distribution
  const alpha = 1; // Adjust this value to control the shape of the distribution. Higher alpha gives higher probability of lower goals
  const beta = 1; // Adjust this value to control the shape of the distribution
  const adjustedProbability = probability.map(
    (p, index) =>
      p * Math.pow((index + 1) / 7, alpha) * Math.pow(1 - (index + 1) / 7, beta)
  );

  // Normalize the probabilities
  const totalProbability = adjustedProbability.reduce(
    (acc, val) => acc + val,
    0
  );
  for (let i = 0; i < adjustedProbability.length; i++) {
    adjustedProbability[i] /= totalProbability;
  }

  // Convert probabilities to match odds and apply a multiplier factor
  const matchOdds = adjustedProbability.map((p) => 1 / (p / multiplierFactor));

  return matchOdds;
}

// Sample outputs
console.log(calculateMatchOdds(15, 23, 40, 32, 1));
console.log(calculateMatchOdds(-2, 1, 8, 6, 0.2));
console.log(calculateMatchOdds(1, -3, 7, 9, 0.3));
console.log(calculateMatchOdds(4, 2, 11, 7, 0.4));
console.log(calculateMatchOdds(-1, -1, 6, 5, 0.5));
