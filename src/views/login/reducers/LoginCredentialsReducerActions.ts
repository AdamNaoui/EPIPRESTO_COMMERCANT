/*
 * Name: Login Credentials Reducer Actions
 * Description: This file contains the actions for the login credentials reducer.
 * Author: Zouhair Derouich, Adam Naoui-Busson
 */
export type LoginCredentialsStateReducerAction =
  | {type: 'CHANGE_AUTH'; newAuth: string}
  | {type: 'CHECK_LOGIN_CREDENTIALS'}
  | {type: 'CHANGE_PASSWORD'; newPassword: string}
  | {type: 'CHANGE_PASSWORD_VISIBILITY'; showPassword: boolean}
  | {type: 'CHANGE_SNACKBAR_VISIBILITY'; showSnackBar: boolean}
  | {type: 'RESET_CREDENTIALS'};
