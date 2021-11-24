#! /usr/bin/env node
import main from '../lib/azure-manager.js';

await main.init();
process.exit(0);