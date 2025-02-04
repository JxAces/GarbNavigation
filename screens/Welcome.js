import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'
import COLORS from '../constants/colors';
import Button from '../components/Button';

const Welcome = ({ navigation }) => {   

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: COLORS.white
            }}
        >
            <View style={{ flex: 1 }}>
                <View style={{justifyContent: 'center', alignItems: 'center',  height: '100%'}}>
                    <Image
                            source={require("../assets/logo1.png")}
                            style={{
                                position: "absolute",
                                top: "20%"
                            }}
                        />
                </View>

                {/* content  */}

                <View style={{
                    paddingHorizontal: 22,
                    position: "absolute",
                    top: "60%",
                    width: "100%"
                }}>                    

                    <Button
                        title="Sign up"
                        onPress={() => navigation.navigate("Signup")}
                        filled
                        style={{
                            marginTop: 22,
                            width: "100%"
                        }}
                    />

                    <View style={{
                        flexDirection: "row",
                        marginTop: 12,
                        justifyContent: "center"
                    }}>
                        <Text style={{
                            fontSize: 16,
                            color: COLORS.primary
                        }}>Already have an account ?</Text>
                        <Pressable
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text style={{
                                fontSize: 16,
                                color: COLORS.primary,
                                fontWeight: "bold",
                                marginLeft: 4
                            }}>Login</Text> 
                        </Pressable>

                    </View>
                </View>
            </View>
        </View>
    )
}

export default Welcome