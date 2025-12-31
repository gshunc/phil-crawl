/**
 * Onboarding Static Data
 *
 * Canonical philosophical texts and category structure for the onboarding flow.
 */

import type { CanonicalText, CategoryWithSubtopics } from "@/types";

// =============================================
// CANONICAL PHILOSOPHICAL TEXTS
// =============================================

export const CANONICAL_TEXTS: CanonicalText[] = [
  // Ancient Philosophy
  { title: "Republic", author: "Plato", year: "c. 375 BCE" },
  { title: "Nicomachean Ethics", author: "Aristotle", year: "c. 340 BCE" },
  { title: "Meditations", author: "Marcus Aurelius", year: "c. 170 CE" },
  { title: "Enchiridion", author: "Epictetus", year: "c. 125 CE" },

  // Medieval Philosophy
  { title: "Confessions", author: "Augustine", year: "c. 400 CE" },
  { title: "Summa Theologica", author: "Thomas Aquinas", year: "1265-1274" },

  // Early Modern Philosophy
  { title: "Meditations on First Philosophy", author: "René Descartes", year: "1641" },
  { title: "Ethics", author: "Baruch Spinoza", year: "1677" },
  { title: "An Essay Concerning Human Understanding", author: "John Locke", year: "1689" },
  { title: "A Treatise of Human Nature", author: "David Hume", year: "1739" },
  { title: "Critique of Pure Reason", author: "Immanuel Kant", year: "1781" },
  { title: "Groundwork of the Metaphysics of Morals", author: "Immanuel Kant", year: "1785" },

  // 19th Century
  { title: "Phenomenology of Spirit", author: "G.W.F. Hegel", year: "1807" },
  { title: "The World as Will and Representation", author: "Arthur Schopenhauer", year: "1818" },
  { title: "Fear and Trembling", author: "Søren Kierkegaard", year: "1843" },
  { title: "On Liberty", author: "John Stuart Mill", year: "1859" },
  { title: "Utilitarianism", author: "John Stuart Mill", year: "1863" },
  { title: "Beyond Good and Evil", author: "Friedrich Nietzsche", year: "1886" },
  { title: "Thus Spoke Zarathustra", author: "Friedrich Nietzsche", year: "1883-1885" },

  // 20th Century
  { title: "Being and Time", author: "Martin Heidegger", year: "1927" },
  { title: "Being and Nothingness", author: "Jean-Paul Sartre", year: "1943" },
  { title: "Philosophical Investigations", author: "Ludwig Wittgenstein", year: "1953" },
  { title: "A Theory of Justice", author: "John Rawls", year: "1971" },
  { title: "Anarchy, State, and Utopia", author: "Robert Nozick", year: "1974" },
  { title: "After Virtue", author: "Alasdair MacIntyre", year: "1981" },

  // Contemporary
  { title: "The Structure of Scientific Revolutions", author: "Thomas Kuhn", year: "1962" },
  { title: "Reasons and Persons", author: "Derek Parfit", year: "1984" },
  { title: "The View from Nowhere", author: "Thomas Nagel", year: "1986" },
  { title: "Sources of the Self", author: "Charles Taylor", year: "1989" },
];

// =============================================
// PHILOSOPHICAL CATEGORIES WITH SUBTOPICS
// =============================================

export const CATEGORIES: CategoryWithSubtopics[] = [
  {
    name: "Ethics",
    subtopics: [
      "Virtue Ethics",
      "Deontology",
      "Consequentialism",
      "Meta-Ethics",
      "Applied Ethics",
    ],
  },
  {
    name: "Metaphysics",
    subtopics: [
      "Ontology",
      "Free Will",
      "Mind-Body Problem",
      "Time and Persistence",
      "Causation",
    ],
  },
  {
    name: "Epistemology",
    subtopics: [
      "Rationalism",
      "Empiricism",
      "Skepticism",
      "Justified Belief",
      "Knowledge and Truth",
    ],
  },
  {
    name: "Philosophy of Mind",
    subtopics: [
      "Consciousness",
      "Personal Identity",
      "Mental Causation",
      "Intentionality",
      "Qualia",
    ],
  },
  {
    name: "Political Philosophy",
    subtopics: [
      "Social Contract",
      "Justice and Rights",
      "Liberty and Authority",
      "Democracy",
      "Property and Distribution",
    ],
  },
  {
    name: "Logic and Language",
    subtopics: [
      "Formal Logic",
      "Philosophy of Language",
      "Meaning and Reference",
      "Truth Theories",
      "Paradoxes",
    ],
  },
  {
    name: "Aesthetics",
    subtopics: [
      "Beauty and Taste",
      "Art and Expression",
      "Aesthetic Experience",
      "Criticism and Interpretation",
    ],
  },
  {
    name: "Philosophy of Science",
    subtopics: [
      "Scientific Method",
      "Realism vs Anti-Realism",
      "Explanation and Laws",
      "Theory Change",
    ],
  },
  {
    name: "Existentialism",
    subtopics: [
      "Authenticity",
      "Absurdity and Meaning",
      "Freedom and Responsibility",
      "Anxiety and Death",
    ],
  },
  {
    name: "Eastern Philosophy",
    subtopics: [
      "Buddhism",
      "Confucianism",
      "Taoism",
      "Hindu Philosophy",
    ],
  },
];

