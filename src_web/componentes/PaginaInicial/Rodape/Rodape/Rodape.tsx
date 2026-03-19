import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './Rodape.styles';

interface RodapeProps {
  navigation?: any;
}

const Rodape: React.FC<RodapeProps> = ({ navigation }) => {
  const handleNavigation = (screen: string) => {
    if (navigation) {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Coluna 1 - Empresa */}
        <View style={styles.column}>
          <Text style={styles.title}>Empresa</Text>
          
          <TouchableOpacity 
            style={styles.link}
            onPress={() => handleNavigation('QuemSomos')}
          >
            <Text style={styles.linkText}>Quem somos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.link}
            onPress={() => handleNavigation('OQueOferecemos')}
          >
            <Text style={styles.linkText}>O que oferecemos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.link}
            onPress={() => handleNavigation('Empresas')}
          >
            <Text style={styles.linkText}>Empresas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.link}
            onPress={() => handleNavigation('Carreira')}
          >
            <Text style={styles.linkText}>Carreira</Text>
          </TouchableOpacity>
        </View>

        {/* Coluna 2 - Serviços */}
        <View style={styles.column}>
          <Text style={styles.title}>Serviços</Text>
          
          <TouchableOpacity 
            style={styles.link}
            onPress={() => handleNavigation('VisitaTecnica')}
          >
            <Text style={styles.linkText}>Visita Técnica</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.link}
            onPress={() => handleNavigation('ArCondicionadoNovos')}
          >
            <Text style={styles.linkText}>Ar Condicionado Novos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.link}
            onPress={() => handleNavigation('ArCondicionadoUsados')}
          >
            <Text style={styles.linkText}>Ar Condicionado Usados</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.link}
            onPress={() => handleNavigation('PecasNovas')}
          >
            <Text style={styles.linkText}>Peças Novas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.link}
            onPress={() => handleNavigation('TecnicosCredenciados')}
          >
            <Text style={styles.linkText}>Técnicos Credenciados</Text>
          </TouchableOpacity>
        </View>

        {/* Coluna 3 - Redes Sociais e Apps */}
        <View style={styles.column}>
          <Text style={styles.title}>Redes Sociais</Text>
          
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-instagram" size={24} color="#0284c7" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-twitter" size={24} color="#0284c7" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-facebook" size={24} color="#0284c7" />
            </TouchableOpacity>
          </View>


          {/* Botões dos stores */}
          <View style={styles.storeButtons}>
            <TouchableOpacity style={styles.storeButton}>
              <Text style={styles.storeText}>Google Play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.storeButton}>
              <Text style={styles.storeText}>App Store</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Rodape;