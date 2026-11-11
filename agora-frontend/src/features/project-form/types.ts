export type ProjectCategory = 'Tcc' | 'Upx' | 'IniciacaoCientifica' | 'Relatorio' | 'ProjetoEscrito' | 'PesquisaCientifica' | 'Prototipo' | 'ProducaoArtistica' | 'IntervencaoSocial' | 'Negocio' | 'EstudoDeCaso' | 'Outro';

export type CollaboratorUser = {
  id: string;
  name: string;
  email?: string;
  photoUrl?: string;
};
