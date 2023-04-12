---
layout: post
title:  Kubernetes - 05 - 基础对象介绍
date:   2022-07-29 05:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


## 1. Node

### 1.1 Node节点简介

+ Node是Kubernetes工作负载真正运行的主机，可以是物理机也可以是虚拟机。
+ Node本质上不是Kubernetes来创建的，Kubernetes只是管理Node上的资源。

### 1.2 `kubectl get node -o wide`: 获取所有Node信息

```bash 
$ kubectl get node
NAME           STATUS   ROLES    AGE    VERSION
10.177.7.207   Ready    <none>   502d   v1.21.5+IKS
10.177.7.219   Ready    <none>   502d   v1.21.5+IKS
10.177.7.222   Ready    <none>   502d   v1.21.5+IKS
10.177.7.225   Ready    <none>   502d   v1.21.5+IKS
10.177.7.240   Ready    <none>   502d   v1.21.5+IKS
```

### 1.3 `kubectl get node <node-name> -o yaml`: 查看一个完整的node的信息

```yaml
$ kubectl get node 10.177.7.207 -o yaml
apiVersion: v1
kind: Node
metadata:
  labels:
    arch: amd64
    beta.kubernetes.io/arch: amd64
    beta.kubernetes.io/instance-type: u3c.2x4.encrypted
    beta.kubernetes.io/os: linux
    dedicated: edge
  name: 10.177.7.207
spec:
  providerID: ibm://a0bc0c5466544e968bff315fba51e594///c0d19dnd0uii3pk7po40/kube-c0d19dnd0uii3pk7po40-wseplatform-edgewor-0000024c
  taints:
  - effect: NoSchedule
    key: dedicated
    value: edge
  - effect: NoExecute
    key: dedicated
    value: edge
status:
  addresses:
  - address: 10.177.7.207
    type: InternalIP
  - address: 10.177.7.207
    type: Hostname
  allocatable:
    cpu: 1920m
    ephemeral-storage: "93986994917"
    hugepages-1Gi: "0"
    hugepages-2Mi: "0"
    memory: 2923296Ki
    pods: "110"
  capacity:
    cpu: "2"
    ephemeral-storage: 102685624Ki
    hugepages-1Gi: "0"
    hugepages-2Mi: "0"
    memory: 4033312Ki
    pods: "110"
  conditions:{...}
  daemonEndpoints:
    kubeletEndpoint:
      Port: 10250
  images:{...}
  nodeInfo:
    architecture: amd64
    bootID: 493f6d9d-e056-48e9-8992-97d6ad47e6a6
    containerRuntimeVersion: containerd://1.5.7
    kernelVersion: 4.15.0-159-generic
    kubeProxyVersion: v1.21.5+IKS
    kubeletVersion: v1.21.5+IKS
    machineID: 841e67d05e914cb3a99f908539415052
    operatingSystem: linux
    osImage: Ubuntu 18.04.6 LTS
    systemUUID: B034E462-7061-C511-B47C-A0754142EE77
```

### 1.4 kubectl describe node <node-name>: 描述Node的信息

