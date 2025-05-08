// 登入頁面檔案，處理用戶登入、表單驗證、錯誤顯示與跳轉

import React, { useState, useRef } from 'react';
import { 
  View,   //類似 HTML 的 <div></div>，用於包裹其他組件。
  TextInput,  //文字輸入框組件，允許用戶輸入文字。
  Text,  //類似HTML的<span>、<p>，用於顯示文字段落
  TouchableOpacity,  //類似 HTML 的 <button>，可點擊的按鈕組件，點擊時會有透明度變化效果（變暗）。
  StyleSheet,  //類似 HTML 的 CSS，用於定義組件的樣式。
  SafeAreaView,  //類似 HTML 的 <div class="safe-area">，確保內容在設備的安全區域內顯示，避免被螢幕邊緣（如 iPhone 的劉海）遮擋。
  KeyboardAvoidingView,  //類似 HTML 的 <div class="keyboard-avoiding-view">，當鍵盤彈出時，自動調整視圖位置，避免被鍵盤遮擋。  
  Platform,  //類似 HTML 的 <div class="platform">，提供平台特定的功能和樣式，允許根據運行環境（iOS 或 Android）執行不同程式碼。    
  StatusBar,  //類似 HTML 的 <div class="status-bar">，控制設備狀態列的外觀（例如背景色、可見性）。
  ActivityIndicator,  //類似 HTML 的 <div class="activity-indicator">，顯示加載中的旋轉圖標，實現 UI 動畫，例如淡入淡出、滑動、縮放。。 
  Animated  //類似 HTML 的 <div class="animated">，提供動畫效果。 
} from 'react-native';
import axios from 'axios'; //類似 HTML 的 <script>，用於發送 HTTP 請求。在 React Native 中用於與後端 API 通信，例如發送 POST 請求進行登錄或獲取資料。
import { StackNavigationProp } from '@react-navigation/stack'; //類似 HTML 的 <script>，用於定義導航堆疊的類型，用於在頁面間導航。
import { useAuth } from '../context/AuthContext'; //類似 HTML 的 <script>，用於管理用戶認證狀態。
import { COLORS, FONTS, RADIUS, SHADOW, SPACING, ANIMATION } from '../theme'; //類似 HTML 的 <script>，用於定義應用程式的顏色、字體、圓角、陰影、間距和動畫。
import { RootStackParamList } from '../types/navigation'; //類似 HTML 的 <script>，用於定義導航堆疊的參數列表。

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>; //StackNavigationProp 是 React Navigation 提供的一個類型，專門用於堆疊導航（stack navigation）。
//type是用來定義型別別名，類似typehint，跟interface一樣，用於定義「物件的形狀」。但type更靈活：支援聯合型別、交叉型別、條件型別等。可定義非物件型別（string、函數）。
//interface更專注:專為物件、函數、類別結構設計。支援合併（Declaration Merging）和implements。


