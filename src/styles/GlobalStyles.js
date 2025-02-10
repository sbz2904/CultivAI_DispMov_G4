import { StyleSheet } from "react-native";

/* fonts */
export const FontFamily = {
  interBold: "Inter-Bold",
  rubikBold: "Rubik-Bold",
  interRegular: "Inter-Regular",
};
/* font sizes */
export const FontSize = {
  size_lg: 18,
  size_sm: 14,
};
/* Colors */
export const Color = {
  colorWhite: "#fff",
  colorGray_100: "#171a1f",
  colorGray_200: "rgba(0, 0, 0, 0)",
  colorYellowgreen: "#6abd40",
  colorWhitesmoke: "#f3f4f6",
  colorSilver: "#bcc1ca",
  colorDarkslategray: "#424955",
};
/* border radiuses */
export const Border = {
  br_7xs: 6,
};

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD", // Fondo blanco puro
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logoText: {
    fontFamily: "Lobster-Regular",
    fontSize: 44,
    textAlign: "center",
  },
  cultiv: {
    color: "#2E7D32", // Verde natural principal
  },
  ai: {
    color: "#388E3C", // Verde secundario
  },
  iconLogo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32", // Verde principal
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0", // Gris claro para input
    borderRadius: 25,
    padding: 5,
    width: "85%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#388E3C", // Verde secundario
  },
  icon: {
    marginRight: 10,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: "#1B5E20", // Verde oscuro para texto
    fontSize: 15,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#FF7043", // Verde principal sólido
    borderRadius: 50,
    paddingVertical: 15,
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
})
