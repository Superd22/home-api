# Getting started

- Kube (k3s on box currently)
- Kubectl

kube declarative config is generated through cdk8s.

`yarn run infra:synth` will create .yaml files in /dist
`kubectl apply -f dist --prune --all` will replace current kube config with ones declared in yaml (make sure to be on the right kube cluster)


## Add a node
To add a node :

`k3s agent --server https://[klusterIp]:6443 --token "[token]" --node-label powerful=true`

token is in `/var/lib/rancher/k3s/server/node-token` 