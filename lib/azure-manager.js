import { Command } from 'commander';
import prompts from 'prompts';
import RecipeManager from '../lib/recipe-manager.js';
import ConfigManager from '../lib/config-manager.js';

const azureManager = {
    loadParameters: async (config) => {
        const program = new Command();

        program
            .option('-s, --subscriptionId <name>', 'subscription id', config.subscriptionId)
            .option('-g, --resourceGroup <name>', 'resource group', config.resourceGroup)
            .option('-f, --fqdn <name>', 'fully qualified domain name to derive other parameters', config.fqdn)
            .option('-cs, --cdnSite <name>', 'cdn site name', config.cdnSite)
            .option('-co, --cdnOrigin <name>', 'cdn origin', config.cdnOrigin)
            .option('-l, --location <name>', 'fully qualified domain name to derive other parameters', config.location)
            .option('-a, --storageAccount <name>', 'storage account', config.storageAccount)
            .option('-p, --profile <name>', 'cdn profile name', config.cdnProfile)
            .option('-e, --endpoint <name>', 'cdn endpoint', config.cdnEndpoint)
            .option('-ss --storageSku <name>', 'storage sku', config.storageSku || 'Standard_RAGRS')
            .option('-sk --storageKind <name>', 'storage kind', config.storageKind || 'StorageV2')
            .option('-ug --userGroup <name>', 'user group', config.userGroup || 'cdn')
            .option('--cdnSku <name>', 'cdn sku', config.cdnSku || 'Standard_Microsoft')
            .option('--indexDoc <name>', 'index document', config.indexDocument || 'index.html')
            .option('--nonInteractive', 'non interactive mode')
            .option('--action <name>', 'action');

        program.parse(process.argv);

        return program.opts();
    },

    actions: [
        {
            title: 'Create static site and CDN profile',
            value: 'create-static-site',
            recipies: [
                "set-group-and-location",
                "create-storage-account",
                "create-cdn-profile",
                "role-assignment-storage",
                "role-assignment-cdn",
            ]
        },
        {
            title: 'Deploy static site',
            value: 'deploy-static-site'
        }
    ],

    createPromptConfig: function (config) {
        return [
            {
                type: 'text',
                name: 'subscriptionId',
                message: 'Azure subscription id',
                required: true,
                initial: config.subscriptionId
            },
            {
                type: 'text',
                name: 'resourceGroup',
                message: 'Azure resource group',
                required: true,
                initial: config.resourceGroup
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
                message: 'Target fully qualified domain name',
                required: true,
                initial: config.fqdn,
                onState: ({ value, aborted }) => {
                    if (!aborted) {
                        config.fqdn = value;
                    }
                }
            },
            {
                type: 'text',
                name: 'cdnSite',
                message: 'Azure site name',
                required: true,
                dependsOn: ['fqdn'],
                initial: function () {
                    return config.cdnSite || config.fqdn.split('.')[0];
                },
                onState: ({ value, aborted }) => {
                    if (!aborted) {
                        config.cdnSite = value;
                    }
                }
            },
            {
                type: 'text',
                name: 'storageAccount',
                message: 'Storage account name',
                required: true,
                dependsOn: ['cdnSite'],
                initial: function () {
                    return config.storageAccount || config.cdnSite.replace(/[^0-9A-Za-z]/g, '00');
                },
                onState: ({ value, aborted }) => {
                    if (!aborted) {
                        config.storageAccount = value;
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
                dependsOn: ['cdnSite'],
                initial: () => {
                    return config.cdnProfile || `${config.cdnSite}`;
                }
            },
            {
                type: 'text',
                name: 'cdnOrigin',
                message: 'CDN origin name',
                required: true,
                dependsOn: ['storageAccount'],
                initial: () => {
                    return config.cdnOrigin || `${config.storageAccount}.z13.web.core.windows.net`;
                }
            },
            {
                type: 'text',
                name: 'cdnEndpointName',
                message: 'CDN endpoint name',
                required: true,
                dependsOn: ['fqdn'],
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
                name: 'indexDocument',
                message: 'Index document',
                required: true,
                initial: config.indexDocument || 'index.html'
            },
            {
                type: 'text',
                name: 'userGroup',
                message: 'Group object id to give permission to',
                required: true,
                initial: config.userGroup || '',
            },
            {
                type: 'text',
                name: 'finalEndpoint',
                message: 'CDN endpoint',
                required: true,
                initial: () => {
                    return `https://${config.cdnEndpointName}.azureedge.net`;
                }
            }
        ];
    },

    init: async function () {
        const { actions } = this;
        const configManager = new ConfigManager({ basePath: './deploy' });
        configManager.load();

        let { nonInteractive, action, ...overrideConfig } = await this.loadParameters(configManager.config);

        if (!action && nonInteractive) {
            console.warn('No action specified in non-interactive mode. Aborting...');
            return;
        }

        const config = configManager.config;

        Object.assign(config, overrideConfig);

        if (!nonInteractive) {
            ({ action } = await prompts([
                {
                    type: 'select',
                    name: 'action',
                    message: 'Action',
                    choices: actions,
                    initial: action
                }
            ]));
        }

        const actionInfo = actions.find(a => a.value === action);
        if (!actionInfo) {
            console.warn(`Action ${action} not found. Aborting...`);
            return;
        }

        await this.generateRecipies({
            configManager,
            recipies: actionInfo.recipies || [action],
            promptConfig: this.createPromptConfig(config),
            nonInteractive,
        });
    },

    generateRecipies: async function ({ configManager, recipies, promptConfig, nonInteractive }) {
        const { config } = configManager;

        const recipeManager = new RecipeManager();
        await recipeManager.loadRecipes(recipies);

        // identify required tags
        const requiredTags = recipeManager.extractTags();

        // identify parent tags on which some of the tags may be dependent
        for (let index = promptConfig.length - 1; index >= 0; index--) {
            const promptItem = promptConfig[index];
            if (requiredTags.includes(promptItem.name) && promptItem.dependsOn) {
                for (const dependency of promptItem.dependsOn) {
                    if (!requiredTags.includes(dependency)) {
                        requiredTags.push(dependency);
                    }
                }
            }
        }

        // filter prompts based on recipe
        const requiredPrompts = promptConfig.filter(p => requiredTags.includes(p.name));

        if (nonInteractive) {
            // try to execute prompts behind the scenes
            for (const prompt of requiredPrompts) {
                const { name, initial, onState } = prompt;
                if (typeof initial === 'function') {
                    config[name] = await Promise.resolve(initial());
                } else {
                    config[name] = initial;
                }
                if (onState) {
                    await Promise.resolve(onState({ value: config[name], aborted: false }));
                }
            }
        } else {
            Object.assign(config, await prompts(requiredPrompts));
        }

        configManager.save();

        recipeManager.generate(configManager.config);
    }
};

export default azureManager;