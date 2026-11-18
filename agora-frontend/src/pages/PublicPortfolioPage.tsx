import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '@/api/axios';
import PortfolioRenderer from '@/features/portfolio/PortfolioRenderer';
import type { Portfolio } from '@/features/portfolio/types';

const PublicPortfolioContent = ({ slug }: { slug: string }) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.get<Portfolio>(`/portfolios/${encodeURIComponent(slug)}`)
      .then((response) => { if (active) setPortfolio(response.data); })
      .catch(() => { if (active) setPortfolio(null); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#f5f7f5] text-sm text-gray-500">Carregando portfólio...</main>;
  }

  if (!portfolio) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f7f5] px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Portfólio não encontrado</h1>
          <p className="mt-2 text-gray-600">Esse endereço pode estar incorreto ou a página ainda não foi publicada.</p>
          <Link to="/" className="mt-5 inline-block font-semibold text-[#0a5c2f]">Conheça o Ágora</Link>
        </div>
      </main>
    );
  }

  return <main className="grid min-h-screen"><PortfolioRenderer portfolio={portfolio} /></main>;
};

const PublicPortfolioPage = () => {
  const { slug = '' } = useParams();
  return <PublicPortfolioContent key={slug} slug={slug} />;
};

export default PublicPortfolioPage;
