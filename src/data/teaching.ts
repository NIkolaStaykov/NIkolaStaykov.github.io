/**
 * Teaching and lab-assistant roles, newest first.
 *
 * Analysis I and Engineering Mechanics I run in Fall; Analysis II in Spring.
 * `url` links the term to a public course page — none set yet; send the course
 * numbers and they can be wired up.
 */

export interface TeachingItem {
  /** Institution and course name. */
  course: string;
  term: string;
  /** Course page, if there is a public one. The term links to it. */
  url?: string;
}

export const teaching: TeachingItem[] = [
  { course: 'ETH Analysis I', term: 'Fall 2026' },
  { course: 'ETH Analysis II', term: 'Spring 2025' },
  { course: 'TUM Engineering Mechanics I', term: 'Fall 2023' },
  { course: 'TUM Analysis I', term: 'Fall 2023' },
];
