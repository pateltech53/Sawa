export type Role = "student" | "parent" | "teacher";
export type Lang = "en" | "ar";
export type AgeTier = "u15" | "15plus";

export interface Profile {
  id: string;
  role: Role;
  name: string;
  nameAr: string;
  schoolId: string;
  grade?: string;
  birthYear?: number;
  interests: string[];
  avatar: string; // emoji initials fallback
}

export interface GuardianLink {
  guardianId: string;
  childId: string;
  verifiedVia: "uae_pass_sim";
  createdAt: string;
}

/** F2 + F5 — one row per item in a user's Today, regardless of which system it came from */
export interface Notice {
  id: string;
  userId: string; // owner (student id — parents see linked children's rows)
  sourceSystem: string; // "Al Manhal" | "LMS" | "School" | "Minhaji" | "Sawa"
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  dueAt?: string;
  priority: 1 | 2 | 3; // 1 = urgent
  kind: "notice" | "assignment" | "exam" | "event" | "proactive";
  status: "open" | "done";
  reasonEn?: string; // "Why am I seeing this?"
  reasonAr?: string;
  action?: { labelEn: string; labelAr: string; href: string };
  announcementId?: string;
}

export interface Service {
  id: string;
  nameEn: string;
  nameAr: string;
  ownerSystem: string;
  descEn: string;
  descAr: string;
  isDemoFlow: boolean;
  href?: string;
  fields: string[]; // service_field_map
}

export type RequestStatus = "submitted" | "in_review" | "done";
export interface ServiceRequest {
  id: string;
  serviceId: string;
  requesterId: string;
  childId: string;
  payload: Record<string, string>;
  status: RequestStatus;
  history: { status: RequestStatus; at: string; by: string }[];
  fieldsRetyped: number;
  fieldsPrefilled: number;
  updatedAt: string;
}

export interface ProfileFact {
  childId: string;
  field: string;
  value: string;
  sourceDoc: string;
  verifiedBy: string;
  verifiedAt: string;
}

export interface Announcement {
  id: string;
  teacherId: string;
  title: string;
  body: string;
  kind: "notice" | "exam" | "event";
  startsAt?: string;
  audience: { grade: string; includeParents: boolean };
  createdAt: string;
  recipients: string[]; // user ids it fanned out to
  seenBy: string[];
}

export interface School {
  id: string;
  name: string;
  nameAr: string;
  area: string;
  lat: number;
  lng: number;
  curriculum: string;
  source: string;
  /** Optional KHDA directory fields. Present only when the dataset provides them. */
  rating?: string;
  ratingYear?: string;
  grades?: string;
  gender?: "Mixed" | "Boys" | "Girls";
  feeRange?: string;
  established?: string;
  students?: number;
  website?: string;
  specialities?: string[];
  sector?: "Public" | "Private";
}

export type OpportunityType = "competition" | "workshop" | "club" | "hackathon" | "mun" | "volunteering" | "leadership" | "event";
export interface Opportunity {
  id: string;
  schoolId: string;
  titleEn: string;
  titleAr: string;
  type: OpportunityType;
  organiser?: string;
  emirate?: string;
  deadline?: string;
  durationEn?: string;
  fee?: string;
  teamSize?: string;
  maxAge?: number;
  image?: string; // /figma/interests/*.png
  tint?: string; // card wash colour
  detailsEn?: string;
  startsAt: string;
  interests: string[];
  minAge: number;
  needsConsent: boolean;
  descEn: string;
  descAr: string;
}

export interface Community {
  id: string;
  name: string;
  nameAr: string;
  scope: "school" | "cross_school";
  minAge: number;
  moderated: boolean;
  members: number;
  interests: string[];
  emirate: string;
  category?: "clubs" | "stem" | "creative" | "sports" | "leadership";
  image?: string;
  tint?: string;
  aboutEn?: string;
  online?: number;
  moderators?: string[];
}

export interface CommunityPost {
  id: string;
  communityId: string;
  author: string; // display name only, never a real student
  role: "moderator" | "member" | "teacher";
  kind: "announcement" | "discussion";
  body: string;
  createdAt: string;
  status: "approved" | "pending";
  helpful: number;
}

export interface CommunityActivity {
  id: string;
  communityId: string;
  titleEn: string;
  startsAt: string;
  place: string;
}

export interface ClassroomCourse {
  id: string;
  name: string;
  teacher: string;
  room: string;
  color: string;
}

export interface ClassroomWork {
  id: string;
  courseId: string;
  title: string;
  dueAt: string;
  status: "assigned" | "submitted" | "returned" | "missing";
  points?: number;
  grade?: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  at: string;
  done: boolean;
  linkHref?: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  role: string;
  progress: number;
  due?: string;
  image?: string;
}

