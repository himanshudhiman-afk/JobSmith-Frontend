import { Plus, Trash2 } from "lucide-react";

const emptyExperience = { title: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] };
const emptyEducation = { institution: "", degree: "", field: "", startDate: "", endDate: "" };
const emptyProject = { name: "", description: "", bullets: [""], technologies: [], url: "" };
const emptyCertification = { name: "", issuer: "", date: "" };

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function ListEditor({ title, items, emptyItem, renderItem, onChange }) {
  const update = (idx, patch) => {
    const next = items.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const add = () => onChange([...items, { ...emptyItem }]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <button type="button" onClick={add} className="btn-secondary text-xs">
          <Plus size={13} /> Add
        </button>
      </div>
      {items.length === 0 && <p className="text-xs text-slate-400">Nothing added yet.</p>}
      {items.map((item, idx) => (
        <div key={idx} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => remove(idx)}
              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remove entry"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {renderItem(item, (patch) => update(idx, patch))}
        </div>
      ))}
    </div>
  );
}

function BulletsEditor({ bullets, onChange }) {
  const update = (idx, value) => {
    const next = bullets.slice();
    next[idx] = value;
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <label className="label">Bullet points</label>
      {bullets.map((b, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            className="input"
            value={b}
            onChange={(e) => update(idx, e.target.value)}
            placeholder="Describe an achievement or responsibility"
          />
          <button
            type="button"
            onClick={() => onChange(bullets.filter((_, i) => i !== idx))}
            className="btn-secondary px-2"
            aria-label="Remove bullet"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...bullets, ""])} className="btn-secondary text-xs">
        <Plus size={13} /> Add bullet
      </button>
    </div>
  );
}

export function ResumeStructuredForm({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <input className="input" value={value.fullName} onChange={(e) => set({ fullName: e.target.value })} />
        </Field>
        <Field label="Email">
          <input className="input" value={value.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <input className="input" value={value.phone} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field label="Location">
          <input className="input" value={value.location} onChange={(e) => set({ location: e.target.value })} />
        </Field>
      </div>

      <Field label="Professional summary">
        <textarea
          className="input min-h-[90px]"
          value={value.summary}
          onChange={(e) => set({ summary: e.target.value })}
        />
      </Field>

      <Field label="Skills (comma-separated)">
        <input
          className="input"
          value={value.skills.join(", ")}
          onChange={(e) => set({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
        />
      </Field>

      <ListEditor
        title="Experience"
        items={value.experience}
        emptyItem={emptyExperience}
        onChange={(experience) => set({ experience })}
        renderItem={(item, update) => (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <input className="input" value={item.title} onChange={(e) => update({ title: e.target.value })} />
              </Field>
              <Field label="Company">
                <input className="input" value={item.company} onChange={(e) => update({ company: e.target.value })} />
              </Field>
              <Field label="Start date">
                <input className="input" value={item.startDate} onChange={(e) => update({ startDate: e.target.value })} />
              </Field>
              <Field label="End date">
                <input
                  className="input"
                  value={item.endDate}
                  disabled={item.current}
                  onChange={(e) => update({ endDate: e.target.value })}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={item.current} onChange={(e) => update({ current: e.target.checked })} />
              I currently work here
            </label>
            <BulletsEditor bullets={item.bullets} onChange={(bullets) => update({ bullets })} />
          </div>
        )}
      />

      <ListEditor
        title="Education"
        items={value.education}
        emptyItem={emptyEducation}
        onChange={(education) => set({ education })}
        renderItem={(item, update) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Institution">
              <input className="input" value={item.institution} onChange={(e) => update({ institution: e.target.value })} />
            </Field>
            <Field label="Degree">
              <input className="input" value={item.degree} onChange={(e) => update({ degree: e.target.value })} />
            </Field>
            <Field label="Field of study">
              <input className="input" value={item.field} onChange={(e) => update({ field: e.target.value })} />
            </Field>
            <Field label="End date">
              <input className="input" value={item.endDate} onChange={(e) => update({ endDate: e.target.value })} />
            </Field>
          </div>
        )}
      />

      <ListEditor
        title="Projects"
        items={value.projects}
        emptyItem={emptyProject}
        onChange={(projects) => set({ projects })}
        renderItem={(item, update) => (
          <div className="space-y-3">
            <Field label="Name">
              <input className="input" value={item.name} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label="Description">
              <input className="input" value={item.description} onChange={(e) => update({ description: e.target.value })} />
            </Field>
            <BulletsEditor bullets={item.bullets} onChange={(bullets) => update({ bullets })} />
          </div>
        )}
      />

      <ListEditor
        title="Certifications"
        items={value.certifications}
        emptyItem={emptyCertification}
        onChange={(certifications) => set({ certifications })}
        renderItem={(item, update) => (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name">
              <input className="input" value={item.name} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label="Issuer">
              <input className="input" value={item.issuer} onChange={(e) => update({ issuer: e.target.value })} />
            </Field>
            <Field label="Date">
              <input className="input" value={item.date} onChange={(e) => update({ date: e.target.value })} />
            </Field>
          </div>
        )}
      />
    </div>
  );
}
