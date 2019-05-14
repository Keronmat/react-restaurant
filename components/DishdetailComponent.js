import React, { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Modal,
  Button,
  Alert,
  PanResponder,
  StyleSheet,
  Share
} from "react-native";
import { Card, Icon, Input, Rating } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postFavorite, postComment } from "../redux/ActionCreators";
import * as Animatable from "react-native-animatable";

const mapStateToProps = state => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites
  };
};

const mapDispatchToProps = dispatch => ({
  postFavorite: dishId => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, author, comment) =>
    dispatch(postComment(dishId, rating, author, comment))
});

function RenderDish(props) {
  const dish = props.dish;

  handleViewRef = ref => (this.view = ref);

  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    if (dx < -200) return true;
    else return false;
  };
  const recognizeComment = ({ moveX, moveY, dx, dy }) => {
    if (dx < 200) return true;
    else return false;
  };
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
    },
    onPanResponderGrant: () => {
      this.view
        .rubberBand(1000)
        .then(endState =>
          console.log(endState.finished ? "finished" : "cancelled")
        );
    },
    onPanResponderEnd: (e, gestureState) => {
      if (recognizeDrag(gestureState)) {
        Alert.alert(
          "Add to Favorites",
          "Are you sure you wish to add " + dish.name + " to your favorites?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel pressed"),
              style: "cancel"
            },
            {
              text: "OK",
              onPress: () =>
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress()
            }
          ],
          { cancelable: false }
        );
      } else if (recognizeComment(gestureState)) {
        props.toggleModal();
      }
      return true;
    }
  });

  const shareDish = (title, message, url) => {
    Share.share(
      {
        title: title,
        message: `${title} : ${message} ${url}`,
        url: url
      },
      {
        dialogTitle: `Share ${title}`
      }
    );
  };

  if (dish != null) {
    return (
      <Animatable.View
        animation="fadeInDown"
        duration={2000}
        delay={1000}
        ref={this.handleViewRef}
        {...panResponder.panHandlers}
      >
        <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
          <Text style={{ margin: 10 }}>{dish.description}</Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center"
            }}
          >
            <Icon
              raised
              reverse
              name={props.favorite ? "heart" : "heart-o"}
              type="font-awesome"
              color="#f50"
              onPress={() =>
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress()
              }
              style={{ flex: 1 }}
            />
            <Icon
              raised
              reverse
              name="pencil"
              type="font-awesome"
              color="#512DA8"
              onPress={() => props.toggleModal()}
              style={{ flex: 1 }}
            />
            <Icon
              raised
              reverse
              name="share"
              type="font-awesome"
              color="#51D2A8"
              style={{ flex: 1 }}
              onPress={() =>
                shareDish(dish.name, dish.description, baseUrl + dish.image)
              }
            />
          </View>
        </Card>
      </Animatable.View>
    );
  } else {
    return <View />;
  }
}

function RenderComments(props) {
  const comments = props.comments;

  const renderCommentItem = ({ item, index }) => {
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <Rating
          style={styles.rating}
          readonly
          imageSize={10}
          startingValue={item.rating}
        />
        <Text style={{ fontSize: 12 }}>{`-- ${item.author}, ${
          item.date
        } `}</Text>
      </View>
    );
  };
  return (
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
      <Card title="Comments">
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={item => item.id.toString()}
        />
      </Card>
    </Animatable.View>
  );
}

class Dishdetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      rating: 3,
      author: "",
      comment: ""
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.handleComment = this.handleComment.bind(this);
  }
  toggleModal() {
    this.setState({
      showModal: !this.state.showModal
    });
  }
  handleComment(dishId, rating, author, comment) {
    this.props.postComment(dishId, rating, author, comment);
    console.log(dishId, rating, author, comment);
  }

  /*ratingCompleted(rating) {
    console.log("Rating is: " + rating);
    this.setState({
      rating: this.state.rating
    });
  }*/

  markFavorite(dishId) {
    this.props.postFavorite(dishId);
  }

  static navigationOptions = {
    title: "Dish Details"
  };

  render() {
    const dishId = this.props.navigation.getParam("dishId", "");
    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some(el => el === dishId)}
          onPress={() => this.markFavorite(dishId)}
          toggleModal={() => this.toggleModal()}
        />
        <RenderComments
          comments={this.props.comments.comments.filter(
            comment => comment.dishId === dishId
          )}
          //dishId={this.props.dishId}
        />
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onDismiss={() => {
            this.toggleModal();
          }}
          onRequestClose={() => {
            this.toggleModal();
          }}
        >
          <View style={styles.modal}>
            <View style={styles.formRow}>
              <Rating
                type="star"
                ratingCount={5}
                imageSize={35}
                showRating
                onFinishRating={rating => this.setState({ rating: rating })}
                style={{ paddingVertical: 0 }}
              />
            </View>
            <View style={styles.formRow}>
              <Input
                placeholder="Author"
                leftIcon={{ type: "font-awesome", name: "user-o" }}
                onChangeText={author => this.setState({ author: author })}
              />
            </View>
            <View style={styles.formRow}>
              <Input
                placeholder="Comment"
                leftIcon={{ type: "font-awesome", name: "comment-o" }}
                onChangeText={comment => this.setState({ comment: comment })}
              />
            </View>
            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Button
                  onPress={() => {
                    this.handleComment(
                      dishId,
                      this.state.rating,
                      this.state.author,
                      this.state.comment
                    );
                    this.toggleModal();
                  }}
                  color="#512DA8"
                  title="Submit"
                  accessibilityLabel="Post your comment"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  onPress={() => {
                    this.toggleModal();
                  }}
                  color="#888"
                  title="Cancel"
                  accessibilityLabel="Cancel comment"
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  formRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 10
  },
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 20
  },

  rating: {
    alignSelf: "flex-start",
    marginTop: 5,
    marginBottom: 5
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dishdetail);
