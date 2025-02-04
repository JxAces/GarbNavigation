import { View, Text, TextInput, TouchableOpacity, Pressable, Image } from 'react-native';
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import Button from "../components/Button";
import { useForm, Controller } from "react-hook-form";

const Login = ({ navigation }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm();

  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    setError(null);
  
    try {
      const response = await fetch('http://192.168.1.9:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        console.log('Login Successful', result);
  
        if (result.role === 'admin') {
          navigation.navigate("AdminScreen");
        } else {
          navigation.navigate("UserScreen");
        }
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong, please try again later.');
      console.error(err);
    }
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, marginHorizontal: 22 }}>
        <View style={{ marginVertical: 22 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginVertical: 12, color: COLORS.black }}>
            Hi Welcome Back ! 👋
          </Text>
          <Text style={{ fontSize: 16, color: COLORS.black }}>
            Hello again you have been missed!
          </Text>
        </View>

        {error && <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>}

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: 400, marginVertical: 8 }}>Email address</Text>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email address is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                message: "Email is invalid",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                onChangeText={onChange}
                value={value}
                placeholder="Enter your email address"
                placeholderTextColor={COLORS.black}
                keyboardType="email-address"
                style={{
                  width: "100%",
                  height: 48,
                  borderColor: COLORS.black,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingLeft: 22,
                }}
              />
            )}
          />
          {errors.email && <Text style={{ color: "red" }}>{errors.email.message}</Text>}
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: 400, marginVertical: 8 }}>Password</Text>
          <Controller
            control={control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.black}
                  secureTextEntry={!isPasswordShown}
                  style={{
                    width: "100%",
                    height: 48,
                    borderColor: COLORS.black,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingLeft: 22,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordShown(!isPasswordShown)}
                  style={{ position: "absolute", right: 12, top: 12 }}
                >
                  <Ionicons name={isPasswordShown ? "eye-off" : "eye"} size={24} color={COLORS.black} />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && <Text style={{ color: "red" }}>{errors.password.message}</Text>}
        </View>

        <View style={{ flexDirection: "row", marginVertical: 6 }}>
          <Checkbox
            style={{ marginRight: 8 }}
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? COLORS.primary : undefined}
          />
          <Text>Remember Me</Text>
        </View>

        <Button
          title="Login"
          filled
          style={{ marginTop: 18, marginBottom: 4 }}
          onPress={handleSubmit(onSubmit)}
        />

        {/* Don't have an account */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 22 }}>
          <Text style={{ fontSize: 16, color: COLORS.black }}>Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate("Signup")}>
            <Text style={{ fontSize: 16, color: COLORS.primary, fontWeight: "bold", marginLeft: 6 }}>
              Register
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;
