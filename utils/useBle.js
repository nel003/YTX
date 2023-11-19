import { useState, useEffect, useMemo } from "react";
import { BleManager } from "react-native-ble-plx";
import base64 from "react-native-base64";

export default function BLE() {
    let bleManager = useMemo(() => new BleManager(), []);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [characteristic, setCharacteristic] = useState(null);
    const [states, setStates] = useState({});


    const disconnect = async () => {
        console.log("Disconnecting..");
        if(connectedDevice && bleManager.isDeviceConnected(connectedDevice.id)) {
            await bleManager.cancelTransaction("monitorF");
            await bleManager.cancelDeviceConnection(connectedDevice.id);
            setConnectedDevice(null);
            setCharacteristic(null);

            bleManager.destroy();
            bleManager = new BleManager();
        }
    }

    useEffect(() => {
        async function f() {
            await disconnect();
            scanAndConnect();
        }
        f();

        return async () => {
            await disconnect();
        }
    }, []);

    const connect = async (device) => {
        try {
            console.log("Connecting...");
            const connected = await device.connect();
            await device.requestMTU(100);
            setConnectedDevice(connected);
            console.log("Connected to: " + device.id);

            const discover = await connected.discoverAllServicesAndCharacteristics();
            const services = await discover.services();
            const service = services.find((s) => s.uuid === "0000abcd-0000-1000-8000-00805f9b34fb");
            const characteristic = (await service.characteristics()).find(char => char.uuid === "00001234-0000-1000-8000-00805f9b34fb");
            setCharacteristic(characteristic);

            characteristic.monitor(async (err, char) => {
                try {
                    if(err) throw err;
                    setStates(JSON.parse(base64.decode(char.value)));
                    console.log(base64.decode(char.value));
                } catch (err) {
                    await disconnect();
                    console.log(err)
                }
            }, 'monitorF');
        } catch (error) {
            console.log(error);
        }
    }

    const sendBLE = async (str) => {
        try {
            const char = await characteristic.writeWithResponse(base64.encode(str));
            // const resChar = await characteristic.read();
            // console.log(base64.decode(char.value));
        } catch (error) {
            console.log(error)
        }
    }



    const scanAndConnect = async () => {
        await disconnect();
        bleManager.startDeviceScan(null, null, async (err, device) => {
            if(err) return console.log(err);

            if(device.name == "YTX_012") {
                bleManager.stopDeviceScan();
                connect(device);
            }
        });
    }

    return [connectedDevice, sendBLE, states, scanAndConnect, disconnect];
}