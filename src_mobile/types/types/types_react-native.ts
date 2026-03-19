// types/react-native.d.ts
import 'react-native';

declare module 'react-native' {
  interface ViewStyle {
    transformStyle?: 'flat' | 'preserve-3d';
  }
  
  interface TextStyle {
    transformStyle?: 'flat' | 'preserve-3d';
  }
  
  interface ImageStyle {
    transformStyle?: 'flat' | 'preserve-3d';
  }
}