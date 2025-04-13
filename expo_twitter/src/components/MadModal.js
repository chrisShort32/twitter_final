import React from 'react';
import { Modal, View, StyleSheet, Pressable, Text, Platform} from 'react-native';
import {MapView, Marker } from './MapView';

const MapModal = ({ visible, onClose, location }) => {
    if (!location) return null;

    const { latitude, longitude } = location;

    return (
        <Modal animationType="slide" transparent={false} visible={visible}>
            <View style={styles.container}>
                {Platform.OS === 'web' ? (
                <MapView latitude={latitude} longitude={longitude} style={styles.map}/>
                ) : (  
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                    <Marker coordinate={{ latitude, longitude }} />
                </MapView>
                )}
                <Pressable style={[
                        styles.closeButton,
                        Platform.OS === 'web' ? {right: 20} : {left:20}
                    ]}
                    onPress={onClose}
                    >
                    <Text style={styles.closeText}>X</Text>
                </Pressable>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    closeButton: {
        position: 'absolute',
        top: 40,
        padding: 10,
        borderRadius: 10,
        borderColor: 'black',
        borderWidth: 3,
        zIndex: 1,
    },
    closeText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default MapModal;