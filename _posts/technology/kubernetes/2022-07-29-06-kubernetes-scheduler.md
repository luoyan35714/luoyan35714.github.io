---
layout: post
title:  Kubernetes - 06 - 调度管理
date:   2022-07-29 06:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


> 所谓调度即将pod分配到最优的Node节点并启动和维护的过程。

## 1. 调度基础

### 1.1 pod中影响调度的主要属性

![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/01-pod-template.png)

### 1.2 Kubernetes服务质量保证（QoS: Quality of Service）

#### 1.2.1 requests & limits

+ requests申请范围是0到node节点的最大配置，定义了对应容器需要的最小资源量.
+ limits申请范围是requests到无限，定义了这个容器最大可以消耗的资源上限，防止过量消耗资源导致资源短缺甚至宕机。设置为0或不设置表示对使用的资源不做限制。当设置limits而没有设置requests时，Kubernetes 默认会让requests等于limits。

> 对于CPU，如果pod中服务使用CPU超过设置的limits，pod不会被kill掉但会被限制。如果没有设置limits，pod可以使用全部空闲的cpu资源。

> 对于内存，当一个pod使用内存超过了设置的limits，pod中container的进程会被kernel因OOM kill掉。当container因为OOM被kill掉时，系统倾向于在其原所在的机器上重启该container或本机重新创建一个pod

```yaml
resources:
  limits:
    cpu: "1"
    memory: 1Gi
  requests:
    cpu: 100m
    memory: 100Mi
```

#### 1.2.2 QoS分类

+ Guaranteed(保证可用)：Pod 里的每个容器都必须有内存/CPU 限制和请求，而且值必须相等。质量等级最高
+ Burstable(可供临时使用)：Pod 里至少有一个容器有内存或者 CPU 请求且不满足 Guarantee 等级的要求，即内存/CPU 的值设置的不同。质量等级居中
+ Best-Effort(最大程度满足)：容器必须没有任何内存或者 CPU 的限制或请求。质量等级最低

### 1.3 资源分配机制

+ 基于Pod中容器request资源“总和”调度
    + resoureces.limits影响pod的运行资源上限，不影响调度
    + initContainer取最大值，container取累加值，最后取大者即Max( Max(initContainers.requests), Sum(containers.requests) )
    + 未指定request资源时，按0资源需求进行调度

+ 基于资源声明量的调度，而非实际占用
    + 不依赖监控，系统不会过于敏感
    + 能否调度成功：pod.request< node.allocatable-node.requested

+ Kubernetes node 资源的盒子模型
![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/02-node.png)

### 1.4 Label

+ Label是Kubernetes中一个核心概念。是一组绑定到K8s资源对象上的key/value对。
+ 同一个对象的labels属性的key必须唯一
+ label可以附加到各种资源对象上，如Node,Pod,Service,Deployment等。
+ 通过给指定的资源对象捆绑一个或多个不用的label来实现多维度的资源分组管理功能，以便于灵活，方便地进行资源分配，调度，配置，部署等管理工作。

### 1.5 Label selector

Label selector是Kubernetes核心的分组机制，通过label selector 客户端/用户能够识别一组有共同特征或属性的资源对象。

### 1.6 Node Selector

将Pod调度到特定的Node 上
+ 匹配node.labels
+ 排除不包含nodeSelector中指定label的所有node
+ 匹配机制——完全匹配

![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/03-node-selector.png)

## 2. 高级调度

### 2.1 Affinity亲和性 & AntiAffinity反亲和性

+ 亲和性、反亲和性语言的表达能力更强。nodeSelector 只能选择拥有所有指定标签的节点。 亲和性、反亲和性为你提供对选择逻辑的更强控制能力。
+ 可以标明某规则是“软需求”或者“偏好”，这样调度器在无法找到匹配节点时仍然调度该 Pod。
+ 可以使用节点上（或其他拓扑域中）运行的其他 Pod 的标签来实施调度约束， 而不是只能使用节点本身的标签。

#### 2.1.1 类型

+ nodeAffinity（节点亲和）：节点亲和针对的是节点的标签，和nodeSelector相似，是nodeSelector的升级版，都是通过节点标签来约束pod的调度
![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/04-node-affinity.png)

+ podAffinity（pod亲和）：针对pod的标签来约束，pod标签借助topologkey来选择pod调度的节点。topologkey是指Node上label的key。旨在让某些Pod 分布在同一组Node 上
![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/05-pod-affinity.png)

+ podAntiAffinity（pod反亲和）：针对pod的标签来约束，pod标签借助topologkey来选择pod调度的节点。topologkey是指Node上label的key。与podAffinity的匹配过程相同，最终处理调度结果时取反
![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/06-pod-anti-affinity.png)

#### 2.1.2 硬性过滤与软性评分

+ `requiredDuringSchedulingIgnoredDuringExecution`: 硬性过滤，pod调度到节点必须满足规则条件，不满足则不会调度，pod会一致处于pending状态
+ `preferredDuringSchedulingIgnoredDuringExecution`: 软性评分，优先满足符合条件的节点，表示优先调度到满足规则条件的节点，如果不能满足在调度到其他节点

#### 2.1.3 亲和性支持的运算符

