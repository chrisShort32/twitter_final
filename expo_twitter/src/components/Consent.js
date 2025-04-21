import React from 'react';
import {Modal, View, Text, Button, StyleSheet} from 'react-native';

const CookieConsentModal = ({ visible, onAccept, onDecline }) => {
    return (
        <Modal visible={visible} transparent={true} animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Cookie Consent</Text>
                    <Text style={styles.body}>
                        We use anonymous tracking to improve your experience. Is that cool with you?
                    </Text>
                    <View style={styles.buttons}>
                        <Button title="Yes, I accept" onPress={onAccept} />
                        <Button title="No, thanks" onPress={onDecline} />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'grey',

    },
    modal: {
        width: '80%', 
        backgroundColor: '#fff', 
        borderRadius: 10, 
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    body: {
        fontSize: 16,
        marginBottom: 20,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default CookieConsentModal;