import React, {Fragment, useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button, Snackbar, Text} from 'react-native-paper';
import {signUpStyles} from './SignUpStyles';
import {SignUpTextFields} from './SignUpTextFields';
import {initialSignUpCredentialsState} from './reducers/SignUpCredentialsReducerState';
import {signUpCredentialsReducer} from './reducers/SignUpCredentialsReducer';
import {
  AccountInput,
  SignUpErrorMessage,
} from '../../interfaces/SignUpInterfaces';
import {useTranslation} from 'react-i18next';
import {
  SIGN_UP_CREATE_ACCOUNT_KEY,
  SIGN_UP_ERROR_ACCOUNT_CREATION_KEY,
  SIGN_UP_TITLE_KEY,
} from '../../translations/keys/SignUpTranslationKeys';
import CredentialInput from '../../components/credential-input/CredentialInput';
import {useLazyQuery, useMutation} from '@apollo/client/react';
import {
  IS_VENDOR_EMAIL_USED,
  IS_VENDOR_USERNAME_USED,
} from '../../graphql/queries';
import {SIGN_UP} from '../../graphql/mutations';
import {useTimeout} from '../../hooks/CredentialsHooks';
import {EMPTY_KEY} from '../../translations/keys/EmptyTranslationKey';

/*
 * Name: SignUp
 * Description: Sign up a new vendor.
 * Author: Zouhair Derouich, Adam Naoui-Busson, Khalil Zriba
 */