`In`: label的值在某个列表中
`NotIn`: label 的值不在某个列表中
`Exists`: 某个label存在
`DoesNotExist`: 某个label不存在
`Gt`: label的值大于某个值
`Lt`: label的值小于某个值

### 2.2 Init Containers

#### 2.2.1 常用的几种应用场景

+ 等待其它关联组件正确运行(例如数据或某个后台服务)
+ 初始化数据库数据
+ 基于环境变量或配置模板生成配置文件
+ 下载相关依赖包
+ 对系统进行一些预配置操作（比如修改某些目录的权限）

#### 2.2.2 特点

+ init container的运行方式与应用 container不同，他们必须先于应用容器执行完成
+ 当设置多个init container时，将按顺序逐个运行，并且只有前一个init container运行成功后才能运行后一个init container
+ 当所有的init container都成功运行后，Kubernetes才会初始化Pod的各个信息，并开始创建和运行应用容器
+ init container的定义中也可以设置资源限制、Volume的使用和安全策略，等等。但资源限制的设置与应用容器略有不同，具体参照`1.3 资源分配机制`
+ init container不能将设置readinessProbe和liveness探针，因为init container旨在成功执行后就退出
+ 如果任何init container失败，整个 Pod 将重新启动(当Pod 对应的 restartPolicy 值为 "Never"，pod状态将设置为失败，并不会重启)，在Pod重启启动时，所有的init container将会重新运行

![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/07-init-container.png)


### 2.3 ReadinessProbe & LivenessProbe & StartupProbe

![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/08-probes.png)

#### 2.3.1 介绍

+ ReadinessProbe:
    + 就绪性探针，用于判断容器内的程序是否存活（或者说是否健康），只有程序(服务)正常， 容器开始对外提供网络访问（启动完成并就绪）。
    + 容器启动后按照readinessProbe配置进行探测，无问题后结果为成功即状态为 Success。pod的READY状态为 true，从0/1变为1/1。如果失败继续为0/1，状态为 false。
    + 若未配置就绪探针，则默认状态容器启动后为Success。
    + 对于此pod关联的Service资源、EndPoint的关系也将基于Pod的 Ready 状态进行设置，如果 Pod 运行过程中 Ready 状态变为 false，则系统自动从 Service资源 关联的 EndPoint 列表中去除此pod，届时service资源接收到GET请求后，kube-proxy将不会把流量引入此pod中，通过这种机制就能防止将流量转发到不可用的 Pod 上。如果 Pod 恢复为 Ready 状态。将再会被加回 Endpoint 列表, kube-proxy也将有概率通过负载机制会引入流量到此pod中。
+ LivenessProbe:
    + 存活性探针，用于判断容器是不是健康，如果不满足健康条件，那么 Kubelet 将根据 Pod 中设置的 restartPolicy （重启策略）来判断，Pod 是否要进行重启操作。
    + LivenessProbe按照配置去探测 ( 进程、或者端口、或者命令执行后是否成功等等)，来判断容器是不是正常。如果探测不到，代表容器不健康（可以配置连续多少次失败才记为不健康），则 kubelet 会杀掉该容器，并根据容器的重启策略做相应的处理。
    + 如果未配置存活探针，则默认容器启动为通过（Success）状态。即探针返回的值永远是 Success。即Success后pod状态是RUNING
+ StartupProbe: 
    + 旨在解决在复杂的程序中readinessProbe、livenessProbe探针无法更好的判断程序是否启动、是否存活的问题
    + 只在容器启动后按照配置满足一次，之后不再继续探测
    + 如果三个探针同时存在，先执行startupProbe探针，其他两个探针将会被暂时禁用，直到pod满足startupProbe探针配置的条件，其他2个探针启动，如果不满足按照规则重启容器

#### 2.3.2 三者区别

> + readinessProbe 当检测失败后，将 Pod 的 IP:Port 从对应的 EndPoint 列表中删除。
> + livenessProbe 当检测失败后，将杀死容器并根据 Pod 的重启策略来决定作出对应的措施。
> + StartupProbe：优先执行，当此probe探测成功之前，readinessProbe和livenessProbe会被临时禁用

#### 2.3.3 Probe action

+ ExecAction

```yaml
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
```

+ GRPCAction

```yaml
livenessProbe:
  grpc:
    port: 8080
    service: grpc_behavior      # Optional, Defaults behavior is defined by gRPC.
```

+ HTTPGetAction

```yaml
livenessProbe:
  httpGet:
    host: localhost     # Optional, Defaults to the pod IP.
    scheme: HTTPS       # Optional, Defaults to HTTP.
    path: /health_check_path
    port: 8080
    httpHeaders:
    - name: Custom-Header
      value: Awesome
```

+ TCPSocketAction

```yaml
livenessProbe:
  tcpSocket:
    host: localhost     # Optional, Defaults to the pod IP.
    port: 8080
```

#### 2.3.3 Configure Action

