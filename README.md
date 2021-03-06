# Purpose

Various helper methods for az cli

# Pre-requisites

Azure CLI

# Installation

yarn add azure-utils -g

# Usage

Notes:
- Application stores the values for reuse in a sub-folder called deploy for reuse
- You can create a config.json in deploy folder with values for some common configurations such as subscriptionId, userGroup, resourceGroup, location

## Example:

### Create Static Site

```azure-utils --action create-static-site --nonInteractive -s d0aae5c1-3d4f-48a2-84a9-bd7aeccb8799 -g Dev-Static-Sites -f something.demo.com -ug 22e85c75-dae5-405c-860a-3be96c7b3f2a ```

Create a static site with
- Subscription Id: d0aae5c1-3d4f-48a2-84a9-bd7aeccb8799
- Resource Group: Dev-Static-Sites
- For site: something.demo.com
- Assign permissions to user group: 22e85c75-dae5-405c-860a-3be96c7b3f2a

Other parameters derived from this:
<pre>
  "storageSku": "Standard_RAGRS"
  "storageKind": "StorageV2"
  "cdnSku": "Standard_Microsoft"
  "indexDoc": "index.html"
  "cdnSite": "something",
  "storageAccount": "something",
  "cdnProfile": "something,
  "cdnEndpointName": "somthing-demo-com",
  "profile": "something",
  "location": "eastus",
  "cdnOrigin": "something.z13.web.core.windows.net",
  "indexDocument": "index.html",
  "finalEndpoint": "https://something-demo-com.azureedge.net"
</pre>

Note:

- Azure has restrictions of some global duplicates. Hence, some statements may fail and you may want to make sure you specify a unique storageAccount

### Deploy static site

Note: Assumes your files are in build folder

```
azure-utils --action deploy-static-site --nonInteractive -f something.demo.com -g Dev-Static-Sites
```

Other parameters derived from this:
<pre>
  "storageAccount": "something",
  "cdnProfile": "something",
  "cdnSite": "something",
  "cdnEndpointName": "something-demo-com"
</pre>

## Options:

<pre>
-s, --subscriptionId    -   Azure Subscription Id
-g, --group             -   Azure resource group
-f, --fqdn              -   Fully qualified domain name to derive other parameters
-l, --location          -   Location for Azure Storage Account - default: eastus
-a, --storageAccount    -   Azure Storage Account
-ss, --storageSku       -   Azure Storage SKU - default: Standard_RAGRS
-sk, --storageKind      -   Azure Storage Type - default: StorageV2
-cs, --cdnSite          -   Azure CDN Site name
-co, --cdnOrigin        -   Azure CDN Origin
-p, --cdnProfile        -   Azure CDN Profile Name
-e, --cdnEndpoint       -   Azure CDN Endpoint
--cdnSku                -   Azure CDN SKU
-ug, --userGroup        -   Azure User Group - default: cdn
--indexDocument         -   Azure Static site default document - default: index.html
--nonInteractive        -   Run in silent mode - without prompts
--dryRun                -   Just show the commands - do not execute
--action                -   Action for non interactive mode. Options:
                            create-static-site
                            deploy-static-site
</pre>
