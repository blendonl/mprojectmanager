import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Screen } from "@shared/components";
import { theme, spacing } from "@shared/theme";

export default function NotesListScreen() {
  return (
    <Screen hasTabBar>
      <View style={styles.container}>
        <Text style={styles.text}>Notes - Migration in progress</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  text: {
    color: theme.text.primary,
    fontSize: 16,
  },
});