+ `initialDelaySeconds`：容器启动后要等待多少秒后才启动存活和就绪探测器， 默认是 0 秒，最小值是 0。
+ `periodSeconds`：执行探测的时间间隔（单位是秒）。默认是 10 秒。最小值是 1。
+ `successThreshold`：探测器在失败后，被视为成功的最小连续成功数。默认值是 1。 存活和启动探测的这个值必须是 1。最小值是 1。
+ `failureThreshold`：当探测失败时，Kubernetes 的重试次数。 对存活探测而言，放弃就意味着重新启动容器。 对就绪探测而言，放弃意味着 Pod 会被打上未就绪的标签。默认值是 3。最小值是 1。
+ `timeoutSeconds`：探测的超时后等待多少秒。默认值是 1 秒。最小值是 1。

### 2.4 Taints & Tolerations

#### 2.4.1 介绍

+ Taint（污点）： 节点亲和性是pod的一种属性，使pod被吸引到一类特定的节点，而污点(Taint)则相反，它使节点能够排斥一些特定的pod
+ Toleration（容忍度）：是应用于 Pod 上的，允许（但并不要求）Pod 调度到带有与之匹配的污点的节点上。

污点(Taint)和容忍度（Toleration）相互配合，可以用来避免 Pod 被分配到不合适的节点上。 每个节点上都可以应用一个或多个污点，这表示对于那些不能容忍这些污点的 Pod，是不会被该节点接受的。

#### 2.4.2 taint的使用

添加和移除Taint污点

```bash
# 增加一个污点 kubectl taint node [node] key=value:[effect]
$ kubectl taint nodes node1 key1=value1:NoSchedule
# 移除污点 kubectl taint node [node] key:[effect]-
$ kubectl taint nodes node1 key1=value1:NoSchedule-
```

设置pod的Toleration容忍度

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    env: test
spec:
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
  tolerations:
  - key: "key1"
    operator: "Exists"
    effect: "NoSchedule"
  - key: "key2"
    operator: "Equal"
    value: "value2"
    effect: "NoExecute"
```

> operator 支持两种，一种是equals, 一种是exists

> + 如果一个容忍度的 key 为空且 operator 为 Exists， 表示这个容忍度与任意的 key 、value 和 effect 都匹配，即这个容忍度能容忍任意 taint。
> + 如果 effect 为空，则可以与所有键名 key1 的效果相匹配。

#### 2.4.2 taint中effect的取值

+ NoSchedule：一定不能被调度。如果一个 pod 没有声明容忍这个 Taint，则系统不会把该 Pod 调度到有这个 Taint 的 node 上
+ PreferNoSchedule：尽量不要调度。NoSchedule 的软限制版本，如果一个 Pod 没有声明容忍这个 Taint，则系统会尽量避免把这个 pod 调度到这一节点上去，但不是强制的。
+ NoExecute：不仅不会调度，还会驱逐Node上已有的Pod。定义pod的驱逐行为，以应对节点故障。
    + 没有设置 Toleration 的 Pod 会被立刻驱逐
    + 配置了对应 Toleration 的 pod，如果没有为 tolerationSeconds 赋值，则会一直留在这一节点中
    + 配置了对应 Toleration 的 pod 且指定了 tolerationSeconds 值，则会在指定时间后驱逐

```yaml
# 表示如果这个 pod 已经运行在 node 上并且该 node 添加了一个对应的 taint，那么这个 pod 将会在 node 上停留 3600 秒后才会被驱逐。
# 但是如果 taint 在这个时间前被移除，那么这个 pod 也就不会被驱逐了。
tolerations: 
- key: "key1"
  operator: "Equal"
  value: "value1"
  effect: "NoExecute"
  tolerationSeconds: 3600
