import React from "react";
import { Tabs } from "expo-router";
import FloatingTabBar from "@shared/components/FloatingTabBar";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <FloatingTabBar {...(props as unknown as BottomTabBarProps)} />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
        }}
      />
      <Tabs.Screen
        name="boards"
        options={{
          title: "Boards",
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: "Routines",
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "",
        }}
      />
    </Tabs>
  );
}
