import React, { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Picker,
  Switch,
  Button,
  Alert
} from "react-native";
import DatePciker from "react-native-datepicker";
import * as Animatable from "react-native-animatable";
import { Permissions, Notifications } from "expo";

export default class Reservation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      guests: 1,
      smoking: false,
      date: "",
      showModal: false
    };
    this.handleReservation = this.handleReservation.bind(this);
  }
  static navigationOptions = {
    title: "Reserve Table"
  };

  /* //No longer using the Modal// 
 toggleModal() {
    this.setState({
      showModal: !this.state.showModal
    });
  }*/
  handleReservation() {
    console.log(JSON.stringify(this.state));
    this.addReservationToCalendar(this.state.date);
    Alert.alert(
      "Your Reservation OK?",
      `Number of Guest: ${this.state.guests}\n Smoking?: ${
        this.state.smoking ? "Yes" : "No"
      }\n Date and Time: ${new Date(Date.parse(this.state.date))}`,
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Cancel pressed");
            this.resetForm();
          },
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            this.presentLocalNotification(this.state.date);
            this.resetForm();
            console.log("OK pressed");
          }
        }
      ],
      { cancelable: false }
    );
  }
  onValueChange(itemValue) {
    this.setState({
      guests: itemValue
    });
  }
  resetForm() {
    this.setState({
      guests: 1,
      smoking: false,
      date: "",
      showModal: false
    });
  }
  //obtaining the calendar permission to use the default calendar first.
  async obtainCalendarPermission() {
    let permission = await Permissions.getAsync(Permissions.CALENDAR);

    if (permission.status === "granted") {
      permission = await Permissions.askAsync(Permissions.CALENDAR);
      if (permission.status !== "granted") {
        Alert.alert("You not granted permission to access calendar");
      }
    }
    return permission;
  }
  //add event to the calendar
  async addReservationToCalendar(date) {
    await this.obtainCalendarPermission();

    let startDate = new Date(Date.parse(date));
    let endDate = new Date(Date.parse(date) + 2 * 60 * 60 * 1000);

    Expo.Calendar.createEventAsync(Expo.Calendar.DEFAULT, {
      startDate: startDate,
      endDate: endDate,
      title: "Con Fusion Table Reservation",
      timeZone: "Asia/Hong_Kong",
      location: "121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong"
    });
  }

  //obtain permission before pushing the notification
  async obtainNotificationPermission() {
    let permission = await Permissions.getAsync(
      Permissions.USER_FACING_NOTIFICATIONS
    );
    if (permission.status !== "granted") {
      permission = await Permissions.askAsync(
        Permissions.USER_FACING_NOTIFICATIONS
      );
      if (permission.status !== "granted") {
        Alert.alert("Permission not granted to show notifications");
      }
    }
    return permission;
  }
  //push notification
  async presentLocalNotification(date) {
    await this.obtainNotificationPermission();
    Notifications.presentLocalNotificationAsync({
      title: "Your Reservation",
      body: "Reservation for " + date + " requested",
      ios: {
        sound: true
      },
      android: {
        sound: true,
        vibrate: true,
        color: "#512DA8"
      }
    });
  }

  render() {
    return (
      <ScrollView>
        <Animatable.View animation="zoomIn">
          <View style={StyleSheet.formRow}>
            <Text style={styles.formLabel}>Number of Guests</Text>
            <Picker
              style={styles.formItem}
              selectedValue={this.state.guests}
              onValueChange={this.onValueChange.bind(this)}
            >
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
              <Picker.Item label="6" value="6" />
            </Picker>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Smoking/Non-Smoking?</Text>
            <Switch
              style={styles.formItem}
              value={this.state.smoking}
              trackColor="#512DA8"
              onValueChange={value => this.setState({ smoking: value })}
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Date and Time</Text>
            <DatePciker
              style={{ flex: 2, marginRight: 20 }}
              date={this.state.date}
              format=""
              mode="datetime"
              placeholder="select date and time"
              minDate="2019-02-01"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              customStyles={{
                dateIcon: {
                  position: "absolute",
                  left: 0,
                  top: 4,
                  marginLeft: 0
                },
                dateInput: {
                  marginLeft: 36
                }
              }}
              onDateChange={date => this.setState({ date: date })}
            />
          </View>
          <View style={styles.formRow}>
            <Button
              title="Reserve"
              color="#512DA8"
              onPress={() => this.handleReservation()}
              accessibilityLabel="Learn more about this purple button"
            />
          </View>
        </Animatable.View>
        {/* <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onDismiss={() => {
            this.toggleModal();
            this.resetForm();
          }}
          onRequestClose={() => {
            this.toggleModal();
            this.resetForm();
          }}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Your Reservation</Text>
            <Text style={styles.modalText}>
              Number Guests: {this.state.guests}
            </Text>
            <Text style={styles.modalText}>
              Smoking?: {this.state.smoking ? "Yes" : "No"}
            </Text>
            <Text style={styles.modalText}>
              Date and Time: {this.state.date}
            </Text>
            <Button
              onPress={() => {
                this.toggleModal();
                this.resetForm();
              }}
              color="#512DA8"
              title="Close"
            />
          </View>
        </Modal> */}
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20
  },
  formLabel: {
    fontSize: 18,
    flex: 2
  },
  formItem: {
    flex: 1
  },
  modal: {
    justifyContent: "center",
    margin: 20
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#f0f",
    textAlign: "center",
    marginBottom: 20
  },
  modalText: {
    margin: 10,
    fontSize: 18
  }
});
