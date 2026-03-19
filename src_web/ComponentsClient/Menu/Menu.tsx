import React from 'react';
import { Platform, Dimensions } from 'react-native';
import MenuDesktopClient from './MenuDesktop/MenuDesktop';
import MenuResponsiveClient from './MenuDesktop/MenuResponsivo/MenuResponsive';

const { width } = Dimensions.get('window');

const MenuClient = () => {
  if (Platform.OS === 'web') {
    return <MenuDesktopClient />;
  }
  
  return <MenuResponsiveClient />;
};

export default MenuClient;
