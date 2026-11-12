import { Link } from 'react-router-dom';
import {
  Calendar,
  Download,
  Eye,
  Star,
  UserCircle2,
} from 'lucide-react';
import { formatCategory, formatDate } from '@/shared/utils/formatters';
import RoleBadge from '@/components/RoleBadge';
import type { Project } from '../types';

type ProjectHeroCardProps = {
  project: Project;
  isDownloading: boolean;
  isAiReviewing: boolean;
  canShowAiButton: boolean;
  onDownload: () => void;
  onAiReview: () => void;
};

const ProjectHeroCard = ({
  project,
  isDownloading,
  isAiReviewing,
  canShowAiButton,
  onDownload,
  onAiReview,
}: ProjectHeroCardProps) => (
  <header className="mb-10">
    {project.imageUrl && (
      <div className="mb-7 h-56 w-full overflow-hidden sm:h-72 lg:h-[30rem]">
        <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover" />
      </div>
    )}
    <div className="max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--agora-accent-bg)] text-[var(--agora-accent)]">
          {formatCategory(project.category)}
        </span>

        {project.averageGrade != null && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xl font-bold text-amber-500">
            <Star size={20} className="fill-amber-400 text-amber-400" />
            {project.averageGrade.toFixed(1)}
            <span className="text-xs font-normal text-[var(--agora-muted)] ml-0.5">média geral</span>
          </span>
        )}
      </div>

      <h1
        className="mb-4 text-3xl font-bold leading-tight tracking-tight text-[var(--agora-ink)] sm:text-4xl lg:text-5xl"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {project.title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[var(--agora-muted)] mb-5">
        <span className="inline-flex items-center gap-1.5">
          <UserCircle2 size={15} />
          <Link
            to={`/profile/${project.authorId}`}
            className="hover:text-[var(--agora-accent)] hover:underline transition-colors"
          >
            {project.authorName}
          </Link>
          <RoleBadge role={project.authorRoleType} />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={15} />
          {formatDate(project.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye size={15} />
          {new Intl.NumberFormat('pt-BR').format(project.viewCount)} visualizações
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Download size={15} />
          {new Intl.NumberFormat('pt-BR').format(project.downloadCount)} downloads
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading || !project.fileUrl}
          className="px-5 py-2.5 bg-[var(--agora-accent)] hover:bg-[var(--agora-accent-hover)] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isDownloading ? 'Baixando...' : 'Baixar PDF'}
        </button>
        {canShowAiButton && (
          <button
            type="button"
            onClick={onAiReview}
            disabled={isAiReviewing}
            className="px-5 py-2.5 border border-[var(--agora-border)] bg-[var(--agora-panel)] hover:border-violet-400 hover:text-violet-600 disabled:opacity-50 text-[var(--agora-muted)] text-sm font-semibold rounded-lg transition-colors"
          >
            {isAiReviewing ? 'Analisando...' : 'Avaliar com IA'}
          </button>
        )}
      </div>
    </div>
  </header>
);

export default ProjectHeroCard;
