export interface Credenciamento {
  id_credenciamento: number;
  id_prestador: number;
  certificado_credenciado: boolean;
  marca_credenciada: string;
  numero_credenciamento: string;
  validade_credenciamento: string;
  especialidades: string;
  observacoes: string;
}

export interface CredenciamentoFormData {
  certificado_credenciado: boolean;
  marca_credenciada: string;
  numero_credenciamento: string;
  validade_credenciamento: string;
  especialidades: string;
  observacoes: string;
}

export interface CredenciamentoPageProps {
  navigation: any;
}

export interface CredenciamentoSectionProps {
  prestadorId: number;
}

export interface CredenciamentoModalProps {
  visible: boolean;
  credenciamento: Credenciamento | null;
  onClose: () => void;
  onSave: (data: CredenciamentoFormData) => void;
}

export interface CredenciamentoCardProps {
  credenciamento: Credenciamento;
  onEdit: (credenciamento: Credenciamento) => void;
  onDelete: (id: number) => void;
}
