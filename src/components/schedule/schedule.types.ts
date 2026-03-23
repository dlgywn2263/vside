export type Category = "Work" | "Meeting" | "Study" | "Etc";
export type Mode = "personal" | "team";
export type EventStatus = "Todo" | "InProgress" | "Done";

export type ProjectStage = "Planning" | "Design" | "Implementation" | "Wrapup";

export type ProjectRole = "Frontend" | "Backend" | "Designer" | "Fullstack";

export type Member = {
  userId: number;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  members: Member[];
};

export type WorkspaceOption = {
  workspaceId: string;
  workspaceName: string;
};

export type CalendarEvent = {
  id: string;
  mode: Mode;
  workspaceId: string;
  workspaceName?: string;

  title: string;
  description?: string;
  location?: string;
  category: Category;

  startDateISO: string;
  endDateISO: string;

  assignees?: string[];

  stage?: ProjectStage;
  role?: ProjectRole;
  status?: EventStatus;

  creatorId?: number;
  creatorName?: string;
};

export type ApiScheduleResponse = {
  id: number;
  type: string;
  workspaceId: string;
  workspaceName?: string | null;
  creatorId?: number | null;
  creatorName?: string | null;
  title: string;
  startDate: string;
  endDate: string;
  category: string;
  location?: string | null;
  stage?: string | null;
  role?: string | null;
  status?: string | null;
  participants?: string | null;
  description?: string | null;
};

export type ApiWorkspaceOptionResponse = {
  workspaceId: string;
  workspaceName: string;
};

export type ApiTeamMemberResponse = {
  userId: number;
  name: string;
};

export const PROJECT_STAGES: ProjectStage[] = [
  "Planning",
  "Design",
  "Implementation",
  "Wrapup",
];

export const PROJECT_ROLES: ProjectRole[] = [
  "Frontend",
  "Backend",
  "Designer",
  "Fullstack",
];

export const EVENT_STATUSES: EventStatus[] = ["Todo", "InProgress", "Done"];
