import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";

export const pickMedia = async (type) => {
  try {
    let pickerResult;

    if (type === "image" || type === "video") {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access media library is required!");
        return null;
      }
    }

    switch (type) {
      case "image_video":
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images", "videos"],
          allowsMultipleSelection: true,
          quality: 1,
        });
        break;

      case "others":
        pickerResult = await DocumentPicker.getDocumentAsync({
          type: "*/*",
          multiple: true,
        });
        break;

      default:
        console.log("Unsupported media type");
        return null;
    }

    if (pickerResult.canceled) {
      console.log("Picker was cancelled");
      return "cancelled";
    }

    if (type === "image" || type === "video") {
      console.log("Picked files:", pickerResult.assets);
      return pickerResult.assets.length === 1
        ? pickerResult.assets[0]
        : pickerResult.assets;
    }

    console.log("Picked files:", pickerResult);
    return pickerResult;
  } catch (error) {
    console.error("Error picking media:", error);
    return null;
  }
};
