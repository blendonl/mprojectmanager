import React, { useState } from "react";
import { Alert } from "react-native";
import { Task } from "../domain/entities/Task";
import { TaskScheduleModal, TaskScheduleData } from "@/features/agenda/components/TaskScheduleModal";
import { getAgendaService } from "@core/di/hooks";

interface TaskSchedulerProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onScheduled?: () => void;
}

export const TaskScheduler: React.FC<TaskSchedulerProps> = ({
  task,
  visible,
  onClose,
  onScheduled,
}) => {
  const handleScheduleTask = async (data: TaskScheduleData) => {
    try {
      const agendaService = getAgendaService();
      const agendaId = data.date;

      await agendaService.createAgendaItem({
        agendaId,
        taskId: data.taskId,
        type: data.taskType,
        startAt: data.time ? `${data.date}T${data.time}:00` : null,
        duration: data.durationMinutes,
        status: "pending",
        position: 0,
        notes: null,
        notificationId: null,
      });

      onScheduled?.();
      onClose();
    } catch (error) {
      console.error("Failed to schedule task:", error);
      Alert.alert("Error", "Failed to schedule task");
      throw error;
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <TaskScheduleModal
      visible={visible}
      task={task}
      prefilledDate={getTodayDate()}
      onClose={onClose}
      onSubmit={handleScheduleTask}
    />
  );
};
