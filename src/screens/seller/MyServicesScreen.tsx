import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyServicesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Servicios</Text>
      <Text>Aquí podrás administrar los servicios que ofreces.</Text>
    </View>
  );
};

export default MyServicesScreen;

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