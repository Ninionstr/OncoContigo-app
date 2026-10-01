import { formatDate, type Symptom } from '@/lib/labels';

export function SymptomTable({
  symptoms,
  statusLabel,
}: {
  symptoms: Symptom[];
  statusLabel: (s: Symptom) => { label: string; badge: string };
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-ink/40">
          <tr>
            <th className="px-6 py-3 font-medium">Fecha</th>
            <th className="px-3 py-3 font-medium">Dolor</th>
            <th className="px-3 py-3 font-medium">Cansancio</th>
            <th className="px-3 py-3 font-medium">Náuseas</th>
            <th className="px-3 py-3 font-medium">Apetito</th>
            <th className="px-3 py-3 font-medium">Fiebre</th>
            <th className="px-6 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-50">
          {symptoms.map((s) => {
            const st = statusLabel(s);
            return (
              <tr key={s.id} className="text-ink/80">
                <td className="px-6 py-3 font-medium text-ink">{formatDate(s.loggedDate, true)}</td>
                <td className="px-3 py-3">{s.painLevel}/10</td>
                <td className="px-3 py-3">{s.fatigueLevel}/10</td>
                <td className="px-3 py-3">{s.nauseaLevel}/10</td>
                <td className="px-3 py-3">{s.appetiteLevel}/10</td>
                <td className="px-3 py-3">{s.fever ? (s.temperature ? `${s.temperature}°C` : 'Sí') : 'No'}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${st.badge}`}>{st.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
