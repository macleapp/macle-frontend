import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyCatalogScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Catálogo</Text>
      <Text>Aquí podrás gestionar los productos que vendes.</Text>
    </View>
  );
};

export default MyCatalogScreen;

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