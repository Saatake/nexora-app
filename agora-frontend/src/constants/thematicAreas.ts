export type ThematicArea =
  | 'TecnologiaInovacao'
  | 'NegociosGestao'
  | 'EngenhariaIndustria'
  | 'SaudeBiotecnologia'
  | 'HumanidadesSociedadeDireito'
  | 'ArtesDesignComunicacao';

export const THEMATIC_AREA_LABELS: Record<ThematicArea, string> = {
  TecnologiaInovacao: 'Tecnologia e Inovação',
  NegociosGestao: 'Negócios e Gestão',
  EngenhariaIndustria: 'Engenharia e Indústria',
  SaudeBiotecnologia: 'Saúde e Biotecnologia',
  HumanidadesSociedadeDireito: 'Humanidades, Sociedade e Direito',
  ArtesDesignComunicacao: 'Artes, Design e Comunicação',
};

export const THEMATIC_AREAS: ThematicArea[] = [
  'TecnologiaInovacao',
  'NegociosGestao',
  'EngenhariaIndustria',
  'SaudeBiotecnologia',
  'HumanidadesSociedadeDireito',
  'ArtesDesignComunicacao',
];

export const THEMATIC_AREA_ENUM: Record<ThematicArea, number> = {
  TecnologiaInovacao: 1,
  NegociosGestao: 2,
  EngenhariaIndustria: 3,
  SaudeBiotecnologia: 4,
  HumanidadesSociedadeDireito: 5,
  ArtesDesignComunicacao: 6,
};
