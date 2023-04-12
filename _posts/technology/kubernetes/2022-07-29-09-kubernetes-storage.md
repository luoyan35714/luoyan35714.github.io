---
layout: post
title:  Kubernetes - 09 - 存储管理
date:   2022-07-29 09:00:00 +0800
categories: 技术文档
tag: Kubernetes
---

* content
{:toc}


## 1. 存储卷介绍

容器部署过程中一般有以下三种数据：
+ 启动时需要的初始数据，可以是配置文件
+ 启动过程中产生的临时数据，该临时数据需要多个容器间共享
+ 运行过程中产生的持久化数据

以上三种数据都不希望在容器重启时就消失，存储卷由此而来，它可以根据不同场景提供不同类型的存储能力。

![image.png](/images/blog/kubernetes/09-kubernetes-storage/01-storage.png)

## 2. 容器启动时依赖数据(Configmap & Secret)

### 2.1 Configmap

+ ConfigMap是Kubernetes用来向应用Pod中注入配置数据的方法: 很多应用在其初始化或运行期间要依赖一些配置信息。大多数时候， 存在要调整配置参数所设置的数值的需求。
+ ConfigMap允许将配置文件与镜像文件分离，以使容器化的应用程序具有可移植性

+ 声明

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: test-configmap
  namespace: default
data:
  test_configuration.properties: |
    name=hello
    location=china
  test_env: helloworld
```

+ pod的env中使用

```yaml
apiVersion: v1  
kind: Pod
metadata:
  name: test-configmap-pod
  namespace: default
spec:
  restartPolicy: Never
  containers:
    - name: test-container
      image: k8s.gcr.io/busybox
      command: [ "/bin/sh", "-c", "env" ]
      env:
        - name: TEST_ENV
          valueFrom:
            configMapKeyRef:
              name: test-configmap
              key: test_env
```

+ pod的volume中使用

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-configmap-volume-pod
  namespace: default
spec:
  restartPolicy: Never
  containers:
    - name: test-container
      image: k8s.gcr.io/busybox
      command: [ "/bin/sh","-c","cat /etc/config/customize/configuration.properties" ]
      volumeMounts:
      - name: config-volume
        mountPath: /etc/config/customize
  volumes:
    - name: config-volume
      configMap:
        name: test-configmap
        items:
        - key: test_configuration.properties
          path: configuration.properties
```

### 2.2 Secret

#### 2.2.1 介绍

+ Secret 类似于 ConfigMap 但专门用于保存机密数据
+ Secret 是一种包含少量敏感信息例如密码、令牌或密钥的对象,这些信息会被pod使用。使用Secret意味着不需要在应用程序代码中包含机密数据。
+ Secret将配置文件与镜像相分离

#### 2.2.2 Secret使用的三种方式

+ 作为挂载到一个或多个容器上的卷中的文件。(同configmap)
+ 作为容器的环境变量。(同configmap)
+ 由 kubelet 在为 Pod 拉取镜像时使用。

+ 声明

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
  namespace: default
type: Opaque
data:
  username: YWRtaW4=
  password: aGVsbG93b3JsZA==
```

secret的内容都是base64加密的

```bash
$ echo -n helloworld | base64
aGVsbG93b3JsZA==
$ echo aGVsbG93b3JsZA== | base64 -D
helloworld
```

+ pod的env中使用

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-secret-pod
  namespace: default
spec:
  containers:
    - name: test-container
      image: busybox
      command: [ "/bin/sh", "-c", "env" ]
      envFrom:
      - secretRef:
          name: test-secret
  restartPolicy: Never
```

+ pod的volume中使用

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-secret-volume-pod
  labels:
    name: test-secret-volume
spec:
  volumes:
  - name: secret-volume
    secret:
      secretName: test-secret-volume
  containers:
  - name: ssh-test-container
    image: busybox
    command: [ "/bin/sh", "-c", "ls -la /etc/secret-volume" ]
    volumeMounts:
    - name: secret-volume
      readOnly: true
      mountPath: "/etc/secret-volume"
```

+ kubelet为pod拉取镜像image

```
apiVersion: v1
kind: Pod
metadata:
  name: private-registry-pod
spec:
  containers:
  - name: private-registry-container
    image: <your-private-image>
  imagePullSecrets:
  - name: docker_auth_credentials
