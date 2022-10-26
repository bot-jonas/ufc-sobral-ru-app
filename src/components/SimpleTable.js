import React from 'react';
import {Text, View} from 'react-native';

const SimpleTable = ({title, data, style}) => {
  return (
    <View
      style={[
        {
          borderRadius: 8,
          overflow: 'hidden',
        },
        style,
      ]}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: '#1f567d',
          padding: 10,
        }}>
        <Text style={{color: 'white'}}>{title}</Text>
      </View>

      {/* Body */}
      {data.map(([header, value], idx) => (
        <View
          key={idx}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: '#C8D5EC',
            padding: 10,
            alignItems: 'center',
          }}>
          <Cell
            value={header}
            style={{fontSize: 12, color: 'black', textAlign: 'left'}}
          />
          <Cell
            value={value}
            style={{fontSize: 12, color: 'black', textAlign: 'right'}}
          />
        </View>
      ))}
    </View>
  );
};

const Cell = ({value, style}) => {
  const type = typeof value;
  if (type === 'string' || type === 'number') {
    return <Text style={style}>{value}</Text>;
  } else {
    return value;
  }
};

export default SimpleTable;
