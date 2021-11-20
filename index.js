import fs from 'fs-extra';
import template from './template.js';
import prompts from 'prompts';

let config = {};

const configFiles = ['config', 'config.override'];

for(const configFile of configFiles) {
    const configFilename = `./${configFile}.json`;
    if(fs.existsSync(configFilename)) {
        Object.assign(config, fs.readJsonSync(configFilename));
    }
}

const overrideConfig = await prompts([
    {
        type: 'text',
        name: 'subscriptionId',
        message: 'Azure subscription id',
        required: true,
        initial: config.subscriptionId
    },
    {
        type: 'text',
        name: 'resource_group',
        message: 'Azure resource group',
        required: true,
        initial: config.resource_group
    },
    {
        type: 'text',
        name: 'location',
        message: 'Azure location',
        required: true,
        initial: config.location || 'eastus'
    },
    {
        type: 'text',
        name: 'fqdn',
        message: 'Target site name',
        required: true,
        initial: config.fqdn || 'dev-dashboard.coolrgroup.com',
        onState: ({ value, aborted }) => {
            if(!aborted) {
                config.fqdn = value;
            }
        }
    },
    {
        type: 'text',
        name: 'site_name',
        message: 'Azure site name',
        required: true,
        initial: function() {
            return config.site_name || config.fqdn.split('.')[0];
        },
        onState: ({ value, aborted }) => {
            if(!aborted) {
                config.site_name = value;
            }
        }
    },
    {
        type: 'text',
        name: 'storage_account_name',
        message: 'Storage account name',
        required: true,
        initial: function() {
            return config.storage_account_name || config.site_name.replace(/[^0-9A-Za-z]/g, '00');
        },
        onState: ({ value, aborted }) => {
            if(!aborted) {
                config.storage_account_name = value;
            }
        }
    },
    {
        type: 'text',
        name: 'storageSku',
        message: 'Storage account sku',
        required: true,
        initial: config.storageSku || 'Standard_RAGRS'
    },
    {
        type: 'text',
        name: 'storageKind',
        message: 'Storage account type',
        required: true,
        initial: config.storageKind || 'StorageV2',
    },
    {
        type: 'text',
        name: 'cdnProfile',
        message: 'CDN profile name',
        required: true,
        initial: () => {
            return config.cdnProfile || `${config.site_name}`;
        }
    },
    {
        type: 'text',
        name: 'cdnOrigin',
        message: 'CDN origin name',
        required: true,
        initial: () => {
            return config.cdnOrigin || `${config.storage_account_name}.z13.web.core.windows.net`;
        }
    },
    {
        type: 'text',
        name: 'cdnEndpointName',
        message: 'CDN endpoint name',
        required: true,
        initial: () => {
            return config.cdnEndpointName || config.fqdn.replace(/[^0-9A-Za-z]/g, '-');
        }
    },
    {
        type: 'text',
        name: 'cdnSku',
        message: 'CDN endpoint sku',
        required: true,
        initial: config.cdnSku || 'Standard_Microsoft'
    },
    {
        type: 'text',
        name: 'index_document',
        message: 'Index document',
        required: true,
        initial: config.index_document || 'index.html'
    },
    {
        type: 'text',
        name: 'groupObjectId',
        message: 'Group object id to give permission to',
        required: true,
        initial: config.groupObjectId || '',
    }
]);

Object.assign(config, overrideConfig);

fs.writeJsonSync(`./config.override.json`, config, { spaces: 2 });

config.finalEndpoint = `${config.cdnEndpointName}.azureedge.net`;

const recipes = [
    "set-group-and-location",
    "create-storage-account",
    "create-cdn-profile",
    "role-assignment-storage",
    "role-assignment-cdn"
];

const templateFormat = /\$((\w+)\.)?(\w+)/g;


for (const recipe of recipes) {
    const recipe_path = `./recipes/${recipe}.txt`;
    const content = fs.readFileSync(recipe_path, 'utf8');
    console.log(template.replaceTags(content, config, { keepMissingTags: true, template: templateFormat }));
}