import React from 'react';
import { Platform, Dimensions } from 'react-native';
import MenuDesktop from './MenuDesktop/MenuDesktop';
import MenuResponsive from './MenuDesktop/MenuResponsivo/MenuResponsive';

const { width } = Dimensions.get('window');

const Menu = () => {
  if (Platform.OS === 'web') {
    return <MenuDesktop />;
  }
  
  return <MenuResponsive />;
};

export default Menu;
