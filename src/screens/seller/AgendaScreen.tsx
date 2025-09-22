import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AgendaScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda</Text>
      <Text>Aquí se mostrarán tus citas y reservas con clientes.</Text>
    </View>
  );
};

export default AgendaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});