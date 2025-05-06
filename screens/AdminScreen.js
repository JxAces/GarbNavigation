import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, Dimensions, ActivityIndicator, ScrollView, Modal, TouchableOpacity, Alert, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import { GOOGLE_API_KEY, BACKEND } from "../environments";
import fullPin from "../assets/full.png";
import notFullPin from "../assets/notfull.png";
import bin25 from "../assets/25.png";
import bin50 from "../assets/50.png";
import bin75 from "../assets/75.png";

const AdminScreen = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedBin, setEditedBin] = useState({ name: '', latitude: '', longitude: '' });
  const [tempMarker, setTempMarker] = useState(null);
  const [mode, setMode] = useState('bin');
  const [newBin, setNewBin] = useState({ name: '', latitude: '', longitude: '', volume: 0 });
  const [newSchedule, setNewSchedule] = useState({ locationId: '', day: '', shift: '' });
  const slideAnim = useState(new Animated.Value(300))[0]; // Start offscreen (bottom)

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBins();
    }, 3000); // 3000ms = 3 seconds
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    console.log('Selected bin changed:', editedBin);
  }, [editedBin]);

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

  const showBottomSheet = () => {
    setBottomSheetVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleMarkerPress = (bin) => {
    setSelectedBin(bin);
    setBottomSheetVisible(true);
  };

  const handleEditPress = () => {
    setEditedBin({
      name: selectedBin.name,
      latitude: selectedBin.latitude,
      longitude: selectedBin.longitude
    });
    setTempMarker({
      latitude: parseFloat(selectedBin.latitude),
      longitude: parseFloat(selectedBin.longitude)
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteBin = async () => {
    Alert.alert(
      "Delete Bin",
      "Are you sure you want to delete this bin?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND}/locations/${selectedBin._id}`, {
                method: 'DELETE',
              });

              if (!response.ok) throw new Error('Failed to delete bin.');

              setBins(bins.filter(bin => bin._id !== selectedBin._id));
              setBottomSheetVisible(false);
              Alert.alert('Success', 'Bin deleted successfully!');
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to delete bin.');
            }
          }
        }
      ]
    );
  };

  const handleUpdateBin = async () => {
    if (!editedBin.name) {
      Alert.alert('Validation Error', 'Please enter a bin name');
      return;
    }

    try {
      const response = await fetch(`${BACKEND}/locations/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
  {
    name: editedBin.name,
    latitude: editedBin.latitude,
    longitude: editedBin.longitude,
  }
]),
      });

      if (!response.ok) throw new Error('Failed to update bin.');

      const updatedBin = await response.json();
      setBins(bins.map(bin => bin._id === updatedBin._id ? updatedBin : bin));
      setSelectedBin(updatedBin);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Bin updated successfully!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update bin.');
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setEditedBin({
      ...editedBin,
      latitude: latitude.toString(),
      longitude: longitude.toString()
    });
    setTempMarker({ latitude, longitude });
  };

  const hideBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setBottomSheetVisible(false);
      setSelectedBin(null);
    });
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
      setBins(prev => [...prev, result]);
      Alert.alert('Success', 'Bin added successfully!');
      setNewBin({ name: '', latitude: '', longitude: '' });
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
      setNewSchedule({ locationId: '', day: '', shift: '' });
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
            latitude: 8.2280,
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
              onPress={() => handleMarkerPress(bin)}
            />
          ))}
        </MapView>
      )}

      {/* Floating Action Button */}
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
      
      {bottomSheetVisible && selectedBin && (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>{selectedBin.name}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.editIconButton}
                onPress={handleEditPress}
              >
                <MaterialIcons name="edit" size={20} color="#4B7BE5" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteIconButton}
                onPress={handleDeleteBin}
              >
                <MaterialIcons name="delete" size={20} color="#e74c3c" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.closeIconButton}
                onPress={() => setBottomSheetVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.bottomSheetContent}>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <Text style={styles.infoText}>
                {parseFloat(selectedBin.latitude).toFixed(4)}, {parseFloat(selectedBin.longitude).toFixed(4)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="info" size={20} color="#666" />
              <Text style={styles.infoText}>Status: {selectedBin.status}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="storage" size={20} color="#666" />
              <View style={styles.volumeRow}>
                <Text style={styles.infoText}>Volume: </Text>
                <View style={styles.volumeContainer}>
                  <View 
                    style={[
                      styles.volumeBar, 
                      { 
                        width: `${selectedBin.volume}%`,
                        backgroundColor:
                          selectedBin.volume >= 90 ? '#e74c3c' :
                          selectedBin.volume >= 70 ? '#E43838' :
                          selectedBin.volume >= 50 ? '#E97304' :
                          selectedBin.volume >= 30 ? '#2ECC71' : '#687071'
                      }
                    ]} 
                  />
                  <Text style={styles.volumeText}>{selectedBin.volume}%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Bin</Text>
            
            <Text style={styles.label}>Bin Name</Text>
            <TextInput
              value={editedBin.name}
              onChangeText={(text) => setEditedBin({...editedBin, name: text})}
              style={styles.input}
              placeholder="Enter bin name"
            />
            <Text style={styles.label}>Location</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: tempMarker?.latitude || 8.2280,
                  longitude: tempMarker?.longitude || 124.2452,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                onPress={handleMapPress}
              >
                {tempMarker && (
                  <Marker
                    coordinate={tempMarker}
                    draggable
                    onDragEnd={(e) => {
                      const { latitude, longitude } = e.nativeEvent.coordinate;
                      setEditedBin({
                        ...editedBin,
                        latitude: latitude.toString(),
                        longitude: longitude.toString()
                      });
                      setTempMarker({ latitude, longitude });
                    }}
                  />
                )}
              </MapView>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  console.log(editedBin);
                  handleUpdateBin();
                }}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
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
    bottomSheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 16,
      paddingBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 10,
      zIndex: 2,
    },
    bottomSheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editIconButton: {
      marginRight: 12,
      padding: 4,
    },
    deleteIconButton: {
      marginRight: 12,
      padding: 4,
    },
    closeIconButton: {
      padding: 4,
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
    },
    bottomSheetContent: {
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    infoText: {
      marginLeft: 8,
      fontSize: 16,
      color: '#555',
    },
    volumeRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    volumeContainer: {
      flex: 1,
      height: 20,
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      overflow: 'hidden',
      marginLeft: 8,
      marginRight: 20,
      position: 'relative',
    },
    volumeBar: {
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
    },
    volumeText: {
      position: 'absolute',
      right: 5,
      top: 0,
      color: '#000',
      fontSize: 12,
      lineHeight: 20,
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
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      maxHeight: '80%',
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
    mapContainer: {
      height: 200,
      width: '100%',
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 15,
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
