import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GOOGLE_API_KEY, BACKEND } from "../environments";
import fullPin from "../assets/full.png";
import notFullPin from "../assets/notfull.png";

const AdminScreen = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = async () => {
    try {
      const response = await fetch(`${BACKEND}/locations`);
      const data = await response.json();
      setBins(data);
    } catch (error) {
      console.error("Error fetching bins:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, Admin!</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 8.2280, // Iligan City center approx
            longitude: 124.2452,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {bins.map((bin) => (
            <Marker
              key={bin._id}
              coordinate={{
                latitude: parseFloat(bin.latitude),
                longitude: parseFloat(bin.longitude),
              }}
              image={bin.volume >= 80 ? fullPin : notFullPin}
              title={bin.name}
              description={`Status: ${bin.status} | Volume: ${bin.volume}%`}

            />
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
});

export default AdminScreen;
