import { Paging } from "spotify-types/typings/global";
import { PlaylistTrack } from "spotify-types/typings/playlist";

const AUTH_BASE_URL = "https://accounts.spotify.com/api/token";
const API_BASE_URL = "https://api.spotify.com/v1/playlists/";

const COUNT_OF_TRACKS = 50;

let accessToken = "";

/**
 * プレイリストをSyncする (GASのエントリーポイント)
 */
export const syncSpotify = (): void => {
  getAcsessToken();

  const playlist = fetchSourcePlaylist();

  if (playlist.items.length == 0) {
    throw new Error("Cannot fetch source playlist contents");
  }

  clearTargetPlaylist();

  updateTargetPlaylist(playlist);
};

/**
 * RefreshToken から AccessToken を取得する
 * @returns
 */
const getAcsessToken = () => {
  const token = Utilities.base64Encode(CLIENT_ID + ":" + CLIENT_SECRET);
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    headers: {
      Authorization: "Basic " + token,
    },
    payload: {
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    },
  };

  const fetchApiUrl = AUTH_BASE_URL;

  const response = UrlFetchApp.fetch(fetchApiUrl, options);

  const obj = JSON.parse(response.getContentText());
  return (accessToken = obj.access_token);
};

/**
 *  コピーもとのプレイリストを取得
 *
 * @returns プレイリスト
 */
const fetchSourcePlaylist = () => {
  // プレイリストの情報を取得
  const fetchApiUrl =
    API_BASE_URL + SOURCE_PLAYLIST_ID + "/tracks?limit=" + COUNT_OF_TRACKS;

  const playlist = requestHttp(fetchApiUrl) as Paging<PlaylistTrack>;

  return playlist;
};

/**
 * コピー先のプレイリストをクリア
 */
const clearTargetPlaylist = () => {
  // プレイリストの情報を取得
  const fetchApiUrl =
    API_BASE_URL + TARGET_PLAYLIST_ID + "/tracks?limit=" + COUNT_OF_TRACKS;

  const playlist = requestHttp(fetchApiUrl) as Paging<PlaylistTrack>;

  const deleteObj = {
    tracks: playlist.items.map((el) => {
      return {
        uri: el.track.uri,
      };
    }),
  };

  const clearApiUrl = API_BASE_URL + TARGET_PLAYLIST_ID + "/tracks";

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "delete",
    payload: JSON.stringify(deleteObj),
  };

  requestHttp(clearApiUrl, options);
};

/**
 * プレイリストのトラックを更新
 * @param playlist プレイリスト
 */
const updateTargetPlaylist = (playlist: Paging<PlaylistTrack>) => {
  const updateApiUrl = API_BASE_URL + TARGET_PLAYLIST_ID + "/tracks";

  const tracks = {
    uris: playlist.items.map((el) => {
      return el.track.uri;
    }),
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    payload: JSON.stringify(tracks),
  };

  requestHttp(updateApiUrl, options);
};

/**
 * HTTP リクエストを実施
 *
 * @param fetchApiUrl URL
 * @returns レスポンスのJSON
 */
const requestHttp = (
  fetchApiUrl: string,
  options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions
) => {
  const commonOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
  };

  const option = Object.assign({}, { ...commonOptions }, { ...options });

  const response = UrlFetchApp.fetch(fetchApiUrl, option);

  return JSON.parse(response.getContentText());
};
