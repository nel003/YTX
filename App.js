import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import COLORS from "./colors";
import yamaha from "./assets/yamaha.png";
import ytx from "./assets/ytx.png";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import {
  Power,
  LightHigh,
  LightLow,
  LightOff,
  Honk,
  Battery,
  Fuel,
} from "./Icons_a";
import useBLE from "./utils/useBle";
import permission from "./utils/permission";
import { useEffect, useState } from "react";

export default function App() {
  const [connectedDevice, sendBLE, states, scanAndConnect, disconnect] =
    useBLE();
  const [mainSwitch, setMainSwitch] = useState(false);
  const [starter, setStarter] = useState(false);
  const [honk, setHonk] = useState(false);
  const [light, setLight] = useState(false);
  const [battery, setBattery] = useState(0);

  useEffect(() => {
    permission();
  }, []);

  useEffect(() => {
    setMainSwitch(states["mainSwitch"]);
    setStarter(states["starter"]);
    setHonk(states["honk"]);
    setLight(states["light"]);
    setBattery(states["battery"]);
  }, [states]);

  const taps = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(async () => {
      console.log("Double tapped");
      await sendBLE(mainSwitch ? "offMainSwitch" : "onMainSwitch");
      //setMainSwitch(!mainSwitch);
    });

  const hold = Gesture.LongPress()
    .onStart(async () => {
      console.log("Hold start");
      await sendBLE("onStarter");
      //setStarter(true);
    })
    .onEnd(async () => {
      await sendBLE("offStarter");
      //setStarter(false);
    });

  const startHonk = async () => {
    await sendBLE("onHonk");
    //setHonk(true);
  };
  const stopHonk = async () => {
    await sendBLE("offHonk");
    //setHonk(false);
  };

  const handleLight = async () => {
    await sendBLE(light ? "offLight" : "onLight");
    //setLight(!light);
  };

  const tapsAndHold = Gesture.Exclusive(taps, hold);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.dark }}>
        <StatusBar style="auto" />

        <View
          style={{
            marginTop: 70,
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <Image
            source={yamaha}
            style={{ height: 60, width: 60, resizeMode: "cover" }}
          />
          <Text
            style={{
              color: COLORS.white,
              fontSize: 30,
              fontWeight: "800",
              letterSpacing: 3,
              marginTop: 40,
            }}
          >
            YTX
          </Text>
          <Text
            style={{
              color: connectedDevice ? COLORS.green : COLORS.red,
              fontSize: 12,
              fontWeight: "800",
              marginTop: 10,
            }}
          >
            {connectedDevice ? "Connected" : "Disconnceted"}
          </Text>
        </View>
        <View
          style={{
            marginTop: 40,
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <Image
            source={ytx}
            style={{ height: 280, width: 300, resizeMode: "cover" }}
          />
        </View>
        <View
          style={{
            marginTop: 40,
            height: "auto",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <TouchableOpacity
            onPress={handleLight}
            disabled={connectedDevice ? false : true}
          >
            <View
              style={{
                height: 60,
                width: 60,
                borderWidth: 3,
                borderColor: COLORS.green,
                borderRadius: 30,
                marginTop: 20,
                justifyContent: "center",
                alignItems: "center",
                opacity: connectedDevice ? mainSwitch ? 1 : 0.5 : 0.5
              }}
            >
              <LightOff />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{ pointerEvents: connectedDevice ? 'auto' : 'none'}}>
            <GestureDetector gesture={tapsAndHold}>
              <View
                style={{
                  height: 70,
                  width: 70,
                  borderWidth: 3,
                  borderColor: COLORS.green,
                  borderRadius: 70 / 2,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: connectedDevice ? 1 : 0.5
                }}
              >
                <Power />
              </View>
            </GestureDetector>
          </TouchableOpacity>
          <TouchableOpacity disabled={connectedDevice ? false : true}
              onPressIn={startHonk}
              onPressOut={stopHonk}>
            <View
              style={{
                height: 60,
                width: 60,
                borderWidth: 3,
                borderColor: COLORS.green,
                borderRadius: 30,
                marginTop: 20,
                justifyContent: "center",
                alignItems: "center",
                opacity: connectedDevice ? mainSwitch ? 1 : 0.5 : 0.5
              }}
            >
              <Honk />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Text
            style={{ color: COLORS.white, fontSize: 18, fontWeight: "800" }}
          >
            {mainSwitch ? "VEHICLE IS ON" : "VEHICLE IS OFF"}
          </Text>
          <Text
            style={{ color: COLORS.gray2, fontSize: 10, fontWeight: "800" }}
          >
            {mainSwitch ? "HOLD TO START" : "DOUBEL TAP TO ON | OFF"}
          </Text>
        </View>
        <View
          style={{
            marginTop: 20,
            paddingLeft: 15,
            paddingRight: 15,
            height: 110,
            gap: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#1a1a1a",
              borderRadius: 15,
              padding: 2,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: COLORS.green,
            }}
          >
            <Battery
              style={{
                marginLeft: 10,
                marginRight: 10,
                color: COLORS.lightWhite,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: COLORS.lightWhite,
                  fontSize: 12,
                  fontWeight: "800",
                }}
              >
                Battery
              </Text>
              <Text
                style={{
                  color: COLORS.lightWhite,
                  fontSize: 10,
                  fontWeight: "700",
                  opacity: 0.7,
                }}
              >
                Power-up the vehicle
              </Text>
            </View>
            <Text
              style={{
                color: COLORS.lightWhite,
                fontSize: 15,
                fontWeight: "800",
                marginRight: 10,
                letterSpacing: 2,
              }}
            >
              {connectedDevice ? battery : "__"}%
            </Text>
          </View>
          <TouchableOpacity
            onPress={connectedDevice ? disconnect : scanAndConnect}
            style={{ flex: 1 }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: connectedDevice ? COLORS.red : COLORS.green,
                borderRadius: 15,
                padding: 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: COLORS.lightWhite,
                  fontSize: 15,
                  fontWeight: "800",
                  letterSpacing: 1,
                }}
              >
                {connectedDevice ? "Disconnect" : "Connect"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
