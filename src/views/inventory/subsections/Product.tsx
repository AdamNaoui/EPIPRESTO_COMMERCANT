import React from "react";
import { Image, View } from "react-native";
import { Button, Card, Divider, Text } from 'react-native-paper';
import { productStyles } from "./ProductStyles";
import Icon from 'react-native-vector-icons/FontAwesome';

export interface ProductProps {
  _id: string;
  title: string;
  imgSrc: any;
}

const Product = (props: ProductProps) => {

  return(
    <View style={productStyles.root}>
      <Card style={productStyles.cardStyle}>
        {props.imgSrc ? 
          (<Image style={productStyles.image} source={{uri: props.imgSrc}}/>) 
          : 
          (<Icon style={productStyles.icon} name="image" size={100}></Icon>)}
        <Divider bold style={{backgroundColor: "#FFA500", marginTop: '4%'}}></Divider>
        <Text ellipsizeMode='tail' numberOfLines={2} variant="titleSmall" style={productStyles.productName}>
          {props.title}
        </Text>
        <Button style={productStyles.buttonStyle}>
          <Text style={productStyles.buttonText}>
            VOIR PLUS
          </Text>
        </Button>
      </Card>
    </View>
  )
}

export default Product