export interface Approval {
  id: string;
  childId: string;
  guardianId: string;
  opportunityId: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
  decidedAt?: string;
}

export interface KbDoc {
  id: string;
  titleEn: string;
  titleAr: string;
  sourceUrl: string;
  sourceName: string;
  textEn: string;
  textAr: string;
  keywords: string[];
  serviceId?: string;
}

export interface DataSource {
  name: string;
  portal: string;
  url: string;
  usedFor: string;
  lastUpdated: string;
  status: "sample" | "imported";
}

/* ───────────── Teacher workspace ───────────── */

export type Subject = "Science" | "Maths" | "English" | "Arabic" | "Computing" | "Art" | "Social Studies" | "Islamic Studies";

export interface RosterStudent {
  id: string; // matches a Profile id when the student also uses Sawa
  name: string;
  nameAr: string;
  birthYear: number;
  interests: string[];
  /** Support flags the school shares with class teachers (sample). Never health or family details. */
  support?: "extension" | "learning_support";
}

export interface TeacherClass {
  id: string;
  name: string; // "8A Science"
  nameAr: string;
  subject: Subject;
  grade: string;
  room: string;
  color: string;
  studentIds: string[];
  /** Where the class lives today. Sawa reads from it; it does not replace it. */
  source: "Google Classroom" | "Microsoft Teams" | "ManageBac" | "Sawa";
}

export interface TimetableSlot {
  day: number; // 0 = Sunday ... 4 = Thursday (UAE school week, Mon-Fri also supported)
  period: number;
  start: string; // "07:30"
  end: string;
  classId?: string;
  label?: string; // duty, PLC meeting
}

export interface TAssignment {
  id: string;
  classId: string;
  title: string;
  kind: "homework" | "quiz" | "project" | "lab";
  dueAt: string;
  points: number;
  createdAt: string;
  status: "draft" | "published";
  returned?: boolean;
}

export interface Submission {
  status: "missing" | "submitted" | "late" | "graded";
  score?: number;
  feedback?: string;
}

export type ResourceKind = "worksheet" | "slides" | "lesson_plan" | "assessment" | "video" | "link";
export interface Resource {
  id: string;
  title: string;
  titleAr?: string;
  kind: ResourceKind;
  subject: Subject;
  grades: string[];
  owner: string; // display name
  ownerId: string;
  school: string;
  scope: "mine" | "school" | "network";
  sizeKb?: number;
  fileName?: string;
  url?: string;
  tags: string[];
  saves: number;
  createdAt: string;
  sharedWith?: string[]; // class ids
  summary?: string;
}

export interface Educator {
  id: string;
  name: string;
  nameAr: string;
  schoolId: string;
  subjects: Subject[];
  grades: string;
  years: number;
  bio: string;
  openTo: ("resource_swap" | "mentoring" | "co_teaching" | "competitions")[];
}

export interface TeacherCommunity {
  id: string;
  name: string;
  nameAr: string;
  members: number;
  subject?: Subject;
  about: string;
  emirate: string;
  moderated: boolean;
}

export interface JobPosting {
  id: string;
  schoolId: string;
  title: string;
  subject: Subject;
  grades: string;
  start: string;
  contract: string;
  postedAt: string;
  closesAt: string;
  source: string;
}

export interface PdProgramme {
  id: string;
  title: string;
  provider: string;
  format: "online" | "in_person" | "blended";
  hours: number;
  startsAt: string;
  subjects: (Subject | "All")[];
  cost: string;
  certificate: boolean;
  about: string;
  source: string;
}

export interface Recommendation {
  id: string;
  opportunityId: string;
  classId: string;
  studentIds: string[];
  note: string;
  at: string;
}

export interface Sponsorship {
  id: string;
  opportunityId: string;
  classId: string;
  students: number;
  budget: string;
  reason: string;
  status: "submitted" | "approved" | "declined";
  history: { status: Sponsorship["status"]; at: string; by: string }[];
}

/** One answer from SAWA AI for teachers. `verified` is built from retrieved records, never by the model. */
export interface TeacherAiAnswer {
  answer: string;
  verified: { label: string; value: string; source: string }[];
  advice: string[];
  questions?: string[];
  missing: string[];
  records: { type: "school" | "opportunity" | "job" | "pd" | "educator" | "resource"; id: string; title: string; sub: string; href: string }[];
  sources: { n: number; title: string; url: string; name: string; status: "live" | "sample" | "mock" | "imported" }[];
  actions: { label: string; href: string; confirm?: string }[];
  draft?: { title: string; body: string };
  mode: string;
  tools: string[];
  flagged?: boolean;
}
