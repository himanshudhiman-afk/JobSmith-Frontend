export function ResumePrintPreview({ content }) {
  const c = content || {};
  return (
    <div className="mx-auto max-w-[650px] bg-white p-8 text-[13px] text-slate-800 shadow-card dark:bg-white dark:text-slate-800">
      <div className="text-center">
        <h1 className="text-xl font-bold">{c.fullName || "Full Name"}</h1>
        <p className="mt-1 text-xs text-slate-500">
          {[c.email, c.phone, c.location].filter(Boolean).join(" · ")}
        </p>
      </div>

      {c.summary && (
        <section className="mt-5">
          <h2 className="border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wide">Summary</h2>
          <p className="mt-2 text-xs leading-relaxed">{c.summary}</p>
        </section>
      )}

      {c.skills?.length > 0 && (
        <section className="mt-5">
          <h2 className="border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wide">Skills</h2>
          <p className="mt-2 text-xs">{c.skills.join(" · ")}</p>
        </section>
      )}

      {c.experience?.length > 0 && (
        <section className="mt-5">
          <h2 className="border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wide">Experience</h2>
          {c.experience.map((exp, i) => (
            <div key={i} className="mt-3">
              <div className="flex justify-between text-xs font-semibold">
                <span>{exp.title}</span>
                <span>
                  {exp.startDate}
                  {exp.startDate || exp.endDate ? " – " : ""}
                  {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="text-xs italic text-slate-500">{exp.company}</p>
              <ul className="mt-1 list-disc pl-4 text-xs">
                {(exp.bullets || []).filter(Boolean).map((b, bi) => (
                  <li key={bi}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {c.projects?.length > 0 && (
        <section className="mt-5">
          <h2 className="border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wide">Projects</h2>
          {c.projects.map((p, i) => (
            <div key={i} className="mt-3">
              <p className="text-xs font-semibold">{p.name}</p>
              {p.description && <p className="text-xs italic text-slate-500">{p.description}</p>}
              <ul className="mt-1 list-disc pl-4 text-xs">
                {(p.bullets || []).filter(Boolean).map((b, bi) => (
                  <li key={bi}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {c.education?.length > 0 && (
        <section className="mt-5">
          <h2 className="border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wide">Education</h2>
          {c.education.map((ed, i) => (
            <div key={i} className="mt-2 flex justify-between text-xs">
              <span className="font-semibold">{ed.institution}</span>
              <span>{ed.endDate}</span>
            </div>
          ))}
        </section>
      )}

      {c.certifications?.length > 0 && (
        <section className="mt-5">
          <h2 className="border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wide">
            Certifications
          </h2>
          {c.certifications.map((cert, i) => (
            <div key={i} className="mt-2 flex justify-between text-xs">
              <span>
                {cert.name} — {cert.issuer}
              </span>
              <span>{cert.date}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