```bash
$ kubectl describe node 10.177.7.207
Name:               10.177.7.207
Roles:              <none>
Labels:             arch=amd64
                    beta.kubernetes.io/arch=amd64
                    beta.kubernetes.io/instance-type=u3c.2x4.encrypted
                    beta.kubernetes.io/os=linux
                    dedicated=edge
Annotations:        node.alpha.kubernetes.io/ttl: 0
                    projectcalico.org/IPv4Address: 10.177.7.207/26
                    projectcalico.org/IPv4IPIPTunnelAddr: 172.30.203.192
                    volumes.kubernetes.io/controller-managed-attach-detach: true
CreationTimestamp:  Wed, 03 Feb 2021 11:28:01 +0800
Taints:             dedicated=edge:NoExecute
                    dedicated=edge:NoSchedule
Unschedulable:      false
Lease:
  HolderIdentity:  10.177.7.207
  AcquireTime:     <unset>
  RenewTime:       Mon, 20 Jun 2022 17:49:45 +0800
Conditions:
  Type                 Status  LastHeartbeatTime                 LastTransitionTime                Reason                       Message
  ----                 ------  -----------------                 ------------------                ------                       -------
  NetworkUnavailable   False   Thu, 09 Jun 2022 05:05:27 +0800   Thu, 09 Jun 2022 05:05:27 +0800   CalicoIsUp                   Calico is running on this node
  MemoryPressure       False   Mon, 20 Jun 2022 17:49:09 +0800   Sat, 30 Oct 2021 12:51:18 +0800   KubeletHasSufficientMemory   kubelet has sufficient memory available
  DiskPressure         False   Mon, 20 Jun 2022 17:49:09 +0800   Sat, 30 Oct 2021 12:51:18 +0800   KubeletHasNoDiskPressure     kubelet has no disk pressure
  PIDPressure          False   Mon, 20 Jun 2022 17:49:09 +0800   Sat, 30 Oct 2021 12:51:18 +0800   KubeletHasSufficientPID      kubelet has sufficient PID available
  Ready                True    Mon, 20 Jun 2022 17:49:09 +0800   Sat, 30 Oct 2021 12:51:58 +0800   KubeletReady                 kubelet is posting ready status. AppArmor enabled
Addresses:
  InternalIP:  10.177.7.207
  ExternalIP:  52.118.8.130
  Hostname:    10.177.7.207
Capacity:
  cpu:                2
  ephemeral-storage:  102685624Ki
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  memory:             4033312Ki
  pods:               110
Allocatable:
  cpu:                1920m
  ephemeral-storage:  93986994917
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  memory:             2923296Ki
  pods:               110
System Info:
  Machine ID:                 841e67d05e914cb3a99f908539415052
  System UUID:                B034E462-7061-C511-B47C-A0754142EE77
  Boot ID:                    493f6d9d-e056-48e9-8992-97d6ad47e6a6
  Kernel Version:             4.15.0-159-generic
  OS Image:                   Ubuntu 18.04.6 LTS
  Operating System:           linux
  Architecture:               amd64
  Container Runtime Version:  containerd://1.5.7
  Kubelet Version:            v1.21.5+IKS
  Kube-Proxy Version:         v1.21.5+IKS
ProviderID:                   ibm://a0bc0c5466544e968bff315fba51e594///c0d19dnd0uii3pk7po40/kube-c0d19dnd0uii3pk7po40-wseplatform-edgewor-0000024c
Non-terminated Pods:          (9 in total)
  Namespace                   Name                                                    CPU Requests  CPU Limits  Memory Requests  Memory Limits  Age
  ---------                   ----                                                    ------------  ----------  ---------------  -------------  ---
  ibm-system                  ibm-cloud-provider-ip-10-177-5-91-7f9bd44867-cvl29      5m (0%)       0 (0%)      10Mi (0%)        0 (0%)         11d
  ibm-system                  ibm-cloud-provider-ip-169-46-96-162-8668688cd4-kgzw5    5m (0%)       0 (0%)      10Mi (0%)        0 (0%)         11d
  kube-system                 calico-node-75bq7                                       250m (13%)    0 (0%)      80Mi (2%)        0 (0%)         11d
  kube-system                 ibm-keepalived-watcher-z4nvx                            5m (0%)       0 (0%)      10Mi (0%)        0 (0%)         11d
  kube-system                 ibm-master-proxy-static-10.177.7.207                    25m (1%)      300m (15%)  32M (1%)         512M (17%)     233d
  kube-system                 konnectivity-agent-8mbrp                                10m (0%)      0 (0%)      10Mi (0%)        500Mi (17%)    80d
  kube-system                 private-crc0d19dnd0uii3pk7po40-alb1-df7c75987-nbv5n     10m (0%)      0 (0%)      100Mi (3%)       0 (0%)         9d
  kube-system                 public-crc0d19dnd0uii3pk7po40-alb1-b9fbd76b5-7n9mn      10m (0%)      0 (0%)      100Mi (3%)       0 (0%)         9d
  kube-system                 route-daemon-controller-pvxz6                           0 (0%)        0 (0%)      0 (0%)           0 (0%)         242d
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests        Limits
  --------           --------        ------
  cpu                320m (16%)      300m (15%)
  memory             358930Ki (12%)  1036288k (34%)
  ephemeral-storage  0 (0%)          0 (0%)
  hugepages-1Gi      0 (0%)          0 (0%)
  hugepages-2Mi      0 (0%)          0 (0%)
Events:              <none>
```

### 1.5 Node节点状态

