import { Text, View } from "react-native";
import { auth } from "../../../services/firebase";

console.log("Firebase connected:", auth.app.name);

export default function Home() {
  return (
    <View>
      <Text>Test Firebase Connection</Text>
    </View>
  );
}