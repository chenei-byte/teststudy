export const SUBJECT_OPTIONS = [
  { id: 'math', label: 'Math', emoji: '🔢', className: 'subj-math' },
  { id: 'science', label: 'Science', emoji: '🧪', className: 'subj-science' },
  { id: 'history', label: 'History', emoji: '📜', className: 'subj-history' },
  { id: 'language', label: 'Language', emoji: '🌍', className: 'subj-language' },
  { id: 'cs', label: 'CS', emoji: '💻', className: 'subj-cs' },
  { id: 'general', label: 'General', emoji: '📚', className: 'subj-general' },
]

export function subjectMeta(id) {
  return SUBJECT_OPTIONS.find((s) => s.id === id) || SUBJECT_OPTIONS[5]
}
