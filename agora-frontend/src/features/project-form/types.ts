export type ProjectCategory = 'Tcc' | 'Upx' | 'IniciacaoCientifica' | 'Relatorio' | 'ProjetoEscrito';

export type CollaboratorUser = {
  id: string;
  name: string;
  email?: string;
  photoUrl?: string;
};
