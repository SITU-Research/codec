<img src="codec white on black logo cropped center.png" alt="SITU Research and Codec logos">

Codec is a collaborative tool for managing video evidence.

A response to the deluge of visual information flowing out of conflict environments and contested events, Codec is designed to support the work of researchers, journalists, legal teams, activist groups and others in adjacent fields. While the tool has many potential applications, the driving goal has been to further investigations, amplify truth, and pursue accountability for human rights abuses. The interface is a modular system split into three components: a timeline, a map, and a media player that allows users to securely synthesize large data sets of multimedia assets across the time and space of an event or series of events.

Codec originally emerged as a byproduct of attempting to solve recurring challenges in our investigative workflows—issues around collaboration, rapid visualization, and the management of video evidence. While the amount of user generated content has increased exponentially in recent years, managing the sheer volume of material can become inefficient at best and, often, simply prohibitive. Codec is designed to make this process collaborative, streamlined, efficient and intuitive. Research and development for Codec unfolded across various cases of differing scales, and through collaborating with partners, including: Amnesty International, UC Berkeley's Human Rights Center, Columbia Law School’s Human Rights Initiative, Human Rights Watch, UNITAD and many more.


Our goal with releasing this tool open-source is two fold: <br>
\- to make it easily accessible for folks doing similar work <br>
\- to open it up to others in similar fields with software development skills to build a shared tool

