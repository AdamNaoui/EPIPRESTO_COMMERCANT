import React, { useContext, useEffect, useReducer } from "react";
import { TextInput, Text, Button, HelperText, Snackbar, Card } from "react-native-paper";
import { SafeAreaView, StyleSheet, View, Image, Keyboard, KeyboardTypeOptions} from "react-native";
import { LOGIN_BY_EMAIL, LOGIN_BY_USERNAME } from "../../queries";
import { useLazyQuery } from "@apollo/client/react";
import { LoginStyles } from './LoginStyles';
import { initialLoginCredentialsStateReducer, LoginCredentialsReducerState } from "./reducers/LoginCredentialsReducerState";
import { loginCredentialsReducer } from "./reducers/LoginCredentialsReducer";
import { VendorContext } from "../../context/Vendor";
import { Credentials, LoginErrorMessage } from "../../interfaces/LoginInterfaces";
import { LoginCredentialsStateReducerAction } from "./reducers/LoginCredentialsReducerActions";
import { SignUpErrorMessage } from "../../interfaces/SignUpInterfaces";
import { LoginTextField } from "./LoginTextFieldsFields";
import { useTranslation } from "react-i18next";
import { LOGIN_CREATE_ACCOUNT, LOGIN_CREDENTIALS_ERROR, LOGIN_LOGIN_KEY, LOGIN_NEW_TO_APP_KEY } from "../../translations/keys/LoginTranslationKeys";
import { signUpStyles } from "../sign_up/SignUpStyles";
import CredentialInput from "../../components/credentialInput/CredentialInput";



const Login = ({navigation} : any) => {
  const [{credentials, errorMessage}, dispatchCredentialsState]
        = useReducer(loginCredentialsReducer, initialLoginCredentialsStateReducer);
  const {t: translation} = useTranslation('translation');
  
  const [loginByEmail, {loading: emailAuthLoading, error: emailAuthError, data: emailAuthData}] = useLazyQuery(LOGIN_BY_EMAIL);
  
  const [loginByUsername, {loading: usernameAuthLoading, error: usernameAuthError, data: usernameAuthData}] = useLazyQuery(LOGIN_BY_USERNAME);

  const {storeId, setStoreId} = useContext(VendorContext);
  useEffect(() => {
    if (storeId.length > 0) {
        // navigate('/synchronization')
    }
}, [storeId]);

useEffect(() => {
  console.log('LOL')
    if (emailAuthLoading || emailAuthError || !emailAuthData|| !emailAuthData.loginVendorByEmail !== null) return
    const serverResponse = emailAuthData.loginVendorByEmail
    const loggedWithSuccess = serverResponse.code === 200
    if (loggedWithSuccess) {
        setStoreId(serverResponse.vendorAccount.store._id)
    } else {
        dispatchCredentialsState({type:'CHANGE_SNACKBAR_VISIBILITY', showSnackBar: true})
    }
}, [emailAuthLoading, emailAuthError, emailAuthData, setStoreId])

useEffect(() => {
    if (usernameAuthLoading || usernameAuthError || !usernameAuthData || !usernameAuthData.loginVendorByUsername) return
    const serverResponse = usernameAuthData.loginVendorByUsername
    const loggedWithSuccess = serverResponse.code === 200
    if (loggedWithSuccess) {
        setStoreId(serverResponse.vendorAccount.store._id)
    } else {
        dispatchCredentialsState({type:'CHANGE_SNACKBAR_VISIBILITY', showSnackBar: true})
    }
}, [usernameAuthLoading, usernameAuthError, usernameAuthData, setStoreId])

function areAllCredentialsFieldsValid(credsState: LoginCredentialsReducerState): boolean {
    return credsState.credentials.auth.length > 0 && credsState.credentials.password.length > 0
}

const handleLogin = () => {
    dispatchCredentialsState({type: 'CHECK_LOGIN_CREDENTIALS'})
    const areCredentialsValid = areAllCredentialsFieldsValid({credentials, errorMessage})

    if (areCredentialsValid) {
        const isAuthEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(credentials.auth)
        isAuthEmail
          ? loginByEmail({variables: {email: credentials.auth, password: credentials.password}})
          : loginByUsername({variables: {username: credentials.auth, password: credentials.password}})
    }
}

  return (
    <View style={LoginStyles.root}>
      <View style={LoginStyles.imageView}>
        <Image style={LoginStyles.image} source={require('../../assets/logo.png')}/>
      </View>
      <Card style={LoginStyles.card}>
        <View style={LoginStyles.fieldsView}>
        <Text style={LoginStyles.loginTitle}>{translation(LOGIN_LOGIN_KEY)}</Text>
        {LoginTextField.map((field, index) => (
          <CredentialInput 
          key={field.attribute}
          field={field} 
          credential={credentials[field.attribute as keyof Credentials] as string} 
          errorMessage={errorMessage[field.attribute + 'Error' as keyof LoginErrorMessage].length > 0 ? errorMessage[field.attribute + 'Error' as keyof LoginErrorMessage] : '' as string} 
          dispatch={dispatchCredentialsState}           
          ></CredentialInput>
          // <View key={field.attribute} style={LoginStyles.fieldView}>
          //   <Text>{translation(field.title)}</Text>
          //   <TextInput
          //     style={LoginStyles.textInput}
          //     label={translation(field.label)}
          //     value={credentials[field.attribute as keyof Credentials] as string}
          //     onChangeText={text => dispatchCredentialsState(field.onChange(text) as LoginCredentialsStateReducerAction)}
          //     keyboardType={field.keyboardType as KeyboardTypeOptions}
          //     secureTextEntry={field.secure} 
          //     mode="outlined"
          //     />
          //   <HelperText type="error" style={{
          //         height: errorExists(field.attribute) ? 'auto' : 0,
          //       }}>
          //     {translation(errorMessage[(field.attribute + "Error") as keyof LoginErrorMessage]).length > 0 ? translation(errorMessage[(field.attribute + "Error") as keyof LoginErrorMessage]) : ''}
          //   </HelperText>
          // </View>
        ))}
        </View>
        <View style={LoginStyles.buttonView}>
        <Button style={LoginStyles.button} mode="contained" onPress={handleLogin}>{translation(LOGIN_LOGIN_KEY)}</Button>
        </View>
        <View style={LoginStyles.signUpView}>
          <Text>{translation(LOGIN_NEW_TO_APP_KEY)}</Text>
          <Text onPress={()=>{
            navigation.navigate('SignUp')
          }} style={LoginStyles.signUp}>{" " + translation(LOGIN_CREATE_ACCOUNT)}</Text>
        </View>
        <Snackbar
          visible={credentials.showSnackBar}
          onDismiss={() => {}}
          action={{
            label: 'Dismiss',
            onPress: () => {
              dispatchCredentialsState({type:'CHANGE_SNACKBAR_VISIBILITY', showSnackBar: false})
            },
          }}>
          {translation(LOGIN_CREDENTIALS_ERROR)}
        </Snackbar>
      </Card>
    </View>
  );
};


export default Login;