```

#### 2.4.3 使用场景

+ `专用节点`：如果你想将某些节点专门分配给特定的一组用户使用
+ `配备了特殊硬件的节点`：在部分节点配备了特殊硬件（比如 GPU）的集群中， 我们希望不需要这类硬件的 Pod 不要被分配到这些特殊节点，以便为后继需要这类硬件的 Pod 保留资源。
+ `基于污点的驱逐`: 这是在每个 Pod 中配置的在节点出现问题时的驱逐行为

#### 2.4.4 kubernetes内置taint

当某种条件为真时，节点控制器会自动给节点添加一个污点。在节点被驱逐时，节点控制器或者 kubelet 会添加带有 NoExecute 效应的相关污点。 如果异常状态恢复正常，kubelet 或节点控制器能够移除相关的污点。当前内置的污点包括：
+ `node.kubernetes.io/not-ready`：节点未准备好。这相当于节点状态 Ready 的值为 "False"。
+ `node.kubernetes.io/unreachable`：节点控制器访问不到节点. 这相当于节点状态 Ready 的值为 "Unknown"。
+ `node.kubernetes.io/memory-pressure`：节点存在内存压力。
+ `node.kubernetes.io/disk-pressure`：节点存在磁盘压力。
+ `node.kubernetes.io/pid-pressure`: 节点的 PID 压力。
+ `node.kubernetes.io/network-unavailable`：节点网络不可用。
+ `node.kubernetes.io/unschedulable`: 节点不可调度。
+ `node.cloudprovider.kubernetes.io/uninitialized`：如果 kubelet 启动时指定了一个 "外部" 云平台驱动， 它将给当前节点添加一个污点将其标志为不可用。在 cloud-controller-manager 的一个控制器初始化这个节点后，kubelet 将删除这个污点。

> Kubernetes会给所有的pod添加key为`node.kubernetes.io/not-ready`和`node.kubernetes.io/unreachable`的容忍度配置，并且设置`tolerationSeconds=300`，确保Node出现一些短期问题的时候，pod依然可以在node上运行5分钟

> DaemonSet 中的 Pod 被创建时， 针对以下污点自动添加的 NoExecute 的容忍度将不会指定 tolerationSeconds, 这保证了出现上述问题时 DaemonSet 中的 Pod 永远不会被驱逐。
> + `node.kubernetes.io/unreachable`
> + `node.kubernetes.io/not-ready`

### 2.5 cordon, drain, delete

cordon, dran和delete三个命令都会使Node停止被调度，后期创建的pod不会继续被调度到该节点上，但操作的暴力程度不一样。

+ cordon 停止调度
    + 影响最小，只会将node调为SchedulingDisabled
    + 之后再发创建pod，不会被调度到该节点
    + 旧有的pod不会受到影响，仍正常对外提供服务
    + 适用于某些过载保护状态

```bash
# 开启停止调度
$ kubectl cordon $node_name
# 恢复调度
$ kubectl uncordon $node_name
```

+ drain 驱逐节点
    + 驱逐node上的pod，其他节点重新创建
    + 将节点调为SchedulingDisabled
    + 适用于节点维护操作（例如硬件维护，内核升级等等）

```bash
# 驱逐节点并停止调度
$ kubectl drain $node_name
# 恢复调度
$ kubectl uncordon $node_name
```

+ delete 删除节点
    + 驱逐node上的pod，其他节点重新创建
    + 从master节点删除该node，master对其不可见，失去对其控制，master不可对其恢复
    + 适用于Node节点临时征调作他用的场景

```bash
# 删除节点
$ kubectl delete $node_name
# 恢复调度
# ssh到此节点，执行`systemctl restart kubelet`操作
# 基于Node的自注册功能，重新恢复节点的使用
```

### 2.6 Resource Quota(资源配额)

#### 2.6.1 介绍

kubernetes中的一个对象，对象名为`ResourceQuota`, 对每个命名空间的资源消耗总量提供限制。 它可以限制命名空间中某种类型的对象的总数目上限，也可以限制命令空间中的 Pod 可以使用的计算资源的总上限。

+ 不同的团队可以在不同的命名空间下工作。
+ 集群管理员可以为每个命名空间创建一个或多个 ResourceQuota 对象。
+ 当用户在命名空间下创建资源（如 Pod、Service 等）时，Kubernetes 的配额系统会 跟踪集群的资源使用情况，以确保使用的资源用量不超过 ResourceQuota 中定义的硬性资源限额。
+ 如果资源创建或者更新请求违反了配额约束，那么该请求会报错（HTTP 403 FORBIDDEN）， 并在消息中给出有可能违反的约束。
+ 如果命名空间下的计算资源 （如 cpu 和 memory）的配额被启用，则用户必须为 这些资源设定请求值（request）和约束值（limit），否则配额系统将拒绝 Pod 的创建。 提示: 可使用 LimitRanger 准入控制器来为没有设置计算资源需求的 Pod 设置默认值。

> 在集群容量小于各命名空间配额总和的情况下，可能存在资源竞争。资源竞争时，Kubernetes 系统会遵循先到先得的原则。

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: test-resource-quota
  namespace: test
spec:
  hard:
    pods: "40"
    requests.cpu: "10"
    requests.memory: 10Gi
    limits.cpu: "20"
    limits.memory: 20Gi
```

#### 2.6.2 计算资源配额

| 资源名称 | 描述    |
| -------- | ------- |
| limits.cpu | 所有非终止状态的 Pod，其 CPU 限额总量不能超过该值。 |
| limits.memory | 所有非终止状态的 Pod，其内存限额总量不能超过该值。 |
| requests.cpu | 所有非终止状态的 Pod，其 CPU 需求总量不能超过该值。 |
| requests.memory | 所有非终止状态的 Pod，其内存需求总量不能超过该值。 |
| hugepages-<size> | 对于所有非终止状态的 Pod，针对指定尺寸的巨页请求总数不能超过此值。 |
| cpu | 与 requests.cpu 相同。
| memory | 与 requests.memory 相同。 |

#### 2.6.3 存储资源配额

| 资源名称 | 描述 |
| -------- | ---- |
| requests.storage | 所有 PVC，存储资源的需求总量不能超过该值。 |
| persistentvolumeclaims | 在该命名空间中所允许的 PVC 总量。 |
| <storage-class-name>.storageclass.storage.k8s.io/requests.storage | 在所有与 <storage-class-name> 相关的持久卷申领中，存储请求的总和不能超过该值。 |
| <storage-class-name>.storageclass.storage.k8s.io/persistentvolumeclaims | 在与 storage-class-name 相关的所有持久卷申领中，命名空间中可以存在的持久卷申领总数。 |
| requests.ephemeral-storage | 在命名空间的所有 Pod 中，本地临时存储请求的总和不能超过此值。 |
| limits.ephemeral-storage | 在命名空间的所有 Pod 中，本地临时存储限制值的总和不能超过此值。 |
| ephemeral-storage | 与 requests.ephemeral-storage 相同。 |

