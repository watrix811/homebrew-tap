#!/usr/bin/env node
'use strict';

// Thin launcher so the server can be started via `npx claude-remote` or a
// globally linked bin. All real logic lives in server/index.js.
require('../server/index.js');
