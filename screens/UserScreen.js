import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from "react-native";
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
const LATITUDE_DELTA = 0.01;
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
  const [OptimizedWaypoints, setOptimizedWaypoints] = useState([]);
  const [showDirections, setShowDirections] = useState(false);
  const [showSequence, setShowSequence] = useState(false);
  const [isDriving, setIsDriving] = useState(false);
  const [inactivePoints, setInactivePoints] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showCollectionList, setShowCollectionList] = useState(false);
  const mapRef = useRef(null);

  const [showShiftView, setShowShiftView] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [heading, setHeading] = useState(0);


  const toggleShiftView = () => {
    setShowShiftView(!showShiftView);
  };

  const selectShift = (shift) => {
    setSelectedShift(shift);
    setShowShiftView(false);
    getOptimizedWaypoints();
  };

  const getCurrentShift = () => {
    const now = new Date();
    const localHour = now.getUTCHours() + 8;
    const adjustedHour = localHour >= 24 ? localHour - 24 : localHour;
    if (adjustedHour >= 4 && adjustedHour < 12) return "First";
    if (adjustedHour >= 12 && adjustedHour < 20) return "Second";
    return "Third";
  };

  useEffect(() => {
    const currentShift = getCurrentShift();
    setSelectedShift(currentShift); // Automatically select the current shift
  }, []);

  useEffect(() => {
    const getDeviceLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied"
        );
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
    const interval = setInterval(() => {
      if (selectedShift) {
        arrangeWaypoints(selectedShift); // safely call based on current shift
      }
    }, 3000);
  
    return () => clearInterval(interval);
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
          const { latitude, longitude, heading } = location.coords;
  
          setCurrentPosition({ latitude, longitude });
          setHeading(heading); // Optional: to show in UI/debug
  
          // Only update if heading is valid (>= 0)
          if (mapRef.current && heading >= 0) {
            mapRef.current.animateCamera({
              center: { latitude, longitude },
              heading: heading, // 🔁 rotate map to match direction of travel
              pitch: 5,
              zoom: 19,
            });
          }
        }
      );
  
      return () => {
        locationSubscription.then((sub) => sub.remove());
      };
    }
  }, [isDriving]);

  const toggleCollectionStatus = async (binId) => {
    try {
      const binIndex = OptimizedWaypoints.findIndex((bin) => bin._id === binId);
      if (binIndex === -1) return; // Bin not found

      // Determine new status (toggle logic)
      const newStatus =
        OptimizedWaypoints[binIndex].collection === "Pending"
          ? "Collected"
          : "Pending";

      // Send the update request to the backend
      const response = await fetch(`${BACKEND}/schedules/${binId}/collect`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: newStatus }), // Send new status
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedBins = [...OptimizedWaypoints];
      updatedBins[binIndex] = {
        ...updatedBins[binIndex],
        collection: newStatus,
      };
      setOptimizedWaypoints(updatedBins);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update collection status.");
    }
  };

  const arrangeWaypoints = async () => {
    try {
      if (!selectedShift) return; // Ensure selectedShift is not null
      let endpoint =
        selectedShift === "Backlog"
          ? `${BACKEND}/backlogs`
          : `${BACKEND}/schedules/today/${selectedShift.replace(" Shift", "")}`;

      const response = await fetch(endpoint);
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
        .filter((bin) =>
          (bin.locationId?.status === "Active" && bin.locationId?.binType === "iot") ||
          (bin.collection !== "Collected" && bin.locationId?.binType === "non-iot")
        )
        .map((bin) => ({
          _id: bin._id,
          name: bin.locationId.name,
          volume: bin.locationId.volume,
          status: bin.locationId.status,
          collection: bin.collection,
          latitude: parseFloat(bin.locationId.latitude),
          longitude: parseFloat(bin.locationId.longitude),
        }));

      const inactiveLocations = data
        .filter((bin) =>
          (bin.locationId?.status !== "Active" && bin.locationId?.binType === "iot") ||
        (bin.collection === "Collected" && bin.locationId?.binType === "non-iot")
        )
        .map((bin) => ({
          _id: bin._id,
          name: bin.locationId.name,
          volume: bin.locationId.volume,
          status: bin.locationId.status,
          collection: bin.collection,
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
        setOptimizedWaypoints(optimizedWaypoints);
        setIntermediaryPoints(optimizedWaypoints);

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
        onMapReady={() => {
          mapRef.current?.animateCamera({
            center: INITIAL_POSITION,
            zoom: 14,
          });
        }}
      >
        {destination && <Marker coordinate={destination} title="Destination" />}
        {intermediaryPoints
        .filter((bin) => {
          return (
            !(currentPosition && bin.latitude === currentPosition.latitude && bin.longitude === currentPosition.longitude) &&
            !(destination && bin.latitude === destination.latitude && bin.longitude === destination.longitude)
          );
        })
      .map((bin, index) => {
        const optimizedIndex = OptimizedWaypoints.findIndex(
          (wp) => wp.latitude === bin.latitude && wp.longitude === bin.longitude
        );

        return (
          <Marker
            key={index}
            coordinate={{
              latitude: bin.latitude,
              longitude: bin.longitude,
            }}
            image={fullPin}
            title={bin.name}
            description={
              bin.volume !== undefined
                ? `Volume: ${bin.volume} | Status: ${bin.status} | No. ${(optimizedIndex !== -1 ? optimizedIndex + 1 : index + 1)}`
                : `No. ${(optimizedIndex !== -1 ? optimizedIndex : index + 1)}`
            }
          />
        );
      })}
        {inactivePoints.map((bin, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: bin.latitude,
              longitude: bin.longitude,
            }}
            image={notFullPin}
            title={bin.name}
            description={
             bin.volume !== undefined
                ? `Volume: ${bin.volume} | Status: ${bin.status} | No. ${index + 1}`
                : ``
            }
          />
        ))}
        
        {showDirections && origin && destination && (
          <>
            <MapViewDirections
              origin={origin}
              destination={destination}
              waypoints={OptimizedWaypoints}
              apikey={GOOGLE_API_KEY}
              strokeColor="#021273"
              strokeWidth={8}
            />
            <MapViewDirections
              origin={origin}
              destination={destination}
              waypoints={OptimizedWaypoints}
              apikey={GOOGLE_API_KEY}
              strokeColor="#4269E2"
              strokeWidth={6}
            />
            </>
          )}
          </MapView>

          <TouchableOpacity
          style={[
            styles.viewShiftButton,
            showDirections && { backgroundColor: "#34a853" }, // Disable appearance
        ]}
        onPress={!showDirections ? toggleShiftView : null} // Disable interaction
        disabled={showDirections} // Prevent pressing
      >
        <Text style={styles.viewShiftButtonText}>
          {selectedShift ? `${selectedShift} Shift` : "View Shift"}
        </Text>
      </TouchableOpacity>


      {showShiftView && (
        <View style={styles.shiftDropdown}>
          {["First", "Second", "Third", "Backlog"].map((shift, index) => (
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
            data={OptimizedWaypoints.filter(
              (item) => item.status === "Active" || item.collection === "Pending" || item.collection === "Collected"
            )}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>
                  {item.volume === undefined
                  ? item.name
                  : `${item.name} - ${item.volume}%`}
                </Text>

                {item.volume === undefined && (
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor:
                        item.collection === "Pending" ? "yellow" : "green",
                      opacity: !isDriving ? 0.5 : 1, // Optional: visually indicate disabled state
                    },
                  ]}
                  onPress={() => {
                    if (!isDriving) return; // Prevent press if not driving

                    if (
                      selectedShift === "Backlog" ||
                      selectedShift === getCurrentShift()
                    ) {
                      toggleCollectionStatus(item._id);
                    } else {
                      Alert.alert(
                        "Invalid Shift",
                        "You can only change collection status during your assigned shift or for backlogs."
                      );
                    }
                  }}
                  disabled={!isDriving} // Disable the button when not driving
                >
                  <Text style={styles.statusButtonText}>
                    {item.collection === "Pending" ? "Pending" : "Collected"}
                  </Text>
                </TouchableOpacity>
              )}
              </View>
            )}
          />
        </View>
      )}

      {!showDirections && (
        <TouchableOpacity
          style={[
            styles.routeButton,
            selectedShift &&
              selectedShift !== getCurrentShift() &&
              selectedShift !== "Backlog" && {
                backgroundColor: "gray",
              },
          ]}
          onPress={() => {
            if (
              selectedShift === "Backlog" ||
              (selectedShift &&
                selectedShift === getCurrentShift()) ||
              selectedShift.includes("Backlogs")
            ) {
              getOptimizedWaypoints();
              setShowDirections(true);
              setShowSequence(true);
            } else {
              Alert.alert(
                "Invalid Shift",
                "You can only generate routes during your assigned shift or for backlogs."
              );
            }
          }}
          disabled={
            selectedShift &&
            selectedShift !== getCurrentShift() &&
            selectedShift !== "Backlog"
          }
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
          onPress={() => {
            Alert.alert(
              "Stop Navigation",
              "Are you sure you want to stop navigation?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Yes",
                  onPress: async () => {
                    setIsDriving(false);
                    setShowDirections(false);
                    setShowSequence(false);
                    await arrangeWaypoints();

                    if (currentPosition && mapRef.current) {
                      mapRef.current.animateToRegion({
                        ...currentPosition,
                        latitudeDelta: 0.0222, // wider view
                        longitudeDelta: 0.0222,
                      }, 1000); // animate over 1 second
                    }
                  },
                  style: "destructive",
                },
              ],
              { cancelable: true }
            );
          }}
        >
          <Text style={styles.routeButtonText}>Stop Navigation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