#### 2.6.4 对象数量配额

对象配额的语法
| 配额声明 | 描述 |
| -------- | ---- |
| count/<resource>.<group> | 用于非核心（core）组的资源 |
| count/<resource> | 用于核心组的资源 |

常用的对象数量配额
| 资源名称 |
| -------- |
| count/persistentvolumeclaims |
| count/services |
| count/secrets |
| count/configmaps |
| count/replicationcontrollers |
| count/deployments.apps |
| count/replicasets.apps |
| count/statefulsets.apps |
| count/jobs.batch |
| count/cronjobs.batch |

#### 2.6.5 scopeSelector（配额作用域）

每个resourcequota都有一组相关的 scope（作用域），配额只会对作用域内的资源生效。 配额机制仅统计所列举的作用域的交集中的资源用量。

| 作用域 | 描述 |
| ------ | ---- |
| Terminating | 匹配所有 spec.activeDeadlineSeconds 不小于 0 的 Pod。 |
| NotTerminating | 匹配所有 spec.activeDeadlineSeconds 是 nil 的 Pod。 |
| BestEffort | 匹配所有 Qos 是 BestEffort 的 Pod。 |
| NotBestEffort | 匹配所有 Qos 不是 BestEffort 的 Pod。 |
| PriorityClass | 匹配所有引用了所指定的优先级类的 Pods。 |
| CrossNamespacePodAffinity | 匹配那些设置了跨名字空间 （反）亲和性条件的 Pod。 |

> BestEffort作用域可以限制配额的资源：pods

> Terminating、NotTerminating、NotBestEffort 和 PriorityClass 作用域可以限制配额的资源：pods, cpu, memory, requests.cpu, requests.memory, limits.cpu, limits.memory

```bash
# 以PriorityClass为例子的配置scopeSelector的resourceQuota
apiVersion: v1
kind: ResourceQuota
metadata:
  name: pods-medium
spec:
  hard:
    cpu: "10"
    memory: 20Gi
    pods: "10"
  scopeSelector:
    matchExpressions:
    - operator : In
      scopeName: PriorityClass
      values: ["medium"]
```

`scopeSelector`支持的`operator`字段：
+ In
+ NotIn
+ Exists
+ DoesNotExist

## 3. 调度结果和失败原因分析

### 3.1 查看调度结果

```bash
# kubectlget pod [podname] –o wide
$ kubectl get pod -n w3 my-pod-56f47f6f66-qlwls -o wide 
NAME                      READY   STATUS    RESTARTS   AGE   IP              NODE           NOMINATED NODE   READINESS GATES
my-pod-56f47f6f66-qlwls   1/1     Running   0          44d   172.30.102.43   10.177.7.202   <none>           <none>
```

### 3.2 查看调度失败原因

```bash
$ kubectldescribe pod [podname]
```
![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/09-pod-event.png)

### 3.3 常见调度失败错误列表

| 错误列表 |
| --- |
| NoDiskConflict |
| NoVolumeZoneConflict |
| MatchNodeSelector |
| MatchInterPodAffinity |
| PodAffinityRulesNotMatch |
| PodAntiAffinityRulesNotMatch |
| ExistingPodsAntiAffinityRulesNotMatch |
| PodToleratesNodeTaints |
| HostName |
| PodFitsHostPorts |
| CheckNodeLabelPresence |
| CheckServiceAffinity |
| MaxVolumeCount |
| NodeUnderMemoryPressure |
| NodeUnderDiskPressure |
| NodeOutOfDisk |
| NodeNotReady |
| NodeNetworkUnavailable |
| NodeUnschedulable |
| NodeUnknownCondition |
| VolumeNodeAffinityConflict |
| VolumeBindingNoMatch |


## 4. kubernetes中工作负载资源

Kubernetes Pods 有确定的生命周期, 为了让kubernetes使用者更好的运维kubernetes，我们并不需要直接管理每个 Pod。kubernetes使用`Workload Resources(负载资源)`来替我们管理一组 Pods。 使用这些资源配置控制器来确保合适类型的、处于运行状态的 Pod 个数是正确的，与我们所指定的状态是一致的。

### 4.1 Replication Controller & ReplicaSet

+ ReplicationController：确保在任何时候都有特定数量的 Pod 副本处于运行状态。 换句话说，ReplicationController 确保一个 Pod 或一组同类的 Pod 总是可用的。

```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    app: nginx
  template:
    metadata:
      name: nginx
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
```

+ ReplicaSet ：ReplicaSet 是下一代 ReplicationController， 目的是维护一组在任何时候都处于运行状态的 Pod 副本的稳定集合。 因此，它通常用来保证给定数量的、完全相同的 Pod 的可用性。目前ReplicaSet的主要用途是提供给 Deployment 作为编排 Pod 创建、删除和更新的一种机制, 不建议直接使用。

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: frontend
  labels:
    app: guestbook
    tier: frontend
spec:
  # 实际情况修改副本数
  replicas: 3
  selector:
    matchLabels:
      tier: frontend
    matchExpressions:
      - {key: tier, operator: In, values: [frontend]}  // NotIn, Exists, DoesNotExist
  template:
    metadata:
      labels:
        tier: frontend
    spec:
      containers:
      - name: php-redis
        image: gcr.io/google_samples/gb-frontend:v3