// =============================================
// STARTING CONCEPT RECOMMENDATIONS
// =============================================

/**
 * Maps familiarity levels to recommended starting concepts.
 * Each entry has concepts that work well for users at that level.
 */
export const STARTING_CONCEPTS: Record<
  string,
  { slug: string; name: string; description: string }[]
> = {
  // Good starting points for beginners
  beginner: [
    {
      slug: "stoicism",
      name: "Stoicism",
      description: "Ancient philosophy focused on virtue, resilience, and inner peace",
    },
    {
      slug: "utilitarianism",
      name: "Utilitarianism",
      description: "Ethical theory based on maximizing happiness and well-being",
    },
    {
      slug: "social-contract",
      name: "Social Contract",
      description: "Theory of political authority based on mutual agreement",
    },
    {
      slug: "skepticism",
      name: "Skepticism",
      description: "Questioning the possibility of certain knowledge",
    },
  ],

  // Intermediate concepts that assume some background
  intermediate: [
    {
      slug: "virtue-ethics",
      name: "Virtue Ethics",
      description: "Aristotelian approach to morality based on character",
    },
    {
      slug: "categorical-imperative",
      name: "Categorical Imperative",
      description: "Kant's foundational principle of moral law",
    },
    {
      slug: "phenomenology",
      name: "Phenomenology",
      description: "Study of structures of consciousness and experience",
    },
    {
      slug: "empiricism",
      name: "Empiricism",
      description: "Knowledge derives primarily from sensory experience",
    },
  ],

  // Advanced concepts for experienced users
  advanced: [
    {
      slug: "transcendental-idealism",
      name: "Transcendental Idealism",
      description: "Kant's theory of the conditions of possible experience",
    },
    {
      slug: "hermeneutics",
      name: "Hermeneutics",
      description: "Theory and methodology of interpretation",
    },
    {
      slug: "process-philosophy",
      name: "Process Philosophy",
      description: "Reality as fundamentally constituted by processes",
    },
    {
      slug: "meta-ethics",
      name: "Meta-Ethics",
      description: "The nature, scope, and meaning of moral judgment",
    },
  ],
};

/**
 * Get recommended starting concepts based on a user's category familiarities.
 * Finds the dominant level across all categories and returns matching concepts.
 */
export function getRecommendedConcepts(
  familiarities: { category: string; subtopic: string; familiarity: string }[]
): {
  level: "beginner" | "intermediate" | "advanced";
  concepts: { slug: string; name: string; description: string }[];
} {
  if (familiarities.length === 0) {
    return { level: "beginner", concepts: STARTING_CONCEPTS.beginner };
  }

  // Count familiarity levels
  const counts = { beginner: 0, intermediate: 0, advanced: 0 };
  for (const f of familiarities) {
    if (f.familiarity in counts) {
      counts[f.familiarity as keyof typeof counts]++;
    }
  }

  // Determine dominant level
  let dominantLevel: "beginner" | "intermediate" | "advanced" = "beginner";
  if (counts.advanced > counts.intermediate && counts.advanced > counts.beginner) {
    dominantLevel = "advanced";
  } else if (counts.intermediate >= counts.advanced && counts.intermediate > counts.beginner) {
    dominantLevel = "intermediate";
  }

  return { level: dominantLevel, concepts: STARTING_CONCEPTS[dominantLevel] };
}
