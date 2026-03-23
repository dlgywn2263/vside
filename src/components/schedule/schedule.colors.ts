import type { ProjectStage } from "./schedule.types";

export const STAGE_BADGE_COLORS: Record<ProjectStage, string> = {
  Planning: "bg-blue-500 text-white hover:bg-blue-500",
  Design: "bg-pink-500 text-white hover:bg-pink-500",
  Implementation: "bg-purple-500 text-white hover:bg-purple-500",
  Wrapup: "bg-green-500 text-white hover:bg-green-500",
};

export const STAGE_LABELS: Record<ProjectStage, string> = {
  Planning: "기획",
  Design: "설계",
  Implementation: "구현",
  Wrapup: "마무리",
};
