# company-guide
## Deploy

`
$resourceGroup = "company-guide-rg"
az group create --name $resourceGroup --location "West Europe"
az deployment group create --name DeployApp --resource-group $resourceGroup --template-file "azuredeploy.json"
`