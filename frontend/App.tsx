// React Native 應用程式入口檔案，設定導航結構

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';      // 導入登入頁面
import RegisterScreen from './src/screens/RegisterScreen'; // 導入註冊頁面
import ProfileScreen from './src/screens/ProfileScreen';   // 導入個人檔案頁面

const Stack = createStackNavigator();  // 創建堆疊導航器

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />        
        <Stack.Screen name="Register" component={RegisterScreen} />  
        <Stack.Screen name="Profile" component={ProfileScreen} />   
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;  // 導出應用程式組件