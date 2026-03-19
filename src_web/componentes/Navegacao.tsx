import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface NavegacaoItem {
  label: string;
  onPress?: () => void;
  isActive?: boolean;
}

interface NavegacaoProps {
  items: NavegacaoItem[];
  showHomeIcon?: boolean;
}

const Navegacao: React.FC<NavegacaoProps> = ({ items, showHomeIcon = true }) => {
  const navigation = useNavigation();
  

  const [isMobile, setIsMobile] = useState(Dimensions.get("window").width < 768);

  useEffect(() => {
  
    const onChange = ({ window }: any) => {
     
      setIsMobile(window.width < 768);
    };
    
   
    const subscription = Dimensions.addEventListener("change", onChange);

    
    return () => subscription?.remove?.();
  }, []); // DEPENDÊNCIAS VAZIAS: Executa apenas uma vez na montagem

  const handleHomePress = () => {
    navigation.navigate('Home' as never);
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {showHomeIcon && (
        <TouchableOpacity onPress={handleHomePress} style={styles.homeButton}>
          <Ionicons 
            name="home" 
            size={isMobile ? 16 : 18} 
            color="#0284c7" 
          />
        </TouchableOpacity>
      )}
      
      <View style={styles.itemsContainer}>
        {showHomeIcon && (
          <Text style={[styles.separator, isMobile && styles.separatorMobile]}>
            {'>'}
          </Text>
        )}
        
        {items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            {index > 0 && (
              <Text style={[styles.separator, isMobile && styles.separatorMobile]}>
                {'>'}
              </Text>
            )}
            
            {item.onPress ? (
              <TouchableOpacity onPress={item.onPress}>
                <Text style={[
                  styles.itemText,
                  isMobile && styles.itemTextMobile,
                  item.isActive && styles.activeItemText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[
                styles.itemText,
                isMobile && styles.itemTextMobile,
                item.isActive && styles.activeItemText
              ]}>
                {item.label}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  containerMobile: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  homeButton: {
    marginRight: 4,
    padding: 4,
  },
  itemsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    fontSize: 14,
    color: "#999",
    marginHorizontal: 4,
  },
  separatorMobile: {
    fontSize: 12,
    marginHorizontal: 3,
  },
  itemText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  itemTextMobile: {
    fontSize: 12,
  },
  activeItemText: {
    color: "#999",
    fontWeight: "600",
  },
});

export default Navegacao;

