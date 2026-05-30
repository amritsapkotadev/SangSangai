import React from 'react';
import { View } from 'react-native';

type Props = { total: number; index: number };

export default function PaginationDots({ total, index }: Props) {
  const dots = Array.from({ length: total });
  return (
    <View style={{ flexDirection: 'row', gap: 8 }} className="mt-4 items-center justify-center">
      {dots.map((_, i) => (
        <View
          key={i}
          className={i === index ? 'w-8 h-2 bg-nepalRed rounded-full' : 'w-3 h-2 bg-gray-300 rounded-full'}
        />
      ))}
    </View>
  );
}
