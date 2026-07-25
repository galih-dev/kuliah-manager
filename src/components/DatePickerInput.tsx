import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS } from "../../constants/theme";

type Props = {
  value: string; // format YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
};

export function DatePickerInput({ value, onChange, placeholder = "Pilih tanggal" }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const dateValue = value ? new Date(value) : new Date();

  const handleChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios"); // iOS biarin picker tetap kebuka
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
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
          value={dateValue}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
        />
      )}
    </View>
  );
}