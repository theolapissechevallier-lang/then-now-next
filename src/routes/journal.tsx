import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/app-shell";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "Journal — Future Me" }] }),
  component: Journal,
});

function Journal() {
  const { today, setToday } = useAppState();

  return (
    <div>
      <ScreenHeader
        eyebrow="Daily reflection"
        title="Two questions."
        subtitle="A 60-second ritual to close the day with intention."
      />
      <div className="mt-6 space-y-4 px-5">
        <Field
          label="What did I do well today?"
          value={today.journalGood ?? ""}
          onChange={(v) => setToday({ journalGood: v })}
        />
        <Field
          label="What should I improve tomorrow?"
          value={today.journalImprove ?? ""}
          onChange={(v) => setToday({ journalImprove: v })}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <label className="text-sm font-semibold">{label}</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a sentence..."
        className="mt-3 min-h-[120px] resize-none border-0 bg-secondary/40 text-base focus-visible:ring-1"
      />
    </div>
  );
}