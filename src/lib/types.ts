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
  photo?: string; // /photos/*.jpg (Unsplash, bundled)
  source?: string; // where a real listing like this would come from
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
  photo?: string;
  schools?: number;
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
  milestones?: { id: string; label: string; done: boolean }[];
  notes?: string;
}
export interface UserPrefs { accent: string; showClassroom: boolean; showSignposts: boolean; showWeek: boolean }

export interface Approval {
  id: string;
  childId: string;
  guardianId: string;
  /** set for "opportunity" approvals (from Explore); other kinds come from the school */
  opportunityId?: string;
  kind?: "opportunity" | "trip" | "fees" | "media";
  titleEn?: string;
  titleAr?: string;
  detailEn?: string;
  detailAr?: string;
  fromEn?: string;
  dueAt?: string;
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

export interface SchoolBrand { name: string; logo: string; accent: string; inviteCode: string }
export interface ParentControls { outsideSchool: boolean; autoApproveSchoolClubs: boolean; messages: "school_only" | "nobody"; feedWindow: "after_school" | "weekends" | "off" }
export interface TeacherEvent {
  id: string; title: string; startsAt: string; place: string; classes: string[]; hostId: string;
  sponsorship?: { amountAed: number; reason: string; status: "requested" | "reviewing" | "approved"; history: { status: string; at: string }[] };
}
export interface ChatMsg { id: string; communityId: string; authorId: string; author: string; school: string; body: string; at: string; status: "visible" | "pending" }
