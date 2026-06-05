const MAX_DIFFICULTY = 5

export function renderDifficultyStars(difficulty: number): string {
  return '⭐'.repeat(Math.min(difficulty, MAX_DIFFICULTY))
}

export function getDifficultyAriaLabel(difficulty: number): string {
  return `难度 ${Math.min(difficulty, MAX_DIFFICULTY)}/${MAX_DIFFICULTY}`
}
