# spead
> ⚠️ *spead download* has an unhandled 410 exception with Youtube community flagged videos due [node-ytdl-core](https://github.com/fent/node-ytdl-core) limitations. See [#1009](https://github.com/fent/node-ytdl-core/issues/1009)
>
Export playlists from Spotify to .json and download tracks from Youtube.

## Installation
> **spead** requires [ffmpeg](https://ffmpeg.org/download.html) >= 0.9.
> Don't forget to update your path.

1. Clone this repo; 
2. ```$ cd spead && npm install```;
3. ```$ npm link```. You can now run *spead* globally.
> You can run ```$ npm unlink``` to remove *spead* from path.

### Spotify setup
1. Create a [new application](https://developer.spotify.com/dashboard/applications);
2. Copy *Client ID* and *Client Secret*;
3. ```$ spead set id <your_client_id>```;
4. ```$ spead set secret <your_client_secret>```;

## Usage
Export:
```
$ spead export <spotify_playlist_id> [options]
```

Download:
```
$ spead download <json_exported_playlist> [options]
```


### Options

```--out <dir>``` specifies where the .json file or playlist folder will be saved.
> Default is the current directory.


```--name <filename>``` specifies an output name for the .json file or playlist folder.
> Default is the playlist name.
