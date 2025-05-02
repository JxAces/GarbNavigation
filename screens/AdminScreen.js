import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, Dimensions, ActivityIndicator, ScrollView, Modal, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import { GOOGLE_API_KEY, BACKEND } from "../environments";
import fullPin from "../assets/full.png";
import notFullPin from "../assets/notfull.png";

const AdminScreen = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [mode, setMode] = useState('bin'); // or 'schedule'
  const [newBin, setNewBin] = useState({ name: '', latitude: '', longitude: '', volume: 0 });
  const [newSchedule, setNewSchedule] = useState({ locationId: '', day: '', shift: '' });
  const [Allbins, setbins] = useState([]);


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

    const handleAddBin = async () => {
      if (!newBin.name || !newBin.latitude || !newBin.longitude) {
        Alert.alert('Validation Error', 'Please complete all bin fields.');
        return;
      }
    
      try {
        const response = await fetch(`${BACKEND}/locations/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newBin),
        });
    
        if (!response.ok) throw new Error('Failed to save bin.');
    
        const result = await response.json();
        setBins(prev => [...prev, result]); // Update local bin list
        Alert.alert('Success', 'Bin added successfully!');
        setNewBin({ name: '', latitude: '', longitude: '' }); // Reset form
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to save bin.');
      }
    };

    const handleCreateSchedule = async () => {
      const { locationId, day, shift } = newSchedule;
      if (!locationId || !day || !shift) {
        Alert.alert('Validation Error', 'Please complete all schedule fields.');
        return;
      }
        try {
        const response = await fetch(`${BACKEND}/schedules/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSchedule),
        });
    
        if (!response.ok) throw new Error('Failed to save schedule.');
    
        const result = await response.json();
        Alert.alert('Success', 'Schedule created!');
        setNewSchedule({ locationId: '', day: '', shift: '' }); // Reset form
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to save schedule.');
      }
    };


  return (
    <View style={styles.container}>
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

      <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add {mode === 'bin' ? 'Bin' : 'Schedule'}</Text>

            {/* Toggle Buttons */}
            <View style={styles.toggleButtons}>
              <TouchableOpacity
                style={[styles.toggleButton, mode === 'bin' && styles.activeToggle]}
                onPress={() => setMode('bin')}
              >
                <Text style={[styles.toggleText, mode === 'bin' && styles.activeToggleText]}>
                  Add Bin
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, mode === 'schedule' && styles.activeToggle]}
                onPress={() => setMode('schedule')}
              >
                <Text style={[styles.toggleText, mode === 'schedule' && styles.activeToggleText]}>
                  Create Schedule
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'bin' ? (
              <>
                <Text style={styles.label}>Bin Name</Text>
                <TextInput
                  value={newBin.name}
                  onChangeText={(text) => setNewBin({...newBin, name: text})}
                  style={styles.input}
                  placeholder="Enter bin name"
                />

                <Text style={styles.label}>Select Location</Text>
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    region={{
                      latitude: 8.2280, // Iligan City center approx
                      longitude: 124.2452,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                    onPress={(e) => {
                      const { latitude, longitude } = e.nativeEvent.coordinate;
                      setNewBin({
                        ...newBin,
                        latitude: latitude.toString(),
                        longitude: longitude.toString()
                      });
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

                      />
                    ))}
                    {newBin.latitude && newBin.longitude && (
                      <Marker
                        coordinate={{
                          latitude: parseFloat(newBin.latitude),
                          longitude: parseFloat(newBin.longitude)
                        }}
                        draggable
                        onDragEnd={(e) => {
                          const { latitude, longitude } = e.nativeEvent.coordinate;
                          setNewBin({
                            ...newBin,
                            latitude: latitude.toString(),
                            longitude: longitude.toString()
                          });
                        }}
                      />
                    )}
                  </MapView>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.label}>Select Bin</Text>
                <RNPickerSelect
                  value={newSchedule.locationId}
                  onValueChange={(val) => setNewSchedule({...newSchedule, locationId: val})}
                  items={bins.map((bin) => ({
                    label: bin.name,
                    value: bin._id
                  }))}
                  placeholder={{ label: 'Choose a bin', value: null }}
                  style={pickerSelectStyles}
                />

                <Text style={styles.label}>Select Day</Text>
                <RNPickerSelect
                  value={newSchedule.day}
                  onValueChange={(val) => setNewSchedule({...newSchedule, day: val})}
                  items={[
                    'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
                  ].map(day => ({ label: day, value: day }))}
                  style={pickerSelectStyles}
                />

                <Text style={styles.label}>Select Shift</Text>
                <RNPickerSelect
                  value={newSchedule.shift}
                  onValueChange={(val) => setNewSchedule({...newSchedule, shift: val})}
                  items={[
                    { label: 'First', value: 'First' },
                    { label: 'Second', value: 'Second' },
                    { label: 'Third', value: 'Third' }
                  ]}
                  style={pickerSelectStyles}
                />
              </>
            )}

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={async () => {
                  if (mode === 'bin') {
                    await handleAddBin();
                  } else {
                    await handleCreateSchedule();
                  }
                  setIsAddModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
    </View>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
});

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
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 30,
      backgroundColor: '#4B7BE5',
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },
    loader: {
      marginTop: 50,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: '#4B7BE5',
    },
    label: {
      marginBottom: 5,
      fontWeight: 'bold',
      color: '#555',
    },
    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 10,
      marginBottom: 15,
      backgroundColor: '#fff',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: '#E74C3C',
    },
    saveButton: {
      backgroundColor: '#4B7BE5',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    mapContainer: {
      height: 250, // Slightly taller for better interaction
      width: '100%',
      marginVertical: 10,
      borderRadius: 8,
      overflow: 'hidden',
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    coordinateDisplay: {
      padding: 10,
      backgroundColor: '#f5f5f5',
      borderRadius: 5,
      marginBottom: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    addModalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#D6DDEB',
    marginHorizontal: 5,
  },
  toggleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  activeToggle: {
    backgroundColor: '#4B7BE5',
  },
  toggleText: {
    color: '#000',
    fontWeight: 'bold',
  },
  activeToggleText: {
    color: '#fff',
  },
});

export default AdminScreen;
