"use client";

import * as React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CalendarEvent } from "@/components/schedule/schedule.types";
import {
  STAGE_BADGE_COLORS,
  STAGE_LABELS,
} from "@/components/schedule/schedule.colors";

type Props = {
  selectedDate: Date;
  dayEvents: CalendarEvent[];
  onWriteDevlog?: (event: CalendarEvent) => void;
};

export default function DevlogReadonlySelectedDayCard({
  selectedDate,
  dayEvents,
  onWriteDevlog,
}: Props) {
  return (
    <Card className="rounded-2xl border bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-[18px] font-bold">선택 날짜 일정</CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(selectedDate, "yyyy.MM.dd (EEE)", { locale: ko })}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {dayEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
            해당 날짜에 일정이 없습니다.
          </div>
        ) : (
          dayEvents.map((event) => (
            <div key={event.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{event.category}</Badge>

                {event.stage ? (
                  <Badge className={STAGE_BADGE_COLORS[event.stage]}>
                    {STAGE_LABELS[event.stage]}
                  </Badge>
                ) : null}

                <div className="truncate font-medium">{event.title}</div>
              </div>

              <div className="mt-2 text-sm text-muted-foreground">
                {event.startDateISO}
                {event.startDateISO !== event.endDateISO
                  ? ` ~ ${event.endDateISO}`
                  : ""}
              </div>

              {event.location ? (
                <div className="mt-1 text-sm">{event.location}</div>
              ) : null}

              {event.description ? (
                <div className="mt-3 rounded-lg bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                  {event.description}
                </div>
              ) : null}

              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  onClick={() => onWriteDevlog?.(event)}
                  className="rounded-sm"
                >
                  일지 쓰기
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
