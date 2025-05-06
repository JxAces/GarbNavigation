import React, { useState, useEffect, useRef, useMemo  } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  Image
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { GOOGLE_API_KEY, BACKEND } from "../environments";
import Constants from "expo-constants";
import notFullPin from "../assets/notfull.png";
import bin25 from "../assets/25.png";
import bin50 from "../assets/50.png";
import bin75 from "../assets/75.png";
import fullPin from "../assets/full.png";
import carIcon from "../assets/car4.png";

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
    bottom: 0,
    left: 2,
    right: 2,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 12,
    padding: 16,
    elevation: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  currentInstruction: {
    marginBottom: 3,
  },
  instructionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  distanceContainer: {
    backgroundColor: '#34a853',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  nextInstruction: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 8,
  },
  nextInstructionHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  nextInstructionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  segmentDistanceContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  segmentDistanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  collectionListContainer: {
    maxHeight: 80,
    marginVertical: 8,
    paddingVertical: 4,
  },
  collectionItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    minWidth: 120,
    position: 'relative',
  },
  completedCollectionItem: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  currentCollectionItem: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  collectionItemText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#333',
},
collectionVolumeText: {
  fontSize: 13,
  color: '#666',
  marginTop: 2,
},
  completedCheckmark: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4caf50',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  skipButton: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
  },
  skipButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stopButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
    marginLeft: 8,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skippedCollectionItem: {
  backgroundColor: '#ffebee',
  borderColor: '#ef5350',
},
skippedIndicator: {
  position: 'absolute',
  top: -5,
  right: -5,
  backgroundColor: '#ef5350',
  width: 20,
  height: 20,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
},
skippedText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 12,
},
etaContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 3,
},
etaBox: {
  backgroundColor: 'rgba(52, 168, 83, 0.2)',
  borderRadius: 8,
  padding: 8,
  minWidth: 100,
  alignItems: 'center',
},
etaLabel: {
  fontSize: 12,
  color: '#34a853',
},
etaValue: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#34a853',
},
});

const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '');
};

