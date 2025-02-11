import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { Svg, Defs, RadialGradient, Rect, Stop } from "react-native-svg";

const { width, height } = Dimensions.get("window");

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      {/* Fondo con gradiente radial */}
      <Svg height={height} width={width} style={styles.background}>
        <Defs>
          <RadialGradient id="grad" cx="50%" cy="50%" r="60%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="50%" stopColor="#0EB93F" stopOpacity="1" />
            <Stop offset="100%" stopColor="#02974A" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      <Image
        source={require("../../assets/LogoCultivAI.png")}
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },
});

export default SplashScreen;
