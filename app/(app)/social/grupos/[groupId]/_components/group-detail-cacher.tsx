"use client";

import { useEffect } from "react";
import type { GroupDetail } from "@/lib/group-types";
import type { Profile } from "@/lib/profile-types";
import type { GridDay } from "@/lib/schedule-types";
import { cacheGroupDetail } from "@/lib/groups-offline-store";
import { cacheSchedule } from "@/lib/grilla-offline-store";

interface GroupDetailCacherProps {
  groupDetail: GroupDetail;
  groupAttendance: Record<string, Profile[]>;
  days: GridDay[];
  eventName: string;
}

/**
 * Invisible component that caches group detail data to IndexedDB
 * when mounted. Placed in the group detail page to ensure the
 * group's members and attendance are available offline.
 */
export function GroupDetailCacher({
  groupDetail,
  groupAttendance,
  days,
  eventName,
}: GroupDetailCacherProps) {
  useEffect(() => {
    // Cache group detail + attendance
    cacheGroupDetail(groupDetail.id, groupDetail, groupAttendance).catch(
      () => {},
    );
    // Also cache the schedule (needed to render group agenda offline)
    if (days.length > 0) {
      cacheSchedule(eventName, days).catch(() => {});
    }
  }, [groupDetail, groupAttendance, days, eventName]);

  return null;
}
