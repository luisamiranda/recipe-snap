import React, { Component } from 'react'
import { Button, Image, View, Text, ScrollView, Linking } from 'react-native'
import { connect } from 'react-redux'

import styles from '../style'
// import { setPhotoUrl, setPhotoBase64, setPhotoTags } from '../redux/photo'

/* -----------------    COMPONENT    ------------------ */

class Recipes extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Your Recipes`,
  })

  render() {
    let { photoUrl, tags } = this.props.photo
    let { recipeList } = this.props.recipes

    const visitRecipeUrl = (url) => {
      Linking.openURL(url)
      .catch(err => console.error('Error: ', err))
    }
    return (
      <View>
        <ScrollView>

          {/* Maybe add a separate screen to select ingredients from tags list */}
          {/* Possibly make each recipe show more info (ingredients, calories) when tapped */}

          { photoUrl
          ? <Image source={{ uri: photoUrl }} style={ styles.image } />
          : null }

          <Text>Here are the ingredients I see: { tags.join(', ') }</Text>

          {
            recipeList.map((recipe, idx) => (
              <View key={ idx } >
                <Image source={{ uri: recipe.image }} style={ styles.image } />
                <Text>{ recipe.label }</Text>
                <Text>Source: { recipe.source }</Text>
                <Button
                  title="Link to original website"
                  onPress={ () => visitRecipeUrl(recipe.url) } />
              </View>
            ))
          }

        </ScrollView>
      </View>
    )
  }
}

/* -----------------   REACT-REDUX   ------------------ */

const mapState = ({ photo, recipes }) => ({ photo, recipes })
const mapDispatch = dispatch => ({
})

/* -----------------    NAVIGATOR    ------------------ */

const RecipesScreen = connect(mapState, mapDispatch)(Recipes)

export default RecipesScreen
