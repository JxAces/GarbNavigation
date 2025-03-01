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
    width: width * 0.6,
    maxHeight: height * 0.3,
    elevation: 5,
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  listItemText: {
    fontSize: 16,
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

    const interval = setInterval(() => {
      arrangeWaypoints();
    }, 1000);

    return () => clearInterval(interval);
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

  const arrangeWaypoints = async () => {
    try {
      const response = await fetch(`${BACKEND}/schedules/today`);
      const data = await response.json();

      const activeLocations = data
        .map((bin) => bin.locationId)
        .filter((location) => location.status === "Active");
      const inactiveLocations = data
        .map((bin) => bin.locationId)
        .filter((location) => location.status !== "Active");

      const unsortedPoints = activeLocations.map((location) => ({
        name: location.name,
        volume: location.volume,
        status: location.status,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
      }));

      const sortedPoints = unsortedPoints.sort(
        (a, b) => a.latitude - b.latitude
      );

      setIntermediaryPoints(sortedPoints);
      setInactivePoints(
        inactiveLocations.map((location) => ({
          name: location.name,
          volume: location.volume,
          status: location.status,
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
        }))
      );
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
          >
            <Callout>
              <View>
                <Text style={{ fontWeight: "bold" }}>{bin.name}</Text>
                <Text>Volume: {bin.volume}</Text>
                <Text>Status: {bin.status}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
        {inactivePoints.map((bin, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: bin.latitude,
              longitude: bin.longitude,
            }}
            image={notFullPin}
          >
            <Callout>
              <View>
                <Text style={{ fontWeight: "bold" }}>{bin.name}</Text>
                <Text>Volume: {bin.volume}</Text>
                <Text>Status: {bin.status}</Text>
              </View>
            </Callout>
          </Marker>
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
              <TouchableOpacity style={styles.listItem}>
                <Text style={styles.listItemText}>
                  {item.name} - {item.volume}%
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {!showDirections && (
        <TouchableOpacity
          style={styles.routeButton}
          onPress={getOptimizedWaypoints}
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
