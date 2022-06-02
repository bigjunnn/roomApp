import React, { useState, useEffect } from "react"
import {
	SafeAreaView,
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	FlatList,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { Ionicons } from "@expo/vector-icons"
import { BarCodeScanner } from "expo-barcode-scanner"
import { Camera } from "expo-camera"
import * as WebBrowser from "expo-web-browser"
import Moment from "moment"

import Header from "./components/header"

export default function App() {
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
	const [isTimePickerVisible, setTimePickerVisibility] = useState(false)
	const [isSortDropDownVisible, setSortDropDownVisibility] = useState(false)
	const [isAppVisible, setAppVisibility] = useState(true)
	const [openScanner, setOpenScanner] = useState(false)

	const [data, setData] = useState([])
	const [sortValue, setSortValue] = useState("level")
	const [date, setDate] = useState(
		Moment(new Date("2019/01/03 12:30:00")).format("Do MMM YYYY")
	)
	const [time, setTime] = useState(
		Moment(new Date("2019/01/03 12:30:00")).format("h:mm A")
	)

	// Date-related methods
	const showDatePicker = () => {
		setDatePickerVisibility(true)
	}

	const hideDatePicker = () => {
		setDatePickerVisibility(false)
	}

	const handleDateConfirm = (date) => {
		setDate(Moment(date).format("Do MMM YYYY"))
		hideDatePicker()
	}

	// Time-related methods
	const showTimePicker = () => {
		setTimePickerVisibility(true)
	}

	const hideTimePicker = () => {
		setTimePickerVisibility(false)
	}

	const handleTimeConfirm = (time) => {
		setTime(Moment(time).format("h:mm A"))
		hideTimePicker()
	}

	const onQRScan = (qrInfo) => {
		const url = qrInfo["data"]
		setOpenScanner(false)
		setAppVisibility(true)
		WebBrowser.openBrowserAsync(url)
	}

	const onOpenScanner = async () => {
		const permissionResponse = await BarCodeScanner.requestPermissionsAsync()
		if (permissionResponse["status"] === "granted") {
			setAppVisibility(false)
			setOpenScanner(true)
		} else {
			alert("Camera permission is required.")
		}
	}

	const handleSortConfirm = (value) => {
		setSortValue(value)
		setSortDropDownVisibility(false)
	}

	const checkAvailability = (availabilityArr) => {
		var formattedTime = Moment(time, "h:mm A").format("HH:mm")
		return availabilityArr[formattedTime] == 1
	}

	const getRoomAvailability = async () => {
		try {
			const response = await fetch(
				"https://gist.githubusercontent.com/yuhong90/7ff8d4ebad6f759fcc10cc6abdda85cf/raw/463627e7d2c7ac31070ef409d29ed3439f7406f6/room-availability.json"
			)
			const json = await response.json()
			setData(json)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		getRoomAvailability()
	}, [])

	const availabilityComparator = (a, b) => {
		var formattedTime = Moment(time, "h:mm A").format("HH:mm")
		var firstAvailability = a.availability[formattedTime]
		var secondAvailability = b.availability[formattedTime]

		if (firstAvailability == 1 && secondAvailability == 1) {
			return 0
		} else if (firstAvailability > secondAvailability) {
			return -1
		} else {
			return 1
		}
	}

	const availableMessage = (
		<Text style={[styles.availabilityText, { color: "green" }]}>Available</Text>
	)
	const unavailableMessage = (
		<Text style={[styles.availabilityText, { color: "red" }]}>
			Not Available
		</Text>
	)

	const Room = ({ roomName, capacity, level, available }) => (
		<View style={styles.roomDetails}>
			<View style={{ padding: 15, flexDirection: "row" }}>
				<Text style={styles.roomNameText}> {roomName} </Text>
				{available ? availableMessage : unavailableMessage}
			</View>

			<View style={{ padding: 15, flexDirection: "row" }}>
				<Text style={{ fontSize: 20 }}> Level {level} </Text>
				<Text style={{ flex: 1, fontSize: 20, textAlign: "right" }}>
					{capacity} Pax
				</Text>
			</View>
		</View>
	)

	return (
		<SafeAreaView style={styles.container}>
			<Header
				title={"Book a Room"}
				iconName={"camera-outline"}
				iconPressedFn={onOpenScanner}
			></Header>
			{openScanner && (
				<Camera
					barCodeScannerSettings={{
						barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
					}}
					onBarCodeScanned={onQRScan}
					style={StyleSheet.absoluteFill}
					type="back"
				/>
			)}

			{isAppVisible && (
				<SafeAreaView style={{ flex: 1 }}>
					<View style={styles.dateTimeContainer}>
						<Text style={styles.dateTimeText}> Date </Text>
						<TouchableOpacity
							style={styles.dateTimeButton}
							onPress={() => showDatePicker()}
						>
							<Text> {date} </Text>
						</TouchableOpacity>

						<DateTimePickerModal
							isVisible={isDatePickerVisible}
							mode="date"
							onConfirm={handleDateConfirm}
							onCancel={hideDatePicker}
						/>
					</View>

					<View style={styles.dateTimeContainer}>
						<Text style={styles.dateTimeText}> Timeslot </Text>
						<TouchableOpacity
							style={styles.dateTimeButton}
							onPress={() => showTimePicker()}
						>
							<Text> {time} </Text>
						</TouchableOpacity>

						<DateTimePickerModal
							isVisible={isTimePickerVisible}
							mode="time"
							minuteInterval={30}
							onConfirm={handleTimeConfirm}
							onCancel={hideTimePicker}
						/>
					</View>

					<View style={styles.roomHeader}>
						<Text style={{ fontSize: 20, color: "grey", fontWeight: "600" }}>
							Rooms
						</Text>
						<TouchableOpacity
							style={{ flex: 1 }}
							onPress={() => setSortDropDownVisibility(!isSortDropDownVisible)}
						>
							<Text
								style={{
									flex: 1,
									fontSize: 20,
									color: "grey",
									fontWeight: "600",
									textAlign: "right",
								}}
							>
								Sort
							</Text>
						</TouchableOpacity>
						<Ionicons
							style={{ paddingLeft: 5 }}
							name="filter"
							size={24}
							color="black"
						/>
					</View>

					<View style={{ flex: 1 }}>
						{isSortDropDownVisible && (
							<Picker
								selectedValue={sortValue}
								onValueChange={(value) => handleSortConfirm(value)}
								mode="dropdown" // Android only
							>
								<Picker.Item label="Level" value="level" />
								<Picker.Item label="Capacity" value="capacity" />
								<Picker.Item label="Availability" value="availability" />
							</Picker>
						)}

						{sortValue === "level" && (
							<FlatList
								data={[...data]}
								renderItem={({ item }) => (
									<Room
										roomName={item.name}
										level={item.level}
										capacity={item.capacity}
										available={checkAvailability(item.availability)}
									/>
								)}
							/>
						)}

						{sortValue === "capacity" && (
							<FlatList
								data={[...data].sort((a, b) => a.capacity - b.capacity)}
								renderItem={({ item }) => (
									<Room
										roomName={item.name}
										level={item.level}
										capacity={item.capacity}
										available={checkAvailability(item.availability)}
									/>
								)}
							/>
						)}

						{sortValue === "availability" && (
							<FlatList
								data={[...data].sort((a, b) => availabilityComparator(a, b))}
								renderItem={({ item }) => (
									<Room
										roomName={item.name}
										level={item.level}
										capacity={item.capacity}
										available={checkAvailability(item.availability)}
									/>
								)}
							/>
						)}
					</View>
				</SafeAreaView>
			)}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	dateTimeContainer: {
		marginTop: 10,
		marginLeft: 5,
		flexDirection: "column",
	},
	dateTimeText: {
		fontSize: 20,
		fontWeight: "600",
		color: "grey",
	},
	dateTimeButton: {
		borderWidth: 1,
		borderRadius: 10,
		marginTop: 5,
		marginLeft: 10,
		marginRight: 10,
		padding: 10,
	},
	roomHeader: {
		marginTop: 20,
		marginLeft: 5,
		marginRight: 5,
		flexDirection: "row",
	},
	roomDetails: {
		backgroundColor: "#d3d3d3",
		marginTop: 10,
		marginLeft: 15,
		marginRight: 15,
		borderWidth: 1,
		borderRadius: 10,
	},
	roomNameText: {
		fontSize: 20,
		fontWeight: "bold",
	},
	availabilityText: {
		fontSize: 16,
		fontStyle: "italic",
		flex: 1,
		textAlign: "right",
	},
})
