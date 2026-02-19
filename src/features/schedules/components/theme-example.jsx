import { CalendarDays, Clock3, GraduationCap } from "lucide-react"

function ClassBlockExample({ title, time, tone = "cm-schedule-block--blue" }) {
  return (
    <div className={`cm-schedule-block ${tone}`}>
      <p className="truncate font-semibold">{title}</p>
      <p className="mt-1 opacity-90">{time}</p>
    </div>
  )
}

function CardExample() {
  return (
    <article className="cm-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="cm-heading-md">Algorithms</h3>
          <p className="cm-text-muted text-sm">CS 374 • Section A1</p>
        </div>
        <span className="cm-chip px-2 py-1 text-xs">CRN 31420</span>
      </div>
      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <p className="cm-text-muted inline-flex items-center gap-2">
          <Clock3 className="size-4" />
          Mon/Wed/Fri, 10:00 AM
        </p>
        <p className="cm-text-muted inline-flex items-center gap-2">
          <GraduationCap className="size-4" />
          Engineering Hall 204
        </p>
      </div>
    </article>
  )
}

export function RefactoredScheduleExample() {
  return (
    <div className="cm-app-bg min-h-screen">
      <nav className="cm-navbar">
        <div className="cm-navbar-inner">
          <div>
            <p className="cm-text text-sm font-semibold tracking-wide">CLASSMATCH</p>
            <p className="cm-text-subtle text-xs">Academic Productivity</p>
          </div>
          <button type="button" className="cm-btn cm-btn-sm cm-btn-primary">
            New Schedule
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="cm-panel p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="cm-heading-md">Weekly Schedule Grid</h2>
              <p className="cm-text-muted text-sm">Scan classes by day and time blocks</p>
            </div>
            <span className="cm-text-muted inline-flex items-center gap-2 text-sm">
              <CalendarDays className="size-4" />
              Spring 2026
            </span>
          </div>

          <div className="cm-grid">
            <div className="cm-grid-head">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
            </div>
            <div className="cm-grid-row">
              <div>
                <ClassBlockExample title="CS 374" time="10:00 - 11:15" tone="cm-schedule-block--indigo" />
              </div>
              <div>
                <ClassBlockExample title="MATH 257" time="11:30 - 12:45" tone="cm-schedule-block--teal" />
              </div>
              <div>
                <ClassBlockExample title="CS 411" time="10:00 - 11:15" tone="cm-schedule-block--blue" />
              </div>
              <div>
                <ClassBlockExample title="ENGL 202" time="1:00 - 2:15" tone="cm-schedule-block--amber" />
              </div>
              <div>
                <ClassBlockExample title="CS 233" time="2:30 - 3:45" tone="cm-schedule-block--rose" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <CardExample />
          <CardExample />
        </section>
      </main>
    </div>
  )
}

