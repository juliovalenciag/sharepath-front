"use client";
import MiniCalendar from "./MiniCalendar";
import TripChecklist from "./TripCheckList";
import TripBudget from "./TripBudget";
import QuickNotes from "./QuickNotes";

export default function TopSummary() {
  return (
    <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      <MiniCalendar />
      <TripChecklist />
    </section>
  );
}
