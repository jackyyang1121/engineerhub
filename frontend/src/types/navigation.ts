import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainApp: NavigatorScreenParams<TabParamList>;
  Profile: { userId?: number };
  PostDetail: { postId: number };
  Portfolio: undefined;
  SavedPosts: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Notifications: undefined;
  Messages: undefined;
  Profile: undefined;
}; 