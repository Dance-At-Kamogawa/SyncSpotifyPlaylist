export default class Env {
  // Spotify APIの client_id, client_secret
  static readonly CLIENT_ID = "";
  static readonly CLIENT_SECRET = "";

  // Spotify API の access_token を取得する時に使用する refresh_token
  static readonly REFRESH_TOKEN = "";

  // 同期元のプレイリストID
  static readonly SOURCE_PLAYLIST_ID = "";

  // 同期先のプレイリストID
  static readonly TARGET_PLAYLIST_ID = "";
}