| 状态值 | 描述 |
| ------ | ---- |
| Ready	| 如节点是健康的并已经准备好接收 Pod 则为 True；False 表示节点不健康而且不能接收 Pod；Unknown 表示节点控制器在最近 node-monitor-grace-period 期间（默认 40 秒）没有收到节点的消息 |
| DiskPressure | True 表示节点的空闲空间不足以用于添加新 Pod, 否则为 False |
| MemoryPressure | True 表示节点存在内存压力，即节点内存可用量低，否则为 False |
| PIDPressure | True 表示节点存在进程压力，即节点上进程过多；否则为 False |
| NetworkUnavailable | True 表示节点网络配置不正确；否则为 False |

### 1.6 Node其他信息

+ Capacity: 统计Node的资源（比如CPU、内存）的总容量
+ Allocatable: Node中的部分资源可能预留给Kubernetes的部件（Kube-Reserved）或者其他组件使用（System-Reserved）。从资源总容量(Capacity)里减去这些预留的资源就是Allocatable
+ nodeInfo(Get-yaml)/System Info(Describe): 统计Node的系统信息和组件的版本信息

## 2. Pod

+ 在Kubernetes中，pods是能够创建、调度、和管理的最小部署单元，是一组容器的集合，而不是单独的应用容器
+ 同一个Pod里的容器共享同一个网络命名空间，IP地址及端口空间。
+ 从生命周期来说，Pod是短暂的而不是长久的应用。Pods被调度到节点，保持在这个节点上直到被销毁。

### 2.1 容器分类

+ Infrastructure Container：基础容器
    + 用户不可见，无需感知
    + 维护整个Pod网络空间
+ Init Containers：初始化容器，一般用于服务等待处理以及注册Pod信息等
    + 先于业务容器开始执行
    + 顺序执行，执行成功退出（exit 0），全部执行成功后开始启动业务容器
+ Containers：业务容器
    + 并行启动，启动成功后一直Running

### 2.2 查看pod信息的三种方式

```bash
$ kubectl describe pod 

$ kubectl get pod -o wide --all-namespaces

$ kubectl get pod -o yaml
```

### 2.3 `kubectl get pod -o yaml`

```bash
apiVersion: v1
kind: Pod
metadata:
  annotations:
    cni.projectcalico.org/containerID: d059dbd385b57384d2187b3885249e1833ec136f4e4591110df7667ce5217fa9
    cni.projectcalico.org/podIP: 172.30.102.43/32
    cni.projectcalico.org/podIPs: 172.30.102.43/32
    kubernetes.io/psp: ibm-privileged-psp
  labels:
    app: k8s-demo
    space: w3
  name: k8s-demo-56f47f6f66-qlwls
  namespace: w3
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: dedicated
            operator: NotIn
            values:
            - edge
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app
              operator: In
              values:
              - k8s-demo
          topologyKey: topology.kubernetes.io/zone
        weight: 100
  containers:
  - image: test.icr.com/k8s-demo:pre_3.0.01.00_a77ade5
    imagePullPolicy: IfNotPresent
    name: k8s-demo
    ports:
    - containerPort: 443
      name: https
      protocol: TCP
    readinessProbe:
      failureThreshold: 3
      httpGet:
        path: /ready.html
        port: 443
        scheme: HTTPS
      initialDelaySeconds: 5
      periodSeconds: 10
      successThreshold: 1
      timeoutSeconds: 1
    resources:
      limits:
        cpu: "1"
        memory: 1Gi
      requests:
        cpu: 100m
        memory: 100Mi
    terminationMessagePath: /dev/termination-log
    terminationMessagePolicy: File
    volumeMounts:
    - mountPath: /web/conf/security
      name: keystores
      readOnly: true
  dnsPolicy: ClusterFirst
  enableServiceLinks: true
  imagePullSecrets:
  - name: all-icr-io
  nodeName: 10.177.7.202
  preemptionPolicy: PreemptLowerPriority
  priority: 0
  restartPolicy: Always
  schedulerName: default-scheduler
  securityContext: {}
  serviceAccount: default
  serviceAccountName: default
  terminationGracePeriodSeconds: 30
  tolerations:
  - effect: NoExecute
    key: node.kubernetes.io/not-ready
    operator: Exists
    tolerationSeconds: 600
  - effect: NoExecute
    key: node.kubernetes.io/unreachable
    operator: Exists
    tolerationSeconds: 600
  volumes:
  - name: keystores
    secret:
      defaultMode: 420
      secretName: platform-dev-553e65d57aa996a84dfa67e2c277fee3-0000
status:
  conditions:
  - lastProbeTime: null
    lastTransitionTime: "2022-05-13T08:29:13Z"
    status: "True"
    type: Initialized
  - lastProbeTime: null
    lastTransitionTime: "2022-05-13T08:29:23Z"
    status: "True"
    type: Ready
  - lastProbeTime: null
    lastTransitionTime: "2022-05-13T08:29:23Z"
    status: "True"
    type: ContainersReady
  - lastProbeTime: null
    lastTransitionTime: "2022-05-13T08:29:13Z"
    status: "True"
    type: PodScheduled
  containerStatuses:
  - containerID: containerd://18438f671fc2da6aa06f6f602357573ad4a15fdb6308e2b1b707790927158e46
    image: test.icr.com/k8s-demo:pre_3.0.01.00_a77ade5
    imageID: test.icr.com/k8s-demo@sha256:ce9c2a57e2c5bdf2c71a5cc9039d8a4d1aa7efa4f2012803fdcf095dfe01a414
    lastState: {}
    name: k8s-demo
    ready: true
    restartCount: 0
    started: true
    state:
      running:
        startedAt: "2022-05-13T08:29:16Z"
  hostIP: 10.177.7.202
  phase: Running
  podIP: 172.30.102.43
  podIPs:
  - ip: 172.30.102.43
  qosClass: Burstable
  startTime: "2022-05-13T08:29:13Z"
```

