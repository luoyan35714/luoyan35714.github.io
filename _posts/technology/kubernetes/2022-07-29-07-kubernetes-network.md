---
layout: post
title:  Kubernetes - 07 - 网络管理
date:   2022-07-29 07:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


## 1. Pod网络

+ 一个pod一个ip
    + 每个pod独立IP，pod内所有容器共享网络namewspace(同一个IP)
    + 容器之间直接通信，不需要NAT(Network Address Translation)
    + Node和容器直接通信，不需要NAT
    + 其他容器和容器自身看到的IP是一样的
+ 集群内走Service, 集群外访问走Ingress
+ CNI(Container Network Interface)用于配置pod网络
    + kubernetes有自己的网络方案
    + 不支持Docker Network(docker run --net=none)

![image.png](/images/blog/kubernetes/07-kubernetes-network/01-kubernetes-network.png)

pod网络的创建过程:

+ 当用户在Kubernetes的Master创建了一个Pod后，Kubelet观察到新Pod的创建，于是首先调用CRI（后面的Runtime实现，比如：cri-dockerd，containerd等）创建Pod内的若干个容器。
+ 在这些容器里面，第一个被创建的Pause容器是比较特殊的，这是Kubernetes系统“赠送”的容器，里面跑着一个功能十分简单的Go语言程序，具体逻辑是一启动就去select一个空的Go语言channel，自然就永远阻塞在那里了。由于容器的隔离功能利用的是Linux内核的namespace机制，而只要是一个进程，不管这个进程是否处于运行状态（挂起亦可），它都能“占”着一个namespace。因此，每个Pod内的第一个系统容器Pause的作用就是为占用一个Linux的network namespace。
+ Pod内其他用户容器通过加入到这个network namespace的方式来共享同一个network namespace。用户容器和Pause容器之间的关系有点类似于寄居蟹和海螺的关系。因此，Container Runtime创建Pod内所有容器时，调用的都是同一个命令：`docker run --net=none`，意思是只创建一个network namespace，而不初始化网络协议栈。
+ 容器的eth0是通过CNI来创建的。CNI主要负责容器的网络设备初始化工作。Kubelet目前支持两个网络驱动，分别是：kubenet和CNI。Kubenet是一个历史产物，即将废弃，因此这里也不准备过多介绍。CNI有多个实现，官方自带的插件就有p2p，bridge等，这些插件负责初始化Pause容器的网络设备，也就是给eth0分配IP等，到时候Pod内其他容器就用这个IP与外界通信。Flanne，Calico这些第三方插件解决Pod之间的跨机通信问题。容器之间的跨机通信，可以通过bridge网络或overlay网络来完成。

## 2. CNI

+ 全称是 Container Network Interface，即容器网络的API接口。
+ Kubernetes中标准的一个网络调用实现的接口。Kubelet 通过这个标准的 API 来调用不同的网络插件以实现不同的网络配置方式，实现了这个接口的就是 CNI 插件，它实现了一系列的 CNI API 接口。常见的 CNI 插件包括 Calico、flannel、Terway(Aliyun)、Azure CNI等等。
+ 使用JSON来描述网络配置

![image.png](/images/blog/kubernetes/07-kubernetes-network/02-CNI.png)

CNI 插件的实现通常包含两个部分：
+ 实现网络方案本身(创建网络): 一个二进制的 CNI 插件去配置 Pod 网卡和 IP 地址。这一步配置完成之后相当于给 Pod 上插上了一条网线，就是说它已经有自己的 IP、有自己的网卡了
+ 实现该网络方案对应的CNI插件(将容器加入网络): 一个 Daemon 进程去管理 Pod 之间的网络打通。这一步相当于说将 Pod 真正连上网络，让 Pod 之间能够互相通信。

## 3. Service

### 3.1 介绍

+ Service是将运行在一组Pods上的应用程序公开为网络服务的抽象方法。
+ 通过Endpoint将pod的ip进行聚合
+ 通过kubernetes dns生成统一的dns记录

> + 利用 label selector，将label为 app:MyApp 的 pod 聚合在一起，形成个组，可以称为 Endpoints
> + 创建 Service(带选择运算符) 会自动创建 Endpiont。

