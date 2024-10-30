/**
 * Calculates the next target milestone based on current submissions.
 * If submissions reach 90% of a target, returns the next target.
 * Replicates Impact Stack behaviour.
 *
 * Example:
 * - If submissions = 450 (90% of 500) → returns 1000
 * - If submissions = 950 (90% of 1000) → returns 5000
 *
 * @param submissions - Current number of submissions
 */
export function calculateTarget(submissions: number): number {
    // Available target milestones
    const targets = [
        500, 1_000, 5_000, 10_000, 15_000, 25_000, 30_000, 40_000,
        50_000, 60_000, 70_000, 80_000, 90_000, 100_000, 120_000,
        150_000, 200_000, 250_000, 300_000, 350_000, 400_000, 450_000,
        500_000, 550_000, 600_000, 650_000, 700_000, 750_000, 800_000,
        850_000, 900_000, 950_000, 1_000_000, 1_100_000, 1_200_000,
        1_300_000, 1_400_000, 1_500_000, 1_600_000, 1_700_000, 1_800_000,
        1_900_000, 2_000_000, 2_100_000, 2_200_000, 2_300_000, 2_400_000,
        2_500_000, 2_600_000, 2_700_000, 2_800_000, 2_900_000, 3_000_000
    ];


    // First and last targets for easy reference
    const minTarget = targets[0];
    const maxTarget = targets[targets.length - 1];

    // If submissions are less than 90% of minimum target (500)
    // Example: 449 is less than 90% of 500, so return 500
    if (submissions < minTarget * 0.9) {
        return minTarget;
    }

    // If submissions are more than 90% of maximum target (3000000)
    // Example: 27000 is more than 90% of 3000000, so return 3000000
    if (submissions >= maxTarget * 0.9) {
        return maxTarget;
    }

    // Check each target level
    for (let i = 0; i < targets.length - 1; i++) {
        const currentTarget = targets[i];
        const nextTarget = targets[i + 1];

        // If submissions are between 90% of current target and 90% of next target
        // Example: 950 is between 90% of 1000 and 90% of 5000
        if (submissions >= currentTarget * 0.9 &&
            submissions < nextTarget * 0.9) {
            return nextTarget;
        }
    }

    return maxTarget;
}