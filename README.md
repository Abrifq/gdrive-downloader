# Google Drive Public File Downloader

Open Google Drive.
Upload a file.
Right click the file, make it viewable with anyone with a link, copy the link to your program and *voilà!*
You can now use the file stored in Google Drive in your program/site -- with the help of this tiny library!

## Usage

The library is written as an ES6 module.

```js
import gDriveDownloader from "gdrive-downloader/index.js";

const links = {
    catPic: "https://drive.google.com/file/d/totes_real_cat_link/view?usp=share_link"
};

gDriveDownloader(links.catPic)
.then(fetch)
.then(rsp=>rsp.blob())
.then(showDialogWithImgBlob)
.catch(logger.error);
```

## Notes

### File Link

Make sure the link passed is **at least viewable** by **anyone with the link**.
Otherwise Google Drive will just redirect downloading it since the library itself doesn't supply any credentials by default.

### Errors and being outdated

*On cases the library can't handle, the library will return an empty string.*

Since the intended usage is directly feeding it to `fetch` - which throws on invalid urls like empty strings,
you can just `catch` at the end of the promise chain.

However, if you just `await` it, you can use `if(url.length == 0)` to determine if the fetching has failed.

### How it works

The library first gets the file ID from the file link, then uses it to make a download *start* link, and uses it to get the **actual** download link.

By utilizing the [manual redirect mode of fetch](https://fetch.spec.whatwg.org/#concept-request-redirect-mode), the library can see if the download needs a confirmation due to "virus scan fails".

If it passes the scan, Drive redirects us to the file link.
Since we stop at the first redirect, the developer can choose to download the file later.

If it fails the scan, the library extracts the confirmation link from the page -- which just redirects you to the file upon requesting it.

If it fails with an unknown status code due to not existing (404 Not Found) or something else like spam (429 Too Many Requests), the library will just return an empty string and log the file ID and status code to the console.
