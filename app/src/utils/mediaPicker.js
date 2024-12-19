import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";

export const pickMedia = async (type) => {
  try {
    let pickerResult;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access media library is required!");
      return null;
    }

    switch (type) {
      case "image":
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          quality: 1,
        });
        break;

      case "video":
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["videos"],
          allowsMultipleSelection: true,
          quality: 1,
        });
        break;

      case "audio":
        pickerResult = await DocumentPicker.getDocumentAsync({
          type: "audio/*",
          multiple: true,
        });
        if (pickerResult.type !== "success") {
          console.log("No audio files selected");
          return null;
        }
        break;

      case "document":
        pickerResult = await DocumentPicker.getDocumentAsync({
          type: "*/*",
          multiple: true,
        });
        if (pickerResult.type !== "success") {
          console.log("No documents selected");
          return null;
        }
        break;

      default:
        console.log("Unsupported media type");
        return null;
    }

    if (pickerResult.canceled) {
      console.log("Picker was cancelled");
      return null;
    }

    if (type === "image" || type === "video") {
      console.log("Picked files:", pickerResult.assets);
      return pickerResult.assets.length === 1
        ? pickerResult.assets[0]
        : pickerResult.assets;
    }

    console.log("Picked files:", pickerResult.files || [pickerResult]);
    return pickerResult.files || [pickerResult];
  } catch (error) {
    console.error("Error picking media:", error);
    return null;
  }
};