```

#### 2.2.3 Secret的类型

| 内置类型 | 用法 |
| -------- | ---- |
| Opaque | 用户定义的任意数据 |
| kubernetes.io/service-account-token | 服务账号令牌 |
| kubernetes.io/dockercfg | ~/.dockercfg 文件的序列化形式 |
| kubernetes.io/dockerconfigjson | ~/.docker/config.json 文件的序列化形式 |
| kubernetes.io/basic-auth | 用于基本身份认证的凭据 |
| kubernetes.io/ssh-auth | 用于 SSH 身份认证的凭据 |
| kubernetes.io/tls | 用于 TLS 客户端或者服务器端的数据 |
| bootstrap.kubernetes.io/token | 启动引导令牌数据 |

+ `Opaque Secret`: 当Secret配置文件中未作显式设定时，默认的 Secret 类型是 Opaque

+ `kubernetes.io/service-account-token`: 需要先创建`ServiceAccount`对象，创建的时候需要指定`annotations:kubernetes.io/service-account.name`, 当secret创建出来之后,会自动添加`data`字段的`token`键值和`kubernetes.io/service-account.uid`注解

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: secret-sa-sample
  annotations:
    kubernetes.io/service-account.name: "test-sa"
type: kubernetes.io/service-account-token
data:
  # 可以像 Opaque Secret 一样在这里添加额外的键/值偶对
  extra: YmFyCg==
```

+ `kubernetes.io/dockercfg`和`kubernetes.io/dockerconfigjson`作用是一致的,用来存放用于访问容器镜像仓库的凭证

```bash
# 两种创建方式
# 命令式
$ kubectl create secret docker-registry docker-auth-credential \
  --docker-email=test@test.com \
  --docker-username=admin \
  --docker-password=12345 \
  --docker-server=my-registry.example:5000
# 声明式
$ kubectl apply -f docker-auth-credential.yaml
apiVersion: v1
kind: Secret
metadata:
  name: secret-dockercfg
type: kubernetes.io/dockercfg
data:
  .dockercfg: |
        "<base64 encoded ~/.dockercfg file>"
```

+ `kubernetes.io/basic-auth`: 用来存放用于基本身份认证所需的凭据信息。 使用这种 Secret 类型时，Secret 的 data 字段必须包含以下两个键之一：`username`(身份认证的用户名)和`password`(身份认证的密码或者令牌)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: secret-basic-auth
type: kubernetes.io/basic-auth
stringData:
  username: admin      # kubernetes.io/basic-auth 类型的必需字段
  password: t0p-Secret # kubernetes.io/basic-auth 类型的必需字段
```

+ `kubernetes.io/ssh-auth`: 用来存放SSH身份认证中所需要的凭据, data中必须提供一个键值为`ssh-privatekey`的键值对

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: secret-ssh-auth
type: kubernetes.io/ssh-auth
data:
  # 此例中的实际数据被截断
  ssh-privatekey: |
          MIIEpQIBAAKCAQEAulqb/Y ...
```

+ `kubernetes.io/tls`: 用来存放`TLS`场合通常要使用的证书及其相关密钥,要求必须在data中提供键值为`tls.key`和`tls.crt`的键值对，使用场景比如Ingress对外暴露SSL

```yaml
kind: Secret
metadata:
  name: secret-tls
type: kubernetes.io/tls
data:
  # 此例中的数据被截断
  tls.crt: |
        MIIC2DCCAcCgAwIBAgIBATANBgkqh ...
  tls.key: |
        MIIEpgIBAAKCAQEA7yn3bRHQ5FHMQ ...
```

+ `bootstrap.kubernetes.io/token`: 可以创建`启动引导令牌类型的Secret`。这种类型的 Secret 被设计用来支持节点的启动引导过程。启动引导令牌 Secret 通常创建于 kube-system 名字空间内，并以 bootstrap-token-<令牌 ID> 的形式命名；其中 <令牌 ID> 是一个由 6 个字符组成 的字符串，用作令牌的标识。

```bash
$ kubectl get secret -n kube-system
NAME                     TYPE                            DATA   AGE
bootstrap-token-abcdef   bootstrap.kubernetes.io/token   6      21h
$ kubectl get secret -n kube-system bootstrap-token-abcdef -o yaml
apiVersion: v1
kind: Secret
type: bootstrap.kubernetes.io/token
metadata:
  name: bootstrap-token-abcdef
  namespace: kube-system
data:
  auth-extra-groups: c3lzdGVtOmJvb3RzdHJhcHBlcnM6a3ViZWFkbTpkZWZhdWx0LW5vZGUtdG9rZW4=
  expiration: MjAyMi0wNy0wM1QxMDozNDowOVo=
  token-id: YWJjZGVm
  token-secret: MDEyMzQ1Njc4OWFiY2RlZg==
  usage-bootstrap-authentication: dHJ1ZQ==
  usage-bootstrap-signing: dHJ1ZQ==
```

## 3. 临时数据存储(emptyDir和hostPath)

### 3.1 emptyDir

