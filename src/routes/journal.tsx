import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO } from "date-fns";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/app-shell";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useJournal } from "@/lib/journal-store";
import { useAppState } from "@/lib/store";
import type { MonthlySummary } from "@/lib/journal-types";
import { MOOD_CONFIG, type MoodType, type LifeEvent } from "@/lib/journal-types";
import { CalendarDays, Star, Trophy, Target, Sparkles, ChevronLeft, ChevronRight, Search, BookHeart } from "lucide-react";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "Journal — Future Me" }] }),
  component: Journal,
});

function Journal() {
  return (
    <div>
      <ScreenHeader
        eyebrow="Daily reflection"
        title="Your story."
        subtitle="Capture your moments, track your growth, remember your journey."
      />
      <Tabs defaultValue="today" className="mt-6">
        <TabsList className="mx-5 grid w-[calc(100%-2.5rem)] grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="memories">Memories</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4 px-5">
          <TodayEntry />
        </TabsContent>
        <TabsContent value="timeline" className="mt-4 px-5">
          <LifeTimeline />
        </TabsContent>
        <TabsContent value="calendar" className="mt-4 px-5">
          <CalendarView />
        </TabsContent>
        <TabsContent value="memories" className="mt-4 px-5">
          <MonthlyMemories />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Today's Entry ----------
function TodayEntry() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { getEntry, saveEntry, getMood, saveMood, saveHighlight, removeHighlight, highlights } = useJournal();
  const { addUserXp } = useAppState();

  const existingEntry = getEntry(today);
  const existingMood = getMood(today);
  const todayHighlight = highlights.find((h) => h.date === today);

  const [importantEvent, setImportantEvent] = useState(existingEntry?.importantEvent ?? "");
  const [proudOf, setProudOf] = useState(existingEntry?.proudOf ?? "");
  const [learned, setLearned] = useState(existingEntry?.learned ?? "");
  const [freeNotes, setFreeNotes] = useState(existingEntry?.freeNotes ?? "");
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(existingMood?.mood ?? null);
  const [saving, setSaving] = useState(false);
  const [highlightText, setHighlightText] = useState(todayHighlight?.title ?? "");
  const [showHighlightInput, setShowHighlightInput] = useState(false);

  useEffect(() => {
    if (existingEntry) {
      setImportantEvent(existingEntry.importantEvent ?? "");
      setProudOf(existingEntry.proudOf ?? "");
      setLearned(existingEntry.learned ?? "");
      setFreeNotes(existingEntry.freeNotes ?? "");
    }
  }, [existingEntry]);

  const handleSave = async () => {
    setSaving(true);
    const entryResult = await saveEntry(today, {
      importantEvent: importantEvent || undefined,
      proudOf: proudOf || undefined,
      learned: learned || undefined,
      freeNotes: freeNotes || undefined,
    });
    const moodResult = selectedMood ? await saveMood(today, selectedMood) : { xpEarned: 0 };
    const totalXp = entryResult.xpEarned + moodResult.xpEarned;
    if (totalXp > 0) {
      await addUserXp(totalXp);
      toast.success(`+${totalXp} XP for journaling!`);
    }
    setSaving(false);
  };

  const handleSaveHighlight = async () => {
    if (!highlightText.trim()) return;
    const result = await saveHighlight(today, {
      title: highlightText.trim(),
      emoji: "⭐",
    });
    if (result.xpEarned > 0) {
      await addUserXp(result.xpEarned);
      toast.success(`+${result.xpEarned} XP for highlighting your day!`);
    }
    setShowHighlightInput(false);
  };

  const handleRemoveHighlight = async () => {
    await removeHighlight(today);
    setHighlightText("");
  };

  return (
    <div className="space-y-4">
      {/* Mood selector */}
      <Card className="rounded-3xl border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">How are you feeling?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MOOD_CONFIG) as MoodType[]).map((mood) => (
              <Button
                key={mood}
                variant={selectedMood === mood ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMood(mood)}
                className={`rounded-full ${
                  selectedMood === mood
                    ? "bg-primary text-primary-foreground"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <span className="mr-1">{MOOD_CONFIG[mood].emoji}</span>
                {MOOD_CONFIG[mood].label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Journal fields */}
      <JournalField
        label="Most important thing that happened today"
        value={importantEvent}
        onChange={setImportantEvent}
        placeholder="The events, moments, or experiences that mattered most..."
      />
      <JournalField
        label="What I am proud of today"
        value={proudOf}
        onChange={setProudOf}
        placeholder="Small wins, big wins, anything you did that made you feel good..."
      />
      <JournalField
        label="What I learned today"
        value={learned}
        onChange={setLearned}
        placeholder="A lesson, an insight, something new you discovered..."
      />
      <JournalField
        label="Free notes"
        value={freeNotes}
        onChange={setFreeNotes}
        placeholder="Anything else you want to remember about today..."
      />

      {/* Highlight of the day */}
      <Card className="rounded-3xl border-border bg-gradient-to-br from-amber-500/10 to-orange-500/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Star className="h-4 w-4 text-amber-500" />
            Highlight of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayHighlight ? (
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{todayHighlight.title}</p>
                {todayHighlight.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{todayHighlight.description}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemoveHighlight} className="text-muted-foreground">
                Remove
              </Button>
            </div>
          ) : showHighlightInput ? (
            <div className="space-y-2">
              <Input
                value={highlightText}
                onChange={(e) => setHighlightText(e.target.value)}
                placeholder="What made today special?"
                className="border-border bg-secondary/40"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveHighlight} disabled={!highlightText.trim()}>
                  Save highlight
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowHighlightInput(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHighlightInput(true)}
              className="border-amber-500/30 hover:bg-amber-500/10"
            >
              <Star className="mr-2 h-4 w-4" />
              Mark a highlight
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Save button */}
      <Button onClick={handleSave} disabled={saving} className="w-full rounded-2xl">
        {saving ? "Saving..." : "Save entry"}
      </Button>
    </div>
  );
}

function JournalField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <Card className="rounded-3xl border-border bg-card">
      <CardContent className="p-5">
        <label className="text-sm font-semibold">{label}</label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-3 min-h-[100px] resize-none border-0 bg-secondary/40 text-base focus-visible:ring-1"
        />
      </CardContent>
    </Card>
  );
}

// ---------- Life Timeline ----------
function LifeTimeline() {
  const { lifeEvents, loading } = useJournal();
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents =
    filter === "all" ? lifeEvents : lifeEvents.filter((e) => e.eventType === filter);

  const groupedByMonth = filteredEvents.reduce(
    (acc, event) => {
      const month = format(parseISO(event.eventDate), "MMMM yyyy");
      if (!acc[month]) acc[month] = [];
      acc[month].push(event);
      return acc;
    },
    {} as Record<string, LifeEvent[]>,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {["all", "journal_highlight", "goal_completed", "trophy_unlocked", "pet_evolved", "milestone"].map((type) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type)}
            className="rounded-full"
          >
            {type === "all" && "All"}
            {type === "journal_highlight" && <Star className="mr-1 h-3 w-3" />}
            {type === "goal_completed" && <Target className="mr-1 h-3 w-3" />}
            {type === "trophy_unlocked" && <Trophy className="mr-1 h-3 w-3" />}
            {type === "pet_evolved" && <Sparkles className="mr-1 h-3 w-3" />}
            {type === "milestone" && <CalendarDays className="mr-1 h-3 w-3" />}
            {type === "journal_highlight" && "Highlights"}
            {type === "goal_completed" && "Goals"}
            {type === "trophy_unlocked" && "Trophies"}
            {type === "pet_evolved" && "Pet"}
            {type === "milestone" && "Milestones"}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      {Object.keys(groupedByMonth).length === 0 ? (
        <Card className="rounded-3xl border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookHeart className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Your timeline is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Complete goals, unlock trophies, or add highlights to see them here.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByMonth).map(([month, events]) => (
          <div key={month}>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{month}</h3>
            <div className="space-y-2">
              {events.map((event) => (
                <TimelineEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function TimelineEventCard({ event }: { event: LifeEvent }) {
  const emoji = event.emoji || getEventEmoji(event.eventType);
  const dateStr = format(parseISO(event.eventDate), "MMM d");

  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-lg">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{event.title}</p>
          {event.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{dateStr}</p>
        </div>
        <Badge variant="outline" className="flex-shrink-0 text-xs">
          {getEventLabel(event.eventType)}
        </Badge>
      </CardContent>
    </Card>
  );
}

function getEventEmoji(type: string): string {
  switch (type) {
    case "journal_highlight":
      return "⭐";
    case "goal_completed":
      return "🎯";
    case "trophy_unlocked":
      return "🏆";
    case "pet_evolved":
      return "✨";
    case "milestone":
      return "📅";
    case "streak":
      return "🔥";
    default:
      return "📝";
  }
}

function getEventLabel(type: string): string {
  switch (type) {
    case "journal_highlight":
      return "Highlight";
    case "goal_completed":
      return "Goal";
    case "trophy_unlocked":
      return "Trophy";
    case "pet_evolved":
      return "Pet";
    case "milestone":
      return "Milestone";
    case "streak":
      return "Streak";
    default:
      return "Event";
  }
}

// ---------- Calendar View ----------
function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { moods, entries, highlights, loading } = useJournal();
  const [searchQuery, setSearchQuery] = useState("");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad with days from previous month
  const startDay = monthStart.getDay();
  const paddingDays = Array.from({ length: startDay }, (_, i) => subDays(monthStart, startDay - i));

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  // Filter entries for search
  const searchResults = searchQuery
    ? entries.filter(
        (e) =>
          e.importantEvent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.proudOf?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.learned?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.freeNotes?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries..."
          className="rounded-2xl border-border bg-card pl-9"
        />
      </div>

      {/* Search results */}
      {searchResults && (
        <ScrollArea className="h-[300px] rounded-3xl border border-border bg-card p-4">
          {searchResults.length === 0 ? (
            <p className="text-center text-muted-foreground">No entries found</p>
          ) : (
            <div className="space-y-3">
              {searchResults.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    // Could navigate to specific date in future
                  }}
                  className="block w-full rounded-2xl bg-secondary/40 p-3 text-left hover:bg-secondary/60"
                >
                  <p className="text-xs text-muted-foreground">{format(parseISO(entry.date), "MMMM d, yyyy")}</p>
                  <p className="mt-1 text-sm font-medium line-clamp-2">
                    {entry.importantEvent || entry.proudOf || entry.learned || "Entry"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      )}

      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-sm font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-3xl border border-border bg-card p-4">
        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((day) => (
            <div key={day.toISOString()} className="aspect-square p-1 opacity-30">
              <div className="flex h-full w-full items-center justify-center rounded-lg text-xs text-muted-foreground">
                {format(day, "d")}
              </div>
            </div>
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const mood = moods.find((m) => m.date === dateStr);
            const entry = entries.find((e) => e.date === dateStr);
            const highlight = highlights.find((h) => h.date === dateStr);

            return (
              <div key={dateStr} className="aspect-square p-1">
                <div
                  className={`flex h-full w-full flex-col items-center justify-center rounded-lg text-xs transition-colors ${
                    isToday(day)
                      ? "bg-primary text-primary-foreground font-bold"
                      : mood
                        ? "bg-secondary"
                        : "hover:bg-secondary/50"
                  } ${entry ? "cursor-pointer" : ""}`}
                >
                  <span>{format(day, "d")}</span>
                  <div className="mt-0.5 flex gap-0.5">
                    {mood && (
                      <span className="text-[8px]" title={MOOD_CONFIG[mood.mood].label}>
                        {MOOD_CONFIG[mood.mood].emoji}
                      </span>
                    )}
                    {entry && <span className="text-[8px]">📝</span>}
                    {highlight && <span className="text-[8px]">⭐</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Mood</span>
          <span>😊</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Entry</span>
          <span>📝</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Highlight</span>
          <span>⭐</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Monthly Memories ----------
function MonthlyMemories() {
  const { getMonthlySummary, loading, moods, entries } = useJournal();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [summary, setSummary] = useState<MonthlySummary | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      const result = await getMonthlySummary(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() + 1,
      );
      setSummary(result);
    };
    loadSummary();
  }, [selectedMonth, getMonthlySummary]);

  const prevMonth = () => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  const nextMonth = () => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse">Loading memories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month selector */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-sm font-semibold">{format(selectedMonth, "MMMM yyyy")}</h3>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Summary card */}
      <Card className="rounded-3xl border-border bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-xl">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Your {format(selectedMonth, "MMMM")} Summary</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                {summary?.summary ?? "No activity this month yet."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Journal Entries" value={summary.stats.journalEntries} emoji="📝" />
          <StatCard label="Goals Completed" value={summary.stats.goalsCompleted} emoji="🎯" />
          <StatCard label="Trophies Unlocked" value={summary.stats.trophiesUnlocked} emoji="🏆" />
          <StatCard
            label="Top Mood"
            value={summary.stats.topMood ? MOOD_CONFIG[summary.stats.topMood as MoodType].label : "N/A"}
            emoji={summary.stats.topMood ? MOOD_CONFIG[summary.stats.topMood as MoodType].emoji : "—"}
          />
        </div>
      )}

      {/* Mood chart */}
      <Card className="rounded-3xl border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Mood Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodBarChart moods={moods} month={selectedMonth} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="text-xl">{emoji}</span>
        <div>
          <p className="text-lg font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MoodBarChart({ moods, month }: { moods: ReturnType<typeof useJournal>["moods"]; month: Date }) {
  const monthMoods = moods.filter((m) => {
    const d = parseISO(m.date);
    return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
  });

  const counts: Record<MoodType, number> = {
    amazing: 0,
    happy: 0,
    good: 0,
    neutral: 0,
    tired: 0,
    bad: 0,
  };

  for (const m of monthMoods) {
    counts[m.mood]++;
  }

  const total = monthMoods.length || 1;
  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div className="space-y-2">
      {(Object.keys(counts) as MoodType[]).map((mood) => {
        const count = counts[mood];
        const width = (count / maxCount) * 100;
        return (
          <div key={mood} className="flex items-center gap-2">
            <span className="w-24 text-xs">{MOOD_CONFIG[mood].emoji} {MOOD_CONFIG[mood].label}</span>
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  mood === "amazing" || mood === "happy"
                    ? "bg-green-500"
                    : mood === "good"
                      ? "bg-blue-500"
                      : mood === "neutral"
                        ? "bg-gray-500"
                        : mood === "tired"
                          ? "bg-purple-500"
                          : "bg-red-500"
                }`}
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
          </div>
        );
      })}
      {monthMoods.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">No moods recorded this month</p>
      )}
    </div>
  );
}