```

+ Replication Controller 和 ReplicaSet的区别
    + 两者在功能上几乎完全相同
    + Replication Controller 仅支持等式的选择器。Replica Set支持新的基于集合的标签选择算符。

+ 两者相同的作用
    + 确保pod数量
    + 确保pod健康
    + 重新调度    
    + 弹性伸缩
    + 滚动升级: 需要两个RC/RS（不同label selector）来配合实现：旧的RC/RS副本数-1，新的RC/RS副本数+1，逐步完成。

### 4.2 Deployment

#### 4.2.1 有状态(stateful) vs 无状态(stateless)

+ 有状态：有数据持久化功能
+ 无状态：无数据持久化功能

![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/10-deployment-state.png)

#### 4.2.2 介绍

+ Deployment是kubernetes中管理无状态pod的一种控制器
+ 开发人员负责描述 Deployment 中的 目标状态，而 Deployment 控制器（Controller） 以受控速率更改实际状态， 使其变为期望状态。
    + 创建 Deployment 以将 ReplicaSet 上线。 ReplicaSet 在后台创建 Pods。 Deployment 检查 ReplicaSet 的上线状态，查看其是否成功。
    + 通过更新 Deployment 的 PodTemplateSpec，声明 Pod 的新状态 。 新的 ReplicaSet 会被创建，Deployment 以受控速率将 Pod 从旧 ReplicaSet 迁移到新 ReplicaSet。 每个新的 ReplicaSet 都会更新 Deployment 的修订版本。

![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/11-deployment-scheduler.png)

#### 4.2.3 查看deployment

```
$ kubectl get deployment nginx-deployment
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment   3/3     3            3           18s
```

```yaml
$ kubectl get deployment nginx-deployment -o yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3           // 副本数量
  selector:             // Pod选择器，定义Deployment如何找到被自己管理的pod
    matchLabels:
      app: nginx
  template:             // pod template
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

> + 网易镜像: http://hub-mirror.c.163.com
> + 中国科技大学镜像: https://docker.mirrors.ustc.edu.cn

#### 4.2.4 创建deployment

```
# 命令式
$ kubectl create deployment nginx-deployment --image=nginx
# 文本式
$ kubectl apply -f deployment.yaml
```

#### 4.2.5 更新deployment

```bash
# 命令式
$ kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.16.1 --record
# 文本式
$ kubectl apply -f deployment.yaml
```
#### 4.2.6 Rolling Update(滚动更新) Deployment

Deployment 会在`.spec.strategy.type==RollingUpdate`时，采取`RollingUpdate(滚动更新)`的方式更新 Pods。可以通过指定`maxUnavailable`和`maxSurge`来控制`滚动更新`过程。

+ maxUnavailable(最大不可用)
`.spec.strategy.rollingUpdate.maxUnavailable`是一个可选字段，用来指定 更新过程中不可用的 Pod 的个数上限。该值可以是绝对数字（例如，5），也可以是所需 Pods 的百分比（例如，10%）。百分比值会转换成绝对数并去除小数部分。 如果 .spec.strategy.rollingUpdate.maxSurge 为 0，则此值不能为 0。 默认值为 25%。
+ maxSurge(最大峰值)
`.spec.strategy.rollingUpdate.maxSurge`是一个可选字段，用来指定可以创建的超出期望 Pod 个数的 Pod 数量。此值可以是绝对数（例如，5）或所需 Pods 的百分比（例如，10%）。 如果 MaxUnavailable 为 0，则此值不能为 0。百分比值会通过向上取整转换为绝对数。 此字段的默认值为 25%。

```
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 3
```

#### 4.2.7 Deployment回滚

```bash
# 查看deployment的所有历史部署
# 通过在命令中添加--record=true来记录CHANGE-CAUSE
$ kubectl rollout history deployment nginx-deployment
deployment.apps/nginx-deployment 
REVISION  CHANGE-CAUSE
1         <none>
2         kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.16.1 --record=true
# 回滚到某个特定的历史版本
$ kubectl rollout undo deployment nginx-deployment --to-revision=1
deployment.apps/nginx-deployment rolled back
```

#### 4.2.8 Deployment重启

```
$ kubectl rollout restart deployment /nginx-deployment
```

#### 4.2.9 弹性伸缩

```bash
# 弹性扩缩容
$ kubectl scale deployment nginx-deployment --replicas=10
# 自动扩缩容, 最少10个pod，最多5个pod，当cpu超过80%会额外创建新的pod，当cpu低于80%会依次销毁额外的pod
$ kubectl autoscale deployment nginx-deployment --min=10 --max=15 --cpu-percent=80
$ kubectl get hpa
NAME               REFERENCE                     TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
nginx-deployment   Deployment/nginx-deployment   <unknown>/80%   10        15        0          4s
```

### 4.3 Statefulset

#### 4.3.1 介绍