const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} meters`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
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
  const [distanceToSegment, setDistanceToSegment] = useState(null);
  const [skippedSegments, setSkippedSegments] = useState([]);
  const [collectedBins, setCollectedBins] = useState([]);
  const [totalEta, setTotalEta] = useState(null);
  const [nextSegmentEta, setNextSegmentEta] = useState(null);
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
              pitch: 45,
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

  // Helper function to get distance matrix

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
      console.log("Active locations:", activeLocations.name);
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

  const getOptimizedWaypoints = async (points = intermediaryPoints) => {
    if (!origin || points.length === 0) return;

    const waypointStrings = points
      .map((wp) => `${wp.latitude},${wp.longitude}`)
      .join("|");

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&waypoints=optimize:true|${waypointStrings}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK") {
         // Calculate total ETA
        const totalSeconds = data.routes[0].legs.reduce(
          (total, leg) => total + leg.duration.value, 0
        );
        setTotalEta(Math.ceil(totalSeconds / 60));

        // Calculate ETA to first segment (if there are segments)
        if (data.routes[0].legs.length > 0) {
          setNextSegmentEta(Math.ceil(data.routes[0].legs[0].duration.value / 60));
        }
        const optimizedOrder = data.routes[0].waypoint_order;
        const optimizedWaypoints = optimizedOrder.map(index => points[index]);

        const optimizedSequence = optimizedOrder.map(index => points[index].name );
        console.log("Optimized sequence:", optimizedSequence);
        
        const allSteps = data.routes[0].legs.flatMap(leg => leg.steps);
        setNavigationSteps(allSteps);
        
        if (allSteps.length > 0) {
          setCurrentInstruction(allSteps[0].html_instructions);
          setNextInstruction(allSteps.length > 1 ? allSteps[1].html_instructions : null);
          setManeuverDistance(allSteps[0].distance.text);
        }

        const segments = [];
        const allPoints = [origin, ...optimizedWaypoints, destination];
        
        for (let i = 0; i < allPoints.length - 1; i++) {
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
      Alert.alert("Route Error", "Failed to calculate optimized route");
    }
  };

  const skipCurrentSegment = async () => {
    if (currentSegmentIndex >= routeSegments.length) return;

    Alert.alert(
      "Skip This Bin?",
      "Are you sure you want to skip this collection point?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Skip",
          onPress: async () => {
            const segmentToSkip = routeSegments[currentSegmentIndex];
            const newSkipped = [...skippedSegments, segmentToSkip];
            setSkippedSegments(newSkipped);
            
            // Mark the bin as skipped in intermediaryPoints
            const updatedPoints = intermediaryPoints.map(bin => {
              if (bin.latitude === segmentToSkip.destination.latitude && 
                  bin.longitude === segmentToSkip.destination.longitude) {
                return {...bin, skipped: true};
              }
              return bin;
            });
            
            setIntermediaryPoints(updatedPoints);
            
            // Move to next segment if available
            if (currentSegmentIndex < routeSegments.length - 1) {
              setCurrentSegmentIndex(currentSegmentIndex + 1);
            } else {
              setIsDriving(false);
              Alert.alert("Route Completed", "You have reached the end of the route");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const getCurrentBinName = () => {
    if (currentSegmentIndex < intermediaryPoints.length) {
      return intermediaryPoints[currentSegmentIndex]?.name || "next location";
    }
    return "destination";
  };

  useEffect(() => {
    if (!isDriving || !currentPosition || routeSegments.length === 0) return;
  
    const checkSegmentCompletion = async () => {
      const currentSegment = routeSegments[currentSegmentIndex];
      if (!currentSegment) return;
  
      const distance = getDistance(currentPosition, currentSegment.destination);
      setDistanceToSegment(distance);
  
      // Only process for bins (not final destination)
      if (currentSegmentIndex < intermediaryPoints.length) {
        const currentBin = intermediaryPoints[currentSegmentIndex];
        const binPosition = {
          latitude: currentBin.latitude,
          longitude: currentBin.longitude
        };
        const binDistance = getDistance(currentPosition, binPosition);
  
        // Check if reached the bin (within 70m)
        if (binDistance < 70 && !currentBin.skipped) {
          try {
            // Fetch latest bin data
            const response = await fetch(`${BACKEND}/locations/name/${currentBin.name}`);
            const binData = await response.json();
            
            // Check if bin volume is now <80%
            if (binData.volume < 80) {
              // Update collection status
              await fetch(`${BACKEND}/schedules/${currentBin._id}/collect`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ collection: "Collected" }),
              });
  
              // Mark as collected in state
              const updatedPoints = intermediaryPoints.map(bin => {
                if (bin._id === currentBin._id) {
                  return {...bin, collection: "Collected"};
                }
                return bin;
              });
              setIntermediaryPoints(updatedPoints);
              
              // Update segment completion
              const updatedSegments = [...routeSegments];
              updatedSegments[currentSegmentIndex].completed = true;
              setRouteSegments(updatedSegments);
  
              // Move to next segment if available
              if (currentSegmentIndex < routeSegments.length - 1) {
                setCurrentSegmentIndex(currentSegmentIndex + 1);
              }
            }
          } catch (error) {
            console.error("Error updating bin status:", error);
          }
        }
      } 
      // Handle final destination
      else if (distance < 150) {
        const updatedSegments = [...routeSegments];
        updatedSegments[currentSegmentIndex].completed = true;
        setRouteSegments(updatedSegments);
        setIsDriving(false);
        Alert.alert("Route Completed", "You have reached your destination");
      }
    };
  
    const interval = setInterval(checkSegmentCompletion, 3000);
    return () => clearInterval(interval);
  }, [isDriving, currentPosition, currentSegmentIndex, routeSegments, intermediaryPoints]);

  useEffect(() => {
    if (!isDriving || !currentPosition || routeSegments.length === 0) return;

    const checkSegmentCompletion = () => {
      const currentSegment = routeSegments[currentSegmentIndex];
      if (!currentSegment) return;

      const distance = getDistance(currentPosition, currentSegment.destination);
      setDistanceToSegment(distance); // Update distance to current segment

      // Update instructions based on position
      if (navigationSteps.length > 0) {
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
      
        const currentIndex = navigationSteps.indexOf(closestStep);
        setCurrentInstruction(closestStep.html_instructions);
        setManeuverDistance(closestStep.distance.text);
        
        if (currentIndex < navigationSteps.length - 1) {
          setNextInstruction(navigationSteps[currentIndex + 1].html_instructions);
        } else {
          setNextInstruction(null);
        }
      }
    };

    const interval = setInterval(checkSegmentCompletion, 500);
    return () => clearInterval(interval);
  }, [isDriving, currentPosition, currentSegmentIndex, routeSegments, navigationSteps]);

  useEffect(() => {
    if (!isDriving || !currentPosition || routeSegments.length === 0) return;
  
    const updateRealTimeEta = async () => {
      // Get fresh values on each call
      const currentSegment = routeSegments[currentSegmentIndex];
      const currentPoints = [...intermediaryPoints]; // Get fresh copy
      
      try {
        // 1. Get ETA to next segment
        const segmentResponse = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?` +
          `origin=${currentPosition.latitude},${currentPosition.longitude}` +
          `&destination=${currentSegment.destination.latitude},` +
          `${currentSegment.destination.longitude}` +
          `&key=${GOOGLE_API_KEY}`
        );
        const segmentData = await segmentResponse.json();
  
        if (segmentData.status === "OK" && segmentData.routes[0]?.legs[0]) {
          const segmentEta = Math.ceil(segmentData.routes[0].legs[0].duration.value / 60);
          setNextSegmentEta(segmentEta);
        }
  
        // 2. Get total ETA (only if we have remaining waypoints)
        if (currentSegmentIndex < currentPoints.length) {
          const remainingWaypoints = currentPoints.slice(currentSegmentIndex);
          const totalResponse = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?` +
            `origin=${currentPosition.latitude},${currentPosition.longitude}` +
            `&destination=${destination.latitude},${destination.longitude}` +
            `&waypoints=${remainingWaypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|')}` +
            `&key=${GOOGLE_API_KEY}`
          );
          const totalData = await totalResponse.json();
          
          if (totalData.status === "OK" && totalData.routes[0]?.legs) {
            const totalSeconds = totalData.routes[0].legs.reduce(
              (total, leg) => total + leg.duration.value, 0
            );
            setTotalEta(Math.ceil(totalSeconds / 60));
          }
        }
      } catch (error) {
        console.error("Error updating ETA:", error);
      }
    };
  
    // Initial call
    updateRealTimeEta();
    
    // Set up interval
    const interval = setInterval(updateRealTimeEta, 30000);
    
    // Clean up
    return () => clearInterval(interval);
  }, [isDriving, currentPosition, currentSegmentIndex]); // Only depend on these

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

  const memoizedRouteSegments = useMemo(() => {
    return routeSegments.map(segment => ({
      ...segment,
      key: `segment-${segment.origin.latitude}-${segment.origin.longitude}-${segment.destination.latitude}-${segment.destination.longitude}`
    }));
  }, [routeSegments]);

  // Memoize the current segment
  const currentSegment = useMemo(() => {
    if (!isDriving || !routeSegments[currentSegmentIndex]) return null;
    return {
      ...routeSegments[currentSegmentIndex],
      key: `current-segment-${currentSegmentIndex}`
    };
  }, [isDriving, routeSegments, currentSegmentIndex]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={[styles.map, { marginBottom: isDriving ? 90 : 0 }]}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_POSITION}
        showsUserLocation={!isDriving}
        showsMyLocationButton={true}
        zoomEnabled={true}
        zoomControlEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        loadingEnabled={true}
        moveOnMarkerPress={true}
        showsBuildings={false}
        onMapReady={() => {
          mapRef.current?.animateCamera({
            center: INITIAL_POSITION,
            zoom: 14,
          });
        }}
      >
        {destination && <Marker coordinate={destination} title="Destination" />}
        {useMemo(() => (
          <>
            {intermediaryPoints
              .filter((bin) => {
                return (
                  !(currentPosition && bin.latitude === currentPosition.latitude && bin.longitude === currentPosition.longitude) &&
                  !(destination && bin.latitude === destination.latitude && bin.longitude === destination.longitude)
                );
              })
              .map((bin, index) => (  
                <Marker
                  key={`active-${bin._id}-${index}`}
                  coordinate={{
                    latitude: bin.latitude,
                    longitude: bin.longitude,
                  }}
                  image={
                    collectedBins.includes(bin._id) || bin.collection === "Collected"
                      ? notFullPin
                      : bin.volume >= 90
                      ? fullPin
                      : bin.volume >= 75
                      ? bin75
                      : bin.volume >= 50
                      ? bin50
                      : bin.volume >= 25
                      ? bin25
                      : notFullPin
                  }
                  title={bin.name}
                  description={`${collectedBins.includes(bin._id) || bin.collection === "Collected" ? 'Collected' : `${bin.volume}% full`} | Status: ${bin.status} | No. ${index + 1}`}
                />
              ))}
            
            {inactivePoints.map((bin, index) => (
              <Marker
                key={`inactive-${bin._id}-${index}`}
                coordinate={{
                  latitude: bin.latitude,
                  longitude: bin.longitude,
                }}
                image={
                  bin.volume >= 90
                    ? fullPin
                    : bin.volume >= 75
                    ? bin75
                    : bin.volume >= 50
                    ? bin50
                    : bin.volume >= 25
                    ? bin25
                    : notFullPin
                }
                title={bin.name}
                description={`Volume: ${bin.volume} | Status: ${bin.status}`}
              />
            ))}
          </>
        ), [intermediaryPoints, inactivePoints, currentPosition, destination, collectedBins])}
        {isDriving && currentPosition && (
          <Marker
            coordinate={currentPosition}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={heading}
            zIndex={1000}
            tracksViewChanges={false} // Better performance
            image={carIcon}
          />
        )}

        
        {/* Optimized directions rendering */}
        {showDirections && memoizedRouteSegments.map((segment) => (
          <MapViewDirections
            key={segment.key}
            origin={segment.origin}
            destination={segment.destination}
            apikey={GOOGLE_API_KEY}
            strokeColor={segment.completed ? "#AAAAAA" : segment.color}
            strokeWidth={6}
            mode="DRIVING"
            precision="high"
            optimizeWaypoints={true}
            resetOnChange={false}  // Prevent unnecessary recalculations
          />
        ))}

        {currentSegment && (
          <MapViewDirections
            key={currentSegment.key}
            origin={currentPosition || currentSegment.origin}
            destination={currentSegment.destination}
            apikey={GOOGLE_API_KEY}
            strokeColor="#00FF00"
            strokeWidth={8}
            mode="DRIVING"
            precision="high"
            resetOnChange={false}  // Prevent unnecessary recalculations
          />
        )}
      </MapView>
      {isDriving && (
        <>
          <Text style={styles.progressText}>
            {`Collection ${currentSegmentIndex + 1} of ${routeSegments.length}`}
          </Text>

          <View style={styles.navigationGuide}>
            <View style={styles.etaContainer}>
              <View style={styles.etaBox}>
                <Text style={styles.etaLabel}>to {getCurrentBinName()}:</Text>
                <Text style={styles.etaValue}>{nextSegmentEta} min</Text>
              </View>
              <View style={styles.etaBox}>
                <Text style={styles.etaLabel}>Total:</Text>
                <Text style={styles.etaValue}>{totalEta} min</Text>
              </View>
            </View>
            <View style={styles.currentInstruction}>
              <View style={styles.instructionHeader}>
                <Text style={styles.instructionText} numberOfLines={2}>
                  {stripHtml(currentInstruction || "Starting navigation...")}
                </Text>
                <View style={styles.distanceContainer}>
                  <Text style={styles.distanceText}>{maneuverDistance || "0 m"}</Text>
                </View>
              </View>
              
              <View style={styles.segmentDistanceContainer}>
                <Text style={styles.segmentDistanceText}>
                  {distanceToSegment ? 
                    `${formatDistance(distanceToSegment)} to ${getCurrentBinName()}` : 
                    "Calculating distance..."}
                </Text>
              </View>
            </View>

            <View style={styles.collectionListContainer}>
              <FlatList
                data={intermediaryPoints.filter(item => item.status === "Active")}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={[
                    styles.collectionItem,
                    currentSegmentIndex === index && styles.currentCollectionItem,
                    (item.collection === "Collected" || collectedBins.includes(item._id)) && styles.completedCollectionItem,
                    item.skipped && styles.skippedCollectionItem
                  ]}>
                    <Text style={styles.collectionItemText}>
                      {index + 1}. {item.name}
                    </Text>
                    <Text style={styles.collectionVolumeText}>
                      {item.skipped ? 'Skipped' : 
                      (item.collection === "Collected" || collectedBins.includes(item._id)) ? 'Collected' : `${item.volume}% full`}
                    </Text>
                    {!item.skipped && (item.collection === "Collected" || collectedBins.includes(item._id)) && (
                      <View style={styles.completedCheckmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                    {item.skipped && (
                      <View style={styles.skippedIndicator}>
                        <Text style={styles.skippedText}>✗</Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>

            {nextInstruction && (
              <View style={styles.nextInstruction}>
                <Text style={styles.nextInstructionHeader}>NEXT:</Text>
                <Text style={styles.nextInstructionText} numberOfLines={2}>
                  {stripHtml(nextInstruction)}
                </Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={skipCurrentSegment}
              >
                <Text style={styles.skipButtonText}>Skip This Bin</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.stopButton}
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
                        text: "Stop",
                        onPress: async () => {
                          setIsDriving(false);
                          setShowDirections(false);
                          setShowSequence(false);
                          setSkippedSegments([]);
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
                <Text style={styles.stopButtonText}>Stop Navigation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
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
    </View>
  );
}