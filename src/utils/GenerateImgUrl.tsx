// utils/GenerateImgUrl.ts
import { localhostBaseUrl } from "../apiServices/baseUrl/BaseUrl";

/**
 * Generates full image URL from profile image name or partial path
 * @param imgLink - e.g. "1747952819261-977132953.jfif" or full path
 * @returns string - full URL like http://localhost:8000/uploads/eSignatures/xxx.jfif
 */
const generateImgUrl = (imgLink: string): string => {
    if (!imgLink || imgLink === "null") return "";
    const fileName = imgLink.split("/").pop(); // Safely get the file name
    return `${localhostBaseUrl}uploads/eSignatures/${fileName}`;
};

export default generateImgUrl;
