export const FACENS_COURSES = [
  'Administração',
  'Análise e Desenvolvimento de Sistemas (ADS)',
  'Arquitetura e Urbanismo',
  'Biomedicina',
  'Biotecnologia',
  'Ciência da Computação',
  'Ciência de Dados e Inteligência Artificial',
  'Ciências Contábeis',
  'Defesa Cibernética',
  'Design',
  'Direito',
  'Economia',
  'Educação Física',
  'Enfermagem',
  'Engenharia Agronômica',
  'Engenharia Ambiental',
  'Engenharia Civil',
  'Engenharia de Alimentos',
  'Engenharia de Computação',
  'Engenharia de Controle e Automação',
  'Engenharia de Produção',
  'Engenharia de Software',
  'Engenharia Elétrica',
  'Engenharia Mecânica',
  'Engenharia Mecatrônica',
  'Engenharia Química',
  'Farmácia',
  'Fisioterapia',
  'Gestão Comercial',
  'Gestão de Recursos Humanos',
  'Gestão de TI',
  'Jogos Digitais',
  'Jornalismo',
  'Logística',
  'Marketing',
  'Medicina Veterinária',
  'Nutrição',
  'Odontologia',
  'Pedagogia',
  'Psicologia',
  'Publicidade e Propaganda',
  'Sistemas de Informação',
] as const;

const stripAccents = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

/** Normaliza nomes de cursos legados sem acento para a grafia oficial de FACENS_COURSES. */
export const normalizeCourseName = (course?: string): string => {
  if (!course) return '';
  const target = stripAccents(course);
  const match = FACENS_COURSES.find((c) => stripAccents(c) === target);
  return match ?? course.trim();
};
