import {StyleSheet} from 'react-native';

/*
 * Name: Active Hours Styles
 * Description: This file contains the styles for the active hours component.
 * Author: Ryma Messedaa, Alessandro van Reusel
 */

export const ActiveHoursStyles = StyleSheet.create({
  flexDirectionRow: {
    flexDirection: 'row',
  },
  ActiveHoursView: {
    height: 'auto',
    margin: 10,
  },
  textInputView: {
    width: 100,
  },
  textInputLabel: {
    fontSize: 12,
    top: -15,
  },
  iconSize: {
    height: 30,
    width: 30,
  },
  minusIcon: {
    position: 'absolute',
    right: -15,
    top: -15,
    backgroundColor: 'red',
  },
  plusIcon: {
    backgroundColor: 'green',
  },
  textInputLabelView: {
    width: '100%',
  },
  subTitlesMargin: {
    marginLeft: 10,
  },
  closedText: {
    paddingLeft: '2%',
  },
});
