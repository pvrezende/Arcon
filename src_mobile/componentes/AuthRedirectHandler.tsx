// components/AuthRedirectHandler.tsx
import { useEffect } from 'react';
import { useWebAuth } from '../hooks/useWebAuth';
import { useNavigation } from '@react-navigation/native';

const AuthRedirectHandler = () => {
  const { userData, loading } = useWebAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading && userData) {
      console.log('🔍 AuthRedirectHandler - Dados do usuário:', userData);
      
      // Redireciona baseado no tipo de usuário
      if (userData.tipo_usuario === 'PRESTADOR') {
        const tipoPrestador = userData.tipo_prestador || userData.subtipo_prestador;
        console.log('🔍 AuthRedirectHandler - Tipo de prestador:', tipoPrestador);
        
        if (tipoPrestador === 'LOJA') {
          console.log('🔍 Redirecionando para DashLojista - Categoria:', userData.categoria_loja);
          navigation.reset({
            index: 0,
            routes: [{ name: 'DashLojista' as never }],
          });
        } else if (tipoPrestador === 'MANUAL') {
          console.log('🔍 Redirecionando para areaprestador - Área:', userData.area_atuacao);
          navigation.reset({
            index: 0,
            routes: [{ name: 'areaprestador' as never }],
          });
        } else {
          // Fallback para prestadores sem tipo definido
          console.log('🔍 Prestador sem tipo definido, redirecionando para areaprestador');
          navigation.reset({
            index: 0,
            routes: [{ name: 'areaprestador' as never }],
          });
        }
      } else if (userData.tipo_usuario === 'CLIENTE') {
        console.log('🔍 Redirecionando para dashcliente');
        navigation.reset({
          index: 0,
          routes: [{ name: 'dash_cliente' as never }],
        });
      } else {
        console.log('🔍 Tipo de usuário não reconhecido:', userData.tipo_usuario);
      }
    }
  }, [userData, loading, navigation]);

  return null;
};

export default AuthRedirectHandler;