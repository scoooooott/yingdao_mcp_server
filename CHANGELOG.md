# Changelog

All notable changes to this project will be documented in this file.

## v0.0.3
- Added
  - Full "My Apps" listing (not limited to `_Release`).
  - `runApp` supports passing arguments.
  - SSE/HTTP mode with default endpoint `http://localhost:3000/sse`.
- Changed
  - Package and CLI renamed to `yingdao-mcp-server-community`; published on npm.
  - App parameters now fetched via platform Open API (replaces encrypted flow parsing).
  - README reorganized for MCP users and developers; examples updated.
  - Repository metadata updated (`repository/bugs/homepage`).
- Fixed
  - i18n error keys corrected; `robotUuid` required validation.
- Migration
  - npx: `yingdao-mcp-server` → `yingdao-mcp-server-community`.
  - STDIO: `yingdao-mcp-server-community`.
  - SSE/HTTP: `yingdao-mcp-server-community --server`.
  - Environment variables unchanged: `RPA_MODEL`, `SHADOWBOT_PATH`, `USER_FOLDER`, `ACCESS_KEY_ID`, `ACCESS_KEY_SECRET`, `SERVER_PORT`, `LANGUAGE`.