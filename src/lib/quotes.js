export const MOTIVATIONAL_QUOTES = [
  'Small steps every day add up to big wins.',
  'Focus on progress, not perfection.',
  'Your future self will thank you for studying today.',
  'Learning is a superpower — keep going!',
  'One session at a time. You’ve got this.',
  'Curiosity is the engine of achievement.',
  'Rest is part of the process — then come back strong.',
  'Consistency beats intensity when intensity is inconsistent.',
  'Every expert was once a beginner.',
  'Make it fun, make it stick.',
]

export function randomQuote() {
  return MOTIVATIONAL_QUOTES[
    Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
  ]
}
