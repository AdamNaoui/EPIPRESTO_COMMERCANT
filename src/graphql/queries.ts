import {gql} from '@apollo/client';

/*
 * Name: GraphQL Query
 * Description: This file contains all the GraphQL queries used in the application.
 * Author: Adam Naoui-Busson, Alessandro van Reusel, Khalil Zriba, Ryma Messedaa, Zouhair Derouich
 */

export const LOGIN_BY_EMAIL = gql`
  query Query($email: String!, $password: String!) {
    loginVendorByEmail(email: $email, password: $password) {
      code
      message
      vendorAccount {
        _id
        store {
          _id
          isAdmin
        }
      }
    }
  }
`;

export type LoginVendorByEmailData = {
  loginVendorByEmail: {
    code: number;
    message: string;
    vendorAccount: {
      _id: string;
      store: {
        _id: string;
        isAdmin: boolean;
      };
    };
  };
};

export const LOGIN_BY_USERNAME = gql`
  query Query($username: String!, $password: String!) {
    loginVendorByUsername(username: $username, password: $password) {
      code
      message
      vendorAccount {
        _id
        store {
          _id
          isAdmin
        }
      }
    }
  }
`;

export type LoginVendorByUsernameData = {
  loginVendorByUsername: {
    code: number;
    message: string;
    vendorAccount: {
      _id: string;
      store: {
        _id: string;
        isAdmin: boolean;
      };
    };
  };
};

export const IS_VENDOR_USERNAME_USED = gql`
  query Query($username: String!) {
    isVendorUsernameUsed(username: $username)
  }
`;

export const IS_VENDOR_EMAIL_USED = gql`
  query Query($email: String!) {
    isVendorEmailUsed(email: $email)
  }
`;

export const GET_STORE_PRODUCTS_BY_ID = gql`
  query GetStoreById(
    $idStore: ID!
    $offset: Int!
    $first: Int!
    $searchText: String
  ) {
    getStoreById(idStore: $idStore) {
      code
      message
      store {
        products(offset: $offset, first: $first, searchText: $searchText) {
          _id
          title
          imgSrc
        }
      }
    }
  }
`;
export const GET_INITIAL_CHATS = gql`
  query Query($idStore: ID!) {
    getStoreById(idStore: $idStore) {
      code
      message
      store {
        _id
        chats {
          _id
          relatedOrder {
            _id
            orderNumber
          }
          messages {
            _id
            message
            date
            role
            status
          }
          relatedClient {
            _id
            username
          }
        }
      }
    }
  }
`;

export const GET_STORE_CREDENTIALS_BY_ID = gql`
  query getStoreCredentialsById($idStore: ID!) {
    getStoreById(idStore: $idStore) {
      code
      message
      store {
        name
        address
        isPaused
        disponibilities {
          day
          activesHours {
            openingHour
            endingHour
          }
        }
        relatedVendor {
          phone
          _id
        }
      }
    }
  }
`;

export const GET_STORE_VARIANTS_BY_ID = gql`
  query Query(
    $idStore: ID!
    $offset: Int!
    $first: Int!
    $variantsOffset2: Int!
    $variantsSearchText2: String
    $variantsFirst2: Int
  ) {
    getStoreById(idStore: $idStore) {
      code
      message
      store {
        products(offset: $offset, first: $first) {
          title
          imgSrc
          variants(
            offset: $variantsOffset2
            searchText: $variantsSearchText2
            first: $variantsFirst2
          ) {
            _id
            displayName
            imgSrc
            stock
          }
        }
      }
    }
  }
`;

export const GET_ALL_ORDERS_BY_STORE_ID = gql`
  query GetStoreById($idStore: ID!, $idOrder: ID) {
    getStoreById(idStore: $idStore) {
      code
      message
      store {
        name
        orders(idOrder: $idOrder) {
          _id
          orderNumber
          productsVariantsOrdered {
            relatedProductVariant {
              displayName
              price
              imgSrc
              _id
              relatedProduct {
                relatedStore {
                  name
                }
              }
            }
            quantity
          }
          relatedVendors {
            name
          }
          relatedClient {
            lastName
            firstName
            email
            phone
            address
          }
          logs {
            status
            time
          }
          subTotal
          taxs
          deliveryFee
          paymentMethod
          subOrdersStatus {
            relatedStore {
              _id
              name
            }
            status
            time
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($idProduct: ID!, $offset: Int!, $first: Int) {
    getProductById(idProduct: $idProduct) {
      code
      message
      product {
        _id
        title
        brand
        published
        tags
        imgSrc
        description
        variants(offset: $offset, first: $first) {
          _id
          variantTitle
          availableForSale
          price
          sku
          taxable
          imgSrc
          byWeight
          stock
        }
      }
    }
  }
`;

export const GET_ANALYTICS = gql`
  query Query($idStore: ID!, $dateFrom: Date!, $dateTo: Date!) {
    getAnalytics(idStore: $idStore, dateFrom: $dateFrom, dateTo: $dateTo) {
      code
      message
      totalSales
      totalOrders
      topProducts {
        _id
        displayName
        variantTitle
        imgSrc
      }
    }
  }
`;

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($idOrder: ID!) {
    getOrderById(idOrder: $idOrder) {
      code
      message
      order {
        _id
        orderNumber
        productsVariantsOrdered {
          quantity
          relatedProductVariant {
            displayName
            price
            imgSrc
            _id
            relatedProduct {
              relatedStore {
                name
              }
            }
          }
        }
        relatedVendors {
          name
        }
        relatedClient {
          lastName
          firstName
          email
          phone
          address
        }
        logs {
          time
          status
        }
        subTotal
        taxs
        deliveryFee
        paymentMethod
        subOrdersStatus {
          relatedStore {
            _id
            name
          }
          status
          time
        }
      }
    }
  }
`;
