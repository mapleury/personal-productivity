export interface AssistantContext {
  name: string;
  currentTime: string;
  todaySchedule: { title: string; start: string; end?: string; type: string }[];
  tasks: { title: string; priority: string; status: string; dueDate?: string; dueTime?: string }[];
  completedToday: string[];
  priorities: string[];
  weeklyGoals: { title: string; progress: number; deadline: string }[];
  focusSessions: { minutes: number; label?: string | null }[];
  stats: {
    focusMin: number;
    tasksDone: number;
    planned: number;
    plannedDone: number;
    streak: number;
    planPct: number;
  };
}

const hm = (s: string) => s;

function scheduleLines(ctx: AssistantContext): string {
  if (!ctx.todaySchedule.length) return "You have no calendar information for today.";
  return ctx.todaySchedule
    .map((e) => `${hm(e.start)}${e.end ? `–${e.end}` : ""} ${e.title}${e.type ? ` (${e.type})` : ""}`)
    .join("\n");
}

function nextEvent(ctx: AssistantContext) {
  const now = new Date(ctx.currentTime);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const upcoming = ctx.todaySchedule
    .map((e) => ({ ...e, min: Number(e.start.slice(0, 2)) * 60 + Number(e.start.slice(3, 5)) }))
    .filter((e) => e.min > nowMin)
    .sort((a, b) => a.min - b.min)[0];
  return upcoming ? { ...upcoming, inMin: upcoming.min - nowMin } : null;
}

function focusMinutes(ctx: AssistantContext): string {
  const h = Math.floor(ctx.stats.focusMin / 60);
  const m = ctx.stats.focusMin % 60;
  return h ? `${h} hour${h > 1 ? "s" : ""} ${m} minute${m === 1 ? "" : "s"}` : `${m} minutes`;
}

export function dailyBriefing(ctx: AssistantContext): string {
  const open = ctx.tasks.filter((t) => t.status !== "done");
  const next = nextEvent(ctx);
  const parts: string[] = [];
  parts.push(
    `You have ${open.length ? open.length : "no"} open task${open.length === 1 ? "" : "s"} today${
      open.length ? `, ${open.filter((t) => t.priority === "high" || t.priority === "critical").length} of them high priority` : ""
    }.`,
  );
  if (next) parts.push(`Your next event is ${next.title} at ${next.start}.`);
  else parts.push("You have no further events today.");
  parts.push(
    `You've completed ${ctx.stats.planPct}% of today's planned work and logged ${focusMinutes(ctx)} of focus time across ${ctx.focusSessions.length} session${ctx.focusSessions.length === 1 ? "" : "s"}.`,
  );
  if (ctx.priorities.length) parts.push(`Your highest priority is ${ctx.priorities[0]}.`);
  if (ctx.stats.streak > 0) parts.push(`You're on a ${ctx.stats.streak}-day activity streak.`);
  return parts.join(" ");
}

export function answerLocally(message: string, ctx: AssistantContext): string {
  const q = message.toLowerCase();
  const open = ctx.tasks.filter((t) => t.status !== "done");

  if (/read .*schedule|schedule today|what.*schedule|my day/.test(q)) {
    return ctx.todaySchedule.length
      ? `Here's your day:\n${scheduleLines(ctx)}`
      : "You have no calendar information for today.";
  }
  if (/next event|before my next|time do i have|what.*next|do next/.test(q)) {
    const next = nextEvent(ctx);
    if (!next) return "Nothing else on your calendar today. The rest of the day is unscheduled.";
    return `Your next event is ${next.title} at ${next.start} — in about ${next.inMin} minutes. ${
      open.length ? `Before then, the best use of time is ${open[0].title}.` : ""
    }`;
  }
  if (/priorit|matter|focus on now|should i focus|what now/.test(q)) {
    if (!ctx.priorities.length)
      return open.length
        ? `Nothing is flagged as top priority. Your next open task is ${open[0].title}.`
        : "Your task list is clear — nothing is waiting.";
    return `Today's focus:\n${ctx.priorities.map((p, i) => `${i + 1}. ${p}`).join("\n")}`;
  }
  if (/productive|how was my day|stats|how am i doing/.test(q)) {
    return `So far: ${ctx.stats.tasksDone} task${ctx.stats.tasksDone === 1 ? "" : "s"} completed of ${
      ctx.stats.planned || ctx.stats.tasksDone
    } planned (${ctx.stats.planPct}%), ${focusMinutes(ctx)} of focus across ${
      ctx.focusSessions.length
    } session${ctx.focusSessions.length === 1 ? "" : "s"}, and a ${ctx.stats.streak}-day activity streak.`;
  }
  if (/task|left|todo|to-do/.test(q)) {
    if (!open.length) return "Your task list is empty. Nothing left today.";
    return `You have ${open.length} open task${open.length === 1 ? "" : "s"}:\n${open
      .slice(0, 8)
      .map((t) => `• ${t.title}${t.dueTime ? ` (${t.dueTime})` : ""} — ${t.priority}`)
      .join("\n")}`;
  }
  if (/goal/.test(q)) {
    if (!ctx.weeklyGoals.length) return "No weekly goals are set.";
    return `This week's goals:\n${ctx.weeklyGoals.map((g) => `• ${g.title} — ${g.progress}%`).join("\n")}`;
  }
  if (/streak/.test(q)) {
    return ctx.stats.streak
      ? `You're on a ${ctx.stats.streak}-day activity streak. Keep it alive with at least one focus session or completed task today.`
      : "No active streak yet — complete a task or finish a focus session today to start one.";
  }
  return dailyBriefing(ctx);
}
