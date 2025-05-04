// 應用程式入口檔案，設定導航容器

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';  // 導入導航器
import { AuthProvider } from './src/context/AuthContext';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator />  
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;  // 導出應用程式組件