+ 使用emptyDir，当Pod分配到Node上时，将会创建emptyDir，并且只要Node上的Pod一直运行，Volume就会一直存。当Pod（不管任何原因）从Node上被删除时，emptyDir也同时会删除，存储的数据也将永久删除。
+ 常用于作为临时目录、或缓存使用。
+ emptyDir的好处是，可以在pod内的多个container之间共享存储

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-emptydir-demo
  namespace: default
  labels:
    app: myapp
    tier: frontend
spec:
  volumes:
  - name: html
    emptyDir: {}
  containers:
  - name: myapp
    image: nginx
    imagePullPolicy: IfNotPresent
    ports:
    - name: http
      containerPort: 80
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html/
  - name: busybox
    image: busybox:latest
    imagePullPolicy: IfNotPresent
    volumeMounts:
    - name: html
      mountPath: /data/
    command:
    - "/bin/sh"
    - "-c"
    - "while true; do echo $(date) >> /data/index.html; sleep 2; done"
```

### 3.2 hostPath

#### 3.2.1 介绍

hostPath允许挂载Node（宿主机）上的文件系统到Pod里面去。如果Pod需要使用Node上的文件，可以使用hostPath。

#### 3.2.2 demo

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: vol-hostpath
  namespace: default
spec:
  volumes:
  - name: html
    hostPath:
      path: /data/pod/volume_test/
      type: DirectoryOrCreate
  containers:
  - name: myapp
    image: ikubernetes/myapp:v1
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html/
```

#### 3.2.3 hostPath类型

| 值 | 行为 |
| -- | ---- |
| 空 | 空字符串（默认）用于向后兼容，这意味着在安装hostPath卷之前不会执行任何检查。 |
| DirectoryOrCreate | 如果给定路径中不存在任何内容，则将根据需要创建一个空目录，权限设置为0755，与Kubelet具有相同的组和所有权。 |
| Directory | 目录必须存在于给定路径中 |
| FileOrCreate | 如果给定路径中不存在任何内容，则会根据需要创建一个空文件，权限设置为0644，与Kubelet具有相同的组和所有权。 |
| File | 文件必须存在于给定路径中 |
| Socket | UNIX套接字必须存在于给定路径中 |
| CharDevice | 字符设备必须存在于给定路径中 |
| BlockDevice | 块设备必须存在于给定路径中 |

## 4. 外部持久化存储 - NFS

### 4.1 NFS介绍

+ NFS - Network File System，是一种基于TCP/IP 传输的网络文件系统协议
+ NFS服务多用于局域网内

### 4.2 在centos中安装NFS

```bash
# 查看是否存在nfs和rpcbind
$ rpm -qa | grep nfs
$ rpm -qa | grep rpcbind

# 安装nfs和rpcbind
$ yum -y install nfs-utils rpcbind

# 创建共享目录
$ mkdir -p /nfs/exports

# 配置nfs
$ vi /etc/exports
/nfs/exports *(insecure,rw,sync,no_root_squash,no_all_squash)
$ cd /etc/init.d
$ exportfs -r

# 启动服务
$ systemctl start rpcbind
$ systemctl start nfs
$ systemctl status rpcbind
$ systemctl status nfs

# 关闭防火墙
$ systemctl stop firewalld

# 查看NFS状态
$ showmount -e
Export list for nfs-server:
/nfs/exports *
```

### 4.3 pod中的NFS使用

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-nfs
  namespace: default
spec:
  restartPolicy: Never
  containers:
  - name: test-container
    image: busybox
    command: [ "/bin/sh", "-c", "mkdir -p /nfs/nfs-protocol && echo helloworld > /nfs/nfs-protocol/helloworld.txt" ]
    volumeMounts:
    - name: nfs
      mountPath: /nfs
  volumes:
  - name: nfs
    nfs:
      path: /nfs/exports
      server: 172.16.140.161
```

### 4.4 持久化存储卷（Persistent Volume）- 以PV和PVC的方式使用NFS

持久化存储卷的创建方式有两种: 静态模式和动态模式
![image.png](https://note.youdao.com/yws/res/18117/WEBRESOURCE83daf5e3ef90575e893eeba3f8b842a5)

#### 4.4.1 PersistentVolume(PV)

+ PersistentVolume（PV，持久卷）是集群中的一块存储，可以由管理员事先供应，或者 使用存储类（StorageClass）来动态供应。 
+ 持久卷是集群资源，就像节点也是集群资源一样。所以PV是不受namespace的限制的
+ PV 持久卷和普通的 Volume 一样，也是使用 卷插件来实现的，只是它们拥有独立于任何使用 PV 的 Pod 的生命周期。
+ 提供了存储能力、访问模式、存储类型、回收策略、后端存储类型等关键信息的设置。

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv0003
spec:
  capacity:
    storage: 5Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Recycle
  storageClassName: slow
  mountOptions:
    - hard
    - nfsvers=4.1
  nfs:
    path: /tmp
    server: 172.17.0.2
```

