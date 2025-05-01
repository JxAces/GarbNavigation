import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  Modal, TextInput, Alert, ActivityIndicator
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { GOOGLE_API_KEY, BACKEND } from "../environments";
import MapView, { Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';

const getBinIcon = (volume) => {
  if (volume >= 80) return require('../assets/full.png');
  if (volume >= 50) return require('../assets/full.png');
  return require('../assets/full.png');
};

const Garbage = () => {
  const [activeDay, setActiveDay] = useState('Mon');
  const [activeShift, setActiveShift] = useState('first');
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    day: '',
    shift: '',
    latitude: '',
    longitude: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBins = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND}/schedules?day=${activeDay}&shift=${activeShift}`);
      const data = await response.json();
      setBins(data || []);
    } catch (error) {
      console.error('Failed to fetch bins:', error);
      setBins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, [activeDay, activeShift]);

  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleEdit = (bin) => {
    setEditingBin(bin);
    const initialCoords = bin.locationId?.latitude && bin.locationId?.longitude 
      ? {
          latitude: parseFloat(bin.locationId.latitude),
          longitude: parseFloat(bin.locationId.longitude),
          latitudeDelta: 0.0009,  // More zoomed in (smaller number = more zoom)
          longitudeDelta: 0.0009, // Matches aspect ratio of typical phone screens
        }
      : {
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
    
    setMapRegion(initialCoords);
    setFormData({
      day: bin.day,
      shift: bin.shift,
      latitude: bin.locationId?.latitude || '',
      longitude: bin.locationId?.longitude || ''
    });
    setIsEditModalVisible(true);
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    updateMarkerPosition(latitude, longitude);
  };

  const updateMarkerPosition = (lat, lng) => {
    setMapRegion({
      ...mapRegion,
      latitude: lat,
      longitude: lng,
    });
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
  };

  const handleDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    updateMarkerPosition(latitude, longitude);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this schedule?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => confirmDelete(id),
          style: "destructive"
        }
      ]
    );
  };

  const confirmDelete = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND}/schedules/delete/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchBins(); // Refresh the list
        Alert.alert("Success", "Schedule deleted successfully");
      } else {
        throw new Error("Failed to delete schedule");
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert("Error", "Failed to delete schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingBin) return;
    
    try {
      setIsUpdating(true);
      const response = await fetch(`${BACKEND}/schedules/edit/${editingBin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsEditModalVisible(false);
        fetchBins(); // Refresh the list
        Alert.alert("Success", "Schedule updated successfully");
      } else {
        throw new Error("Failed to update schedule");
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert("Error", "Failed to update schedule");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderBin = ({ item }) => (
    <View style={styles.card}>
      <Image source={getBinIcon(item.locationId?.volume)} style={styles.icon} />
      <Text style={styles.name}>{item.locationId?.name}</Text>
      <Text style={styles.info}>Volume: {item.locationId?.volume}%</Text>
      <Text style={styles.info}>Status: {item.locationId?.status}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Ionicons name="create-outline" size={20} color="#4B7BE5" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <MaterialIcons name="delete" size={20} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Day Dropdown */}
      <RNPickerSelect
        value={activeDay}
        onValueChange={setActiveDay}
        items={[
          { label: 'Monday', value: 'Monday' },
          { label: 'Tuesday', value: 'Tuesday' },
          { label: 'Wednesday', value: 'Wednesday' },
          { label: 'Thursday', value: 'Thursday' },
          { label: 'Friday', value: 'Friday' },
          { label: 'Saturday', value: 'Saturday' },
          { label: 'Sunday', value: 'Sunday' },
        ]}
        style={{ inputIOS: styles.picker, inputAndroid: styles.picker }}
        placeholder={{ label: 'Select a day', value: null }}
      />

      {/* Shift Selector */}
      <View style={styles.shiftButtons}>
        {['First', 'Second', 'Third'].map((shift, i) => (
          <TouchableOpacity
            key={shift}
            style={[
              styles.shiftButton,
              activeShift === shift && styles.activeShift,
            ]}
            onPress={() => setActiveShift(shift)}
          >
            <Text
              style={[
                styles.shiftText,
                activeShift === shift && styles.activeShiftText,
              ]}
            >
              {i + 1}st Shift
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bin Grid */}
      {loading ? (
        <ActivityIndicator size="large" color="#4B7BE5" style={styles.loader} />
      ) : (
        <FlatList
          data={bins}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={renderBin}
          ListEmptyComponent={<Text style={styles.empty}>No bins found</Text>}
        />
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
            <Text style={styles.modalTitle}>Edit Schedule</Text>
            
            <Text style={styles.label}>Day</Text>
            <RNPickerSelect
              value={formData.day}
              onValueChange={(value) => setFormData({...formData, day: value})}
              items={[
                { label: 'Monday', value: 'Monday' },
                { label: 'Tuesday', value: 'Tuesday' },
                { label: 'Wednesday', value: 'Wednesday' },
                { label: 'Thursday', value: 'Thursday' },
                { label: 'Friday', value: 'Friday' },
                { label: 'Saturday', value: 'Saturday' },
                { label: 'Sunday', value: 'Sunday' },
              ]}
              style={pickerSelectStyles}
            />
            
            <Text style={styles.label}>Shift</Text>
            <RNPickerSelect
              value={formData.shift}
              onValueChange={(value) => setFormData({...formData, shift: value})}
              items={[
                { label: 'First Shift', value: 'First' },
                { label: 'Second Shift', value: 'Second' },
                { label: 'Third Shift', value: 'Third' },
              ]}
              style={pickerSelectStyles}
            />
            
            <Text style={styles.label}>Select Location</Text>
            <View style={styles.mapContainer}>
              <MapView
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  region={mapRegion}
                  onPress={handleMapPress}
                >
                  <Marker
                    coordinate={{
                      latitude: parseFloat(formData.latitude) || mapRegion.latitude,
                      longitude: parseFloat(formData.longitude) || mapRegion.longitude,
                    }}
                    draggable={true}
                    onDragEnd={handleDragEnd}
                    pinColor="#4B7BE5" // Custom marker color
                  />
                </MapView>
            </View>
            
            <View style={styles.coordinateDisplay}>
              <Text>Latitude: {formData.latitude || 'Not selected'}</Text>
              <Text>Longitude: {formData.longitude || 'Not selected'}</Text>
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
                onPress={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Bin FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => console.log('Add Bin')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
  container: { flex: 1, padding: 16, paddingTop: 10, backgroundColor: '#F2F4F8' },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  shiftButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#D6DDEB',
    alignItems: 'center',
  },
  activeShift: {
    backgroundColor: '#4B7BE5',
  },
  shiftText: {
    color: '#333',
    fontWeight: 'bold',
  },
  activeShiftText: {
    color: '#fff',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginBottom: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 6,
  },
  info: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
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
});

export default Garbage;