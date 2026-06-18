import { Link } from 'react-router-dom';
import {
  Calendar,
  Download,
  Eye,
  Star,
  UserCircle2,
} from 'lucide-react';
import { formatCategory, formatDate } from '@/shared/utils/formatters';
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
  <div className="mb-6 rounded-2xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-[var(--agora-shadow)] overflow-hidden">
    {project.imageUrl && (
      <div className="h-56 w-full overflow-hidden">
        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
      </div>
    )}
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
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
        className="text-2xl sm:text-3xl font-bold text-[var(--agora-ink)] mb-3"
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
  </div>
);

export default ProjectHeroCard;
