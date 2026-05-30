import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = { total: number; index: number };

export default function PaginationDots({ total, index }: Props) {
  const dots = Array.from({ length: total });
  return (
    <View style={styles.container}>
      {dots.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === index ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    borderRadius: 8,
    marginHorizontal: 4,
  },
  active: {
    width: 24,
    height: 6,
    backgroundColor: '#E53935', // nepalRed
  },
  inactive: {
    width: 8,
    height: 6,
    backgroundColor: '#E5E7EB', // gray-200
  },
});