interface LoginScreenProps {  //interface是用來描述物件、類別或函數的結構，用於定義「物件的形狀」。類似typehint
  navigation: LoginScreenNavigationProp;  //定義 LoginScreen 組件會接收的屬性（props），這裡特別指定它會拿到一個 navigation 物件，這個物件是 React Navigation 提供的，用於在頁面間導航。
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {    //這是定義 LoginScreen 這個 React 組件，說它是一個函數組件，並且會接收 navigation 屬性。
  //const是JavaScript（以及TypeScript）中的一種變數宣告方式，用來定義一個不可重新賦值的變數。用const：定義組件、Props、State、Hooks、常數，因為它們通常不需重新賦值。
  const { setToken } = useAuth();  //useAuth 是一個自訂的 Hook，用於管理用戶認證狀態。Hook名稱以use開頭（例如useState、useEffect），這是React的慣例，方便辨識並啟用Hook的規則檢查（Linting）。
  //setToken 可以把登入成功後的 token 存起來，讓應用程式知道用戶已經登入。
  const [identifier, setIdentifier] = useState('');   //用 useState 創建一個狀態變數 identifier，用來儲存用戶輸入的識別符（可能是用戶名或電子郵件）。
  const [password, setPassword] = useState('');   //跟 identifier 類似，用來儲存用戶輸入的密碼。
  const [error, setError] = useState('');  //用來儲存錯誤訊息，例如用戶名或密碼錯誤。
  const [isLoading, setIsLoading] = useState(false);  //用來追蹤登入過程是否正在進行，例如發送請求時顯示載入中。
  
  // 動畫參數
  const fadeAnim = useRef(new Animated.Value(0)).current;  //創建一個動畫值 fadeAnim，用來控制頁面的透明度（淡入淡出效果），初始值是 0（完全透明）。
  const translateY = useRef(new Animated.Value(25)).current;  //創建一個動畫值 translateY，用來控制頁面的垂直位置（向下移動），初始值是 25（像素）。
  
  // 進入動畫
  React.useEffect(() => {   //React.useEffect(() => { ... }, []);用來啟動頁面的進入動畫，空陣列 [] 表示這個效果只在組件掛載時跑一次。
    Animated.parallel([  //讓兩個動畫（透明度和位置）同時執行。
      Animated.timing(fadeAnim, {
        toValue: 1,  //透明度從 0 變成 1（完全不透明）。
        duration: ANIMATION.normal,  //動畫持續時間，ANIMATION.normal 是 300 毫秒。
        useNativeDriver: true,  //使用原生驅動程式，提高動畫效能。
      }),
      Animated.timing(translateY, {
        toValue: 0,  //位置從 25 變成 0（完全不移動）。 
        duration: ANIMATION.normal,  //動畫持續時間，ANIMATION.normal 是 300 毫秒 。
        useNativeDriver: true,  //使用原生驅動程式，提高動畫效能。
      })
    ]).start();
  }, []);
  /*空陣列 []：無依賴，副作用只在掛載時運行一次。
    有值 [a, b]：當a或b改變時，副作用重新運行。
    無陣列（省略）：副作用在每次渲染後都運行。*/

  // 處理登入請求
  const handleLogin = async () => {  //定義一個異步函數來處理登入邏輯，會在用戶點擊登入按鈕時觸發。async非同步函數:一種允許程式在執行某個操作時不需要等待該操作完成即可繼續執行後續程式碼的函數。
    // 驗證
    if (!identifier.trim()) {  //如果 identifier 是空字串，則設置錯誤訊息，並且不繼續執行。
      /*.trim() 是 JavaScript 字串物件的一個內建方法。
      它的功能是移除字串首尾的空白字符（包括空格、制表符、換行符等），但不會影響字串中間的內容。*/
      setError('請輸入用戶名或電子郵件');
      return;
    }
    if (!password) {  //如果 password 是空字串，則設置錯誤訊息，並且不繼續執行。
      setError('請輸入密碼');
      return;
    }
    
    setIsLoading(true);  //設置 isLoading 為 true，表示正在進行登入。
    try {
      // 嘗試API登入
      try {
        const response = await axios.post('http://10.0.2.2:8000/api/users/login/', {  
          identifier,
          password,
        });
        setToken(response.data.token);  //setToken 是自訂的 Hook，用於管理用戶認證狀態，response.data.token 是從 API 回應中獲取的 token。
      } catch (apiError) {    //測試時的模擬登入，正式發布要拿掉  
        //catch 是 try...catch 語句的一部分，用於處理在 try 塊中拋出的錯誤，apiError 是一個自定義的變數名稱，代表捕獲到的錯誤物件。你可以將其命名為任何合法的變數名稱（例如 error、err 或 apiError）。
        console.log('API登入失敗，使用模擬登入');
        // API請求失敗，使用模擬登入
        // 模擬登入成功，設置模擬token
        setToken('mock-token-' + Date.now());
      }
      
      // 成功登入動畫
      Animated.timing(fadeAnim, {     //Animated.timing(fadeAnim, { ... }) 是 React Native 的 Animated API 中的一個方法，用於創建一個透明度動畫。
        toValue: 0,  //透明度從 1 變成 0（完全透明）。  
        duration: ANIMATION.fast,  //動畫持續時間，ANIMATION.fast 是 150 毫秒。
        useNativeDriver: true,  //使用原生驅動程式，提高動畫效能。
      }).start(() => {  //動畫完成後，執行 navigation.replace('MainApp', { screen: 'Home', params: { refresh: true } });
        navigation.replace('MainApp', {     //navigation.replace('MainApp', { ... }) 是 React Navigation 提供的一個方法，用於在頁面間導航。 MainApp是自定義的路由/導航器名稱，由開發者在導航配置中定義。
          screen: 'Home',  //screen 是頁面名稱，Home 是頁面名稱。
          params: { refresh: true }  //params 是頁面參數，帶上refresh=true頁面參數。
        });
      });
    } catch (err: any) {
      console.error('登入失敗:', err);
      setError('登入失敗，請檢查網絡連接');
    } finally {
      setIsLoading(false);  //設置 isLoading 為 false，表示登入完成。
    }
  };

  // 畫面渲染
  return (
    <SafeAreaView style={styles.safeArea}>    {/*SafeAreaView 是 React Native 提供的一個組件，用於確保內容在設備的安全區域內顯示，避免被螢幕邊緣（如 iPhone 的劉海）遮擋。*/}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />  {/*StatusBar 是 React Native 提供的一個組件，用於控制設備狀態列的外觀（例如背景色、可見性），狀態列是行動設備（例如手機或平板）螢幕頂部的一個窄條區域，通常顯示系統級資訊，例如：時間、電池電量、網路連接等。*/}
      
      <KeyboardAvoidingView //KeyboardAvoidingView 是 React Native 提供的一個組件，用於控制鍵盤彈出時的行為，當鍵盤彈出時，自動調整視圖位置，避免被鍵盤遮擋。
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  //behavior 是 React Native 提供的一個屬性，用於控制鍵盤彈出時的行為。如果 Platform.OS === 'ios'（設備是 iOS），則設置 behavior='padding'，否則（設備是 Android 或其他），設置 behavior='height'。
        style={styles.container}     
      >
        <Animated.View    //Animated.View 是 React Native 提供的一個組件，用於控制組件的動畫效果。
          style={[    
            styles.content,    //styles.content 是 React Native 提供的一個樣式，用於控制組件的樣式。
            {
              opacity: fadeAnim,  //opacity 是 React Native 提供的一個屬性，用於控制組件的透明度，fadeAnim 是 React Native 提供的一個動畫值，用於控制組件的透明度。
              transform: [{ translateY: translateY }]  //transform 是 React Native 提供的一個屬性，用於控制組件的變形，translateY 是 React Native 提供的一個動畫值，用於控制組件的垂直位置。
            }
          ]}
        >
          <View style={styles.header}>    {/*View 是 React Native 提供的一個組件，用於包裹其他組件，header是自定義的樣式，用於控制組件的樣式。*/}
            <Text style={styles.title}>登入</Text>    {/*Text 是 React Native 提供的一個組件，用於顯示文字，title是自定義的樣式，用於控制組件的樣式。*/}
            <Text style={styles.subtitle}>歡迎回來</Text>    {/*subtitle是自定義的樣式，用於控制組件的樣式。*/}
          </View>
          
          <View style={styles.inputContainer}>    {/*View 是 React Native 提供的一個組件，用於包裹其他組件，inputContainer是自定義的樣式，用於控制組件的樣式。*/}
            <Text style={styles.label}>用戶名或電子郵件</Text>    {/*label是自定義的樣式，用於控制組件的樣式。*/} 
            <TextInput
              value={identifier}  //value 是 React Native 提供的一個屬性，用於控制組件的值，identifier 是 React Native 提供的一個狀態變數，用於儲存用戶輸入的識別符（可能是用戶名或電子郵件）。
              onChangeText={(text) => {    //onChangeText 是 React Native 提供的一個事件，用於控制組件的值，text 是 React Native 提供的一個變數，用於儲存用戶輸入的文字。
                setIdentifier(text);   //setIdentifier 是自訂的 Hook，用於管理用戶輸入的識別符（可能是用戶名或電子郵件）。
                setError('');   //setError 是自訂的 Hook，用於管理錯誤訊息。
              }}
              placeholder="請輸入您的用戶名或電子郵件"
              placeholderTextColor={COLORS.placeholder}  //placeholderTextColor 是 React Native 提供的一個屬性，用於控制組件的顏色，不是自定義變數，COLORS.placeholder 是 React Native 提供的一個顏色，用於控制組件的顏色。
              style={styles.input}  //style 是 React Native 提供的一個屬性，用於控制組件的樣式，input 是自定義的樣式，用於控制組件的樣式。
              autoCapitalize="none"   //autoCapitalize 是 React Native 提供的一個屬性，用於控制組件的值，autoCapitalize="none" 表示不自動將文字轉換為大寫。
            />
          </View>
          
          <View style={styles.inputContainer}>    {/*View 是 React Native 提供的一個組件，用於包裹其他組件，inputContainer是自定義的樣式，用於控制組件的樣式。*/}
            <Text style={styles.label}>密碼</Text>    {/*label是自定義的樣式，用於控制組件的樣式。*/}
            <TextInput
              value={password}  //value 是 React Native 提供的一個屬性，用於控制組件的值，password 是 React Native 提供的一個狀態變數，用於儲存用戶輸入的密碼。
              onChangeText={(text) => {    //onChangeText 是 React Native 的 <TextInput> 組件的一個內建屬性（prop），用於監聽輸入框的文字變化，每當用戶輸入、刪除或修改輸入框中的文字時，onChangeText 會被觸發，並將當前輸入框的文字作為參數傳遞給處理函數。
                setPassword(text);   //setPassword(text)：更新密碼狀態。
                setError('');   //setError('')：清除錯誤訊息。
              }}
              placeholder="請輸入您的密碼"      //placeholder 是 React Native 提供的一個屬性，用於控制組件的值，placeholder="請輸入您的密碼" 表示當用戶未輸入文字時，會顯示這段文字。
              placeholderTextColor={COLORS.placeholder}  //placeholderTextColor 是 React Native 提供的一個屬性，用於控制組件的顏色，不是自定義變數，COLORS.placeholder 是 React Native 提供的一個顏色，用於控制組件的顏色。
              style={styles.input}  //style 是 React Native 提供的一個屬性，用於控制組件的樣式，input 是自定義的樣式，用於控制組件的樣式。
              secureTextEntry={true}   //secureTextEntry 是 React Native 提供的一個屬性，用於控制組件的值，secureTextEntry=true 表示密碼輸入框會以密碼形式顯示。
            />
          </View>
          
          {error ? (    //如果 error 不是空字串，則顯示錯誤訊息。
            <View style={styles.errorContainer}>    {/*View 是 React Native 提供的一個組件，用於包裹其他組件，errorContainer是自定義的樣式，用於控制組件的樣式。*/}
              <Text style={styles.errorText}>{error}</Text>    {/*errorText 是自定義的樣式，用於顯示錯誤訊息。*/}
            </View>
          ) : null}    {/*如果 error 是空字串，則不顯示錯誤訊息。*/}
          
          <TouchableOpacity    //TouchableOpacity 是 React Native 提供的一個組件，用於控制組件的點擊事件。
            style={styles.button}  //style 是 React Native 提供的一個屬性，用於控制組件的樣式，button 是自定義的樣式，用於控制組件的樣式。
            onPress={handleLogin}  //onPress 是 React Native 提供的一個事件，用於控制組件的點擊事件，handleLogin 是自訂的函數，用於處理登入事件。
            activeOpacity={0.85}  //activeOpacity 是 React Native 提供的一個屬性，用於控制組件的透明度，activeOpacity=0.85 表示當組件被點擊時，透明度會變成 0.85。
            disabled={isLoading}  //disabled 是 React Native 提供的一個屬性，用於控制組件的狀態，disabled=true 表示組件被禁用，不能被點擊。
          >
            {isLoading ? (    //如果 isLoading 是 true，則顯示載入中的圖示。
              <ActivityIndicator size="small" color={COLORS.primary} />    //ActivityIndicator 是 React Native 提供的一個組件，用於顯示載入中的圖示。
            ) : (
              <Text style={styles.buttonText}>登入</Text>    //Text 是 React Native 提供的一個組件，用於顯示文字，buttonText 是自定義的樣式，用於控制組件的樣式。
            )}
          </TouchableOpacity>
          
          <View style={styles.footer}>    {/*View 是 React Native 提供的一個組件，用於包裹其他組件，footer是自定義的樣式，用於控制組件的樣式。*/} 
            <Text style={styles.footerText}>沒有帳號？</Text>    {/*footerText 是自定義的樣式，用於控制組件的樣式。*/}
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>    {/*TouchableOpacity 是 React Native 提供的一個組件，用於控制組件的點擊事件。*/}
              <Text style={styles.linkText}>立即註冊</Text>    {/*linkText 是自定義的樣式，用於控制組件的樣式。*/}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// 現代簡約高級樣式
const styles = StyleSheet.create({
  safeArea: {  //safeArea 是自定義的樣式，用於避免螢幕邊緣（如 iPhone 的劉海）遮擋。
    flex: 1,   //flex: 1 表示組件佔滿整個螢幕。
    backgroundColor: COLORS.background,  //backgroundColor 是 React Native 提供的一個屬性，用於控制組件的背景顏色，COLORS.background 是 React Native 提供的一個顏色，用於控制組件的背景顏色。
  },
  container: {   //container 是自定義的樣式，用於控制組件的樣式。
    flex: 1,   //flex: 1 表示組件佔滿整個螢幕。
    justifyContent: 'center',  //justifyContent: 'center' 表示組件在螢幕中水平居中。justifyContent 可以控制所有子元素位置
  },
  content: {   //content 是自定義的樣式，用於控制組件的樣式。
    width: '85%',  //width: '85%' 表示組件的寬度佔滿螢幕的 85%。
    maxWidth: 400,  //maxWidth: 400 表示組件的寬度最大為 400。
    alignSelf: 'center',  //alignSelf: 'center' 表示組件在螢幕中水平居中。alignSelf 可以控制單一元素位置
    paddingHorizontal: SPACING.lg,  //paddingHorizontal: SPACING.lg  是 React Native 提供的一個間距，用於控制元素內部左右的間距。
  },
  header: {
    marginBottom: SPACING.xl,  //marginBottom: SPACING.xl 是 React Native 提供的一個間距，用於控制元素下方的間距。
  },
  title: {
    fontFamily: FONTS.bold,  //fontFamily: FONTS.bold 是 React Native 提供的一個字體，用於控制元素的字體。
    fontSize: FONTS.size.title,  //fontSize: FONTS.size.title 是 React Native 提供的一個字體大小，用於控制元素的字體大小。
    color: COLORS.text,  //color: COLORS.text 是 React Native 提供的一個顏色，用於控制元素的顏色。
    marginBottom: SPACING.xs,  //marginBottom: SPACING.xs 是 React Native 提供的一個間距，用於控制元素下方的間距。
    letterSpacing: FONTS.letterSpacing.tight,  //letterSpacing: FONTS.letterSpacing.tight 是 React Native 提供的一個字體間距，用於控制元素的間距。
  },
  subtitle: {
    fontFamily: FONTS.regular,  //fontFamily: FONTS.regular 是 React Native 提供的一個字體，用於控制元素的字體。
    fontSize: FONTS.size.md,  //fontSize: FONTS.size.md 是 React Native 提供的一個字體大小，用於控制元素的字體大小。
    color: COLORS.subText,  //color: COLORS.subText 是 React Native 提供的一個顏色，用於控制元素的顏色。
  },
  inputContainer: {
    marginBottom: SPACING.lg,  //marginBottom: SPACING.lg 是 React Native 提供的一個間距，用於控制元素下方的間距。
  },
  label: {
    fontFamily: FONTS.medium,  //fontFamily: FONTS.medium 是 React Native 提供的一個字體，用於控制元素的字體。
    fontSize: FONTS.size.sm,  //fontSize: FONTS.size.sm 是 React Native 提供的一個字體大小，用於控制元素的字體大小。
    color: COLORS.text,  //color: COLORS.text 是 React Native 提供的一個顏色，用於控制元素的顏色。
    marginBottom: SPACING.xs,  //marginBottom: SPACING.xs 是 React Native 提供的一個間距，用於控制元素下方的間距。
  },
  input: {
    backgroundColor: COLORS.card,  //backgroundColor: COLORS.card 是 React Native 提供的一個顏色，用於控制元素的背景顏色。
    borderRadius: RADIUS.sm,  //borderRadius: RADIUS.sm 是 React Native 提供的一個圓角，用於控制元素的圓角。
    borderWidth: 1,  //borderWidth: 1 是 React Native 提供的一個邊框寬度，用於控制元素的邊框寬度。
    borderColor: COLORS.border,  //borderColor: COLORS.border 是 React Native 提供的一個顏色，用於控制元素的邊框顏色。
    fontFamily: FONTS.regular,  //fontFamily: FONTS.regular 是 React Native 提供的一個字體，用於控制元素的字體。
    fontSize: FONTS.size.md,  //fontSize: FONTS.size.md 是 React Native 提供的一個字體大小，用於控制元素的字體大小。
    color: COLORS.text,  //color: COLORS.text 是 React Native 提供的一個顏色，用於控制元素的顏色。
    paddingHorizontal: SPACING.lg,  //paddingHorizontal: SPACING.lg 是 React Native 提供的一個間距，用於控制元素內部左右的間距。
    paddingVertical: SPACING.md,  //paddingVertical: SPACING.md 是 React Native 提供的一個間距，用於控制元素內部上下的間距。
    minHeight: 56,  //minHeight: 56 是 React Native 提供的一個最小高度，用於控制元素的最小高度。
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,  //backgroundColor: `${COLORS.error}15` 是 React Native 提供的一個顏色，用於控制元素的背景顏色。
    borderRadius: RADIUS.sm,  //borderRadius: RADIUS.sm 是 React Native 提供的一個圓角，用於控制元素的圓角。
    padding: SPACING.md,  //Padding（內邊距）(上下左右) SPACING.md 是 React Native 提供的一個間距，用於控制元素內部的間距。
    marginBottom: SPACING.lg,  //marginBottom:Margin（外邊距）： SPACING.lg 是 React Native 提供的一個間距，用於控制元素下方的間距。
    borderLeftWidth: 3,  //borderLeftWidth: 3 是 React Native 提供的一個邊框寬度，用於控制元素的邊框寬度。
    borderLeftColor: COLORS.error,  //borderLeftColor: COLORS.error 是 React Native 提供的一個顏色，用於控制元素的邊框顏色。
  },
  errorText: {
    fontFamily: FONTS.medium,  //fontFamily: FONTS.medium 是 React Native 提供的一個字體，用於控制元素的字體。
    fontSize: FONTS.size.sm,  //fontSize: FONTS.size.sm 是 React Native 提供的一個字體大小，用於控制元素的字體大小。
    color: COLORS.error,  //color: COLORS.error 是 React Native 提供的一個顏色，用於控制元素的顏色。
  },
  button: {
    backgroundColor: COLORS.accent, //backgroundColor: `${COLORS.error}15` 是 React Native 提供的一個顏色，用於控制元素的背景顏色。
    borderRadius: RADIUS.sm,    //borderRadius: RADIUS.sm 是 React Native 提供的一個圓角，用於控制元素的圓角。
    paddingVertical: SPACING.md,  //paddingVertical: SPACING.md 是 React Native 提供的一個間距，用於控制元素內部上下的間距。
    alignItems: 'center',     //alignSelf: 'center' 表示組件在螢幕中水平居中。alignSelf 可以控制單一元素位置
    justifyContent: 'center',   //justifyContent: 'center' 表示組件在螢幕中水平居中。justifyContent 可以控制所有子元素位置
    minHeight: 56,     //minHeight 是一個樣式屬性，用來設置組件（例如 <View> 或 <TextInput>）的 最小高度。
    ...SHADOW.md,  
//     ...SHADOW.md 使用了 展開運算符（spread operator，...），將一個名為 SHADOW.md 的物件的屬性展開，應用到樣式中。
// SHADOW.md 通常是一個 自定義樣式物件，定義了陰影效果（shadow）的屬性，可能包含：
// shadowColor：陰影顏色（例如 '#000'）。
// shadowOffset：陰影的偏移（例如 { width: 0, height: 2 }）。
// shadowOpacity：陰影透明度（例如 0.3）。
// shadowRadius：陰影模糊半徑（例如 3.84）。
// elevation：Android 的陰影高度（例如 4）。
// md 通常表示「中等」（medium）陰影，可能是你定義的一組陰影樣式（例如 SHADOW = { sm: {...}, md: {...}, lg: {...} }）。
  },
  buttonText: {     //
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.md,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  footer: {
    flexDirection: 'row',        //
    justifyContent: 'center',   //控制多元素
    alignItems: 'center',      //控制單一元素
    marginTop: SPACING.xl,     //margin等於外邊距
  },
  footerText: {        //flexDirection 是一個 Flexbox 佈局屬性，用在 Flex 容器（通常是 <View>）上，決定裡面的子元素（像 <Text>、<TextInput>、按鈕等）沿著 哪個方向排列。設置為 'row' 時，子元素會 水平排列（從左到右），就像一行文字。
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.subText,
    marginRight: SPACING.xs,
  },
  linkText: {
    fontFamily: FONTS.medium,    //字體
    fontSize: FONTS.size.sm,     //大小
    color: COLORS.accent,
  },
});

export default LoginScreen;