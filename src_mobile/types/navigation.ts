export type RootStackParamList = {
  // Auth Stack Routes
  Home: undefined;
  logincliente: undefined;
  loginprestador: undefined;
  cliente: undefined;
  prestador: undefined;
  RecuperarSenhaCliente: undefined;
  RecuperarSenhaPrestador: undefined;
  
  // App Stack Routes
  dash_cliente: undefined;
  areaprestador: undefined;
  ComprarNovo: undefined;
  ComprarUsado: undefined;
  AnunciarProduto: undefined;
  Perfil: undefined;
  Configuracoes: undefined;
  DashLojista: undefined;
  MeusAnuncios: undefined;
  ListaChats: undefined;
  ChatScreen: {
    otherUser?: {
      name: string;
      id: string;
    };
  };
  
  // Navigator Routes
  AppNavigator: undefined;
  AuthStack: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