const SignUp = ({navigation}: any) => {
  const {t: translation} = useTranslation('translation');
  const [
    {verifyPassword, accountInput, signUpErrorMessage},
    dispatchCredentialsState,
  ] = React.useReducer(signUpCredentialsReducer, initialSignUpCredentialsState);

  // Alert the user if the account creation failed
  const alert = (message: string) => {
    Alert.alert('Alert', message, [
      {text: 'OK', onPress: () => {}},
    ]);
  };

  // Handle if the email is already used
  const handleEmailUsed = (emailUsedData: any) => {
    if (!emailUsedData) {
      return;
    }
    emailUsedData.isVendorEmailUsed
      ? dispatchCredentialsState({type: 'SET_EMAIL_AS_ALREADY_USED'})
      : dispatchCredentialsState({type: 'SET_EMAIL_AS_UNUSED'});
  };
  // Handle if the username is already used
  const handleUsernameUsed = (usernameUsedData: any) => {
    if (!usernameUsedData) {
      return;
    }
    usernameUsedData.isVendorUsernameUsed
      ? dispatchCredentialsState({type: 'SET_USERNAME_AS_ALREADY_USED'})
      : dispatchCredentialsState({type: 'SET_USERNAME_AS_UNUSED'});
  };
  // Handle the sign up mutation
  const signUpResponse = (signUpData: any) => {
    if (!signUpData) {
      return;
    }
    if (signUpData.vendorSignUp.code !== 200) {
      alert('OOPS SOMETHING WENT WRONG');
      return;
    }
    setTimeout(() => {
      navigation.navigate('Login');
    }, 1000);
  };
  // Query to check if the email is already used
  const [isEmailUsed, {loading: emailUsedLoading}] = useLazyQuery(
    IS_VENDOR_EMAIL_USED,
    {onCompleted: handleEmailUsed},
  );
  // Query to check if the username is already used
  const [isUsernameUsed, {loading: usernameUsedLoading}] = useLazyQuery(
    IS_VENDOR_USERNAME_USED,
    {onCompleted: handleUsernameUsed},
  );
  // Mutation to sign up a new vendor
  const [signUp] = useMutation(SIGN_UP, {onCompleted: signUpResponse});

  const [errorOpen, setErrorOpen] = useState(false);
  // useTimeout to show the message that the email is already used after 500 ms
  useTimeout({
    callback: isEmailUsed,
    time: 500,
    callbackVars: {variables: {email: accountInput.email}},
    dependencies: [accountInput.email],
  });
  // useTimeout to show the message that the username is already used after 500 ms
  useTimeout({
    callback: isUsernameUsed,
    time: 500,
    callbackVars: {variables: {username: accountInput.username}},
    dependencies: [accountInput.username],
  });

  const handleSnackbarClosing = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrorOpen(false);
  };

  // Check if the credentials input are valid
  const areAllCredentialsFieldsValid = (): boolean => {
    const currErrorMessages = signUpErrorMessage;
    return (
      currErrorMessages.emailError.size === 0 &&
      currErrorMessages.usernameError.size === 0 &&
      currErrorMessages.passwordError.size === 0 &&
      currErrorMessages.verifyPasswordError.size === 0 &&
      currErrorMessages.shopNameError.size === 0 &&
      currErrorMessages.addressError.size === 0 &&
      currErrorMessages.phoneError.size === 0 &&
      currErrorMessages.shopCategoryError.size === 0
    );
  };
  // Check if the credentials input are filled
  const areAllCredentialsFieldsAreFilled = (): boolean => {
    return (
      accountInput.shopName !== '' &&
      accountInput.email !== '' &&
      accountInput.username !== '' &&
      accountInput.password !== '' &&
      verifyPassword !== '' &&
      accountInput.address !== '' &&
      accountInput.phone !== '' &&
      accountInput.shopCategory !== ''
    );
  };
  // Should the sign up button be disabled
  const submitButtonShouldBeDisabled = () => {
    return (
      emailUsedLoading ||
      usernameUsedLoading ||
      !areAllCredentialsFieldsValid() ||
      !areAllCredentialsFieldsAreFilled()
    );
  };
  // Handle the creation of a new account
  const handleCreateAccount = () => {
    dispatchCredentialsState({type: 'CHECK_SIGN_UP_CREDENTIALS'});
    const areCredentialsValid = areAllCredentialsFieldsValid();
    if (areCredentialsValid) {
      signUp({variables: {accountInput: accountInput}});
    } else {
      dispatchCredentialsState({type: 'CHECK_SIGN_UP_CREDENTIALS'});
    }
  };

  return (
    <Fragment>
      <SafeAreaView style={signUpStyles.topSafeAreaView} />
      <SafeAreaView style={signUpStyles.bottomSafeAreaView}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={signUpStyles.root}>
          <View style={signUpStyles.signUp}>
            <TouchableOpacity
              style={signUpStyles.back_button}
              onPress={() => navigation.goBack()}>
              <Image
                style={signUpStyles.back_button_icon}
                source={require('../../assets/icons/back.png')}
              />
            </TouchableOpacity>
            <Text style={signUpStyles.signUpText}>
              {translation(SIGN_UP_TITLE_KEY)}
            </Text>
          </View>
          <View style={signUpStyles.card}>
            <ScrollView>
              <View style={signUpStyles.fieldsView}>
                {SignUpTextFields.map(field => {
                  return (
                    <CredentialInput
                      key={field.attribute}
                      isCategory={field.attribute === 'shopCategory'}
                      field={field}
                      credential={
                        field.attribute === 'confirmPassword'
                          ? verifyPassword
                          : accountInput[field.attribute as keyof AccountInput]
                      }
                      errorMessage={
                        signUpErrorMessage[
                          (field.attribute +
                            'Error') as keyof SignUpErrorMessage
                        ].size > 0
                          ? signUpErrorMessage[
                              (field.attribute +
                                'Error') as keyof SignUpErrorMessage
                            ]
                              .values()
                              .next().value
                          : (EMPTY_KEY as string)
                      }
                      dispatch={dispatchCredentialsState}
                    />
                  );
                })}
              </View>
              <View style={signUpStyles.buttonView}>
                <Button
                  disabled={submitButtonShouldBeDisabled()}
                  style={signUpStyles.button}
                  mode="contained"
                  onPress={handleCreateAccount}>
                  {translation(SIGN_UP_CREATE_ACCOUNT_KEY)}
                </Button>
              </View>
              <Snackbar
                visible={errorOpen}
                onDismiss={() => {}}
                action={{
                  label: 'Dismiss',
                  onPress: () => {
                    setErrorOpen(false);
                  },
                }}>
                {translation(SIGN_UP_ERROR_ACCOUNT_CREATION_KEY)}
              </Snackbar>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Fragment>
  );
};

export default SignUp;