### 2.4 kube describe pod

```bash
$ kubectl describe pod -n w3 k8s-demo-56f47f6f66-qlwls 
Name:         k8s-demo-56f47f6f66-qlwls
Namespace:    w3
Priority:     0
Node:         10.177.7.202/10.177.7.202
Start Time:   Fri, 13 May 2022 16:29:13 +0800
Labels:       app=k8s-demo
              pod-template-hash=56f47f6f66
              space=w3
Annotations:  cni.projectcalico.org/containerID: d059dbd385b57384d2187b3885249e1833ec136f4e4591110df7667ce5217fa9
              cni.projectcalico.org/podIP: 172.30.102.43/32
              cni.projectcalico.org/podIPs: 172.30.102.43/32
              kubernetes.io/psp: ibm-privileged-psp
Status:       Running
IP:           172.30.102.43
IPs:
  IP:           172.30.102.43
Controlled By:  ReplicaSet/k8s-demo-56f47f6f66
Containers:
  k8s-demo:
    Container ID:   containerd://18438f671fc2da6aa06f6f602357573ad4a15fdb6308e2b1b707790927158e46
    Image:          test.icr.com/k8s-demo:pre_3.0.01.00_a77ade5
    Image ID:       test.icr.com/k8s-demo@sha256:ce9c2a57e2c5bdf2c71a5cc9039d8a4d1aa7efa4f2012803fdcf095dfe01a414
    Port:           443/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Fri, 13 May 2022 16:29:16 +0800
    Ready:          True
    Restart Count:  0
    Limits:
      cpu:     1
      memory:  1Gi
    Requests:
      cpu:        100m
      memory:     100Mi
    Readiness:    http-get https://:443/ready.html delay=5s timeout=1s period=10s #success=1 #failure=3
    Environment:  <none>
    Mounts:
      /web/conf/security from keystores (ro)
Conditions:
  Type              Status
  Initialized       True 
  Ready             True 
  ContainersReady   True 
  PodScheduled      True 
Volumes:
  keystores:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  platform-dev-553e65d57aa996a84dfa67e2c277fee3-0000
    Optional:    false
QoS Class:                   Burstable
Node-Selectors:              <none>
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 600s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 600s
Events:                      <none>
```

## 3. namespace命名空间

在 Kubernetes 中，“名字空间（Namespace）”提供一种机制，将同一集群中的资源划分为相互隔离的组。 同一名字空间内的资源名称要唯一，但跨名字空间时没有这个要求。 名字空间作用域仅针对带有名字空间的对象，例如 Deployment、Service 等， 这种作用域对集群访问的对象不适用，例如 StorageClass、Node、PersistentVolume 等。

```bash
$ kubectl get namespaces
NAME              STATUS   AGE
default           Active   508d
istio-system      Active   292d
kube-node-lease   Active   508d
kube-public       Active   508d
kube-system       Active   508d
$ kubectl get ns kube-system -o yaml
apiVersion: v1
kind: Namespace
metadata:
  labels:
    kubernetes.io/metadata.name: kube-system
    space: kube-system
  name: kube-system
spec:
  finalizers:
  - kubernetes
status:
  phase: Active
```

```bash
# 查看位于命名空间中的资源
kubectl api-resources --namespaced=true
# 查看不在命名空间中的资源
kubectl api-resources --namespaced=false
```