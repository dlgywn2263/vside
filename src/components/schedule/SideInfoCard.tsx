"use client";

import type { Mode, Team } from "./schedule.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Props = {
  mode: Mode;
  currentTeam?: Team;
  personalNextTitle: string;
  monthTopCategory: string;
  onQuickCreate: () => void;
};

export default function SideInfoCard({
  mode,
  currentTeam,
  personalNextTitle,
  monthTopCategory,
  onQuickCreate,
}: Props) {
  if (mode === "team") {
    return (
      <Card className="h-full rounded-2xl">
        <CardHeader>
          <CardTitle>팀 정보</CardTitle>
          <CardDescription>
            {currentTeam?.name ?? "팀 정보 없음"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentTeam?.members?.length ? (
              currentTeam.members.map((member) => (
                <Badge key={member.userId} variant="outline">
                  {member.name}
                </Badge>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                팀 멤버가 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full rounded-2xl">
      <CardHeader>
        <CardTitle>개인 요약</CardTitle>
        <CardDescription>빠른 확인용</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">다음 일정</div>
          <div className="text-sm font-medium">{personalNextTitle}</div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">
            이번 달 최다 카테고리
          </div>
          <div className="text-sm font-medium">{monthTopCategory}</div>
        </div>

        <Button variant="outline" onClick={onQuickCreate}>
          + 일정 빠르게 추가
        </Button>
      </CardContent>
    </Card>
  );
}
