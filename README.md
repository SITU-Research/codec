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
<br>

If you already have a spreadsheet with UARs and links, we recommed using Amnesty Citizen Evidence Lab's [Online Video Wrangler](https://citizenevidence.org/2021/03/25/online-video-wrangler/) to automatically download all the media files.

### 2. A googlesheets document

Next you will need a properly set up googlesheet
- columns
- platform config sheet
- shared with the google service account you create below
- requirements 'Platform config' sheet with the following columns...
- first column should not be empy for any row (e.g. have it be the uar)
- should have a non empty column header after all meaningful columns

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

<br>

### 4. A deployed version of Codec

You can deploy Codec without any coding with the button below. It will prompt you to create a free Netlify account if you don't already have one.


fill in necessary env variables on netlify ui
will need to create Mapbox account too.

[![Deploy to netlify button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/SITU-Research/codec)


## Instructions for developers

```
git clone https://github.com/SITU-Research/codec
npm i
touch .env
netlify dev
```


***

## Troubleshooting 

If your deployed Codec tool is not displaying properly, here is a short list of potential symptoms and solutions.


#### Symptom: The tool displays an error message on load.
#### Potential solutions:
- 

<br>

#### Symptom: The tool loads without error but no media appears on the timeline and/or map
#### Potential solutions:
- make sure you have correctly formatted
- make sure timeline/map is correctly scoped

<br>

#### Symptom: The map is not loading correctly
#### Potential solutions:
- mapbox token

<br>

#### Symptom: The media are not displaying correctly
#### Potential solutions:
- media files named properly


Disclaimer: We won't be able to troubleshoot with all Codec users directly. We encourage folks who come up against hurdles to create an issue on this repository, tag it with the **'user help needed'** label, and help one another out.

***

## Contributing