import { View, Text, Image, Pressable, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from '../constants/colors';
import { Ionicons } from "@expo/vector-icons";
import Button from '../components/Button';
import { useForm, Controller } from "react-hook-form";

const Signup = ({ navigation }) => {
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const { control, watch, handleSubmit, formState: { errors } } = useForm();
    const pwd = watch('password');


    const [error, setError] = useState([])
    const onSignupPressed = async data => {
        try {
            const response = await axios.post('register', { email: data.email, password: data.password });
            console.log('User created: ', response.data);
            navigation.navigate("Login");
        } catch (err) {
            setError(err.response.data.errors)
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white, marginVertical: 50}}>
            <View style={{ flex: 1, marginHorizontal: 22 }}>
                <View style={{ marginVertical: 22 }}>
                    <Text style={{
                        fontSize: 22,
                        fontWeight: 'bold',
                        marginVertical: 12,
                        color: COLORS.black
                    }}>
                        Create Account
                    </Text>

                    <Text style={{
                        fontSize: 16,
                        color: 'red'
                    }}>{error?.message ? error.message: ''}</Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 400,
                        marginVertical: 8
                    }}>Email address</Text>
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                placeholder="Enter email"
                                onBlur={onBlur} 
                                onChangeText={onChange} 
                                value={value} 
                                placeholderTextColor={COLORS.black}
                                keyboardType='email-address'
                                autoCapitalize='none'
                                style={{
                                    width: "100%",
                                    height: 48,
                                    borderColor: COLORS.black,
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    paddingLeft: 22,
                                }}
                            />
                        )}
                        name="email"
                        rules={{ 
                            required: 'Email address is required', 
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                                message: 'Email is invalid'
                            }
                        }}
                    />
                    {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}
                </View>

                <View style={{ marginBottom: 12 }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 400,
                        marginVertical: 8
                    }}>Password</Text>

                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <TextInput
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder='Enter your password'
                                    placeholderTextColor={COLORS.black}
                                    secureTextEntry={!isPasswordShown}
                                    style={{
                                        width: "100%",
                                        height: 48,
                                        borderColor: COLORS.black,
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        paddingLeft: 22
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordShown(!isPasswordShown)}
                                    style={{
                                        position: "absolute",
                                        right: 12,
                                        top: 12
                                    }}
                                >
                                    <Ionicons name={isPasswordShown ? "eye-off" : "eye"} size={24} color={COLORS.black} />
                                </TouchableOpacity>
                            </View>
                        )}
                        name="password"
                        rules={{ 
                            required: 'Password is required', 
                            minLength: {
                                value: 3, 
                                message: 'Password should be minimum of 3 characters long'
                            } 
                        }}
                    />
                    {errors.password && <Text style={{ color: 'red' }}>{errors.password.message}</Text>}
                </View>

                <View style={{ marginBottom: 12 }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: '400',
                        marginVertical: 8
                    }}>Confirm your Password</Text>

                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <TextInput
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder='Confirm your password'
                                    placeholderTextColor={COLORS.black}
                                    secureTextEntry={!isPasswordShown}
                                    style={{
                                        width: "100%",
                                        height: 48,
                                        borderColor: COLORS.black,
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        paddingLeft: 22
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordShown(!isPasswordShown)}
                                    style={{
                                        position: "absolute",
                                        right: 12,
                                        top: 12
                                    }}
                                >
                                    <Ionicons name={isPasswordShown ? "eye-off" : "eye"} size={24} color={COLORS.black} />
                                </TouchableOpacity>
                            </View>
                        )}
                        name="repeat-password"
                        rules={{ 
                            validate: value => value === pwd || 'Passwords do not match'
                        }}
                    />
                    {errors['repeat-password'] && <Text style={{ color: 'red' }}>{errors['repeat-password'].message}</Text>}
                </View>


                <View style={{
                    flexDirection: 'row',
                    marginVertical: 6
                }}>
                 

                    
                </View>

                <Button
                    title="Sign Up"
                    filled
                    style={{
                        marginTop: 18,
                        marginBottom: 4,
                    }}
                    onPress={handleSubmit(onSignupPressed)}
                />  

                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                    <View
                        style={{
                            flex: 1,
                            height: 1,
                            backgroundColor: COLORS.grey,
                            marginHorizontal: 10
                        }}
                    />
                    <Text style={{ fontSize: 14 }}></Text>
                    <View
                        style={{
                            flex: 1,
                            height: 1,
                            backgroundColor: COLORS.grey,
                            marginHorizontal: 10
                        }}
                    />
                </View>
                
                <View style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    
                }}>
                    <Text style={{ fontSize: 16, color: COLORS.black }}>Already have an account</Text>
                    <Pressable
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={{
                            fontSize: 16,
                            color: COLORS.primary,
                            fontWeight: "bold",
                            marginLeft: 6
                        }}>Login</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Signup