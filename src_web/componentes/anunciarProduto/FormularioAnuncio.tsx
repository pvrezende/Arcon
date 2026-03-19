import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface FormularioAnuncioProps {
  formData: {
    nome: string;
    marca: string;
    endereco: string;
    valor1: string;
    valor2: string;
    btu: string;
    especificacao: string;
    tipo: string;
  };
  onInputChange: (campo: string, valor: string) => void;
  marcasDisponiveis: string[];
  btusDisponiveis: string[];
  showDropdownMarcas: boolean;
  setShowDropdownMarcas: (show: boolean) => void;
  showDropdownBtu: boolean;
  setShowDropdownBtu: (show: boolean) => void;
  showDropdownTipo: boolean;
  setShowDropdownTipo: (show: boolean) => void;
  onSubmit: () => void;
  isLoading: boolean;
  tipoTravado?: boolean; // Novo prop para travar o tipo
}

const FormularioAnuncio: React.FC<FormularioAnuncioProps> = ({
  formData,
  onInputChange,
  marcasDisponiveis,
  btusDisponiveis,
  showDropdownMarcas,
  setShowDropdownMarcas,
  showDropdownBtu,
  setShowDropdownBtu,
  showDropdownTipo,
  setShowDropdownTipo,
  onSubmit,
  isLoading,
  tipoTravado = false,
}) => {
  return (
    <View style={styles.form}>
      {/* Nome do Produto */}
      <Text style={styles.label}>Nome do Produto *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Samsung Digital Inverter 12000 BTU"
        value={formData.nome}
        onChangeText={(text) => onInputChange("nome", text)}
        placeholderTextColor="#94a3b8"
      />

      {/* Marca */}
      <Text style={styles.label}>Marca *</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => {
          setShowDropdownMarcas(!showDropdownMarcas);
          setShowDropdownBtu(false);
        }}
      >
        <Text style={[styles.dropdownText, !formData.marca && styles.placeholder]}>
          {formData.marca || "Selecione a marca"}
        </Text>
        <Ionicons 
          name={showDropdownMarcas ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#1e40af" 
        />
      </TouchableOpacity>
      {showDropdownMarcas && (
        <View style={styles.dropdownMenu}>
          {marcasDisponiveis.map((marca) => (
            <TouchableOpacity
              key={marca}
              style={styles.dropdownItem}
              onPress={() => {
                onInputChange("marca", marca);
                setShowDropdownMarcas(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{marca}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* BTU */}
      <Text style={styles.label}>BTU *</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => {
          setShowDropdownBtu(!showDropdownBtu);
          setShowDropdownMarcas(false);
        }}
      >
        <Text style={[styles.dropdownText, !formData.btu && styles.placeholder]}>
          {formData.btu ? `${formData.btu} BTU` : "Selecione o BTU"}
        </Text>
        <Ionicons 
          name={showDropdownBtu ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#1e40af" 
        />
      </TouchableOpacity>
      {showDropdownBtu && (
        <View style={styles.dropdownMenu}>
          {btusDisponiveis.map((btu) => (
            <TouchableOpacity
              key={btu}
              style={styles.dropdownItem}
              onPress={() => {
                onInputChange("btu", btu);
                setShowDropdownBtu(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{btu} BTU</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Tipo */}
      <Text style={styles.label}>Tipo *</Text>
      {tipoTravado ? (
        <View style={[styles.dropdown, styles.dropdownDisabled]}>
          <Text style={[styles.dropdownText, styles.tipoTravadoText]}>
            {formData.tipo}
          </Text>
          <Ionicons 
            name="lock-closed" 
            size={20} 
            color="#64748b" 
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setShowDropdownTipo(!showDropdownTipo);
            setShowDropdownMarcas(false);
            setShowDropdownBtu(false);
          }}
        >
          <Text style={[styles.dropdownText, !formData.tipo && styles.placeholder]}>
            {formData.tipo || "Selecione o tipo"}
          </Text>
          <Ionicons 
            name={showDropdownTipo ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#1e40af" 
          />
        </TouchableOpacity>
      )}
      {!tipoTravado && showDropdownTipo && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              onInputChange("tipo", "NOVO");
              setShowDropdownTipo(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Novo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              onInputChange("tipo", "USADO");
              setShowDropdownTipo(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Usado</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Endereço */}
      <Text style={styles.label}>Endereço *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Rua das Flores, 123 - Centro"
        value={formData.endereco}
        onChangeText={(text) => onInputChange("endereco", text)}
        placeholderTextColor="#94a3b8"
      />

      {/* Preços */}
      <View style={styles.precoContainer}>
        <View style={styles.precoItem}>
          <Text style={styles.label}>Valor Original (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="R$ 0,00"
            value={formData.valor1}
            onChangeText={(text) => onInputChange("valor1", text)}
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.helperText}>
            Valor que aparecerá riscado (desconto)
          </Text>
        </View>

        <View style={styles.precoItem}>
          <Text style={styles.label}>Valor de Venda *</Text>
          <TextInput
            style={[styles.input, styles.inputDestaque]}
            placeholder="R$ 0,00"
            value={formData.valor2}
            onChangeText={(text) => onInputChange("valor2", text)}
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
          />
          <Text style={styles.helperText}>
            Valor que você quer receber
          </Text>
        </View>
      </View>

      {/* Especificações */}
      <Text style={styles.label}>Especificações do Produto *</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Descreva as características do produto: estado de conservação, ano de fabricação, funções disponíveis, etc."
        value={formData.especificacao}
        onChangeText={(text) => onInputChange("especificacao", text)}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor="#94a3b8"
      />

      {/* Botão Enviar */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
            <Text style={styles.submitButtonText}>Anunciar Produto</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
    maxWidth: 500,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0284c7",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#334155",
  },
  inputDestaque: {
    borderColor: "#0284c7",
    borderWidth: 2,
  },
  textArea: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#334155",
    minHeight: 100,
  },
  dropdown: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#334155",
  },
  placeholder: {
    color: "#94a3b8",
  },
  dropdownMenu: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#334155",
  },
  precoContainer: {
    flexDirection: width > 600 ? "row" : "column",
    gap: 10,
  },
  precoItem: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: "#0284c7",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  dropdownDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
  },
  tipoTravadoText: {
    color: "#64748b",
    fontWeight: "600",
  },
});

export default FormularioAnuncio;
