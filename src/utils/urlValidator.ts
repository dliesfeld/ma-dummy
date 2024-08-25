import HTTPService from "./httpService";
import config from "../config.json" assert { type: "json" };
import { load } from "cheerio";

/**
 * This function check if the given  string a valid url
 * @param url
 * @returns true if valid
 */
const validateURL = (url: string) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol === "http:" || urlObj.protocol === "https:")
      return true;
    return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return false;
  }
};

/**
 * Connect to the google api and checked if the given urls are risky
 * @param urls to be validate
 * @returns all risky urls as array. Empty array = no risky urls
 */
const validateHTTP = async (urls: []) => {
  const httpService = new HTTPService(
    "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=",
  );
  try {
    const result: string[] = [];
    const response = await httpService.postJSON(config.google.api_key, {
      client: {
        clientId: "ma-backend-server",
        clientVersion: "1.5.2",
      },
      threatInfo: {
        threatTypes: ["UNWANTED_SOFTWARE", "MALWARE", "SOCIAL_ENGINEERING"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: urls
          .filter((entry: string) => validateURL(entry))
          .map((url: string) => {
            return {
              url,
            };
          }),
      },
    });
    // result is empty
    if (Object.keys(response).length === 0) return { result, err: null };
    if (Object.keys(response).includes("error"))
      return {
        result: null,
        err: { status: 500, message: response.error.message },
      };
    response["matches"].forEach((entry: { threat: { url: string } }) => {
      result.push(entry.threat.url);
    });

    // result contains urls
    return { result, err: null };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return { result: null, err: { status: err.status, message: err.message } };
  }
};

/**
 * Check if the given html content contains links (<a href>)
 * @param text html content as string
 * @returns all urls inside the html.Empty array = no links in html
 */
const containsUrl = (text: string): (string | undefined)[] => {
  const htmlDom = load(text);
  const urls: (string | undefined)[] = [];
  htmlDom("a").each((_, el) => {
    if (htmlDom(el) && htmlDom(el).attr("href")) {
      urls.push(htmlDom(el).attr("href"));
    }
  });
  return urls;
};

/**
 * Create the response for the client as an object.
 */
const createResponse = async (text: string, hasAttachment: boolean) => {
  const links = containsUrl(text);
  const mailInstance = {
    hasAttachment: false,
    hasWeblink: false,
    isUnsecure: false,
    unsecureLinks: [] as string[],
  };

  mailInstance.hasAttachment = hasAttachment;

  if (links.length === 0) {
    return { response: mailInstance, error: null };
  }

  mailInstance.hasWeblink = true;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { result, err } = await validateHTTP(links);

  if (err) {
    return { response: mailInstance, error: err };
  }
  mailInstance.unsecureLinks = result;
  return { response: mailInstance, error: null };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const destructMail = (mail: any) => {
  const content = mail.data.payload.parts;
  if (content[1] && content[1].mimeType === "text/html") {
    return {
      htmlMessage: Buffer.from(content[1].body.data, "base64").toString("utf8"),
      attachment: false,
    };
  }
  const result = {
    htmlMessage: "",
    attachment: false,
  };
  for (let i = 0; i < content.length; i++) {
    if (content[i].body.size > 0 && content[i].body.attachmentId) {
      result.attachment = true;
    }
    if (
      content[i].mimeType === "multipart/alternative" &&
      content[i].parts[1] &&
      content[i].parts[1].mimeType === "text/html"
    ) {
      result.htmlMessage = Buffer.from(
        content[i].parts[1].body.data,
        "base64",
      ).toString("utf8");
    }
  }
  return result;
};

export default validateHTTP;
export { containsUrl, createResponse, destructMail };