+ StatefulSet是用来管理有状态应用的工作负载 API 对象。在statefulset中是要求Pod是有序的。
+ 和`Deployment`不同的是，StatefulSet为它的每个Pod维护了一个有粘性的ID。这些 Pod 是基于相同的规约来创建的， 但是不能相互替换：无论怎么调度，每个Pod都有一个永久不变的ID。也就是说pod名称是作为pod识别的唯一标识符，必须保证其标识符的稳定并且唯一，当Pod挂了，重建之后的标识符也是不变的，每一个Pod的Pod名称是不能改变的
+ StatefulSet当前需要Headless Service来负责 Pod 的网络标识。
+ StatefulSet创建过程是有序的，可以通过`.spec.podManagementPolicy`设置pod的管理策略
    + OrderedReady:默认方式，按照pod的次序依次创建每个pod并等待ready之后才创建后面的pod。
    + Parallel：并行创建或删除pod，和deployment类型的pod一样。（不等待前面的pod ready就开始创建所有的pod）。
+ 依赖于PersistentVolume, 当在创建statefulset时指定PVC Template，则创建的PVC也是带有粘性ID的。为了保证数据安全，删除statefulset时不会删除pvc
![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/12-statefulset-pods.png)

![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/13-statefulset-controller.png)

#### 4.3.2 Demo

```yaml
$ kubectl get service nginx-statefulset -o yaml
$ kubectl get statefulset nginx-statefulset -o yaml
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-statefulset
  labels:
    app: nginx-statefulset
spec:
  ports:
  - port: 80
    name: web
  clusterIP: None
  selector:
    app: nginx-statefulset

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: nginx-statefulset
spec:
  selector:
    matchLabels:
      app: nginx-statefulset # 必须匹配 .spec.template.metadata.labels
  serviceName: "nginx-statefulset"
  replicas: 3 # 默认值是 1
  minReadySeconds: 10 # 默认值是 0
  template:
    metadata:
      labels:
        app: nginx-statefulset # 必须匹配 .spec.selector.matchLabels
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: nginx-statefulset
        image: nginx
        ports:
        - containerPort: 80
          name: web
```

#### 4.3.3 如何访问对应的pod内容

+ kubernetes DNS会为关联的service分配一个域

```text
$<$service_name>.$<namespace_name>.svc.cluster.local
```
+ StatefulSet会为关联的Pod保持一个不变的Pod Name
statefulset中Pod的hostname格式为`$(StatefulSet name)-$(pod序号)`

+ kubernetes DNS会为每个Healess Service关联的StatefulSet的Pod分配一个dnsName

```text
$<Pod Name>.$<service name>.$<namespace name>.svc.cluster.local
```

### 4.4 DaemonSet

释义:
+ DaemonSet确保集群中每个（部分）node节点上运行一个Pod的副本。 
+ 当有节点加入集群时，也会为他们新增一个Pod。
+ 当有节点从集群移除时，这些Pod也会被回收。删除DaemonSet将会删除它创建的所有 Pod。
+ 当然daemonset可以被systemd等类似的宿主机守护进程管理工具取代(自建kubernetes集群的情况下)

![image.png](/images/blog/kubernetes/06-kubernetes-scheduler/14-daemonset.png)

Daemonset的典型使用场景：
+ 运行集群存储守护进程，如glusterd、ceph。
+ 运行集群日志收集守护进程，如fluentd、logstash。
+ 运行集群网络守护进程，如VPN相关
+ 运行节点监控守护进程，如Prometheus Node Exporter, collectd, Datadog agent, New Relic agent, or Ganglia gmond。

```yaml
$ kubectl get daemonset fluentd-elasticsearch -n kube-system -o yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd-elasticsearch
  namespace: kube-system
  labels:
    k8s-app: fluentd-logging
spec:
  selector:
    matchLabels:
      name: fluentd-elasticsearch
  template:
    metadata:
      labels:
        name: fluentd-elasticsearch
    spec:
      tolerations:
      # 这些容忍度设置是为了让该守护进程集在控制平面节点上运行
      # 如果你不希望自己的控制平面节点运行 Pod，可以删除它们
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule
      - key: node-role.kubernetes.io/master
        operator: Exists
        effect: NoSchedule
      containers:
      - name: fluentd-elasticsearch
        image: quay.io/fluentd_elasticsearch/fluentd:v2.5.2
        resources:
          limits:
            memory: 200Mi
          requests:
            cpu: 100m
            memory: 200Mi
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      terminationGracePeriodSeconds: 30
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

### 4.5 Job & CronJob

+ Job: `Job`会创建一个或者多个 Pods，并将继续重试 Pods 的执行，直到指定数量的 Pods 成功终止。 随着 Pods 成功结束，Job 跟踪记录成功完成的 Pods 个数。 当数量达到指定的成功个数阈值时，任务（即 Job）结束。 删除 Job 的操作会清除所创建的全部 Pods。 挂起 Job 的操作会删除 Job 的所有活跃 Pod，直到 Job 被再次恢复执行。
+ CronJob: 创建基于时间间隔重复调度的Jobs。

#### 4.5.1 Job

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  template:
    spec:
      containers:
      - name: pi
        image: perl:5.34
        command: ["perl",  "-Mbignum=bpi", "-wle", "print bpi(2000)"]
      restartPolicy: Never
  backoffLimit: 4
```

##### 4.5.1.1 Job运行的三种主要任务

