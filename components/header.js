import React from "react";
import {StyleSheet, Text, View} from "react-native";
import { Ionicons } from '@expo/vector-icons'; 

export default function Header({ title, iconName, iconPressedFn }) {
    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.headerText}> {title} </Text>
            </View>
            <Ionicons style={styles.icon} name={iconName} onPress={iconPressedFn} size={24} color="black" />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 5,
        paddingBottom: 5,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 20,
        fontWeight: '400'
    },
    icon: {
        position: 'absolute',
        justifyContent: 'center',
        right: 15
    }
});