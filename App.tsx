import { SafeAreaView, StyleSheet } from "react-native";
import { CursorCanvasTimer } from "./src/cursor-timer";
import { CursorCanvasSimple } from "./src/cursor-simple";
import { CursorAlternating } from "./src/cursor-alternating";


export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <CursorAlternating />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});