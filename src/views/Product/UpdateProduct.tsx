import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  HelperText,
  IconButton,
  Text,
} from 'react-native-paper';
import {addProductsStyles} from './Styles/AddProductStyles';
import Variant from './Variant';
import Product from './Product';
import {useTranslation} from 'react-i18next';
import {useMutation, useQuery} from '@apollo/client/react';
import {GET_PRODUCT_BY_ID} from '../../graphql/queries';
import {
  ADD_NEW_VARIANTS_TO_PRODUCT,
  REMOVE_VARIANTS_BY_ID,
  UPDATE_PRODUCT,
  UPDATE_VARIANTS,
} from '../../graphql/mutations';
import {UPDATE_PRODUCT_PAGE_TITLE} from '../../translations/keys/GeneralTranslationKeys';

/*
 * Name: Update Product
 * Description: This file contains the page to modify the product and its variants.
 * Author: Zouhair Derouich, Khalil Zriba, Adam Naoui-Busson, Ryma Messedaa
 */

interface ProductFields {
  title: string;
  description: string;
  brand: string;
  published: boolean;
  tags: string[];
  imgSrc: string;
}

interface VariantFields {
  variantId: string;
  variantTitle: string;
  price: string;
  sku: string;
  taxable: boolean;
  imgSrc: string;
  byWeight: boolean;
  availableForSale: boolean;
  stock: string;
  isValid: boolean;
  isHidden: boolean;
}

