/** @param {{ totalSessions: number, streak: number, totalHoursAllTime: number }} stats */
export function computeBadges(stats) {
  const list = []
  if (stats.totalSessions >= 1) {
    list.push({
      id: 'first',
      emoji: '🎉',
      title: 'First Study Session',
      desc: 'Completed your first focus session',
    })
  }
  if (stats.streak >= 7) {
    list.push({
      id: 'streak7',
      emoji: '🔥',
      title: '7 Day Streak',
      desc: 'Studied 7 days in a row',
    })
  }
  if (stats.totalHoursAllTime >= 10) {
    list.push({
      id: 'hours10',
      emoji: '📚',
      title: '10 Hours Studied',
      desc: 'Logged 10+ hours total',
    })
  }
  if (stats.totalSessions >= 25) {
    list.push({
      id: 'pom25',
      emoji: '🍅',
      title: 'Pomodoro Pro',
      desc: '25 focus sessions completed',
    })
  }
  if (stats.tasksCompletedAllTime >= 20) {
    list.push({
      id: 'tasks20',
      emoji: '✅',
      title: 'Task Crusher',
      desc: '20 tasks moved to Done',
    })
  }
  return list
}
