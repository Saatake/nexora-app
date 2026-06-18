import { Lock } from 'lucide-react';

type Props = {
  isPrivate: boolean;
  setIsPrivate: (v: boolean) => void;
};

const ProjectFormPrivacy = ({ isPrivate, setIsPrivate }: Props) => (
  <section className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-xl shadow-[var(--agora-shadow)] p-6">
    <div className="flex items-start gap-3">
      <input
        id="isPrivate"
        type="checkbox"
        checked={isPrivate}
        onChange={(e) => setIsPrivate(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0a5c2f] focus:ring-[#0a5c2f] cursor-pointer"
      />
      <div className="text-sm">
        <label htmlFor="isPrivate" className="font-semibold text-[var(--agora-ink)] cursor-pointer text-base">
          <Lock size={16} className="text-gray-400 inline-block mr-1" /> Tornar projeto privado
        </label>
        <p className="text-[var(--agora-muted)] mt-1">
          Ao ativar esta opção, o projeto não aparecerá nos feeds públicos, buscas ou rankings. Apenas você
          poderá visualizá-lo.
        </p>
      </div>
    </div>
  </section>
);

export default ProjectFormPrivacy;
