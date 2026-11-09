"use client";

import { Card, PageTitle, Pill } from "@/components/ui";
import { useStore } from "@/lib/store";

/**
 * Before/after for the "update my child's school file" journey.
 * BEFORE values are the team's estimate and MUST be replaced with counts from your own
 * interviews/tests ("4 of 5 parents said…"). AFTER values are measured live in this app.
 */
const BEFORE = { portals: 3, logins: 3, retyped: 8, minutes: 15 };

export default function Impact() {
  const { state } = useStore();
  const ar = state.lang === "ar";
  const last = state.requests.find((r) => r.serviceId === "svc-school-file");
  const after = { portals: 1, logins: 1, retyped: last?.fieldsRetyped ?? 0 };
  const rows: [string, string | number, string | number][] = [
    [ar ? "بوابات تمت زيارتها" : "Portals visited", BEFORE.portals, after.portals],
    [ar ? "مرات تسجيل الدخول" : "Logins", BEFORE.logins, after.logins],
    [ar ? "حقول أعيدت كتابتها" : "Fields re-typed", BEFORE.retyped, after.retyped],
    [ar ? "الدقائق" : "Minutes", `~${BEFORE.minutes}`, last ? "< 1" : "—"],
  ];
  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "قبل / بعد" : "Before / after"} sub={ar ? "رحلة: تحديث ملف الطالب بعد تجديد الهوية" : "Journey: update the school file after an ID renewal"} />
      <Card strong>
        <table className="w-full text-sm">
          <thead><tr className="text-start text-xs text-[var(--muted)]"><th className="py-2 text-start"></th><th>{ar ? "قبل" : "Before"}</th><th>{ar ? "مع سوا" : "With Sawa"}</th></tr></thead>
          <tbody>
            {rows.map(([k, b, a]) => (
              <tr key={k} className="border-t border-black/5">
                <td className="py-3 font-semibold">{k}</td>
                <td className="text-center text-lg text-[var(--muted)] line-through decoration-aered-400"><bdi>{b}</bdi></td>
                <td className="text-center font-[family-name:var(--font-display)] text-2xl font-extrabold"><bdi>{a}</bdi></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="gold">{ar ? "«قبل» = تقديرنا — استبدله ببيانات المقابلات" : "\"Before\" = our estimate — replace with interview data"}</Pill>
          <Pill tone="green">{last ? (ar ? "«بعد» مُقاس في هذا التطبيق" : "\"After\" measured in this app") : ar ? "أكمل الرحلة لقياس «بعد»" : "Complete the journey to measure \"after\""}</Pill>
        </div>
      </Card>
    </div>
  );
}
