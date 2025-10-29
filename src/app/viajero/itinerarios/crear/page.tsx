// app/viajero/itinerarios/crear/page.tsx
import {
  eachDayOfInterval,
  parseISO,
  differenceInCalendarDays,
} from "date-fns";
import { EditorShell } from "@/components/viajero/editor/EditorShell";

type Search = {
  region?: string;
  start?: string;
  end?: string;
};

export default function Page({ searchParams }: { searchParams?: Search }) {
  const region = searchParams?.region;
  const start = searchParams?.start ? parseISO(searchParams.start) : undefined;
  const end = searchParams?.end ? parseISO(searchParams.end) : undefined;

  const days =
    start && end
      ? eachDayOfInterval({ start, end }).map((d, i) => ({
          key: `d-${i}`,
          date: d,
        }))
      : [{ key: "d-0", date: undefined }];

  const nights =
    start && end ? Math.max(0, differenceInCalendarDays(end, start)) : 0;

  return (
    <main className="min-h-[calc(100dvh-64px)]">
      <EditorShell
        region={region}
        start={start}
        end={end}
        days={days}
        nights={nights}
      />
    </main>
  );
}
