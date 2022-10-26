import {View, Text} from 'react-native';
import React from 'react';
import ModalDropdown from 'react-native-modal-dropdown';
import {ChevronDownIcon} from 'react-native-heroicons/outline';

const Dropdown = ({
  buttonBackgroundColor,
  buttonColor,
  dropdownBorderColor,
  defaultValue,
  defaultIndex,
  options,
  onSelect,
  style,
}) => {
  const buttonBackgroundColor_ = buttonBackgroundColor ?? '#1f567d';
  const buttonColor_ = buttonColor ?? 'white';
  const dropdownBorderColor_ = dropdownBorderColor ?? '#1f567d';

  return (
    <View style={[{alignSelf: 'flex-start'}, style]}>
      <ModalDropdown
        defaultValue={defaultValue}
        defaultIndex={defaultIndex}
        options={options}
        onSelect={onSelect}
        dropdownStyle={{
          height: 'auto',
          marginTop: 4,
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: dropdownBorderColor_,
          borderRadius: 8,
          overflow: 'hidden',
        }}
        textStyle={{
          color: buttonColor_,
          fontSize: 14,
          backgroundColor: buttonBackgroundColor_,
          padding: 10,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
        }}
        renderRow={(option, index, isSelected) => {
          return (
            <View
              style={{
                padding: 10,
                backgroundColor: isSelected ? buttonBackgroundColor_ : 'white',
              }}>
              <Text style={{color: isSelected ? buttonColor_ : 'black'}}>
                {option}
              </Text>
            </View>
          );
        }}
        renderRightComponent={() => {
          return (
            <View
              style={{
                backgroundColor: buttonBackgroundColor_,
                height: '100%',
                paddingRight: 10,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <ChevronDownIcon size={16} color={buttonColor_} />
            </View>
          );
        }}
        renderSeparator={() => <View />}
      />
    </View>
  );
};

export default Dropdown;
