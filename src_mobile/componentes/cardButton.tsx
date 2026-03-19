import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface CardButtonProps {
  text: string;
  onPress?: () => void;
  isMobile?: boolean;
}

const CardButton: React.FC<CardButtonProps> = ({ text, onPress, isMobile = false }) => {
  return (
    <TouchableOpacity
      style={isMobile ? styles.buttonMobile : styles.buttonDesktop}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonDesktop: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonMobile: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default CardButton;

