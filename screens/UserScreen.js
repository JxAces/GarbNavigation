import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
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
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 100,
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
    right: 10,
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
  progressText: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 8,
    borderRadius: 5,
    color: "#000",
    fontWeight: "bold",
  },
  navigationGuide: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },
  currentInstruction: {
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  distanceText: {
    fontSize: 16,
    color: '#555',
  },
  nextInstruction: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  nextInstructionText: {
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
  },
});

// Helper function to strip HTML tags from instructions
const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '');
};

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
  const [routeSegments, setRouteSegments] = useState([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [showShiftView, setShowShiftView] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [heading, setHeading] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState(null);
  const [nextInstruction, setNextInstruction] = useState(null);
  const [maneuverDistance, setManeuverDistance] = useState(null);
  const [navigationSteps, setNavigationSteps] = useState([]);
  const mapRef = useRef(null);

  const toggleShiftView = () => {
    setShowShiftView(!showShiftView);
  };

  useEffect(() => {
    console.log('Current position updated:', currentPosition);
  }, [currentPosition]);

  const selectShift = (shift) => {
    setSelectedShift(shift);
    setShowShiftView(false);
    arrangeWaypoints();
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
    setSelectedShift(currentShift);
  }, []);

  useEffect(() => {
    arrangeWaypoints();
  }, [selectedShift]);

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
          setHeading(heading);
  
          if (mapRef.current && heading >= 0) {
            mapRef.current.animateCamera({
              center: { latitude, longitude },
              heading: heading,
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
      const binIndex = intermediaryPoints.findIndex((bin) => bin._id === binId);
      if (binIndex === -1) return;

      const newStatus =
        intermediaryPoints[binIndex].collection === "Pending"
          ? "Collected"
          : "Pending";

      const response = await fetch(`${BACKEND}/schedules/${binId}/collect`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      const updatedBins = [...intermediaryPoints];
      updatedBins[binIndex] = {
        ...updatedBins[binIndex],
        collection: newStatus,
      };
      setIntermediaryPoints(updatedBins);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update collection status.");
    }
  };

  const arrangeWaypoints = async () => {
    try {
      if (!selectedShift) return;
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
        .filter((bin) => bin.locationId?.status === "Active" && bin.collection !== "Collected")
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
        .filter((bin) => bin.locationId?.status !== "Active" || bin.collection === "Collected")
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

  const getDistance = (point1, point2) => {
    const R = 6371;
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * 
      Math.cos(point2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000;
  };

  const getOptimizedWaypoints = async () => {
    if (!origin || intermediaryPoints.length === 0) return;

    const waypoints = [...intermediaryPoints];
    const waypointStrings = waypoints
      .map((wp) => `${wp.latitude},${wp.longitude}`)
      .join("|");

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&waypoints=optimize:true|${waypointStrings}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const optimizedOrder = data.routes[0].waypoint_order;
        const optimizedWaypoints = optimizedOrder.map(index => waypoints[index]);
        
        // Extract all steps from the route
        const allSteps = data.routes[0].legs.flatMap(leg => leg.steps);
        setNavigationSteps(allSteps);
        
        // Set initial instructions
        if (allSteps.length > 0) {
          setCurrentInstruction(allSteps[0].html_instructions);
          setNextInstruction(allSteps.length > 1 ? allSteps[1].html_instructions : null);
          setManeuverDistance(allSteps[0].distance.text);
        }

        const segments = [];
        const allPoints = [origin, ...optimizedWaypoints, destination];
        
        segments.push({
          origin: allPoints[0],
          destination: allPoints[1],
          color: "#4269E2",
          completed: false
        });
        
        for (let i = 1; i < allPoints.length - 1; i++) {
          segments.push({
            origin: allPoints[i],
            destination: allPoints[i + 1],
            color: "#4269E2",
            completed: false
          });
        }
        
        setRouteSegments(segments);
        setIntermediaryPoints(optimizedWaypoints);
        setCurrentSegmentIndex(0);
        setShowDirections(true);
        setShowSequence(true);
      }
    } catch (error) {
      console.error("Error optimizing route:", error);
    }
  };

  useEffect(() => {
    if (!isDriving || !currentPosition || routeSegments.length === 0) return;

    const checkSegmentCompletion = () => {
      const currentSegment = routeSegments[currentSegmentIndex];
      if (!currentSegment) return;

      const distance = getDistance(
        currentPosition,
        currentSegment.destination
      );

      // Update instructions based on position
      if (navigationSteps.length > 0) {
        // Find the closest step to current position
        let closestStep = navigationSteps[0];
        let minDistance = Infinity;
        
        for (const step of navigationSteps) {
          const stepDistance = getDistance(
            currentPosition,
            { latitude: step.start_location.lat, longitude: step.start_location.lng }
          );
          
          if (stepDistance < minDistance) {
            minDistance = stepDistance;
            closestStep = step;
          }
        }
      
        // Update instructions if we found a closer step
        const currentIndex = navigationSteps.indexOf(closestStep);
        setCurrentInstruction(closestStep.html_instructions);
        setManeuverDistance(closestStep.distance.text);
        
        if (currentIndex < navigationSteps.length - 1) {
          setNextInstruction(navigationSteps[currentIndex + 1].html_instructions);
        } else {
          setNextInstruction(null);
        }
      }

      if (distance < 150) {
        const updatedSegments = [...routeSegments];
        updatedSegments[currentSegmentIndex].completed = true;
        setRouteSegments(updatedSegments);
        
        if (currentSegmentIndex < routeSegments.length - 1) {
          setCurrentSegmentIndex(currentSegmentIndex + 1);
        } else {
          setIsDriving(false);
          Alert.alert("Route Completed", "You have reached your destination");
        }
      }
    };

    const interval = setInterval(checkSegmentCompletion, 1000);
    return () => clearInterval(interval);
  }, [isDriving, currentPosition, currentSegmentIndex, routeSegments, navigationSteps]);

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
          .map((bin, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: bin.latitude,
                longitude: bin.longitude,
              }}
              image={bin.volume >= 80 ? fullPin : notFullPin}
              title={bin.name}
              description={`Volume: ${bin.volume} | Status: ${bin.status} | No. ${index + 1}`}
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
        
        {showDirections && routeSegments.map((segment, index) => (
          <MapViewDirections
            key={`segment-${index}`}
            origin={segment.origin}
            destination={segment.destination}
            apikey={GOOGLE_API_KEY}
            strokeColor={segment.completed ? "#AAAAAA" : segment.color}
            strokeWidth={6}
            mode="DRIVING"
            precision="high"
          />
        ))}

        {isDriving && routeSegments[currentSegmentIndex] && (
          <MapViewDirections
            key={`current-segment`}
            origin={currentPosition || routeSegments[currentSegmentIndex].origin}
            destination={routeSegments[currentSegmentIndex].destination}
            apikey={GOOGLE_API_KEY}
            strokeColor="#00FF00"
            strokeWidth={8}
            mode="DRIVING"
            precision="high"
          />
        )}
      </MapView>

      {isDriving && (
        <Text style={styles.progressText}>
          {`Segment ${currentSegmentIndex + 1} of ${routeSegments.length}`}
        </Text>
      )}

      {isDriving && (
        <View style={styles.navigationGuide}>
          <View style={styles.currentInstruction}>
            <Text style={styles.instructionText} numberOfLines={2}>
              {stripHtml(currentInstruction || "Starting navigation...")}
            </Text>
            <Text style={styles.distanceText}>{maneuverDistance || ""}</Text>
          </View>
          {nextInstruction && (
            <View style={styles.nextInstruction}>
              <Text style={styles.nextInstructionText}>
                Next: {stripHtml(nextInstruction)}
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.viewShiftButton,
          showDirections && { backgroundColor: "#34a853" },
        ]}
        onPress={!showDirections ? toggleShiftView : null}
        disabled={showDirections}
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
            data={intermediaryPoints.filter((item) => item.status === "Active")}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>
                  {item.name} - {item.volume}%
                </Text>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor:
                        item.collection === "Pending" ? "yellow" : "green",
                      opacity: !isDriving ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => {
                    if (!isDriving) return;

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
                  disabled={!isDriving}
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
                        latitudeDelta: 0.0222,
                        longitudeDelta: 0.0222,
                      }, 1000);
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