You can learn more about the project on [our website [UPDATE WITH LINK]](https://www.situ.nyc/research/codec).

***

## Tables of contents

1. [General Instructions (no code)](#general-instructions-no-code)
2. [Instructions for developers](#instructions-for-developers)
3. [Troubleshooting](#troubleshooting)
4. [Contributing](#contributing)

***

## General instructions (no code)

We have strived to make Codec as easy as possible to use, especially for folks with no coding experience. You'll need 4 things to setup a Codec instance: **your media files**, **a googlesheet**, **a google service account**, and **a deployed instance of this repository** (more details on each below).

### 1. A folder with your media files

You will need a folder with all your media assets, each named as their [UAR (unique asset reference) + file extension]. This folder can be a local folder containing the files, or can be a mounted drive as is possible with Google Drive, OneDrive, Tresorit (for maximum security) or any other cloud storage service that has a similar local drive mount feature. (If you choose this option, make sure that, in the Platform config sheet, 'Source of media files' is set to 'local'.)

<details>

<summary>Another media file storage solution (click to expand) </summary>

Another media file storage solution is to use a cloud storage service such as Amazon Web Services’ S3. After having uploaded the necessary files to an S3 bucket and the necessary url links filled in the spreadsheet, any user with access to the platform can then play the files without needing a local copy or a local drive streaming solution. It thus makes public dissemination easier. However, it is slightly more technically difficult to set up and is not as secure. (If you choose this option, make sure that, in the Platform config sheet, 'Source of media files' is set to 'url'.)
</details>

If you already have a spreadsheet with UARs and links, we recommed using Amnesty Citizen Evidence Lab's [Online Video Wrangler](https://citizenevidence.org/2021/03/25/online-video-wrangler/) to automatically download all the media files.

### 2. A googlesheets document

Next you will need a properly set up googlesheet. A template is available [here](https://docs.google.com/spreadsheets/d/1gUMlUpOvRWUkG10lkWk8zebtmkzK9R0Azv6inve94h4/edit?usp=sharing) - feel free to duplicate and fill it with your own information. The template includes data validation on important cells to verify that the manually inputted value's format matches the expected format (e.g. time in HH-MM-SS format). More on the expected format below.

Importantly, make sure that this googlesheets document is shared with the google service account you create in the next step. In step [4](#4-a-deployed-version-of-codec), you will need your googlesheet document id, which is in the url `https://docs.google.com/spreadsheets/d/YOUR SPREADSHEET ID IS HERE/edit#gid=0` as per this [documentation](https://developers.google.com/sheets/api/guides/concepts)



<details>

<summary>
Detailed googlesheet format requirements (click to expand)
</summary>

Codec expects a googlesheet with the following characteristics:


<details>

<summary>
- A tab named 'Platform config' with the following rows:
</summary>

- **Map start latitude**: the center latitude where the map loads, in decimal format e.g. 40.806
- **Map start longitude**: the center longitude where the map loads, in decimal format e.g. -73.920
- **Map start zoom**: the initial zoom level where the map loads, in decimal format e.g. 16
- **Timeline begin datetime**: the date and time when the timeline begins, in YYYY-MM-DD HH-MM-SS format e.g. 2020-06-04 19:56:00
- **Timeline end datetime**: the date and time when the timeline ends, in YYYY-MM-DD HH-MM-SS format e.g. 2020-06-04 20:06:00
- **Source of media files**: where to load the media files from, either 'local' to prompt the user to select them from their machine or 'url' to indicate the files should be loaded from their link
- **Title of tab with media assets**: the name of the tab containing information about the media assets, e.g. 'media assets'
- **Title of tab with events**: the name of the tab containing information about the events, e.g. 'events'
- **Title of column used for chronolocation**: within the media assets tab, name of the column used to locate assets on the timeline, e.g. 'Chronolocation (YYYY-MM-DD HH:MM:SS)'
- **Title of column used for duration**: within the media assets tab, name of the column used to draw the duration of assets on the timeline, e.g. 'Asset duration (HH:MM:SS)'
- **Title of column used for latitude**: within the media assets tab, name of the column with latitude used to locate assets on the map, e.g. 'Latitude (decimal)'
- **Title of column used for longitude**: within the media assets tab, name of the column with longitude used to locate assets on the map, e.g. 'Longitude (decimal)'
- **Title of column used for url**: within the media assets tab, if 'Source of media files' set to 'url, name of the column with the link to the media file
- **Rank of assets row with column names**: within the media assets tab, which row contains the column names, e.g. if it's in the second row from the top, write '2'
- **Rank of events row with column names**: within the events tab, which row contains the column names, e.g. if it's in the first row from the top, write '1'
</details>

<details>

<summary>
- A tab with details on the media assets, with the following characteristics:
</summary>

- the first column should be the UAR (Unique Asset Reference) an alphanumeric code that is unique to each media asset, e.g. 'bx010'
- to the right of all the column, there should be a column with some content such that Codec can read all the data, e.g. in cell AH 1 in the template: 'END'
- a column to indicate asset chronolocation
- a column to indicate asset latitude
- a column to indicate asset longitude
- if using cloud hosted media files, a column to indicate asset file link
- column with boolean (i.e. true/false) values will be automatically filterable in the Codec user interface. We recommend using checkboxes to avoid typos (select whole column below column name, Insert > Checkbox)
</details>


<details>

<summary>
- A tab with details on the events to mark vertical lines on the timeline (can be empty), with the following characteristics:
</summary>

- a column titled 'Datetime (YYYY-MM-DD HH:MM:SS)': to indicate where to draw the event on the timeline, e.g. '2020-06-04 20:00:00'
- a column titled 'Event': text describing the event, e.g. 'Curfew goes into effect'
</details>


</details>



### 3. A google service account

You will need to enable the Google sheets API and create a Google service account to authorize Codec to read your googlesheet. This process is slightly more technical but relatively straightforward for non-coders. The instruction below are paraphrased from the [documentation](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication) of the [google-spreadsheet library](https://theoephraim.github.io/node-google-spreadsheet/) used in this project:


<details>

<summary>
1. Enabling the Sheets API (click to expand)
</summary>

1. Go to the [Google Developers Console](https://console.cloud.google.com/)
2. Select your project or create a new one (and then select it)
3. In the sidebar on the left, select APIs & Services > Library
4. Search for "sheets"
5. Click on "Google Sheets API"
6. Click the blue "Enable" button

</details>



    
<details>

<summary>
2. Creating the google service account (click to expand)
</summary>

1. Select your project in the [Google Developers Console](https://console.cloud.google.com/)
2. In the sidebar on the left, select APIs & Services > Credentials
3. Click blue "+ CREATE CREDENTIALS" and select "Service account" option
4. Enter name, description, click "CREATE"
5. You can skip permissions, click "CONTINUE"
6. Click "+ CREATE KEY" button
7. Select the "JSON" key type option
8. Click "Create" button > your JSON key file is generated and downloaded to your machine. Make sure to keep this file, it is the only copy and you will need it to deploy the platform to Netlify.
9. Click "DONE"

</details>

Once you have a google service account, share the googlesheets document you created above with the google service account email shown in the JSON file (which you can open with any text editor).

You will also need the information in the JSON file in the following step.


### 4. A deployed version of Codec

Finally, you will need to deploy a customized Codec instance. For this you will need the JSON file you created in step [3](#3-a-google-service-account), a (free) Github account, a (free) Netlify account, and a (free) Mapbox account to get your public access token (visible in your [account page](https://account.mapbox.com/)). With these in hand, you can deploy Codec without any coding with the button below. It will prompt you to create a free Netlify account if you don't already have one.

When prompted, fill in the following environment variables:
- GOOGLE_SHEET_ID: your googlesheet document id
- GOOGLE_SERVICE_ACCOUNT_EMAIL: your google service account email address
- GOOGLE_CLIENT_PRIVATE_KEY: your google service account private key
- MAPBOX_ACCESS_TOKEN: your mapbox access token

[![Deploy to netlify button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/SITU-Research/codec)



***

## Instructions for developers

For development, clone or fork the repository and make sure to use the netlify cli to run the app, in order to simulate the netlify function that fetches the googlesheet document data. By default, the netlify cli will look for an .env file with the same environemnt variables as above.

```
git clone https://github.com/SITU-Research/codec
cd codec
npm i
touch .env
netlify dev
```


***

## Troubleshooting 

If your deployed Codec tool is not displaying properly, here is a short list of potential symptoms and solutions.


#### Symptom: The tool displays an error message on load.
#### Potential solutions:
- Ensure the googlesheet document id is correctly inputted into Netlify. You can change it by navigating to [Netlify](https://app.netlify.com/), selecting your site > Site Settings > Build & deploy > Environment > Edit variables and changing the value of GOOGLE_SHEET_ID.
- Ensure the google service account email is correctly inputted into Netlify. You can change it as above.
- Ensure the google service account email is shared with the googlesheets document.


<br>

#### Symptom: The tool loads without error but no media appears on the timeline and/or map
#### Potential solutions:
- Ensure you have correctly formatted the fields in the googlesheet.
- Ensure timeline/map are correctly centered and zoomed to your media files chrono- and geo-location.

<br>

#### Symptom: The map is not loading correctly
#### Potential solutions:
- Ensure the mapbox access token is correctly inputted into Netlify. You can change it by navigating to [Netlify](https://app.netlify.com/), selecting your site > Site Settings > Build & deploy > Environment > Edit variables and changing the value of MAPBOX_ACCESS_TOKEN

<br>

#### Symptom: The media are not displaying correctly
#### Potential solutions:
- Ensure the media files are name.d by their UAR


Disclaimer: We won't be able to troubleshoot with all Codec users directly. We encourage folks who come up against hurdles to create an issue on this repository, tag it with the **'user help needed'** label, and help one another out.

***

## Contributing

If you are interesting in contributing, thank you! Please take a look at the issues for bugs, enhancements etc to see what would be most helpful. Then fork the repo, create a pull request and we will integrate as soon as possible. Examples of useful contributions include: synced media playback, display of images and other media types, flexibility to use other spreadsheet sources such as Excel or OneDrive.