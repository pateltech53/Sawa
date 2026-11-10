"use client";

import { useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { StudentHome } from "@/components/s/StudentHome";
import { ParentHome } from "@/components/parent/ParentHome";
import { TeacherToday } from "@/components/teacher/TeacherToday";

export default function Today() {
  const { me, visibleNotices, markSeen } = useStore();
  // "seen by" counts for teacher posts
  const annIds = useMemo(() => [...new Set(visibleNotices.filter((n) => n.announcementId).map((n) => n.announcementId!))], [visibleNotices]);
  useEffect(() => {
    if (me && annIds.length) markSeen(annIds, me.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annIds.join(","), me?.id]);
  if (!me) return null;
  if (me.role === "student") return <StudentHome />;
  if (me.role === "parent") return <ParentHome />;
  return <TeacherToday />;
}
