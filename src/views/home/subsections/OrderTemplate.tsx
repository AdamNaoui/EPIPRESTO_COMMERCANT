import React from "react"
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native"
import { Button, Text } from 'react-native-paper'

interface OrderTemplateProps {
  orderNum: number;
  clientName: string
}

const OrderTemplate = (props: OrderTemplateProps) => {

  const {t} = useTranslation('translation')

  return(
    <View style={orderStyles.container}>
      <Text variant="titleSmall">
        {`Commande #${props.orderNum}`}
      </Text>
      <Text variant="titleSmall">
        Client
      </Text>
      <Text variant="titleSmall">
        {props.clientName}
      </Text>
      <Button style={orderStyles.buttonStyle}>
        <Text style={orderStyles.buttonText}>
          {t('home.ordersSection.consult')}
        </Text>
      </Button>
    </View>
  )
}

const orderStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonStyle: {
    borderRadius: 30,
    color: "white",
    backgroundColor: "#FFA500",
    width: "auto",
  },
  buttonText: {
    color: 'white'
  }
});

export default OrderTemplate