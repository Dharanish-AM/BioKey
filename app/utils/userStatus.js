import AsyncStorage from "@react-native-async-storage/async-storage";

export const loginUser = async () => {
  try {
    const isNew = await AsyncStorage.getItem("isNew");

    if (isNew === null) {
      await AsyncStorage.setItem("isNew", "false");
    }

    await AsyncStorage.setItem("isLoggedIn", "true");
  } catch (error) {
    console.log("Error logging in:", error);
  }
};

export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem("isLoggedIn");
    await AsyncStorage.removeItem("isNew");
    console.log("User logged out successfully");
  } catch (error) {
    console.log("Error logging out:", error);
  }
};

//loginUser()
//logoutUser();

export const checkUserStatus = async () => {
  try {
    const isNew = await AsyncStorage.getItem("isNew");

    if (isNew === null) {
      return { isUserLoggedIn: false, isNewUser: true };
    } else {
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      return { isUserLoggedIn: isLoggedIn === "true", isNewUser: false };
    }
  } catch (error) {
    console.error("Error retrieving user status:", error);
    return { isUserLoggedIn: false, isNewUser: false };
  }
};
