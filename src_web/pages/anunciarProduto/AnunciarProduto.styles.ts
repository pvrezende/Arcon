import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    paddingVertical: 20,
    alignItems: "center",
    width: "100%",
    minHeight: Dimensions.get("window").height - 200,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 24,
    marginBottom: 10,
  },
  backButtonText: {
    color: "#0284c7",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0284c7",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#334155",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});
