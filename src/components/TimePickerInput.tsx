import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS } from "../../constants/theme";

type Props = {
  value: string; // format HH:MM
  onChange: (value: string) => void;
  placeholder?: string;
};

export function TimePickerInput({ value, onChange, placeholder = "Pilih jam" }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const timeValue = () => {
    const date = new Date();
    if (value && /^\d{2}:\d{2}$/.test(value)) {
      const [hours, minutes] = value.split(":").map(Number);
      date.setHours(hours, minutes, 0, 0);
    }
    return date;
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      const hours = String(selectedDate.getHours()).padStart(2, "0");
      const minutes = String(selectedDate.getMinutes()).padStart(2, "0");
      onChange(`${hours}:${minutes}`);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{
          backgroundColor: COLORS.surfaceLight,
          borderRadius: RADIUS.sm,
          padding: 12,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: value ? COLORS.textPrimary : COLORS.textMuted, fontFamily: FONT.regular, fontSize: FONT_SIZE.sm }}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={timeValue()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          is24Hour={true}
        />
      )}
    </View>
  );
}