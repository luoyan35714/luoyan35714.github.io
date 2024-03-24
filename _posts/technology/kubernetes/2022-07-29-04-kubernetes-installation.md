---
layout: post
title:  Kubernetes - 04 - 安装
date:   2022-07-29 04:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


## 1. Kubernetes安装

kubernetes的各种安装方式：

+ `minikube`: minikube 在本地的个人计算机（包括 Windows、macOS 和 Linux PC）运行一个单节点的 Kubernetes 集群，以便来尝试 Kubernetes 或者开展每天的开发工作。推荐实验和测试使用。
[https://minikube.sigs.k8s.io/docs/start/](https://minikube.sigs.k8s.io/docs/start/)

+ `kind`: 能够在本地计算机上运行 Kubernetes。 kind 要求提前安装并配置好 Docker。kind与minikube的不同点在于基于docker而不是虚拟化，所以不需要运行GuestOS，支持多节点和HA，推荐实验和测试使用
[https://kind.sigs.k8s.io/docs/user/quick-start/](https://kind.sigs.k8s.io/docs/user/quick-start/)

+ `kubeadm`: Kubeadm 是一个K8s 部署工具，提供kubeadm init 和kubeadm join，用于快速部署Kubernetes 集群。生产环境kubernetes的安装方式
[https://kubernetes.io/docs/reference/setup-tools/kubeadm/](https://kubernetes.io/docs/reference/setup-tools/kubeadm/)

+ `二进制包`：生产环境kubernetes的安装方式，从github 下载发行版的二进制包，手动部署每个组件，组成Kubernetes 集群。Kubeadm 降低部署门槛，但屏蔽了很多细节，遇到问题很难排查。如果想更容易可控，推荐使用二进制包部署Kubernetes 集群
[https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.24.md](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.24.md)

## 2. kind安装

[https://kind.sigs.k8s.io/docs/user/quick-start/](https://kind.sigs.k8s.io/docs/user/quick-start/)

```bash
$ kind create cluster   
Creating cluster "kind" ...
⢎⠁ Ensuring node image (kindest/node:v1.24.0) 🖼 
 ✓ Ensuring node image (kindest/node:v1.24.0) 🖼 
 ✓ Preparing nodes 📦  
 ✓ Writing configuration 📜 
 ✓ Starting control-plane 🕹️ 
 ✓ Installing CNI 🔌 
 ✓ Installing StorageClass 💾 
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Have a question, bug, or feature request? Let us know! https://kind.sigs.k8s.io/#community 🙂
➜  01-docker 
➜  01-docker kubectl cluster-info --context kind-kind
Kubernetes control plane is running at https://127.0.0.1:55746
CoreDNS is running at https://127.0.0.1:55746/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.

$ kind get clusters
kind
$ kubectl config get-contexts 
CURRENT   NAME        CLUSTER     AUTHINFO    NAMESPACE
*         kind-kind   kind-kind   kind-kind 
$ kubectl get node
NAME                 STATUS   ROLES           AGE   VERSION
kind-control-plane   Ready    control-plane   52m   v1.24.0
```

## 3. kubeadmin方式安装

参考[Kubernetes - 22 - kubeadm安装高可用kubernetes](https://www.hifreud.com/2022/07/29/22-kubernetes-kubeadm-installation/)文档


## 4. 二进制安装

参考[Kubernetes - 23 - 二进制安装](https://www.hifreud.com/2022/07/29/23-kubernetes-binary-installation/)文档


## 5. kubectl安装和常用命令

### 5.1 kubectl安装

kubectl安装 [https://kubernetes.io/zh-cn/docs/tasks/tools/#kubectl](https://kubernetes.io/zh-cn/docs/tasks/tools/#kubectl)

+ mac下的安装

```bash
$ brew install kubectl
# bash自动补全命令
$ kubectl completion bash
# zsh的自动补全命令
$ source <(kubectl completion zsh)
```

+ Windows下的安装

```bash
$ curl -LO "https://dl.k8s.io/release/v1.24.0/bin/windows/amd64/kubectl.exe"
# 下载之后将kubectl.exe加入到path中
```

+ Linux下的安装

```bash
$ curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
$ sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
# 也可以使用apt-get(ubuntu)或者yum(redhat)等下载，但需要配置对应的源
```

### 5.2 常用命令

+ context操作

```bash
# clusters
$ kubectl config get-clusters
$ kubectl config set-cluster
$ kubectl config delete-cluster

# context
$ kubectl config get-contexts
$ kubectl config set-context
$ kubectl config delete-context
```

+ kubectl create ： 创建组件信息

```bash
$ kubectl create namespace ci
namespace "ci" created
$ kubectl create -f test-configmap.yaml
configmap "test-configmap" created
```

```
test-configmap.yaml
-------------------
apiVersion: v1
kind: ConfigMap
metadata:
  name: test-configmap
  namespace: ci
data:
  name: hifreud
```

+ kubectl get ： 获取组件详细信息

```bash
$ kubectl get namespaces
NAME              STATUS    AGE
default           Active    108d
heptio-sonobuoy   Active    104d
kube-public       Active    108d
kube-system       Active    108d
ci                Active    8m
$ kubectl get configmap test-configmap -n ci
NAME             DATA      AGE
test-configmap   1         1m
```

+ kubectl edit ： 修改组件信息

```bash
# 保存使用w，退出使用q，强制使用!
$ kubectl edit configmap test-configmap -n ci
$ kubectl edit -f test-configmap.yaml
```

+ kubectl delete ： 删除组件

```bash
$ kubectl delete configmap test-configmap -n ci
configmap "test-configmap" deleted
$ kubectl delete -f test-configmap.yaml
```

+ kubectl cluster-info ： 查看集群状态

```bash
$ kubectl cluster-info
Kubernetes master is running at https://192.168.75.139:6443
Heapster is running at https://192.168.75.139:6443/api/v1/namespaces/kube-system/services/heapster/proxy
KubeDNS is running at https://192.168.75.139:6443/api/v1/namespaces/kube-system/services/kube-dns/proxy
monitoring-grafana is running at https://192.168.75.139:6443/api/v1/namespaces/kube-system/services/monitoring-grafana/proxy
monitoring-influxdb is running at https://192.168.75.139:6443/api/v1/namespaces/kube-system/services/monitoring-influxdb/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

+ kubectl describe ： 查看组件运行期状态

```bash
$ kubectl describe configmap test-configmap -n ci
Name:         test-configmap
Namespace:    ci
Labels:       <none>
Annotations:  <none>

Data
====
name:
----
hifreud
Events:  <none>
```

+ kubectl logs ： 查看Pod的运行日志，跟docker log比较类似

```bash
$ kubectl get pod -n ci
NAME                           READY     STATUS    RESTARTS   AGE
jmeter-test-7bb4b79bd6-8vvkb   0/1       Pending   0          89d
# 在使用kubectl logs的时候不需要指定组件类型，如果要持续打印日志信息可以添加 -f参数
$ kubectl logs jmeter-test-7bb4b79bd6-8vvkb -n ci
```

+ kubectl port-forward ： 端口转发，对于外界无法直接访问的Pod，可以通过端口转发达到可以在集群外部直接访问Pod的效果。

```bash
#在本地机器执行,这样通过在本地机器访问localhost:7070就可以访问k8s集群的pod了
$ kubectl port-forward jmeter-test-7bb4b79bd6-8vvkb 7070:7070 
```