+ Non-parallel Jobs
    + 通常只启动一个 Pod，除非该 Pod 失败。
    + 当 Pod 成功终止时，立即视 Job 为完成状态。
+ Parallel Jobs with a fixed completion count:
    + `.spec.completions`字段设置为非 0 的正数值。
    + Job 用来代表整个任务，当成功的 Pod 个数达到`.spec.completions`时，Job 被视为完成。
    + 当使用`.spec.completionMode="Indexed"`时，每个 Pod 都会获得一个不同的 索引值，介于 0 和`.spec.completions-1`之间。
+ Parallel Jobs with a work queue
    + 不设置`spec.completions`，默认值为`.spec.parallelism`。
    + 多个 Pod 之间必须相互协调，或者借助外部服务确定每个 Pod 要处理哪个工作条目。 例如，任一 Pod 都可以从工作队列中取走最多 N 个工作条目。
    + 每个 Pod 都可以独立确定是否其它 Pod 都已完成，进而确定 Job 是否完成。
    + 当 Job 中 任何 Pod 成功终止，不再创建新 Pod。
    + 一旦至少 1 个 Pod 成功完成，并且所有 Pod 都已终止，即可宣告 Job 成功完成。
    + 一旦任何 Pod 成功退出，任何其它 Pod 都不应再对此任务执行任何操作或生成任何输出。 所有 Pod 都应启动退出过程。

> 对于`Non-parallel`的 Job，可以不设置`spec.completions`和`spec.parallelism`。 这两个属性都不设置时，均取默认值`1`。

> 对于`Parallel Jobs with a fixed completion count`类型的 Job，应该设置`.spec.completions`为所需要的完成个数。 可以设置`.spec.parallelism`，也可以不设置。其默认值为`1`。

> 对于一个`Parallel Jobs with a work queue`Job，不可以设置`.spec.completions`，但要将`.spec.parallelism`设置为一个非负整数。

##### 4.5.1.2 处理 Pod 和容器失效 

通过`.spec.template.spec.restartPolicy = "OnFailure"`来控制，其值可以为`Always`, `OnFailure`和 `Never`

+ `Always`: 默认值，指任何非正常退出Pod的操作都会重启Pod，包括报错，手动kill pod等等
+ `OnFailure`：只在容器异常时才自动重启容器
+ `Never`: 从来不重启容器

##### 4.5.1.3 Job 终止与清理

+ Job 完成时不会再创建新的 Pod，不过已有的 Pod 通常也不会被删除。 保留这些 Pod 使得你可以查看已完成的 Pod 的日志输出，以便检查错误、警告 或者其它诊断性输出。
+ 当使用 kubectl 来删除 Job 时，该 Job 所创建的 Pods 也会被删除。
+ Job 可以被 CronJob 基于特定的根据容量裁定的清理策略清理掉。
+ 可以设置`.spec.ttlSecondsAfterFinished: 100`来通过TTL Controller自动清理完成时间超过上述设定的pod

#### 4.5.2 CronJob

+ CronJob 根据其计划编排，在每次该执行任务的时候大约会创建一个 Job。大约的意思是可能会创建两个(concurrencyPolicy=allow)，或者一个也不创建(调度失败100次)。
+ 如果 startingDeadlineSeconds 设置为很大的数值或未设置（默认），并且 concurrencyPolicy 设置为 Allow，则作业将始终至少运行一次。
+ 对于每个 CronJob，CronJob 控制器（Controller） 检查从上一次调度的时间点到现在所错过了调度次数。如果错过的调度次数超过 100 次， 那么它就不会启动这个任务，并记录这个错误

```text
Cannot determine if job needs to be started. Too many missed start time (> 100). Set or decrease .spec.startingDeadlineSeconds or check clock skew.
```

+ 如果 startingDeadlineSeconds 字段非空，则控制器会统计从 startingDeadlineSeconds 设置的值到现在而不是从上一个计划时间到现在错过了多少次 Job

> startingDeadlineSeconds 表示开始的最后期限。它表示任务如果由于某种原因错过了调度时间，开始该任务的截止时间的秒数。

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello
spec:
  schedule: "* * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: hello
            image: busybox:1.28
            imagePullPolicy: IfNotPresent
            command:
            - /bin/sh
            - -c
            - date; echo Hello from the Kubernetes cluster
          restartPolicy: OnFailure
```

##### 4.5.2.1 cron时间表语法

```yaml
# ┌───────────── 分钟 (0 - 59)
# │ ┌───────────── 小时 (0 - 23)
# │ │ ┌───────────── 月的某天 (1 - 31)
# │ │ │ ┌───────────── 月份 (1 - 12)
# │ │ │ │ ┌───────────── 周的某天 (0 - 6)（周日到周一；在某些系统上，7 也是星期日）
# │ │ │ │ │                          或者是 sun，mon，tue，web，thu，fri，sat
# │ │ │ │ │
# │ │ │ │ │
# * * * * *
```

##### 4.5.2.2 时区
+ 对于没有指定时区的 CronJob，kube-controller-manager 会根据其本地时区来解释其排期表（schedule）。
+ 对于`Kubernetes v1.24`及以上的版本，可以将`spec.timeZone`设置为有效的时区名称来进行通过时区的任务排期。

