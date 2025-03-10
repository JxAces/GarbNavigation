import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert, Modal, FlatList} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { GOOGLE_API_KEY, BACKEND } from "../environments";
import Constants from "expo-constants";
import fullPin from "../assets/full.png";
import notFullPin from "../assets/notfull.png";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const ILIGAN_CITY_LATITUDE = 8.228;
const ILIGAN_CITY_LONGITUDE = 124.2453;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
  latitude: ILIGAN_CITY_LATITUDE,
  longitude: ILIGAN_CITY_LONGITUDE,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  routeButton: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "#34a853",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 5,
  },
  routeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  listButton: {
    position: "absolute",
    top: 50,
    left: 10,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 5,
  },
  listButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdown: {
    position: "absolute",
    top: 100,
    left: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: width * 0.7,
    maxHeight: height * 0.3,
    elevation: 5,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Keeps elements on both sides
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%", // Makes sure it spans full width
  },

  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 100, // Ensures consistent button width
    alignItems: "center",
  },

  statusButtonText: {
    fontWeight: "bold",
    color: "#000",
  },

  listItemText: {
    fontSize: 16,
  },
  viewShiftButton: {
    position: "absolute",
    top: 50,
    right: 10, // Place it in the upper right corner
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 5,
  },
  viewShiftButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  shiftDropdown: {
    position: "absolute",
    top: 100,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 150,
    elevation: 5,
  },
  shiftItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  shiftItemText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default function Driver() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState({
    latitude: 8.26912,
    longitude: 124.29494,
  });
  const [intermediaryPoints, setIntermediaryPoints] = useState([]);
  const [showDirections, setShowDirections] = useState(false);
  const [showSequence, setShowSequence] = useState(false);
  const [isDriving, setIsDriving] = useState(false);
  const [inactivePoints, setInactivePoints] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showCollectionList, setShowCollectionList] = useState(false);
  const mapRef = useRef(null);

  const [showShiftView, setShowShiftView] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  const toggleShiftView = () => {
    setShowShiftView(!showShiftView);
  };

  const selectShift = (shift) => {
    setSelectedShift(shift);
    setShowShiftView(false);
    arrangeWaypoints(); // Fetch schedules for the selected shift
  };

  const getCurrentShift = () => {
    const now = new Date();
    const localHour = now.getUTCHours() + 8;
    const adjustedHour = localHour >= 24 ? localHour - 24 : localHour;
    if (adjustedHour >= 4 && adjustedHour < 12) return "First";
    if (adjustedHour >= 12 && adjustedHour < 20) return "Second";
    return "Third";
  };
  
  // Test the function
  console.log("Current Shift:", getCurrentShift());
  

  useEffect(() => {
    const getDeviceLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Permission to access location was denied");
        return;
      }
  
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
  
      setOrigin({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
  
      setCurrentPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };
  
    getDeviceLocation();
  }, []);

  useEffect(() => {
    arrangeWaypoints();
  }, [selectedShift]);

  useEffect(() => {
    if (isDriving) {
      const locationSubscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          setCurrentPosition({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      return () => {
        locationSubscription && locationSubscription.remove();
      };
    }
  }, [isDriving]);

  const [binStatuses, setBinStatuses] = useState({});

  const toggleCollectionStatus = async (binId) => {
    try {
      // Find the index of the bin in intermediaryPoints
      const binIndex = intermediaryPoints.findIndex((bin) => bin._id === binId);
      if (binIndex === -1) return; // Bin not found
  
      // Determine new status (toggle logic)
      const newStatus = intermediaryPoints[binIndex].collection === "Pending" ? "Collected" : "Pending";
  
      // Send the update request to the backend
      const response = await fetch(`${BACKEND}/schedules/${binId}/collect`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: newStatus }), // Send new status
      });
  
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
  
      // Update the intermediaryPoints state
      const updatedBins = [...intermediaryPoints];
      updatedBins[binIndex] = { ...updatedBins[binIndex], collection: newStatus };
      setIntermediaryPoints(updatedBins);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update collection status.");
    }
  };
  
  

  const arrangeWaypoints = async () => {
    try {
      const shiftQuery = selectedShift ? `/${selectedShift.replace(" Shift", "")}` : "";
      const response = await fetch(`${BACKEND}/schedules/today${shiftQuery}`);
      const data = await response.json();
  
      if (data.message) {
        console.warn("No schedules found:", data.message);
        setIntermediaryPoints([]);
        setInactivePoints([]);
        return;
      }
  
      if (!Array.isArray(data)) {
        console.error("Unexpected response format:", data);
        return;
      }
  
      const activeLocations = data
        .filter((bin) => bin.locationId?.status === "Active")
        .map((bin) => ({
          _id: bin._id,
          name: bin.locationId.name,
          volume: bin.locationId.volume,
          status: bin.locationId.status,
          collection: bin.collection, // <-- Include collection status
          latitude: parseFloat(bin.locationId.latitude),
          longitude: parseFloat(bin.locationId.longitude),
        }));
  
      const inactiveLocations = data
        .filter((bin) => bin.locationId?.status !== "Active")
        .map((bin) => ({
          _id: bin._id,
          name: bin.locationId.name,
          volume: bin.locationId.volume,
          status: bin.locationId.status,
          collection: bin.collection, // <-- Include collection status
          latitude: parseFloat(bin.locationId.latitude),
          longitude: parseFloat(bin.locationId.longitude),
        }));
  
      setIntermediaryPoints(activeLocations);
      setInactivePoints(inactiveLocations);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };
  

  const getOptimizedWaypoints = async () => {
    const waypoints = [origin, ...intermediaryPoints, destination];
    const waypointStrings = waypoints
      .map((wp) => `${wp.latitude},${wp.longitude}`)
      .join("|");

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&waypoints=optimize:true|${waypointStrings}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const optimizedWaypoints = data.routes[0].waypoint_order.map(
          (index) => waypoints[index]
        );
        setIntermediaryPoints(optimizedWaypoints);
        setShowDirections(true);
        setShowSequence(true);
      } else {
        console.error("Failed to optimize waypoints:", data.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const startDriving = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access location was denied"
      );
      return;
    }
    setIsDriving(true);
  };

  const toggleCollectionList = () => {
    setShowCollectionList(!showCollectionList);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_POSITION}
        showsUserLocation={true}
      >
        {destination && <Marker coordinate={destination} title="Destination" />}
        {intermediaryPoints.map((bin, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: bin.latitude,
              longitude: bin.longitude,
            }}
            image={bin.volume >= 80 ? fullPin : notFullPin}
            title={bin.name}
            description={`Volume: ${bin.volume} | Status: ${bin.status}`}
          />
        ))}
        {inactivePoints.map((bin, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: bin.latitude,
              longitude: bin.longitude,
            }}
            image={notFullPin}
            title={bin.name}
            description={`Volume: ${bin.volume} | Status: ${bin.status}`}
          />
        ))}
        {showDirections && origin && destination && (
          <>
            <MapViewDirections
              origin={origin}
              destination={destination}
              waypoints={intermediaryPoints}
              apikey={GOOGLE_API_KEY}
              strokeColor="#021273"
              strokeWidth={8}
            />
            <MapViewDirections
              origin={origin}
              destination={destination}
              waypoints={intermediaryPoints}
              apikey={GOOGLE_API_KEY}
              strokeColor="#4269E2"
              strokeWidth={6}
            />
          </>
        )}
      </MapView>

      <TouchableOpacity style={styles.viewShiftButton} onPress={toggleShiftView}>
        <Text style={styles.viewShiftButtonText}>
          {selectedShift ? `${selectedShift}` : "View Shift"}
        </Text>
      </TouchableOpacity>

      {showShiftView && (
        <View style={styles.shiftDropdown}>
          {["First", "Second", "Third"].map((shift, index) => (
            <TouchableOpacity
              key={index}
              style={styles.shiftItem}
              onPress={() => selectShift(shift)}
            >
              <Text style={styles.shiftItemText}>{shift} Shift</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.listButton}
        onPress={toggleCollectionList}
      >
        <Text style={styles.listButtonText}>List of Collection</Text>
      </TouchableOpacity>

      {showCollectionList && (
        <View style={styles.dropdown}>
          <FlatList
            data={intermediaryPoints}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>
                  {item.name} - {item.volume}%
                </Text>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    { backgroundColor: item.collection === "Pending" ? "yellow" : "green" },
                  ]}
                  onPress={() => toggleCollectionStatus(item._id)}
                >
                  <Text style={styles.statusButtonText}>
                    {item.collection === "Pending" ? "Pending" : "Collected"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {!showDirections && (
        <TouchableOpacity
          style={[
            styles.routeButton,
            selectedShift !== getCurrentShift() && { backgroundColor: "gray" },
          ]}
          onPress={selectedShift === getCurrentShift() ? getOptimizedWaypoints : () => Alert.alert("Invalid Shift", "You can only generate routes during your assigned shift.")}
          disabled={selectedShift !== getCurrentShift()}
        >
          <Text style={styles.routeButtonText}>Generate Route</Text>
        </TouchableOpacity>
      )}

      {showSequence && (
        <TouchableOpacity style={styles.routeButton} onPress={startDriving}>
          <Text style={styles.routeButtonText}>Start Navigation</Text>
        </TouchableOpacity>
      )}

      {isDriving && (
        <TouchableOpacity
          style={styles.routeButton}
          onPress={() => setIsDriving(false)}
        >
          <Text style={styles.routeButtonText}>Stop Navigation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