+ 存储卷模式（Volume Mode）: Kubernetes支持两种卷模式（volumeModes）：Filesystem（文件系统） 和 Block（块）。 volumeMode 是一个可选的 API 参数。 如果该参数被省略，默认的卷模式是 Filesystem。

+ 回收策略（Reclaim Policy）:
    + Retain 保留：保留数据，需要手工处理。
    + Recycle 回收空间：简单清除文件的操作（例如执行rm -rf /thevolume/* 命令）。
    + Delete 删除：与PV相连的后端存储完成Volume的删除操作，诸如 AWS EBS、GCE PD、Azure Disk 或 OpenStack Cinder 卷这类关联存储资产也被删除
    > 目前，仅 NFS 和 HostPath 支持回收（Recycle）。 AWS EBS、GCE PD、Azure Disk 和 Cinder 卷都支持删除（Delete）。
+ 访问模式（Access Modes）
    + ReadWriteOnce（RWO）：读写权限，并且只能被单个Node挂载。允许运行在同一节点上的多个Pod访问卷。
    + ReadOnlyMany（ROX）：只读权限，允许被多个Node挂载。
    + ReadWriteMany（RWX）：读写权限，允许被多个Node挂载。
    + ReadWriteOncePod（RWOP）：读写权限，只允许被单个Pod以读写方式挂载。

#### 4.4.2 PersistentVolumeClaim(PVC)

+ PersistentVolumeClaim(PVC，持久卷申领）表达的是用户对存储的请求。
+ 概念上与 Pod 类似。 Pod 会耗用节点资源，而 PVC 申领会耗用 PV 资源。Pod 可以请求特定数量的资源（CPU 和内存）；同样 PVC 申领也可以请求特定的大小和访问模式 （例如，可以要求 PV 卷能够以 ReadWriteOnce、ReadOnlyMany 或 ReadWriteMany 模式之一来挂载）。
+ 主要包括存储空间请求、访问模式、PV选择条件和存储类别等信息的设置。

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: myclaim
spec:
  accessModes:
    - ReadWriteOnce
  volumeMode: Filesystem
  resources:
    requests:
      storage: 8Gi
  storageClassName: slow
  selector:
    matchLabels:
      release: "stable"
    matchExpressions:
      - {key: environment, operator: In, values: [dev]}
```

+ accessModes, volumeMode同PV相同
+ resources: 所请求的资源配置
+ storageClassName: 如果StorageClass存在，且PV不存在，则尝试使用对应的provisioner自动创建PV；如果要申请对应已存在PV的资源，则storageClassName必须与PV相同。如果storageClassName不指定即为空，则要求使用没有设置存储类的PV。
+ selector: 选择对应的PV使用

#### 4.4.3 StorageClass(存储类)

+ StorageClass作用是根据pvc的定义来动态创建pv，不仅节省了我们管理员的时间，还可以封装不同类型的存储供pvc选用。
+ 每个 StorageClass 都包含 `provisioner`、`parameters` 和 `reclaimPolicy` 字段， 这些字段会在 StorageClass 需要动态分配 PersistentVolume 时会使用到。
    + provisioner: 存储制备器，用来指定提供存储的平台
    + reclaimPolicy: 回收策略    
    + parameters: 取决于制备器(provisioner)，可以接受不同的参数。

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
reclaimPolicy: Retain
allowVolumeExpansion: true
mountOptions:
  - debug
volumeBindingMode: Immediate
```

#### 4.4.4 使用PV & PVC存储到NFS

```yaml
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nfs-pv-001
spec:
  capacity:
    storage: 100Mi
  accessModes:
    - ReadWriteMany
  nfs:
    server: 172.16.140.161
    path: "/nfs/exports"
  mountOptions:
    - nfsvers=4.2

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nfs-pvc-001
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: ""
  resources:
    requests:
      storage: 100Mi
  volumeName: nfs-pv-001

---
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-nfs-pv-pvc
  namespace: default
spec:
  restartPolicy: Never
  containers:
  - name: test-container
    image: busybox
    command: [ "/bin/sh", "-c", "mkdir -p /nfs/pv-pvc && echo pv-pvc > /nfs/pv-pvc/pv-pvc.txt" ]
    volumeMounts:
    - name: nfs
      mountPath: /nfs
  volumes:
  - name: nfs
    persistentVolumeClaim:
      claimName: nfs-pvc-001
```