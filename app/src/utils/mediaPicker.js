import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";

export const pickMedia = async (type) => {
  try {
    let pickerResult;

    if (type === "image" || type === "video" || type === "image_video") {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access media library is required!");
        return null;
      }
    }

    switch (type) {
      case "image":
      case "video":
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: type === "image" ? ["images"] : ["videos"],
          allowsMultipleSelection: true,
          quality: 1,
        });
        break;

      case "image_video":
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
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

    const assets = pickerResult.assets || [];
    const images = assets.filter(
      (asset) => asset.type === "image" || asset.type.startsWith("image/")
    );
    const videos = assets.filter(
      (asset) => asset.type === "video" || asset.type.startsWith("video/")
    );

    if (type === "image" || type === "video") {
      return type === "image" ? images : videos;
    }

    if (type === "image_video") {
      return { images, videos };
    }

    return pickerResult;
  } catch (error) {
    console.error("Error picking media:", error);
    return null;
  }
};