![image.png](/images/blog/kubernetes/07-kubernetes-network/03-Service-network.png)

```yaml
---
apiVersion: v1                  #版本号
kind: Service                   #类型
metadata:                       #元数据
  name: nginx                   #名称
  namespace: default            #所属命名空间
spec:                           #详情描述
  selector:                     #选择器，用于确定当前service代理哪些pod
    app: nginx
  type: ClusterIp               #Service 类型，指定service的访问方式
  clusterIP: 10.96.202.224      #虚拟服务的ip地址
  sessionAffinity: None         #session亲和性，支持ClientIP、None两个选项
  ports:                        #端口信息
    - name: web
      protocol： TCP
      port: 80                  #service端口
      targetPort: 3005          #pod端口
      # nodePort: 31123         #主机端口

---
apiVersion: v1
kind: Endpoints
metadata:
  labels:
    app: nginx
  name: nginx
  namespace: default
subsets:
- addresses:
  - ip: 10.244.0.5
    nodeName: kind-control-plane
    targetRef:
      kind: Pod
      name: nginx-8f458dc5b-bz75m
      namespace: default
      uid: 039bda74-f50f-4c6c-8e54-05023d82ef8f
  - ip: 10.244.0.6
    nodeName: kind-control-plane
    targetRef:
      kind: Pod
      name: nginx-8f458dc5b-xx12s
      namespace: default
      uid: 039bda74-f50f-4c6c-8e54-05023d8eeee
  ports:
  - name: web
    port: 80
    protocol: TCP
```

### 3.2 Service 负载分发策略(sessionAffinity)

+ `sessionAffinity=None`: 默认使用kube-proxy的策略，比如随机，轮询。
+ `sessionAffinity=ClientIP`: 基于客户端地址的会话保持模式，即来自同一个客户端发起的所有请求都会转发到固定的一个Pod上

### 3.3 Service Type的类型

+ ClusterIP：`spec.type=ClusterIP`，也是默认值，是指kubernetes系统自动分配虚拟ip，只能在集群内部访问。

+ NodePort：`spec.type=NodePort`，同时是Cluster IP类型, 将Service通过指定的Node上的端口暴露给外部，通过此方法，就可以在集群外部访问服务。
![image.png](/images/blog/kubernetes/07-kubernetes-network/04-service-nodeport.png)

+ LoadBalancer：`spec.type=LoadBalancer`，同时是NodePort类型，使用外接负载均衡器完成到服务的负载分发，需要跑在特定的cloud provider上。
![image.png](/images/blog/kubernetes/07-kubernetes-network/05-service-loadbalancer.png)

+ ExternalName：`spec.type=ExternalName`，把集群外部的服务引入集群内部，直接使用。
![image.png](/images/blog/kubernetes/07-kubernetes-network/06-service-externalname.png)

```
apiVersion: apps/v1  
kind: Service
metadata:           
  name: service-externalname
  namespace:  default
spec:  
  type: ExternalName            #service的类型
  externalName: www.baidu.com   #ip或者域名都可以
```

+ Headless: 在某些场景中，开发人员可能不想使用Service提供的负载均衡功能，希望自己来控制负载均衡器策略，针对这种情况，kubernetes提供了Headless Service
    + 这类Service不会分配Cluster IP，如果想要访问service，只能通过service的域名进行查询。
    + 通过设置`spec.clusterIp=None`来进行配置

![image.png](/images/blog/kubernetes/07-kubernetes-network/07-service-headless.png)


## 4. Kubernetes DNS

+ Kubenetes以插件的形式提供DNS服务，一般是运行在kube-system名称空间下的service，拥有固定IP地址。
+ DNS插件运行起来后，配置各个节点上的kubelet，告诉它集群中DNS服务的IP地址，kebelet在启动容器时再将DNS服务器的地址告诉容器
+ Kubernetes DNS是用来解析Pod和Service的域名的
+ 主流插件包括: kube-dns 和 coreDNS

```bash
$ kubectl get service -n kube-system
NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
kube-dns   ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   9d
```

**Service**:

