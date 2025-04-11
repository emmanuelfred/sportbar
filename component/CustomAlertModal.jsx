// components/CustomAlertModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomAlertModal = ({ visible, onClose, title, message, buttons = [] }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            {buttons.map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  onClose();
                  if (btn.onPress) btn.onPress();
                }}
                style={[
                  styles.button,
                  btn.style === 'cancel' && styles.cancelButton
                ]}
              >
                <Text style={styles.buttonText}>{btn.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlertModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  message: {
    fontSize: 16,
    marginBottom: 20
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#1e90ff',
    borderRadius: 6,
    marginLeft: 10,
    marginTop: 5
  },
  cancelButton: {
    backgroundColor: '#aaa'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});