const UpdateProduct = ({route, navigation}: any) => {
  const [updateProductCount, setUpdateProductCount] = useState(0);
  const [updateVariantCount, setUpdateVariantCount] = useState(0);

  const [product, setProduct] = useState<ProductFields>();
  const [variants, setVariants] = useState<VariantFields[]>([]);
  const [newVariants, setNewVariants] = useState<string[]>([]);
  const [deletedVariants, setDeletedVariants] = useState<string[]>([]);
  const [updatedVariants, setUpdatedVariants] = useState<string[]>([]);

  const {t} = useTranslation('translation');
  const [refreshed, setRefreshed] = useState(0);
  const deleteError = t('addProduct.deleteError');
  const [productNameError, setError] = useState('');

  const defaultVariant: VariantFields = {
    variantId: new Date().getTime().toString() + 1,
    variantTitle: '',
    price: '',
    sku: '',
    taxable: false,
    imgSrc: '',
    byWeight: false,
    availableForSale: false,
    stock: '',
    isValid: false,
    isHidden: false,
  };
  // Query to get the product by id
  const {loading, error} = useQuery(GET_PRODUCT_BY_ID, {
    variables: {
      idProduct: route.params.idProduct,
      offset: 0,
      first: 20,
    },
    fetchPolicy: 'network-only',
    onCompleted(data) {
      const myProduct = data.getProductById.product;
      const productFields: ProductFields = {
        title: myProduct.title,
        description: myProduct.description,
        brand: myProduct.brand,
        published: myProduct.published,
        tags: myProduct.tags,
        imgSrc: myProduct.imgSrc,
      };
      const myVariants = myProduct.variants.map((variant: any) => {
        return {
          ...variant,
          variantId: variant._id,
          isValid: true,
          isHidden: false,
        };
      });
      const myVariants2 = myVariants.map((variant: any) => {
        const {_id, __typename, ...rest} = variant;
        return rest;
      });
      setProduct(productFields);
      setVariants(myVariants2);
    },
  });
  // Alert if it the modification of the product are saved or not
  const alertOnSave = (succes: boolean) =>
    Alert.alert(
      succes ? 'Succes' : 'Erreur',
      succes ? succesAddMessage : failAddMessage,
      succes
        ? [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        : [
            {
              text: 'OK',
              onPress: () => {},
            },
          ],
    );

  const {
    updateProduct,
    addNewVariantsToProduct,
    removeVariantsByIds,
    updateVariants,
  } = useUpdateProductManager(
    () => alertOnSave(true),
    () => alertOnSave(false),
  );

  // Handle the update of the product
  const handleUpdate = () => {
    const idProduct = route.params.idProduct;
    Keyboard.dismiss();
    // remvoe newVariants from updatedVariants
    const filteredUpdatedVariants = updatedVariants.filter(updatedvariantId => {
      const variant = newVariants.find(
        variantId => updatedvariantId === variantId,
      );
      return !variant;
    });
    // consider only delted variants that are not in newVariants
    const filteredDeletedVariants = deletedVariants.filter(deletedVariantId => {
      const variant = newVariants.find(
        variantId => deletedVariantId === variantId,
      );
      return !variant;
    });

    // consider only new variants that are not in deletedVariants
    const filteredNewVariants = newVariants.filter(newVariantId => {
      const variant = deletedVariants.find(
        variantId => newVariantId === variantId,
      );
      return !variant;
    });

    // set fields to update
    let productFieldsToUpdate = {}; // remplir si updated
    let variantsToAdd: {
      price: number;
      stock: number;
      variantTitle: string;
      sku: string;
      taxable: boolean;
      imgSrc: string;
      byWeight: boolean;
      availableForSale: boolean;
    }[] = [];
    let variantsToDelete: string[] = [];
    let varvariantsToUpdate: {
      variantId: string;
      price: number;
      stock: number;
      variantTitle: string;
      sku: string;
      taxable: boolean;
      imgSrc: string;
      byWeight: boolean;
      availableForSale: boolean;
    }[] = [];

    // if product fields changed, update product
    // the first update happens when the product is loaded
    if (updateProductCount > 1) {
      // consider only tags that are not empty
      const filteredTags = product?.tags.filter(tag => tag !== '');
      // replace tags with filteredTags
      const productFields = {...product, tags: filteredTags};
      productFieldsToUpdate = productFields;
    }
    if (filteredNewVariants.length > 0) {
      // get variants that id is in newVariants
      const newVariantsToAdd = variants.filter(variant => {
        const variantId = filteredNewVariants.find(
          variantId => variantId === variant.variantId,
        );
        return variantId;
      });
      const variantsWithoutId = newVariantsToAdd.map(variant => {
        const {variantId, isHidden, isValid, price, stock, ...rest} = variant;
        return {
          ...rest,
          price: parseFloat(parseFloat(price).toFixed(2)),
          stock: parseInt(stock),
        };
      });
      variantsToAdd = variantsWithoutId;
    }
    if (filteredDeletedVariants.length > 0) {
      variantsToDelete = filteredDeletedVariants;
    }
    if (filteredUpdatedVariants.length > 0) {
      // get variants that id is in updatedVariants
      const updatedVariantsToUpdate = variants.filter(variant => {
        const variantId = filteredUpdatedVariants.find(
          variantId => variantId === variant.variantId,
        );
        return variantId;
      });
      updatedVariantsToUpdate.forEach(variant => {
        // dont consider variantId, isHidden and isValid
        const {isHidden, isValid, price, stock, ...rest} = variant;
        // change price and stock to number
        const fieldsToUpdate = {
          ...rest,
          price: parseFloat(parseFloat(price).toFixed(2)),
          stock: parseInt(stock),
        };
        varvariantsToUpdate.push(fieldsToUpdate);
      });
    }

    updateProduct({
      variables: {productId: idProduct, fieldsToUpdate: productFieldsToUpdate},
    });
    updateVariants({variables: {variantsToUpdate: varvariantsToUpdate}});
    addNewVariantsToProduct({
      variables: {productId: idProduct, newVariants: variantsToAdd},
    });
    removeVariantsByIds({variables: {productVariantsIds: variantsToDelete}});
  };
  // Check if the submit button should be disabled
  const submitButtonShouldBeDisabled = () => {
    // if updateProductCount && updateVariantCount is 1, it means that the user has not changed anything
    // First update happens when we load the page, because we set the product and variants
    // If the user has not changed anything, but deleted variant(s), we should enable the submit button
    if (
      updateProductCount === 1 &&
      updateVariantCount === 1 &&
      deletedVariants.length > 0
    ) {
      return false;
    }
    if (updateProductCount === 1 && updateVariantCount === 1) {
      return true;
    }
    // button disabled if the product name is empty
    else if (product && product.title === '') {
      return true;
    }
    // button disabled if one of the variants is not valid
    else if (variants.some(variant => variant.isValid === false)) {
      return true;
    }
    return false;
  };

  const succesAddMessage = 'Produit modifi?? avec succ??s!';
  const failAddMessage =
    'Une erreur est survenue lors de la modification du produit. Veuillez r??essayer.';

  const messageBack =
    'Voulez-vous vraiment quitter la page? Toutes les modifications non sauvegard??es seront perdues.';

  // Go back to the previous screen
  const backToInventory = () => {
    setUpdateProductCount(0);
    setUpdateVariantCount(0);
    Keyboard.dismiss();
    if (submitButtonShouldBeDisabled()) {
      navigation.goBack();
    } else {
      Alert.alert('Alert', messageBack, [
        {text: 'Quitter', onPress: () => navigation.goBack()},
        {
          text: 'Annuler',
          onPress: () => {},
        },
      ]);
    }
  };

  // Alert when user tries to delete the default variant
  const alertOnDelete = (message: string) =>
    Alert.alert('Alert', message, [
      {
        text: 'OK',
        onPress: () => {},
      },
    ]);

  // Add a default variant
  const addDefaultVariant = () => {
    // check if the product title is empty
    if (product && !product.title.trim()) {
      setError('Veuillez remplir les champs obligatoires du produit');
    }
    setNewVariants([...newVariants, defaultVariant.variantId]);
    setVariants([...variants, defaultVariant]);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#EAEAEA'}}>
      <View style={addProductsStyles.headerFix}>
        <TouchableOpacity
          style={addProductsStyles.back_button}
          onPress={() => backToInventory()}>
          <Image
            style={addProductsStyles.back_button_icon}
            source={require('../../assets/icons/back.png')}
          />
        </TouchableOpacity>
        <Text style={addProductsStyles.header_text}>
          {t(UPDATE_PRODUCT_PAGE_TITLE)}
        </Text>

        <IconButton
          style={addProductsStyles.save_button}
          onPress={() => handleUpdate()}
          disabled={submitButtonShouldBeDisabled()}
          mode="contained"
          icon="content-save-edit"
          size={30}
          containerColor="#FFA50047"
          iconColor="#FFA500"
        />
      </View>
      <ScrollView style={{flex: 1}}>
        {loading ? (
          <View>
            <ActivityIndicator size="large" color="#FFA500" />
          </View>
        ) : error ? (
          <View>
            <Text style={{textAlign: 'center'}}>
              OOPS UNE ERREUR EST SURVENUE
            </Text>
          </View>
        ) : (
          <View>
            {product && (
              <Product
                title={product.title}
                description={product.description}
                brand={product.brand}
                published={true}
                tags={product.tags}
                imgSrc={product.imgSrc}
                refreshed={refreshed}
                updateSelf={(updatedProduct: ProductFields) => {
                  setProduct(updatedProduct);
                  setUpdateProductCount(updateProductCount + 1);
                }}
              />
            )}
            {product && productNameError && (
              <HelperText
                type="error"
                style={{
                  height: product.title.length < 1 ? 'auto' : 0,
                }}>
                {productNameError}
              </HelperText>
            )}

            <Text style={addProductsStyles.titleText}>VARIANTS</Text>

            <ScrollView>
              {variants.map((field, index) => (
                <Variant
                  key={field.variantId}
                  variantIndex={index}
                  variantId={field.variantId}
                  variantTitle={field.variantTitle}
                  price={field.price.toString()}
                  sku={field.sku}
                  taxable={field.taxable}
                  imgSrc={field.imgSrc}
                  byWeight={field.byWeight}
                  availableForSale={field.availableForSale}
                  stock={field.stock.toString()}
                  isValid={field.isValid}
                  isHidden={field.isHidden}
                  isRefreshed={0}
                  updateSelf={(variant: VariantFields) => {
                    const newVariants = [...variants];
                    newVariants[index] = variant;
                    setVariants(newVariants);
                    setUpdateVariantCount(updateVariantCount + 1);
                    // if variants is updated and variantId is not already in updatedVariants, add it
                    if (
                      !updatedVariants.includes(variant.variantId) &&
                      updateVariantCount > 0
                    ) {
                      setUpdatedVariants([...updatedVariants, field.variantId]);
                    }
                  }}
                  deleteSelf={() => {
                    const newVariants = [...variants];
                    // add variantId to deletedVariants
                    setDeletedVariants([
                      ...deletedVariants,
                      newVariants[index].variantId,
                    ]);
                    if (newVariants.length > 1) {
                      newVariants.splice(index, 1);
                      setVariants(newVariants);
                      // remove variant id from updatedVariants if it has been updated and then deleted
                      const newUpdatedVariants = updatedVariants.filter(
                        id => id !== field.variantId,
                      );
                      setUpdatedVariants(newUpdatedVariants);
                    } else {
                      alertOnDelete(deleteError);
                    }
                  }}
                />
              ))}
            </ScrollView>
            <Button
              style={addProductsStyles.button}
              mode="contained"
              onPress={() => addDefaultVariant()}>
              {t('addProduct.addVariant')}
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateProduct;

export const useUpdateProductManager = (
  onSuccess: () => void,
  onError: () => void,
) => {
  // Mutations to update product and variants
  const [
    updateProduct,
    {loading: updateLoading, error: updateError, data: UpdateData},
  ] = useMutation(UPDATE_PRODUCT);
  const [
    addNewVariantsToProduct,
    {loading: addVariantLoading, error: aaddVariantError, data: addVariantData},
  ] = useMutation(ADD_NEW_VARIANTS_TO_PRODUCT);
  const [
    removeVariantsByIds,
    {
      loading: removeVariantLoading,
      error: removeVariantError,
      data: removeVariantData,
    },
  ] = useMutation(REMOVE_VARIANTS_BY_ID);
  const [
    updateVariants,
    {
      loading: updateVariantLoading,
      error: updateVariantError,
      data: updateVariantData,
    },
  ] = useMutation(UPDATE_VARIANTS);

  useEffect(() => {
    // if any errors occured during update, call onError
    if (
      updateError ||
      aaddVariantError ||
      removeVariantError ||
      updateVariantError
    ) {
      onError();
    }

    // if all mutations are done, call onSuccess
    if (
      !updateLoading &&
      !addVariantLoading &&
      !removeVariantLoading &&
      !updateVariantLoading &&
      (UpdateData || addVariantData || removeVariantData || updateVariantData)
    ) {
      onSuccess();
    }
  }, [
    updateLoading,
    addVariantLoading,
    removeVariantLoading,
    updateVariantLoading,
    updateError,
    aaddVariantError,
    removeVariantError,
    updateVariantError,
    UpdateData,
    addVariantData,
    removeVariantData,
    updateVariantData,
    onError,
    onSuccess,
  ]);

  return {
    updateProduct,
    addNewVariantsToProduct,
    removeVariantsByIds,
    updateVariants,
  };
};
