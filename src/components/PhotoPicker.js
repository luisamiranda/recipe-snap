import React, { Component } from 'react'
import { ImagePicker } from 'expo'
import { Button, Image, View, Text, ImageEditor, ImageStore, Linking } from 'react-native'
import { CheckBox } from 'react-native-elements'
import { connect } from 'react-redux'
import {
  StackNavigator,
} from 'react-navigation'

import styles from '../style'
import { clarifaiApp } from '../secrets'
import { setPhotoUrl, setPhotoBase64, setPhotoTags } from '../redux/photo'
import RecipesScreen from './Recipes'

/* -----------------    COMPONENT    ------------------ */

class PhotoPicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      vegetarian: true
      // preferences: [] // ['vegetarian', 'vegan']
    }
    this.changeCheckboxState = this.changeCheckboxState.bind(this)
  }

  changeCheckboxState(option) {
    this.setState({
      [option]: !this.state[option]
    })
  }

  render() {
    let { photo, setPhoto, setBase64, setTags, navigation } = this.props
    let { navigate } = navigation

    const pickPhoto = async () => {
      let choice = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      })

      if (!choice.cancelled) {
        getImageUrl(choice)
      }
    }

    const takePhoto = async () => {
      let choice = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
      })

      if (!choice.cancelled) {
        getImageUrl(choice)
      }
    }

    const getImageUrl = (input) => {
      const fixedPhotoUrl = input.uri.replace('file://', '')
      setPhoto(fixedPhotoUrl)

      Image.getSize(fixedPhotoUrl, (width, height) => {
        let imageSize = {
          size: { width, height },
          offset: { x: 0, y: 0 }
        }

        // https://github.com/facebook/react-native/issues/12114
        ImageEditor.cropImage(fixedPhotoUrl, imageSize, (imageUri) => {
          ImageStore.getBase64ForTag(imageUri, (base64Data) => {
            setBase64(base64Data)
            setClarifaiTagsAndRecipes(base64Data)
            ImageStore.removeImageForTag(imageUri);
          }, (reason) => console.log('ERROR 3: ', reason) )
        }, (reason) => console.log('ERROR 2: ', reason) )
      }, (reason) => console.log('ERROR 1: ', reason))
    }

    const setClarifaiTagsAndRecipes = (base64) => {
      clarifaiApp.models.predict(Clarifai.FOOD_MODEL, { base64: base64 })
      .then((res) => {
        // console.log('Clarifai result = ', res);
        let tags = []
        const concepts = res.outputs[0].data.concepts
        for (let i = 0; i < 3; i++) {
          tags.push(concepts[i].name)
        }
        setTags(tags, this.state.preferences)
        navigate('Recipes')
      }, (error) => {
        console.log('ERROR getting clarifai tags: ', error);
      })
    }

    return (
      <View style={ styles.container }>
        <Button
          title="Pick a food photo from your camera roll"
          onPress={ pickPhoto }
        />

        <Button
          title="Take a photo of your food"
          onPress={ takePhoto }
        />

        {/* Add "I'm feeling lucky" option to select */}
        {/* Add dietary restrictions */}

        <View style={ styles.checkboxRow } >
          <CheckBox
            center
            title='Vegan'
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            checked={ this.state.vegetarian }
            onIconPress={ this.changeCheckboxState }
          />
        </View>

      </View>
    )
  }
}

/* -----------------   REACT-REDUX   ------------------ */

const mapState = ({ photo }) => ({ photo })
const mapDispatch = dispatch => ({
  setPhoto: (photo) => {
    dispatch(setPhotoUrl(photo))
  },
  setBase64: (base64) => {
    dispatch(setPhotoBase64(base64))
  },
  setTags: (tags, prefs) => {
    dispatch(setPhotoTags(tags, prefs))
  }
})

/* -----------------    NAVIGATOR    ------------------ */

const PhotoPickerScreen = connect(mapState, mapDispatch)(PhotoPicker)

const App = StackNavigator({
  Home: { screen: PhotoPickerScreen },
  Recipes: { screen: RecipesScreen },
})

export default connect()(App)
