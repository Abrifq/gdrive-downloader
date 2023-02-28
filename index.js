/**
 * @module gdrive-downloader
 * @fileoverview The library for getting a download link to the public Google Drive files.
 */

const HTTP_STATUS_CONFIRMATION_NEEDED = 200;
const HTTP_STATUS_PROCEED_TO_DOWNLOAD = 303;


const fileIDRegex = /\/d\/(.+?)\//; //basically anything starting after the "/d/" until the next slash.

/**
 * @param {string} fileID
 */
const downloadLinkMaker = (fileID) => `https://drive.google.com/uc?id=${fileID}&export=download`; //normally the download link is made with "/u/0/uc" but by using "/uc" we save a redirect.

const confirmDownloadPageLinkRegex = /action="(.+?)"/;

/**
 * Gets the "continue anyway" link when the virus scan "fails". See {@link confirmDownloadPageLinkRegex the link extractor}.
 * @param {string} confirmationPageContents
 */
const extractRealDownloadLink = confirmationPageContents => decodeURI(confirmDownloadPageLinkRegex.exec(confirmationPageContents)?.[1] ?? "");

/**
 * Tries to get the file id from the file url. See {@link fileIDRegex the file id extractor}.
 * @param {string} fileLink
 */
export function fileIDExtractor(fileLink) { return fileIDRegex.exec(fileLink)?.[1] ?? ""; }

/**
 * Tries to get a download link to the {@link fileLink file}.
 * @param {string} fileLink Make sure the file is accessible for anyone with a link.
 *
 * Well, because we are the "anyone".
 */
export default async function getFileDownloadFromFileLink(fileLink) {
    return getDownloadLinkFromID(fileIDExtractor(fileLink));
}

/**
 * @param {string} fileID
 */
export async function getDownloadLinkFromID(fileID) {
    if (typeof fileID !== "string" || fileID.length === 0)
        return "";

    const downloadStartLink = downloadLinkMaker(fileID);

    //redirect:manual allows us to stop on any redirects -- that's useful because we want to grab the link and not download the files immediately.
    const startingResponse = await fetch(downloadStartLink, { redirect: "manual" });

    switch (startingResponse.status) {

        case HTTP_STATUS_CONFIRMATION_NEEDED:
            return extractRealDownloadLink((await startingResponse.text()));

        case HTTP_STATUS_PROCEED_TO_DOWNLOAD:
            return startingResponse.headers.get("Location") ?? "";

        default:
            console.log(`Getting download link for file with id "${fileID}" failed with status code ${startingResponse.status}. Please make sure the file is public.`);
            return ""
    }
}