+ A记录:
    + 普通Service：`${svc-name}.${namespace-name}.svc.cluster.local`: `Cluster IP`
    + headless Service：`${svc-name}.${namespace-name}.svc.cluster.local`: `后端Pod IP列表`
        + 对于无头服务的pod会创建如下A记录: `${pod-name}.${svc-name}.${namespace-name}.svc.cluster.local` -> `Pod IP`
+ SRV记录：当Service包含命名端口时，会创建此类SRV条目，有多个命名端口则创建多条记录
    + `${port-name}.${port-protocol}.${svc-name}.${namespace-name}.svc.cluster.local` -> `Service Port`

**Pods**:
+ A记录: `${pod-ip}.${namespace-name}.pod.cluster.local` -> `Pod IP`

## 5. Ingress

### 5.1 介绍

+ `Ingress`是对集群中服务的外部访问进行管理的`API`对象，典型的访问方式是 HTTP。
    + 支持通过URL方式将Service暴露到K8S集群外，是Service之上的L7(OSI的七层协议)访问入口
    + 支持自定义Service的访问策略
    + 提供按域名访问的虚拟主机功能
    + 支持SSL
    + 底层基于Nginx实现

![image.png](/images/blog/kubernetes/07-kubernetes-network/08-ingress.png)

### 5.2 ingress yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    # 大多数Nginx的功能都可以通过配置annotation来实现
    # 具体参考 https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/
    nginx.ingress.kubernetes.io/backend-protocol: HTTPS
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  labels:
    name: ingress-nginx
    space: default
  name: ingress-nginx
  namespace: default
spec:
  ingressClassName: nginx
  rules:
  - host: subdomain.a.com
    http:
      paths:
      - pathType: ImplementationSpecific
        path: /
        backend:
          service:
            name: nginx-service
            port:
              number: 443
  tls:
  - hosts:
    - subdomain.a.com
    secretName: subdomain-a-com-ca-cert
```

### 5.3 实验Ingress

+ 使用kind重建kubernetes集群

```bash
# 删除之前的cluster
$ kind delete cluster
# 创建新的cluster并且暴露443和80端口
$ cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
$ docker ps
CONTAINER ID   IMAGE                       COMMAND                  CREATED              STATUS              PORTS                                                                    NAMES
381f37846206   kindest/node:v1.24.0        "/usr/local/bin/entr…"   About a minute ago   Up About a minute   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp, 127.0.0.1:58762->6443/tcp      kind-control-plane
```

+ 部署Nginx-Ingress

```bash
$ kubectl apply --filename https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/kind/deploy.yaml
# 或者从本地获取
$ kubectl apply -f ingress-kind.yaml
namespace/ingress-nginx created
serviceaccount/ingress-nginx created
serviceaccount/ingress-nginx-admission created
role.rbac.authorization.k8s.io/ingress-nginx created
role.rbac.authorization.k8s.io/ingress-nginx-admission created
clusterrole.rbac.authorization.k8s.io/ingress-nginx created
clusterrole.rbac.authorization.k8s.io/ingress-nginx-admission created
rolebinding.rbac.authorization.k8s.io/ingress-nginx created
rolebinding.rbac.authorization.k8s.io/ingress-nginx-admission created
clusterrolebinding.rbac.authorization.k8s.io/ingress-nginx created
clusterrolebinding.rbac.authorization.k8s.io/ingress-nginx-admission created
configmap/ingress-nginx-controller created
service/ingress-nginx-controller created
service/ingress-nginx-controller-admission created
deployment.apps/ingress-nginx-controller created
job.batch/ingress-nginx-admission-create created
job.batch/ingress-nginx-admission-patch created
ingressclass.networking.k8s.io/nginx created
validatingwebhookconfiguration.admissionregistration.k8s.io/ingress-nginx-admission created
```

+ 部署Nginx Deployment， Service和Ingress

```bash
$ kubectl apply -f ingress-demo.yaml 
ingress.networking.k8s.io/nginx-ingress created
service/nginx created
deployment.apps/nginx-deployment created
```

+ 修改宿主机的`/etc/hosts`文件添加如下记录

```bash
127.0.0.1 nginx.testingress.com
```
+ 宿主机访问`http://nginx.testingress.com/` 获得预期的页面

![image.png](/images/blog/kubernetes/07-kubernetes-network/09-nginx.png)