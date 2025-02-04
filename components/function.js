import { Alert } from 'react-native';
import * as Location from 'expo-location';

export const requestLocationPermission = async (setLocation) => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permission to access location was denied');
    return;
  }

  let currentLocation = await Location.getCurrentPositionAsync({});
  setLocation({
    latitude: currentLocation.coords.latitude,
    longitude: currentLocation.coords.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
};

export const handleAddBin = (setAddingBin) => {
  setAddingBin(true);
  Alert.alert("Select Bin Location", "Tap on the map where you want to place the bin.");
};

export const handleMapPress = (event, addingBin, setSelectedLocation, setModalVisible, setAddingBin) => {
  if (addingBin) {
    setSelectedLocation(event.nativeEvent.coordinate);
    setModalVisible(true);
    setAddingBin(false);
  }
};

export const saveBin = async (binName, selectedLocation, bins, setBins, setModalVisible, setBinName) => {
  if (!binName.trim()) {
    Alert.alert("Error", "Please enter a bin name.");
    return;
  }

  const newBin = {
    name: binName,
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    volume: 0,
    status: "Inactive",
  };

  try {
    const response = await fetch("http://192.168.1.24:8080/api/locations/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBin),
    });

    if (response.ok) {
      const savedBin = await response.json();
      setBins([...bins, savedBin]);
      Alert.alert("Success", "Bin added successfully!");
    } else {
      Alert.alert("Error", "Failed to add bin.");
    }
  } catch (error) {
    console.error("Error:", error);
    Alert.alert("Error", "Something went wrong!");
  }

  setModalVisible(false);
  setBinName('');
};
